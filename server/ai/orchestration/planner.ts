import { IntentClassification, TaskPlan, AgentTask, AgentContext } from './types';

export class TaskPlanner {
  /**
   * Decomposes the classified intent into a structured Directed Acyclic Graph (DAG) of executable agent tasks.
   */
  public static plan(
    workflowId: string,
    intent: IntentClassification,
    userMessage: string,
    context: AgentContext
  ): TaskPlan {
    const tasks: AgentTask[] = [];

    switch (intent.intent) {
      case 'EXAM_PREPARATION_WORKFLOW': {
        // Step 1: Student Context
        tasks.push({
          id: 'task_profile',
          title: 'Query Student Academic Profile & Targets',
          description: 'Retrieve current semester, target subject, and upcoming exam schedule',
          agent: 'ProfileAgent',
          action: 'get_profile_and_targets',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        // Step 2: Course syllabus & invariants
        tasks.push({
          id: 'task_course_syllabus',
          title: 'Inspect Course Syllabus & Invariants',
          description: 'Identify high-weightage curriculum units, theorem definitions, and lesson boundaries',
          agent: 'CourseAgent',
          action: 'get_course_structure',
          params: { courseCode: context.current_course?.code },
          dependencies: [],
          status: 'pending',
        });

        // Step 3: Progress & Weak Areas (Runs concurrently with Syllabus inspection)
        tasks.push({
          id: 'task_progress',
          title: 'Analyze Diagnostic Progress & Weak Topics',
          description: 'Inspect verified lab assignments and recent quiz topic accuracies',
          agent: 'ProgressAgent',
          action: 'evaluate_weak_topics',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        // Step 4: Exam Blueprint
        tasks.push({
          id: 'task_exam_blueprint',
          title: 'Compile University Exam Blueprint',
          description: 'Determine high-yield topic weightages and recurring theoretical invariants',
          agent: 'ExamPreparationAgent',
          action: 'generate_exam_blueprint',
          params: {},
          dependencies: ['task_course_syllabus', 'task_progress'],
          status: 'pending',
        });

        // Step 5: Calendar-Aligned Study Plan
        tasks.push({
          id: 'task_study_plan',
          title: 'Construct Calendar-Aligned Study Plan',
          description: 'Decompose preparation into daily milestone units across remaining days',
          agent: 'StudyPlannerAgent',
          action: 'generate_exam_plan',
          params: { daysRemaining: 15 },
          dependencies: ['task_exam_blueprint'],
          status: 'pending',
        });

        // Step 6: Targeted Revision Notes
        tasks.push({
          id: 'task_notes',
          title: 'Synthesize Core Revision Notes & Formulas',
          description: 'Compile high-density KaTeX formula sheets and theorem explanations',
          agent: 'NotesAgent',
          action: 'generate_exam_notes',
          params: {},
          dependencies: ['task_study_plan'],
          status: 'pending',
        });

        // Step 7: Active Recall Flashcards
        tasks.push({
          id: 'task_flashcards',
          title: 'Generate Active Recall Flashcard Deck',
          description: 'Create concise question/answer flashcards for rapid spaced review',
          agent: 'FlashcardAgent',
          action: 'generate_flashcards',
          params: {},
          dependencies: ['task_notes'],
          status: 'pending',
        });

        // Step 8: Adaptive Diagnostic Practice Quiz
        tasks.push({
          id: 'task_quiz',
          title: 'Prepare Adaptive Practice Quiz',
          description: 'Assemble targeted multiple-choice questions with verified mathematical rubrics',
          agent: 'QuizAgent',
          action: 'generate_quiz',
          params: { questionCount: 3 },
          dependencies: ['task_notes'],
          status: 'pending',
        });

        // Step 9: Spaced Revision Intervals
        tasks.push({
          id: 'task_revision',
          title: 'Schedule Spaced Revision Timetable',
          description: 'Set checkpoint reviews for weak topics before final examination',
          agent: 'RevisionAgent',
          action: 'schedule_spaced_revision',
          params: {},
          dependencies: ['task_study_plan', 'task_quiz'],
          status: 'pending',
        });

        break;
      }

      case 'PROJECT_GITHUB_RESEARCH_SYNTHESIS': {
        // Step 1: Project Architecture
        tasks.push({
          id: 'task_project_spec',
          title: 'Inspect Project Architecture & Requirements',
          description: 'Extract system modules, database models, and service boundaries',
          agent: 'ProjectAgent',
          action: 'inspect_project_architecture',
          params: { projectId: context.current_project?.id },
          dependencies: [],
          status: 'pending',
        });

        // Step 2: GitHub Repository AST & Code Tree
        tasks.push({
          id: 'task_github_inspect',
          title: 'Inspect Connected GitHub Repository',
          description: 'Read file tree, commit logs, and implementation modules',
          agent: 'GitHubAgent',
          action: 'inspect_repository',
          params: { repository: context.selected_repository },
          dependencies: [],
          status: 'pending',
        });

        // Step 3: Research Literature Extraction
        tasks.push({
          id: 'task_research_papers',
          title: 'Search & Analyze Academic Research Papers',
          description: 'Query peer-reviewed publications and extract state-of-the-art methodology',
          agent: 'ResearchAgent',
          action: 'analyze_research_papers',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });

        // Step 4: Code Quality & Algorithmic Comparison
        tasks.push({
          id: 'task_code_review',
          title: 'Evaluate Algorithmic Implementation',
          description: 'Analyze code complexity, modular separation, and design pattern adherence',
          agent: 'CodingAgent',
          action: 'review_architecture_code',
          params: {},
          dependencies: ['task_github_inspect', 'task_project_spec'],
          status: 'pending',
        });

        // Step 5: Research Gap Synthesis
        tasks.push({
          id: 'task_research_gap',
          title: 'Map Architecture Gaps & SOTA Differences',
          description: 'Compare codebase implementation with peer-reviewed literature benchmarks',
          agent: 'ResearchAgent',
          action: 'synthesize_gap_analysis',
          params: {},
          dependencies: ['task_code_review', 'task_research_papers'],
          status: 'pending',
        });

        break;
      }

      case 'PROJECT_GITHUB_ANALYSIS': {
        tasks.push({
          id: 'task_project',
          title: 'Evaluate Capstone Milestone Progress',
          description: 'Check completed tasks, pending modules, and architectural requirements',
          agent: 'ProjectAgent',
          action: 'get_project_status',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_github',
          title: 'Inspect GitHub Source Modules',
          description: 'Scan active repository branches, commit histories, and codebase directory tree',
          agent: 'GitHubAgent',
          action: 'inspect_repository',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_code_analysis',
          title: 'Synthesize Architectural Invariants & Code Review',
          description: 'Identify missing implementation areas, testing gaps, and modular refactoring targets',
          agent: 'CodingAgent',
          action: 'review_architecture_code',
          params: {},
          dependencies: ['task_project', 'task_github'],
          status: 'pending',
        });

        if (intent.targetAgents.includes('InterviewAgent')) {
          tasks.push({
            id: 'task_interview_questions',
            title: 'Generate Capstone Defense Interview Questions',
            description: 'Compile architectural and code defense questions tailored to this project',
            agent: 'InterviewAgent',
            action: 'generate_interview_questions',
            params: {},
            dependencies: ['task_code_analysis'],
            status: 'pending',
          });
        }

        break;
      }

      case 'CAREER_AND_SKILL_ROADMAP': {
        tasks.push({
          id: 'task_profile',
          title: 'Retrieve Academic Specialization & Preferences',
          description: 'Query student branch, current semester, and declared career objectives',
          agent: 'ProfileAgent',
          action: 'get_profile_and_targets',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_skills',
          title: 'Evaluate Verified Skill Evidence',
          description: 'Aggregate laboratory completions, coding submissions, and assessed skill levels',
          agent: 'SkillAgent',
          action: 'get_student_skills',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_resume',
          title: 'Inspect Active Resume Content & ATS Profile',
          description: 'Read documented experience, project achievements, and technical keywords',
          agent: 'ResumeAgent',
          action: 'analyze_resume_ats',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_career_gaps',
          title: 'Compute Industry Skill Gaps',
          description: 'Match current skills against target engineering role requisites',
          agent: 'CareerAgent',
          action: 'calculate_skill_gap',
          params: {},
          dependencies: ['task_skills', 'task_resume'],
          status: 'pending',
        });

        tasks.push({
          id: 'task_career_roadmap',
          title: 'Synthesize Actionable Career Learning Roadmap',
          description: 'Curate prerequisite elective courses, project concepts, and certifications',
          agent: 'CareerAgent',
          action: 'build_career_roadmap',
          params: {},
          dependencies: ['task_career_gaps'],
          status: 'pending',
        });

        break;
      }

      case 'PROGRESS_DIAGNOSTIC_AND_PLAN': {
        tasks.push({
          id: 'task_progress_check',
          title: 'Query Academic & Laboratory Progress',
          description: 'Retrieve verified problem submissions, module completion rates, and weak topics',
          agent: 'ProgressAgent',
          action: 'get_student_progress',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_dsa_diagnostic',
          title: 'Analyze DSA Performance & Invariant Inaccuracies',
          description: 'Inspect algorithm categories needing reinforcement (DP, Graphs, Trees)',
          agent: 'DSAAgent',
          action: 'get_dsa_progress',
          params: {},
          dependencies: ['task_progress_check'],
          status: 'pending',
        });

        tasks.push({
          id: 'task_study_schedule',
          title: 'Synthesize 7-Day Targeted Practice Roadmap',
          description: 'Generate progressive problem drills with complexity targets',
          agent: 'StudyPlannerAgent',
          action: 'create_dsa_schedule',
          params: {},
          dependencies: ['task_dsa_diagnostic'],
          status: 'pending',
        });

        break;
      }

      case 'RESUME_ANALYSIS_AND_TAILORING': {
        tasks.push({
          id: 'task_resume_ats',
          title: 'Run ATS Rubric & Readability Analysis',
          description: 'Evaluate technical keywords, structural sections, and metric impact',
          agent: 'ResumeAgent',
          action: 'analyze_resume_ats',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_career_keywords',
          title: 'Align Industry Role Keywords',
          description: 'Match engineering expectations and identify high-value missing competencies',
          agent: 'CareerAgent',
          action: 'calculate_skill_gap',
          params: {},
          dependencies: ['task_resume_ats'],
          status: 'pending',
        });

        break;
      }

      case 'INTERVIEW_AND_PLACEMENT_PREPARATION': {
        tasks.push({
          id: 'task_placement_readiness',
          title: 'Assess Placement Readiness & Aptitude Scores',
          description: 'Inspect technical test history, core subjects, and company patterns',
          agent: 'PlacementAgent',
          action: 'get_placement_plan',
          params: {},
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_mock_interview',
          title: 'Formulate Technical & Behavioral Interview Rubric',
          description: 'Compile core CS questions, code defense prompts, and answer rubrics',
          agent: 'InterviewAgent',
          action: 'generate_interview_questions',
          params: {},
          dependencies: ['task_placement_readiness'],
          status: 'pending',
        });

        break;
      }

      case 'LEARNING_WITH_ASSESSMENT': {
        tasks.push({
          id: 'task_explain_concept',
          title: 'Synthesize Step-by-Step Educational Explanation',
          description: 'Provide conceptual invariants, intuitive analogies, and KaTeX mathematical notation',
          agent: 'LearningAgent',
          action: 'explain_concept',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_generate_quiz',
          title: 'Generate Adaptive Diagnostic Quiz',
          description: 'Assemble practice multiple-choice questions with verified explanations',
          agent: 'QuizAgent',
          action: 'generate_quiz',
          params: { questionCount: 2 },
          dependencies: ['task_explain_concept'],
          status: 'pending',
        });

        break;
      }

      case 'DOCUMENT_RAG_QUERY': {
        tasks.push({
          id: 'task_retrieve_doc',
          title: 'Semantic Vector & Page Retrieval',
          description: 'Search indexed student textbooks and extract verified chunk references',
          agent: 'DocumentRAGAgent',
          action: 'retrieve_document_context',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_grounded_answer',
          title: 'Synthesize Grounded Educational Response',
          description: 'Integrate verified document excerpts with page boundaries and mathematical formulas',
          agent: 'LearningAgent',
          action: 'explain_concept',
          params: { query: userMessage },
          dependencies: ['task_retrieve_doc'],
          status: 'pending',
        });

        break;
      }

      case 'PERSONAL_KNOWLEDGE_RETRIEVAL': {
        tasks.push({
          id: 'task_knowledge_search',
          title: 'Cross-Domain Knowledge Base Search',
          description: 'Search personal notes, indexed documents, courses, projects, and lab records',
          agent: 'KnowledgeBaseAgent',
          action: 'cross_domain_search',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });

        tasks.push({
          id: 'task_progress_correlation',
          title: 'Correlate with Learning Progress & Quiz History',
          description: 'Map verified mastery levels against retrieved topics',
          agent: 'ProgressAgent',
          action: 'get_student_progress',
          params: {},
          dependencies: ['task_knowledge_search'],
          status: 'pending',
        });

        tasks.push({
          id: 'task_knowledge_synthesis',
          title: 'Synthesize Consolidated Mastery Summary',
          description: 'Provide concepts covered, referenced resources, and recommendations for further depth',
          agent: 'LearningAgent',
          action: 'explain_concept',
          params: {},
          dependencies: ['task_progress_correlation'],
          status: 'pending',
        });

        break;
      }

      case 'CODE_DEBUG_AND_REVIEW': {
        tasks.push({
          id: 'task_debug_code',
          title: 'Analyze Code Invariants & Debug Execution',
          description: 'Diagnose runtime errors, analyze AST syntax, and verify boundary conditions',
          agent: 'CodingAgent',
          action: 'debug_code',
          params: {
            code: context.client_metadata?.source_code,
            language: context.client_metadata?.language,
            error: context.client_metadata?.last_error || userMessage,
          },
          dependencies: [],
          status: 'pending',
        });
        break;
      }

      case 'DSA_ALGORITHM_EXPLANATION': {
        tasks.push({
          id: 'task_dsa_explain',
          title: 'Analyze Algorithm Invariants & Asymptotic Complexity',
          description: 'Compute Big-O bounds, state space tree invariants, and step-by-step logic',
          agent: 'DSAAgent',
          action: 'explain_algorithm',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });
        break;
      }

      case 'NOTES_GENERATION': {
        tasks.push({
          id: 'task_generate_notes',
          title: 'Generate Structured Academic Notes',
          description: 'Structure core concepts, bullet summaries, formulas, and exam tips',
          agent: 'NotesAgent',
          action: 'generate_notes',
          params: { topic: userMessage },
          dependencies: [],
          status: 'pending',
        });
        break;
      }

      default: {
        // Simple concept explanation
        tasks.push({
          id: 'task_learn_concept',
          title: 'Synthesize Educational Concept Explanation',
          description: 'Provide conceptual overview, illustrative examples, and curriculum context',
          agent: 'LearningAgent',
          action: 'explain_concept',
          params: { query: userMessage },
          dependencies: [],
          status: 'pending',
        });
        break;
      }
    }

    const estimatedDurationMs = tasks.length * 4000;

    return {
      workflowId,
      intent,
      tasks,
      estimatedDurationMs,
    };
  }
}
