import { db } from '../../db/database';
import { AgentRouter } from './router';
import { TaskPlanner } from './planner';
import { AgentExecutor } from './executor';
import { ResponseSynthesizer } from './synthesizer';
import { AgentContext, AgentWorkflowRecord, SourceProvenance } from './types';
import { StudentProfileService } from '../../services/studentProfile/studentProfileService';
import { formatAcademicPromptLine } from '../../services/studentProfile/moduleContext';
import { AIMessageRecord, ToolExecutionSummary, AgentPlanItem, AICitationItem } from '../../models/types';
import { logger } from '../../core/logging';
import { AIService } from '../service';
import { AIMessage } from '../provider';
import { PromptService } from '../prompts';

export interface MultiAgentStreamEvent {
  type:
    | 'message_start'
    | 'agent_plan'
    | 'agent_step_start'
    | 'agent_step_complete'
    | 'tool_start'
    | 'tool_result'
    | 'message_delta'
    | 'message_complete'
    | 'error';
  data: any;
}

export class MasterAgent {
  /**
   * Primary entry point for multi-agent streaming orchestration.
   */
  public static async *runStream(
    studentId: string,
    conversationId: string,
    userMessage: string,
    clientContext?: Record<string, any>,
    explicitMode?: string
  ): AsyncGenerator<MultiAgentStreamEvent> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startedAt = new Date().toISOString();

    yield {
      type: 'message_start',
      data: { conversationId, workflowId, timestamp: startedAt },
    };

    try {
      // 1. Authenticate and retrieve student learning context
      const studentContext = await db.getStudentLearningContext(studentId);
      const student = studentContext.student;

      const additionalSources: SourceProvenance[] = [];
      let activeCourseData: any = null;
      let activeLessonData: any = null;

      // Ingest course context if selected in clientContext
      if (clientContext?.courseId) {
        try {
          const course = await db.getCourseById(clientContext.courseId, studentId);
          if (course) {
            activeCourseData = course;
            additionalSources.push({
              sourceType: 'COURSE_DATABASE',
              sourceId: course.id,
              title: `${course.title} (${course.code}) Syllabus`,
              link: `/courses/${course.id}`,
              retrievedAt: new Date().toISOString(),
              confidence: 1.0,
            });
          }
        } catch {}
      }

      // Ingest lesson context if selected in clientContext
      if (clientContext?.lessonId) {
        try {
          const lesson = await db.getLessonById(clientContext.lessonId, studentId);
          if (lesson) {
            activeLessonData = lesson;
            additionalSources.push({
              sourceType: 'COURSE_DATABASE',
              sourceId: lesson.id,
              title: `${lesson.title} - ${lesson.course_title || 'Curriculum Lesson'}`,
              link: `/courses/${lesson.course_id}`,
              retrievedAt: new Date().toISOString(),
              confidence: 1.0,
            });
          }
        } catch {}
      }

      // Ingest student documents for RAG grounding
      let documentExcerpts = '';
      const docIds = clientContext?.documentIds || (clientContext?.documentId ? [clientContext.documentId] : (clientContext?.document_id ? [clientContext.document_id] : []));
      for (const dId of docIds) {
        try {
          const doc = await db.getDocumentById(dId, studentId);
          if (doc) {
            const pages = await db.getDocumentPages(doc.id, studentId);
            const text = pages.map((p) => p.text).join('\n') || doc.description || '';
            documentExcerpts += `\n[DOCUMENT: "${doc.title}"]\n${text.slice(0, 2500)}\n`;
            additionalSources.push({
              sourceType: 'DOCUMENT_RAG',
              sourceId: doc.id,
              title: `${doc.title} (Verified Student Material)`,
              page: 1,
              link: `/documents/${doc.id}`,
              retrievedAt: new Date().toISOString(),
              confidence: 0.96,
            });
          }
        } catch {}
      }

      // 2. Build secure scoped AgentContext
      const agentContext: AgentContext = {
        student_id: studentId,
        role: student.role,
        conversation_id: conversationId,
        request_id: workflowId,
        current_course: activeCourseData
          ? { id: activeCourseData.id, name: activeCourseData.title, code: activeCourseData.code, progress: activeCourseData.progress_percentage || 0 }
          : studentContext.current_course,
        current_lesson: activeLessonData
          ? { id: activeLessonData.id, title: activeLessonData.title, topic: activeLessonData.chapter_title || 'Core Topic' }
          : studentContext.current_lesson,
        client_metadata: clientContext,
        selected_documents: docIds,
        selected_repository: clientContext?.repository,
      };

      // 3. Classify intent and route to specialized agents
      const intent = AgentRouter.route(userMessage, agentContext, explicitMode);

      // 4. Create Task Plan DAG
      const plan = TaskPlanner.plan(workflowId, intent, userMessage, agentContext);

      // Map to frontend AgentPlanItem format
      const frontendPlanSteps: AgentPlanItem[] = plan.tasks.map((t, idx) => ({
        step: idx + 1,
        title: `[${t.agent}] ${t.title}`,
        description: t.description,
        status: 'pending',
      }));

      yield {
        type: 'agent_plan',
        data: { steps: frontendPlanSteps, intent: intent.intent, complexity: intent.complexity },
      };

      // Persist workflow in database
      const workflowRecord: AgentWorkflowRecord = {
        id: workflowId,
        conversation_id: conversationId,
        student_id: studentId,
        workflow_type: intent.intent,
        complexity: intent.complexity,
        status: 'PROCESSING',
        agents_involved: intent.targetAgents,
        tasks: plan.tasks.map((t) => ({
          id: t.id,
          agent: t.agent,
          title: t.title,
          status: 'pending',
        })),
        started_at: startedAt,
      };
      await db.saveAgentWorkflow(workflowRecord).catch(() => {});

      const toolSummaries: ToolExecutionSummary[] = [];

      // Give every agent the student's request so it can act on what was asked.
      for (const t of plan.tasks) {
        if (t.params.query === undefined) t.params.query = userMessage;
      }

      // 5. Execute agent plan via AgentExecutor
      const agentResults = await AgentExecutor.executePlan(plan, agentContext, {
        onTaskStart: (task) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) stepItem.status = 'in_progress';
        },
        onTaskComplete: (task, res) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) stepItem.status = 'completed';

