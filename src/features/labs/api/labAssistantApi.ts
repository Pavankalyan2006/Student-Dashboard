// src/features/labs/api/labAssistantApi.ts
// Frontend API Client for Lab Assistant & Interactive Experiment Suite

import { apiClient } from '../../../api/client';
import { runInBrowser } from '../../../lib/browserSandbox';
import { loadLanguageAvailability } from '../../coding/hooks/useLanguageAvailability';
import {
  LabCourse,
  LabManual,
  LabExperimentDetail,
  ObservationTable,
  LabReportData,
  StudentLabAnalytics,
  VivaQuestionItem,
  LabDoubtMessage,
} from '../types/labAssistantTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const labAssistantApi = {
  // 1. Laboratories CRUD
  getLabs: async (): Promise<LabCourse[]> => {
    const res = await apiClient.get('/labs');
    return unpack(res) || [];
  },

  getLab: async (labId: string): Promise<LabCourse> => {
    const res = await apiClient.get(`/labs/${labId}`);
    return unpack(res);
  },

  createLab: async (data: Partial<LabCourse>): Promise<LabCourse> => {
    const res = await apiClient.post('/labs', data);
    return unpack(res);
  },

  updateLab: async (labId: string, data: Partial<LabCourse>): Promise<LabCourse> => {
    const res = await apiClient.put(`/labs/${labId}`, data);
    return unpack(res);
  },

  deleteLab: async (labId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/labs/${labId}`);
    return unpack(res)?.deleted || true;
  },

  // 2. Manual Entry & Upload
  saveManualDetails: async (
    labId: string,
    manual: Partial<LabManual>,
    experiments: Partial<LabExperimentDetail>[]
  ): Promise<{ manual: LabManual; experiments: LabExperimentDetail[] }> => {
    const res = await apiClient.post(`/labs/${labId}/manual`, { manual, experiments });
    return unpack(res);
  },

  uploadManual: async (
    labId: string,
    fileData: string,
    filename: string,
    mimetype: string
  ): Promise<{
    raw_text: string;
    page_count: number;
    extracted_metadata: any;
    candidate_experiments: Partial<LabExperimentDetail>[];
  }> => {
    const res = await apiClient.post(`/labs/${labId}/upload`, {
      file_data: fileData,
      filename,
      mimetype,
    });
    return unpack(res);
  },

  extractWithAi: async (
    labId: string,
    rawText: string,
    instructions?: string
  ): Promise<Partial<LabExperimentDetail>[]> => {
    const res = await apiClient.post(`/labs/${labId}/extract-ai`, {
      raw_text: rawText,
      instructions,
    });
    return unpack(res) || [];
  },

  // 3. Experiments
  getExperiments: async (labId: string): Promise<LabExperimentDetail[]> => {
    const res = await apiClient.get(`/labs/${labId}/experiments`);
    return unpack(res) || [];
  },

  getExperiment: async (labId: string, expId: string): Promise<LabExperimentDetail> => {
    const res = await apiClient.get(`/labs/${labId}/experiments/${expId}`);
    return unpack(res);
  },

  createExperiment: async (labId: string, expData: Partial<LabExperimentDetail>): Promise<LabExperimentDetail> => {
    const res = await apiClient.post(`/labs/${labId}/experiments`, expData);
    return unpack(res);
  },

  updateExperiment: async (
    labId: string,
    expId: string,
    expData: Partial<LabExperimentDetail>
  ): Promise<LabExperimentDetail> => {
    const res = await apiClient.put(`/labs/${labId}/experiments/${expId}`, expData);
    return unpack(res);
  },

  deleteExperiment: async (labId: string, expId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/labs/${labId}/experiments/${expId}`);
    return unpack(res)?.deleted || true;
  },

  reorderExperiments: async (labId: string, experimentIds: string[]): Promise<LabExperimentDetail[]> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/reorder`, {
      experiment_ids: experimentIds,
    });
    return unpack(res) || [];
  },

  // 4. Checklist & Notes
  toggleChecklist: async (
    labId: string,
    expId: string,
    stepId: string,
    isCompleted: boolean
  ): Promise<{ checklist: Record<string, boolean>; experiment: LabExperimentDetail }> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/checklist`, {
      step_id: stepId,
      is_completed: isCompleted,
    });
    return unpack(res);
  },

  resetChecklist: async (
    labId: string,
    expId: string
  ): Promise<{ checklist: Record<string, boolean>; experiment: LabExperimentDetail }> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/checklist/reset`);
    return unpack(res);
  },

  saveNotes: async (labId: string, expId: string, notes: string): Promise<LabExperimentDetail> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/notes`, {
      student_notes: notes,
    });
    return unpack(res);
  },

  // 5. Code & SQL Execution
  runCode: async (
    labId: string,
    expId: string,
    code: string,
    language: string,
    stdin?: string
  ): Promise<{
    stdout: string;
    stderr: string;
    executionTimeMs: number;
    status: 'SUCCESS' | 'ERROR';
  }> => {
    // Without a server sandbox (as on Vercel), Python and JavaScript run in an isolated worker in this browser.
    // The code and what it printed are saved with the experiment, marked as a browser run.
    if ((await loadLanguageAvailability())[language]?.runs === 'browser') {
      const r = await runInBrowser({ language: language as 'python' | 'javascript', source: code, stdin });
      await apiClient
        .post(`/labs/${labId}/experiments/${expId}/code/save`, { code, language, stdin, browser_result: { stdout: r.stdout, stderr: r.stderr, execution_time_ms: r.execution_time_ms, status: r.status } })
        .catch(() => undefined);
      return { stdout: r.stdout, stderr: r.stderr, executionTimeMs: r.execution_time_ms, status: r.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR' };
    }
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/code/run`, {
      code,
      language,
      stdin,
    });
    return unpack(res);
  },

  saveCodeDraft: async (
    labId: string,
    expId: string,
    code: string,
    language: string,
    stdin?: string
  ): Promise<any> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/code/save`, {
      code,
      language,
      stdin,
    });
    return unpack(res);
  },

  runSql: async (
    labId: string,
    expId: string,
    query: string,
    dbName: string = 'university_db'
  ): Promise<{
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    status: 'SUCCESS' | 'ERROR';
    errorMessage?: string;
  }> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/sql/run`, {
      query,
      db_name: dbName,
    });
    return unpack(res);
  },

  // 6. Observation Tables
  saveObservationTable: async (
    labId: string,
    expId: string,
    observationTable: ObservationTable
  ): Promise<LabExperimentDetail> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/observations`, {
      observation_table: observationTable,
    });
    return unpack(res);
  },

  // 7. Viva Voce
  evaluateViva: async (
    labId: string,
    expId: string,
    questionId: string,
    studentAnswer: string
  ): Promise<VivaQuestionItem> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/viva/${questionId}/evaluate`, {
      student_answer: studentAnswer,
    });
    return unpack(res);
  },

  generateViva: async (
    labId: string,
    expId: string,
    count: number = 3,
    difficulty: string = 'INTERMEDIATE'
  ): Promise<VivaQuestionItem[]> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/viva/generate`, {
      count,
      difficulty,
    });
    return unpack(res) || [];
  },

  // 8. Doubt Solving Assistant
  askDoubt: async (
    labId: string,
    expId: string,
    doubt: string,
    codeSnippet?: string
  ): Promise<{ answer: string }> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/doubt`, {
      doubt,
      code_snippet: codeSnippet,
    });
    return unpack(res);
  },

  getDoubtHistory: async (labId: string, expId: string): Promise<LabDoubtMessage[]> => {
    const res = await apiClient.get(`/labs/${labId}/experiments/${expId}/doubt`);
    return unpack(res) || [];
  },

  clearDoubtHistory: async (labId: string, expId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/labs/${labId}/experiments/${expId}/doubt`);
    return unpack(res)?.cleared || true;
  },

  // 9. Laboratory Reports
  generateReport: async (
    labId: string,
    expId: string,
    datePerformed?: string
  ): Promise<LabReportData> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/report`, {
      date_performed: datePerformed,
    });
    return unpack(res);
  },

  getReport: async (labId: string, expId: string): Promise<LabReportData> => {
    const res = await apiClient.get(`/labs/${labId}/experiments/${expId}/report`);
    return unpack(res);
  },

  // 10. Mark Complete & Analytics
  markComplete: async (labId: string, expId: string): Promise<LabExperimentDetail> => {
    const res = await apiClient.post(`/labs/${labId}/experiments/${expId}/complete`);
    return unpack(res);
  },

  getAnalytics: async (): Promise<StudentLabAnalytics> => {
    const res = await apiClient.get('/labs/analytics/summary');
    return unpack(res) || {
      total_labs: 0,
      total_experiments: 0,
      completed_experiments: 0,
      in_progress_experiments: 0,
      not_started_experiments: 0,
      total_manuals_uploaded: 0,
      total_code_runs: 0,
      total_viva_attempted: 0,
      average_viva_score: 0,
      reports_generated: 0,
      is_onboarding: true,
    };
  },
};
