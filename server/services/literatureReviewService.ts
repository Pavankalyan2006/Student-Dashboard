import { db } from '../db/database';
import { LiteratureReview, LiteratureReviewSection, ResearchPaper, ResearchCitation } from '../models/researchGitHubTypes';
import { ResearchService } from './researchService';
import { AIService } from '../ai/service';
import { isModelAvailable, parseModelJson, rethrowAi } from '../ai/modelOutput';
import { AppError } from '../core/exceptions';
import { NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export class LiteratureReviewService {
  /**
   * Generate an academically rigorous, citation-grounded literature review based solely on verified project papers
   */
  public static async generateLiteratureReview(
    projectId: string,
    studentId: string,
    options:
      | string
      | {
          organizationStrategy?: 'THEMATIC' | 'METHODOLOGICAL' | 'CHRONOLOGICAL' | string;
          targetWordCount?: number;
        } = {}
  ): Promise<LiteratureReview> {
    const project = await ResearchService.getProject(projectId, studentId);
    // Only the papers saved in this project are used (no fallback to papers of another project).
    const papers = await ResearchService.listPapers(projectId, studentId);
    const citations = await ResearchService.listCitations(projectId, studentId);

    if (papers.length === 0) {
      throw new NotFoundError('Cannot generate a literature review without any saved research papers in the project');
    }

    const citationMap = new Map(citations.map((c) => [c.paper_id || '', c]));
    const rawStrategy = typeof options === 'string' ? options : (options.organizationStrategy || 'THEMATIC');
    const strategy = rawStrategy.toUpperCase();

    const outline = [
      '1. Introduction & Research Problem Formulation',
      '2. Theoretical Foundations & Prior Art',
      strategy === 'THEMATIC'
        ? '3. Thematic Synthesis of Existing Architectures'
        : strategy === 'METHODOLOGICAL'
        ? '3. Comparative Methodological Paradigms'
        : '3. Chronological Evolution of Retrieval Architectures',
      '4. Critical Analysis of Limitations & Identified Gaps',
      '5. Implications for Proposed Engineering System',
      '6. Conclusion & References',
    ];

    const paperSummaries = papers.map((p, i) => `[${i + 1}] "${p.title}" by ${p.authors.slice(0, 2).join(', ')} (${p.publication_year}, ${p.venue}). Abstract snippet: ${p.abstract.substring(0, 160)}...`).join('\n\n');

    const prompt = `You are a collegiate technical writing assistant for engineering research students.
Write 3 comprehensive literature review draft sections based STRICTLY on the verified papers listed below.

CRITICAL FACTUALITY RULES:
1. NEVER invent papers, author names, years, metrics, or experimental figures.
2. ONLY reference the verified papers provided in the context below.
3. Attribute assertions to papers using numbered citations [1], [2], etc.

Research Context:
- Project Title: ${project.title}
- Topic: ${project.topic}
- Objective: ${project.objective}
- Organization Strategy: ${strategy}

Verified Papers:
${paperSummaries}

Output JSON only with keys:
{
  "section1_content": "...",
  "section2_content": "...",
  "section3_content": "..."
}`;

    if (!isModelAvailable()) {
      throw new AppError('Literature review drafting needs the AI provider, which is not available right now. Nothing was generated.', 503, 'AI_UNAVAILABLE');
    }
    let parsed: any = null;
    try {
      const res = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);
      parsed = parseModelJson<any>(res, 'Literature review drafting');
    } catch (err: any) {
      rethrowAi(err, 'Literature review drafting');
    }
    if (!parsed?.section1_content || !parsed?.section2_content || !parsed?.section3_content) {
      throw new AppError('Literature review drafting: the AI did not return all three sections. Nothing was saved.', 502, 'AI_BAD_OUTPUT');
    }
    const refs = papers.map((p, i) => `[${i + 1}] ${p.title} (${p.authors.slice(0, 2).join(', ')}, ${p.publication_year || 'n.d.'})`);
    const cited = (text: string) => refs.filter((_, i) => text.includes(`[${i + 1}]`));
    const sections: LiteratureReviewSection[] = [
      { title: '1. Introduction & Research Problem Formulation', content: String(parsed.section1_content), citations: cited(String(parsed.section1_content)) },
      { title: '2. Theoretical Foundations & Prior Art', content: String(parsed.section2_content), citations: cited(String(parsed.section2_content)) },
      { title: '3. Comparative Synthesis & Critical Analysis', content: String(parsed.section3_content), citations: cited(String(parsed.section3_content)) },
    ];

    const review: LiteratureReview = {
      id: `lit_rev_${Date.now()}`,
      research_project_id: projectId,
      student_id: studentId,
      title: `Literature Review: ${project.title}`,
      outline,
      sections,
      organization_style: rawStrategy.toLowerCase(),
      organization_strategy: strategy,
      // An AI draft: the student must check every claim against the cited papers.
      status: 'DRAFT' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.saveLiteratureReview(review);
    return review;
  }

  public static async generateReview(
    projectId: string,
    studentId: string,
    options:
      | string
      | {
          organizationStrategy?: 'THEMATIC' | 'METHODOLOGICAL' | 'CHRONOLOGICAL' | string;
          targetWordCount?: number;
        } = {}
  ): Promise<LiteratureReview> {
    return this.generateLiteratureReview(projectId, studentId, options);
  }
}
