import { db } from '../db/database';
import {
  CareerRole,
  CareerRoadmap,
  CareerRoadmapStep,
  CareerRecommendationResult,
  RoadmapStepStatus,
  CareerProfileData,
  CareerDashboardSummary,
} from '../models/careerResumeTypes';
import { NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';
import { ResumeService } from './resumeService';
import { PlacementService } from './placementService';
import { LearningModulesService } from './learningModulesService';
import { ExternalIntegrationService } from './externalIntegrationService';

const normSkill = (x: string) => x.toLowerCase().replace(/\.js\b/g, 'js').replace(/[^a-z0-9+#]+/g, ' ').trim();

/**
 * True when a student skill satisfies a role requirement. A requirement like "Node.js / Python / Java / Go" is
 * met by any one alternative; a student skill must equal an alternative or appear in it as whole words of
 * at least 3 characters. (The earlier substring check let a skill named "C" match almost every requirement.)
 */
export function skillMatches(requirement: string, studentSkills: string[]): boolean {
  const alts = requirement.split('/').map(normSkill).filter(Boolean);
  const mine = studentSkills.map(normSkill).filter(Boolean);
  return alts.some((a) =>
    mine.some((m) => m === a || (m.length >= 3 && ` ${a} `.includes(` ${m} `)) || (a.length >= 3 && ` ${m} `.includes(` ${a} `)))
  );
}

export class CareerService {
  private static careerProfiles: Map<string, CareerProfileData> = new Map();

  /**
   * List all career roles
   */
  public static async listRoles(): Promise<CareerRole[]> {
    return await db.getCareerRoles();
  }

  /**
   * Get single career role
   */
  public static async getRole(roleId: string): Promise<CareerRole> {
    const role = await db.getCareerRoleById(roleId);
    if (!role) {
      throw new NotFoundError(`Career role with ID '${roleId}' not found`);
    }
    return role;
  }

  /**
   * Compare multiple roles side-by-side without ranking them
   */
  public static async compareRoles(roleIds: string[]): Promise<{
    roles: CareerRole[];
    comparison_matrix: {
      skill_overlap: string[];
      unique_skills: Record<string, string[]>;
      course_recommendations: Record<string, string[]>;
      project_recommendations: Record<string, string[]>;
      coding_topics: Record<string, string[]>;
      interview_focus: Record<string, string[]>;
    };
    disclaimer: string;
  }> {
    const allRoles = await db.getCareerRoles();
    const selected = allRoles.filter((r) => roleIds.includes(r.id));

    if (selected.length === 0) {
      throw new NotFoundError('No matching roles found for comparison');
    }

    // Compute overlapping skills
    const skillSets = selected.map((r) => new Set(r.skills.map((s) => s.toLowerCase())));
    const overlap: string[] = [];
    if (selected.length > 0) {
      for (const skill of selected[0].skills) {
        if (skillSets.every((set) => set.has(skill.toLowerCase()))) {
          overlap.push(skill);
        }
      }
    }

    const uniqueSkills: Record<string, string[]> = {};
    const courseRecs: Record<string, string[]> = {};
    const projectRecs: Record<string, string[]> = {};
    const codingTopics: Record<string, string[]> = {};
    const interviewFocus: Record<string, string[]> = {};

    for (const r of selected) {
      uniqueSkills[r.id] = r.skills.filter((s) => !overlap.some((o) => o.toLowerCase() === s.toLowerCase()));
      courseRecs[r.id] = r.recommended_courses;
      projectRecs[r.id] = r.recommended_projects;
      codingTopics[r.id] = r.coding_topics;
      interviewFocus[r.id] = r.interview_topics;
    }

    return {
      roles: selected,
      comparison_matrix: {
        skill_overlap: overlap,
        unique_skills: uniqueSkills,
        course_recommendations: courseRecs,
        project_recommendations: projectRecs,
        coding_topics: codingTopics,
        interview_focus: interviewFocus,
      },
      disclaimer: 'Role comparison provides objective curricular differences. Roles are not ranked as superior or inferior.',
    };
  }

  /**
   * Transparent career recommendations based on student's actual platform profile
   */
  public static async getRecommendations(studentId: string): Promise<CareerRecommendationResult> {
    const studentSkills = await db.getStudentSkills(studentId);
    const studentSkillNames = new Set(studentSkills.map((s) => s.skill_name.toLowerCase()));
    const projects = await db.getProjects(studentId);
    const allRoles = await db.getCareerRoles();

    const mySkills = studentSkills.map((s) => s.skill_name);
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;
    const roleMatches = allRoles.map((role) => {
      const matchingSkills = role.skills.filter((req) => skillMatches(req, mySkills));
      const missingSkills = role.skills.filter((req) => !matchingSkills.includes(req));
      const matchPercentage = Math.round((matchingSkills.length / Math.max(1, role.skills.length)) * 100);

      const reasons: string[] = [];
      if (matchingSkills.length > 0) {
        reasons.push(`Skills on your profile that match this role: ${matchingSkills.slice(0, 3).join(', ')}.`);
      } else {
        reasons.push('None of the skills on your profile match this role yet.');
      }
      if (completedProjects > 0) {
        reasons.push(`You have ${completedProjects} completed project${completedProjects === 1 ? '' : 's'}.`);
      }

      return {
        role_id: role.id,
        role_name: role.name,
        match_percentage: matchPercentage,
        match_reasons: reasons,
        top_matching_skills: matchingSkills,
        skills_to_develop: missingSkills,
      };
    });

    roleMatches.sort((a, b) => b.match_percentage - a.match_percentage);

    const topRole = roleMatches[0];
    const topRoleData = topRole ? allRoles.find((r) => r.id === topRole.role_id) : undefined;
    // Only recommend courses that exist on the platform; project ideas come from the role's own topics.
    const courseIds: string[] = [];
    for (const id of topRoleData?.recommended_courses || []) {
      if (await db.getCourseById(id).catch(() => null)) courseIds.push(id);
    }

    return {
      potentially_relevant_roles: roleMatches.slice(0, 5),
      skills_to_develop: topRole ? topRole.skills_to_develop : [],
      recommended_projects: topRoleData?.recommended_projects || [],
      recommended_courses: courseIds,
      explanation:
        studentSkills.length === 0
          ? 'Your profile has no skills recorded yet, so every role shows 0% skill overlap. Add skills or complete assessments to see matches.'
          : `Based on the ${studentSkills.length} skill${studentSkills.length === 1 ? '' : 's'} recorded on your profile compared with each role's listed skills.`,
      disclaimer: 'Curriculum alignments describe skill overlap with industry profiles. They do not constitute hiring or employment probability predictions.',
    };
  }

  /**
   * Generate personalized Career Roadmap linking to real platform resources
   */
  public static async generateRoadmap(
    studentId: string,
    roleId: string,
    customTitle?: string
  ): Promise<CareerRoadmap> {
    const role = await this.getRole(roleId);
    const studentSkills = await db.getStudentSkills(studentId);

    const roadmapId = `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Steps come from the role's own learning path and topics, linked to platform areas that exist for every
    // student. Earlier versions used the same six steps for every role and linked to the demo student's records.
    const mySkills = studentSkills.map((s) => s.skill_name);
    const courseSteps: any[] = [];
    for (const id of role.recommended_courses || []) {
      const course = await db.getCourseById(id).catch(() => null);
      if (course) {
        courseSteps.push({ title: `Course: ${(course as any).title}`, description: `Platform course recommended for ${role.name}.`, estimated_effort: 'Self-paced', source_type: 'COURSE' as const, source_id: id, url: `/courses/${id}` });
      }
    }
    const rawSteps: any[] = [
      ...(role.typical_learning_path || []).map((t, i) => ({
        title: t,
        description: `Learning-path stage ${i + 1} for ${role.name}.`,
        estimated_effort: 'Self-paced',
        source_type: 'NOTES' as const,
        source_id: `${role.id}_path_${i + 1}`,
        url: '/courses',
        skill_ref: role.skills[i],
      })),
      ...courseSteps,
      ...(role.coding_topics?.length
        ? [{ title: `Practice coding topics: ${role.coding_topics.slice(0, 4).join(', ')}`, description: 'Solve problems on these patterns in the DSA lab.', estimated_effort: 'Ongoing', source_type: 'DSA' as const, source_id: `${role.id}_coding`, url: '/dsa' }]
        : []),
      { title: `Build a project for ${role.name}`, description: `Plan and build a project that uses ${(role.technical_topics || []).slice(0, 2).join(' and ') || 'the role\'s core skills'}.`, estimated_effort: 'Self-paced', source_type: 'PROJECT' as const, source_id: `${role.id}_project`, url: '/projects' },
      { title: 'Practise interviews for this role', description: `Mock interviews covering ${(role.interview_topics || []).slice(0, 2).join(' and ') || 'the role\'s topics'}.`, estimated_effort: 'Ongoing', source_type: 'PLACEMENT' as const, source_id: role.id, url: '/interviews' },
    ];

    const steps: CareerRoadmapStep[] = rawSteps.map((s, idx) => {
      // Check if student already has strong or verified evidence in this skill
      const existing = s.skill_ref && skillMatches(s.skill_ref, mySkills)
        ? studentSkills.find((sk) => skillMatches(s.skill_ref, [sk.skill_name]))
        : undefined;
      const initialStatus: RoadmapStepStatus =
        existing && (existing.confidence === 'VERIFIED' || existing.confidence === 'STRONG_EVIDENCE')
          ? 'COMPLETED'
          : idx === 0
          ? 'IN_PROGRESS'
          : 'NOT_STARTED';

      return {
        id: `step_${roadmapId}_${idx + 1}`,
        roadmap_id: roadmapId,
        title: s.title,
        description: s.description,
        order_index: idx,
        status: initialStatus,
        estimated_effort: s.estimated_effort,
        source_type: s.source_type,
        source_id: s.source_id,
        url: s.url,
      };
    });

    const roadmap: CareerRoadmap = {
      id: roadmapId,
      student_id: studentId,
      role_id: role.id,
      title: customTitle || `${role.name} Learning Roadmap`,
      status: 'IN_PROGRESS',
      created_at: now,
      updated_at: now,
      steps: steps,
    };

    await db.saveCareerRoadmap(roadmap);
    return roadmap;
  }

  /**
   * List roadmaps for the student
   */
  public static async listRoadmaps(studentId: string): Promise<CareerRoadmap[]> {
    return await db.getCareerRoadmaps(studentId);
  }

  /**
   * Get single roadmap
   */
  public static async getRoadmap(roadmapId: string, studentId: string): Promise<CareerRoadmap> {
    const roadmap = await db.getCareerRoadmapById(roadmapId, studentId);
    if (!roadmap) {
      throw new NotFoundError(`Career roadmap '${roadmapId}' not found`);
    }
    return roadmap;
  }

  /**
   * Update roadmap step status
   */
  public static async updateStepStatus(
    roadmapId: string,
    studentId: string,
    stepId: string,
    status: RoadmapStepStatus
  ): Promise<CareerRoadmap> {
    const roadmap = await this.getRoadmap(roadmapId, studentId);
    const step = roadmap.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new NotFoundError(`Roadmap step '${stepId}' not found`);
    }
    step.status = status;
    roadmap.updated_at = new Date().toISOString();

    const allCompleted = roadmap.steps.every((s) => s.status === 'COMPLETED');
    if (allCompleted) {
      roadmap.status = 'COMPLETED';
    } else {
      roadmap.status = 'IN_PROGRESS';
    }

    await db.saveCareerRoadmap(roadmap);
    return roadmap;
  }

  /**
   * Delete career roadmap
   */
  public static async deleteRoadmap(roadmapId: string, studentId: string): Promise<boolean> {
    return await db.deleteCareerRoadmap(roadmapId, studentId);
  }

  /**
   * Get authenticated student's personalized career profile
   */
  public static async getCareerProfile(studentId: string): Promise<CareerProfileData> {
    if (this.careerProfiles.has(studentId)) {
      return this.careerProfiles.get(studentId)!;
    }

    const student = await db.getStudentById(studentId);
    const studentSkills = await db.getStudentSkills(studentId);

    // Start from what the student told onboarding; leave the rest empty for them to fill in. Earlier versions
    // invented target roles, Indian cities, industries, goals and (with no skills) Python/TypeScript/React.
    const { OnboardingService } = await import('./onboardingService');
    const goals: any = OnboardingService.getCareerGoalsSync(studentId);
    const wm = goals?.work_mode_preference;
    const defaultProfile: CareerProfileData = {
      student_id: studentId,
      target_roles: goals?.target_job_role ? [goals.target_job_role] : [],
      preferred_industries: goals?.preferred_industry ? [goals.preferred_industry] : [],
      preferred_locations: goals?.preferred_location ? [goals.preferred_location] : [],
      preferred_work_arrangement: wm === 'REMOTE' ? 'REMOTE' : wm === 'HYBRID' ? 'HYBRID' : wm === 'ON_SITE' ? 'ONSITE' : 'FLEXIBLE',
      graduation_year: student?.semester ? new Date().getFullYear() + Math.max(0, Math.ceil((8 - student.semester) / 2)) : undefined,
      technical_skills: studentSkills.map((s) => s.skill_name),
      career_goals: goals?.long_term_goal ? [goals.long_term_goal] : [],
      updated_at: new Date().toISOString(),
    };

    this.careerProfiles.set(studentId, defaultProfile);
    return defaultProfile;
  }

  /**
   * Update student career profile
   */
  public static async updateCareerProfile(
    studentId: string,
    patch: Partial<CareerProfileData>
  ): Promise<CareerProfileData> {
    const current = await this.getCareerProfile(studentId);
    const updated: CareerProfileData = {
      ...current,
      ...patch,
      student_id: studentId,
      updated_at: new Date().toISOString(),
    };
    this.careerProfiles.set(studentId, updated);
    return updated;
  }

  /**
   * Comprehensive authenticated Career Dashboard summary aggregating all 8 modules
   */
  public static async getCareerDashboardSummary(studentId: string): Promise<CareerDashboardSummary> {
    const careerProfile = await this.getCareerProfile(studentId);
    const [
      studentSkills,
      projects,
      resumes,
      readiness,
      interviews,
      plans,
      applications,
      connections,
      activities,
    ] = await Promise.all([
      db.getStudentSkills(studentId),
      db.getProjects(studentId),
      ResumeService.listResumes(studentId).catch(() => []),
      PlacementService.getReadiness(studentId).catch(() => null),
      db.getMockInterviewSessions(studentId).catch(() => []),
      db.getPlacementPlans(studentId).catch(() => []),
      LearningModulesService.getApplications(studentId).catch(() => []),
      ExternalIntegrationService.listConnections(studentId).catch(() => []),
      ExternalIntegrationService.listActivities(studentId).catch(() => []),
    ]);

    // 1. Resume Completeness
    let resumeScore = 0;
    let resumeSections: { section: string; complete: boolean; details?: string }[] = [
      { section: 'Personal & Contact Info', complete: false, details: 'Name, email, phone' },
      { section: 'Professional Summary', complete: false, details: 'Career narrative' },
      { section: 'Academic Education', complete: false, details: 'Degree, branch, GPA' },
      { section: 'Technical Skills', complete: false, details: 'Languages, frameworks' },
      { section: 'Projects', complete: false, details: 'Engineering highlights' },
      { section: 'Experience / Internships', complete: false, details: 'Practical history' },
      { section: 'Certifications', complete: false, details: 'Verified credentials' },
    ];

    if (resumes.length > 0) {
      try {
        const full = await ResumeService.getFullResume(resumes[0].id, studentId);
        resumeScore = full.completeness_score || 0;
        resumeSections = [
          { section: 'Personal & Contact Info', complete: !!(full.profile?.full_name && full.profile?.email) },
          { section: 'Professional Summary', complete: !!(full.resume?.summary && full.resume.summary.length > 20) },
          { section: 'Academic Education', complete: full.education.length > 0, details: `${full.education.length} degree(s)` },
          { section: 'Technical Skills', complete: full.skills.length >= 3, details: `${full.skills.length} skills` },
          { section: 'Projects', complete: full.projects.length >= 1, details: `${full.projects.length} project(s)` },
          { section: 'Experience / Internships', complete: full.experience.length > 0, details: `${full.experience.length} position(s)` },
          { section: 'Certifications', complete: full.certifications.length > 0, details: `${full.certifications.length} credential(s)` },
        ];
      } catch (e) {
        logger.warn('Failed to load full resume data for dashboard summary', { error: e });
      }
    }

    // 2. Skill Alignment with Target Roles
    const allRoles = await db.getCareerRoles();
    // The target role is the first role named in the student's career profile. Without one, no alignment is
    // claimed (earlier versions silently used the first role in the catalogue).
    const primaryTargetRole = allRoles.find((r) =>
      careerProfile.target_roles.some((tr) => tr.trim() && (r.name.toLowerCase().includes(tr.toLowerCase()) || tr.toLowerCase().includes(r.name.toLowerCase())))
    );
    const mySkills = studentSkills.map((s) => s.skill_name);
    const matchingSkills = primaryTargetRole ? primaryTargetRole.skills.filter((req) => skillMatches(req, mySkills)) : [];
    const skillsToDevelop = primaryTargetRole ? primaryTargetRole.skills.filter((req) => !matchingSkills.includes(req)) : [];
    const skillsAlignedPercentage: number | null = primaryTargetRole && primaryTargetRole.skills.length > 0
      ? Math.round((matchingSkills.length / primaryTargetRole.skills.length) * 100)
      : null;

    // 3. Placement Preparation Progress
    const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED');
    const latestInterview = completedInterviews[0];
    const activePlan = plans[0];

    const placementProgress = {
      // No per-topic practice record exists, so no topic counts are claimed.
      topics_practiced: null as number | null,
      total_topics: null as number | null,
      mock_interviews_count: completedInterviews.length,
      latest_mock_score: latestInterview?.overall_score,
      active_sprint_title: activePlan?.title || null,
    };

    // 4. Applications & Upcoming Deadlines
    const activeApplications = applications.filter((a) =>
      ['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'TECHNICAL_ROUND', 'HR_ROUND'].includes(a.status)
    );

    const upcomingDeadlines: {
      id: string;
      title: string;
      company: string;
      date: string;
      type: 'DEADLINE' | 'INTERVIEW' | 'ASSESSMENT';
    }[] = [];

    const today = new Date(new Date().toDateString()).getTime();
    for (const app of applications) {
      if (['REJECTED', 'WITHDRAWN', 'OFFER', 'ACCEPTED'].includes(String(app.status))) continue;
      const future = (d?: string) => !!d && new Date(d).getTime() >= today;
      if (future(app.interview_date)) {
        upcomingDeadlines.push({
          id: `int_${app.id}`,
          title: `${app.role} Interview`,
          company: app.company_name,
          date: app.interview_date!,
          type: 'INTERVIEW',
        });
      } else if (future(app.assessment_date)) {
        upcomingDeadlines.push({
          id: `ass_${app.id}`,
          title: `${app.role} Online Assessment`,
          company: app.company_name,
          date: app.assessment_date!,
          type: 'ASSESSMENT',
        });
      } else if (future(app.deadline)) {
        upcomingDeadlines.push({
          id: `dl_${app.id}`,
          title: `${app.role} Application Deadline`,
          company: app.company_name,
          date: app.deadline!,
          type: 'DEADLINE',
        });
      }
    }

    upcomingDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 5. Recommended Next Actions
    const recommendedActions: CareerDashboardSummary['recommended_actions'] = [];

    if (resumeScore < 85) {
      recommendedActions.push({
        id: 'act_resume',
        title: 'Complete Missing Resume Sections',
        description: `Your verified resume completeness is currently ${resumeScore}%. Adding certifications or projects strengthens your candidate profile.`,
        action_label: 'Open Resume Editor',
        target_path: resumes.length > 0 ? `/resume/${resumes[0].id}/edit` : '/resume/create',
        priority: 'HIGH',
        category: 'RESUME',
      });
    }

    if (completedInterviews.length === 0) {
      recommendedActions.push({
        id: 'act_mock_interview',
        title: 'Conduct First AI Mock Technical Interview',
        description: `Practise interview questions${primaryTargetRole ? ` for ${primaryTargetRole.name}` : ''} and review the feedback.`,
        action_label: 'Start Mock Interview',
        target_path: '/interviews',
        priority: 'HIGH',
        category: 'PLACEMENT',
      });
    }

    if (skillsToDevelop.length > 0) {
      recommendedActions.push({
        id: 'act_skill_gap',
        title: `Bridge Skill Gap: ${skillsToDevelop[0]}`,
        description: `Strengthen ${skillsToDevelop.slice(0, 2).join(' & ')} listed for ${primaryTargetRole?.name}.`,
        action_label: 'Practice Topics',
        target_path: '/placements/topics',
        priority: 'MEDIUM',
        category: 'SKILLS',
      });
    }

    if (applications.length === 0) {
      recommendedActions.push({
        id: 'act_jobs',
        title: 'Discover & Track Engineering Roles',
        description: 'Find internships and graduate roles and track the ones you apply to.',
        action_label: 'Browse Jobs',
        target_path: '/career/jobs',
        priority: 'MEDIUM',
        category: 'JOBS',
      });
    }

    if (connections.length === 0) {
      recommendedActions.push({
        id: 'act_platforms',
        title: 'Connect GitHub and Professional Platforms',
        description: 'Sync your public repositories and competitive coding stats to provide verified skill evidence.',
        action_label: 'Connect Platforms',
        target_path: '/connected-platforms',
        priority: 'LOW',
        category: 'PLATFORMS',
      });
    }

    // 6. Recent Activity Chronological Stream
    const recentActivity: CareerDashboardSummary['recent_activity'] = [];

    for (const app of applications.slice(0, 4)) {
      recentActivity.push({
        id: `act_app_${app.id}`,
        title: app.status === 'SAVED' ? `Saved ${app.company_name}` : `Application to ${app.company_name}`,
        subtitle: `${app.role} • Status: ${app.status}`,
        timestamp: app.updated_at || app.created_at,
        category: 'APPLICATION',
        url: '/applications',
      });
    }

    for (const int of completedInterviews.slice(0, 3)) {
      recentActivity.push({
        id: `act_int_${int.id}`,
        title: `Mock Interview: ${int.interview_type}`,
        subtitle: `Scored ${int.overall_score}% across technical evaluation`,
        timestamp: int.created_at,
        category: 'INTERVIEW',
        url: `/placements/mock-interview/${int.id}/result`,
      });
    }

    for (const act of activities.slice(0, 3)) {
      recentActivity.push({
        id: `act_ext_${act.id}`,
        title: act.title,
        subtitle: `${act.provider.toUpperCase()} synced activity`,
        timestamp: act.timestamp || (act as any).created_at,
        category: 'INTEGRATION',
        url: '/sync',
      });
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      career_profile: careerProfile,
      readiness: {
        resume_completeness: resumeScore,
        resume_sections_status: resumeSections,
        skills_aligned_percentage: skillsAlignedPercentage,
        matching_skills: matchingSkills,
        skills_to_develop: skillsToDevelop,
        projects_count: projects.length,
        projects_available: projects.map((p) => ({ id: p.id, title: p.title, domain: p.domain })),
        placement_prep_progress: placementProgress,
        applications_in_progress: activeApplications.length,
        upcoming_deadlines: upcomingDeadlines.slice(0, 5),
        target_role_name: primaryTargetRole?.name || null,
        readiness_explanation: primaryTargetRole
          ? `Skill alignment compares the skills on your profile with the skills listed for ${primaryTargetRole.name}. Resume completeness, project, interview and application figures come from your own records.`
          : 'Set a target role in your career profile to see skill alignment. Resume completeness, project, interview and application figures come from your own records.',
      },
      recommended_actions: recommendedActions,
      recent_activity: recentActivity.slice(0, 8),
    };
  }
}
