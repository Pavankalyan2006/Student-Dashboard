import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchApi } from '../api/researchApi';
import { ResearchProject, ResearchPaper, ResearchQuestion, ResearchGap, ResearchIdea, ResearchMethodology, LiteratureReview, CitationStyle } from '../types';
import { toast } from 'sonner';

export function useResearchProjects() {
  return useQuery({
    queryKey: ['research-projects'],
    queryFn: () => researchApi.listProjects(),
  });
}

export function useResearchProject(projectId?: string) {
  return useQuery({
    queryKey: ['research-project', projectId],
    queryFn: () => (projectId ? researchApi.getProject(projectId) : Promise.reject('No ID')),
    enabled: !!projectId,
  });
}

export function useResearchPapers(projectId?: string) {
  return useQuery({
    queryKey: ['research-papers', projectId],
    queryFn: () => (projectId ? researchApi.listPapers(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function usePaperAnalysis(paperId?: string) {
  return useQuery({
    queryKey: ['paper-analysis', paperId],
    queryFn: () => (paperId ? researchApi.analyzePaper(paperId) : Promise.reject('No paper ID')),
    enabled: !!paperId,
  });
}

export function useResearchQuestions(projectId?: string) {
  return useQuery({
    queryKey: ['research-questions', projectId],
    queryFn: () => (projectId ? researchApi.listQuestions(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useResearchGaps(projectId?: string) {
  return useQuery({
    queryKey: ['research-gaps', projectId],
    queryFn: () => (projectId ? researchApi.listGaps(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useResearchIdeas(projectId?: string) {
  return useQuery({
    queryKey: ['research-ideas', projectId],
    queryFn: () => (projectId ? researchApi.listIdeas(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useResearchMethodology(projectId?: string) {
  return useQuery({
    queryKey: ['research-methodology', projectId],
    queryFn: () => (projectId ? researchApi.getMethodology(projectId) : Promise.resolve(null)),
    enabled: !!projectId,
  });
}

export function useLiteratureReview(projectId?: string) {
  return useQuery({
    queryKey: ['literature-review', projectId],
    queryFn: () => (projectId ? researchApi.getLiteratureReview(projectId) : Promise.resolve(null)),
    enabled: !!projectId,
  });
}

export function useResearchCitations(projectId?: string) {
  return useQuery({
    queryKey: ['research-citations', projectId],
    queryFn: () => (projectId ? researchApi.listCitations(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useEvidenceMatrix(projectId?: string) {
  return useQuery({
    queryKey: ['evidence-matrix', projectId],
    queryFn: () => (projectId ? researchApi.getEvidenceMatrix(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

// Mutations
export function useCreateResearchProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ResearchProject>) => researchApi.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['research-projects'] });
      toast.success('Research project created successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create research project');
    },
  });
}

export function useImportPaper(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { document_id?: string; paper?: Partial<ResearchPaper> }) =>
      researchApi.importPaper(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['research-papers', projectId] });
      qc.invalidateQueries({ queryKey: ['research-citations', projectId] });
      qc.invalidateQueries({ queryKey: ['evidence-matrix', projectId] });
      toast.success('Paper added to research project');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to import paper');
    },
  });
}

export function useGenerateLiteratureReview(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (organization: 'thematic' | 'chronological' | 'methodological') =>
      researchApi.generateLiteratureReview(projectId, organization),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['literature-review', projectId] });
      toast.success('Literature review generated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate literature review');
    },
  });
}

export function useAnalyzeGaps(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => researchApi.analyzeGaps(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['research-gaps', projectId] });
      toast.success('Empirical research gap analysis completed');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to analyze research gaps');
    },
  });
}

export function useGenerateIdeas(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => researchApi.generateIdeas(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['research-ideas', projectId] });
      toast.success('Research ideas synthesized from literature gaps');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate research ideas');
    },
  });
}
