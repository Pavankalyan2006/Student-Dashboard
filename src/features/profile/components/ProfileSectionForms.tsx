// Phase 5: the section editors used by both the registration wizard (steps 1-6) and the Student
// Profile page. One set of forms, one API, so registration and later edits cannot drift apart.
import * as React from 'react';
import { Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { CanonicalProfile } from '../api/profileMeApi';

export type FieldErrors = Record<string, string>;

/** Pulls per-field messages out of an API validation error. */
export function fieldErrorsFrom(err: any): FieldErrors {
  const details = err?.details || err?.response?.error?.details;
  if (details && typeof details === 'object') return details;
  const m = /^([a-z_[\].0-9]+): (.+)$/i.exec(err?.message || '');
  return m ? { [m[1]]: m[2] } : {};
}

const label = 'block text-xs font-semibold text-slate-700 mb-1';
const inputCls =
  'w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600';
const areaCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600';

export function FieldError({ errors, name }: { errors: FieldErrors; name: string }) {
  const msg = errors[name];
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

export function TextField(props: {
  id: string;
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  errors?: FieldErrors;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={props.id} className={label}>
        {props.label} {props.required ? <span className="text-red-600">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      <input
        id={props.id}
        type={props.type || 'text'}
        className={inputCls}
        value={props.value ?? ''}
        placeholder={props.placeholder}
        aria-invalid={Boolean(props.errors?.[props.id])}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint && <p className="mt-1 text-[11px] text-slate-500">{props.hint}</p>}
      <FieldError errors={props.errors || {}} name={props.id} />
    </div>
  );
}

export function SelectField(props: {
  id: string;
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  errors?: FieldErrors;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={props.id} className={label}>
        {props.label} {props.required ? <span className="text-red-600">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      <select id={props.id} className={inputCls} value={props.value ?? ''} onChange={(e) => props.onChange(e.target.value)}>
        <option value="">Select…</option>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError errors={props.errors || {}} name={props.id} />
    </div>
  );
}

/** Add/remove list of short text values. */
export function ChipList(props: {
  id: string;
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  errors?: FieldErrors;
  required?: boolean;
}) {
  const [draft, setDraft] = React.useState('');
  const add = (v: string) => {
    const t = v.trim();
    if (!t || props.values.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    props.onChange([...props.values, t]);
    setDraft('');
  };
  return (
    <div>
      <label htmlFor={props.id} className={label}>
        {props.label} {props.required ? <span className="text-red-600">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      <div className="flex gap-2">
        <input
          id={props.id}
          className={inputCls}
          value={draft}
          placeholder={props.placeholder || 'Type and press Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => add(draft)} aria-label={`Add ${props.label}`}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {props.suggestions && props.suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {props.suggestions
            .filter((s) => !props.values.some((v) => v.toLowerCase() === s.toLowerCase()))
            .slice(0, 8)
            .map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-600 hover:bg-slate-100">
                + {s}
              </button>
            ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {props.values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => props.onChange(props.values.filter((x) => x !== v))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <FieldError errors={props.errors || {}} name={props.id} />
    </div>
  );
}

const toNum = (v: string) => (v === '' ? null : Number(v));

export interface SectionFormProps {
  profile: CanonicalProfile;
  errors: FieldErrors;
  /** Called with the section payload; the parent decides which endpoint saves it. */
  onChange: (data: Record<string, unknown>) => void;
}

// ---------------------------------------------------------------- identity
export function IdentityForm({ profile, errors, onChange, emailVerificationRequired }: SectionFormProps & { emailVerificationRequired?: boolean }) {
  const [s, setS] = React.useState({
    full_name: profile.identity.full_name,
    display_name: profile.identity.display_name || '',
    phone: profile.identity.phone || '',
    avatar_url: profile.identity.avatar_url || '',
    accept_terms: Boolean(profile.identity.terms_accepted_at),
    accept_privacy: Boolean(profile.identity.privacy_accepted_at),
  });
  React.useEffect(() => {
    onChange({
      full_name: s.full_name,
      display_name: s.display_name || null,
      phone: s.phone || null,
      avatar_url: s.avatar_url || null,
      ...(s.accept_terms ? { accept_terms: true } : {}),
      ...(s.accept_privacy ? { accept_privacy: true } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField id="full_name" label="Full name" required value={s.full_name} onChange={set('full_name')} errors={errors} />
        <TextField id="display_name" label="Display name" value={s.display_name} onChange={set('display_name')} errors={errors} />
        <div>
          <span className={label}>Email</span>
          <div className="min-h-9 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700">
            <span className="min-w-0 break-all">{profile.identity.email}</span>
            {profile.identity.email_verified ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="w-3 h-3" /> verified</span>
            ) : (
              <span className="text-xs text-amber-700">not verified{emailVerificationRequired ? ' (required)' : ''}</span>
            )}
          </div>
        </div>
        <TextField id="phone" label="Phone number" type="tel" value={s.phone} onChange={set('phone')} errors={errors} placeholder="+91 98xxxxxxx" />
        <TextField id="avatar_url" label="Profile photo link" value={s.avatar_url} onChange={set('avatar_url')} errors={errors} placeholder="https://…" />
      </div>
      {(!profile.identity.terms_accepted_at || !profile.identity.privacy_accepted_at) && (
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={s.accept_terms} onChange={(e) => set('accept_terms')(e.target.checked)} />
            <span>I agree to the Terms of Use. <span className="text-red-600">*</span></span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={s.accept_privacy} onChange={(e) => set('accept_privacy')(e.target.checked)} />
            <span>I have read the Privacy Policy and agree to my profile being used to personalise my learning. <span className="text-red-600">*</span></span>
          </label>
          <FieldError errors={errors} name="accept_terms" />
          <FieldError errors={errors} name="accept_privacy" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- academic
const DEGREES = ['B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'Other'];
const STATUSES = [
  { value: 'STUDYING', label: 'Studying (regular)' },
  { value: 'BACKLOGS_PENDING', label: 'Studying, with backlogs' },
  { value: 'GAP_YEAR', label: 'On a break / gap year' },
  { value: 'COMPLETED', label: 'Completed the degree' },
  { value: 'OTHER', label: 'Other' },
];

export function AcademicForm({ profile, errors, onChange }: SectionFormProps) {
  const a = profile.academic;
  const [s, setS] = React.useState({
    university: a.university || '',
    college: a.college || '',
    degree: a.degree || '',
    department: a.department || '',
    branch: a.branch || '',
    specialization: a.specialization || '',
    academic_year: a.academic_year?.toString() || '',
    current_semester: a.current_semester?.toString() || '',
    admission_year: a.admission_year?.toString() || '',
    expected_graduation_year: a.expected_graduation_year?.toString() || '',
    subjects: a.subjects,
    academic_status: a.academic_status || '',
    cgpa: a.cgpa?.toString() || '',
    cgpa_scale: a.cgpa_scale?.toString() || '',
    previous_qualifications: a.previous_qualifications,
    academic_achievements: a.academic_achievements,
  });
  React.useEffect(() => {
    onChange({
      university: s.university || null,
      college: s.college || null,
      degree: s.degree || null,
      department: s.department || null,
      branch: s.branch || null,
      specialization: s.specialization || null,
      academic_year: toNum(s.academic_year),
      current_semester: toNum(s.current_semester),
      admission_year: toNum(s.admission_year),
      expected_graduation_year: toNum(s.expected_graduation_year),
      subjects: s.subjects,
      academic_status: s.academic_status || null,
      cgpa: toNum(s.cgpa),
      cgpa_scale: toNum(s.cgpa_scale),
      previous_qualifications: s.previous_qualifications,
      academic_achievements: s.academic_achievements,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  const set = (k: keyof typeof s) => (v: any) =>
    setS((x) => {
      const next = { ...x, [k]: v };
      // Keep year of study consistent with the semester the student picks.
      if (k === 'current_semester' && v) next.academic_year = String(Math.ceil(Number(v) / 2));
      return next;
    });
  const year = new Date().getFullYear();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField id="college" label="College" required value={s.college} onChange={set('college')} errors={errors} />
        <TextField id="university" label="University" value={s.university} onChange={set('university')} errors={errors} />
        <SelectField id="degree" label="Degree" required value={s.degree} onChange={set('degree')} errors={errors} options={DEGREES.map((d) => ({ value: d, label: d }))} />
        <TextField id="department" label="Department" value={s.department} onChange={set('department')} errors={errors} />
        <TextField id="branch" label="Branch" required value={s.branch} onChange={set('branch')} errors={errors} placeholder="e.g. Computer Science and Engineering" />
        <TextField id="specialization" label="Specialization" value={s.specialization} onChange={set('specialization')} errors={errors} />
        <SelectField id="current_semester" label="Current semester" required value={s.current_semester} onChange={set('current_semester')} errors={errors} options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` }))} />
        <SelectField id="academic_year" label="Academic year (year of study)" required value={s.academic_year} onChange={set('academic_year')} errors={errors} options={Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: `Year ${i + 1}` }))} />
        <TextField id="admission_year" label="Admission year" type="number" value={s.admission_year} onChange={set('admission_year')} errors={errors} placeholder={String(year - 2)} />
        <TextField id="expected_graduation_year" label="Expected graduation year" type="number" required value={s.expected_graduation_year} onChange={set('expected_graduation_year')} errors={errors} placeholder={String(year + 2)} />
        <SelectField id="academic_status" label="Current academic status" value={s.academic_status} onChange={set('academic_status')} errors={errors} options={STATUSES} />
        <div className="grid grid-cols-2 gap-2">
          <TextField id="cgpa" label="CGPA" type="number" value={s.cgpa} onChange={set('cgpa')} errors={errors} hint="Only if you want to share it." />
          <SelectField id="cgpa_scale" label="Scale" value={s.cgpa_scale} onChange={set('cgpa_scale')} errors={errors} options={['10', '5', '4'].map((x) => ({ value: x, label: `out of ${x}` }))} />
        </div>
      </div>
      <ChipList id="subjects" label="Current subjects" values={s.subjects} onChange={set('subjects')} errors={errors} placeholder="e.g. Operating Systems" />
      <ChipList id="previous_qualifications" label="Previous qualifications" values={s.previous_qualifications} onChange={set('previous_qualifications')} errors={errors} placeholder="e.g. Intermediate (MPC), 2022" />
      <ChipList id="academic_achievements" label="Academic achievements" values={s.academic_achievements} onChange={set('academic_achievements')} errors={errors} />
    </div>
  );
}

// ---------------------------------------------------------------- skills
export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  PROGRAMMING_LANGUAGE: 'Programming languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Databases',
  AI_ML: 'AI / ML',
  CLOUD: 'Cloud platforms',
  DEVELOPER_TOOLS: 'Developer tools',
  TESTING: 'Testing tools',
  OTHER: 'Other',
};
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  PROGRAMMING_LANGUAGE: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'Go'],
  FRONTEND: ['React', 'HTML/CSS', 'Tailwind CSS', 'Angular', 'Vue'],
  BACKEND: ['Node.js', 'Express', 'Spring Boot', 'Django', 'FastAPI'],
  DATABASE: ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  AI_ML: ['NumPy', 'Pandas', 'scikit-learn', 'PyTorch', 'TensorFlow'],
  CLOUD: ['AWS', 'Google Cloud', 'Azure', 'Firebase', 'Docker'],
  DEVELOPER_TOOLS: ['Git', 'GitHub', 'Linux', 'VS Code', 'Postman'],
  TESTING: ['Jest', 'PyTest', 'JUnit', 'Selenium', 'Playwright'],
  OTHER: [],
};
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

type SkillRow = { name: string; category: string; proficiency: string };

export function SkillsForm({ profile, errors, onChange, withInterests = true }: SectionFormProps & { withInterests?: boolean }) {
  const [skills, setSkills] = React.useState<SkillRow[]>(profile.skills.skills.map((x) => ({ ...x })));
  const [interests, setInterests] = React.useState<string[]>(profile.learning.learning_interests);
  const [category, setCategory] = React.useState('PROGRAMMING_LANGUAGE');
  const [draft, setDraft] = React.useState('');
  React.useEffect(() => {
    onChange({ skills, ...(withInterests ? { learning_interests: interests } : {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills, interests]);
  const add = (name: string) => {
    const t = name.trim();
    if (!t || skills.some((x) => x.name.toLowerCase() === t.toLowerCase())) return;
    // No default level: the student must choose one.
    setSkills((x) => [...x, { name: t, category, proficiency: '' }]);
    setDraft('');
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-2 items-end">
        <SelectField id="skill_category" label="Category" required value={category} onChange={setCategory} options={Object.entries(SKILL_CATEGORY_LABELS).map(([value, l]) => ({ value, label: l }))} />
        <TextField id="skill_name" label="Skill" required value={draft} onChange={setDraft} placeholder="e.g. Python" />
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {(SKILL_SUGGESTIONS[category] || [])
          .filter((s) => !skills.some((x) => x.name.toLowerCase() === s.toLowerCase()))
          .map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-600 hover:bg-slate-100">
              + {s}
            </button>
          ))}
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">No skills added yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {skills.map((sk, i) => (
            <li key={sk.name} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className="font-medium text-sm text-slate-900 min-w-[120px]">{sk.name}</span>
              <span className="text-xs text-slate-500">{SKILL_CATEGORY_LABELS[sk.category] || sk.category}</span>
              <select
                aria-label={`Proficiency for ${sk.name}`}
                className={`${inputCls} w-40 ${!sk.proficiency ? 'border-amber-500' : ''}`}
                value={sk.proficiency}
                onChange={(e) => setSkills((x) => x.map((y, j) => (j === i ? { ...y, proficiency: e.target.value } : y)))}
              >
                <option value="">Choose your level…</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0) + l.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button type="button" className="ml-auto text-slate-500 hover:text-red-600" aria-label={`Remove ${sk.name}`} onClick={() => setSkills((x) => x.filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </button>
              <FieldError errors={errors} name={`skills[${i}].proficiency`} />
            </li>
          ))}
        </ul>
      )}
      {withInterests && (
        <ChipList id="learning_interests" label="Learning interests" values={interests} onChange={setInterests} errors={errors} suggestions={['Web development', 'Machine learning', 'Cloud computing', 'Cybersecurity', 'Competitive programming', 'Data science']} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- projects & experience
type Proj = CanonicalProfile['experience']['projects'][number];
type Exp = CanonicalProfile['experience']['experience'][number];
type Cert = CanonicalProfile['experience']['certifications'][number];

export function ExperienceForm({ profile, errors, onChange }: SectionFormProps) {
  const e = profile.experience;
  const [projects, setProjects] = React.useState<Partial<Proj>[]>(e.projects);
  const [experience, setExperience] = React.useState<Partial<Exp>[]>(e.experience);
  const [certs, setCerts] = React.useState<Partial<Cert>[]>(e.certifications);
  const [achievements, setAchievements] = React.useState(e.achievements);
  const [research, setResearch] = React.useState(e.research_interests);
  const [links, setLinks] = React.useState({ github_url: e.github_url || '', linkedin_url: e.linkedin_url || '', portfolio_url: e.portfolio_url || '' });
  React.useEffect(() => {
    onChange({
      projects: projects.map((p) => ({ ...p, technologies: p.technologies || [] })),
      experience,
      certifications: certs,
      achievements,
      research_interests: research,
      github_url: links.github_url || null,
      linkedin_url: links.linkedin_url || null,
      portfolio_url: links.portfolio_url || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, experience, certs, achievements, research, links]);
  const upd = <T,>(setter: React.Dispatch<React.SetStateAction<Partial<T>[]>>, i: number, k: keyof T, v: any) =>
    setter((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-900">Projects</h4>
          <Button type="button" size="sm" variant="outline" onClick={() => setProjects((x) => [...x, { title: '', description: '', technologies: [] }])}>
            <Plus className="w-4 h-4 mr-1" /> Add project
          </Button>
        </div>
        {projects.map((p, i) => (
          <div key={p.id || `new-${i}`} className="rounded-lg border border-slate-200 p-3 mb-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField id={`projects[${i}].title`} label="Project name" required value={p.title} onChange={(v) => upd<Proj>(setProjects, i, 'title', v)} errors={errors} />
              <SelectField id={`projects[${i}].status`} label="Status" value={p.status} onChange={(v) => upd<Proj>(setProjects, i, 'status', v || null)} errors={errors} options={['IDEA', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map((x) => ({ value: x, label: x.replace('_', ' ').toLowerCase() }))} />
            </div>
            <div>
              <label className={label} htmlFor={`projects[${i}].description`}>Description <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea id={`projects[${i}].description`} className={areaCls} rows={2} value={p.description || ''} onChange={(ev) => upd<Proj>(setProjects, i, 'description', ev.target.value)} />
            </div>
            <ChipList id={`projects[${i}].technologies`} label="Technologies used" values={p.technologies || []} onChange={(v) => upd<Proj>(setProjects, i, 'technologies', v)} errors={errors} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextField id={`projects[${i}].github_url`} label="GitHub link" value={p.github_url} onChange={(v) => upd<Proj>(setProjects, i, 'github_url', v || null)} errors={errors} />
              <TextField id={`projects[${i}].demo_url`} label="Live demo link" value={p.demo_url} onChange={(v) => upd<Proj>(setProjects, i, 'demo_url', v || null)} errors={errors} />
              <TextField id={`projects[${i}].project_url`} label="Project link" value={p.project_url} onChange={(v) => upd<Proj>(setProjects, i, 'project_url', v || null)} errors={errors} />
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setProjects((x) => x.filter((_, j) => j !== i))}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove project
            </Button>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-900">Internships and work experience</h4>
          <Button type="button" size="sm" variant="outline" onClick={() => setExperience((x) => [...x, { kind: 'INTERNSHIP', organization: '', role: '', is_current: false }])}>
            <Plus className="w-4 h-4 mr-1" /> Add experience
          </Button>
        </div>
        {experience.map((x, i) => (
          <div key={x.id || `new-${i}`} className="rounded-lg border border-slate-200 p-3 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField id={`experience[${i}].kind`} label="Type" required value={x.kind} onChange={(v) => upd<Exp>(setExperience, i, 'kind', v)} errors={errors} options={['INTERNSHIP', 'WORK', 'RESEARCH', 'VOLUNTEER', 'OTHER'].map((k) => ({ value: k, label: k.toLowerCase() }))} />
            <TextField id={`experience[${i}].organization`} label="Organisation" required value={x.organization} onChange={(v) => upd<Exp>(setExperience, i, 'organization', v)} errors={errors} />
            <TextField id={`experience[${i}].role`} label="Role" required value={x.role} onChange={(v) => upd<Exp>(setExperience, i, 'role', v)} errors={errors} />
            <div className="grid grid-cols-2 gap-2">
              <TextField id={`experience[${i}].start_date`} label="Start" type="month" value={x.start_date} onChange={(v) => upd<Exp>(setExperience, i, 'start_date', v || null)} errors={errors} />
              <TextField id={`experience[${i}].end_date`} label="End" type="month" value={x.end_date} onChange={(v) => upd<Exp>(setExperience, i, 'end_date', v || null)} errors={errors} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(x.is_current)} onChange={(ev) => upd<Exp>(setExperience, i, 'is_current', ev.target.checked)} /> I currently work here
            </label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setExperience((xs) => xs.filter((_, j) => j !== i))}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-900">Certifications</h4>
          <Button type="button" size="sm" variant="outline" onClick={() => setCerts((x) => [...x, { name: '' }])}>
            <Plus className="w-4 h-4 mr-1" /> Add certification
          </Button>
        </div>
        {certs.map((c, i) => (
          <div key={c.id || `new-${i}`} className="rounded-lg border border-slate-200 p-3 mb-3 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <TextField id={`certifications[${i}].name`} label="Name" required value={c.name} onChange={(v) => upd<Cert>(setCerts, i, 'name', v)} errors={errors} />
            <TextField id={`certifications[${i}].issuer`} label="Issuer" value={c.issuer} onChange={(v) => upd<Cert>(setCerts, i, 'issuer', v || null)} errors={errors} />
            <TextField id={`certifications[${i}].credential_url`} label="Credential link" value={c.credential_url} onChange={(v) => upd<Cert>(setCerts, i, 'credential_url', v || null)} errors={errors} />
            <Button type="button" size="sm" variant="ghost" onClick={() => setCerts((xs) => xs.filter((_, j) => j !== i))}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextField id="github_url" label="GitHub profile" value={links.github_url} onChange={(v) => setLinks((l) => ({ ...l, github_url: v }))} errors={errors} placeholder="https://github.com/username" />
        <TextField id="linkedin_url" label="LinkedIn" value={links.linkedin_url} onChange={(v) => setLinks((l) => ({ ...l, linkedin_url: v }))} errors={errors} />
        <TextField id="portfolio_url" label="Portfolio" value={links.portfolio_url} onChange={(v) => setLinks((l) => ({ ...l, portfolio_url: v }))} errors={errors} />
      </div>
      <ChipList id="achievements" label="Achievements" values={achievements} onChange={setAchievements} errors={errors} />
      <ChipList id="research_interests" label="Research interests" values={research} onChange={setResearch} errors={errors} />
    </div>
  );
}

// ---------------------------------------------------------------- career
export function CareerForm({ profile, errors, onChange }: SectionFormProps) {
  const c = profile.career;
  const [s, setS] = React.useState({ ...c, placement_goals: c.placement_goals || '', gate_paper: c.gate_paper || '', short_term_goals: c.short_term_goals || '', long_term_goals: c.long_term_goals || '' });
  React.useEffect(() => {
    const gate = s.competitive_exams.some((x) => /^gate\b/i.test(x));
    onChange({
      target_roles: s.target_roles,
      career_interests: s.career_interests,
      preferred_industries: s.preferred_industries,
      preferred_locations: s.preferred_locations,
      internship_interests: s.internship_interests,
      placement_goals: s.placement_goals || null,
      higher_education_interests: s.higher_education_interests,
      competitive_exams: s.competitive_exams,
      gate_paper: gate ? s.gate_paper || null : null,
      short_term_goals: s.short_term_goals || null,
      long_term_goals: s.long_term_goals || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  const gate = s.competitive_exams.some((x) => /^gate\b/i.test(x));
  return (
    <div className="space-y-4">
      <ChipList id="target_roles" label="Target job roles" values={s.target_roles} onChange={set('target_roles')} errors={errors} suggestions={['Software Engineer', 'Backend Developer', 'Frontend Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer']} />
      <ChipList id="career_interests" label="Career interests" values={s.career_interests} onChange={set('career_interests')} errors={errors} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChipList id="preferred_industries" label="Preferred industries" values={s.preferred_industries} onChange={set('preferred_industries')} errors={errors} />
        <ChipList id="preferred_locations" label="Preferred work locations" values={s.preferred_locations} onChange={set('preferred_locations')} errors={errors} suggestions={['Remote', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai']} />
        <ChipList id="internship_interests" label="Internship interests" values={s.internship_interests} onChange={set('internship_interests')} errors={errors} />
        <ChipList id="higher_education_interests" label="Higher education interests" values={s.higher_education_interests} onChange={set('higher_education_interests')} errors={errors} suggestions={['M.Tech', 'MS abroad', 'MBA', 'PhD']} />
      </div>
      <ChipList id="competitive_exams" label="Competitive examinations" values={s.competitive_exams} onChange={set('competitive_exams')} errors={errors} suggestions={['GATE', 'GRE', 'CAT', 'UPSC ESE']} />
      {gate && <TextField id="gate_paper" label="GATE paper" value={s.gate_paper} onChange={set('gate_paper')} errors={errors} placeholder="e.g. CS" hint="The paper code, such as CS, EC, EE or ME." />}
      <div>
        <label className={label} htmlFor="placement_goals">Placement goals <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="placement_goals" className={areaCls} rows={2} value={s.placement_goals} onChange={(e) => set('placement_goals')(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="short_term_goals">Short-term goals <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea id="short_term_goals" className={areaCls} rows={3} value={s.short_term_goals} onChange={(e) => set('short_term_goals')(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="long_term_goals">Long-term goals <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea id="long_term_goals" className={areaCls} rows={3} value={s.long_term_goals} onChange={(e) => set('long_term_goals')(e.target.value)} />
        </div>
      </div>
      <FieldError errors={errors} name="gate_paper" />
    </div>
  );
}

// ---------------------------------------------------------------- learning
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function LearningForm({ profile, errors, onChange }: SectionFormProps) {
  const l = profile.learning;
  const [s, setS] = React.useState({
    preferred_languages: l.preferred_languages,
    explanation_style: l.explanation_style || '',
    learning_style: l.learning_style || '',
    difficulty: l.difficulty || '',
    learning_interests: l.learning_interests,
    weekly_study_hours: l.weekly_study_hours?.toString() || '',
    daily_study_minutes: l.daily_study_minutes?.toString() || '',
    preferred_study_days: l.preferred_study_days as string[],
    preferred_study_time: l.preferred_study_time || '',
    revision_preference: l.revision_preference || '',
    notifications: { ...l.notifications },
  });
  React.useEffect(() => {
    onChange({
      preferred_languages: s.preferred_languages,
      explanation_style: s.explanation_style || null,
      learning_style: s.learning_style || null,
      difficulty: s.difficulty || null,
      learning_interests: s.learning_interests,
      weekly_study_hours: toNum(s.weekly_study_hours),
      daily_study_minutes: toNum(s.daily_study_minutes),
      preferred_study_days: s.preferred_study_days,
      preferred_study_time: s.preferred_study_time || null,
      revision_preference: s.revision_preference || null,
      notifications: s.notifications,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  const opt = (xs: string[]) => xs.map((x) => ({ value: x, label: x.replace(/_/g, ' ').toLowerCase() }));
  return (
    <div className="space-y-4">
      <ChipList id="preferred_languages" label="Preferred learning languages" required values={s.preferred_languages} onChange={set('preferred_languages')} errors={errors} suggestions={['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada']} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField id="explanation_style" label="Explanation style" value={s.explanation_style} onChange={set('explanation_style')} errors={errors} options={opt(['QUICK_OVERVIEW', 'STANDARD', 'DEEP_DIVE', 'ELI5'])} />
        <SelectField id="learning_style" label="Learning style" value={s.learning_style} onChange={set('learning_style')} errors={errors} options={opt(['VISUAL', 'READING', 'HANDS_ON', 'VIDEO', 'DISCUSSION', 'MIXED'])} />
        <SelectField id="difficulty" label="Preferred difficulty" value={s.difficulty} onChange={set('difficulty')} errors={errors} options={opt(['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'ADAPTIVE'])} />
        <TextField id="weekly_study_hours" label="Study hours per week" type="number" value={s.weekly_study_hours} onChange={set('weekly_study_hours')} errors={errors} />
        <TextField id="daily_study_minutes" label="Daily study minutes" type="number" value={s.daily_study_minutes} onChange={set('daily_study_minutes')} errors={errors} />
        <SelectField id="preferred_study_time" label="Preferred study time" value={s.preferred_study_time} onChange={set('preferred_study_time')} errors={errors} options={opt(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FLEXIBLE'])} />
        <SelectField id="revision_preference" label="Revision preference" value={s.revision_preference} onChange={set('revision_preference')} errors={errors} options={opt(['DAILY', 'ALTERNATE_DAYS', 'WEEKLY', 'BEFORE_EXAMS', 'FLEXIBLE'])} />
      </div>
      <div>
        <span className={label}>Preferred study days <span className="font-normal text-slate-400">(optional)</span></span>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const on = s.preferred_study_days.includes(d);
            return (
              <button key={d} type="button" aria-pressed={on} onClick={() => set('preferred_study_days')(on ? s.preferred_study_days.filter((x) => x !== d) : [...s.preferred_study_days, d])} className={`px-3 py-1 rounded-full text-xs border ${on ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-700'}`}>
                {d}
              </button>
            );
          })}
        </div>
        <FieldError errors={errors} name="preferred_study_days" />
      </div>
      <ChipList id="learning_interests_6" label="Learning interests" values={s.learning_interests} onChange={set('learning_interests')} errors={errors} />
      <fieldset className="rounded-lg border border-slate-200 p-3">
        <legend className="text-xs font-semibold text-slate-700 px-1">Notifications</legend>
        {(
          [
            ['in_app', 'In-app notifications'],
            ['study_reminders', 'Study reminders'],
            ['revision_reminders', 'Revision reminders'],
            ['deadline_reminders', 'Deadline reminders'],
          ] as const
        ).map(([k, l2]) => (
          <label key={k} className="flex items-center gap-2 text-sm py-0.5">
            <input type="checkbox" checked={Boolean((s.notifications as any)[k])} onChange={(e) => set('notifications')({ ...s.notifications, [k]: e.target.checked })} /> {l2}
          </label>
        ))}
        <div className="mt-2 max-w-xs">
          <SelectField id="email_digest" label="Email digest" value={s.notifications.email_digest} onChange={(v) => set('notifications')({ ...s.notifications, email_digest: v || 'NONE' })} options={opt(['NONE', 'DAILY', 'WEEKLY'])} />
        </div>
      </fieldset>
    </div>
  );
}