          if (res.toolCallsExecuted) {
            for (const call of res.toolCallsExecuted) {
              toolSummaries.push({
                id: `tool_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                tool_name: `${task.agent} → ${call.toolName}`,
                status: 'completed',
                parameters: call.parameters,
                result: call.resultSummary,
              });
            }
          }
        },
        onTaskFailed: (task, err) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) {
            stepItem.status = 'failed';
            stepItem.note = err;
          }
        },
      });

      // Emit updated plan status
      yield {
        type: 'agent_plan',
        data: { steps: frontendPlanSteps },
      };

      // Emit tool execution events
      for (const t of toolSummaries) {
        yield {
          type: 'tool_start',
          data: { toolName: t.tool_name, parameters: t.parameters },
        };
        yield {
          type: 'tool_result',
          data: { toolName: t.tool_name, result: t.result },
        };
      }

      // 6. Invoke AI Provider with conversation history and enriched academic context
      let promptKey = 'student_learning_agent';
      const mUpper = (explicitMode || clientContext?.mode || '').toUpperCase();
      if (mUpper.includes('EXPLAIN') || mUpper === 'MODE_A') promptKey = 'tutor_explain';
      else if (mUpper.includes('STEP') || mUpper === 'MODE_B') promptKey = 'tutor_step_by_step';
      else if (mUpper.includes('SOLVE') || mUpper === 'MODE_C') promptKey = 'tutor_problem_solve';
      else if (mUpper.includes('EXAM') || mUpper === 'MODE_D') promptKey = 'tutor_exam_prep';
      else if (mUpper.includes('CODING') || mUpper === 'CODE' || mUpper === 'MODE_E') promptKey = 'tutor_coding';
      else if (mUpper.includes('INTERVIEW') || mUpper === 'MODE_F') promptKey = 'tutor_interview';
      else if (mUpper.includes('REVISION') || mUpper === 'MODE_G') promptKey = 'tutor_revision';

      let systemInstruction = PromptService.getPrompt(promptKey);
      // Phase 5: academic context comes from the central profile, minimised for the AI provider:
      // no name, email, phone or other personal identifiers are sent.
      const tutorCtx = StudentProfileService.moduleContextSync(studentId, 'tutor') || {};
      const profileLine = formatAcademicPromptLine(tutorCtx);
      systemInstruction += `\n\nSTUDENT ACADEMIC CONTEXT (from the student's own profile; do not assume anything not listed):\n- ${profileLine || 'The student has not filled in their academic profile yet.'}`;
      if (tutorCtx.preferred_language && tutorCtx.preferred_language !== 'English') {
        systemInstruction += `\n- Prefer explanations in ${tutorCtx.preferred_language}; keep technical terms in English.`;
      }

      if (studentContext.weak_areas?.length) {
        systemInstruction += `\n- Weak / Remedial Focus Areas: ${studentContext.weak_areas.join(', ')}`;
      }
      if (agentContext.current_course) {
        systemInstruction += `\n- Active Course: ${agentContext.current_course.name} (${agentContext.current_course.code})`;
      }
      if (activeLessonData) {
        systemInstruction += `\n- Active Lesson: "${activeLessonData.title}" in Chapter "${activeLessonData.chapter_title}"
Lesson Content / Syllabus Objectives:
${activeLessonData.content?.slice(0, 1500) || 'Core Lesson Curriculum'}`;
      }
      if (documentExcerpts) {
        systemInstruction += `\n\nGROUNDING TEXTBOOK / DOCUMENT EXCERPTS (Base explanation on these authorized passages where relevant and cite them):\n${documentExcerpts}`;
      }

      // Fetch last 8 messages for true multi-turn context
      const historyMsgs = await db.getMessagesByConversationId(conversationId, studentId);
      const conversationContext: AIMessage[] = historyMsgs
        .slice(-8)
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        }));
      conversationContext.push({ role: 'user', content: userMessage });

      let llmGeneratedAnswer = '';
      try {
        const genResult = await AIService.generate(
          [{ role: 'system', content: systemInstruction }, ...conversationContext],
          promptKey,
          0.7
        );
        llmGeneratedAnswer = genResult.text;
      } catch (err: any) {
        logger.warn('Direct AIService generation failed in MasterAgent, using rule synthesizer', err);
      }

      // The explanation step is only done when the model actually answered.
      if (!llmGeneratedAnswer || llmGeneratedAnswer.startsWith('**AI unavailable.**')) {
        let changed = false;
        for (const task of plan.tasks) {
          if (task.agent !== 'LearningAgent') continue;
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem && stepItem.status === 'completed') {
            stepItem.status = 'failed';
            stepItem.note = 'No explanation was generated because the AI provider is not available.';
            changed = true;
          }
        }
        if (changed) yield { type: 'agent_plan', data: { steps: frontendPlanSteps } };
      }

      // 7. Synthesize final response incorporating LLM answer and tool findings
      const synthesized = ResponseSynthesizer.synthesize(
        userMessage,
        plan,
        agentResults,
        llmGeneratedAnswer,
        additionalSources
      );

      // Convert citations to frontend format
      const citations: AICitationItem[] = synthesized.sources.map((s, idx) => ({
        id: `cit_${idx}_${Date.now()}`,
        title: s.title,
        source: s.sourceType.replace(/_/g, ' '),
        page: s.page,
        link: s.link,
      }));

      // 8. Stream markdown content progressively
      let fullContent = '';
      const words = synthesized.markdownContent.split(' ');

      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + ' ';
        fullContent += chunk;
        yield {
          type: 'message_delta',
          data: { delta: chunk },
        };

        if (process.env.NODE_ENV !== 'test') {
          await new Promise((r) => setTimeout(r, 12));
        }
      }

