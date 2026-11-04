import { AgentName, IntentClassification, AgentContext } from './types';
import { AgentRegistry } from './registry';
import { logger } from '../../core/logging';

export class AgentRouter {
  /**
   * Evaluates the student's request, context, and selected mode to classify intent and route to the minimum necessary agents.
   */
  public static route(
    message: string,
    context: AgentContext,
    explicitMode?: string
  ): IntentClassification {
    const text = message.toLowerCase().trim();

    // 1. Check for manual mode constraint if provided (from advanced selector)
    const mode = (explicitMode || 'AUTO').toUpperCase();

    if (mode === 'EXPLAIN' || mode === 'MODE_A' || mode === 'EXPLAIN_CONCEPT') {
      return {
        intent: 'CONCEPT_EXPLANATION',
        domains: ['LEARNING'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['LearningAgent']),
        requiresStudentContext: true,
        requiresTools: false,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'STEP_BY_STEP' || mode === 'MODE_B') {
      return {
        intent: 'STEP_BY_STEP_TUTORING',
        domains: ['LEARNING', 'PEDAGOGY'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['LearningAgent']),
        requiresStudentContext: true,
        requiresTools: false,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'SOLVE' || mode === 'MODE_C' || mode === 'SOLVE_PROBLEM') {
      return {
        intent: 'PROBLEM_SOLVING',
        domains: ['MATHEMATICS', 'ENGINEERING', 'PROBLEM_SOLVING'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['LearningAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'EXAM_PREP' || mode === 'MODE_D' || mode === 'EXAM') {
      return {
        intent: 'EXAM_PREPARATION_WORKFLOW',
        domains: ['EXAMS', 'COURSES', 'ASSESSMENT'],
        complexity: 'COMPLEX',
        targetAgents: this.filterAvailableAgents(['CourseAgent', 'ExamPreparationAgent', 'StudyPlannerAgent', 'QuizAgent', 'NotesAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'CODING' || mode === 'MODE_E' || mode === 'CODE') {
      return {
        intent: 'CODE_DEBUG_AND_REVIEW',
        domains: ['CODING', 'DSA'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['CodingAgent', 'DSAAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'INTERVIEW' || mode === 'MODE_F') {
      return {
        intent: 'TECHNICAL_INTERVIEW_PREP',
        domains: ['INTERVIEW', 'DSA', 'CAREER'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['InterviewAgent', 'DSAAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    if (mode === 'REVISION' || mode === 'MODE_G') {
      return {
        intent: 'ACTIVE_REVISION_TUTORING',
        domains: ['REVISION', 'FLASHCARDS', 'NOTES'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['RevisionAgent', 'FlashcardAgent', 'NotesAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 1.0,
      };
    }

    // 2. Comprehensive intent matching using semantic keywords and contextual cues
    const isExamPrep =
      text.includes('exam') ||
      text.includes('midterm') ||
      text.includes('finals') ||
      text.includes('syllabus in') ||
      text.includes('days left');

    const isStudyPlan =
      text.includes('study plan') ||
      text.includes('schedule') ||
      text.includes('revision plan') ||
      text.includes('day plan') ||
      text.includes('week plan');

    const isGitHubAnalysis =
      text.includes('github') ||
      text.includes('repo') ||
      text.includes('repository') ||
      text.includes('commit') ||
      text.includes('pull request') ||
      !!context.selected_repository;

    const isResearchPaper =
      text.includes('research') ||
      text.includes('paper') ||
      text.includes('arxiv') ||
      text.includes('literature review') ||
      text.includes('citations') ||
      !!context.selected_papers?.length;

    const isSystemDesign =
      text.includes('system design') ||
      text.includes('distributed cache') ||
      text.includes('load balancer') ||
      text.includes('consistent hashing') ||
      text.includes('microservices') ||
      text.includes('sharding') ||
      text.includes('rate limiter');

    const isSQL =
      text.includes('sql') ||
      text.includes('database query') ||
      text.includes('relational') ||
      text.includes('normalization') ||
      text.includes('bcnf') ||
      text.includes('database index') ||
      text.includes('dbms');

    const isML =
      text.includes('machine learning') ||
      text.includes('ml experiment') ||
      text.includes('model training') ||
      text.includes('hyperparameter') ||
      text.includes('neural network') ||
      text.includes('random forest') ||
      text.includes('classification');

    const isViva =
      text.includes('viva') ||
      text.includes('oral exam') ||
      text.includes('lab exam') ||
      text.includes('viva voce');

    const isLabExperiment =
      text.includes('lab experiment') ||
      text.includes('lab assistant') ||
      text.includes('lab record') ||
      text.includes('practical manual');

    const isProject =
      !isSystemDesign && (
      text.includes('project') ||
      text.includes('capstone') ||
      text.includes('architecture') ||
      text.includes('module') ||
      !!context.current_project);

    const isResume =
      text.includes('resume') ||
      text.includes('cv') ||
      text.includes('ats') ||
      text.includes('bullet') ||
      text.includes('tailor to job');

    const isPlacement =
      text.includes('placement') ||
      text.includes('aptitude') ||
      text.includes('campus interview') ||
      text.includes('company role');

    const isInterview =
      text.includes('mock interview') ||
      text.includes('interview question') ||
      text.includes('interview prep') ||
      text.includes('technical round') ||
      text.includes('hr round');

    const isCoding =
      context.client_metadata?.context_type === 'coding' ||
      text.includes('debug') ||
      text.includes('runtime error') ||
      text.includes('syntax error') ||
      text.includes('compile error') ||
      text.includes('fix this code') ||
      text.includes('traceback');

    const isDSA =
      text.includes('dsa') ||
      text.includes('binary search') ||
      text.includes('sorting') ||
      text.includes('linked list') ||
      text.includes('binary tree') ||
      text.includes('graph') ||
      text.includes('dynamic programming') ||
      text.includes('complexity') ||
      text.includes('big-o') ||
      text.includes('algorithm');

    const isQuiz =
      text.includes('quiz') ||
      text.includes('practice questions') ||
      text.includes('test me') ||
      text.includes('mcq');

    const isNotes =
      text.includes('notes') ||
      text.includes('summary') ||
      text.includes('cheat sheet') ||
      text.includes('flashcard');

    const isDocumentRAG =
      text.includes('document') ||
      text.includes('pdf') ||
      text.includes('textbook') ||
      text.includes('page') ||
      !!context.selected_documents?.length ||
      !!context.client_metadata?.document_id;

    const isCareer =
      text.includes('career') ||
      text.includes('roadmap') ||
      text.includes('job role') ||
      text.includes('become a') ||
      text.includes('skill gap');

    const isPersonalKnowledge =
      text.includes('what have i learned') ||
      text.includes('my knowledge') ||
      text.includes('topics i covered') ||
      text.includes('check what i know');

    const isProgress =
      text.includes('my progress') ||
      text.includes('weak topics') ||
      text.includes('weak areas') ||
      text.includes('performance') ||
      text.includes('analytics');

    // 3. Resolve Target Agents & Complexity

    // COMPLEX CASE 1: Full Exam Preparation & Multi-step Study Plan
    if (isExamPrep && (isStudyPlan || isNotes || isQuiz || text.includes('ready') || text.includes('prepare'))) {
      const agents: AgentName[] = [
        'ProfileAgent',
        'ProgressAgent',
        'CourseAgent',
        'ExamPreparationAgent',
        'StudyPlannerAgent',
      ];
      if (isNotes || text.includes('notes')) agents.push('NotesAgent');
      if (text.includes('flashcard') || isExamPrep) agents.push('FlashcardAgent');
      if (isQuiz || text.includes('quiz') || isExamPrep) agents.push('QuizAgent');
      agents.push('RevisionAgent');

      return {
        intent: 'EXAM_PREPARATION_WORKFLOW',
        domains: ['COURSES', 'PROGRESS', 'EXAMS', 'NOTES', 'ASSESSMENT'],
        complexity: 'COMPLEX',
        targetAgents: this.filterAvailableAgents(agents),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // COMPLEX CASE 2: Project + GitHub + Research Synthesis
    if (isProject && isGitHubAnalysis && isResearchPaper) {
      return {
        intent: 'PROJECT_GITHUB_RESEARCH_SYNTHESIS',
        domains: ['PROJECTS', 'GITHUB', 'RESEARCH', 'CODE'],
        complexity: 'COMPLEX',
        targetAgents: this.filterAvailableAgents([
          'ProjectAgent',
          'GitHubAgent',
          'ResearchAgent',
          'CodingAgent',
          'DocumentRAGAgent',
        ]),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.94,
      };
    }

    // COMPLEX CASE 3: Career Roadmap + Skill Gap + Resume
    if (isCareer || (isPlacement && isResume)) {
      return {
        intent: 'CAREER_AND_SKILL_ROADMAP',
        domains: ['CAREER', 'SKILLS', 'RESUME', 'COURSES'],
        complexity: 'COMPLEX',
        targetAgents: this.filterAvailableAgents([
          'ProfileAgent',
          'SkillAgent',
          'ResumeAgent',
          'CareerAgent',
          'CourseAgent',
          'ProgressAgent',
        ]),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.92,
      };
    }

    // COMPLEX CASE 4: Personal Knowledge Base Cross-Domain Query
    if (isPersonalKnowledge) {
      return {
        intent: 'PERSONAL_KNOWLEDGE_RETRIEVAL',
        domains: ['KNOWLEDGE_BASE', 'PROGRESS', 'LEARNING'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents([
          'KnowledgeBaseAgent',
          'LearningAgent',
          'ProgressAgent',
        ]),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.91,
      };
    }

    // MODERATE CASE: Project + GitHub analysis
    if (isProject && isGitHubAnalysis) {
      const agents: AgentName[] = ['ProjectAgent', 'GitHubAgent', 'CodingAgent'];
      if (isInterview) agents.push('InterviewAgent');
      return {
        intent: 'PROJECT_GITHUB_ANALYSIS',
        domains: ['PROJECTS', 'GITHUB', 'CODE'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(agents),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.92,
      };
    }

    // MODERATE CASE: Research Literature Review & Methodology
    if (isResearchPaper) {
      const agents: AgentName[] = ['ResearchAgent'];
      if (isProject) agents.push('ProjectAgent');
      if (isCoding) agents.push('CodingAgent');
      return {
        intent: 'RESEARCH_LITERATURE_REVIEW',
        domains: ['RESEARCH'],
        complexity: agents.length > 1 ? 'MODERATE' : 'SIMPLE',
        targetAgents: this.filterAvailableAgents(agents),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.93,
      };
    }

    // MODERATE CASE: Progress Analysis + Study Planner / DSA
    if (isProgress && (isStudyPlan || isDSA)) {
      return {
        intent: 'PROGRESS_DIAGNOSTIC_AND_PLAN',
        domains: ['PROGRESS', 'DSA', 'STUDY_PLAN'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['ProgressAgent', 'DSAAgent', 'StudyPlannerAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.93,
      };
    }

    // MODERATE CASE: Resume Tailoring & ATS Scoring
    if (isResume) {
      return {
        intent: 'RESUME_ANALYSIS_AND_TAILORING',
        domains: ['RESUME', 'CAREER'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['ResumeAgent', 'CareerAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.94,
      };
    }

    // MODERATE CASE: Mock Interview or Placement Prep
    if (isInterview || isPlacement) {
      return {
        intent: 'INTERVIEW_AND_PLACEMENT_PREPARATION',
        domains: ['INTERVIEWS', 'PLACEMENTS'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['PlacementAgent', 'InterviewAgent']),
        requiresStudentContext: true,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.91,
      };
    }

    // MODERATE CASE: Explanation + Quiz
    if (isQuiz && (isDSA || text.includes('explain') || text.includes('learn'))) {
      return {
        intent: 'LEARNING_WITH_ASSESSMENT',
        domains: ['LEARNING', 'QUIZ'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['LearningAgent', 'QuizAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // MODERATE CASE: Grounded Document AI / RAG
    if (isDocumentRAG) {
      return {
        intent: 'DOCUMENT_RAG_QUERY',
        domains: ['DOCUMENTS', 'RAG'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['DocumentRAGAgent', 'LearningAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.94,
      };
    }

    // SIMPLE CASE: Coding Lab Debugging & Review
    if (isCoding) {
      return {
        intent: 'CODE_DEBUG_AND_REVIEW',
        domains: ['CODING'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['CodingAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.96,
      };
    }

    // SIMPLE CASE: DSA Concepts / Complexity
    if (isDSA) {
      return {
        intent: 'DSA_ALGORITHM_EXPLANATION',
        domains: ['DSA'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['DSAAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.96,
      };
    }

    // MODERATE CASE: System Design Lab Architecture
    if (isSystemDesign) {
      return {
        intent: 'SYSTEM_DESIGN_ARCHITECTURE',
        domains: ['SYSTEM_DESIGN', 'ARCHITECTURE'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['SystemDesignAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // SIMPLE CASE: Lab Viva Voce Oral Assessment
    if (isViva) {
      return {
        intent: 'LAB_VIVA_EXAMINATION',
        domains: ['LAB_EXPERIMENTS', 'VIVA'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['VivaAgent', 'LabAssistantAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.96,
      };
    }

    // SIMPLE CASE: Lab Experiment Guidance
    if (isLabExperiment) {
      return {
        intent: 'LAB_EXPERIMENT_GUIDANCE',
        domains: ['LAB_EXPERIMENTS'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['LabAssistantAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // SIMPLE CASE: SQL Database Query & Normalization
    if (isSQL) {
      return {
        intent: 'SQL_DATABASE_QUERY',
        domains: ['DATABASE', 'SQL'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['SQLDatabaseAgent', 'DatabaseAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // MODERATE CASE: ML Experiment Pipeline
    if (isML) {
      return {
        intent: 'ML_EXPERIMENT_PIPELINE',
        domains: ['ML', 'RESEARCH'],
        complexity: 'MODERATE',
        targetAgents: this.filterAvailableAgents(['MLExperimentAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // SIMPLE CASE: Notes Generation / Summarization
    if (isNotes) {
      return {
        intent: 'NOTES_GENERATION',
        domains: ['NOTES'],
        complexity: 'SIMPLE',
        targetAgents: this.filterAvailableAgents(['NotesAgent']),
        requiresStudentContext: false,
        requiresTools: true,
        requiresConfirmation: false,
        confidence: 0.95,
      };
    }

    // DEFAULT SIMPLE CASE: Concept Explanation
    return {
      intent: 'CONCEPT_EXPLANATION',
      domains: ['LEARNING'],
      complexity: 'SIMPLE',
      targetAgents: this.filterAvailableAgents(['LearningAgent']),
      requiresStudentContext: false,
      requiresTools: false,
      requiresConfirmation: false,
      confidence: 0.9,
    };
  }

  private static filterAvailableAgents(agents: AgentName[]): AgentName[] {
    const valid = agents.filter((name) => AgentRegistry.isEnabled(name));
    if (valid.length === 0) {
      // Fallback to LearningAgent if everything else was disabled
      return ['LearningAgent'];
    }
    return valid;
  }
}
