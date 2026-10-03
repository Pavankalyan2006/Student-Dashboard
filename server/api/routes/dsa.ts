import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { DSAService } from '../../services/dsa';
import { CodingService } from '../../services/coding';
import { DSATutorService } from '../../services/dsaTutorService';
import { ValidationError } from '../../core/exceptions';

export const dsaRouter = Router();

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
        problems,
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
dsaRouter.post('/dsa/tutor/chat', async (req, res, next) => {
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

// ================= PROBLEMS =================
dsaRouter.get('/dsa/problems', async (req, res, next) => {
  try {
    const { topic_id, difficulty, search } = req.query;
    const problems = await DSAService.getProblems({
      topic_id: topic_id as string,
      difficulty: difficulty as string,
      search: search as string,
    });
    res.json({
      success: true,
      data: problems,
    });
  } catch (err) {
    next(err);
  }
});

dsaRouter.get('/dsa/problems/:problem_id', async (req, res, next) => {
  try {
    const problem = await DSAService.getProblem(req.params.problem_id);
    res.json({
      success: true,
      data: problem,
    });
  } catch (err) {
    next(err);
  }
});

// Submit Problem Solution (Reuses Coding Lab execution sandbox!)
dsaRouter.post('/dsa/problems/:problem_id/submit', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const problem = await DSAService.getProblem(req.params.problem_id);
    const { language, source_code } = req.body;

    if (!language) throw new ValidationError('Language is required.');
    if (!source_code) throw new ValidationError('Source code is required.');

    // Execute through existing sandbox test runner
    const submission = await CodingService.submitSolution(studentId, problem.id, {
      language,
      source_code,
    });

    if (submission.status === 'ACCEPTED') {
      await DSAService.recordProblemSolved(studentId, problem.id);
    }

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
