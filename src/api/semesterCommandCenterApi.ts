// src/api/semesterCommandCenterApi.ts
// Frontend API client for the Academic Semester Command Center.
// Every call goes to the backend and errors are passed to the caller, so pages never show
// sample data or a success message for an operation that did not happen.

import { apiClient } from './client';
import {
  SemesterOverviewDashboardData,
  AcademicSemesterConfig,
  SemesterSubject,
  SemesterUnit,
  AcademicEvent,
  SemesterStudyStreamNode,
  SlipTest,
  MinorExam,
  EndSemReadiness,
  AcademicRecoveryPlan,
} from '../types/semesterCommandCenter';

const unwrap = <T>(res: any): T => (res && res.data !== undefined ? res.data : res) as T;

const get = async <T>(path: string): Promise<T> => unwrap<T>(await apiClient.request<any>(path));
const send = async <T>(path: string, method: 'POST' | 'PUT' | 'PATCH', body?: unknown): Promise<T> =>
  unwrap<T>(
    await apiClient.request<any>(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

export const semesterCommandCenterApi = {
  // 1. Overview
  getOverview: (): Promise<SemesterOverviewDashboardData> => get('/semester/overview'),

  // 2. Semester config
  getConfig: (): Promise<AcademicSemesterConfig> => get('/semester/config'),
  updateConfig: (configUpdate: Partial<AcademicSemesterConfig>): Promise<AcademicSemesterConfig> =>
    send('/semester/config', 'PATCH', configUpdate),

  // 3. Subjects
  getSubjects: (): Promise<SemesterSubject[]> => get('/semester/subjects'),
  addSubject: (
    subject: Omit<SemesterSubject, 'id' | 'semester_id' | 'progress_percent' | 'syllabus_remaining_percent' | 'units'> & {
      units?: SemesterUnit[];
    }
  ): Promise<SemesterSubject> => send('/semester/subjects', 'POST', subject),
  updateSubjectUnits: (subjectId: string, units: SemesterUnit[]): Promise<SemesterSubject> =>
    send(`/semester/subjects/${encodeURIComponent(subjectId)}/units`, 'PUT', { units }),

  // 4. Events & calendar
  getEvents: (): Promise<AcademicEvent[]> => get('/semester/events'),
  addEvent: (eventData: Omit<AcademicEvent, 'id' | 'student_id'>): Promise<AcademicEvent> =>
    send('/semester/events', 'POST', eventData),

  // 5. Study stream
  getStudyStream: (subjectId?: string): Promise<SemesterStudyStreamNode[]> =>
    get(subjectId ? `/semester/stream?subject_id=${encodeURIComponent(subjectId)}` : '/semester/stream'),
  updateStreamNodeStatus: (nodeId: string, status: SemesterStudyStreamNode['status']): Promise<SemesterStudyStreamNode> =>
    send(`/semester/stream/${encodeURIComponent(nodeId)}/status`, 'PATCH', { status }),

  // 6. Slip tests
  getSlipTests: (): Promise<SlipTest[]> => get('/semester/slip-tests'),
  addSlipTest: (testData: Omit<SlipTest, 'id'>): Promise<SlipTest> => send('/semester/slip-tests', 'POST', testData),
  recordSlipTestScore: (testId: string, score: number, weakTopics: string[]): Promise<SlipTest> =>
    send(`/semester/slip-tests/${encodeURIComponent(testId)}/score`, 'POST', { score, weak_topics: weakTopics }),

  // 7. Minor exams & end-sem readiness
  getMinorExams: (): Promise<MinorExam[]> => get('/semester/minors'),
  getEndSemReadiness: (): Promise<EndSemReadiness[]> => get('/semester/end-sem-readiness'),

  // 8. Recovery plans
  getRecoveryPlans: (): Promise<AcademicRecoveryPlan[]> => get('/semester/recovery'),
  resolveRecoveryPlan: async (planId: string): Promise<void> => {
    await send(`/semester/recovery/${encodeURIComponent(planId)}/resolve`, 'POST');
  },
};
