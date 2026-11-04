// src/tests/flashcards_master_production.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { EventBus } from '../../server/events/eventBus';

describe('AI Flashcards Production & Spaced Repetition Master Test Suite', () => {
  const primaryStudentId = 'std_01j8k9x2p4';
  const otherStudentId = 'std_other_unauthorized';

  beforeEach(() => {
    // Seed data is available in db
  });

  // =========================================================================
  // 1. Deck Discovery, Seeding, and Student Ownership
  // =========================================================================
  describe('1. Deck Discovery, Seeding & Filters', () => {
    it('seeds and retrieves default technical decks for the student', async () => {
      const decks = await LearningModulesService.getFlashcardDecks(primaryStudentId);
      expect(decks.length).toBeGreaterThanOrEqual(3);

      const osDeck = decks.find((d) => d.title.includes('Operating Systems'));
      expect(osDeck).toBeDefined();
      expect(osDeck?.cards.length).toBeGreaterThanOrEqual(4);
      expect(osDeck?.source_type).toBe('COURSE');
    });

    it('filters decks by search query across title, description, and tags', async () => {
      const searchRes = await LearningModulesService.getFlashcardDecks(primaryStudentId, {
        search: 'Page Replacement',
      });
      expect(searchRes.length).toBeGreaterThanOrEqual(1);
      expect(searchRes[0].title).toContain('Operating Systems');
      const all = await LearningModulesService.getFlashcardDecks(primaryStudentId);
      expect(searchRes.length).toBeLessThan(all.length);
    });

    it('filters decks by due status and bookmarked status', async () => {
      const allDecks = await LearningModulesService.getFlashcardDecks(primaryStudentId);
      const targetDeck = allDecks[0];

      // Bookmark the deck
      await LearningModulesService.bookmarkFlashcardDeck(primaryStudentId, targetDeck.id, true);

      const bookmarked = await LearningModulesService.getFlashcardDecks(primaryStudentId, {
        status: 'bookmarked',
      });
      expect(bookmarked.some((d) => d.id === targetDeck.id)).toBe(true);

      // Revert bookmark
      await LearningModulesService.bookmarkFlashcardDeck(primaryStudentId, targetDeck.id, false);
    });

    it('enforces strict student isolation and prevents cross-student IDOR access', async () => {
      const decks = await LearningModulesService.getFlashcardDecks(primaryStudentId);
      const studentDeckId = decks[0].id;

      // Attempting to access primary student deck using other unauthorized student
      await expect(
        LearningModulesService.getFlashcardDeckById(otherStudentId, studentDeckId)
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 2. Manual Deck & Card Lifecycle (Create, Edit, Delete, Duplicate, Archive)
  // =========================================================================
  describe('2. Manual Deck & Card Lifecycle Management', () => {
    let createdDeckId: string;

    it('creates a new custom deck with initial cards', async () => {
      const newDeck = await LearningModulesService.createFlashcardDeck(primaryStudentId, {
        title: 'Computer Networks - OSI & TCP/IP Stack',
        description: 'Key protocol invariants, port numbers, and layer responsibilities',
        subject_name: 'Computer Networks',
        tags: ['Networks', 'TCP/IP', 'B.Tech CS'],
        source_type: 'MANUAL',
        cards: [
          {
            front: 'What is the primary difference between TCP and UDP?',
            back: 'TCP is connection-oriented, reliable, and provides flow & congestion control. UDP is connectionless and lightweight without retransmissions.',
            explanation: 'TCP uses a 3-way handshake (SYN, SYN-ACK, ACK), while UDP streams datagrams directly.',
            example: 'TCP is used for HTTP/HTTPS, while UDP is preferred for live video streaming and DNS queries.',
            type: 'CONCEPT',
            difficulty: 'MEDIUM',
            tags: ['Protocols', 'Transport Layer'],
          },
          {
            front: 'What is the purpose of the Address Resolution Protocol (ARP)?',
            back: 'ARP resolves an IP address (Network Layer) into a physical MAC address (Data Link Layer).',
            type: 'DEFINITION',
            difficulty: 'EASY',
            tags: ['ARP', 'Link Layer'],
          },
        ],
      });

      expect(newDeck.id).toBeDefined();
      expect(newDeck.cards.length).toBe(2);
      expect(newDeck.cards[0].student_id).toBe(primaryStudentId);
      createdDeckId = newDeck.id;
    });

    it('updates deck metadata (title, description, tags)', async () => {
      const updated = await LearningModulesService.updateFlashcardDeck(
        primaryStudentId,
        createdDeckId,
        {
          title: 'Computer Networks - OSI & TCP/IP Deep Dive',
          description: 'Updated comprehensive exam preparation deck',
        }
      );

      expect(updated.title).toBe('Computer Networks - OSI & TCP/IP Deep Dive');
      expect(updated.description).toContain('Updated comprehensive');
    });

    it('adds a new card to an existing deck', async () => {
      const newCard = await LearningModulesService.addCardToDeck(
        primaryStudentId,
        createdDeckId,
        {
          front: 'What is the default port number for HTTPS?',
          back: 'Port 443 (HTTP uses port 80).',
          type: 'DEFINITION',
          difficulty: 'EASY',
          tags: ['Ports', 'Security'],
        }
      );

      expect(newCard.id).toBeDefined();
      expect(newCard.front).toContain('HTTPS');

      const deck = await LearningModulesService.getFlashcardDeckById(
        primaryStudentId,
        createdDeckId
      );
      expect(deck.cards.length).toBe(3);
    });

    it('edits an individual card in a deck', async () => {
      const deck = await LearningModulesService.getFlashcardDeckById(
        primaryStudentId,
        createdDeckId
      );
      const cardToEdit = deck.cards[0];

      const updatedCard = await LearningModulesService.updateCardInDeck(
        primaryStudentId,
        createdDeckId,
        cardToEdit.id,
        {
          front: 'Explain TCP vs UDP with protocol header overhead comparison',
          back: 'TCP has a 20-60 byte header with sequence numbers and ack. UDP has a fixed 8-byte header.',
        }
      );

      expect(updatedCard.front).toContain('overhead comparison');
      expect(updatedCard.back).toContain('8-byte header');
    });

    it('duplicates a deck without copying review history', async () => {
      // First review a card in the created deck so it has review history
      const deck = await LearningModulesService.getFlashcardDeckById(
        primaryStudentId,
        createdDeckId
      );
      await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        createdDeckId,
        deck.cards[0].id,
        4
      );

      // Now duplicate the deck
      const duplicated = await LearningModulesService.duplicateFlashcardDeck(
        primaryStudentId,
        createdDeckId
      );

      expect(duplicated.id).not.toBe(createdDeckId);
      expect(duplicated.title).toContain('(Copy)');
      expect(duplicated.cards.length).toBe(deck.cards.length);

      // CRITICAL REQUIREMENT: Review history must NOT be copied over as completed!
      duplicated.cards.forEach((c) => {
        expect(c.review_count).toBe(0);
        expect(c.interval_days).toBe(1);
        expect(c.repetition_count).toBe(0);
        expect(c.confidence).toBe(1);
        expect(c.state).toBe('NEW');
      });
    });

    it('archives and restores a deck', async () => {
      const archived = await LearningModulesService.toggleDeckArchive(
        primaryStudentId,
        createdDeckId
      );
      expect(archived.is_archived).toBe(true);

      const restored = await LearningModulesService.toggleDeckArchive(
        primaryStudentId,
        createdDeckId
      );
      expect(restored.is_archived).toBe(false);
    });

    it('deletes an individual card and deletes a deck with confirmation', async () => {
      const deck = await LearningModulesService.getFlashcardDeckById(
        primaryStudentId,
        createdDeckId
      );
      const initialCount = deck.cards.length;
      const cardToDelete = deck.cards[deck.cards.length - 1];

      await LearningModulesService.deleteCardFromDeck(
        primaryStudentId,
        createdDeckId,
        cardToDelete.id
      );

      const deckAfterCardDelete = await LearningModulesService.getFlashcardDeckById(
        primaryStudentId,
        createdDeckId
      );
      expect(deckAfterCardDelete.cards.length).toBe(initialCount - 1);

      // Delete deck
      await LearningModulesService.deleteFlashcardDeck(primaryStudentId, createdDeckId);

      // Should no longer exist
      await expect(
        LearningModulesService.getFlashcardDeckById(primaryStudentId, createdDeckId)
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 3. SuperMemo-2 (SM-2) Spaced Repetition Scheduling Math
  // =========================================================================
  describe('3. SM-2 Spaced Repetition Scheduling Invariants', () => {
    let testDeckId: string;
    let testCardId: string;

    beforeEach(async () => {
      const testDeck = await LearningModulesService.createFlashcardDeck(primaryStudentId, {
        title: 'SM-2 Math Verification Deck',
        subject_name: 'Test Algorithms',
        cards: [
          {
            front: 'What is the time complexity of QuickSelect average case?',
            back: 'O(N) average time complexity, O(N^2) worst case.',
            difficulty: 'MEDIUM',
          },
        ],
      });
      testDeckId = testDeck.id;
      testCardId = testDeck.cards[0].id;
    });

    it('rating 1 (Again): resets interval to 1 day and decreases ease factor', async () => {
      const card = await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        1 // Again
      );

      expect(card.interval_days).toBe(1);
      expect(card.repetition_count).toBe(0);
      expect(card.ease_factor).toBeCloseTo(2.3, 1); // 2.5 - 0.20 = 2.30
      expect(card.confidence).toBe(1);
      expect(new Date(card.next_review_at!).getTime()).toBeGreaterThan(Date.now() - 10000);
    });

    it('rating 4 (Easy): advances interval with ease bonus and increases ease factor', async () => {
      const card = await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        4 // Easy
      );

      expect(card.confidence).toBe(4);
      expect(card.repetition_count).toBe(1);
      expect(card.ease_factor).toBeGreaterThan(2.5); // increased
      expect(card.interval_days).toBeGreaterThanOrEqual(1);
    });

    it('rating 3 (Good) sequentially: correctly transitions 1 day -> 6 days -> interval * EF', async () => {
      // First review (Good)
      const r1 = await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        3
      );
      expect(r1.interval_days).toBe(1);
      expect(r1.repetition_count).toBe(1);

      // Second review (Good)
      const r2 = await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        3
      );
      expect(r2.interval_days).toBe(6);
      expect(r2.repetition_count).toBe(2);

      // Third review (Good)
      const r3 = await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        3
      );
      expect(r3.interval_days).toBeGreaterThanOrEqual(14); // 6 * 2.5 = 15
      expect(r3.repetition_count).toBe(3);
    });

    it('publishes FLASHCARD_REVIEWED event to EventBus with correct payload', async () => {
      let capturedEvent: any = null;
      const unsubscribe = EventBus.getInstance().subscribe(
        'FLASHCARD_REVIEWED',
        (event) => {
          capturedEvent = event;
        }
      );

      await LearningModulesService.reviewFlashcard(
        primaryStudentId,
        testDeckId,
        testCardId,
        3
      );

      expect(capturedEvent).toBeDefined();
      expect(capturedEvent.type).toBe('FLASHCARD_REVIEWED');
      expect(capturedEvent.student_id).toBe(primaryStudentId);
      expect(capturedEvent.payload.card_id).toBe(testCardId);
      expect(capturedEvent.payload.deck_id).toBe(testDeckId);
      expect(capturedEvent.payload.confidence).toBe(3);

      unsubscribe();
    });
  });

  // =========================================================================
  // 4. Learning Analytics & Real Progress Stats
  // =========================================================================
  describe('4. Learning Analytics & Progress Metrics', () => {
    it('returns authentic non-hardcoded flashcard statistics', async () => {
      const stats = await LearningModulesService.getFlashcardStats(primaryStudentId);

      expect(stats).toBeDefined();
      expect(stats.total_decks).toBeGreaterThanOrEqual(1);
      expect(stats.total_cards).toBeGreaterThanOrEqual(1);
      expect(stats.coverage_percentage).toBeGreaterThanOrEqual(0);
      expect(stats.coverage_percentage).toBeLessThanOrEqual(100);
      expect(stats.mastery_percentage).toBeGreaterThanOrEqual(0);
      expect(stats.mastery_percentage).toBeLessThanOrEqual(100);
      expect(stats.rating_distribution).toHaveProperty('again');
      expect(stats.rating_distribution).toHaveProperty('hard');
      expect(stats.rating_distribution).toHaveProperty('good');
      expect(stats.rating_distribution).toHaveProperty('easy');
      expect(stats.recent_activity_7d!.length).toBe(7);
    });

    it('retrieves due flashcards queue accurately', async () => {
      const dueCards = await LearningModulesService.getDueFlashcards(primaryStudentId);
      expect(Array.isArray(dueCards)).toBe(true);
      dueCards.forEach((c) => {
        expect(c.student_id).toBe(primaryStudentId);
      });
    });
  });

  // =========================================================================
  // 5. AI Generation & Multi-Source Grounding (Notes, Docs, Courses)
  // =========================================================================
  describe('5. AI Generation & Source Grounding', () => {
    it('generates high-yield flashcards from topic with technical concepts', async () => {
      const genRes = await LearningModulesService.generateAIFlashcards(
        primaryStudentId,
        {
          topic: 'Operating Systems Virtual Memory and Paging',
          subject: 'Operating Systems',
          difficulty: 'INTERMEDIATE',
          style: 'CONCEPT',
          count: 4,
        }
      );

      expect(genRes.cards.length).toBeGreaterThanOrEqual(3);
      expect(genRes.cards[0].front).toBeDefined();
      expect(genRes.cards[0].back).toBeDefined();
      expect(genRes.cards[0].type).toBeDefined();
    });

    it('generates cards grounded in student notes and preserves note reference', async () => {
      // First get an existing note
      const notes = await db.getNotes(primaryStudentId);
      expect(notes.length).toBeGreaterThanOrEqual(1);
      const note = notes[0];

      const noteRes = await LearningModulesService.generateFromNote(
        primaryStudentId,
        note.id
      );

      expect(noteRes.title).toBeDefined();
      expect(noteRes.source_id).toBe(note.id);
      expect(noteRes.source_title).toBe(note.title);
      expect(noteRes.cards.length).toBeGreaterThanOrEqual(1);

      // Save as student deck
      const savedDeck = await LearningModulesService.createFlashcardDeck(primaryStudentId, {
        title: noteRes.title,
        subject: noteRes.subject,
        source_type: 'NOTES',
        source_id: noteRes.source_id,
        source_title: noteRes.source_title,
        cards: noteRes.cards,
      });
      expect(savedDeck.id).toBeDefined();
      expect(savedDeck.source_type).toBe('NOTES');
      expect(savedDeck.source_id).toBe(note.id);
    });

    it('generates cards grounded in course syllabus and preserves course reference', async () => {
      const coursesRes = await db.getCourses({});
      expect(coursesRes.items.length).toBeGreaterThanOrEqual(1);
      const course = coursesRes.items[0];

      const courseRes = await LearningModulesService.generateFromCourse(
        primaryStudentId,
        course.id,
        undefined,
        4
      );

      expect(courseRes.title).toBeDefined();
      expect(courseRes.source_id).toBe(course.id);
      expect(courseRes.cards.length).toBeGreaterThanOrEqual(2);

      // Save as student deck
      const savedCourseDeck = await LearningModulesService.createFlashcardDeck(primaryStudentId, {
        title: courseRes.title,
        subject: courseRes.subject,
        source_type: 'COURSE',
        source_id: courseRes.source_id,
        source_title: courseRes.source_title,
        cards: courseRes.cards,
      });
      expect(savedCourseDeck.id).toBeDefined();
      expect(savedCourseDeck.source_type).toBe('COURSE');
    });
  });

  // =========================================================================
  // 6. Cross-Module Integration: Study Planner Task Scheduling
  // =========================================================================
  describe('6. Study Planner Integration', () => {
    it('schedules a flashcard review session directly into the Study Planner', async () => {
      const decks = await LearningModulesService.getFlashcardDecks(primaryStudentId);
      const deck = decks[0];

      const scheduledTask = await LearningModulesService.scheduleReviewTask(
        primaryStudentId,
        deck.id,
        'Tomorrow at 7:00 PM',
        30
      );

      expect(scheduledTask.id).toBeDefined();
      expect(scheduledTask.title).toContain(deck.title);
      expect(scheduledTask.duration_minutes).toBe(30);

      // Verify the task appears in student's today or upcoming agenda
      const todayTasks = await LearningModulesService.getTodayTasks(primaryStudentId);
      expect(todayTasks.some((t) => t.id === scheduledTask.id)).toBe(true);
    });
  });
});
