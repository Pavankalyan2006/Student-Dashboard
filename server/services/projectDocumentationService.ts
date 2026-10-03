import { AIService } from '../ai/service';
import { db } from '../db/database';
import {
  ProjectDocument,
  ProjectDocumentType,
  GenerateDocumentationRequest,
} from '../models/projectTypes';
import { ProjectService } from './projectService';
import { logger } from '../core/logging';

export class ProjectDocumentationService {
  /**
   * Get all documentation artifacts for a project
   */
  public static async getDocuments(
    projectId: string,
    studentId: string
  ): Promise<ProjectDocument[]> {
    await ProjectService.getProject(projectId, studentId);
    return db.getProjectDocuments(projectId);
  }

  /**
   * Get a specific document
   */
  public static async getDocument(
    projectId: string,
    studentId: string,
    documentId: string
  ): Promise<ProjectDocument> {
    await ProjectService.getProject(projectId, studentId);
    const doc = await db.getProjectDocumentById(projectId, documentId);
    if (!doc) {
      throw new Error(`Project document with ID '${documentId}' not found`);
    }
    return doc;
  }

  /**
   * Create or update a document manually
   */
  public static async saveDocument(
    projectId: string,
    studentId: string,
    data: {
      id?: string;
      document_type: ProjectDocumentType;
      title: string;
      content: string;
      status?: 'DRAFT' | 'REVIEW' | 'FINAL';
    }
  ): Promise<ProjectDocument> {
    await ProjectService.getProject(projectId, studentId);
    const existing = data.id ? await db.getProjectDocumentById(projectId, data.id) : null;
    const now = new Date().toISOString();

    const document: ProjectDocument = {
      id: existing?.id || data.id || `doc_proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      document_type: data.document_type,
      title: data.title,
      content: data.content,
      version: existing ? existing.version + 1 : 1,
      status: data.status || existing?.status || 'DRAFT',
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    await db.saveProjectDocument(document);
    await ProjectService.logActivity(
      projectId,
      studentId,
      'DOCUMENTATION_GENERATED',
      `Saved document "${document.title}" (${document.document_type} v${document.version}).`
    );

    return document;
  }

  /**
   * Delete a document
   */
  public static async deleteDocument(
    projectId: string,
    studentId: string,
    documentId: string
  ): Promise<boolean> {
    await ProjectService.getProject(projectId, studentId);
    await db.deleteProjectDocument(projectId, documentId);
    return true;
  }

  /**
   * AI Documentation Generator
   * Generates grounded, academic-grade project documentation without fabricating results
   */
  public static async generateDocument(
    projectId: string,
    studentId: string,
    req: GenerateDocumentationRequest
  ): Promise<ProjectDocument> {
    const project = await ProjectService.getProject(projectId, studentId);
    const tech = await db.getProjectTechnologies(projectId);
    const modules = await db.getProjectModules(projectId);
    const tasks = await db.getProjectTasks(projectId);
    const architecture = await db.getProjectArchitecture(projectId);
    const requirements = await db.getProjectRequirements(projectId);

    const completedTasks = tasks.filter((t) => t.status === 'DONE');
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');

    const prompt = this.buildPrompt({
      docType: req.document_type,
      project,
      tech,
      modules,
      completedTasks,
      inProgressTasks,
      architecture,
      requirements,
      customInstructions: req.custom_instructions,
    });

    let generatedContent = '';
    let generatedTitle = `${this.getDocumentTypeLabel(req.document_type)} — ${project.title}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      if (response.text && !response.text.includes('Balanced Search Trees')) {
        generatedContent = response.text.trim();
      } else {
        generatedContent = this.getFallbackDocumentContent(req.document_type, project, modules, tech);
      }
    } catch (err: any) {
      logger.warn('AI documentation generation fallback triggered', { error: err.message });
      generatedContent = this.getFallbackDocumentContent(req.document_type, project, modules, tech);
    }

    // Persist as a new or updated document
    const existing = (await db.getProjectDocuments(projectId)).find(
      (d) => d.document_type === req.document_type
    );

    const doc = await this.saveDocument(projectId, studentId, {
      id: existing?.id,
      document_type: req.document_type,
      title: generatedTitle,
      content: generatedContent,
      status: 'REVIEW',
    });

    return doc;
  }

