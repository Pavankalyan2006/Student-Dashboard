import { PlatformEvent, PlatformEventType, EventHandler } from './eventTypes';
import { db } from '../db/database';
import { logger } from '../core/logging';

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<PlatformEventType, Set<EventHandler>> = new Map();
  private wildcardSubscribers: Set<EventHandler> = new Set();
  private recentEvents: PlatformEvent[] = [];
  private readonly maxRecentEvents = 200;

  private constructor() {
    this.registerSystemEventHandlers();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to a specific platform event type.
   * Returns an unsubscribe function.
   */
  public subscribe<T = any>(eventType: PlatformEventType, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler as EventHandler);
    return () => {
      this.subscribers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to all platform events.
   * Returns an unsubscribe function.
   */
  public subscribeAll(handler: EventHandler): () => void {
    this.wildcardSubscribers.add(handler);
    return () => {
      this.wildcardSubscribers.delete(handler);
    };
  }

  /**
   * Publish an event to all subscribers and append to recent events.
   */
  public async publish<T = any>(
    eventType: PlatformEventType,
    payload: T,
    options: {
      student_id?: string;
      resource_type?: string;
      resource_id?: string;
      source?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<PlatformEvent<T>> {
    const event: PlatformEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: eventType,
      student_id: options.student_id,
      resource_type: options.resource_type,
      resource_id: options.resource_id,
      payload,
      source: options.source || 'system',
      timestamp: new Date().toISOString(),
      metadata: options.metadata,
    };

    // Store in circular buffer
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.pop();
    }

    logger.info(`[EventBus] Dispatched ${event.type} for student=${event.student_id || 'system'} id=${event.id}`);

    // Notify type-specific subscribers
    const handlers = this.subscribers.get(eventType);
    const promises: Promise<void>[] = [];

    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          const res = handler(event);
          if (res instanceof Promise) {
            promises.push(
              res.catch((err) => {
                logger.error(`[EventBus] Error in handler for ${eventType}:`, err);
              })
            );
          }
        } catch (err) {
          logger.error(`[EventBus] Sync error in handler for ${eventType}:`, err);
        }
      });
    }

    // Notify wildcard subscribers
    this.wildcardSubscribers.forEach((handler) => {
      try {
        const res = handler(event);
        if (res instanceof Promise) {
          promises.push(
            res.catch((err) => {
              logger.error(`[EventBus] Error in wildcard handler for ${eventType}:`, err);
            })
          );
        }
      } catch (err) {
        logger.error(`[EventBus] Sync error in wildcard handler for ${eventType}:`, err);
      }
    });

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    return event;
  }

  /**
   * Get recent events, optionally filtered by student_id.
   */
  public getRecentEvents(studentId?: string, limit = 50): PlatformEvent[] {
    if (!studentId) {
      return this.recentEvents.slice(0, limit);
    }
    return this.recentEvents
      .filter((e) => !e.student_id || e.student_id === studentId)
      .slice(0, limit);
  }

  /**
   * Registers automatic reactive cross-subsystem handlers.
   */
  private registerSystemEventHandlers() {
    // 1. When a Quiz is completed or result updated
    this.subscribe('QUIZ_RESULT_UPDATED', async (event) => {
      if (!event.student_id) return;
      try {
        const { score, total_questions, quiz_title, percentage } = event.payload || {};
        const isWeak = percentage !== undefined && percentage < 70;

        await db.createNotificationItem(event.student_id, {
          type: 'QUIZ_COMPLETED',
          title: `Quiz Result: ${quiz_title || 'Assessment'} Completed`,
          message: `You scored ${score ?? 0}/${total_questions ?? 0} (${percentage ?? 0}%). ${
            isWeak ? 'Added to spaced revision queue for concept mastery.' : 'Great job!'
          }`,
          link: `/quiz/${event.resource_id || ''}/result`,
          entity_type: 'QuizAttempt',
          entity_id: event.resource_id,
        });

        // Trigger unified progress update notification
        await this.publish('PROGRESS_UPDATED', {
          reason: 'QUIZ_COMPLETED',
          score,
          percentage,
        }, {
          student_id: event.student_id,
          source: 'QuizService',
        });
      } catch (err) {
        logger.error('[EventBus] Failed in QUIZ_RESULT_UPDATED handler:', err);
      }
    });

    // 2. When a Lesson is completed
    this.subscribe('LESSON_COMPLETED', async (event) => {
      if (!event.student_id) return;
      try {
        const { lesson_title, course_name, progress_percentage } = event.payload || {};
        await db.createNotificationItem(event.student_id, {
          type: 'COURSE_COMPLETED',
          title: `Lesson Completed: ${lesson_title || 'Topic'}`,
          message: `Progress in ${course_name || 'Course'} updated to ${progress_percentage ?? 100}%. Keep the momentum going!`,
          link: `/courses`,
          entity_type: 'Lesson',
          entity_id: event.resource_id,
        });

        await this.publish('PROGRESS_UPDATED', {
          reason: 'LESSON_COMPLETED',
          lesson_title,
        }, {
          student_id: event.student_id,
          source: 'CourseService',
        });
      } catch (err) {
        logger.error('[EventBus] Failed in LESSON_COMPLETED handler:', err);
      }
    });

    // 3. When a DSA Problem is solved
    this.subscribe('DSA_PROBLEM_COMPLETED', async (event) => {
      if (!event.student_id) return;
      try {
        const { problem_title, difficulty, points } = event.payload || {};
        await db.createNotificationItem(event.student_id, {
          type: 'COURSE_COMPLETED',
          title: `DSA Problem Solved: ${problem_title || 'Challenge'}`,
          message: `Solved ${difficulty || 'Standard'} difficulty challenge! Earned +${points || 20} skill points.`,
          link: `/dsa`,
          entity_type: 'DSAProblem',
          entity_id: event.resource_id,
        });

        await this.publish('PROGRESS_UPDATED', {
          reason: 'DSA_PROBLEM_COMPLETED',
          problem_title,
        }, {
          student_id: event.student_id,
          source: 'DsaService',
        });
      } catch (err) {
        logger.error('[EventBus] Failed in DSA_PROBLEM_COMPLETED handler:', err);
      }
    });

    // 4. When a Document is processed
    this.subscribe('DOCUMENT_PROCESSED', async (event) => {
      if (!event.student_id) return;
      try {
        const { document_title, chunk_count } = event.payload || {};
        await db.createNotificationItem(event.student_id, {
          type: 'SYSTEM',
          title: `Document Indexed: ${document_title || 'Material'}`,
          message: `Indexed ${chunk_count || 12} semantic chunks into Knowledge Base. Ready for AI Q&A and Flashcard generation.`,
          link: `/documents/${event.resource_id || ''}`,
          entity_type: 'Document',
          entity_id: event.resource_id,
        });
      } catch (err) {
        logger.error('[EventBus] Failed in DOCUMENT_PROCESSED handler:', err);
      }
    });

    // 5. When a Super Admin creates a student
    this.subscribe('STUDENT_CREATED', async (event) => {
      try {
        const { student_id, student_name, created_by } = event.payload || {};
        if (student_id) {
          await db.createNotificationItem(student_id, {
            type: 'SYSTEM',
            title: 'Welcome to B.Tech AI Learning Platform',
            message: `Your student workspace has been initialized by administrator (${created_by || 'Admin'}).`,
            link: '/dashboard',
          });
        }
      } catch (err) {
        logger.error('[EventBus] Failed in STUDENT_CREATED handler:', err);
      }
    });
  }
}

export const eventBus = EventBus.getInstance();
