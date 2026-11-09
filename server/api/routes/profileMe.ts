// Phase 5: profile context API. Every route acts on the authenticated student only; there is no
// student id in any path or body. See docs/phase-5/PHASE_5_PROFILE_CONTEXT_ARCHITECTURE.md.
import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { StudentProfileService } from '../../services/studentProfile/studentProfileService';
import { ValidationError } from '../../core/exceptions';
import { getModuleRecommendations } from '../../services/studentProfile/recommendations';
import type { ProfileSectionKey } from '../../services/studentProfile/types';

export const profileMeRouter = Router();

const handle =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req, res);
      if (!res.headersSent) res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

const me = (req: Request) => req.user!.userId;

function expectedVersion(req: Request): number | undefined {
  const raw = req.headers['if-match'];
  if (raw === undefined) return undefined;
  const n = Number(String(raw).replace(/"/g, ''));
  if (!Number.isInteger(n) || n < 0) throw new ValidationError('If-Match must be the profile_version number');
  return n;
}

profileMeRouter.get('/profile/me', requireAuth, handle(async (req, res) => {
  const result = await StudentProfileService.getProfile(me(req));
  res.setHeader('ETag', `"${result.profile.account.profile_version}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  return result;
}));

profileMeRouter.get('/profile/me/completion', requireAuth, handle((req) => StudentProfileService.getCompletion(me(req))));

const SECTIONS: ProfileSectionKey[] = ['identity', 'academic', 'skills', 'experience', 'career', 'learning'];
// Section paths. "preferences" is the learning-preferences alias from the Phase 5 spec.
const PATHS: Record<string, ProfileSectionKey> = Object.fromEntries([
  ...SECTIONS.map((s) => [s, s] as const),
  ['preferences', 'learning'] as const,
]);

for (const [path, section] of Object.entries(PATHS)) {
  profileMeRouter.get(`/profile/me/${path}`, requireAuth, handle((req) => StudentProfileService.getSection(me(req), section)));
  const write = handle((req) =>
    StudentProfileService.updateSection(me(req), section, req.body, { expectedVersion: expectedVersion(req) })
  );
  // Skills are replaced as a whole list (PUT); other sections accept partial updates (PATCH).
  if (section === 'skills') profileMeRouter.put(`/profile/me/${path}`, requireAuth, write);
  else profileMeRouter.patch(`/profile/me/${path}`, requireAuth, write);
}

profileMeRouter.get('/profile/me/context/:module', requireAuth, handle((req) =>
  StudentProfileService.getModuleContext(me(req), String(req.params.module))
));

profileMeRouter.get('/profile/me/recommendations/:module', requireAuth, handle(async (req) => {
  const { profile } = await StudentProfileService.getProfile(me(req));
  return getModuleRecommendations(profile, String(req.params.module));
}));

// --- onboarding (registration steps 1-7) ---
profileMeRouter.get('/profile/me/onboarding', requireAuth, handle(async (req) => {
  const { profile, completion } = await StudentProfileService.getProfile(me(req));
  return { onboarding: profile.account.onboarding, completion };
}));

profileMeRouter.put('/profile/me/onboarding/steps/:step', requireAuth, handle((req) =>
  StudentProfileService.saveOnboardingStep(me(req), Number(req.params.step), req.body?.data ?? req.body, {
    skip: req.body?.skip === true,
  })
));

profileMeRouter.post('/profile/me/onboarding/complete', requireAuth, handle((req) => StudentProfileService.completeOnboarding(me(req))));
