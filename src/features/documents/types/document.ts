export type DocumentProcessingStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'EXTRACTING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'READY'
  | 'FAILED';

export type DocumentCategory =
  | 'Lecture Notes'
  | 'Study Materials'
  | 'Textbooks and References'
  | 'Assignments'
  | 'Laboratory Manuals'
  | 'Lab Reports'
  | 'Project Reports'
  | 'Research Papers'
  | 'Presentations'
  | 'Question Papers'
  | 'Exam Preparation'
  | 'Certificates'
  | 'Resumes'
  | 'Internship Documents'
  | 'Placement Materials'
  | 'Programming Resources'
  | 'Course Materials'
  | 'Other Documents';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Lecture Notes',
  'Study Materials',
  'Textbooks and References',
  'Assignments',
  'Laboratory Manuals',
  'Lab Reports',
  'Project Reports',
  'Research Papers',
  'Presentations',
  'Question Papers',
  'Exam Preparation',
  'Certificates',
  'Resumes',
  'Internship Documents',
  'Placement Materials',
  'Programming Resources',
  'Course Materials',
  'Other Documents',
];

export interface DocumentFolder {
  id: string;
  student_id: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  color?: string;
  icon?: string;
  document_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  version_number: number;
  storage_key: string;
  file_hash: string;
  file_size: number;
  original_filename: string;
  mime_type: string;
  uploaded_at: string;
  change_notes?: string;
  uploader_student_id: string;
}

export interface DocumentStorageStats {
  total_documents: number;
  total_folders: number;
  storage_used_bytes: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  storage_usage_percentage: number;
  documents_awaiting_processing: number;
  recent_uploads_count: number;
  category_breakdown: Record<string, number>;
}

export interface Document {
  id: string;
  student_id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  file_extension: string;
  file_size: number;
  storage_key: string;
  status: DocumentProcessingStatus;
  page_count: number;
  description: string;
  author: string;
  language: string;
  category?: DocumentCategory | string;
  folder_id?: string;
  folder_name?: string;
  metadata: {
    course_id?: string;
    course_title?: string;
    chapter_id?: string;
    lesson_id?: string;
    tags?: string[];
    subject?: string;
    semester?: number;
    category?: DocumentCategory | string;
    folder_id?: string;
    folder_name?: string;
    academic_year?: string;
    topic?: string;
    content_indexed?: boolean;
    lab_experiment_id?: string;
    lab_course_id?: string;
    current_version?: number;
    versions?: DocumentVersion[];
    [key: string]: any;
  };
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
}

export interface DocumentPage {
  id: string;
  document_id: string;
  page_number: number;
  text: string;
  metadata: {
    headings?: string[];
    word_count?: number;
    has_tables?: boolean;
    has_formulas?: boolean;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  page_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata: {
    document_id: string;
    page_number: number;
    chunk_index: number;
    section?: string;
    heading?: string;
    source_type: 'document';
    [key: string]: any;
  };
  embedding_reference?: string;
  created_at: string;
}

export type DocumentSummaryLevel = 'quick' | 'standard' | 'detailed' | 'exam_revision';

export interface DocumentSummary {
  id: string;
  document_id: string;
  student_id: string;
  summary_level: DocumentSummaryLevel;
  title: string;
  overview: string;
  main_topics: string[];
  key_concepts: string[];
  important_points: string[];
  summary: string;
  exam_points: string[];
  definitions: { term: string; definition: string }[];
  formulas: { name: string; formula: string; explanation?: string }[];
  conclusion: string;
  page_range?: { start_page: number; end_page: number };
  created_at: string;
}

export interface DocumentCitation {
  document_id: string;
  document_title: string;
  page_number: number;
  chunk_id?: string;
  quoted_text?: string;
  score?: number;
}

export interface DocumentSearchResult {
  document_id: string;
  page_number: number;
  chunk_id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface DocumentCardData {
  id: string;
  student_id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  file_extension: string;
  file_size: number;
  page_count: number;
  status: DocumentProcessingStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
  description?: string;
  category?: DocumentCategory | string;
  folder_id?: string;
  folder_name?: string;
  course_id?: string;
  course_title?: string;
  tags?: string[];
  processing_error?: string;
  content_indexed?: boolean;
  current_version?: number;
  version_count?: number;
}

export interface DocumentChatRequest {
  question: string;
  current_page?: number;
  selected_pages?: number[];
  conversation_id?: string;
}

export interface DocumentChatResponse {
  answer: string;
  citations: DocumentCitation[];
  confidence: 'grounded' | 'partially_grounded' | 'not_found';
  follow_up_questions: string[];
  conversation_id: string;
  message_id: string;
}

export interface DocumentListParams {
  search?: string;
  filter?: 'all' | 'pdf' | 'document' | 'recent' | 'favorites' | 'processing' | 'ready' | 'failed';
  sort?: 'recent_upload' | 'recent_open' | 'name' | 'size' | 'status';
  category?: string;
  folder_id?: string;
  file_type?: string;
  page?: number;
  limit?: number;
}

export interface DocumentsListResponse {
  items: DocumentCardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadDocumentPayload {
  title?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64?: string;
  courseId?: string;
  courseTitle?: string;
  category?: DocumentCategory | string;
  folderId?: string;
  subject?: string;
  semester?: number;
  topic?: string;
  tags?: string[];
  description?: string;
  notes?: string;
}

export interface CreateFolderPayload {
  name: string;
  description?: string;
  parent_folder_id?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderPayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface AIFetchDocumentResult {
  query: string;
  answer: string;
  matching_documents: Array<DocumentCardData & { relevance_score: number; match_snippet: string }>;
  citations: Array<{ document_id: string; document_title: string; page_number: number; quoted_text: string }>;
}
