// Phase 5: Supabase Postgres implementation of the profile store.
//
// Connects with a server-only connection string (SUPABASE_DB_URL: the project's Postgres URI,
// which is a secret like the service role key). A direct Postgres connection is used instead of
// the REST client because one profile change touches several tables and must commit as one
// transaction; PostgREST cannot do that without stored procedures.
//
// Every statement is scoped by the student id that the caller resolved from a verified token.
import pg from 'pg';
import { logger } from '../../core/logging';
import { ConflictError } from '../../core/exceptions';
import { ProfilePersistence, ProfileStoreUnavailableError, StudentAccountRow } from './persistence';
import type { CanonicalProfile } from './types';
import { defaultOnboarding } from './profileCache';

const { Pool } = pg;

function isConnectivityError(err: any): boolean {
  const code = String(err?.code || '');
  return (
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '57P03', '08000', '08001', '08003', '08006'].includes(code) ||
    /timeout|terminated|connect/i.test(String(err?.message || ''))
  );
}

export class SupabaseProfilePersistence implements ProfilePersistence {
  public readonly name = 'supabase' as const;
  private pool: pg.Pool;

  constructor(connectionString: string, poolOptions: Partial<pg.PoolConfig> = {}) {
    this.pool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
      ...poolOptions,
    } as pg.PoolConfig);
    // Never log the connection string.
    this.pool.on('error', (err) => logger.error(`Supabase pool error: ${(err as any)?.code || 'unknown'}`));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private wrap(err: any): never {
    if (err instanceof ConflictError) throw err;
    logger.error(`Supabase profile store error: ${err?.code || 'unknown'}`);
    if (isConnectivityError(err)) throw new ProfileStoreUnavailableError();
    if (err?.code === '23505') throw new ConflictError('This account already exists');
    throw new ProfileStoreUnavailableError('Your profile could not be saved. Nothing was changed; please try again.');
  }

  async findIdByFirebaseUid(uid: string): Promise<string | null> {
    try {
      const r = await this.pool.query('select id from public.students where firebase_uid = $1', [uid]);
      return r.rows[0]?.id || null;
    } catch (err) {
      this.wrap(err);
    }
  }

  async findIdByEmail(email: string): Promise<string | null> {
    try {
      const r = await this.pool.query('select id from public.students where lower(email) = lower($1)', [email]);
      return r.rows[0]?.id || null;
    } catch (err) {
      this.wrap(err);
    }
  }

  async commit(account: StudentAccountRow, p: CanonicalProfile, expectedPreviousVersion: number | null): Promise<void> {
    let client: pg.PoolClient;
    try {
      client = await this.pool.connect();
    } catch (err) {
      this.wrap(err);
    }
    const id = account.id;
    try {
      await client.query('begin');
      const up = await client.query(
        `insert into public.students (id, firebase_uid, email, full_name, display_name, phone, avatar_url, auth_provider,
            email_verified, role, account_status, terms_accepted_at, privacy_accepted_at, profile_version,
            last_profile_update, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now())
         on conflict (id) do update set
            firebase_uid = coalesce(public.students.firebase_uid, excluded.firebase_uid),
            full_name = excluded.full_name, display_name = excluded.display_name, phone = excluded.phone,
            avatar_url = excluded.avatar_url, auth_provider = excluded.auth_provider,
            email_verified = excluded.email_verified, account_status = excluded.account_status,
            terms_accepted_at = excluded.terms_accepted_at, privacy_accepted_at = excluded.privacy_accepted_at,
            profile_version = excluded.profile_version, last_profile_update = excluded.last_profile_update,
            updated_at = now()
         where $17::int is null or public.students.profile_version = $17::int
         returning id, firebase_uid`,
        [
          id,
          account.firebase_uid,
          account.email,
          p.identity.full_name,
          p.identity.display_name,
          p.identity.phone,
          p.identity.avatar_url,
          account.auth_provider,
          account.email_verified,
          account.role,
          account.account_status,
          p.identity.terms_accepted_at,
          p.identity.privacy_accepted_at,
          p.account.profile_version,
          p.account.last_profile_update,
          account.created_at,
          expectedPreviousVersion,
        ]
      );
      if (up.rowCount === 0) {
        throw new ConflictError('Your profile was changed in another session. Reload and try again.');
      }
      if (account.firebase_uid && up.rows[0].firebase_uid !== account.firebase_uid) {
        throw new ConflictError('This account is linked to a different sign-in identity.');
      }

      const a = p.academic;
      await client.query(
        `insert into public.student_academic_profiles (student_id, university, college, degree, department, branch,
            specialization, academic_year, current_semester, admission_year, expected_graduation_year, academic_status,
            cgpa, cgpa_scale, previous_qualifications, academic_achievements, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now())
         on conflict (student_id) do update set university=excluded.university, college=excluded.college,
            degree=excluded.degree, department=excluded.department, branch=excluded.branch,
            specialization=excluded.specialization, academic_year=excluded.academic_year,
            current_semester=excluded.current_semester, admission_year=excluded.admission_year,
            expected_graduation_year=excluded.expected_graduation_year, academic_status=excluded.academic_status,
            cgpa=excluded.cgpa, cgpa_scale=excluded.cgpa_scale, previous_qualifications=excluded.previous_qualifications,
            academic_achievements=excluded.academic_achievements, updated_at=now()`,
        [id, a.university, a.college, a.degree, a.department, a.branch, a.specialization, a.academic_year, a.current_semester,
          a.admission_year, a.expected_graduation_year, a.academic_status, a.cgpa, a.cgpa_scale, a.previous_qualifications,
          a.academic_achievements]
      );

      await client.query('delete from public.student_subjects where student_id = $1', [id]);
      for (const [i, name] of a.subjects.entries()) {
        await client.query('insert into public.student_subjects (student_id, name, position) values ($1,$2,$3)', [id, name, i]);
      }
      await client.query('delete from public.student_skills where student_id = $1', [id]);
      for (const s of p.skills.skills) {
        await client.query('insert into public.student_skills (student_id, name, category, proficiency) values ($1,$2,$3,$4)', [
          id, s.name, s.category, s.proficiency,
        ]);
      }

      const e = p.experience;
      await client.query('delete from public.student_projects where student_id = $1 and not (id = any($2::text[]))', [id, e.projects.map((x) => x.id)]);
      for (const [i, pr] of e.projects.entries()) {
        const r = await client.query(
          `insert into public.student_projects (id, student_id, title, description, technologies, project_url, github_url, demo_url, status, position, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
           on conflict (id) do update set title=excluded.title, description=excluded.description, technologies=excluded.technologies,
             project_url=excluded.project_url, github_url=excluded.github_url, demo_url=excluded.demo_url, status=excluded.status,
             position=excluded.position, updated_at=now()
           where public.student_projects.student_id = excluded.student_id`,
          [pr.id, id, pr.title, pr.description, pr.technologies, pr.project_url, pr.github_url, pr.demo_url, pr.status, i]
        );
        if (r.rowCount === 0) throw new ConflictError('Project id belongs to another student');
      }
      await client.query('delete from public.student_experience where student_id = $1 and not (id = any($2::text[]))', [id, e.experience.map((x) => x.id)]);
      for (const x of e.experience) {
        const r = await client.query(
          `insert into public.student_experience (id, student_id, kind, organization, role, start_date, end_date, is_current, description, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
           on conflict (id) do update set kind=excluded.kind, organization=excluded.organization, role=excluded.role,
             start_date=excluded.start_date, end_date=excluded.end_date, is_current=excluded.is_current,
             description=excluded.description, updated_at=now()
           where public.student_experience.student_id = excluded.student_id`,
          [x.id, id, x.kind, x.organization, x.role, x.start_date, x.end_date, x.is_current, x.description]
        );
        if (r.rowCount === 0) throw new ConflictError('Experience id belongs to another student');
      }
      await client.query('delete from public.student_certifications where student_id = $1 and not (id = any($2::text[]))', [
        id, e.certifications.map((x) => x.id),
      ]);
      for (const x of e.certifications) {
        const r = await client.query(
          `insert into public.student_certifications (id, student_id, name, issuer, issue_date, credential_url, updated_at)
           values ($1,$2,$3,$4,$5,$6, now())
           on conflict (id) do update set name=excluded.name, issuer=excluded.issuer, issue_date=excluded.issue_date,
             credential_url=excluded.credential_url, updated_at=now()
           where public.student_certifications.student_id = excluded.student_id`,
          [x.id, id, x.name, x.issuer, x.issue_date, x.credential_url]
        );
        if (r.rowCount === 0) throw new ConflictError('Certification id belongs to another student');
      }

      const c = p.career;
      await client.query(
        `insert into public.student_career_preferences (student_id, target_roles, career_interests, preferred_industries,
            preferred_locations, internship_interests, placement_goals, higher_education_interests, competitive_exams,
            gate_paper, short_term_goals, long_term_goals, achievements, research_interests, github_url, linkedin_url,
            portfolio_url, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now())
         on conflict (student_id) do update set target_roles=excluded.target_roles, career_interests=excluded.career_interests,
            preferred_industries=excluded.preferred_industries, preferred_locations=excluded.preferred_locations,
            internship_interests=excluded.internship_interests, placement_goals=excluded.placement_goals,
            higher_education_interests=excluded.higher_education_interests, competitive_exams=excluded.competitive_exams,
            gate_paper=excluded.gate_paper, short_term_goals=excluded.short_term_goals, long_term_goals=excluded.long_term_goals,
            achievements=excluded.achievements, research_interests=excluded.research_interests, github_url=excluded.github_url,
            linkedin_url=excluded.linkedin_url, portfolio_url=excluded.portfolio_url, updated_at=now()`,
        [id, c.target_roles, c.career_interests, c.preferred_industries, c.preferred_locations, c.internship_interests,
          c.placement_goals, c.higher_education_interests, c.competitive_exams, c.gate_paper, c.short_term_goals,
          c.long_term_goals, e.achievements, e.research_interests, e.github_url, e.linkedin_url, e.portfolio_url]
      );

      const l = p.learning;
      await client.query(
        `insert into public.student_learning_preferences (student_id, preferred_languages, explanation_style, learning_style,
            difficulty, learning_interests, weekly_study_hours, preferred_study_days, daily_study_minutes,
            preferred_study_time, revision_preference, notify_in_app, notify_email_digest, notify_study_reminders,
            notify_revision_reminders, notify_deadline_reminders, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now())
         on conflict (student_id) do update set preferred_languages=excluded.preferred_languages,
            explanation_style=excluded.explanation_style, learning_style=excluded.learning_style,
            difficulty=excluded.difficulty, learning_interests=excluded.learning_interests,
            weekly_study_hours=excluded.weekly_study_hours, preferred_study_days=excluded.preferred_study_days,
            daily_study_minutes=excluded.daily_study_minutes, preferred_study_time=excluded.preferred_study_time,
            revision_preference=excluded.revision_preference, notify_in_app=excluded.notify_in_app,
            notify_email_digest=excluded.notify_email_digest, notify_study_reminders=excluded.notify_study_reminders,
            notify_revision_reminders=excluded.notify_revision_reminders,
            notify_deadline_reminders=excluded.notify_deadline_reminders, updated_at=now()`,
        [id, l.preferred_languages, l.explanation_style, l.learning_style, l.difficulty, l.learning_interests,
          l.weekly_study_hours, l.preferred_study_days, l.daily_study_minutes, l.preferred_study_time, l.revision_preference,
          l.notifications.in_app, l.notifications.email_digest, l.notifications.study_reminders,
          l.notifications.revision_reminders, l.notifications.deadline_reminders]
      );

      const o = p.account.onboarding;
      await client.query(
        `insert into public.student_onboarding_progress (student_id, current_step, completed_steps, skipped_steps, completed,
            completed_at, started_at, last_saved_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (student_id) do update set current_step=excluded.current_step, completed_steps=excluded.completed_steps,
            skipped_steps=excluded.skipped_steps, completed=excluded.completed, completed_at=excluded.completed_at,
            last_saved_at=excluded.last_saved_at`,
        [id, o.current_step, o.completed_steps, o.skipped_steps, o.completed, o.completed_at, o.started_at, o.last_saved_at]
      );
      await client.query('commit');
    } catch (err) {
      try {
        await client.query('rollback');
      } catch {}
      this.wrap(err);
    } finally {
      client.release();
    }
  }

  async load(studentId: string): Promise<{ account: StudentAccountRow; profile: CanonicalProfile } | null> {
    try {
      const q = (sql: string) => this.pool.query(sql, [studentId]);
      const [s, a, subj, sk, pr, ex, ce, ca, le, on] = await Promise.all([
        q('select * from public.students where id = $1'),
        q('select * from public.student_academic_profiles where student_id = $1'),
        q('select name from public.student_subjects where student_id = $1 order by position, id'),
        q('select name, category, proficiency from public.student_skills where student_id = $1 order by id'),
        q('select * from public.student_projects where student_id = $1 order by position'),
        q('select * from public.student_experience where student_id = $1 order by start_date nulls last, id'),
        q('select * from public.student_certifications where student_id = $1 order by id'),
        q('select * from public.student_career_preferences where student_id = $1'),
        q('select * from public.student_learning_preferences where student_id = $1'),
        q('select * from public.student_onboarding_progress where student_id = $1'),
      ]);
      const st = s.rows[0];
      if (!st) return null;
      const ac = a.rows[0] || {};
      const c = ca.rows[0] || {};
      const l = le.rows[0] || {};
      const o = on.rows[0];
      const iso = (v: any) => (v ? new Date(v).toISOString() : null);
      const n = (v: any) => (v == null ? null : Number(v));
      const profile: CanonicalProfile = {
        identity: {
          full_name: st.full_name,
          display_name: st.display_name,
          email: st.email,
          email_verified: st.email_verified,
          phone: st.phone,
          avatar_url: st.avatar_url,
          terms_accepted_at: iso(st.terms_accepted_at),
          privacy_accepted_at: iso(st.privacy_accepted_at),
        },
        academic: {
          university: ac.university ?? null,
          college: ac.college ?? null,
          degree: ac.degree ?? null,
          department: ac.department ?? null,
          branch: ac.branch ?? null,
          specialization: ac.specialization ?? null,
          academic_year: n(ac.academic_year),
          current_semester: n(ac.current_semester),
          admission_year: n(ac.admission_year),
          expected_graduation_year: n(ac.expected_graduation_year),
          subjects: subj.rows.map((r) => r.name),
          academic_status: ac.academic_status ?? null,
          cgpa: n(ac.cgpa),
          cgpa_scale: n(ac.cgpa_scale),
          previous_qualifications: ac.previous_qualifications || [],
          academic_achievements: ac.academic_achievements || [],
        },
        skills: { skills: sk.rows.map((r) => ({ name: r.name, category: r.category, proficiency: r.proficiency })) },
        experience: {
          projects: pr.rows.map((r) => ({
            id: r.id, title: r.title, description: r.description, technologies: r.technologies || [],
            project_url: r.project_url, github_url: r.github_url, demo_url: r.demo_url, status: r.status,
          })),
          experience: ex.rows.map((r) => ({
            id: r.id, kind: r.kind, organization: r.organization, role: r.role, start_date: r.start_date,
            end_date: r.end_date, is_current: r.is_current, description: r.description,
          })),
          certifications: ce.rows.map((r) => ({
            id: r.id, name: r.name, issuer: r.issuer, issue_date: r.issue_date, credential_url: r.credential_url,
          })),
          achievements: c.achievements || [],
          research_interests: c.research_interests || [],
          github_url: c.github_url ?? null,
          linkedin_url: c.linkedin_url ?? null,
          portfolio_url: c.portfolio_url ?? null,
        },
        career: {
          target_roles: c.target_roles || [],
          career_interests: c.career_interests || [],
          preferred_industries: c.preferred_industries || [],
          preferred_locations: c.preferred_locations || [],
          internship_interests: c.internship_interests || [],
          placement_goals: c.placement_goals ?? null,
          higher_education_interests: c.higher_education_interests || [],
          competitive_exams: c.competitive_exams || [],
          gate_paper: c.gate_paper ?? null,
          short_term_goals: c.short_term_goals ?? null,
          long_term_goals: c.long_term_goals ?? null,
        },
        learning: {
          preferred_languages: l.preferred_languages || [],
          explanation_style: l.explanation_style ?? null,
          learning_style: l.learning_style ?? null,
          difficulty: l.difficulty ?? null,
          learning_interests: l.learning_interests || [],
          weekly_study_hours: n(l.weekly_study_hours),
          preferred_study_days: l.preferred_study_days || [],
          daily_study_minutes: n(l.daily_study_minutes),
          preferred_study_time: l.preferred_study_time ?? null,
          revision_preference: l.revision_preference ?? null,
          notifications: {
            in_app: l.notify_in_app ?? true,
            email_digest: l.notify_email_digest ?? 'NONE',
            study_reminders: l.notify_study_reminders ?? true,
            revision_reminders: l.notify_revision_reminders ?? true,
            deadline_reminders: l.notify_deadline_reminders ?? true,
          },
        },
        account: {
          student_id: st.id,
          auth_provider: st.auth_provider,
          registered_at: new Date(st.created_at).toISOString(),
          account_status: st.account_status,
          last_profile_update: iso(st.last_profile_update),
          profile_version: st.profile_version,
          onboarding: o
            ? {
                current_step: o.current_step,
                completed_steps: (o.completed_steps || []).map(Number),
                skipped_steps: (o.skipped_steps || []).map(Number),
                completed: o.completed,
                completed_at: iso(o.completed_at),
                started_at: new Date(o.started_at).toISOString(),
                last_saved_at: new Date(o.last_saved_at).toISOString(),
              }
            : defaultOnboarding(),
        },
      };
      const account: StudentAccountRow = {
        id: st.id,
        firebase_uid: st.firebase_uid,
        email: st.email,
        auth_provider: st.auth_provider,
        email_verified: st.email_verified,
        role: st.role,
        account_status: st.account_status,
        created_at: new Date(st.created_at).toISOString(),
      };
      return { account, profile };
    } catch (err) {
      this.wrap(err);
    }
  }
}
