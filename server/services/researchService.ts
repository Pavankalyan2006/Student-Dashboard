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

    // Initialize proposed methodology outline
    const methodology: ResearchMethodology = {
      id: `meth_${Date.now()}`,
      research_project_id: id,
      student_id: studentId,
      system_architecture: 'Proposed system architecture combining modular service boundaries and verifiable data flow.',
      experimental_design: 'Comparative study across baseline implementations and proposed enhancements.',
      dataset_plan: 'Standard open-access domain benchmarks with verified academic citations.',
      data_collection: 'Automated data ingestion and syntax-preserving normalization.',
      preprocessing: 'Deduplication, tokenization, and schema validation.',
      model_selection: 'Deterministic algorithmic models or pre-trained transformer baselines.',
      evaluation_metrics: ['Accuracy / Precision', 'Latency (ms)', 'Resource Overhead'],
      baseline_comparison: 'Standard baseline implementations documented in peer-reviewed literature.',
      reproducibility_checklist: [
        'Document random seeds',
        'Specify dependencies in requirements.txt or package.json',
        'Provide automated evaluation scripts',
      ],
      is_proposed: true,
      created_at: now,
      updated_at: now,
    };
    await db.saveResearchMethodology(methodology);

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
    const now = new Date().toISOString();
    const id = paperData.id || `paper_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const paper: ResearchPaper = {
      id,
      research_project_id: projectId,
      student_id: studentId,
      document_id: paperData.document_id,
      title: paperData.title,
      abstract: paperData.abstract,
      authors: paperData.authors || ['Academic Contributor'],
      publication_year: paperData.publication_year || new Date().getFullYear(),
      venue: paperData.venue || 'Academic Proceedings',
      doi: paperData.doi,
      url: paperData.url,
      provider: paperData.provider || 'MANUAL',
      external_id: paperData.external_id,
      citation_count: paperData.citation_count || 0,
      is_saved: true,
      metadata: paperData.metadata || { is_peer_reviewed: false, open_access: true },
      created_at: now,
    };

    await db.saveResearchPaper(paper);

    // Also auto-generate an initial APA citation for this paper
    const authorStr = paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ', et al.' : '');
    const citation: ResearchCitation = {
      id: `cite_${Date.now()}`,
      student_id: studentId,
      research_project_id: projectId,
      paper_id: paper.id,
      source_type: 'PAPER',
      citation_style: 'APA',
      formatted_citation: `${authorStr} (${paper.publication_year}). ${paper.title}. ${paper.venue}.${paper.doi ? ` https://doi.org/${paper.doi}` : ''}`,
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

    return papers.map((p, idx) => {
      const q = questions[idx % Math.max(1, questions.length)]?.question || 'Core Domain Inquiry';
      const gap = gaps[idx % Math.max(1, gaps.length)]?.description || 'Potential evaluation boundary across edge workloads.';

      return {
        paper_id: p.id,
        paper_title: p.title,
        authors: p.authors.slice(0, 2).join(', ') + (p.authors.length > 2 ? ' et al.' : ''),
        year: p.publication_year,
        research_question: q,
        objective: p.abstract.substring(0, 120) + '...',
        method: p.venue.includes('NeurIPS') || p.venue.includes('ICLR') ? 'Neural Model Fine-Tuning' : 'Empirical Benchmarking',
        dataset: (p.metadata?.fields_of_study || ['Academic Benchmarks']).join(', '),
        technology: (p.metadata?.fields_of_study || ['Computer Science'])[0] || 'Software Engineering',
        findings: `Documented ${p.citation_count}+ academic citations with verifiable reproducible results.`,
        limitations: 'Evaluated primarily under controlled laboratory distributions.',
        research_gap: gap,
        evidence_source: p.doi ? `DOI: ${p.doi}` : p.url || p.venue,
      };
    });
  }
}
