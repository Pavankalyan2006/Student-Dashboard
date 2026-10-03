import { db } from '../db/database';
import {
  CareerRole,
  CareerRoadmap,
  CareerRoadmapStep,
  CareerRecommendationResult,
  RoadmapStepStatus,
} from '../models/careerResumeTypes';
import { NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class CareerService {
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

    const roleMatches = allRoles.map((role) => {
      const matchingSkills: string[] = [];
      const missingSkills: string[] = [];

      for (const req of role.skills) {
        // Partial or exact match check
        const hasMatch = Array.from(studentSkillNames).some(
          (s) => req.toLowerCase().includes(s) || s.includes(req.toLowerCase())
        );
        if (hasMatch) {
          matchingSkills.push(req);
        } else {
          missingSkills.push(req);
        }
      }

      const matchPercentage = Math.round((matchingSkills.length / Math.max(1, role.skills.length)) * 100);

      const reasons: string[] = [];
      if (matchingSkills.length > 0) {
        reasons.push(`Your profile demonstrates evidence in: ${matchingSkills.slice(0, 3).join(', ')}.`);
      }
      if (projects.length > 0) {
        reasons.push(`You have completed ${projects.length} practical projects supporting hands-on engineering.`);
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

    // Sort by match percentage
    roleMatches.sort((a, b) => b.match_percentage - a.match_percentage);

    const topRole = roleMatches[0];
    const skillsToDevelop = topRole ? topRole.skills_to_develop : [];

    return {
      potentially_relevant_roles: roleMatches.slice(0, 5),
      skills_to_develop: skillsToDevelop,
      recommended_projects: ['AI Learning Platform', 'Clinical Prognosis Classifier', 'API Gateway with Rate Limiting'],
      recommended_courses: ['crs_01j8k9m3q1', 'crs_01j8k9m3q2', 'crs_01j8k9m3q3'],
      explanation: `Recommendations reflect current alignment with your verified coursework, coding activity, and projects. As you complete more modules, your role alignments will update dynamically.`,
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
    const skillMap = new Map(studentSkills.map((s) => [s.skill_name.toLowerCase(), s]));

    const roadmapId = `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Generate tailored steps based on role and student evidence
    const rawSteps = [
      {
        title: 'Core Programming Fundamentals & OOP',
        description: 'Solidify object-oriented programming paradigms, type-safety, and modular architecture.',
        estimated_effort: '2 Weeks',
        source_type: 'COURSE' as const,
        source_id: 'crs_01j8k9m3q1',
        url: '/courses/crs_01j8k9m3q1',
        skill_ref: 'python',
      },
      {
        title: 'Data Structures & Algorithmic Problem Solving',
        description: 'Practice trees, graphs, sorting, and two-pointer techniques in the interactive lab.',
        estimated_effort: '3 Weeks',
        source_type: 'DSA' as const,
        source_id: 'dsa_topic_trees',
        url: '/dsa',
        skill_ref: 'data structures & algorithms',
      },
      {
        title: 'Relational Database Modeling & Complex SQL',
        description: 'Design normalized schemas, index strategies, and write multi-table joins and window queries.',
        estimated_effort: '2 Weeks',
        source_type: 'QUIZ' as const,
        source_id: 'quiz_dbms_01',
        url: '/quiz',
        skill_ref: 'sql',
      },
      {
        title: `${role.name} Specialized Framework Mastery`,
        description: `Deep-dive into tools, frameworks, and architectural patterns required for ${role.name}.`,
        estimated_effort: '4 Weeks',
        source_type: 'NOTES' as const,
        source_id: 'note_seed_os_01',
        url: '/notes',
        skill_ref: role.skills[0]?.toLowerCase(),
      },
      {
        title: 'Hands-on Production Capstone Project',
        description: 'Build and document a full-fledged technical project in Project Builder with unit tests.',
        estimated_effort: '4 Weeks',
        source_type: 'PROJECT' as const,
        source_id: 'prj_seed_01',
        url: '/projects',
        skill_ref: 'projects',
      },
      {
        title: 'Technical Interview & Mock Evaluation',
        description: 'Complete mock technical interviews with simulated feedback and concept coverage reports.',
        estimated_effort: '2 Weeks',
        source_type: 'PLACEMENT' as const,
        source_id: role.id,
        url: `/placements/role/${role.id}`,
        skill_ref: 'interview',
      },
    ];

    const steps: CareerRoadmapStep[] = rawSteps.map((s, idx) => {
      // Check if student already has strong or verified evidence in this skill
      const existing = s.skill_ref ? skillMap.get(s.skill_ref) : undefined;
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
}
