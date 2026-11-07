export type ResearchType =
  | 'LITERATURE_REVIEW'
  | 'RESEARCH_PAPER'
  | 'FINAL_YEAR_PROJECT'
  | 'SURVEY'
  | 'EXPERIMENTAL_RESEARCH'
  | 'SYSTEMATIC_REVIEW'
  | 'TECHNICAL_STUDY'
  | 'COMPARATIVE_STUDY'
  | 'PROTOTYPE_RESEARCH';

export type QuestionCategory =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'EXPLORATORY'
  | 'COMPARATIVE'
  | 'EXPERIMENTAL'
  | 'SURVEY';

export type GapCategory =
  | 'DATASET'
  | 'METHODOLOGY'
  | 'EVALUATION'
  | 'APPLICATION'
  | 'DOMAIN'
  | 'SCALABILITY'
  | 'REPRODUCIBILITY'
  | 'INTEGRATION'
  | 'RESEARCH_POPULATION';

export type CitationStyle = 'APA' | 'IEEE' | 'MLA' | 'BIBTEX';

export interface ResearchProject {
  id: string;
  student_id: string;
  title: string;
  topic: string;
  domain: string;
  branch: string;
  research_type: ResearchType;
  objective: string;
  research_question?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface ResearchPaper {
  id: string;
  research_project_id: string;
  student_id: string;
  document_id?: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_year: number;
  venue: string;
  doi?: string;
  url?: string;
  provider: 'OPENALEX' | 'CROSSREF' | 'SEMANTIC_SCHOLAR' | 'PUBMED' | 'PDF_UPLOAD' | 'MANUAL' | 'CURATED';
  external_id?: string;
  citation_count: number;
  is_saved: boolean;
  /** The student's own reading notes and status (Phase 3). */
  notes?: string;
  reading_status?: 'TO_READ' | 'READING' | 'READ';
  updated_at?: string;
  metadata?: {
    is_peer_reviewed?: boolean;
    open_access?: boolean;
    fields_of_study?: string[];
    page_count?: number;
    file_size_bytes?: number;
  };
  created_at: string;
}

export interface ResearchPaperAnalysis {
  id: string;
  paper_id: string;
  research_problem: string;
  objectives: string[];
  methodology: string;
  dataset: string;
  algorithm: string;
  results: string;
  limitations: string[];
  contributions: string[];
  future_work: string[];
  important_findings: string[];
  key_terminology: { term: string; definition: string }[];
  citation_information: {
    apa: string;
    ieee: string;
    mla: string;
    bibtex: string;
  };
  created_at: string;
}

export interface PaperComparisonMatrix {
  paper_ids: string[];
  columns: string[];
  rows: {
    paper_id: string;
    paper_title: string;
    year: number;
    research_problem: string;
    methodology: string;
    dataset: string;
    algorithm: string;
    evaluation_metric: string;
    results: string;
    limitations: string;
    contribution: string;
    future_work: string;
  }[];
  comparative_analysis: {
    similar_approaches: string[];
    methodological_differences: string[];
    common_datasets: string[];
    common_limitations: string[];
    research_trends: string[];
  };
}

export interface ResearchQuestion {
  id: string;
  research_project_id: string;
  student_id: string;
  question: string;
  category: QuestionCategory;
  status: 'INVESTIGATING' | 'ANSWERED' | 'HYPOTHESIS_FORMED' | 'DISMISSED';
  evidence: string[];
  created_at: string;
}

export interface ResearchGap {
  id: string;
  research_project_id: string;
  student_id: string;
  description: string;
  category: GapCategory;
  evidence: string[];
  confidence_status: 'HIGH' | 'MEDIUM' | 'LOW';
  related_questions: string[];
  supporting_paper_ids: string[];
  created_at: string;
}

export interface ResearchIdea {
  id: string;
  research_project_id: string;
  student_id: string;
  title: string;
  problem: string;
  motivation: string;
  proposed_approach: string;
  technologies: string[];
  dataset_possibilities: string;
  evaluation_approach: string;
  expected_contribution: string;
  related_paper_ids: string[];
  related_project_ids: string[];
  created_at: string;
}

export interface ResearchMethodology {
  id: string;
  research_project_id: string;
  student_id: string;
  system_architecture: string;
  experimental_design: string;
  dataset_plan: string;
  data_collection: string;
  preprocessing: string;
  model_selection: string;
  evaluation_metrics: string[];
  baseline_comparison: string;
  reproducibility_checklist: string[];
  is_proposed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchCitation {
  id: string;
  student_id: string;
  research_project_id?: string;
  paper_id?: string;
  source_type: 'PAPER' | 'DOCUMENT' | 'REPOSITORY' | 'COURSE' | 'EXTERNAL';
  citation_style: CitationStyle;
  formatted_citation: string;
  bibtex?: string;
  metadata?: {
    title?: string;
    authors?: string[];
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
  };
  created_at: string;
}

export interface LiteratureReview {
  id: string;
  research_project_id: string;
  student_id: string;
  title: string;
  organization_style: 'thematic' | 'chronological' | 'methodological';
  outline: string[];
  sections: {
    heading: string;
    content: string;
    citations: string[];
  }[];
  synthesized_findings: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceMatrixRow {
  paper_id: string;
  paper_title: string;
  authors: string;
  year: number;
  research_question: string;
  objective: string;
  method: string;
  dataset: string;
  technology: string;
  findings: string;
  limitations: string;
  research_gap: string;
  evidence_source: string;
}
