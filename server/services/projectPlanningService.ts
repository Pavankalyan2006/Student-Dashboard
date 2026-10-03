import { AIService } from '../ai/service';
import { db } from '../db/database';
import {
  GenerateProjectIdeasRequest,
  ProjectIdea,
  GeneratePlanRequest,
  ProjectModule,
  ProjectTask,
  ProjectMilestone,
  ProjectArchitecture,
  ArchitectureNode,
  ArchitectureEdge,
  TechnologyCategory,
} from '../models/projectTypes';
import { ProjectService } from './projectService';
import { ProjectModuleTaskService } from './projectModuleTaskService';
import { ProjectArchitectureService } from './projectArchitectureService';
import { logger } from '../core/logging';

export class ProjectPlanningService {
  /**
   * Generates structured B.Tech project ideas based on branch, domain, and difficulty
   */
  public static async generateProjectIdeas(req: GenerateProjectIdeasRequest): Promise<ProjectIdea[]> {
    const domain = req.domain || 'AI/ML';
    const difficulty = req.difficulty || 'INTERMEDIATE';
    const projectType = req.project_type || 'MAJOR_PROJECT';
    const branch = req.branch || 'Computer Science & Engineering';

    const prompt = `You are a distinguished B.Tech Capstone Project Advisor and IEEE Faculty Mentor.
Generate 3 distinct, academically rigorous, and practical ${projectType} ideas for a B.Tech student in "${branch}".
Target Domain: "${domain}"
Target Difficulty: "${difficulty}"
${req.preferred_technologies ? `Preferred Technologies: ${req.preferred_technologies.join(', ')}` : ''}
${req.time_available_weeks ? `Time Horizon: ${req.time_available_weeks} weeks` : ''}

Strict Output Format Requirements:
Return ONLY a valid JSON array of project ideas matching this exact schema:
[
  {
    "title": "Clear, technical project title",
    "problem": "Clear problem statement identifying the technical or real-world challenge",
    "solution": "Technical solution proposed with methodology",
    "users": "Target users / beneficiaries",
    "features": ["3 to 5 core functional engineering features"],
    "technologies": [
      {"category": "FRONTEND"|"BACKEND"|"DATABASE"|"AI"|"API"|"DEPLOYMENT", "name": "e.g. React 19 / FastAPI / PyTorch"}
    ],
    "difficulty": "${difficulty}",
    "estimated_scope": "e.g. 12-16 weeks for a 3-student team"
  }
]`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.5
      );
      const parsed = this.parseJsonArray(response.text);
      if (parsed && parsed.length > 0) {
        return parsed as ProjectIdea[];
      }
    } catch (err: any) {
      logger.warn('AI idea generation fallback triggered', { error: err.message });
    }

    // Deterministic fallback project ideas tailored to the domain
    return this.getFallbackIdeas(domain, difficulty);
  }

  /**
   * Generates a structured multi-phase plan (Milestones, Modules, Tasks) for a project
   */
  public static async generateProjectPlan(
    projectId: string,
    studentId: string,
    req?: GeneratePlanRequest
  ): Promise<{
    phases: { name: string; description: string; weeks: number }[];
    milestones: { title: string; description: string; target_week: number }[];
    modules: { name: string; description: string; purpose: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' }[];
    tasks: {
      module_name: string;
      title: string;
      description: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      estimated_hours: number;
    }[];
  }> {
    const project = await ProjectService.getProject(projectId, studentId);
    const technologies = await db.getProjectTechnologies(projectId);
    const techList = technologies.map((t) => `${t.technology} (${t.category})`).join(', ');

    const prompt = `You are a Senior Technical Project Architect for university engineering capstone projects.
Generate a structured, execution-ready engineering plan for the following B.Tech project:
Title: "${project.title}"
Type: "${project.project_type}"
Domain: "${project.domain}"
Problem: "${project.problem_statement}"
Existing Technologies: "${techList || 'Standard modern stack'}"
${req?.focus_area ? `Special Focus Area: "${req.focus_area}"` : ''}

Strict Output Format:
Return ONLY a valid JSON object matching this schema:
{
  "phases": [
    {"name": "Phase 1: Research & Problem Formalization", "description": "...", "weeks": 2},
    {"name": "Phase 2: Architecture & Schema Design", "description": "...", "weeks": 3},
    {"name": "Phase 3: Core Engine & Model Implementation", "description": "...", "weeks": 5},
    {"name": "Phase 4: Client Integration & API Triage", "description": "...", "weeks": 3},
    {"name": "Phase 5: Verification, Benchmarking & Documentation", "description": "...", "weeks": 3}
  ],
  "milestones": [
    {"title": "Project Synopsis & IEEE SRS Approval", "description": "...", "target_week": 2},
    {"title": "Data Pipeline & Architecture Verification", "description": "...", "target_week": 5},
    {"title": "Core Module MVP Execution", "description": "...", "target_week": 10},
    {"title": "Final Viva Presentation & Project Report", "description": "...", "target_week": 16}
  ],
  "modules": [
    {"name": "Module Name", "description": "...", "purpose": "...", "priority": "HIGH"|"MEDIUM"|"LOW"}
  ],
  "tasks": [
    {"module_name": "Matching Module Name", "title": "Specific technical task", "description": "...", "priority": "HIGH"|"MEDIUM"|"LOW", "estimated_hours": 8}
  ]
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.4
      );
      const parsed = this.parseJsonObject(response.text);
      if (parsed && Array.isArray(parsed.phases) && Array.isArray(parsed.modules)) {
        return parsed;
      }
    } catch (err: any) {
      logger.warn('AI plan generation fallback triggered', { error: err.message });
    }

    return this.getFallbackPlan(project);
  }

  /**
   * Applies a generated plan by creating modules, tasks, and milestones in the project
   */
  public static async applyGeneratedPlan(
    projectId: string,
    studentId: string,
    plan: {
      milestones: { title: string; description: string }[];
      modules: { name: string; description: string; purpose?: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' }[];
      tasks: {
        module_name: string;
        title: string;
        description: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        estimated_hours?: number;
      }[];
    }
  ): Promise<{ modulesCreated: number; tasksCreated: number; milestonesCreated: number }> {
    await ProjectService.getProject(projectId, studentId);

    // 1. Create Milestones
    for (let i = 0; i < plan.milestones.length; i++) {
      const m = plan.milestones[i];
      const targetDate = new Date(Date.now() + (i + 1) * 14 * 24 * 3600 * 1000)
        .toISOString()
        .split('T')[0];
      await ProjectModuleTaskService.createMilestone(projectId, studentId, {
        title: m.title,
        description: m.description,
        target_date: targetDate,
        status: 'UPCOMING',
        order_index: i + 1,
      });
    }

    // 2. Create Modules and map names to IDs
    const moduleMap = new Map<string, string>();
    for (let i = 0; i < plan.modules.length; i++) {
      const mod = plan.modules[i];
      const createdMod = await ProjectModuleTaskService.createModule(projectId, studentId, {
        name: mod.name,
        description: mod.description,
        purpose: mod.purpose || mod.description,
        priority: mod.priority || 'MEDIUM',
        status: 'TODO',
        order_index: i + 1,
      });
      moduleMap.set(mod.name.toLowerCase().trim(), createdMod.id);
    }

    // 3. Create Tasks
    let taskCount = 0;
    for (let i = 0; i < plan.tasks.length; i++) {
      const t = plan.tasks[i];
      const modId = moduleMap.get(t.module_name.toLowerCase().trim());
      await ProjectModuleTaskService.createTask(projectId, studentId, {
        module_id: modId,
        title: t.title,
        description: t.description,
        priority: t.priority || 'MEDIUM',
        status: 'TODO',
        estimated_hours: t.estimated_hours || 8,
        order_index: i + 1,
      });
      taskCount++;
    }

    await ProjectService.logActivity(
      projectId,
      studentId,
      'PROJECT_CREATED',
      `Applied structured plan with ${plan.modules.length} modules and ${taskCount} tasks.`
    );

    return {
      modulesCreated: plan.modules.length,
      tasksCreated: taskCount,
      milestonesCreated: plan.milestones.length,
    };
  }

  /**
   * Generates AI Architecture Graph (Nodes and Edges)
   */
  public static async generateArchitecture(
    projectId: string,
    studentId: string
  ): Promise<ProjectArchitecture> {
    const project = await ProjectService.getProject(projectId, studentId);
    const tech = await db.getProjectTechnologies(projectId);
    const modules = await db.getProjectModules(projectId);

    const prompt = `You are a Lead Software Architect.
Generate a comprehensive system architecture diagram for the following project:
Title: "${project.title}"
Domain: "${project.domain}"
Problem: "${project.problem_statement}"
Technologies: ${tech.map((t) => t.technology).join(', ') || 'React, Node, PostgreSQL'}
Modules: ${modules.map((m) => m.name).join(', ') || 'Auth, Core Engine, Database'}

Return ONLY a valid JSON object matching this schema:
{
  "architecture_type": "e.g. Microservices / Layered / Event-Driven",
  "description": "2-3 sentences explaining architectural choices and throughput considerations",
  "data_flow": "Step-by-step data flow path from client request to persistence and AI inference",
  "nodes": [
    {
      "id": "node_1",
      "name": "Component Name",
      "type": "FRONTEND"|"BACKEND"|"DATABASE"|"AI"|"SERVICE"|"EXTERNAL_API"|"STORAGE"|"USER",
      "description": "Component purpose",
      "position": {"x": 100, "y": 150}
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source_node": "node_1",
      "target_node": "node_2",
      "label": "Protocol / payload (e.g. HTTPS / REST JSON)"
    }
  ]
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.4
      );
      const parsed = this.parseJsonObject(response.text);
      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        return ProjectArchitectureService.saveArchitecture(projectId, studentId, {
          architecture_type: parsed.architecture_type,
          description: parsed.description,
          data_flow: parsed.data_flow,
          nodes: parsed.nodes.map((n: any, idx: number) => ({
            ...n,
            id: n.id || `node_${idx + 1}`,
            project_id: projectId,
            position: n.position || { x: 100 + (idx % 3) * 200, y: 100 + Math.floor(idx / 3) * 120 },
          })),
          edges: parsed.edges.map((e: any, idx: number) => ({
            ...e,
            id: e.id || `edge_${idx + 1}`,
            project_id: projectId,
          })),
        });
      }
    } catch (err: any) {
      logger.warn('AI architecture generation fallback', { error: err.message });
    }

    return ProjectArchitectureService.initializeDefaultArchitecture(projectId);
  }

  /**
   * Scope Analysis (MoSCoW matrix: Must Have, Should Have, Could Have, Future)
   */
  public static async analyzeProjectScope(
    projectId: string,
    studentId: string
  ): Promise<{
    must_have: string[];
    should_have: string[];
    could_have: string[];
    future: string[];
    scope_verdict: string;
    recommendation: string;
  }> {
    const project = await ProjectService.getProject(projectId, studentId);
    const modules = await db.getProjectModules(projectId);

    const prompt = `You are an academic project committee auditor.
Analyze the scope and feasibility of this B.Tech project:
Title: "${project.title}"
Domain: "${project.domain}"
Type: "${project.project_type}"
Problem: "${project.problem_statement}"
Modules: ${modules.map((m) => m.name).join(', ')}

Categorize features into the MoSCoW framework to prevent scope creep.
Return ONLY a valid JSON object:
{
  "must_have": ["Core foundational features mandatory for capstone viva demo"],
  "should_have": ["Important features that provide high academic/engineering value"],
  "could_have": ["Nice-to-have optimizations if time permits"],
  "future": ["Post-capstone production or commercial extensions"],
  "scope_verdict": "FEASIBLE" | "AMBITIOUS" | "OVER_SCOPED",
  "recommendation": "Concise guidance on pacing and scope bounding"
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const parsed = this.parseJsonObject(response.text);
      if (parsed && Array.isArray(parsed.must_have)) {
        return parsed;
      }
    } catch (err: any) {
      logger.warn('AI scope analysis fallback', { error: err.message });
    }

    return {
      must_have: [
        'Core functional engine and model inference pipeline',
        'Authenticated user access with input validation',
        'Database persistence and relational schema integrity',
      ],
      should_have: [
        'Real-time status updates and telemetry charts',
        'Exportable analytical reports and diagnostic summaries',
      ],
      could_have: [
        'Dark mode toggle and customizable clinician widgets',
        'Automated model retraining pipeline',
      ],
      future: [
        'Multi-hospital federated learning deployment',
        'Mobile application companion for iOS/Android',
      ],
      scope_verdict: 'FEASIBLE',
      recommendation:
        'Scope is balanced for a capstone semester. Focus on delivering the Must Have pipeline before embarking on optional UI extras.',
    };
  }

  /**
   * Risk Analysis (Technical, Schedule, Resource, Data, Security)
   */
  public static async analyzeProjectRisks(
    projectId: string,
    studentId: string
  ): Promise<{
    risks: {
      category: 'TECHNICAL' | 'SCHEDULE' | 'RESOURCE' | 'SECURITY' | 'DATA' | 'DEPENDENCY';
      risk: string;
      probability: 'LOW' | 'MEDIUM' | 'HIGH';
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      mitigation: string;
    }[];
    overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigation_strategy: string;
  }> {
    const project = await ProjectService.getProject(projectId, studentId);
    const tech = await db.getProjectTechnologies(projectId);

    const prompt = `You are a Senior Project Risk Assessor.
Identify potential engineering risks and mitigation protocols for this B.Tech project:
Title: "${project.title}"
Domain: "${project.domain}"
Technologies: ${tech.map((t) => t.technology).join(', ')}

Return ONLY a valid JSON object:
{
  "risks": [
    {
      "category": "TECHNICAL"|"SCHEDULE"|"RESOURCE"|"SECURITY"|"DATA"|"DEPENDENCY",
      "risk": "Description of concrete risk",
      "probability": "LOW"|"MEDIUM"|"HIGH",
      "impact": "LOW"|"MEDIUM"|"HIGH",
      "mitigation": "Actionable engineering contingency"
    }
  ],
  "overall_risk_level": "LOW"|"MEDIUM"|"HIGH",
  "mitigation_strategy": "Summary guidance for managing project risk"
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const parsed = this.parseJsonObject(response.text);
      if (parsed && Array.isArray(parsed.risks)) {
        return parsed;
      }
    } catch (err: any) {
      logger.warn('AI risk analysis fallback', { error: err.message });
    }

    return {
      risks: [
        {
          category: 'TECHNICAL',
          risk: 'Integration latency between inference microservice and web client exceeding real-time requirements',
          probability: 'MEDIUM',
          impact: 'HIGH',
          mitigation: 'Implement Redis caching for recurrent predictions and optimize model with TensorRT quantization.',
        },
        {
          category: 'DATA',
          risk: 'Benchmark dataset distribution discrepancy leading to model degradation on novel test samples',
          probability: 'MEDIUM',
          impact: 'HIGH',
          mitigation: 'Enforce robust train-validation-test splitting with synthetic data augmentation and confidence scoring.',
        },
        {
          category: 'SCHEDULE',
          risk: 'Underestimating time required for FHIR/EHR protocol parsing and schema transformation',
          probability: 'LOW',
          impact: 'MEDIUM',
          mitigation: 'Utilize verified open-source FHIR Pydantic libraries instead of manual serialization.',
        },
      ],
      overall_risk_level: 'MEDIUM',
      mitigation_strategy:
        'Prioritize end-to-end telemetry pipeline benchmarking early in Phase 2 to resolve throughput bottlenecks before UI polish.',
    };
  }

  /**
   * Suggests technologies based on domain and project objectives
   */
  public static async suggestTechStack(
    projectId: string,
    studentId: string
  ): Promise<{
    suggestions: {
      category: TechnologyCategory;
      technology: string;
      reason: string;
      alternative: string;
    }[];
  }> {
    const project = await ProjectService.getProject(projectId, studentId);

    const prompt = `You are a Principal Tech Stack Consultant for university engineering projects.
Suggest modern, industry-standard, and student-accessible technologies for this project:
Title: "${project.title}"
Domain: "${project.domain}"
Type: "${project.project_type}"
Problem: "${project.problem_statement}"

Return ONLY a valid JSON object:
{
  "suggestions": [
    {
      "category": "FRONTEND"|"BACKEND"|"DATABASE"|"AI"|"API"|"DEPLOYMENT"|"TESTING",
      "technology": "e.g. React 19 + TypeScript",
      "reason": "Why this technology best fits the project objectives",
      "alternative": "Viable alternate option"
    }
  ]
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const parsed = this.parseJsonObject(response.text);
      if (parsed && Array.isArray(parsed.suggestions)) {
        return parsed;
      }
    } catch (err: any) {
      logger.warn('AI tech stack suggestion fallback', { error: err.message });
    }

    return {
      suggestions: [
        {
          category: 'FRONTEND',
          technology: 'React 19 + Vite + Tailwind CSS',
          reason: 'Component modularity, rich chart ecosystems, and rapid development speed.',
          alternative: 'Next.js / Vue 3',
        },
        {
          category: 'BACKEND',
          technology: 'FastAPI (Python)',
          reason: 'High async throughput, automatic OpenAPI documentation, and seamless PyTorch integration.',
          alternative: 'Express.js (Node.js)',
        },
        {
          category: 'DATABASE',
          technology: 'PostgreSQL + pgvector',
          reason: 'Rock-solid ACID compliance joined with native vector embeddings support.',
          alternative: 'MongoDB / Supabase',
        },
        {
          category: 'AI',
          technology: 'PyTorch + Hugging Face Transformers',
          reason: 'Industry standard for neural model development and transfer learning.',
          alternative: 'TensorFlow / Scikit-Learn',
        },
        {
          category: 'DEPLOYMENT',
          technology: 'Docker + Docker Compose',
          reason: 'Reproducible local containerization for examiner demonstration without environment conflicts.',
          alternative: 'AWS ECS / Render',
        },
      ],
    };
  }

  // --- Helper Parsers ---
  private static parseJsonArray(text: string): any[] | null {
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }

  private static parseJsonObject(text: string): any | null {
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }

  // --- Fallback Generators ---
  private static getFallbackIdeas(domain: string, difficulty: string): ProjectIdea[] {
    return [
      {
        title: `Adaptive ${domain} Telemetry & Predictive Optimization Engine`,
        problem: `Conventional systems suffer from reactive diagnostics and high operational latency in ${domain} pipelines.`,
        solution: `An end-to-end framework leveraging predictive neural networks and automated streaming anomaly detection.`,
        users: `Engineers, domain analysts, and system administrators`,
        features: [
          'Real-time ingestion and normalization pipeline',
          'Explainable AI feature attribution matrix',
          'Interactive monitoring dashboard with instant incident alerts',
          'Automated mitigation dispatch protocol',
        ],
        technologies: [
          { category: 'FRONTEND', name: 'React 19 + TypeScript' },
          { category: 'BACKEND', name: 'FastAPI / Python' },
          { category: 'DATABASE', name: 'PostgreSQL' },
          { category: 'AI', name: 'PyTorch / Scikit-Learn' },
        ],
        difficulty: difficulty as any,
        estimated_scope: '14 weeks (Capstone semester)',
      },
      {
        title: `Secure Federated ${domain} Analytics with Privacy-Preserving Cryptography`,
        problem: `Data privacy regulations impede cross-institutional data sharing and collaborative modeling in ${domain}.`,
        solution: `Federated learning protocol with differential privacy ensuring zero centralized raw data storage.`,
        users: `Institutions, security auditors, and researchers`,
        features: [
          'Decentralized node client agent with local model training',
          'Cryptographic model weight aggregation server',
          'Audit trail with tamper-evident logging',
        ],
        technologies: [
          { category: 'BACKEND', name: 'Python / Flower' },
          { category: 'FRONTEND', name: 'React Dashboard' },
          { category: 'DATABASE', name: 'TimescaleDB' },
        ],
        difficulty: 'ADVANCED',
        estimated_scope: '16 weeks (Major Project)',
      },
    ];
  }

  private static getFallbackPlan(project: any) {
    return {
      phases: [
        {
          name: 'Phase 1: Research & Problem Formulation',
          description: 'Literature review, problem statement formalization, and requirement gathering.',
          weeks: 2,
        },
        {
          name: 'Phase 2: Architectural & Schema Design',
          description: 'Database entity modeling, API contract specification, and system architecture blueprinting.',
          weeks: 3,
        },
        {
          name: 'Phase 3: Core Engine & Algorithm Development',
          description: 'Implementation of primary algorithms, machine learning models, and business logic services.',
          weeks: 5,
        },
        {
          name: 'Phase 4: Client Integration & API Triage',
          description: 'Frontend component building, real-time telemetry wiring, and integration testing.',
          weeks: 3,
        },
        {
          name: 'Phase 5: Verification, Benchmarking & Documentation',
          description: 'Performance testing, IEEE report compilation, and viva demonstration preparation.',
          weeks: 3,
        },
      ],
      milestones: [
        {
          title: 'Project Synopsis & Requirements Signoff',
          description: 'Finalize IEEE SRS and literature survey approval.',
          target_week: 2,
        },
        {
          title: 'Architecture & Prototype Data Flow Validation',
          description: 'Verified API contracts and working database connection pool.',
          target_week: 5,
        },
        {
          title: 'Core Engine Alpha Testing',
          description: 'End-to-end computational throughput tested against benchmark datasets.',
          target_week: 10,
        },
        {
          title: 'Final Capstone Report & Presentation Ready',
          description: 'Complete project documentation, slide deck, and working software demo.',
          target_week: 16,
        },
      ],
      modules: [
        {
          name: 'Authentication & Security',
          description: 'Role-based access control with secure token authentication.',
          purpose: 'Secure endpoints and protect user data.',
          priority: 'HIGH' as const,
        },
        {
          name: 'Core Engine & Ingestion',
          description: 'Primary computational pipeline and telemetry ingestion.',
          purpose: 'Execute the core algorithms of the project.',
          priority: 'HIGH' as const,
        },
        {
          name: 'User Dashboard & Visualizer',
          description: 'Interactive analytics dashboard and reporting interface.',
          purpose: 'Present data clearly to end users.',
          priority: 'MEDIUM' as const,
        },
      ],
      tasks: [
        {
          module_name: 'Authentication & Security',
          title: 'Implement JWT authentication and password hashing',
          description: 'Create login, registration, and token validation middleware.',
          priority: 'HIGH' as const,
          estimated_hours: 8,
        },
        {
          module_name: 'Core Engine & Ingestion',
          title: 'Build data validation and preprocessing pipeline',
          description: 'Validate input schemas and normalize data arrays.',
          priority: 'HIGH' as const,
          estimated_hours: 12,
        },
        {
          module_name: 'User Dashboard & Visualizer',
          title: 'Develop responsive analytics charts and triage alerts',
          description: 'Build chart components and wire into backend API responses.',
          priority: 'MEDIUM' as const,
          estimated_hours: 10,
        },
      ],
    };
  }
}
