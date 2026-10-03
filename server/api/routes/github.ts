import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { GitHubService } from '../../services/githubService';
import { GitHubAnalysisService } from '../../services/githubAnalysisService';
import { logger } from '../../core/logging';

export const githubRouter = Router();

// ==========================================
// 1. Connection & OAuth
// ==========================================

githubRouter.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const status = await GitHubService.getConnectionStatus(studentId);
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/connect', requireAuth, (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const redirectUri = req.query.redirect_uri as string | undefined;
    const oauth = GitHubService.initiateOAuth(studentId, redirectUri);
    res.json({ success: true, data: oauth });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/callback', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const username = (req.query.username as string) || 'student-engineer';
    const connection = await GitHubService.connectAccount(studentId, username);
    res.json({ success: true, data: connection });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const disconnected = await GitHubService.disconnectAccount(studentId);
    res.json({ success: true, data: { disconnected } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Repositories
// ==========================================

githubRouter.get('/repos', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const language = req.query.language as string | undefined;
    const visibility = req.query.visibility as string | undefined;
    const repos = await GitHubService.listRepositories(studentId, { language, visibility });
    res.json({ success: true, data: repos });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/repos/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const repo = await GitHubService.getRepository(req.params.id, studentId);
    res.json({ success: true, data: repo });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

githubRouter.post('/repos/:id/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const repo = await GitHubService.syncRepository(req.params.id, studentId);
    res.json({ success: true, data: repo });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. Tree, Files & Explorer
// ==========================================

githubRouter.get('/repos/:id/tree', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const files = await GitHubService.getRepositoryFiles(req.params.id, studentId);
    // Build tree structure
    const tree = files.map((f) => ({
      path: f.path,
      name: f.name,
      type: f.type,
      size: f.size,
      sha: f.sha,
    }));
    res.json({ success: true, data: tree });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/repos/:id/files', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const filePath = req.query.path as string;

    if (filePath) {
      const file = await GitHubService.getFileContent(req.params.id, filePath, studentId);
      // Redact secrets before returning content to client
      const { cleanText } = GitHubAnalysisService.redactSecrets(file.content || '');
      return res.json({ success: true, data: { ...file, content: cleanText } });
    }

    const files = await GitHubService.getRepositoryFiles(req.params.id, studentId);
    res.json({ success: true, data: files });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Commits, Issues & Pull Requests
// ==========================================

githubRouter.get('/repos/:id/commits', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const commits = await GitHubService.getCommits(req.params.id, studentId);
    res.json({ success: true, data: commits });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/repos/:id/issues', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const issues = await GitHubService.getIssues(req.params.id, studentId);
    res.json({ success: true, data: issues });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.get('/repos/:id/pulls', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const pulls = await GitHubService.getPullRequests(req.params.id, studentId);
    res.json({ success: true, data: pulls });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. AI Analysis & Code Intelligence
// ==========================================

githubRouter.post('/repos/:id/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analysis = await GitHubAnalysisService.analyzeRepository(req.params.id, studentId);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/repos/:id/search', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    const files = await GitHubService.getRepositoryFiles(req.params.id, studentId);
    const matches = files
      .filter((f) => f.path.toLowerCase().includes(query.toLowerCase()) || (f.content || '').toLowerCase().includes(query.toLowerCase()))
      .map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        snippet: (f.content || '').split('\n').find((l) => l.toLowerCase().includes(query.toLowerCase()))?.trim() || f.path,
      }));
    res.json({ success: true, data: matches });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/files/explain', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { repo_id, file_path } = req.body;
    if (!repo_id || !file_path) {
      return res.status(400).json({ success: false, message: 'repo_id and file_path are required' });
    }
    const explanation = await GitHubAnalysisService.explainFile(repo_id, file_path, studentId);
    res.json({ success: true, data: explanation });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/files/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { repo_id, file_path } = req.body;
    if (!repo_id || !file_path) {
      return res.status(400).json({ success: false, message: 'repo_id and file_path are required' });
    }
    const review = await GitHubAnalysisService.reviewCode(repo_id, file_path, studentId);
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/files/generate-tests', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { repo_id, file_path } = req.body;
    if (!repo_id || !file_path) {
      return res.status(400).json({ success: false, message: 'repo_id and file_path are required' });
    }
    const tests = await GitHubAnalysisService.generateTests(repo_id, file_path, studentId);
    res.json({ success: true, data: tests });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

githubRouter.post('/repos/:id/onboarding-guide', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const guide = await GitHubAnalysisService.generateOnboardingGuide(req.params.id, studentId);
    res.json({ success: true, data: guide });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. Link to Project Builder
// ==========================================

githubRouter.post('/repos/:id/link-project', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { project_id } = req.body;
    if (!project_id) {
      return res.status(400).json({ success: false, message: 'project_id is required' });
    }
    const updated = await GitHubService.linkProject(req.params.id, studentId, project_id);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});
