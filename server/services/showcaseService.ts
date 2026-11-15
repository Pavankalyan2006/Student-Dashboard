// Portfolio showcase: one page that presents the student's real work, which they can share by link if they choose.
//
// Everything shown comes from the student's own records: projects they created, portfolio projects from
// onboarding, certificates issued on the platform, achievements they earned, GitHub repositories they marked
// as featured, and skills from their profile. Sharing is off by default. When it is on, the public link shows
// only the sections the student picked; email, phone, college and account ids are never included, and the
// name only if they allow it. A new link can be made at any time, which stops the old one working.
import { randomBytes } from 'crypto';
import { db } from '../db/database';
import { ValidationError, NotFoundError } from '../core/exceptions';

export type ShowcaseSection = 'education' | 'skills' | 'projects' | 'research' | 'competitions' | 'certificates' | 'achievements' | 'github';
export const SHOWCASE_SECTIONS: ShowcaseSection[] = ['education', 'skills', 'projects', 'research', 'competitions', 'certificates', 'achievements', 'github'];
// Sections added later start switched off for the public link, so nothing new is published without the student
// choosing it. Education (branch and semester) was always shown before it had a switch, so it starts on.
const DEFAULT_SECTIONS: Record<ShowcaseSection, boolean> = { education: true, skills: true, projects: true, research: false, competitions: false, certificates: true, achievements: true, github: true };

export interface ShowcaseSettings {
  student_id: string;
  enabled: boolean;
  slug: string | null;
  show_name: boolean;
  headline: string;
  sections: Record<ShowcaseSection, boolean>;
  updated_at: string | null;
}

export interface ShowcaseView {
  name: string | null;
  headline: string;
  branch: string;
  semester: number | null;
  target_roles: string[];
  skills: { name: string; level?: string }[];
  projects: { title: string; description: string; technologies: string[]; repository_url?: string; demo_url?: string }[];
  certificates: { title: string; issuer: string; date: string; verify_path: string }[];
  achievements: { name: string; description: string; earned_at: string }[];
  github: { name: string; description: string; language: string; stars: number; url: string }[];
  research: { title: string; topic: string; type: string; status: string; question?: string }[];
  competitions: { event: string; kind: string; outcome: string; rank?: number; date: string; project?: string; proof_url?: string }[];
}

export const showcaseStores: { settings: Map<string, ShowcaseSettings> } = { settings: new Map() };

export function defaultShowcase(studentId: string): ShowcaseSettings {
  return {
    student_id: studentId,
    enabled: false,
    slug: null,
    show_name: true,
    headline: '',
    sections: { ...DEFAULT_SECTIONS },
    updated_at: null,
  };
}

const newSlug = () => randomBytes(9).toString('base64url');
const httpUrl = (v: unknown) => (typeof v === 'string' && /^https?:\/\/[^\s]+$/i.test(v) ? v : undefined);
const clip = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

async function safe<T>(p: () => Promise<T> | T, fallback: T): Promise<T> {
  try {
    return await p();
  } catch {
    return fallback;
  }
}

export class ShowcaseService {
  static get(studentId: string): ShowcaseSettings {
    const s = showcaseStores.settings.get(studentId);
    if (!s) return defaultShowcase(studentId);
    // Settings saved before a section existed get that section's default.
    return { ...s, sections: { ...DEFAULT_SECTIONS, ...s.sections } };
  }

  static update(studentId: string, input: any): ShowcaseSettings {
    if (!input || typeof input !== 'object') throw new ValidationError('Send your showcase settings as an object.');
    const cur = this.get(studentId);
    const bool = (v: unknown, f: boolean) => (typeof v === 'boolean' ? v : f);
    const sections = { ...cur.sections };
    for (const s of SHOWCASE_SECTIONS) sections[s] = bool(input.sections?.[s], cur.sections[s]);
    const enabled = bool(input.enabled, cur.enabled);
    const next: ShowcaseSettings = {
      student_id: studentId,
      enabled,
      // A link is made the first time sharing is turned on and kept until the student asks for a new one.
      slug: enabled && !cur.slug ? newSlug() : cur.slug,
      show_name: bool(input.show_name, cur.show_name),
      headline: input.headline === undefined ? cur.headline : clip(input.headline, 140),
      sections,
      updated_at: new Date().toISOString(),
    };
    showcaseStores.settings.set(studentId, next);
    return next;
  }

  /** Replaces the share link; the old one stops working at once. */
  static rotate(studentId: string): ShowcaseSettings {
    const cur = this.get(studentId);
    const next = { ...cur, slug: newSlug(), updated_at: new Date().toISOString() };
    showcaseStores.settings.set(studentId, next);
    return next;
  }

  /** The student id behind a public link, or null when the link is unknown or sharing is off. */
  static ownerOf(slug: string): string | null {
    if (!/^[\w-]{6,40}$/.test(slug)) return null;
    for (const s of showcaseStores.settings.values()) if (s.enabled && s.slug === slug) return s.student_id;
    return null;
  }

