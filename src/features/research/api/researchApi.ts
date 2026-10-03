import { apiClient } from '../../../api/client';
import {
  ResearchProject,
  ResearchPaper,
  ResearchPaperAnalysis,
  PaperComparisonMatrix,
  ResearchQuestion,
  ResearchGap,
  ResearchIdea,
  ResearchMethodology,
  ResearchCitation,
  LiteratureReview,
  EvidenceMatrixRow,
  CitationStyle,
} from '../types';

export const researchApi = {
  // Projects
  async listProjects(): Promise<ResearchProject[]> {
    return apiClient.get<ResearchProject[]>('/research');
  },

  async getProject(id: string): Promise<ResearchProject> {
    return apiClient.get<ResearchProject>(`/research/${id}`);
  },

  async createProject(data: Partial<ResearchProject>): Promise<ResearchProject> {
    return apiClient.post<ResearchProject>('/research', data);
  },

  async updateProject(id: string, data: Partial<ResearchProject>): Promise<ResearchProject> {
    return apiClient.patch<ResearchProject>(`/research/${id}`, data);
  },

  async deleteProject(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/research/${id}`);
  },

  // Papers
  async listPapers(projectId: string): Promise<ResearchPaper[]> {
    return apiClient.get<ResearchPaper[]>(`/research/${projectId}/papers`);
  },

  async getPaper(paperId: string): Promise<ResearchPaper> {
    return apiClient.get<ResearchPaper>(`/research/papers/${paperId}`);
  },

  async searchPapers(
    projectId: string,
    params: {
      query: string;
      author?: string;
      year_min?: number;
      year_max?: number;
      domain?: string;
      venue?: string;
    }
  ): Promise<{ papers: ResearchPaper[]; total_found: number; provider: string }> {
    return apiClient.post<{ papers: ResearchPaper[]; total_found: number; provider: string }>(
      `/research/${projectId}/papers/search`,
      params
    );
  },

  async importPaper(
    projectId: string,
    payload: { document_id?: string; paper?: Partial<ResearchPaper> }
  ): Promise<ResearchPaper> {
    return apiClient.post<ResearchPaper>(`/research/${projectId}/papers/import`, payload);
  },

  async analyzePaper(paperId: string): Promise<ResearchPaperAnalysis> {
    return apiClient.post<ResearchPaperAnalysis>(`/research/papers/${paperId}/analyze`, {});
  },

  async summarizePaper(paperId: string, mode: 'simple' | 'technical' = 'simple'): Promise<{ summary: string; mode: string }> {
    return apiClient.post<{ summary: string; mode: string }>(`/research/papers/${paperId}/summarize`, { mode });
  },

  async comparePapers(paperIds: string[]): Promise<PaperComparisonMatrix> {
    return apiClient.post<PaperComparisonMatrix>('/research/papers/compare', { paper_ids: paperIds });
  },

  // Questions
  async listQuestions(projectId: string): Promise<ResearchQuestion[]> {
    return apiClient.get<ResearchQuestion[]>(`/research/${projectId}/questions`);
  },

  async addQuestion(projectId: string, data: Partial<ResearchQuestion>): Promise<ResearchQuestion> {
    return apiClient.post<ResearchQuestion>(`/research/${projectId}/questions`, data);
  },

  async deleteQuestion(projectId: string, questionId: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/research/questions/${questionId}?project_id=${projectId}`);
  },

  // Gaps
  async listGaps(projectId: string): Promise<ResearchGap[]> {
    return apiClient.get<ResearchGap[]>(`/research/${projectId}/gaps`);
  },

  async analyzeGaps(projectId: string): Promise<ResearchGap[]> {
    return apiClient.post<ResearchGap[]>(`/research/${projectId}/gaps/analyze`, {});
  },

  async addGap(projectId: string, data: Partial<ResearchGap>): Promise<ResearchGap> {
    return apiClient.post<ResearchGap>(`/research/${projectId}/gaps`, data);
  },

  // Ideas
  async listIdeas(projectId: string): Promise<ResearchIdea[]> {
    return apiClient.get<ResearchIdea[]>(`/research/${projectId}/ideas`);
  },

  async generateIdeas(projectId: string): Promise<ResearchIdea[]> {
    return apiClient.post<ResearchIdea[]>(`/research/${projectId}/ideas/generate`, {});
  },

  async addIdea(projectId: string, data: Partial<ResearchIdea>): Promise<ResearchIdea> {
    return apiClient.post<ResearchIdea>(`/research/${projectId}/ideas`, data);
  },

  // Methodology
  async getMethodology(projectId: string): Promise<ResearchMethodology | null> {
    return apiClient.get<ResearchMethodology | null>(`/research/${projectId}/methodology`);
  },

  async saveMethodology(projectId: string, data: Partial<ResearchMethodology>): Promise<ResearchMethodology> {
    return apiClient.patch<ResearchMethodology>(`/research/${projectId}/methodology`, data);
  },

  // Literature Review
  async getLiteratureReview(projectId: string): Promise<LiteratureReview | null> {
    return apiClient.get<LiteratureReview | null>(`/research/${projectId}/literature-review`);
  },

  async generateLiteratureReview(
    projectId: string,
    organization: 'thematic' | 'chronological' | 'methodological' = 'thematic'
  ): Promise<LiteratureReview> {
    return apiClient.post<LiteratureReview>(`/research/${projectId}/literature-review/generate`, { organization });
  },

  async saveLiteratureReview(projectId: string, data: Partial<LiteratureReview>): Promise<LiteratureReview> {
    return apiClient.patch<LiteratureReview>(`/research/${projectId}/literature-review`, data);
  },

  // Citations
  async listCitations(projectId: string): Promise<ResearchCitation[]> {
    return apiClient.get<ResearchCitation[]>(`/research/${projectId}/citations`);
  },

  async generateCitation(projectId: string, paperId: string, style: CitationStyle = 'APA'): Promise<ResearchCitation> {
    return apiClient.post<ResearchCitation>(`/research/${projectId}/citations`, {
      paper_id: paperId,
      citation_style: style,
    });
  },

  async getBibliography(projectId: string, style: CitationStyle = 'APA'): Promise<{ style: string; bibliography: string }> {
    return apiClient.get<{ style: string; bibliography: string }>(`/research/${projectId}/citations/bibliography?style=${style}`);
  },

  // Evidence Matrix & Export
  async getEvidenceMatrix(projectId: string): Promise<EvidenceMatrixRow[]> {
    return apiClient.get<EvidenceMatrixRow[]>(`/research/${projectId}/evidence-matrix`);
  },

  async exportResearch(
    projectId: string,
    type: 'proposal' | 'evidence_matrix' | 'bibtex' = 'proposal',
    format: string = 'markdown'
  ): Promise<{ content: string; format: string }> {
    return apiClient.get<{ content: string; format: string }>(`/research/${projectId}/export?type=${type}&format=${format}`);
  },
};