  // --- Prompt Builder ---
  private static buildPrompt(ctx: {
    docType: ProjectDocumentType;
    project: any;
    tech: any[];
    modules: any[];
    completedTasks: any[];
    inProgressTasks: any[];
    architecture: any;
    requirements: any[];
    customInstructions?: string;
  }): string {
    const { docType, project, tech, modules, completedTasks, inProgressTasks, architecture, requirements, customInstructions } = ctx;

    const baseContext = `
Project Title: "${project.title}"
Domain: "${project.domain}"
Type: "${project.project_type}"
Problem Statement: "${project.problem_statement}"
Objectives: ${project.objectives.join('; ')}
Target Users: "${project.target_users}"
Technologies: ${tech.map((t: any) => `${t.technology} (${t.category})`).join(', ') || 'Standard web stack'}
Modules: ${modules.map((m: any) => `${m.name}: ${m.description}`).join('; ')}
Completed Tasks (${completedTasks.length}): ${completedTasks.map((t: any) => t.title).join(', ') || 'None yet'}
In-Progress Tasks (${inProgressTasks.length}): ${inProgressTasks.map((t: any) => t.title).join(', ') || 'None yet'}
Architecture Type: "${architecture?.architecture_type || 'Layered Architecture'}"
Requirements Count: ${requirements.length}
${customInstructions ? `Special Student Instructions: "${customInstructions}"` : ''}

CRITICAL ACADEMIC INTEGRITY RULES:
1. Use real project facts provided above. Do NOT fabricate completed test outcomes, benchmark accuracy numbers, or clinical test metrics unless substantiated in the project data.
2. If empirical test results or deployment metrics are not yet available, mark them explicitly as "[To be completed during testing phase]" rather than hallucinating false claims.
3. Write clean, professional Markdown with proper headings (##, ###), bullet lists, and KaTeX mathematical notation where relevant.
`;

    switch (docType) {
      case 'ABSTRACT':
        return `You are an IEEE Academic Editor. Generate a formal, publication-ready Academic Abstract (300-450 words) for this B.Tech capstone project.
${baseContext}
Include:
- Background and Motivation
- Problem Statement
- Proposed System Methodology & Architecture
- Current Implementation Status
- Technical Significance and Future Potential`;

      case 'SRS':
        return `You are a Principal Systems Engineer. Generate an IEEE 830-compliant Software Requirements Specification (SRS) for this project.
${baseContext}
Sections required:
1. Introduction (Purpose, Document Conventions, Intended Audience, Project Scope)
2. Overall Description (Product Perspective, User Classes, Operating Environment, Design Constraints)
3. Specific Requirements:
   3.1 Functional Requirements (derive FR-1, FR-2, etc. directly from modules and objectives)
   3.2 External Interface Requirements (User, Hardware, Software, Communications)
   3.3 Non-Functional Requirements (Performance, Security, Availability, Maintainability)
4. Verification & Validation Matrix`;

      case 'REPORT':
        return `You are a Senior Faculty Capstone Evaluator. Generate a comprehensive Academic Project Report outline and chapters.
${baseContext}
Sections required:
# Chapter 1: Introduction (Background, Problem Statement, Objectives, Scope)
# Chapter 2: Literature Survey (Current State of the Art, Comparative Analysis)
# Chapter 3: System Design & Architecture (High-level architecture, Component details, Data flow)
# Chapter 4: Module Description & Workflows (Detailed breakdown of each module)
# Chapter 5: Implementation Details (Tech stack rationale, Core algorithms)
# Chapter 6: Testing & Validation (Test strategy, Test cases, [To be completed] for pending runs)
# Chapter 7: Conclusion & Future Scope (Summary, Limitations, Enhancements)
# References (Standard academic citation format)`;

      case 'ARCHITECTURE':
        return `You are a Chief Software Architect. Generate a formal System Architecture Explanation document.
${baseContext}
Detail:
- Architecture style rationale (${architecture?.architecture_type || 'Layered'})
- Client-Server and API interactions
- Database Schema and Data Persistence Flow
- Security and Authentication boundaries
- Scalability and Latency mitigations`;

      case 'MODULE_DOCUMENTATION':
        return `You are a Lead Software Engineer. Generate in-depth Module Documentation for each module in the project.
${baseContext}
For each module (${modules.map((m: any) => m.name).join(', ')}):
- Purpose and Scope
- Input Data & Output Contracts
- Workflow and Algorithm Logic
- Error Handling and Edge Cases
- Unit Testing approach`;

      case 'TEST_PLAN':
        return `You are a Quality Assurance Lead. Generate a structured Software Test Plan for this project.
${baseContext}
Generate a Markdown table with columns:
| Test ID | Module | Test Scenario | Input Data | Expected Result | Status |
Include Unit, Integration, and Security test scenarios. Mark unexecuted tests as "PENDING" or "[To be completed]".`;

      case 'PRESENTATION_CONTENT':
        return `You are an Academic Presentation Coach. Generate a slide-by-slide presentation script for the student's Capstone Viva Defense.
${baseContext}
Generate 10 to 12 structured slides:
Slide 1: Title & Team
Slide 2: Problem Statement & Real-world Motivation
Slide 3: Literature Survey & Gap Analysis
Slide 4: Proposed System Objectives
Slide 5: System Architecture & Data Flow
Slide 6: Technology Stack Rationale
Slide 7: Module Implementation Breakdown
Slide 8: Key Algorithms & Logic
Slide 9: Demonstration Walkthrough
Slide 10: Testing & Verification Matrix
Slide 11: Limitations & Future Enhancements
Slide 12: Conclusion & Q&A
For each slide, provide: Slide Title, Key Bullet Points, and Speaker Notes.`;

      default:
        return `Generate technical documentation for the following project:
${baseContext}`;
    }
  }

