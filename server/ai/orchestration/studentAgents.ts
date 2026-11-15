// The seven specialist agents a student sees in the AI Agent Control Center, each a group of the registry's
// internal agents. The AI Tutor's master agent routes every request to internal agents; a student who switches
// a specialist off removes its internal agents from their own requests. The core tutor stays on so a request
// always has an agent to answer it.
import type { AgentName } from './types';
import { AgentRegistry } from './registry';
import { AgentActivityService } from '../../services/agentActivityService';

export interface StudentAgent {
  id: string;
  name: string;
  purpose: string;
  members: AgentName[];
}

export const CORE_AGENTS: AgentName[] = ['LearningAgent', 'ProfileAgent'];

export const STUDENT_AGENTS: StudentAgent[] = [
  {
    id: 'academic',
    name: 'Academic agent',
    purpose: 'Explains your courses and syllabus, answers doubts, builds notes and flashcards, and searches your own documents.',
    members: ['CourseAgent', 'NotesAgent', 'DocumentRAGAgent', 'DoubtSolverAgent', 'LabAssistantAgent', 'VivaAgent', 'FlashcardAgent', 'KnowledgeBaseAgent', 'CommunityAgent'],
  },
  {
    id: 'coding',
    name: 'Coding agent',
    purpose: 'Debugs and explains code, data structures, SQL, system design and ML experiments, and reads your linked GitHub repositories.',
    members: ['CodingAgent', 'DSAAgent', 'DatabaseAgent', 'SQLDatabaseAgent', 'SystemDesignAgent', 'MLExperimentAgent', 'GitHubAgent', 'CodingPlatformAgent'],
  },
  {
    id: 'research',
    name: 'Research agent',
    purpose: 'Searches published papers and keeps where each finding came from.',
    members: ['ResearchAgent'],
  },
  {
    id: 'career',
    name: 'Career agent',
    purpose: 'Placement preparation, mock interviews, resume review, career roles, skill evidence and your job applications.',
    members: ['PlacementAgent', 'InterviewAgent', 'ResumeAgent', 'CareerAgent', 'SkillAgent', 'InternshipTrackerAgent', 'ApplicationTrackerAgent', 'JobPlatformAgent', 'ProfessionalProfileAgent', 'ExternalSkillEvidenceAgent', 'ExternalPlatformAgent'],
  },
  {
    id: 'project',
    name: 'Project manager agent',
    purpose: 'Plans your projects, breaks them into tasks and tracks milestones.',
    members: ['ProjectAgent'],
  },
  {
    id: 'exam',
    name: 'Exam agent',
    purpose: 'Builds practice quizzes, exam preparation and spaced revision from your syllabus and mistakes.',
    members: ['QuizAgent', 'ExamPreparationAgent', 'RevisionAgent'],
  },
  {
    id: 'productivity',
    name: 'Productivity agent',
    purpose: 'Study schedules from your exam dates, progress summaries and next steps from real platform resources.',
    members: ['StudyPlannerAgent', 'ProgressAgent', 'RecommendationAgent'],
  },
];

export const studentAgentById = (id: string) => STUDENT_AGENTS.find((a) => a.id === id);

/** Internal agents this student has switched off. */
export function disabledFor(studentId: string): Set<AgentName> {
  const off = new Set<AgentName>();
  for (const id of AgentActivityService.prefs(studentId).disabled) {
    for (const m of studentAgentById(id)?.members || []) off.add(m);
  }
  return off;
}

/**
 * Removes the agents the student switched off from a routed request. When nothing is left, the core tutor
 * answers instead, so a request is never dropped.
 */
export function applyStudentPrefs(studentId: string, agents: AgentName[]): { agents: AgentName[]; skipped: AgentName[] } {
  const off = disabledFor(studentId);
  const kept = agents.filter((a) => !off.has(a));
  const skipped = agents.filter((a) => off.has(a));
  if (kept.length === 0) kept.push('LearningAgent');
  return { agents: kept, skipped };
}

/** The Control Center view: each specialist, whether it is on for this student and on platform-wide. */
export function studentAgentView(studentId: string) {
  const prefs = AgentActivityService.prefs(studentId);
  return STUDENT_AGENTS.map((a) => {
    const defs = a.members.map((m) => AgentRegistry.get(m)).filter(Boolean) as any[];
    return {
      id: a.id,
      name: a.name,
      purpose: a.purpose,
      enabled: !prefs.disabled.includes(a.id),
      available: a.members.some((m) => AgentRegistry.isEnabled(m)),
      members: defs.map((d) => ({ name: d.name, description: d.description, platform_enabled: AgentRegistry.isEnabled(d.name) })),
      tools: [...new Set(defs.flatMap((d) => d.allowedTools || []))].sort(),
    };
  });
}
