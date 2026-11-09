export type UserRole = 'STUDENT' | 'SUPER_ADMIN';

export interface Student {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  branch: string;
  semester: number;
  role: UserRole;
  is_active: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';
  status_reason?: string;
  avatar_url?: string;
  display_name?: string;
  onboarding_completed?: boolean;
  /** Phase 5 identity fields. firebase_uid is unique and set only by the server from a verified ID token. */
  auth_provider?: 'legacy' | 'firebase';
  firebase_uid?: string;
  email_verified?: boolean;
  phone?: string;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type SafeStudent = Omit<Student, 'password_hash'>;

export interface Notification {
  id: string;
  student_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface StorageRecord {
  id: string;
  student_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  category: 'document' | 'notes' | 'resume' | 'project' | 'attachment';
  created_at: string;
}

export type SearchCategory =
  | 'courses'
  | 'lessons'
  | 'notes'
  | 'documents'
  | 'projects'
  | 'dsa'
  | 'coding'
  | 'ai'
  | 'community'
  | 'research'
  | 'github';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: SearchCategory;
  url: string;
  tags: string[];
  relevanceScore?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ----------------- Dashboard Types (Phase 2) -----------------
export interface DashboardStudent {
  id: string;
  name: string;
  email: string;
  branch: string;
  semester: number;
  role: UserRole;
  avatar_url?: string;
  learning_streak: number;
  focus_topic: string;
}

export interface DashboardSummary {
  overall_progress: number;
  streak_days: number;
  longest_streak: number;
  courses_active: number;
  projects_active: number;
  dsa_solved: number;
  study_hours_this_week: number;
  credits_completed: number;
  total_credits: number;
}

export interface ContinueLearningItem {
  course_id: string;
  course_name: string;
  lesson_id: string;
  lesson_title: string;
  progress: number;
  next_topic: string;
  category: string;
  total_lessons: number;
  completed_lessons: number;
}

export interface TodayPlanTask {
  id: string;
  title: string;
  type: 'dsa' | 'course' | 'notes' | 'quiz' | 'project';
  estimated_time: string;
  is_completed: boolean;
  action_url: string;
}

export interface CourseProgressItem {
  id: string;
  name: string;
  code: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string;
  category: string;
  color?: string;
}

export interface LearningRecommendation {
  id: string;
  title: string;
  type: 'course' | 'dsa' | 'project' | 'quiz' | 'notes';
  reason: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_time: string;
  action_url: string;
}

export interface SkillArea {
  topic: string;
  score: number;
  subject: string;
  recommendation?: string;
  action_url?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: 'lesson' | 'dsa' | 'quiz' | 'note' | 'document' | 'project';
  timestamp: string;
  formatted_time: string;
  link: string;
  status: 'completed' | 'submitted' | 'active';
}

export interface ActiveProjectItem {
  id: string;
  title: string;
  progress: number;
  current_milestone: string;
  next_step: string;
  tech_stack: string[];
  link: string;
}

export interface UpcomingCalendarItem {
  id: string;
  title: string;
  type: 'quiz' | 'exam' | 'assignment' | 'milestone' | 'interview';
  date: string;
  time: string;
  status: string;
  link: string;
}

export interface RecentBookmarkItem {
  id: string;
  title: string;
  type: string;
  link: string;
  created_at: string;
}

export interface DashboardAnalytics {
  weekly_study_minutes: { day: string; minutes: number; problems_solved: number }[];
  category_distribution: { category: string; progress: number }[];
}

export interface DashboardData {
  student: DashboardStudent;
  summary: DashboardSummary;
  continue_learning: ContinueLearningItem | null;
  today_plan: TodayPlanTask[];
  course_progress: CourseProgressItem[];
  recommendations: LearningRecommendation[];
  weak_areas: SkillArea[];
  strengths: SkillArea[];
  recent_activity: RecentActivityItem[];
  projects: ActiveProjectItem[];
  upcoming_items: UpcomingCalendarItem[];
  bookmarks: RecentBookmarkItem[];
  analytics: DashboardAnalytics;
  is_new_student: boolean;
  recent_documents?: DocumentCardData[];
}

// ----------------- AI Learning Agent Types (Phase 3) -----------------
export interface AIConversation {
  id: string;
  student_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  message_count?: number;
}

export interface ToolExecutionSummary {
  id: string;
  tool_name: string;
  status: 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result?: any;
}

export interface AgentPlanItem {
  step: number;
  title: string;
  description: string;
  note?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AICitationItem {
  id: string;
  title: string;
  source: string;
  page?: number | string;
  link?: string;
}

export interface AIAttachmentItem {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  url?: string;
}

export interface AIMessageMetadata {
  toolCalls?: ToolExecutionSummary[];
  agentPlan?: AgentPlanItem[];
  suggestedActions?: string[];
  citations?: AICitationItem[];
  attachments?: AIAttachmentItem[];
  documentId?: string;
  currentPage?: number;
  [key: string]: any;
  feedback?: {
    is_helpful: boolean;
    reason?: string;
  };
}

export interface AIMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: AIMessageMetadata;
}

export interface ToolExecutionRecord {
  id: string;
  conversation_id: string;
  message_id: string;
  tool_name: string;
  status: 'running' | 'completed' | 'failed';
  input_metadata: Record<string, any>;
  result_metadata?: any;
  created_at: string;
  completed_at?: string;
}

export interface MessageFeedback {
  id: string;
  message_id: string;
  student_id: string;
  is_helpful: boolean;
  reason?: string;
  created_at: string;
}

export interface AIAttachmentRecord {
  id: string;
  student_id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
}

export interface StudentLearningContext {
  student: SafeStudent;
  current_course: {
    name: string;
    code: string;
    progress: number;
  };
  current_lesson: {
    title: string;
    topic: string;
    progress: number;
  };
  current_project: {
    title: string;
    progress: number;
    milestone: string;
  };
  recent_topics: string[];
  weak_areas: string[];
  suggested_actions: string[];
}

// ----------------- Courses & Learning Module Types (Phase 4) -----------------
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LessonType = 'TEXT' | 'VIDEO' | 'READING' | 'CODE' | 'QUIZ';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED';
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  short_description: string;
  branch: string;
  semester: number;
  difficulty: CourseDifficulty;
  thumbnail: string;
  estimated_minutes: number;
  is_published: boolean;
  prerequisites: string[];
  skills: string[];
  academic_year?: string;
  instructor?: string;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  is_custom?: boolean;
  student_id?: string;
  linked_subject_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  chapter_id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  lesson_type: LessonType;
  order_index: number;
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string;
  is_archived?: boolean;
  archived_at?: string;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  course_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface CourseBookmark {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  chapter_id?: string;
  title: string;
  type: 'PDF' | 'NOTES' | 'CODE' | 'LINK' | 'DOCUMENT';
  url: string;
  size_bytes?: number;
  document_id?: string;
  note_id?: string;
  processing_status?: 'READY' | 'PROCESSING' | 'NOT_INDEXED';
  /** Student who attached this resource. Seeded catalog resources have no owner and are shared. */
  student_id?: string;
}

export interface LessonWithNavigation extends CourseLesson {
  course_title: string;
  course_code: string;
  chapter_title: string;
  prev_lesson?: { id: string; title: string } | null;
  next_lesson?: { id: string; title: string } | null;
  is_completed: boolean;
  progress_percentage: number;
}

export interface CourseChapterWithLessons extends CourseChapter {
  lessons: (CourseLesson & {
    is_completed?: boolean;
    is_current?: boolean;
    progress_percentage?: number;
  })[];
}

export interface CourseWithDetails extends Course {
  chapters: CourseChapterWithLessons[];
  enrollment?: CourseEnrollment | null;
  is_enrolled?: boolean;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  is_bookmarked: boolean;
  is_archived?: boolean;
  last_studied_at?: string;
  next_recommended_lesson?: { id: string; title: string };
  resources: CourseResource[];
  related_courses?: CourseCardData[];
}

export interface CourseCardData extends Course {
  total_lessons: number;
  completed_lessons?: number;
  progress_percentage?: number;
  is_enrolled?: boolean;
  is_bookmarked?: boolean;
  is_archived?: boolean;
  last_studied_at?: string;
  next_recommended_lesson?: { id: string; title: string };
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  total_chapters?: number;
}

export interface CreateCourseInput {
  title: string;
  code?: string;
  description?: string;
  branch?: string;
  semester?: number;
  academic_year?: string;
  difficulty?: CourseDifficulty;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  estimated_hours?: number;
  instructor?: string;
  linked_subject_id?: string;
  linked_document_ids?: string[];
  linked_note_ids?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  code?: string;
  description?: string;
  branch?: string;
  semester?: number;
  academic_year?: string;
  difficulty?: CourseDifficulty;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  instructor?: string;
}

export interface CourseAIAssistantRequest {
  action:
    | 'explain_simple'
    | 'practical_example'
    | 'step_by_step'
    | 'summarize_chapter'
    | 'revision_notes'
    | 'practice_questions'
    | 'flashcards'
    | 'explain_terms'
    | 'compare_concepts'
    | 'study_next'
    | 'revision_checklist';
  topic?: string;
  chapterId?: string;
  lessonId?: string;
  userQuery?: string;
}

export interface CourseAIAssistantResponse {
  action: string;
  result: string;
  key_points?: string[];
  practice_questions?: Array<{ question: string; answer: string; explanation?: string }>;
  flashcards?: Array<{ front: string; back: string }>;
  suggested_next_topic?: string;
  grounded_sources?: string[];
  is_fallback?: boolean;
}

// ----------------- Notes Models (Phase 5) -----------------
export type NoteSourceType = 'topic' | 'course' | 'lesson' | 'selected_content' | 'document';
export type NoteType = 'STUDY_NOTES' | 'EXAM_NOTES' | 'QUICK_REVISION' | 'INTERVIEW_NOTES' | 'DETAILED_NOTES';
export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type NoteLength = 'SHORT' | 'MEDIUM' | 'DETAILED';

export interface NoteSectionItem {
  id: string;
  title: string;
  content: string;
  order_index: number;
  section_type?: 'overview' | 'concept' | 'definition' | 'example' | 'formula' | 'code' | 'key_points' | 'common_mistakes' | 'exam_tips' | 'interview_qa' | 'summary' | 'practice';
}

export interface StructuredNoteContent {
  title: string;
  overview: string;
  learning_objectives: string[];
  sections: NoteSectionItem[];
  examples: { title: string; explanation: string; code?: string; language?: string }[];
  key_points: string[];
  common_mistakes: string[];
  exam_points: string[];
  interview_questions?: { question: string; answer: string; difficulty?: string }[];
  summary: string;
  practice_questions?: string[];
  formulas?: { name: string; latex: string; explanation: string }[];
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  content: string;
  title: string;
  created_at: string;
  created_by: string;
  summary_of_change?: string;
}

export interface Note {
  id: string;
  student_id: string;
  title: string;
  description: string;
  source_type: NoteSourceType;
  source_id?: string;
  source_title?: string;
  chapter_id?: string;
  lesson_id?: string;
  note_type: NoteType;
  level: StudentLevel;
  length: NoteLength;
  content: string;
  structured_data?: StructuredNoteContent;
  tags: string[];
  is_favorite: boolean;
  version: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NoteCardData {
  id: string;
  student_id: string;
  title: string;
  description: string;
  source_type: NoteSourceType;
  source_id?: string;
  source_title?: string;
  note_type: NoteType;
  level: StudentLevel;
  tags: string[];
  is_favorite: boolean;
  content_preview: string;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  concept: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  topic?: string;
}

export interface GenerateNotesRequest {
  source_type: NoteSourceType;
  topic?: string;
  course_id?: string;
  chapter_id?: string;
  lesson_id?: string;
  document_id?: string;
  selected_content?: string;
  level?: StudentLevel | 'beginner' | 'intermediate' | 'advanced';
  note_type?: NoteType | 'study' | 'exam' | 'quick_revision' | 'interview' | 'detailed';
  length?: NoteLength | 'short' | 'medium' | 'detailed';
  tags?: string[];
  metadata?: Record<string, any>;
}

// ----------------- Phase 6: Document AI Models -----------------
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
  storage_remaining_mb?: number;
  storage_usage_percentage: number;
  percentage_used?: number;
  documents_awaiting_processing: number;
  awaiting_processing?: number;
  recent_uploads_count: number;
  recent_uploads_7d?: number;
  category_breakdown: Record<string, number>;
  categories_breakdown?: Record<string, number>;
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
  content_indexed?: boolean;
  current_version?: number;
  version_count?: number;
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

// ----------------- Coding Lab Types (Phase 7) -----------------
export type CodingLanguage = 'python' | 'javascript' | 'c' | 'cpp' | 'java';

export type ExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'MEMORY_LIMIT'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'SECURITY_ERROR'
  | 'SYSTEM_ERROR';

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT'
  | 'MEMORY_LIMIT';

export type ProblemDifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';

export interface LanguageConfig {
  id: CodingLanguage;
  display_name: string;
  file_extension: string;
  compiler_command?: string;
  run_command: string;
  version_command: string;
  timeout: number;
  memory_limit_mb: number;
  enabled: boolean;
  boilerplate: string;
  /** First word of run/compile command that must exist on the host. */
  run_binary?: string;
  /** Alternative binary names tried in order when probing availability (e.g. python3, python). */
  binary_candidates?: string[];
  /** Filled in by LanguageRegistry.getAll(): whether the toolchain is installed on this server. */
  available?: boolean;
  availability_detail?: string;
}

export interface ExecutionResult {
  execution_id?: string;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_kb?: number;
  error_message?: string;
  /** How the program was isolated from the host: 'namespace', 'rlimit-only' or 'none'. */
  isolation?: string;
}

export interface CodingSession {
  id: string;
  student_id: string;
  language: CodingLanguage;
  source_code: string;
  stdin: string;
  problem_id?: string;
  status: 'active' | 'archived';
  last_execution_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedCode {
  id: string;
  student_id: string;
  title: string;
  language: CodingLanguage;
  source_code: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

export interface CodeExecution {
  id: string;
  student_id: string;
  session_id?: string;
  problem_id?: string;
  language: CodingLanguage;
  source_code_snapshot: string;
  stdin: string;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_kb?: number;
  created_at: string;
}

export interface CodingTestCase {
  id: string;
  problem_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
  created_at: string;
}

export interface PublicTestCase {
  id: string;
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface CodingProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  topic: string;
  constraints: string[];
  input_format: string;
  output_format: string;
  examples: CodingProblemExample[];
  starter_code: Record<CodingLanguage, string>;
  supported_languages: CodingLanguage[];
  tags: string[];
  hints: string[];
  created_at: string;
  updated_at: string;
}

export interface CodeSubmission {
  id: string;
  student_id: string;
  problem_id: string;
  language: CodingLanguage;
  source_code: string;
  status: SubmissionStatus;
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  test_results: {
    test_index: number;
    passed: boolean;
    is_hidden: boolean;
    input?: string;
    expected_output?: string;
    actual_output?: string;
    error?: string;
    execution_time_ms: number;
  }[];
  created_at: string;
}

export interface CodingProgressSummary {
  problems_attempted: number;
  problems_completed: number;
  languages_used: string[];
  topics_practiced: string[];
  total_executions: number;
  recent_sessions: {
    id: string;
    language: CodingLanguage;
    updated_at: string;
    problem_title?: string;
  }[];
}

export interface CodeExplanationResult {
  overview: string;
  step_by_step: string[];
  important_concepts: string[];
  time_complexity: string;
  space_complexity: string;
  potential_issues: string[];
  suggestions: string[];
}

export interface CodeDebugResult {
  problem: string;
  cause: string;
  location?: string;
  explanation: string;
  suggested_fix: string;
  corrected_code: string;
}

export interface CodeGenerationResult {
  explanation: string;
  code: string;
  language: string;
  example_input: string;
  example_output: string;
  complexity: string;
}

export interface CodeRefactorResult {
  current_code: string;
  suggested_code: string;
  changes: string[];
  reason: string;
}

export interface GeneratedTestCase {
  type: 'normal' | 'boundary' | 'edge' | 'invalid';
  input: string;
  expected: string;
  explanation: string;
}

export interface CodeReviewResult {
  correctness: string;
  readability: string;
  maintainability: string;
  complexity: string;
  edge_cases: string[];
  possible_bugs: string[];
  security_issues: string[];
  style_improvements: string[];
}

export interface CodeHintResult {
  level: number;
  hint: string;
  has_more: boolean;
  total_hints: number;
}

export * from './dsaTypes';