  private static getDocumentTypeLabel(type: ProjectDocumentType): string {
    const labels: Record<ProjectDocumentType, string> = {
      ABSTRACT: 'Academic Abstract',
      SRS: 'Software Requirements Specification (SRS)',
      REPORT: 'Comprehensive Project Report',
      ARCHITECTURE: 'System Architecture Specification',
      MODULE_DOCUMENTATION: 'Detailed Module Documentation',
      TEST_PLAN: 'Quality Assurance Test Plan',
      PRESENTATION_CONTENT: 'Viva Defense Slide Script',
      OTHER: 'Technical Document',
    };
    return labels[type] || 'Technical Document';
  }

  private static getFallbackDocumentContent(
    type: ProjectDocumentType,
    project: any,
    modules: any[],
    tech: any[]
  ): string {
    return `# ${this.getDocumentTypeLabel(type)}
## ${project.title}

### 1. Project Overview
- **Domain**: ${project.domain}
- **Project Type**: ${project.project_type}
- **Target Audience**: ${project.target_users}

### 2. Problem Statement
${project.problem_statement || 'Standard engineering challenge in ' + project.domain}

### 3. Objectives
${project.objectives.map((o: string) => `- ${o}`).join('\n')}

### 4. Technical Architecture & Modules
The system implements a modular architecture composed of:
${modules.map((m: any) => `- **${m.name}**: ${m.description}`).join('\n')}

### 5. Technology Stack
${tech.map((t: any) => `- **${t.category}**: ${t.technology}`).join('\n')}

### 6. Verification Status
Test cases and experimental benchmarks are currently: [To be completed during testing phase].`;
  }
}