  /** Everything the student could show. `publicView` limits it to the chosen sections and public repositories. */
  static async build(studentId: string, publicView: boolean): Promise<ShowcaseView> {
    const settings = this.get(studentId);
    const on = (s: ShowcaseSection) => !publicView || settings.sections[s];
    const student: any = await safe(() => db.getStudentById(studentId), null);
    if (!student) throw new NotFoundError('Student not found');
    const { StudentProfileService } = await import('./studentProfile/studentProfileService');
    const { OnboardingService } = await import('./onboardingService');
    const { GitHubService } = await import('./githubService');
    const profile: any = await safe(async () => (await StudentProfileService.getProfile(studentId)).profile, null);

    const { CompetitionHubService } = await import('./competitionHubService');
    const [projects, portfolio, certificates, achievements, repos, research] = await Promise.all([
      on('projects') ? safe(() => db.getProjects(studentId), [] as any[]) : [],
      on('projects') ? safe(() => OnboardingService.getPortfolioProjects(studentId), [] as any[]) : [],
      on('certificates') ? safe(() => db.getCertificates(studentId), [] as any[]) : [],
      on('achievements') ? safe(() => db.getStudentAchievements(studentId), [] as any[]) : [],
      on('github') ? safe(() => GitHubService.listFeatured(studentId), [] as any[]) : [],
      on('research') ? safe(() => db.getResearchProjects(studentId), [] as any[]) : [],
    ]);
    const competitions = on('competitions') ? await safe(async () => CompetitionHubService.results(studentId), [] as ReturnType<typeof CompetitionHubService.results>) : [];

    const seenTitles = new Set<string>();
    const projectRows: ShowcaseView['projects'] = [];
    for (const p of [...portfolio, ...projects]) {
      if (p.student_id && p.student_id !== studentId) continue;
      const key = clip(p.title, 120).toLowerCase();
      if (!key || seenTitles.has(key)) continue;
      seenTitles.add(key);
      projectRows.push({
        title: clip(p.title, 120),
        description: clip(p.description, 400),
        technologies: (p.technologies || p.tags || []).slice(0, 8).map((t: any) => clip(t, 40)),
        repository_url: httpUrl(p.repository_url),
        demo_url: httpUrl(p.demo_url),
      });
    }

    return {
      name: !publicView || settings.show_name ? clip(student.name, 100) : null,
      headline: settings.headline,
      branch: on('education') ? profile?.academic?.branch || student.branch || '' : '',
      semester: on('education') ? profile?.academic?.current_semester || student.semester || null : null,
      target_roles: (profile?.career?.target_roles || []).slice(0, 4),
      skills: on('skills') ? (profile?.skills?.skills || []).slice(0, 24).map((s: any) => ({ name: clip(s.name, 40), level: s.proficiency ? String(s.proficiency).toLowerCase() : undefined })) : [],
      projects: projectRows.slice(0, 12),
      certificates: certificates
        .filter((c: any) => c.student_id === studentId && c.status !== 'REVOKED')
        .map((c: any) => ({ title: clip(c.program_title || c.program_name, 120), issuer: clip(c.issuer, 80), date: String(c.issue_date || '').slice(0, 10), verify_path: `/verify/certificate/${encodeURIComponent(c.id)}` })),
      achievements: achievements
        .filter((a: any) => a.student_id === studentId && a.achievement)
        .map((a: any) => ({ name: clip(a.achievement.name, 80), description: clip(a.achievement.description, 200), earned_at: String(a.earned_at || '').slice(0, 10) })),
      github: repos
        .filter((r: any) => r.student_id === studentId && (!publicView || r.visibility === 'PUBLIC'))
        .slice(0, 8)
        .map((r: any) => ({ name: clip(r.featured_metadata?.title || r.name, 80), description: clip(r.featured_metadata?.custom_description || r.description, 300), language: clip(r.language, 30), stars: Number(r.stars) || 0, url: httpUrl(r.url) || '' })),
      research: research
        .filter((r: any) => r.student_id === studentId)
        .slice(0, 8)
        .map((r: any) => ({ title: clip(r.title, 160), topic: clip(r.topic || r.domain, 120), type: clip(String(r.research_type || '').toLowerCase().replace(/_/g, ' '), 40), status: clip(String(r.status || '').toLowerCase().replace(/_/g, ' '), 40), question: r.research_question ? clip(r.research_question, 300) : undefined })),
      // Results the student recorded in the Competition Hub. The page labels them as self-reported.
      competitions: competitions.slice(0, 12).map((c) => ({ event: clip(c.event, 160), kind: clip(c.kind.toLowerCase().replace(/_/g, ' '), 40), outcome: clip(c.outcome.toLowerCase().replace(/_/g, ' '), 40), rank: c.rank, date: c.date, project: c.project ? clip(c.project, 160) : undefined, proof_url: httpUrl(c.proof_url) })),
    };
  }
}
