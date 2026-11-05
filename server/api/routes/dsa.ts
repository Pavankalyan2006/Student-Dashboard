import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { DSAService } from '../../services/dsa';
import { CodingService } from '../../services/coding';
import { DSATutorService } from '../../services/dsaTutorService';
import { ValidationError } from '../../core/exceptions';
import { eventBus } from '../../events/eventBus';

export const dsaRouter = Router();

/** Problems leave the server without hidden test inputs/outputs; only the count is public. */
const publicProblem = (p: any) => {
  if (!p || typeof p !== 'object') return p;
  const { hidden_test_cases, ...visible } = p;
  return { ...visible, hidden_test_case_count: Array.isArray(hidden_test_cases) ? hidden_test_cases.length : 0 };
};

// ================= TOPICS =================
dsaRouter.get('/dsa/topics', async (req, res, next) => {
  try {
    const topics = await DSAService.getTopics();
    res.json({
      success: true,
      data: topics,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/topics/:topic_id', async (req, res, next) => {
  try {
    const topic = await DSAService.getTopic(req.params.topic_id);
    const algorithms = await DSAService.getAlgorithms(topic.id);
    const problems = await DSAService.getProblems({ topic_id: topic.id });

    res.json({
      success: true,
      data: {
        ...topic,
        algorithms,
        problems: problems.map(publicProblem),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ================= ALGORITHMS =================
dsaRouter.get('/dsa/algorithms', async (req, res, next) => {
  try {
    const topicId = req.query.topic_id as string | undefined;
    const algorithms = await DSAService.getAlgorithms(topicId);
    res.json({
      success: true,
      data: algorithms,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/algorithms/:algorithm_id', async (req, res, next) => {
  try {
    const algorithm = await DSAService.getAlgorithm(req.params.algorithm_id);
    res.json({
      success: true,
      data: algorithm,
    });
  } catch (err) {
    next(err);
  }
});

// ================= VISUALIZE =================
dsaRouter.post('/dsa/algorithms/:algorithm_id/visualize', async (req, res, next) => {
  try {
    const session = await DSAService.visualizeAlgorithm(
      req.params.algorithm_id,
      req.body?.input
    );

    // If student is authenticated, record view
    if (req.user?.userId) {
      await DSAService.recordVisualization(req.user.userId, req.params.algorithm_id);
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
});

// ================= ALGORITHM COMPARISON =================
dsaRouter.post('/dsa/algorithms/compare', async (req, res, next) => {
  try {
    const algorithmIds = req.body?.algorithm_ids;
    if (!Array.isArray(algorithmIds) || algorithmIds.length === 0) {
      throw new ValidationError('algorithm_ids array is required for comparison.');
    }
    const comparison = await DSAService.compareAlgorithms(algorithmIds);
    res.json({
      success: true,
      data: comparison,
    });
  } catch (err) {
    next(err);
  }
});

// ================= AI DSA TUTOR =================
dsaRouter.post('/dsa/tutor/chat', requireAuth, async (req, res, next) => {
  try {
    const { problem_id, algorithm_id, question, code, language, step_number } = req.body;
    if (!question || !question.trim()) {
      throw new ValidationError('Question prompt is required.');
    }
    const tutorResponse = await DSATutorService.chatWithTutor({
      problem_id,
      algorithm_id,
      question,
      code,
      language,
      step_number,
    });
    res.json({
      success: true,
      data: tutorResponse,
    });
  } catch (err) {
    next(err);
  }
});

// ================= DAILY CHALLENGE, ROADMAP & ANALYTICS =================
dsaRouter.get('/dsa/daily-challenge', async (req, res, next) => {
  try {
    const studentId = (req as any).user?.userId;
    const challenge = await DSAService.getDailyChallenge(studentId);
    res.json({
      success: true,
      data: challenge,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/roadmap', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const roadmap = await DSAService.getRoadmap(studentId);
    res.json({
      success: true,
      data: roadmap,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/analytics', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const analytics = await DSAService.getAnalytics(studentId);
    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
});

// ================= BOOKMARKS & DRAFTS =================
dsaRouter.get('/dsa/bookmarks', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const bookmarks = await DSAService.getBookmarks(studentId);
    res.json({
      success: true,
      data: bookmarks,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.post('/dsa/bookmarks/:problem_id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const result = await DSAService.toggleBookmark(studentId, req.params.problem_id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/drafts/:problem_id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const draft = await DSAService.getDraft(studentId, req.params.problem_id);
    res.json({
      success: true,
      data: draft,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.post('/dsa/drafts/:problem_id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { code, language } = req.body;
    if (!code || !language) {
      throw new ValidationError('code and language are required for draft save.');
    }
    await DSAService.saveDraft(studentId, req.params.problem_id, { code, language });
    res.json({
      success: true,
      message: 'Draft saved successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// ================= PROBLEMS =================
dsaRouter.get('/dsa/problems', async (req, res, next) => {
  try {
    const { topic_id, difficulty, search, subtopic, company, roadmap_stage, status } = req.query;
    const studentId = (req as any).user?.userId;
    const problems = await DSAService.getProblems({
      topic_id: topic_id as string,
      difficulty: difficulty as string,
      search: search as string,
      subtopic: subtopic as string,
      company: company as string,
      roadmap_stage: roadmap_stage as string,
      status: status as string,
      student_id: studentId,
    });
    res.json({
      success: true,
      data: Array.isArray(problems) ? problems.map(publicProblem) : problems,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/problems/:problem_id', async (req, res, next) => {
  try {
    const problem = await DSAService.getProblem(req.params.problem_id);
    // Hidden tests decide a submission; only their count is public.
    const { hidden_test_cases, ...visible } = problem as any;
    res.json({
      success: true,
      data: { ...visible, hidden_test_case_count: (hidden_test_cases || []).length },
    });
  } catch (err) {
    next(err);
  }
});

// Run Code: Real execution against sample/public test cases only (No problem solved mark)
dsaRouter.post('/dsa/problems/:problem_id/run', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code } = req.body;
    if (!language) throw new ValidationError('Language is required.');
    if (!source_code) throw new ValidationError('Source code is required.');

    const result = await DSAService.runCode(req.params.problem_id, {
      language,
      source_code,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Submit Problem Solution: Real evaluation against all public and hidden test cases
dsaRouter.post('/dsa/problems/:problem_id/submit', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { language, source_code } = req.body;

    if (!language) throw new ValidationError('Language is required.');
    if (!source_code) throw new ValidationError('Source code is required.');

    const submission = await DSAService.submitSolution(studentId, req.params.problem_id, {
      language,
      source_code,
    });

    res.json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
});

// Problem Hints
dsaRouter.get('/dsa/problems/:problem_id/hints', async (req, res, next) => {
  try {
    const level = req.query.level ? Number(req.query.level) : 1;
    const hintData = await DSAService.getHints(req.params.problem_id, level);
    res.json({
      success: true,
      data: hintData,
    });
  } catch (err) {
    next(err);
  }
});

// ================= PROGRESS TRACKING =================
dsaRouter.get('/dsa/progress', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const progress = await DSAService.getProgress(studentId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/topics/:topic_id/progress', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const topic = await DSAService.getTopic(req.params.topic_id);
    const problems = await DSAService.getProblems({ topic_id: topic.id });
    const progress = await DSAService.getProgress(studentId);

    const solvedInTopic = problems.filter((p) => progress.problems_solved.includes(p.id)).length;
    const totalInTopic = problems.length;

    res.json({
      success: true,
      data: {
        topic_id: topic.id,
        topic_name: topic.name,
        total_problems: totalInTopic,
        solved_problems: solvedInTopic,
        completion_percentage: totalInTopic > 0 ? Math.round((solvedInTopic / totalInTopic) * 100) : 0,
        viewed: progress.topics_viewed.includes(topic.id),
      },
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.post('/dsa/visualizations/:algorithm_id/complete', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const prog = await DSAService.recordVisualization(studentId, req.params.algorithm_id);
    res.json({
      success: true,
      data: prog,
    });
  } catch (err) {
    next(err);
  }
});
