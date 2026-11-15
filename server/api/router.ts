import { Router } from 'express';
import { healthRouter } from './routes/health';
import { pilotFeedbackRouter } from './routes/pilotFeedback';
import { authRouter } from './routes/auth';
import { studentsRouter } from './routes/students';
import { notificationsRouter } from './routes/notifications';
import { searchRouter } from './routes/search';
import { aiRouter } from './routes/ai';
import { storageRouter } from './routes/storage';
import { dashboardRouter } from './routes/dashboard';
import { coursesRouter } from './routes/courses';
import { notesRouter } from './routes/notes';
import { documentsRouter } from './routes/documents';
import { codingRouter } from './routes/coding';
import { dsaRouter } from './routes/dsa';
import { quizRouter } from './routes/quiz';
import projectsRouter from './routes/projects';
import placementsRouter from './routes/placements';
import { resumesRouter } from './routes/resumes';
import { careerRouter } from './routes/career';
import { skillsRouter } from './routes/skills';
import { researchRouter } from './routes/research';
import { gitLabRouter } from './routes/gitLab';
import { githubRouter } from './routes/github';
import { contextRouter } from './routes/context';
import { profileRouter } from './routes/profile';
import { profileMeRouter } from './routes/profileMe';
import { progressRouter } from './routes/progress';
import { goalsRouter } from './routes/goals';
import { bookmarksRouter } from './routes/bookmarks';
import { communityRouter } from './routes/community';
import { certificatesRouter } from './routes/certificates';
import { insightsRouter } from './routes/insights';
import { discoverRouter } from './routes/discover';
import { aiMemoryRouter } from './routes/aiMemory';
import { deadlinesRouter } from './routes/deadlines';
import { showcaseRouter } from './routes/showcase';
import { personalIntelligenceRouter } from './routes/personalIntelligence';
import { codeReviewRouter } from './routes/codeReview';
import { academicsRouter } from './routes/academics';
import { adminRouter } from './routes/admin';

import { learningModulesRouter } from './routes/learningModules';
import { externalIntegrationsRouter } from './routes/externalIntegrations';
import { semesterCommandCenterRouter } from './routes/semesterCommandCenter';
import { eventsRouter } from './routes/events';
import { onboardingRouter } from './routes/onboarding';
import { systemDesignRouter } from './routes/systemDesign';
import { gateRouter } from './routes/gate';

export const apiV1Router = Router();

apiV1Router.use('/', healthRouter);
apiV1Router.use('/', authRouter);
apiV1Router.use('/admin', adminRouter);
apiV1Router.use('/', eventsRouter);
apiV1Router.use('/', studentsRouter);
apiV1Router.use('/', onboardingRouter);
apiV1Router.use('/', notificationsRouter);
apiV1Router.use('/', searchRouter);
apiV1Router.use('/', aiRouter);
apiV1Router.use('/', storageRouter);
apiV1Router.use('/', dashboardRouter);
apiV1Router.use('/', coursesRouter);
apiV1Router.use('/', notesRouter);
apiV1Router.use('/', documentsRouter);
apiV1Router.use('/', codingRouter);
apiV1Router.use('/', dsaRouter);
apiV1Router.use('/', quizRouter);
apiV1Router.use('/projects', projectsRouter);
apiV1Router.use('/placements', placementsRouter);
apiV1Router.use('/resumes', resumesRouter);
apiV1Router.use('/career', careerRouter);
apiV1Router.use('/skills', skillsRouter);
apiV1Router.use('/research', researchRouter);
apiV1Router.use('/git-lab', gitLabRouter);
apiV1Router.use('/github', githubRouter);
apiV1Router.use('/context', contextRouter);
apiV1Router.use('/', profileMeRouter);
apiV1Router.use('/', profileRouter);
apiV1Router.use('/', progressRouter);
apiV1Router.use('/', goalsRouter);
apiV1Router.use('/', bookmarksRouter);
apiV1Router.use('/', communityRouter);
apiV1Router.use('/', certificatesRouter);
apiV1Router.use('/', insightsRouter);
apiV1Router.use('/', discoverRouter);
apiV1Router.use('/', academicsRouter);
apiV1Router.use('/', aiMemoryRouter);
apiV1Router.use('/', deadlinesRouter);
apiV1Router.use('/', showcaseRouter);
apiV1Router.use('/', personalIntelligenceRouter);
apiV1Router.use('/', codeReviewRouter);
apiV1Router.use('/', learningModulesRouter);
apiV1Router.use('/', externalIntegrationsRouter);
apiV1Router.use('/', semesterCommandCenterRouter);
apiV1Router.use('/', systemDesignRouter);
apiV1Router.use('/', gateRouter);
// Phase 6: private pilot feedback (own entries only; no admin route).
apiV1Router.use('/', pilotFeedbackRouter);

// Dedicated AI Mock Interview Endpoints
import { mockInterviewsRouter } from './routes/mockInterviews';

apiV1Router.use('/mock-interviews', mockInterviewsRouter);
apiV1Router.use('/interviews', mockInterviewsRouter);

// Dedicated Lab Assistant & Experiment Workspace Endpoints
import { labAssistantRouter } from './routes/labAssistant';

apiV1Router.use('/labs', labAssistantRouter);
apiV1Router.use('/lab-assistant', labAssistantRouter);

// Dedicated Language Learning Platform Endpoints (150+ Languages)
import { languageLearningRouter } from './routes/languages';

apiV1Router.use('/languages', languageLearningRouter);
apiV1Router.use('/language-learning', languageLearningRouter);

// Dedicated Multi-Source Jobs Discovery Platform (Government + Private)
import { jobsDiscoveryRouter } from './routes/jobsDiscovery';

apiV1Router.use('/jobs-discovery', jobsDiscoveryRouter);
apiV1Router.use('/career/jobs-discovery', jobsDiscoveryRouter);
apiV1Router.use('/jobs', jobsDiscoveryRouter);

// Dedicated External Profiles Platform Endpoints
import { externalProfilesRouter } from './routes/externalProfiles';

apiV1Router.use('/external-profiles', externalProfilesRouter);
apiV1Router.use('/profile/external-profiles', externalProfilesRouter);

// Dedicated AI Knowledge Base Endpoints
import { knowledgeBaseRouter } from './routes/knowledgeBase';

apiV1Router.use('/knowledge-base', knowledgeBaseRouter);
apiV1Router.use('/knowledge', knowledgeBaseRouter);

