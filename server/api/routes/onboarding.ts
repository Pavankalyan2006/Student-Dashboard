import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { OnboardingService } from '../../services/onboardingService';
import { ValidationError } from '../../core/exceptions';

export const onboardingRouter = Router();

// === ONBOARDING STATUS ===

// GET /api/v1/students/me/onboarding
onboardingRouter.get('/students/me/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const status = await OnboardingService.getOnboardingStatus(studentId);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/onboarding (update step status)
onboardingRouter.put('/students/me/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const { step_id, completed, skipped } = req.body;
    if (!step_id) throw new ValidationError('step_id is required');

    const status = await OnboardingService.updateOnboardingStep(studentId, step_id, completed ?? false, skipped ?? false);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/students/me/onboarding/complete
onboardingRouter.post('/students/me/onboarding/complete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const status = await OnboardingService.completeOnboarding(studentId);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// === EDUCATION PROFILE ===

// GET /api/v1/students/me/education
onboardingRouter.get('/students/me/education', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const education = await OnboardingService.getEducationProfile(studentId);
    res.json({ success: true, data: education });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/education
onboardingRouter.put('/students/me/education', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const education = await OnboardingService.saveEducationProfile(studentId, req.body);
    res.json({ success: true, data: education });
  } catch (err) {
    next(err);
  }
});

// === SEMESTER & SYLLABUS ===

// GET /api/v1/students/me/semester-syllabus
onboardingRouter.get('/students/me/semester-syllabus', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const syllabus = await OnboardingService.getSemesterSyllabus(studentId);
    res.json({ success: true, data: syllabus });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/semester-syllabus
onboardingRouter.put('/students/me/semester-syllabus', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const syllabus = await OnboardingService.saveSemesterSyllabus(studentId, req.body);
    res.json({ success: true, data: syllabus });
  } catch (err) {
    next(err);
  }
});

// === LEARNING PREFERENCES ===

// GET /api/v1/students/me/preferences
onboardingRouter.get('/students/me/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const preferences = await OnboardingService.getLearningPreferences(studentId);
    res.json({ success: true, data: preferences });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/preferences
onboardingRouter.put('/students/me/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const preferences = await OnboardingService.saveLearningPreferences(studentId, req.body);
    res.json({ success: true, data: preferences });
  } catch (err) {
    next(err);
  }
});

// === SKILLS ASSESSMENT ===

