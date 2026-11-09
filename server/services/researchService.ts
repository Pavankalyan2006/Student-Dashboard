import { db } from '../db/database';
import {
  ResearchProject,
  ResearchPaper,
  ResearchQuestion,
  ResearchGap,
  ResearchIdea,
  ResearchMethodology,
  ResearchCitation,
  LiteratureReview,
  EvidenceMatrixRow,
} from '../models/researchGitHubTypes';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class ResearchService {
  /**
   * List all research projects owned by the student
   */
  public static async listProjects(studentId: string): Promise<ResearchProject[]> {
    return await db.getResearchProjects(studentId);
  }

  /**
   * Retrieve a single research project with authorization check
   */
  public static async getProject(id: string, studentId: string): Promise<ResearchProject> {
    const project = await db.getResearchProjectById(id, studentId);
    if (!project) {
      throw new NotFoundError(`Research project with ID '${id}' not found`);
    }
    return project;
  }

  /**
   * Create a new research project
   */
  public static async createProject(
    studentId: string,
    data: {
      title: string;
      topic: string;
      domain: string;
      branch?: string;
      research_type?: any;
      objective: string;
      research_question?: string;
    }
  ): Promise<ResearchProject> {
    if (!data.title?.trim() || !data.topic?.trim() || !data.objective?.trim()) {
      throw new ValidationError('Title, topic, and objective are required to create a research project');
    }

    const student = await db.getStudentById(studentId);
    const now = new Date().toISOString();
    const id = `res_proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const project: ResearchProject = {
      id,
      student_id: studentId,
      title: data.title.trim(),
      topic: data.topic.trim(),
      domain: data.domain || 'Computer Science',
      branch: data.branch || student?.branch || 'Computer Science and Engineering',
      research_type: data.research_type || 'RESEARCH_PAPER',
      objective: data.objective.trim(),
      research_question: data.research_question?.trim(),
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
    };

    await db.saveResearchProject(project);

    // If an initial research question was provided, add it to researchQuestions
    if (data.research_question?.trim()) {
      const q: ResearchQuestion = {
        id: `rq_${Date.now()}`,
        research_project_id: id,
        student_id: studentId,
        question: data.research_question.trim(),
        category: 'PRIMARY',
        status: 'INVESTIGATING',
        evidence: [],
        created_at: now,
      };
      await db.saveResearchQuestion(q);
    }

    // No methodology is pre-filled: the student writes it (the old default text read like a real plan).

    return project;
  }

  /**
   * Update an existing research project
   */
  public static async updateProject(
    id: string,
    studentId: string,
    updates: Partial<ResearchProject>
  ): Promise<ResearchProject> {
    const project = await this.getProject(id, studentId);
    const updated: ResearchProject = {
      ...project,
      ...updates,
      id: project.id,
      student_id: project.student_id,
      updated_at: new Date().toISOString(),
    };
    await db.saveResearchProject(updated);
    return updated;
  }

  /**
   * Delete a research project
   */
  public static async deleteProject(id: string, studentId: string): Promise<boolean> {
    return await db.deleteResearchProject(id, studentId);
  }

  /**
   * List papers saved in a project
   */
  public static async listPapers(projectId: string, studentId: string): Promise<ResearchPaper[]> {
    await this.getProject(projectId, studentId);
    return await db.getResearchPapers(projectId, studentId);
  }

  /**
   * Get single paper
   */
  public static async getPaper(paperId: string, studentId: string): Promise<ResearchPaper> {
    const paper = await db.getResearchPaperById(paperId, studentId);
    if (!paper) {
      throw new NotFoundError(`Research paper with ID '${paperId}' not found`);
    }
    return paper;
  }

  /**
   * Save a paper to the student's project
   */
  public static async savePaper(
    projectId: string,
    studentId: string,
    paperData: Partial<ResearchPaper> & { title: string; abstract: string }
  ): Promise<ResearchPaper> {
    await this.getProject(projectId, studentId);
    if (!paperData || typeof paperData.title !== 'string' || !paperData.title.trim()) {
      throw new ValidationError('A paper needs a title');
    }
    const now = new Date().toISOString();
    // Ids are always created on the server. A client-supplied id could overwrite another student's paper.
    const existing = (await db.getResearchPapers(projectId, studentId)).find(
      (p) => (paperData.doi && p.doi === paperData.doi) || (paperData.external_id && p.external_id === paperData.external_id)
    );
    if (existing) return existing; // already saved in this project: no duplicate
    const id = `paper_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const provider = ['OPENALEX', 'CROSSREF', 'SEMANTIC_SCHOLAR', 'CURATED', 'PDF_UPLOAD'].includes(String(paperData.provider)) ? paperData.provider : 'MANUAL';

    const paper: ResearchPaper = {
      id,
      research_project_id: projectId,
      student_id: studentId,
      document_id: paperData.document_id,
      title: paperData.title.trim().slice(0, 500),
      abstract: String(paperData.abstract || '').slice(0, 10000),
      authors: Array.isArray(paperData.authors) ? paperData.authors.map(String).slice(0, 100) : [],
      publication_year: Number(paperData.publication_year) || 0,
      venue: String(paperData.venue || ''),
      doi: paperData.doi,
      url: paperData.url && /^https?:\/\//i.test(String(paperData.url)) ? String(paperData.url) : undefined,
      provider: provider as any,
      external_id: paperData.external_id,
      citation_count: paperData.citation_count || 0,
      is_saved: true,
      metadata: { ...(paperData.metadata || {}), saved_from: provider },
      created_at: now,
    };

    await db.saveResearchPaper(paper);

    // Also auto-generate an initial APA citation for this paper
    const authorStr = paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ', et al.' : '');
    const citation: ResearchCitation = {
      id: `cite_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      research_project_id: projectId,
      paper_id: paper.id,
      source_type: 'PAPER',
      citation_style: 'APA',
      formatted_citation: `${authorStr || 'Unknown author'} (${paper.publication_year || 'n.d.'}). ${paper.title}.${paper.venue ? ` ${paper.venue}.` : ''}${paper.doi ? ` https://doi.org/${paper.doi}` : ''}`,
      bibtex: `@article{${paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'paper'}${paper.publication_year},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  journal={${paper.venue}},\n  year={${paper.publication_year}}\n}`,
      metadata: {
        title: paper.title,
        authors: paper.authors,
        year: paper.publication_year,
        venue: paper.venue,
        doi: paper.doi,
        url: paper.url,
      },
      created_at: now,
    };
    await db.saveResearchCitation(citation);

    return paper;
  }

  /** Saves the student's reading notes and reading status on a paper they own. */
  public static async updatePaperNotes(paperId: string, studentId: string, data: { notes?: unknown; reading_status?: unknown }): Promise<ResearchPaper> {
    const paper = await this.getPaper(paperId, studentId);
    if (data.notes !== undefined) {
      if (typeof data.notes !== 'string') throw new ValidationError('notes must be text');
      if (data.notes.length > 20000) throw new ValidationError('notes must be at most 20,000 characters');
      paper.notes = data.notes;
    }
    if (data.reading_status !== undefined) {
      if (!['TO_READ', 'READING', 'READ'].includes(String(data.reading_status))) throw new ValidationError('reading_status must be TO_READ, READING or READ');
      paper.reading_status = data.reading_status as any;
    }
    paper.updated_at = new Date().toISOString();
    await db.saveResearchPaper(paper);
    return paper;
  }

  /**
   * Delete paper from project
   */
  public static async deletePaper(paperId: string, studentId: string): Promise<boolean> {
    return await db.deleteResearchPaper(paperId, studentId);
  }

  /**
   * Import paper from an existing uploaded PDF document in Phase 6 Document AI
   */
  public static async importPaperFromDocument(
    projectId: string,
    studentId: string,
    documentId: string
  ): Promise<ResearchPaper> {
    await this.getProject(projectId, studentId);
    const document = await db.getDocumentById(documentId);
    if (!document) {
      throw new NotFoundError(`Document with ID '${documentId}' not found`);
    }
    if (document.student_id !== studentId) {
      throw new AuthorizationError('You do not have permission to import this document');
    }

    const filename = document.original_filename || (document as any).filename || 'document.pdf';
    const title = document.title || filename;
    const abstract = document.description || `Academic document imported from ${filename}.`;

    return await this.savePaper(projectId, studentId, {
      document_id: documentId || document.id,
      title,
      abstract,
      authors: [studentId],
      publication_year: new Date().getFullYear(),
      venue: 'Uploaded Academic Document',
      provider: 'PDF_UPLOAD',
      metadata: {
        is_peer_reviewed: false,
        open_access: true,
        page_count: document.page_count,
        file_size_bytes: document.file_size || (document as any).file_size_bytes || 0,
      },
    });
  }

  /**
   * Research Questions CRUD
   */
  public static async listQuestions(projectId: string, studentId: string): Promise<ResearchQuestion[]> {
    await this.getProject(projectId, studentId);
    return await db.getResearchQuestions(projectId, studentId);
  }

  public static async addQuestion(
    projectId: string,
    studentId: string,
    data: { question: string; category?: any; evidence?: string[] }
  ): Promise<ResearchQuestion> {
    await this.getProject(projectId, studentId);
    if (!data.question?.trim()) {
      throw new ValidationError('Question text is required');
    }

    const q: ResearchQuestion = {
      id: `rq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_project_id: projectId,
      student_id: studentId,
      question: data.question.trim(),
      category: data.category || 'PRIMARY',
      status: 'INVESTIGATING',
      evidence: data.evidence || [],
      created_at: new Date().toISOString(),
    };

    await db.saveResearchQuestion(q);
    return q;
  }

  public static async deleteQuestion(
    projectId: string,
    questionId: string,
    studentId: string
  ): Promise<boolean> {
    return await db.deleteResearchQuestion(projectId, questionId, studentId);
  }

  /**
   * Research Gaps CRUD
   */
  public static async listGaps(projectId: string, studentId: string): Promise<ResearchGap[]> {
    await this.getProject(projectId, studentId);
    return await db.getResearchGaps(projectId, studentId);
  }

  public static async addGap(
    projectId: string,
    studentId: string,
    data: {
      description: string;
      category?: any;
      evidence?: string[];
      confidence_status?: any;
      related_questions?: string[];
      supporting_paper_ids?: string[];
    }
  ): Promise<ResearchGap> {
    await this.getProject(projectId, studentId);
    if (!data.description?.trim()) {
      throw new ValidationError('Gap description is required');
    }

    const gap: ResearchGap = {
      id: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_project_id: projectId,
      student_id: studentId,
      description: data.description.trim(),
      category: data.category || 'METHODOLOGY',
      evidence: data.evidence || [],
      confidence_status: data.confidence_status || 'MEDIUM',
      related_questions: data.related_questions || [],
      supporting_paper_ids: data.supporting_paper_ids || [],
      created_at: new Date().toISOString(),
    };

    await db.saveResearchGap(gap);
    return gap;
  }

  /**
   * Research Ideas CRUD
   */
  public static async listIdeas(projectId: string, studentId: string): Promise<ResearchIdea[]> {
    await this.getProject(projectId, studentId);
    return await db.getResearchIdeas(projectId, studentId);
  }

  public static async addIdea(
    projectId: string,
    studentId: string,
    data: {
      title: string;
      problem: string;
      motivation: string;
      proposed_approach: string;
      technologies?: string[];
      dataset_possibilities?: string;
      evaluation_approach?: string;
      expected_contribution?: string;
      related_paper_ids?: string[];
      related_project_ids?: string[];
    }
  ): Promise<ResearchIdea> {
    await this.getProject(projectId, studentId);
    const idea: ResearchIdea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      research_project_id: projectId,
      student_id: studentId,
      title: data.title.trim(),
      problem: data.problem.trim(),
      motivation: data.motivation.trim(),
      proposed_approach: data.proposed_approach.trim(),
      technologies: data.technologies || ['Python', 'PostgreSQL'],
      dataset_possibilities: data.dataset_possibilities || 'Open-access benchmark data',
      evaluation_approach: data.evaluation_approach || 'Quantitative benchmark comparison',
      expected_contribution: data.expected_contribution || 'Novel architecture or method',
      related_paper_ids: data.related_paper_ids || [],
      related_project_ids: data.related_project_ids || [],
      created_at: new Date().toISOString(),
    };

    await db.saveResearchIdea(idea);
    return idea;
  }

  /**
   * Research Methodology
   */
  public static async getMethodology(projectId: string, studentId: string): Promise<ResearchMethodology | null> {
    await this.getProject(projectId, studentId);
    return await db.getResearchMethodology(projectId, studentId);
  }

  public static async saveMethodology(
    projectId: string,
    studentId: string,
    updates: Partial<ResearchMethodology>
  ): Promise<ResearchMethodology> {
    await this.getProject(projectId, studentId);
    const existing = await db.getResearchMethodology(projectId, studentId);
    const updated: ResearchMethodology = {
      id: existing?.id || `meth_${Date.now()}`,
      research_project_id: projectId,
      student_id: studentId,
      system_architecture: updates.system_architecture || existing?.system_architecture || '',
      experimental_design: updates.experimental_design || existing?.experimental_design || '',
      dataset_plan: updates.dataset_plan || existing?.dataset_plan || '',
      data_collection: updates.data_collection || existing?.data_collection || '',
      preprocessing: updates.preprocessing || existing?.preprocessing || '',
      model_selection: updates.model_selection || existing?.model_selection || '',
      evaluation_metrics: updates.evaluation_metrics || existing?.evaluation_metrics || [],
      baseline_comparison: updates.baseline_comparison || existing?.baseline_comparison || '',
      reproducibility_checklist: updates.reproducibility_checklist || existing?.reproducibility_checklist || [],
      is_proposed: true, // Always proposed unless verified laboratory execution exists
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.saveResearchMethodology(updated);
    return updated;
  }

  /**
   * Citations
   */
  public static async listCitations(projectId: string, studentId: string): Promise<ResearchCitation[]> {
    await this.getProject(projectId, studentId);
    return await db.getResearchCitations(projectId, studentId);
  }

  public static async addCitation(
    projectId: string,
    studentId: string,
    citation: ResearchCitation
  ): Promise<ResearchCitation> {
    await this.getProject(projectId, studentId);
    await db.saveResearchCitation(citation);
    return citation;
  }

  /**
   * Literature Review
   */
  public static async getLiteratureReview(projectId: string, studentId: string): Promise<LiteratureReview | null> {
    await this.getProject(projectId, studentId);
    return await db.getLiteratureReview(projectId, studentId);
  }

  public static async saveLiteratureReview(
    projectId: string,
    studentId: string,
    review: LiteratureReview
  ): Promise<LiteratureReview> {
    await this.getProject(projectId, studentId);
    await db.saveLiteratureReview(review);
    return review;
  }

  /**
   * Structured Evidence Matrix
   */
  public static async getEvidenceMatrix(projectId: string, studentId: string): Promise<EvidenceMatrixRow[]> {
    const papers = await this.listPapers(projectId, studentId);
    const questions = await this.listQuestions(projectId, studentId);
    const gaps = await this.listGaps(projectId, studentId);

    // Each cell is either stored data or empty; nothing is guessed from the venue name.
    return papers.map((p) => {
      const linkedQ = questions.filter((q: any) => Array.isArray(q.evidence) && q.evidence.some((e: any) => (e?.paper_id || e) === p.id));
      const linkedGap = gaps.find((g: any) => (g.supporting_paper_ids || []).includes(p.id));
      return {
        paper_id: p.id,
        paper_title: p.title,
        authors: p.authors.slice(0, 2).join(', ') + (p.authors.length > 2 ? ' et al.' : ''),
        year: p.publication_year,
        research_question: linkedQ.map((q: any) => q.question).join('; ') || 'Not linked yet',
        objective: p.abstract ? p.abstract.substring(0, 120) + (p.abstract.length > 120 ? '...' : '') : 'No abstract saved',
        method: 'Not recorded (run Analyze on the paper)',
        dataset: 'Not recorded',
        technology: (p.metadata?.fields_of_study || [])[0] || 'Not recorded',
        findings: 'Not recorded',
        limitations: 'Not recorded',
        research_gap: linkedGap?.description || 'Not linked yet',
        evidence_source: p.doi ? `DOI: ${p.doi}` : p.url || p.venue || 'No source link',
      };
    });
  }
}
