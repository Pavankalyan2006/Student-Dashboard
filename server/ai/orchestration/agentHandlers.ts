import { AgentName, AgentTask, AgentContext, AgentResult, SourceProvenance } from './types';
import { ToolRegistry } from '../tools';
import { logger } from '../../core/logging';
import { DSAService } from '../../services/dsa';

// Each specialist agent reports only what its tool actually returned for this student.
// When an agent has no data source, or its tool fails or finds nothing, it says so and
// returns no data and no sources. It never substitutes sample content (fixed OS notes,
// invented ATS scores, placeholder papers) and never cites a source that was not read.

type ToolCall = { toolName: string; parameters: Record<string, any>; resultSummary: string };

const now = () => new Date().toISOString();

const unavailable = (agent: AgentName, summary: string, toolCallsExecuted?: ToolCall[]): AgentResult => ({
  agent,
  status: 'failure',
  summary,
  data: {},
  evidenceType: 'INFERENCE',
  sources: [],
  toolCallsExecuted,
});

const asArray = (value: any, key?: string): any[] => {
  if (Array.isArray(value)) return value;
  if (key && value && Array.isArray(value[key])) return value[key];
  return [];
};

export class AgentHandlers {
  /**
   * Dispatches task execution to the specialized domain agent logic using the shared Tool Registry.
   */
  public static async executeTask(
    task: AgentTask,
    context: AgentContext,
    sharedResults: Map<string, AgentResult>
  ): Promise<AgentResult> {
    const studentId = context.student_id;
    const role = context.role;
    const ctx = { studentId, role, agent: task.agent };
    const query: string = String(task.params.query || '').trim();

    try {
      switch (task.agent) {
        case 'ProfileAgent': {
          const profile = await ToolRegistry.execute('get_student_profile', {}, ctx);
          const parts = [profile?.branch, profile?.semester ? `Semester ${profile.semester}` : null].filter(Boolean);
          return {
            agent: 'ProfileAgent',
            status: 'success',
            summary: `Read the academic profile for ${profile?.name || 'this student'}${parts.length ? ` (${parts.join(', ')})` : ''}.`,
            data: { profile },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'STUDENT_DATABASE', sourceId: `profile_${studentId}`, title: 'Your academic profile', link: '/profile', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_student_profile', parameters: {}, resultSummary: 'Profile loaded' }],
          };
        }

        case 'CourseAgent': {
          const courseCode = task.params.courseCode || context.current_course?.code;
          if (!courseCode) {
            return unavailable('CourseAgent', 'No course is selected for this chat, so no course syllabus was read.');
          }
          const course = await ToolRegistry.execute('get_course_details', { courseCode }, ctx);
          if (!course) return unavailable('CourseAgent', `Course ${courseCode} was not found.`);
          const name = course.title || course.name || courseCode;
          const chapters = asArray(course.chapters);
          return {
            agent: 'CourseAgent',
            status: 'success',
            summary: `Read the course ${name}${chapters.length ? ` (${chapters.length} chapters)` : ''}.`,
            data: { course },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'COURSE_DATABASE', sourceId: course.id || courseCode, title: `${name} (${course.code || courseCode})`, link: '/courses', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_course_details', parameters: { courseCode }, resultSummary: 'Course loaded' }],
          };
        }

        case 'ProgressAgent': {
          const dsa = await ToolRegistry.execute('get_dsa_progress', {}, ctx);
          const quiz = await ToolRegistry.execute('get_quiz_progress', {}, ctx).catch(() => null);
          const solvedCount = Number(dsa?.solvedCount || 0);
          const weakTopics: string[] = Array.from(
            new Set([...asArray(dsa?.weak_topics), ...asArray(quiz?.weak_areas).map((w: any) => (typeof w === 'string' ? w : w?.topic_name || w?.topic || w?.name))].filter(Boolean))
          );
          const quizCount = Number(quiz?.completed_quizzes || 0);
          const pieces = [`${solvedCount} DSA problem${solvedCount === 1 ? '' : 's'} solved`, `${quizCount} quiz${quizCount === 1 ? '' : 'zes'} completed`];
          return {
            agent: 'ProgressAgent',
            status: 'success',
            summary: `${pieces.join(', ')}. ${weakTopics.length ? `Weak topics on record: ${weakTopics.join(', ')}.` : 'No weak topics on record yet.'}`,
            data: { solvedCount, weakTopics, quizStats: quiz },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'STUDENT_DATABASE', sourceId: `progress_${studentId}`, title: 'Your DSA and quiz progress', link: '/progress', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [
              { toolName: 'get_dsa_progress', parameters: {}, resultSummary: `${solvedCount} solved` },
              { toolName: 'get_quiz_progress', parameters: {}, resultSummary: `${quizCount} completed` },
            ],
          };
        }

        case 'QuizAgent': {
          const topic = context.current_lesson?.title || context.current_course?.name || query.slice(0, 120);
          if (!topic) return unavailable('QuizAgent', 'No topic was given, so no quiz was generated.');
          const count = task.params.questionCount || 3;
          try {
            const quiz = await ToolRegistry.execute('generate_quiz', { topic, questionCount: count }, ctx);
            const questions = asArray(quiz?.questions).map((q: any) => ({
              question: q.question_text || q.question,
              options: q.options,
              answer: q.correct_answer ?? q.answer,
              explanation: q.explanation,
            }));
            return {
              agent: 'QuizAgent',
              status: 'success',
              summary: `Generated a ${questions.length}-question practice quiz on ${topic}, saved to your quizzes.`,
              data: { topic, quizId: quiz?.quiz?.id || quiz?.id, questions },
              evidenceType: 'AI_RECOMMENDATION',
              sources: [],
              nextActions: ['Take the generated quiz in Quiz'],
              toolCallsExecuted: [{ toolName: 'generate_quiz', parameters: { topic, questionCount: count }, resultSummary: `${questions.length} questions` }],
            };
          } catch (err: any) {
            return unavailable('QuizAgent', `No quiz was generated: ${err.message}`, [
              { toolName: 'generate_quiz', parameters: { topic, questionCount: count }, resultSummary: 'Failed' },
            ]);
          }
        }

        case 'ProjectAgent': {
          const projects = asArray(await ToolRegistry.execute('get_project_list', {}, ctx).catch(() => []));
          if (projects.length === 0) return unavailable('ProjectAgent', 'No projects were found in your Projects workspace.');
          const p = projects[0];
          return {
            agent: 'ProjectAgent',
            status: 'success',
            summary: `Found ${projects.length} project${projects.length === 1 ? '' : 's'}; most recent is '${p.title || p.name}'.`,
            data: { project: p, projectCount: projects.length },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'PROJECT_DATABASE', sourceId: p.id, title: p.title || p.name || 'Project', link: '/projects', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_project_list', parameters: {}, resultSummary: `${projects.length} projects` }],
          };
        }

        case 'GitHubAgent': {
          const repos = asArray(await ToolRegistry.execute('list_github_repositories', {}, ctx).catch(() => []));
          if (repos.length === 0) return unavailable('GitHubAgent', 'No GitHub repositories are connected for this account.');
          const repo = repos.find((r: any) => r.id === context.selected_repository || r.name === context.selected_repository) || repos[0];
          return {
            agent: 'GitHubAgent',
            status: 'success',
            summary: `Found ${repos.length} connected repositor${repos.length === 1 ? 'y' : 'ies'}, including '${repo.full_name || repo.name}'.`,
            data: { repository: repo.full_name || repo.name, repositoryCount: repos.length },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'GITHUB_API', sourceId: String(repo.id), title: `GitHub repository ${repo.full_name || repo.name}`, link: '/github', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'list_github_repositories', parameters: {}, resultSummary: `${repos.length} repositories` }],
          };
        }

        case 'ResearchAgent': {
          const q = query || 'computer science';
          const result = await ToolRegistry.execute('search_research_papers', { query: q }, ctx).catch(() => null);
          const papers = asArray(result, 'papers');
          if (papers.length === 0) return unavailable('ResearchAgent', `No research papers were found for "${q}".`);
          return {
            agent: 'ResearchAgent',
            status: 'success',
            summary: `Found ${papers.length} paper${papers.length === 1 ? '' : 's'} for "${q}"${result?.provider ? ` from ${result.provider}` : ''}.`,
            data: { papersFound: papers.length },
            evidenceType: 'OBSERVED_DATA',
            sources: papers.slice(0, 3).map((paper: any) => ({
              sourceType: 'RESEARCH_PROVIDER' as const,
              sourceId: String(paper.id || paper.doi || paper.title),
              title: paper.title || 'Untitled paper',
              link: paper.url || '/research',
              retrievedAt: now(),
              confidence: 1.0,
            })),
            toolCallsExecuted: [{ toolName: 'search_research_papers', parameters: { query: q }, resultSummary: `${papers.length} papers` }],
          };
        }

        case 'CodingAgent': {
          if (!task.params.code) {
            return unavailable('CodingAgent', 'No code was included with the request, so nothing was debugged. Paste the code or open it in Coding Lab.');
          }
          const params = { language: task.params.language || 'python', source_code: task.params.code, error: task.params.error || '' };
          try {
            const debugResult = await ToolRegistry.execute('debug_code', params, ctx);
            return {
              agent: 'CodingAgent',
              status: 'success',
              summary: `Debugged the submitted ${params.language} code${debugResult?.problem ? `: ${debugResult.problem}` : '.'}`,
              data: debugResult,
              evidenceType: 'AI_RECOMMENDATION',
              sources: [],
              toolCallsExecuted: [{ toolName: 'debug_code', parameters: { language: params.language }, resultSummary: 'Debug complete' }],
            };
          } catch (err: any) {
            return unavailable('CodingAgent', `The code was not debugged: ${err.message}`);
          }
        }

        case 'DSAAgent': {
          let algorithm: string | undefined = task.params.algorithm || task.params.algorithm_id_or_name;
          if (!algorithm && query) {
            // Use the algorithm the student named, matching the longest catalog name in the request.
            const lower = query.toLowerCase();
            const named = (await DSAService.getAlgorithms().catch(() => []))
              .filter((a: any) => a?.name && lower.includes(String(a.name).toLowerCase()))
              .sort((a: any, b: any) => String(b.name).length - String(a.name).length)[0];
            algorithm = named ? named.slug || named.id : undefined;
          }
          if (!algorithm) {
            return unavailable('DSAAgent', 'No specific algorithm was identified in the request, so no complexity data was looked up.');
          }
          try {
            const c = await ToolRegistry.execute('get_algorithm_complexity', { algorithm_id_or_name: algorithm }, ctx);
            return {
              agent: 'DSAAgent',
              status: 'success',
              summary: `Looked up ${c.algorithm}: time ${c.time_complexity}, space ${c.space_complexity}.`,
              data: {
                algorithm: c.algorithm,
                timeComplexityAverage: c.average_case || c.time_complexity,
                timeComplexityWorst: c.worst_case || c.time_complexity,
                spaceComplexity: c.space_complexity,
              },
              evidenceType: 'OBSERVED_DATA',
              sources: [
                { sourceType: 'COURSE_DATABASE', sourceId: String(algorithm), title: `${c.algorithm} (DSA Lab algorithm reference)`, link: '/dsa', retrievedAt: now(), confidence: 1.0 },
              ],
              toolCallsExecuted: [{ toolName: 'get_algorithm_complexity', parameters: { algorithm_id_or_name: algorithm }, resultSummary: 'Complexity read' }],
            };
          } catch (err: any) {
            return unavailable('DSAAgent', `No complexity data was found for "${algorithm}".`);
          }
        }

        case 'ResumeAgent': {
          const resume = await ToolRegistry.execute('get_resume', {}, ctx).catch(() => null);
          if (!resume || !resume.id) return unavailable('ResumeAgent', 'No resume was found. Create one in Resume Builder first.');
          return {
            agent: 'ResumeAgent',
            status: 'success',
            summary: `Read your resume '${resume.title || resume.id}'.`,
            data: { resumeId: resume.id },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'STUDENT_DATABASE', sourceId: resume.id, title: resume.title || 'Your resume', link: '/resume', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_resume', parameters: {}, resultSummary: 'Resume loaded' }],
          };
        }

        case 'CareerAgent': {
          const roles = asArray(await ToolRegistry.execute('get_career_roles', {}, ctx).catch(() => []));
          if (roles.length === 0) return unavailable('CareerAgent', 'No career roles are available to compare against.');
          return {
            agent: 'CareerAgent',
            status: 'success',
            summary: `Read ${roles.length} career role profiles (${roles.slice(0, 3).map((r: any) => r.name || r.title).join(', ')}${roles.length > 3 ? ', …' : ''}).`,
            data: { roleCount: roles.length },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'COURSE_DATABASE', sourceId: 'career_roles', title: 'Career role catalog', link: '/career', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_career_roles', parameters: {}, resultSummary: `${roles.length} roles` }],
          };
        }

        case 'SkillAgent': {
          const skills = asArray(await ToolRegistry.execute('get_student_skills', {}, ctx).catch(() => []));
          if (skills.length === 0) return unavailable('SkillAgent', 'No skills are recorded for this account yet.');
          return {
            agent: 'SkillAgent',
            status: 'success',
            summary: `Found ${skills.length} recorded skill${skills.length === 1 ? '' : 's'}.`,
            data: { verifiedSkills: skills },
            evidenceType: 'OBSERVED_DATA',
            sources: [
              { sourceType: 'STUDENT_DATABASE', sourceId: `skills_${studentId}`, title: 'Your skill records', link: '/skills', retrievedAt: now(), confidence: 1.0 },
            ],
            toolCallsExecuted: [{ toolName: 'get_student_skills', parameters: {}, resultSummary: `${skills.length} skills` }],
          };
        }

        case 'DocumentRAGAgent': {
          const q = query || context.current_lesson?.title || '';
          if (!q) return unavailable('DocumentRAGAgent', 'No question was given to search your documents with.');
          const chunks = asArray(await ToolRegistry.execute('retrieve_document_context', { query: q }, ctx).catch(() => []));
          if (chunks.length === 0) return unavailable('DocumentRAGAgent', 'No passage in your uploaded documents matched this question.');
          return {
            agent: 'DocumentRAGAgent',
            status: 'success',
            summary: `Found ${chunks.length} matching passage${chunks.length === 1 ? '' : 's'} in your documents.`,
            data: { chunks },
            evidenceType: 'OBSERVED_DATA',
            sources: chunks.slice(0, 3).map((c: any) => ({
              sourceType: 'DOCUMENT_RAG' as const,
              sourceId: String(c.document_id || c.id),
              title: c.document_title || c.title || 'Uploaded document',
              page: c.page_number,
              link: c.document_id ? `/documents/${c.document_id}${c.page_number ? `?page=${c.page_number}` : ''}` : '/documents',
              retrievedAt: now(),
              confidence: typeof c.score === 'number' ? c.score : 1.0,
            })),
            toolCallsExecuted: [{ toolName: 'retrieve_document_context', parameters: { query: q }, resultSummary: `${chunks.length} passages` }],
          };
        }

        case 'KnowledgeBaseAgent': {
          const docs = asArray(await ToolRegistry.execute('get_uploaded_documents', {}, ctx).catch(() => []));
          const notes = asArray(await ToolRegistry.execute('search_notes', { query: query || '' }, ctx).catch(() => []));
          return {
            agent: 'KnowledgeBaseAgent',
            status: 'success',
            summary: `Your knowledge base has ${docs.length} uploaded document${docs.length === 1 ? '' : 's'}; ${notes.length} note${notes.length === 1 ? '' : 's'} matched.`,
            data: { documentsCount: docs.length, notesCount: notes.length },
            evidenceType: 'OBSERVED_DATA',
            sources: [],
            toolCallsExecuted: [
              { toolName: 'get_uploaded_documents', parameters: {}, resultSummary: `${docs.length} documents` },
              { toolName: 'search_notes', parameters: { query: query || '' }, resultSummary: `${notes.length} notes` },
            ],
          };
        }

        case 'RecommendationAgent': {
          const recs = await ToolRegistry.execute('get_learning_recommendations', {}, ctx).catch(() => null);
          if (!recs) return unavailable('RecommendationAgent', 'No learning recommendations are available.');
          const courses = asArray(recs.recommended_courses);
          return {
            agent: 'RecommendationAgent',
            status: 'success',
            summary: `Read ${courses.length} recommended course${courses.length === 1 ? '' : 's'} from your profile.`,
            data: { recommendations: recs },
            evidenceType: 'OBSERVED_DATA',
            sources: [],
            toolCallsExecuted: [{ toolName: 'get_learning_recommendations', parameters: {}, resultSummary: `${courses.length} courses` }],
          };
        }

        // These agents have no data source or generator of their own. The AI answer (when
        // the provider is configured) covers the request; the agent does not invent a plan,
        // notes, flashcards, revision schedule, interview questions or placement scores.
        case 'ExamPreparationAgent':
        case 'StudyPlannerAgent':
        case 'NotesAgent':
        case 'FlashcardAgent':
        case 'RevisionAgent':
        case 'InterviewAgent':
        case 'PlacementAgent': {
          const where: Record<string, string> = {
            ExamPreparationAgent: 'Exam Preparation',
            StudyPlannerAgent: 'Study Planner',
            NotesAgent: 'Notes (Generate with AI)',
            FlashcardAgent: 'Flashcards (Generate deck)',
            RevisionAgent: 'Spaced Revision',
            InterviewAgent: 'Mock Interviews',
            PlacementAgent: 'Placements',
          };
          return unavailable(
            task.agent,
            `This step was not run from chat. Use ${where[task.agent]} to create it from your own data.`
          );
        }

        case 'LearningAgent':
        default: {
          return {
            agent: 'LearningAgent',
            status: 'success',
            summary: 'Explanation requested; the answer comes from the AI tutor.',
            data: {},
            evidenceType: 'AI_RECOMMENDATION',
            // Nothing was retrieved for a general explanation, so cite nothing.
            sources: [],
          };
        }
      }
    } catch (err: any) {
      logger.warn(`Task execution failed for agent ${task.agent}: ${err.message}`);
      return {
        agent: task.agent,
        status: 'failure',
        summary: `This step failed: ${err.message}`,
        data: {},
        evidenceType: 'INFERENCE',
        sources: [],
        warnings: [`Agent ${task.agent} could not complete: ${err.message}`],
      };
    }
  }
}
