// server/models/knowledgeBaseTypes.ts
// Domain models and interfaces for the B.Tech AI Knowledge Base module

import { DocumentMetadata, DocumentProcessingStatus, DocumentCitation } from './types';

export type KnowledgeVisibility = 'PRIVATE' | 'COURSE_SHARED' | 'PUBLIC';

export type KnowledgeResourceType =
  | 'DOCUMENT_UPLOAD'
  | 'OFFICIAL_DOCUMENTATION'
  | 'EDUCATIONAL_ARTICLE'
  | 'RESEARCH_PAPER'
  | 'VIDEO_LINK'
  | 'LECTURE_RESOURCE'
  | 'COURSE_WEBPAGE'
  | 'REFERENCE_WEBSITE'
  | 'PERSONAL_STUDY_NOTE';

export type ResourceIndexingStatus =
  | 'LINK_SAVED'
  | 'CONTENT_RETRIEVED'
  | 'CONTENT_INDEXED'
  | 'RETRIEVAL_UNAVAILABLE';

export interface KnowledgeCollection {
  id: string;
  student_id: string;
  name: string;
  code?: string;
  description: string;
  color?: string;
  icon?: string;
  subject?: string;
  course_id?: string;
  course_title?: string;
  semester?: number;
  tags: string[];
  document_ids: string[];
  resource_ids: string[];
  is_default?: boolean;
  visibility: KnowledgeVisibility;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeResource {
  id: string;
  student_id: string;
  collection_id?: string;
  collection_name?: string;
  title: string;
  resource_type: KnowledgeResourceType;
  url?: string;
  description?: string;
  subject?: string;
  course_id?: string;
  course_title?: string;
  semester?: number;
  topic?: string;
  tags: string[];
  personal_notes?: string;
  indexing_status: ResourceIndexingStatus;
  extracted_text?: string;
  indexed_chunk_count?: number;
  last_retrieved_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocumentVersion {
  version_number: number;
  storage_key: string;
  file_hash: string;
  file_size: number;
  uploaded_at: string;
  change_notes?: string;
}

export interface KnowledgeDocumentEntity {
  id: string;
  student_id: string;
  title: string;
  original_filename: string;
  description?: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  storage_key: string;
  collection_id?: string;
  collection_name?: string;
  subject?: string;
  course_id?: string;
  course_title?: string;
  semester?: number;
  topic?: string;
  tags: string[];
  visibility: KnowledgeVisibility;
  status: DocumentProcessingStatus;
  page_count: number;
  chunk_count: number;
  current_version: number;
  versions: KnowledgeDocumentVersion[];
  is_favorite: boolean;
  is_bookmarked: boolean;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export type KnowledgeBookmarkType =
  | 'DOCUMENT'
  | 'PAGE'
  | 'SECTION'
  | 'AI_ANSWER'
  | 'EXCERPT';

export interface KnowledgeBookmark {
  id: string;
  student_id: string;
  document_id: string;
  document_title: string;
  collection_id?: string;
  page_number?: number;
  section_title?: string;
  excerpt?: string;
  notes?: string;
  type: KnowledgeBookmarkType;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeAnnotationNote {
  id: string;
  student_id: string;
  document_id: string;
  document_title: string;
  collection_id?: string;
  page_number?: number;
  section_title?: string;
  content: string;
  tags: string[];
  color?: string;
  created_at: string;
  updated_at: string;
}

export type KnowledgeAskScope =
  | 'ALL_KNOWLEDGE'
  | 'COLLECTION'
  | 'COURSE'
  | 'DOCUMENTS'
  | 'CURRENT_DOCUMENT';

export interface KnowledgeAskRequest {
  question: string;
  scope: KnowledgeAskScope;
  collection_id?: string;
  course_id?: string;
  document_ids?: string[];
  current_document_id?: string;
  current_page?: number;
  conversation_id?: string;
}

export interface KnowledgeSourceCitation {
  citation_id: string;
  document_id: string;
  document_title: string;
  collection_id?: string;
  collection_name?: string;
  page_number: number;
  section_title?: string;
  chunk_id: string;
  quoted_text: string;
  similarity_score: number;
}

export interface KnowledgeAskResponse {
  answer: string;
  citations: KnowledgeSourceCitation[];
  confidence: 'GROUNDED' | 'PARTIAL' | 'NOT_FOUND';
  disclaimer?: string;
  scope_used: {
    scope: KnowledgeAskScope;
    searched_document_count: number;
    searched_chunk_count: number;
  };
  conversation_id: string;
  created_at: string;
}

export interface KnowledgeQuestionRecord {
  id: string;
  student_id: string;
  conversation_id: string;
  question: string;
  answer: string;
  scope: KnowledgeAskScope;
  scope_target_name?: string;
  citations: KnowledgeSourceCitation[];
  confidence: 'GROUNDED' | 'PARTIAL' | 'NOT_FOUND';
  created_at: string;
}

export type StudyMaterialType =
  | 'CONCISE_SUMMARY'
  | 'DETAILED_SUMMARY'
  | 'REVISION_NOTES'
  | 'FLASHCARDS'
  | 'PRACTICE_QUIZ'
  | 'VIVA_QUESTIONS'
  | 'INTERVIEW_QUESTIONS'
  | 'TOPIC_COMPARISON';

export interface StudyMaterialGenerationRequest {
  document_id?: string;
  collection_id?: string;
  topic?: string;
  output_type: StudyMaterialType;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  length?: 'SHORT' | 'STANDARD' | 'COMPREHENSIVE';
  page_range?: { start_page: number; end_page: number };
}

export interface GeneratedStudyMaterial {
  id: string;
  student_id: string;
  title: string;
  output_type: StudyMaterialType;
  source_document_id?: string;
  source_document_title?: string;
  source_collection_id?: string;
  topic?: string;
  content: string; // Markdown formatted
  structured_data?: {
    flashcards?: Array<{ front: string; back: string; tags: string[] }>;
    quiz_questions?: Array<{
      question: string;
      options: string[];
      correct_answer_index: number;
      explanation: string;
    }>;
    viva_questions?: Array<{ question: string; ideal_answer: string; key_points: string[] }>;
  };
  saved_to_module?: 'notes' | 'flashcards' | 'quiz';
  saved_module_id?: string;
  created_at: string;
}

export interface KnowledgeDashboardStats {
  total_documents: number;
  total_collections: number;
  indexed_documents: number;
  total_resources: number;
  total_bookmarks: number;
  total_questions_asked: number;
  total_study_materials: number;
  queue_pending_count: number;
}
