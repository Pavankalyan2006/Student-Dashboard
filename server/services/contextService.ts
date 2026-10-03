import { db } from '../db/database';
import {
  AIContextItem,
  ContextType,
  SourceProvenanceItem,
} from '../models/researchGitHubTypes';
import { logger } from '../core/logging';

export class ContextService {
  /**
   * Resolve and hydrate real verified content for selected context items
   */
  public static async resolveContextItems(
    studentId: string,
    items: AIContextItem[]
  ): Promise<SourceProvenanceItem[]> {
    const results: SourceProvenanceItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let snippet = item.snippet || '';
      let url = '';
      let pageOrPath = '';

      try {
        switch (item.type) {
          case 'RESEARCH_PAPER': {
            const paper = await db.getResearchPaperById(item.reference_id, studentId);
            if (paper) {
              snippet = `Paper: "${paper.title}" (${paper.publication_year}, ${paper.venue}). Abstract: ${paper.abstract.substring(0, 200)}...`;
              url = `/research/${paper.research_project_id}/papers`;
              pageOrPath = paper.doi ? `DOI: ${paper.doi}` : paper.venue;
            }
            break;
          }
          case 'RESEARCH_PROJECT': {
            const proj = await db.getResearchProjectById(item.reference_id, studentId);
            if (proj) {
              snippet = `Research Project: "${proj.title}" in ${proj.domain}. Objective: ${proj.objective}`;
              url = `/research/${proj.id}`;
            }
            break;
          }
          case 'GITHUB_REPO': {
            const repo = await db.getGitHubRepositoryById(item.reference_id, studentId);
            if (repo) {
              snippet = `Repository: ${repo.full_name} (${repo.language}). Description: ${repo.description}`;
              url = `/github/repo/${repo.id}`;
            }
            break;
          }
          case 'GITHUB_FILE': {
            // reference_id format: repoId:path
            const [repoId, filePath] = item.reference_id.split(':');
            const file = await db.getGitHubRepositoryFileByPath(repoId, filePath || item.reference_id, studentId);
            if (file) {
              snippet = `File: ${file.path} (${file.size} bytes). Preview: ${(file.content || '').substring(0, 180)}...`;
              url = `/github/repo/${repoId}/files`;
              pageOrPath = file.path;
            }
            break;
          }
          case 'PROJECT': {
            const project = await db.getProjectById(item.reference_id);
            if (project && project.student_id === studentId) {
              snippet = `Student Project: "${project.title}" (${project.project_type}). Domain: ${project.domain}`;
              url = `/projects`;
            }
            break;
          }
          case 'COURSE': {
            const course = await db.getCourseById(item.reference_id);
            if (course) {
              snippet = `Course: "${course.title}". Description: ${course.description}`;
              url = `/courses/${course.id}`;
            }
            break;
          }
          case 'DOCUMENT': {
            const doc = await db.getDocumentById(item.reference_id);
            if (doc && doc.student_id === studentId) {
              snippet = `Document: "${doc.title}" (${doc.page_count} pages). ${doc.description || doc.original_filename}`;
              url = `/documents`;
            }
            break;
          }
          case 'NOTE': {
            const note = await db.getNoteById(item.reference_id);
            if (note && note.student_id === studentId) {
              snippet = `Note: "${note.title}". Tags: ${note.tags.join(', ')}`;
              url = `/notes`;
            }
            break;
          }
          case 'RESUME': {
            const resume = await db.getResumeById(item.reference_id, studentId);
            if (resume) {
              snippet = `Resume: "${resume.title}" (Target Role: ${resume.target_role})`;
              url = `/resume/${resume.id}`;
            }
            break;
          }
          case 'SKILL_PROFILE': {
            const skills = await db.getStudentSkills(studentId);
            snippet = `Student Skill Profile: ${skills.length} tracked skills across platform competencies.`;
            url = `/skills`;
            break;
          }
          default:
            snippet = item.snippet || item.title;
        }
      } catch (err: any) {
        logger.warn('Failed to resolve context item', { context: { type: item.type, ref: item.reference_id, error: err.message } });
      }

      results.push({
        citation_number: i + 1,
        source_type: item.type,
        source_id: item.reference_id,
        title: item.title,
        url,
        page_or_path: pageOrPath,
        snippet,
      });
    }

    return results;
  }

  /**
   * Build multi-source composite prompt with clear context boundaries and numbered provenance
   */
  public static async buildMultiSourcePrompt(
    studentId: string,
    userQuery: string,
    contextItems: AIContextItem[]
  ): Promise<{ prompt: string; provenance: SourceProvenanceItem[]; citations: SourceProvenanceItem[] }> {
    const provenance = await this.resolveContextItems(studentId, contextItems);

    let prompt = `SYSTEM INSTRUCTIONS: You are the AI Learning and Research Agent.
The student has queried you with multi-source context. You must reason across all provided verified sources.

CRITICAL INSTRUCTIONS:
1. Rely ONLY on the verified context below and standard academic facts.
2. DO NOT invent citations, paper titles, file contents, or metrics.
3. When referencing information from a source, attribute it with a numbered citation like [1], [2], etc.
4. Keep the explanation rigorous, clear, and educational for an undergraduate engineering student.

TRUSTED MULTI-SOURCE CONTEXT:
`;

    provenance.forEach((p) => {
      prompt += `[${p.citation_number}] ${p.source_type}: ${p.title}
Reference: ${p.page_or_path || p.url || p.source_id}
Content Snippet: ${p.snippet}

`;
    });

    prompt += `=== STUDENT QUERY ===
${userQuery}

Provide a structured, evidence-grounded response with explicit citation references.`;

    return { prompt, provenance, citations: provenance };
  }
}
