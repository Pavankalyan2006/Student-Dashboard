import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { stubModel } from './helpers/mockAIModel';
import { db } from '../../server/db/database';
import { ProjectService } from '../../server/services/projectService';
import { ProjectModuleTaskService } from '../../server/services/projectModuleTaskService';
import { ProjectArchitectureService } from '../../server/services/projectArchitectureService';
import { ProjectPlanningService } from '../../server/services/projectPlanningService';
import { ProjectDocumentationService } from '../../server/services/projectDocumentationService';
import { ProjectAIService } from '../../server/services/projectAIService';
import { ToolRegistry } from '../../server/ai/tools';

describe('Phase 10: Project Builder & Project Documentation System', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_unauthorized_student_99';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Project Workspace & Security Ownership', () => {
    it('creates a project with slug, objectives, and domain', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Autonomous Drone Navigation using Visual SLAM',
        project_type: 'MAJOR_PROJECT',
        domain: 'Computer Vision',
        problem_statement: 'GPS-denied indoor drone localization suffers from drift.',
        objectives: [
          'Implement visual odometry pipeline using ORB features',
          'Optimize loop closure detection using bag-of-words',
          'Deploy onto embedded Raspberry Pi 5 platform',
        ],
        target_users: 'Search & rescue teams and robotics researchers',
      });

      expect(project.id).toBeDefined();
      expect(project.student_id).toBe(studentA);
      expect(project.slug).toBe('autonomous-drone-navigation-using-visual-slam');
      expect(project.status).toBe('PLANNING');
      expect(project.progress_percentage).toBe(0);
      expect(project.objectives.length).toBe(3);
    });

    it('enforces student ownership and forbids unauthorized access', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Private Blockchain for Academic Credential Verification',
        project_type: 'FINAL_YEAR_PROJECT',
        domain: 'Blockchain',
      });

      // Student A can access
      const fetched = await ProjectService.getProject(project.id, studentA);
      expect(fetched.id).toBe(project.id);

      // Student B is strictly forbidden
      await expect(ProjectService.getProject(project.id, studentB)).rejects.toThrow(
        /Forbidden/i
      );

      // Student B cannot update Student A's project
      await expect(
        ProjectService.updateProject(project.id, studentB, { title: 'Hacked Title' })
      ).rejects.toThrow(/Forbidden/i);

      // Student B cannot delete Student A's project
      await expect(ProjectService.deleteProject(project.id, studentB)).rejects.toThrow(
        /Forbidden/i
      );
    });
  });

  describe('2. Authoritative Backend Progress Calculation', () => {
    it('calculates progress percentage derived from completed tasks and milestones', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Progress Formula Test Project',
        project_type: 'MINI_PROJECT',
        domain: 'Web Development',
      });

      // 0 tasks, 0 milestones, 0 modules -> 0%
      let progress = await ProjectService.calculateProgress(project.id, studentA);
      expect(progress.overall_percentage).toBe(0);

      // Create a module
      const mod = await ProjectModuleTaskService.createModule(project.id, studentA, {
        name: 'Database Schema',
        description: 'PostgreSQL relational structure',
        purpose: 'Data persistence',
        priority: 'HIGH',
        status: 'TODO',
        order_index: 1,
      });

      // Create 2 tasks (1 completed, 1 pending)
      const task1 = await ProjectModuleTaskService.createTask(project.id, studentA, {
        module_id: mod.id,
        title: 'Create User & Project tables',
        description: 'Define relational schema',
        priority: 'HIGH',
        order_index: 1,
        status: 'DONE',
      });

      await ProjectModuleTaskService.createTask(project.id, studentA, {
        module_id: mod.id,
        title: 'Add Foreign Key Constraints',
        description: 'Verify integrity',
        priority: 'MEDIUM',
        order_index: 2,
        status: 'TODO',
      });

      // Create 1 completed milestone
      await ProjectModuleTaskService.createMilestone(project.id, studentA, {
        title: 'Schema Signoff',
        description: 'Verified with advisor',
        target_date: '2026-04-15',
        status: 'COMPLETED',
        order_index: 1,
      });

      progress = await ProjectService.calculateProgress(project.id, studentA);
      // Expected formula: (0.5 tasks * 60) + (1.0 milestone * 30) + (0.0 module * 10) = 30 + 30 + 0 = 60%
      expect(progress.overall_percentage).toBe(60);
      expect(progress.tasks_completed).toBe(1);
      expect(progress.tasks_total).toBe(2);
      expect(progress.milestones_completed).toBe(1);
    });
  });

  describe('3. Modules, Tasks & Dependency Validation', () => {
    it('detects and blocks self-dependencies and circular task dependencies', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Dependency Graph Validation Project',
        project_type: 'MAJOR_PROJECT',
        domain: 'Cloud Computing',
      });

      const taskA = await ProjectModuleTaskService.createTask(project.id, studentA, {
        title: 'Task A: Deploy Redis Cluster',
        description: 'Setup cluster nodes',
        priority: 'HIGH',
        order_index: 1,
      });

      const taskB = await ProjectModuleTaskService.createTask(project.id, studentA, {
        title: 'Task B: Connect API to Redis',
        description: 'Setup connection pool',
        priority: 'HIGH',
        depends_on_task_id: taskA.id,
        order_index: 2,
      });

      // Self-dependency: Task A depending on Task A
      await expect(
        ProjectModuleTaskService.updateTask(project.id, studentA, taskA.id, {
          depends_on_task_id: taskA.id,
        })
      ).rejects.toThrow(/Circular dependency/i);

      // Circular dependency: Task A depending on Task B (while B already depends on A)
      await expect(
        ProjectModuleTaskService.updateTask(project.id, studentA, taskA.id, {
          depends_on_task_id: taskB.id,
        })
      ).rejects.toThrow(/Circular dependency/i);
    });
  });

  describe('4. Architecture Graph & Validation', () => {
    it('validates architecture graph and forbids edges to non-existent nodes', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Architecture Test Project',
        project_type: 'MAJOR_PROJECT',
        domain: 'AI/ML',
      });

      // Valid architecture save
      const arch = await ProjectArchitectureService.saveArchitecture(project.id, studentA, {
        architecture_type: 'Microservices',
        description: 'Decoupled services',
        nodes: [
          {
            id: 'node_front',
            project_id: project.id,
            name: 'React Frontend',
            type: 'FRONTEND',
            position: { x: 100, y: 100 },
          },
          {
            id: 'node_back',
            project_id: project.id,
            name: 'FastAPI Service',
            type: 'BACKEND',
            position: { x: 300, y: 100 },
          },
        ],
        edges: [
          {
            id: 'edge_1',
            project_id: project.id,
            source_node: 'node_front',
            target_node: 'node_back',
            label: 'HTTPS REST',
          },
        ],
      });

      expect(arch.nodes.length).toBe(2);
      expect(arch.edges.length).toBe(1);

      // Invalid edge: referencing unknown node
      await expect(
        ProjectArchitectureService.saveArchitecture(project.id, studentA, {
          nodes: arch.nodes,
          edges: [
            {
              id: 'edge_invalid',
              project_id: project.id,
              source_node: 'node_front',
              target_node: 'non_existent_node_99',
            },
          ],
        })
      ).rejects.toThrow(/does not exist in graph/i);
    });
  });

  describe('5. AI Planning, Idea Generation & Scope Analysis', () => {
    afterEach(() => vi.restoreAllMocks());

    it('without an AI model, every AI planning endpoint answers 503 and saves nothing (no template ideas)', async () => {
      const project = await ProjectService.createProject(studentA, { title: 'No model project', project_type: 'MINI_PROJECT', domain: 'EdTech' });
      for (const call of [
        () => ProjectPlanningService.generateProjectIdeas({ domain: 'AI/ML' }),
        () => ProjectPlanningService.generateProjectPlan(project.id, studentA),
        () => ProjectPlanningService.analyzeProjectScope(project.id, studentA),
        () => ProjectPlanningService.analyzeProjectRisks(project.id, studentA),
        () => ProjectPlanningService.suggestTechStack(project.id, studentA),
        () => ProjectPlanningService.generateArchitecture(project.id, studentA),
        () => ProjectDocumentationService.generateDocument(project.id, studentA, { document_type: 'ABSTRACT' }),
        () => ProjectAIService.askProjectAI(project.id, studentA, 'What next?'),
      ]) {
        await expect(call()).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
      }
      expect(await db.getProjectModules(project.id)).toEqual([]);
      expect(await db.getProjectDocuments(project.id)).toEqual([]);
      expect(await db.getProjectArchitecture(project.id)).toBeFalsy();
    });

    it('uses the model output for ideas, and rejects malformed output with 502', async () => {
      stubModel(() => JSON.stringify([{ title: 'Stub idea', problem: 'p', solution: 's', users: 'u', features: ['f1'], technologies: [], difficulty: 'INTERMEDIATE', estimated_scope: '8 weeks' }]));
      const ideas = await ProjectPlanningService.generateProjectIdeas({ domain: 'AI/ML', difficulty: 'INTERMEDIATE', project_type: 'MAJOR_PROJECT' });
      expect(ideas[0].title).toBe('Stub idea');
      vi.restoreAllMocks();
      stubModel(() => 'sorry, no JSON here');
      await expect(ProjectPlanningService.generateProjectIdeas({ domain: 'AI/ML' })).rejects.toMatchObject({ statusCode: 502 });
    });

    it('applies a model-generated plan to the project workspace, and AI tasks start as TODO', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Automated Code Vulnerability Scanner',
        project_type: 'MAJOR_PROJECT',
        domain: 'Cyber Security',
        problem_statement: 'Static analysis tools miss contextual semantic vulnerabilities.',
      });
      stubModel(() => JSON.stringify({
        phases: [{ name: 'Phase 1', description: 'd', weeks: 2 }],
        milestones: [{ title: 'M1', description: 'd', target_week: 2 }],
        modules: [{ name: 'Scanner', description: 'd', purpose: 'p', priority: 'HIGH' }],
        tasks: [{ module_name: 'Scanner', title: 'Parse AST', description: 'd', priority: 'HIGH', estimated_hours: 8 }],
      }));
      const plan = await ProjectPlanningService.generateProjectPlan(project.id, studentA);
      expect(plan.modules).toHaveLength(1);
      const result = await ProjectPlanningService.applyGeneratedPlan(project.id, studentA, plan);
      expect(result.modulesCreated).toBe(1);
      expect(result.tasksCreated).toBe(1);
      const tasks = await db.getProjectTasks(project.id);
      expect(tasks.every((t: any) => t.status !== 'DONE')).toBe(true);
    });

    it('analyzes project scope into MoSCoW categories from the model output', async () => {
      const project = await ProjectService.createProject(studentA, { title: 'Scope Analysis Test', project_type: 'MINI_PROJECT', domain: 'EdTech' });
      stubModel(() => JSON.stringify({ must_have: ['a'], should_have: ['b'], could_have: [], future: [], scope_verdict: 'ok' }));
      const scope = await ProjectPlanningService.analyzeProjectScope(project.id, studentA);
      expect(scope.must_have).toEqual(['a']);
      expect(scope.scope_verdict).toBe('ok');
    });
  });

  describe('6. Project Documentation & Academic Integrity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('saves an AI draft as a new document and never overwrites the student\'s own document', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Intelligent Traffic Signal Timing Optimization',
        project_type: 'MAJOR_PROJECT',
        domain: 'Smart City',
        problem_statement: 'Fixed-timer traffic signals cause congestion.',
      });
      const own = await ProjectDocumentationService.saveDocument(project.id, studentA, { document_type: 'ABSTRACT', title: 'My abstract', content: 'Written by me.', status: 'DRAFT' } as any);
      stubModel((prompt) => `Abstract draft for ${prompt.includes('Intelligent Traffic Signal') ? 'Intelligent Traffic Signal' : '?'}.`);
      const draft = await ProjectDocumentationService.generateDocument(project.id, studentA, { document_type: 'ABSTRACT' });
      expect(draft.id).not.toBe(own.id);
      expect(draft.title).toMatch(/AI draft/);
      expect(draft.content).toContain('Intelligent Traffic Signal');
      const mine = await ProjectDocumentationService.getDocument(project.id, studentA, own.id);
      expect(mine.content).toBe('Written by me.');

      await expect(ProjectDocumentationService.getDocument(project.id, studentB, draft.id)).rejects.toThrow(/Forbidden/i);
    });
  });

  describe('7. AI Agent Project Tools in ToolRegistry', () => {
    it('executes get_projects, get_project_tasks, and get_project_progress via ToolRegistry', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Tool Registry Test Project',
        project_type: 'MAJOR_PROJECT',
        domain: 'AI/ML',
      });

      const getProjectsTool = ToolRegistry.getTool('get_projects');
      expect(getProjectsTool).toBeDefined();
      const projectsResult = await getProjectsTool!.handler({}, { studentId: studentA, role: 'STUDENT' });
      expect(Array.isArray(projectsResult)).toBe(true);
      expect(projectsResult.some((p: any) => p.id === project.id)).toBe(true);

      const getProgressTool = ToolRegistry.getTool('get_project_progress');
      expect(getProgressTool).toBeDefined();
      const progressResult = await getProgressTool!.handler(
        { project_id: project.id },
        { studentId: studentA, role: 'STUDENT' }
      );
      expect(progressResult.overall_percentage).toBeDefined();
    });

    it('exports project architecture notes to Notes system via ProjectAIService', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Notes Integration Test Project',
        project_type: 'MAJOR_PROJECT',
        domain: 'Cloud Computing',
      });

      const createdNote = await ProjectAIService.generateProjectNotes(
        project.id,
        studentA,
        'ARCHITECTURE'
      );

      expect(createdNote.id).toBeDefined();
      expect(createdNote.title).toContain('Notes Integration Test Project');
      expect(createdNote.content).toContain('Architecture & Tech Stack Rationale');

      // Verify the note is stored in the Notes database
      const fetchedNote = await db.getNoteById(createdNote.id);
      expect(fetchedNote).not.toBeNull();
      expect(fetchedNote?.student_id).toBe(studentA);
    });
  });
});
