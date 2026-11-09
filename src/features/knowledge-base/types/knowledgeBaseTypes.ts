// src/features/knowledge-base/types/knowledgeBaseTypes.ts
// Frontend domain models and types for AI Knowledge Base

import { DocumentCardData } from '../../documents/types/document';

export type KnowledgeCategory =
  | 'COURSEWORK'
  | 'TEXTBOOK'
  | 'RESEARCH_PAPER'
  | 'LAB_MANUAL'
  | 'LECTURE_NOTES'
  | 'EXAM_PAPER'
  | 'GATE_EXAM'
  | 'INTERVIEW_PREP'
  | 'PROJECT_DOCS'
  | 'GENERAL_STUDY';

export interface KnowledgeCollection {
  id: string;
  student_id: string;
  name: string;
  code?: string;
  description?: string;
  category: KnowledgeCategory;
  subject?: string;
  semester?: number;
  tags: string[];
  color: string;
  icon: string;
  is_favorite: boolean;
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  document_ids: string[];
  resource_ids: string[];
  document_count: number;
  resource_count: number;
  notes_count: number;
  total_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeResource {
  id: string;
  student_id: string;
  collection_id?: string;
  title: string;
  description?: string;
  url: string;
  type: 'LINK' | 'VIDEO' | 'PAPER' | 'CODE_REPO';
  created_at: string;
}

export interface KnowledgeBookmark {
  id: string;
  student_id: string;
  document_id: string;
  page_number: number;
  title: string;
  note?: string;
  created_at: string;
}

export interface KnowledgeAnnotationNote {
  id: string;
  student_id: string;
  document_id: string;
  page_number: number;
  selected_text?: string;
  note_text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface GroundedCitation {
  document_id: string;
  document_title: string;
  page_number: number;
  chunk_id: string;
  snippet: string;
  confidence: number;
}

export interface KnowledgeQuestionRecord {
  id: string;
  student_id: string;
  document_id?: string;
  collection_id?: string;
  question: string;
  answer: string;
  citations: GroundedCitation[];
  key_concepts: string[];
  follow_up_questions: string[];
  confidence_score: number;
  answer_mode?: 'AI_MODEL' | 'EXTRACTIVE' | 'NO_SOURCES';
  confidence_basis?: 'RETRIEVAL_SIMILARITY';
  created_at: string;
}

export type StudyMaterialType =
  | 'SUMMARY'
  | 'FLASHCARDS'
  | 'QUIZ'
  | 'FORMULA_SHEET'
  | 'STUDY_GUIDE'
  | 'DISCUSSION_POINTS';

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  topic: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  description: string;
  variables: string;
  complexity?: string;
}

export interface SummaryContent {
  title?: string;
  summary: string;
  key_takeaways: string[];
  prerequisites?: string[];
  core_formulas?: string[];
}

export interface GeneratedStudyMaterial {
  id: string;
  student_id: string;
  source_document_id: string;
  type: StudyMaterialType;
  title: string;
  content: {
    summary?: string;
    key_takeaways?: string[];
    prerequisites?: string[];
    flashcards?: FlashcardItem[];
    quiz_questions?: QuizQuestionItem[];
    formula_sheet?: FormulaItem[];
    study_guide_markdown?: string;
  };
  created_at: string;
}

export interface KnowledgeSearchMatch {
  document_id: string;
  document_title: string;
  page_number: number;
  chunk_id: string;
  snippet: string;
  score: number;
  mime_type?: string;
}

export interface KnowledgeSearchResult {
  query: string;
  total_matches: number;
  matches: KnowledgeSearchMatch[];
  collections: KnowledgeCollection[];
}

export interface KnowledgeDashboardStats {
  total_documents: number;
  total_collections: number;
  indexed_documents: number;
  pending_documents: number;
  failed_documents: number;
  total_bookmarks: number;
  total_notes: number;
  total_questions_asked: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  is_onboarding: boolean;
  recent_documents: DocumentCardData[];
  recent_resources?: KnowledgeResource[];
  recent_bookmarks?: KnowledgeBookmark[];
  recent_questions?: KnowledgeQuestionRecord[];
  processing_queue?: DocumentCardData[];
  course_knowledge_bases?: Array<{
    code: string;
    title: string;
    docCount: number;
    collectionCount: number;
    collection_id?: string;
  }>;
  collections_breakdown: Array<{
    category: KnowledgeCategory;
    count: number;
    label: string;
  }>;
}

export interface CreateCollectionInput {
  name: string;
  code?: string;
  description?: string;
  category: KnowledgeCategory;
  subject?: string;
  semester?: number;
  tags?: string[];
  color?: string;
  icon?: string;
  visibility?: 'PRIVATE' | 'SHARED' | 'PUBLIC';
}

export interface UpdateCollectionInput {
  name?: string;
  code?: string;
  description?: string;
  category?: KnowledgeCategory;
  subject?: string;
  semester?: number;
  tags?: string[];
  color?: string;
  icon?: string;
  is_favorite?: boolean;
  visibility?: 'PRIVATE' | 'SHARED' | 'PUBLIC';
}

export interface AskKnowledgeQuestionInput {
  question: string;
  document_id?: string;
  collection_id?: string;
  stream?: boolean;
}

export interface AskKnowledgeQuestionResponse {
  id: string;
  question: string;
  answer: string;
  citations: GroundedCitation[];
  key_concepts: string[];
  follow_up_questions: string[];
  confidence_score: number;
  answer_mode?: 'AI_MODEL' | 'EXTRACTIVE' | 'NO_SOURCES';
  confidence_basis?: 'RETRIEVAL_SIMILARITY';
  created_at: string;
}

export interface GenerateStudyMaterialInput {
  document_id: string;
  type: StudyMaterialType;
  topic?: string;
  target_count?: number;
}

export interface KnowledgeSearchFilters {
  query?: string;
  limit?: number;
  document_id?: string;
  collection_id?: string;
}
