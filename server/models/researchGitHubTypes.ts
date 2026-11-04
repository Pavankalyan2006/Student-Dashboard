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

export type ResearchStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type PaperProvider =
  | 'OPENALEX'
  | 'CROSSREF'
  | 'SEMANTIC_SCHOLAR'
  | 'MANUAL'
  | 'PDF_UPLOAD';

export type QuestionCategory =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'EXPLORATORY'
  | 'COMPARATIVE'
  | 'EXPERIMENTAL'
  | 'SURVEY';

export type QuestionStatus = 'DRAFT' | 'INVESTIGATING' | 'ANSWERED';

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

export type GapConfidence = 'HIGH' | 'MEDIUM' | 'PRELIMINARY';

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
  status: ResearchStatus;
  created_at: string;
  updated_at: string;
}

export interface ResearchPaper {
  id: string;
  research_project_id: string;
  student_id: string;
  document_id?: string; // Linked to Phase 6 Document AI/RAG
  title: string;
  abstract: string;
  authors: string[];
  publication_year: number;
  venue: string;
  doi?: string;
  url?: string;
  provider: PaperProvider;
  external_id?: string;
  citation_count: number;
  is_saved: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PaperAnalysis {
  paper_id: string;
  title: string;
  research_problem: string;
  objectives: string[];
  methodology: string;
  dataset: string;
  model_or_algorithm: string;
  results: string;
  limitations: string[];
  contributions: string[];
  future_work: string[];
  important_findings: string[];
  key_terminology: { term: string; definition: string }[];
  citation_apa: string;
  citation_ieee: string;
  citation_bibtex: string;
  citation_information?: {
    apa: string;
    ieee: string;
    bibtex: string;
  };
}

export interface ResearchQuestion {
  id: string;
  research_project_id: string;
  student_id: string;
  question: string;
  category: QuestionCategory;
  status: QuestionStatus;
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
  confidence_status: GapConfidence;
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
  datasetPlan?: string;
  data_collection: string;
  preprocessing: string;
  model_selection: string;
  evaluation_metrics: string[];
  baseline_comparison: string;
  reproducibility_checklist: string[];
  is_proposed: boolean; // Must distinguish proposed vs completed
  created_at: string;
  updated_at: string;
}

export interface ResearchCitation {
  id: string;
  student_id: string;
  research_project_id: string;
  paper_id?: string;
  source_type: 'PAPER' | 'BOOK' | 'CONFERENCE' | 'WEB' | 'DATASET';
  citation_style: CitationStyle;
  formatted_citation: string;
  bibtex: string;
  metadata: {
    title: string;
    authors: string[];
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
  };
  created_at: string;
}

export interface LiteratureReviewSection {
  title: string;
  content: string;
  citations: string[];
}

export interface LiteratureReview {
  id: string;
  research_project_id: string;
  student_id: string;
  title: string;
  outline: string[];
  sections: LiteratureReviewSection[];
  organization_style?: string;
  organization_strategy?: string;
  status: 'DRAFT' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface ResearchEvidence {
  id: string;
  research_project_id: string;
  student_id: string;
  paper_id: string;
  claim: string;
  evidence: string;
  location: string;
  created_at: string;
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

// ==========================================
// GITHUB TYPES
// ==========================================

export interface GitHubConnection {
  id: string;
  student_id: string;
  github_user_id: string;
  username: string;
  name: string;
  avatar_url: string;
  encrypted_token: string;
  scopes: string[];
  bio?: string;
  company?: string;
  location?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  profile_url?: string;
  last_synced_at?: string;
  sync_error?: string;
  expires_at?: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: string;
  student_id: string;
  github_connection_id: string;
  external_repo_id: string;
  owner: string;
  name: string;
  full_name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  default_branch: string;
  language: string;
  stars: number;
  forks: number;
  open_issues_count: number;
  url: string;
  clone_url: string;
  topics?: string[];
  license?: string;
  is_fork?: boolean;
  is_starred?: boolean;
  is_featured?: boolean;
  featured_metadata?: {
    title?: string;
    role?: string;
    custom_description?: string;
    tech_stack?: string[];
    key_features?: string[];
    challenges_solved?: string;
    lessons_learned?: string;
    demo_url?: string;
    resume_bullets?: string[];
  };
  personal_notes?: string;
  languages?: Record<string, number>;
  readme_content?: string;
  linked_project_id?: string;
  analysis_status: 'NOT_ANALYZED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubResumeBullet {
  id: string;
  bullet: string;
  context: string;
  technologies: string[];
  verified: boolean;
}

export interface GitHubInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  category: 'ARCHITECTURE' | 'TRADEOFFS' | 'TESTING' | 'PERFORMANCE' | 'CHALLENGES';
  relevant_files: string[];
  model_answer?: string;
  key_points?: string[];
}

export interface GitHubLearningRepo {
  id: string;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  html_url?: string;
  stargazers_count?: number;
  topic: string;
  learning_focus: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface GitHubSync {
  id: string;
  repository_id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface GitHubRepositoryFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size: number;
  content?: string;
  sha?: string;
}

export interface GitHubArchitectureComponent {
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'ai_service' | 'auth' | 'storage' | 'external_api' | 'queue';
  description: string;
  files: string[];
  evidence_files?: string[];
}

export interface GitHubRepositoryAnalysis {
  id: string;
  repository_id: string;
  student_id: string;
  technologies: string[];
  frameworks: string[];
  main_modules: string[];
  dependencies?: string[];
  entry_points: string[];
  apis: string[];
  database_usage: string[];
  architecture_summary: string;
  components: GitHubArchitectureComponent[];
  architecture_components: GitHubArchitectureComponent[];
  testing_observations: string[];
  security_observations: string[]; // with redacted secrets!
  maintainability_observations: string[];
  observed_facts: string[];
  ai_suggestions: string[];
  created_at: string;
}

export interface GitHubCommit {
  id?: string;
  repository_id?: string;
  author_email?: string;
  url?: string;
  sha: string;
  hash?: string;
  message: string;
  author_name: string;
  author?: string;
  date: string;
  committed_at?: string;
  changed_files_count: number;
  files_changed?: number;
  additions?: number;
  deletions?: number;
}

export interface GitHubIssue {
  id?: string;
  repository_id?: string;
  url?: string;
  updated_at?: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  status?: string;
  author: string;
  labels: string[];
  created_at: string;
  comments_count: number;
}

export interface GitHubPullRequest {
  id?: string;
  repository_id?: string;
  url?: string;
  updated_at?: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  base_branch: string;
  head_branch: string;
  branch?: string;
  files_changed?: number;
  additions?: number;
  deletions?: number;
  created_at: string;
}

// ==========================================
// ADVANCED AI MULTI-SOURCE CONTEXT TYPES
// ==========================================

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
  metadata?: Record<string, any>;
}

export interface MultiSourceContextQuery {
  query: string;
  selected_contexts: AIContextItem[];
}

export interface SourceProvenanceItem {
  citation_number: number;
  source_type: ContextType;
  source_id: string;
  title: string;
  url?: string;
  page_or_path?: string;
  snippet: string;
}
