import { describe, it, expect } from 'vitest';
import { AgentRegistry } from '../../server/ai/orchestration/registry';
import { AgentRouter } from '../../server/ai/orchestration/router';
import { TaskPlanner } from '../../server/ai/orchestration/planner';
import { AgentExecutor } from '../../server/ai/orchestration/executor';
import { ResultValidator, ConflictResolver, SOURCE_AUTHORITY_PRIORITY } from '../../server/ai/orchestration/validator';
import { ResponseSynthesizer } from '../../server/ai/orchestration/synthesizer';
import { MasterAgent } from '../../server/ai/orchestration/master';
import { AgentContext, AgentResult } from '../../server/ai/orchestration/types';
import { db } from '../../server/db/database';

describe('Multi-Agent AI Orchestration System', () => {
  const studentId = 'std_01j8k9x2p4';

  const mockContext: AgentContext = {
    student_id: studentId,
    role: 'STUDENT',
    conversation_id: 'conv_test_multi_agent',
    request_id: 'req_test_01',
    current_course: { id: 'c_os_01', name: 'Operating Systems', code: 'CS401', progress: 68 },
    current_lesson: { id: 'l_sync_01', title: 'Process Synchronization', topic: 'Semaphores' },
  };

  describe('1. Agent Registry & Feature Flags', () => {
    it('registers all specialized domain agents', () => {
      const agents = AgentRegistry.getAll();
      expect(agents.length).toBeGreaterThanOrEqual(28);

      const agentNames = agents.map((a) => a.name);
      expect(agentNames).toContain('LearningAgent');
      expect(agentNames).toContain('CourseAgent');
      expect(agentNames).toContain('NotesAgent');
      expect(agentNames).toContain('DocumentRAGAgent');
      expect(agentNames).toContain('CodingAgent');
      expect(agentNames).toContain('DSAAgent');
      expect(agentNames).toContain('QuizAgent');
      expect(agentNames).toContain('ProjectAgent');
      expect(agentNames).toContain('PlacementAgent');
      expect(agentNames).toContain('InterviewAgent');
      expect(agentNames).toContain('ResumeAgent');
      expect(agentNames).toContain('CareerAgent');
      expect(agentNames).toContain('SkillAgent');
      expect(agentNames).toContain('ResearchAgent');
      expect(agentNames).toContain('GitHubAgent');
      expect(agentNames).toContain('CommunityAgent');
      expect(agentNames).toContain('ProgressAgent');
      expect(agentNames).toContain('StudyPlannerAgent');
      expect(agentNames).toContain('RevisionAgent');
      expect(agentNames).toContain('FlashcardAgent');
      expect(agentNames).toContain('LabAssistantAgent');
      expect(agentNames).toContain('ExamPreparationAgent');
      expect(agentNames).toContain('DatabaseAgent');
      expect(agentNames).toContain('SystemDesignAgent');
      expect(agentNames).toContain('MLExperimentAgent');
      expect(agentNames).toContain('KnowledgeBaseAgent');
      expect(agentNames).toContain('RecommendationAgent');
      expect(agentNames).toContain('ProfileAgent');
    });

    it('supports feature flag disabling and enabling without breaking registry', () => {
      expect(AgentRegistry.isEnabled('MLExperimentAgent')).toBe(true);

      // Disable agent
      AgentRegistry.setEnabled('MLExperimentAgent', false);
      expect(AgentRegistry.isEnabled('MLExperimentAgent')).toBe(false);

      // Re-enable agent
      AgentRegistry.setEnabled('MLExperimentAgent', true);
      expect(AgentRegistry.isEnabled('MLExperimentAgent')).toBe(true);
    });

    it('tracks execution metrics including requests and tool counts', () => {
      AgentRegistry.recordExecution('DSAAgent', true, 120, 2);
      const metrics = AgentRegistry.getMetrics();
      const dsaMetric = metrics.find((m) => m.agentName === 'DSAAgent');

      expect(dsaMetric).toBeDefined();
      expect(dsaMetric!.totalRequests).toBeGreaterThanOrEqual(1);
      expect(dsaMetric!.successCount).toBeGreaterThanOrEqual(1);
      expect(dsaMetric!.toolCallsCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('2. Agent Router E2E Test Suite (Section 69)', () => {
    it('TEST 1: "Explain binary search." routes to LearningAgent / DSAAgent (Simple)', () => {
      const intent = AgentRouter.route('Explain binary search.', mockContext);
      expect(intent.complexity).toBe('SIMPLE');
      expect(intent.targetAgents.includes('LearningAgent') || intent.targetAgents.includes('DSAAgent')).toBe(true);
    });

    it('TEST 2: "Explain binary search and give me five practice questions." routes to LearningAgent + QuizAgent (Moderate)', () => {
      const intent = AgentRouter.route(
        'Explain binary search and give me five practice questions.',
        mockContext
      );
      expect(intent.complexity).toBe('MODERATE');
      expect(intent.targetAgents).toContain('QuizAgent');
    });

    it('TEST 3: "Analyze my DSA performance and create a 7-day plan." routes to ProgressAgent + DSAAgent + StudyPlannerAgent', () => {
      const intent = AgentRouter.route(
        'Analyze my DSA performance and create a 7-day study plan.',
        mockContext
      );
      expect(intent.complexity).toBe('MODERATE');
      expect(intent.targetAgents).toContain('ProgressAgent');
      expect(intent.targetAgents).toContain('DSAAgent');
      expect(intent.targetAgents).toContain('StudyPlannerAgent');
    });

    it('TEST 4: "Analyze my project and GitHub repository." routes to ProjectAgent + GitHubAgent', () => {
      const intent = AgentRouter.route(
        'Analyze my project and GitHub repository.',
        mockContext
      );
      expect(intent.targetAgents).toContain('ProjectAgent');
      expect(intent.targetAgents).toContain('GitHubAgent');
    });

    it('TEST 5: "Compare my GitHub project with these papers." routes to ProjectAgent + GitHubAgent + ResearchAgent', () => {
      const intent = AgentRouter.route(
        'Compare my GitHub project with these research papers and analyze differences.',
        mockContext
      );
      expect(intent.complexity).toBe('COMPLEX');
      expect(intent.targetAgents).toContain('ProjectAgent');
      expect(intent.targetAgents).toContain('GitHubAgent');
      expect(intent.targetAgents).toContain('ResearchAgent');
    });

    it('TEST 6: "Prepare me for my exam using my progress." routes to full Exam Preparation Workflow', () => {
      const intent = AgentRouter.route(
        'I have an Operating Systems exam in 15 days. Look at my progress, identify weak areas, create a plan, generate notes, flashcards and quizzes.',
        mockContext
      );
      expect(intent.complexity).toBe('COMPLEX');
      expect(intent.targetAgents).toContain('ProfileAgent');
      expect(intent.targetAgents).toContain('ProgressAgent');
      expect(intent.targetAgents).toContain('CourseAgent');
      expect(intent.targetAgents).toContain('ExamPreparationAgent');
      expect(intent.targetAgents).toContain('StudyPlannerAgent');
      expect(intent.targetAgents).toContain('NotesAgent');
      expect(intent.targetAgents).toContain('FlashcardAgent');
      expect(intent.targetAgents).toContain('QuizAgent');
      expect(intent.targetAgents).toContain('RevisionAgent');
    });
  });

  describe('3. Task Planner & Dependency Graph (DAG)', () => {
    it('creates structured task DAG with step ordering and dependencies', () => {
      const intent = AgentRouter.route(
        'I have an Operating Systems exam in 15 days. Look at my progress, identify weak areas, create a plan, generate notes, flashcards and quizzes.',
        mockContext
      );
      const plan = TaskPlanner.plan('wf_test_plan_01', intent, 'OS Exam prep in 15 days', mockContext);

      expect(plan.workflowId).toBe('wf_test_plan_01');
      expect(plan.tasks.length).toBeGreaterThanOrEqual(8);

      // Verify dependency hierarchy: Study plan depends on exam blueprint
      const studyPlanTask = plan.tasks.find((t) => t.id === 'task_study_plan');
      expect(studyPlanTask).toBeDefined();
      expect(studyPlanTask!.dependencies).toContain('task_exam_blueprint');

      // Notes depend on study plan
      const notesTask = plan.tasks.find((t) => t.id === 'task_notes');
      expect(notesTask).toBeDefined();
      expect(notesTask!.dependencies).toContain('task_study_plan');

      // Quiz depends on notes
      const quizTask = plan.tasks.find((t) => t.id === 'task_quiz');
      expect(quizTask).toBeDefined();
      expect(quizTask!.dependencies).toContain('task_notes');
    });
  });

  describe('4. Result Validation & Conflict Resolution', () => {
    it('validates and sanitizes agent results against schema invariants', () => {
      const rawResult: AgentResult = {
        agent: 'ProgressAgent',
        status: 'success',
        summary: 'Completed progress evaluation',
        data: { score: 85 },
        evidenceType: 'OBSERVED_DATA',
        sources: [
          {
            sourceType: 'STUDENT_DATABASE',
            sourceId: 'src_std_01',
            title: 'Verified Lab Submissions',
            retrievedAt: new Date().toISOString(),
          },
        ],
      };

      const { isValid, sanitizedResult } = ResultValidator.validate(rawResult);
      expect(isValid).toBe(true);
      expect(sanitizedResult.agent).toBe('ProgressAgent');
      expect(sanitizedResult.sources.length).toBe(1);
    });

    it('enforces source authority hierarchy: Student DB > Course DB > AI inference', () => {
      expect(SOURCE_AUTHORITY_PRIORITY['STUDENT_DATABASE']).toBeGreaterThan(
        SOURCE_AUTHORITY_PRIORITY['COURSE_DATABASE']
      );
      expect(SOURCE_AUTHORITY_PRIORITY['COURSE_DATABASE']).toBeGreaterThan(
        SOURCE_AUTHORITY_PRIORITY['AI_INFERENCE']
      );

      const results: AgentResult[] = [
        {
          agent: 'LearningAgent',
          status: 'success',
          summary: 'Inferred progress estimation',
          data: { progress_percent: 50 },
          evidenceType: 'INFERENCE',
          sources: [{ sourceType: 'AI_INFERENCE', sourceId: 'inf_01', title: 'Model Inference', retrievedAt: '' }],
        },
        {
          agent: 'ProgressAgent',
          status: 'success',
          summary: 'Authoritative DB progress calculation',
          data: { progress_percent: 68 },
          evidenceType: 'OBSERVED_DATA',
          sources: [{ sourceType: 'STUDENT_DATABASE', sourceId: 'db_01', title: 'Student DB Records', retrievedAt: '' }],
        },
      ];

      const resolved = ConflictResolver.resolveConflicts(results);
      expect(resolved).toBeDefined();
    });
  });

  describe('5. Response Synthesizer & Quality Validator', () => {
    it('synthesizes structured response with Understanding, What I found, Plan, Result, Sources, Next actions', () => {
      const intent = AgentRouter.route('Analyze my DSA performance and create a 7-day study plan.', mockContext);
      const plan = TaskPlanner.plan('wf_synth_01', intent, 'DSA plan query', mockContext);

      const results: AgentResult[] = [
        {
          agent: 'ProgressAgent',
          status: 'success',
          summary: 'Analyzed 142 solved DSA problems',
          data: { solvedCount: 142, weakTopics: ['Dynamic Programming'] },
          evidenceType: 'OBSERVED_DATA',
          sources: [
            {
              sourceType: 'STUDENT_DATABASE',
              sourceId: 'src_prog',
              title: 'Academic Progress DB',
              retrievedAt: new Date().toISOString(),
            },
          ],
        },
        {
          agent: 'DSAAgent',
          status: 'success',
          summary: 'Evaluated algorithmic invariants and recurrence bounds',
          data: { invariants: 'State transition bounds check' },
          evidenceType: 'OBSERVED_DATA',
          sources: [
            {
              sourceType: 'COURSE_DATABASE',
              sourceId: 'src_dsa',
              title: 'DSA Curriculum Handbook',
              link: '/dsa',
              retrievedAt: new Date().toISOString(),
            },
          ],
        },
      ];

      const synthesized = ResponseSynthesizer.synthesize('Plan my DSA prep', plan, results);

      expect(synthesized.markdownContent).toContain('## Understanding');
      expect(synthesized.markdownContent).toContain('## What I found');
      expect(synthesized.markdownContent).toContain('## Plan');
      expect(synthesized.markdownContent).toContain('## Result');
      expect(synthesized.markdownContent).toContain('## Sources');
      expect(synthesized.markdownContent).toContain('## Next actions');
      expect(synthesized.sources.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('6. Master Agent Stream & Workflow Persistence', () => {
    it('executes MasterAgent stream generator producing complete multi-agent workflow', async () => {
      const conv = await db.createConversation(studentId, 'Multi-Agent E2E Test Session');
      const events: string[] = [];

      for await (const event of MasterAgent.runStream(
        studentId,
        conv.id,
        'I have an Operating Systems exam in 15 days. Look at my progress, create a plan, and prepare a quiz.'
      )) {
        events.push(event.type);
      }

      expect(events).toContain('message_start');
      expect(events).toContain('agent_plan');
      expect(events).toContain('message_delta');
      expect(events).toContain('message_complete');

      // Verify workflow record was saved in database
      const workflows = await db.getAgentWorkflows(studentId);
      expect(workflows.length).toBeGreaterThanOrEqual(1);

      const latestWf = workflows[0];
      expect(latestWf.status).toBe('COMPLETED');
      expect(latestWf.agents_involved.length).toBeGreaterThanOrEqual(3);
    }, 20000);

    it('enforces student data isolation: cannot inspect another student workflow', async () => {
      const workflows = await db.getAgentWorkflows(studentId);
      const studentAWorkflow = workflows[0];

      // Student B should not see student A's workflow
      const studentBWorkflows = await db.getAgentWorkflows('std_other_student_99');
      expect(studentBWorkflows.some((w) => w.id === studentAWorkflow.id)).toBe(false);
    });
  });
});
