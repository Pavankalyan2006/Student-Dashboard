import { AIService } from '../ai/service';
import { db } from '../db/database';
import { DocumentRetrievalService } from '../rag/retriever';
import { ProjectService } from './projectService';
import { logger } from '../core/logging';

export class ProjectAIService {
  /**
   * Project Context-Aware AI Assistant
   */
  public static async askProjectAI(
    projectId: string,
    studentId: string,
    question: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{ response: string; references?: { title: string; type: string }[] }> {
    const project = await ProjectService.getProject(projectId, studentId);
    const tech = await db.getProjectTechnologies(projectId);
    const modules = await db.getProjectModules(projectId);
    const tasks = await db.getProjectTasks(projectId);
    const arch = await db.getProjectArchitecture(projectId);
    const reqs = await db.getProjectRequirements(projectId);
    const risks = await db.getProjectRisks(projectId);

    // Optional RAG retrieval if student mentions literature, documents, or research
    let ragContext = '';
    const references: { title: string; type: string }[] = [];

    if (
      question.toLowerCase().includes('document') ||
      question.toLowerCase().includes('paper') ||
      question.toLowerCase().includes('literature') ||
      question.toLowerCase().includes('research') ||
      question.toLowerCase().includes('pdf')
    ) {
      try {
        const chunks = await DocumentRetrievalService.retrieve({
          studentId,
          query: question,
          topK: 3,
        });
        if (chunks.length > 0) {
          ragContext = `\nRelevant Uploaded Document Excerpts:\n${chunks
            .map(
              (c) =>
                `[Document Ref: ${c.document_id}, Page ${c.page_number}]:\n"${c.content.substring(0, 300)}..."`
            )
            .join('\n\n')}`;

          chunks.forEach((c) => {
            const refTitle = `Document ${c.document_id} (Page ${c.page_number})`;
            if (!references.some((r) => r.title === refTitle)) {
              references.push({ title: refTitle, type: 'DOCUMENT' });
            }
          });
        }
      } catch (err: any) {
        logger.warn('Project AI RAG retrieval non-fatal error', { error: err.message });
      }
    }

    const systemPrompt = `You are the Dedicated AI Project Advisor and Engineering Mentor for the B.Tech project: "${project.title}".
Your purpose is to assist the student in architecture design, algorithm implementation, code debugging, and university project defense preparation.

PROJECT CONTEXT:
- Domain: ${project.domain}
- Type: ${project.project_type}
- Status: ${project.status} (${project.progress_percentage}% completed)
- Problem: ${project.problem_statement}
- Objectives: ${project.objectives.join('; ')}
- Tech Stack: ${tech.map((t) => `${t.technology} (${t.category})`).join(', ') || 'Standard Web Stack'}
- Modules (${modules.length}): ${modules.map((m) => `${m.name} [${m.status}]`).join(', ')}
- Pending Tasks: ${tasks.filter((t) => t.status !== 'DONE').map((t) => t.title).slice(0, 5).join(', ') || 'All tasks completed'}
- Architecture Style: ${arch?.architecture_type || 'Layered Architecture'}
- Requirements (${reqs.length}): ${reqs.slice(0, 3).map((r) => r.title).join('; ')}
- Identified Risks: ${risks.map((r) => r.risk).join('; ')}
${ragContext}

GUIDELINES:
1. Always ground your technical answers in the project's actual technology stack (${tech.map((t) => t.technology).join(', ') || 'defined stack'}).
2. For code questions, provide type-safe, modular examples with explanations.
3. Be encouraging, educational, and structured using clean Markdown headings, code blocks, and bullet points.
4. When suggesting new modules or features, respect project scope boundaries.`;

    const messages = [
      { role: 'user' as const, content: systemPrompt },
      ...history.slice(-4),
      { role: 'user' as const, content: question },
    ];

    try {
      const response = await AIService.generate(messages, 'student_learning_agent', 0.5);
      return {
        response: response.text,
        references,
      };
    } catch (err: any) {
      logger.warn('Project AI generation fallback', { error: err.message });
      return {
        response: `As your project mentor for **${project.title}**, I recommend focusing on your next task: "${tasks.find((t) => t.status !== 'DONE')?.title || 'Module Integration'}". Ensure your API contracts align with your ${tech.find((t) => t.category === 'BACKEND')?.technology || 'Backend'} implementation.`,
        references,
      };
    }
  }

  /**
   * Generates structured notes for a project and saves them into the Notes system (Phase 5)
   */
  public static async generateProjectNotes(
    projectId: string,
    studentId: string,
    noteType: 'ARCHITECTURE' | 'RESEARCH' | 'MEETING' | 'VIVA_PREP' = 'ARCHITECTURE'
  ): Promise<any> {
    const project = await ProjectService.getProject(projectId, studentId);
    const tech = await db.getProjectTechnologies(projectId);
    const modules = await db.getProjectModules(projectId);
    const arch = await db.getProjectArchitecture(projectId);

    const title = `${noteType === 'VIVA_PREP' ? 'Viva Defense Notes' : noteType === 'ARCHITECTURE' ? 'Architecture Blueprint Notes' : 'Project Research Notes'} — ${project.title}`;
    const topic = `${project.title} (${project.domain})`;

    // Generate markdown content
    const content = `# ${title}
## Project: ${project.title} (${project.project_type})

### Problem Statement & Domain
**Domain**: ${project.domain}
${project.problem_statement}

### Core Objectives
${project.objectives.map((o) => `- ${o}`).join('\n')}

### Architecture & Tech Stack Rationale
- **Architecture Type**: ${arch?.architecture_type || 'Layered Architecture'}
- **Data Flow**: ${arch?.data_flow || 'Client -> Server -> Database'}

**Key Technologies:**
${tech.map((t) => `- **${t.category}**: \`${t.technology}\` — ${t.reason || 'Core dependency'}`).join('\n')}

### Modules Overview
${modules.map((m) => `#### ${m.name} (${m.priority} Priority - Status: ${m.status})\n${m.description}\n**Purpose**: ${m.purpose}`).join('\n\n')}

### Key Viva Questions & Explanations
1. **Why did you choose this architecture over alternatives?**
   - Provides horizontal scalability, decoupled microservices, and independent service deployments.
2. **How does the system ensure data integrity and security?**
   - Secure token authentication, database ACID transactions, and validated schema contracts.
3. **What was the most challenging technical hurdle?**
   - Interfacing asynchronous data streams while maintaining low latency and deterministic failure recovery.`;

    // Save directly into database Notes store
    const createdNote = await db.createNote({
      student_id: studentId,
      title,
      description: `Project notes for ${project.title}`,
      source_type: 'topic',
      source_id: projectId,
      source_title: project.title,
      note_type: 'STUDY_NOTES',
      level: 'ADVANCED',
      length: 'MEDIUM',
      content,
      tags: [project.domain, 'Project', noteType],
      is_favorite: false,
    });

    await ProjectService.logActivity(
      projectId,
      studentId,
      'DOCUMENTATION_GENERATED',
      `Exported project notes to Notes workspace: "${title}".`
    );

    return createdNote;
  }
}
