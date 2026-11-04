// src/features/labs/types/labAssistantTypes.ts
// Frontend domain models and interfaces for Lab Assistant

export type LabType =
  | 'PROGRAMMING'
  | 'DBMS'
  | 'AI_ML'
  | 'NETWORKS'
  | 'HARDWARE'
  | 'OPERATING_SYSTEMS'
  | 'WEB_DEVELOPMENT'
  | 'GENERAL';

export type ExperimentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type VivaDifficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

export interface VivaQuestionItem {
  id: string;
  question: string;
  expected_concept: string;
  difficulty?: VivaDifficulty;
  student_answer?: string;
  is_revision_marked?: boolean;
  ai_evaluation?: {
    score: number; // 0 - 10
    correctness: string;
    missing_concepts: string[];
    clarity: string;
    improvement: string;
    evaluated_at?: string;
  };
}

export interface ProcedureStepItem {
  id: string;
  step_number: number;
  text: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface ObservationColumn {
  id: string;
  name: string;
  unit?: string;
  formula?: string;
}

export interface ObservationTable {
  headers: string[];
  rows: string[][];
  columns?: ObservationColumn[];
  table_rows?: Record<string, string>[];
  notes?: string;
}

export interface AIExplanations {
  theory_simplified?: string;
  code_explained?: string;
  algorithm_breakdown?: string[];
  troubleshooting_tips?: string[];
  generated_at?: string;
}

export interface LabExperimentDetail {
  id: string;
  lab_id: string;
  student_id: string;
  experiment_number: number;
  title: string;
  aim: string;
  objective?: string;
  problem_statement?: string;
  theory: string;
  prerequisites?: string[];
  requirements: string[];
  required_software?: string[];
  required_hardware?: string[];
  required_libraries?: string[];
  procedure_steps: ProcedureStepItem[];
  procedure: string[];
  algorithm?: string;
  implementation_code?: string;
  source_code?: string;
  code_language?: string;
  expected_output: string;
  sample_input?: string;
  sample_output?: string;
  actual_output?: string;
  execution_status?: 'SUCCESS' | 'ERROR' | 'UNTESTED';
  execution_duration_ms?: number;
  result_conclusion: string;
  conclusion?: string;
  viva_questions: VivaQuestionItem[];
  references?: string[];
  faculty_notes?: string;
  student_notes?: string;
  ai_explanations?: AIExplanations;
  observation_table?: ObservationTable;
  status: ExperimentStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LabManualSourceFile {
  filename: string;
  mimetype: string;
  size_bytes: number;
  storage_path?: string;
  uploaded_at: string;
  text_length?: number;
  page_count?: number;
}

export interface LabManual {
  id: string;
  lab_id: string;
  student_id: string;
  title: string;
  subject: string;
  course_code?: string;
  semester: number;
  department?: string;
  lab_type: LabType;
  tools?: string;
  description?: string;
  instructions?: string;
  source_file?: LabManualSourceFile;
  extracted_raw_text?: string;
  is_draft: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface LabCourse {
  id: string;
  student_id: string;
  name: string;
  title?: string;
  subject: string;
  course_code: string;
  semester: number;
  branch: string;
  department?: string;
  university_or_college?: string;
  academic_year?: string;
  faculty_name?: string;
  description?: string;
  lab_type: LabType;
  tools_or_languages?: string;
  manual_title?: string;
  additional_instructions?: string;
  experiments_count: number;
  completed_experiments_count: number;
  in_progress_experiments_count: number;
  manual_id?: string;
  experiments?: LabExperimentDetail[];
  created_at: string;
  updated_at: string;
}

export interface LabCodeDraft {
  student_id: string;
  experiment_id: string;
  code: string;
  language: string;
  stdin?: string;
  last_output?: string;
  last_error?: string;
  execution_duration_ms?: number;
  updated_at: string;
}

export interface LabDoubtMessage {
  id: string;
  student_id: string;
  experiment_id: string;
  sender: 'student' | 'assistant';
  text: string;
  code_snippet?: string;
  timestamp: string;
}

export interface LabReportData {
  report_id: string;
  student_id: string;
  lab_id: string;
  experiment_id: string;
  student_name?: string;
  student_roll_no?: string;
  lab_title: string;
  course_code: string;
  subject: string;
  semester: number;
  department?: string;
  experiment_number: number;
  experiment_title: string;
  date_performed: string;
  aim: string;
  theory: string;
  requirements: string[];
  algorithm?: string;
  procedure: string[];
  source_code?: string;
  code_language?: string;
  actual_input?: string;
  actual_output?: string;
  expected_output?: string;
  observation_table?: ObservationTable;
  result_conclusion: string;
  viva_questions?: { question: string; student_answer?: string; expected_concept: string }[];
  student_notes?: string;
  generated_at: string;
}

export interface StudentLabAnalytics {
  total_labs: number;
  total_experiments: number;
  completed_experiments: number;
  in_progress_experiments: number;
  not_started_experiments: number;
  total_manuals_uploaded: number;
  total_code_runs: number;
  total_viva_attempted: number;
  average_viva_score: number;
  reports_generated: number;
  is_onboarding: boolean;
}
