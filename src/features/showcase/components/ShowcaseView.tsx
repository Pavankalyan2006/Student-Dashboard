import * as React from 'react';
import { Award, BadgeCheck, ExternalLink, Github, Hammer, Star, Sparkles } from 'lucide-react';

export interface ShowcaseData {
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
}

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
    {children} <ExternalLink className="h-3 w-3" />
  </a>
);

function Section({ title, icon, children, testId }: { title: string; icon: React.ReactNode; children: React.ReactNode; testId: string }) {
  return (
    <section className="space-y-3" data-testid={testId}>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{icon}{title}</h2>
      {children}
    </section>
  );
}

/** Renders a showcase. Used for the owner's preview and for the public link, so both always match. */
export function ShowcaseView({ data, sections }: { data: ShowcaseData; sections?: Partial<Record<'skills' | 'projects' | 'certificates' | 'achievements' | 'github', boolean>> }) {
  const show = (k: keyof NonNullable<typeof sections>) => !sections || sections[k] !== false;
  const sub = [data.branch, data.semester ? `Semester ${data.semester}` : ''].filter(Boolean).join(' · ');
  const empty = !data.skills.length && !data.projects.length && !data.certificates.length && !data.achievements.length && !data.github.length;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white sm:p-8">
        {data.name && <p className="font-display text-2xl font-semibold sm:text-3xl" data-testid="showcase-name">{data.name}</p>}
        {data.headline && <p className="mt-1 text-base text-blue-100">{data.headline}</p>}
        {sub && <p className="mt-2 text-sm text-blue-200">{sub}</p>}
        {data.target_roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.target_roles.map((r) => <span key={r} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/20">{r}</span>)}
          </div>
        )}
      </header>

      {empty && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">Nothing to show yet.</p>}

      {show('skills') && data.skills.length > 0 && (
        <Section title="Skills" icon={<Sparkles className="h-4 w-4" />} testId="showcase-skills">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span key={s.name} className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-800">{s.name}{s.level ? <span className="ml-1 text-xs text-slate-500">{s.level}</span> : null}</span>
            ))}
          </div>
        </Section>
      )}

      {show('projects') && data.projects.length > 0 && (
        <Section title="Projects" icon={<Hammer className="h-4 w-4" />} testId="showcase-projects">
          <div className="grid gap-3 md:grid-cols-2">
            {data.projects.map((p) => (
              <article key={p.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                {p.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.description}</p>}
                {p.technologies.length > 0 && <p className="mt-2 text-xs text-slate-500">{p.technologies.join(' · ')}</p>}
                {(p.repository_url || p.demo_url) && (
                  <div className="mt-2 flex gap-3">
                    {p.repository_url && <Ext href={p.repository_url}>Code</Ext>}
                    {p.demo_url && <Ext href={p.demo_url}>Demo</Ext>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {show('github') && data.github.length > 0 && (
        <Section title="Featured repositories" icon={<Github className="h-4 w-4" />} testId="showcase-github">
          <div className="grid gap-3 md:grid-cols-2">
            {data.github.map((r) => (
              <article key={r.url || r.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{r.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="h-3.5 w-3.5" />{r.stars}</span>
                </div>
                {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  {r.language && <span>{r.language}</span>}
                  {r.url && <Ext href={r.url}>GitHub</Ext>}
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {show('certificates') && data.certificates.length > 0 && (
        <Section title="Certificates" icon={<BadgeCheck className="h-4 w-4" />} testId="showcase-certificates">
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {data.certificates.map((c) => (
              <li key={c.verify_path} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-slate-900">{c.title}</span>
                  <span className="text-xs text-slate-500">{c.issuer}{c.date ? ` · ${c.date}` : ''}</span>
                </span>
                <a href={c.verify_path} className="text-xs font-medium text-blue-600 hover:underline">Verify</a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {show('achievements') && data.achievements.length > 0 && (
        <Section title="Achievements" icon={<Award className="h-4 w-4" />} testId="showcase-achievements">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.achievements.map((a) => (
              <div key={a.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{a.description}</p>
                {a.earned_at && <p className="mt-1 text-[11px] text-slate-500">Earned {a.earned_at}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
