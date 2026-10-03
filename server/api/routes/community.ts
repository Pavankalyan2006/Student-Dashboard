import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { CommunityService } from '../../services/communityService';
import { ModerationService } from '../../services/moderationService';

export const communityRouter = Router();

// --- Topics ---
communityRouter.get('/community/topics', async (_req: Request, res: Response) => {
  try {
    const topics = await CommunityService.getTopics();
    res.json({ success: true, data: topics });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.get('/community/topics/:id', async (req: Request, res: Response) => {
  try {
    const topic = await CommunityService.getTopic(req.params.id);
    res.json({ success: true, data: topic });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/topics/:id/follow', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await CommunityService.followTopic(studentId, req.params.id);
    res.json({ success: true, message: 'Followed topic successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.delete('/community/topics/:id/follow', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await CommunityService.unfollowTopic(studentId, req.params.id);
    res.json({ success: true, message: 'Unfollowed topic successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.get('/community/followed-topics', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const followed = await CommunityService.getFollowedTopics(studentId);
    res.json({ success: true, data: followed });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Questions ---
communityRouter.get('/community/questions', async (req: Request, res: Response) => {
  try {
    const { topicId, tag, search } = req.query;
    const questions = await CommunityService.getQuestions({
      topicId: topicId as string,
      tag: tag as string,
      search: search as string,
    });
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions/assist', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const assistance = await CommunityService.assistQuestion(title || '', description || '');
    res.json({ success: true, data: assistance });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const question = await CommunityService.createQuestion(studentId, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.get('/community/questions/:id', async (req: Request, res: Response) => {
  try {
    const question = await CommunityService.getQuestion(req.params.id);
    const answers = await CommunityService.getAnswers(req.params.id);
    res.json({ success: true, data: { ...question, answers } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.patch('/community/questions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await CommunityService.updateQuestion(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.delete('/community/questions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await CommunityService.deleteQuestion(req.params.id, studentId);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const question = await CommunityService.upvoteQuestion(req.params.id);
    res.json({ success: true, data: question });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Answers ---
communityRouter.get('/community/questions/:id/answers', async (req: Request, res: Response) => {
  try {
    const answers = await CommunityService.getAnswers(req.params.id);
    res.json({ success: true, data: answers });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions/:id/answers', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const answer = await CommunityService.createAnswer(studentId, req.params.id, req.body);
    res.status(201).json({ success: true, data: answer });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.patch('/community/answers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await CommunityService.updateAnswer(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.delete('/community/answers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await CommunityService.deleteAnswer(req.params.id, studentId);
    res.json({ success: true, message: 'Answer deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions/:id/answers/:answerId/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const answer = await CommunityService.upvoteAnswer(req.params.id, req.params.answerId);
    res.json({ success: true, data: answer });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/questions/:id/accept', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { answer_id } = req.body;
    await CommunityService.acceptAnswer(req.params.id, answer_id, studentId);
    res.json({ success: true, message: 'Answer accepted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Discussions ---
communityRouter.get('/community/discussions', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const discussions = await CommunityService.getDiscussions(category);
    res.json({ success: true, data: discussions });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/discussions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const discussion = await CommunityService.createDiscussion(studentId, req.body);
    res.status(201).json({ success: true, data: discussion });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.get('/community/discussions/:id', async (req: Request, res: Response) => {
  try {
    const discussion = await CommunityService.getDiscussion(req.params.id);
    res.json({ success: true, data: discussion });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/discussions/:id/replies', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }
    const reply = await CommunityService.addDiscussionReply(studentId, req.params.id, content);
    res.status(201).json({ success: true, data: reply });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/discussions/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const discussion = await CommunityService.upvoteDiscussion(req.params.id);
    res.json({ success: true, data: discussion });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Resources ---
communityRouter.get('/community/resources', async (req: Request, res: Response) => {
  try {
    const topicId = req.query.topic_id as string;
    const resources = await CommunityService.getResources(topicId);
    res.json({ success: true, data: resources });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/resources', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const resource = await CommunityService.createResource(studentId, req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/resources/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const resource = await CommunityService.upvoteResource(req.params.id);
    res.json({ success: true, data: resource });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Projects Showcase ---
communityRouter.get('/community/projects', async (_req: Request, res: Response) => {
  try {
    const projects = await CommunityService.getProjects();
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await CommunityService.createProject(studentId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.post('/community/projects/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const project = await CommunityService.upvoteProject(req.params.id);
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// --- Moderation Reports ---
communityRouter.post('/community/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const report = await ModerationService.reportContent(studentId, req.body);
    res.status(201).json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

communityRouter.get('/community/reports', requireAuth, requireRole('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  try {
    const reports = await ModerationService.getReports();
    res.json({ success: true, data: reports });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