// GET /api/v1/students/me/skills-assessment
onboardingRouter.get('/students/me/skills-assessment', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const skills = await OnboardingService.getSkillsAssessment(studentId);
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/skills-assessment
onboardingRouter.put('/students/me/skills-assessment', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const skills = await OnboardingService.saveSkillsAssessment(studentId, req.body);
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

// === ACADEMIC HISTORY ===

// GET /api/v1/students/me/academic-history
onboardingRouter.get('/students/me/academic-history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const history = await OnboardingService.getAcademicHistory(studentId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/academic-history
onboardingRouter.put('/students/me/academic-history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const history = await OnboardingService.saveAcademicHistory(studentId, req.body);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// === CAREER GOALS ===

// GET /api/v1/students/me/career-goals
onboardingRouter.get('/students/me/career-goals', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const goals = await OnboardingService.getCareerGoals(studentId);
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/career-goals
onboardingRouter.put('/students/me/career-goals', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const goals = await OnboardingService.saveCareerGoals(studentId, req.body);
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
});

// === PORTFOLIO PROJECTS ===

// GET /api/v1/students/me/portfolio-projects
onboardingRouter.get('/students/me/portfolio-projects', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const projects = await OnboardingService.getPortfolioProjects(studentId);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/students/me/portfolio-projects
onboardingRouter.post('/students/me/portfolio-projects', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const { title, description } = req.body;
    if (!title) throw new ValidationError('Project title is required');

    const project = await OnboardingService.addPortfolioProject(studentId, {
      title,
      description: description || '',
      problem_statement: req.body.problem_statement,
      technologies: req.body.technologies || [],
      status: req.body.status || 'IN_PROGRESS',
      contribution: req.body.contribution,
      repository_url: req.body.repository_url,
      demo_url: req.body.demo_url,
      documentation_url: req.body.documentation_url,
      skills_demonstrated: req.body.skills_demonstrated || [],
      next_milestones: req.body.next_milestones,
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/students/me/portfolio-projects/:id
onboardingRouter.patch('/students/me/portfolio-projects/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const projectId = req.params.id;
    const project = await OnboardingService.updatePortfolioProject(studentId, projectId, req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/students/me/portfolio-projects/:id
onboardingRouter.delete('/students/me/portfolio-projects/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    await OnboardingService.deletePortfolioProject(studentId, req.params.id);
    res.json({ success: true, message: 'Project removed' });
  } catch (err) {
    next(err);
  }
});

// === STUDY CONSTRAINTS ===

// GET /api/v1/students/me/study-constraints
onboardingRouter.get('/students/me/study-constraints', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const constraints = await OnboardingService.getStudyConstraints(studentId);
    res.json({ success: true, data: constraints });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/study-constraints
onboardingRouter.put('/students/me/study-constraints', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const constraints = await OnboardingService.saveStudyConstraints(studentId, req.body);
    res.json({ success: true, data: constraints });
  } catch (err) {
    next(err);
  }
});

// === PROFILE COMPLETION ===

// GET /api/v1/students/me/profile/completion
onboardingRouter.get('/students/me/profile/completion', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const completion = await OnboardingService.getProfileCompletion(studentId);
    res.json({ success: true, data: completion });
  } catch (err) {
    next(err);
  }
});

// === STUDENT INTELLIGENCE CONTEXT ===

// GET /api/v1/students/me/intelligence-context
onboardingRouter.get('/students/me/intelligence-context', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const context = await OnboardingService.buildIntelligenceContext(studentId);
    res.json({ success: true, data: context });
  } catch (err) {
    next(err);
  }
});

// === STUDENT MEMORY ===

// GET /api/v1/students/me/memory
onboardingRouter.get('/students/me/memory', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const memories = await OnboardingService.getStudentMemories(studentId);
    res.json({ success: true, data: memories });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/students/me/memory/:id
onboardingRouter.delete('/students/me/memory/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    await OnboardingService.deleteStudentMemory(studentId, req.params.id);
    res.json({ success: true, message: 'Memory entry deleted' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/students/me/memory (clear all)
onboardingRouter.delete('/students/me/memory', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    await OnboardingService.clearStudentMemories(studentId);
    res.json({ success: true, message: 'All memory entries cleared' });
  } catch (err) {
    next(err);
  }
});

// === RECOMMENDATIONS ===

// GET /api/v1/students/me/recommendations
onboardingRouter.get('/students/me/recommendations', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const recommendations = await OnboardingService.generateRecommendations(studentId);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/students/me/recommendations/:id/dismiss
onboardingRouter.patch('/students/me/recommendations/:id/dismiss', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    await OnboardingService.dismissRecommendation(studentId, req.params.id);
    res.json({ success: true, message: 'Recommendation dismissed' });
  } catch (err) {
    next(err);
  }
});

// === STUDENT AI COMPANION PERSONA ===

// GET /api/v1/students/me/ai-persona
onboardingRouter.get('/students/me/ai-persona', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const persona = await OnboardingService.getOrGenerateAIPersona(studentId);
    res.json({ success: true, data: persona });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/students/me/ai-persona
onboardingRouter.put('/students/me/ai-persona', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const persona = await OnboardingService.saveAIPersona(studentId, req.body);
    res.json({ success: true, data: persona });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/students/me/ai-persona/regenerate
onboardingRouter.post('/students/me/ai-persona/regenerate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.userId;
    const persona = await OnboardingService.synthesizeAIPersona(studentId, req.body);
    res.json({ success: true, data: persona });
  } catch (err) {
    next(err);
  }
});

