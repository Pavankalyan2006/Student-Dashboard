export type ContextType =
  | 'COURSE'
  | 'LESSON'
  | 'NOTE'
  | 'DOCUMENT'
  | 'RESEARCH_PAPER'
  | 'RESEARCH_PROJECT'
  | 'GITHUB_REPO'
  | 'GITHUB_FILE'
  | 'PROJECT'
  | 'RESUME'
  | 'SKILL_PROFILE';

export interface AIContextItem {
  id: string;
  type: ContextType;
  reference_id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
}

export interface SourceProvenanceItem {
  citation_number: number;
  source_type: ContextType;
  source_id: string;
  title: string;
  url?: string;
  retrieved_at: string;
  page_or_path?: string;
  content_snippet: string;
}

export interface ContextOption {
  type: ContextType;
  reference_id: string;
  title: string;
  subtitle: string;
}