      // 8. Persist completed message
      const assistantMsg = await db.addMessageToConversation(conversationId, studentId, {
        conversation_id: conversationId,
        role: 'assistant',
        content: fullContent,
        metadata: {
          toolCalls: toolSummaries,
          agentPlan: frontendPlanSteps,
          suggestedActions: synthesized.nextActions,
          citations,
          workflowId,
        },
      });

      // Update workflow record in db
      workflowRecord.status = 'COMPLETED';
      workflowRecord.completed_at = new Date().toISOString();
      workflowRecord.total_duration_ms = Date.now() - new Date(startedAt).getTime();
      await db.updateAgentWorkflow(workflowRecord).catch(() => {});

      yield {
        type: 'message_complete',
        data: {
          message: assistantMsg,
          conversationId,
          workflowId,
        },
      };
    } catch (err: any) {
      logger.error('MasterAgent execution error', err);
      yield {
        type: 'error',
        data: { message: err.message || 'Multi-agent orchestration encountered an error' },
      };
    }
  }

  /**
   * Synchronous helper for non-streaming endpoints.
   */
  public static async run(
    studentId: string,
    conversationId: string,
    userMessage: string,
    clientContext?: Record<string, any>,
    explicitMode?: string
  ): Promise<AIMessageRecord> {
    let finalMessage: AIMessageRecord | null = null;
    for await (const event of this.runStream(studentId, conversationId, userMessage, clientContext, explicitMode)) {
      if (event.type === 'message_complete') {
        finalMessage = event.data.message;
      }
    }

    if (!finalMessage) {
      throw new Error('Multi-agent execution did not produce a final message');
    }

    return finalMessage;
  }
}
