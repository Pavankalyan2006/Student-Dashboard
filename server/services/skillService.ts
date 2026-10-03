import { db } from '../db/database';
import {
  Skill,
  StudentSkill,
  SkillEvidence,
  SkillGapAnalysisResult,
  SkillConfidence,
  SkillProficiency,
  SkillSource,
} from '../models/careerResumeTypes';
import { NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export class SkillService {
  /**
   * List all skills in standard repository
   */
  public static async listSkills(category?: string): Promise<Skill[]> {
    const all = await db.getSkills();
    if (!category) return all;
    return all.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get single skill
   */
  public static async getSkill(id: string): Promise<Skill> {
    const skill = await db.getSkillById(id);
    if (!skill) {
      throw new NotFoundError(`Skill with ID '${id}' not found`);
    }
    return skill;
  }

  /**
   * Get student's verified and declared skill profile
   */
  public static async getStudentSkills(studentId: string): Promise<StudentSkill[]> {
    return await db.getStudentSkills(studentId);
  }

  /**
   * Add or declare a student skill
   */
  public static async declareStudentSkill(
    studentId: string,
    skillId: string,
    proficiency: SkillProficiency = 'INTERMEDIATE'
  ): Promise<StudentSkill> {
    const skill = await this.getSkill(skillId);
    const existingList = await db.getStudentSkills(studentId);
    const existing = existingList.find((s) => s.skill_id === skillId);

    const now = new Date().toISOString();
    const updated: StudentSkill = {
      id: existing?.id || `ssk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      skill_id: skill.id,
      skill_name: skill.name,
      category: skill.category,
      source: existing?.source || 'STUDENT_DECLARED',
      evidence_count: existing ? existing.evidence_count : 1,
      proficiency: proficiency || existing?.proficiency || 'INTERMEDIATE',
      confidence: existing?.confidence || 'LIMITED_EVIDENCE',
      last_updated_at: now,
    };

    await db.saveStudentSkill(updated);

    // Save declaration evidence
    if (!existing) {
      const evidence: SkillEvidence = {
        id: `ev_${Date.now()}`,
        student_skill_id: updated.id,
        student_id: studentId,
        skill_id: skill.id,
        source_type: 'STUDENT_DECLARED',
        source_id: 'user_profile',
        description: `Student self-declared proficiency as ${proficiency}.`,
        created_at: now,
      };
      await db.saveSkillEvidence(evidence);
    }

    return updated;
  }

  /**
   * Retrieve all evidence for a student's skills
   */
  public static async getSkillEvidence(studentId: string, skillId?: string): Promise<SkillEvidence[]> {
    return await db.getSkillEvidence(studentId, skillId);
  }

  /**
   * Record new evidence and update cumulative confidence state
   */
  public static async recordEvidence(
    studentId: string,
    skillId: string,
    evidenceData: {
      source_type: SkillSource;
      source_id: string;
      description: string;
      score?: number;
    }
  ): Promise<SkillEvidence> {
    const skill = await this.getSkill(skillId);
    const studentSkills = await db.getStudentSkills(studentId);
    let studentSkill = studentSkills.find((s) => s.skill_id === skillId);

    const now = new Date().toISOString();
    if (!studentSkill) {
      studentSkill = {
        id: `ssk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        student_id: studentId,
        skill_id: skill.id,
        skill_name: skill.name,
        category: skill.category,
        source: evidenceData.source_type,
        evidence_count: 0,
        proficiency: 'INTERMEDIATE',
        confidence: 'LIMITED_EVIDENCE',
        last_updated_at: now,
      };
    }

    // Create evidence record
    const evidence: SkillEvidence = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_skill_id: studentSkill.id,
      student_id: studentId,
      skill_id: skill.id,
      source_type: evidenceData.source_type,
      source_id: evidenceData.source_id,
      description: evidenceData.description,
      score: evidenceData.score,
      created_at: now,
    };
    await db.saveSkillEvidence(evidence);

    // Update cumulative confidence state
    const allEvidence = await db.getSkillEvidence(studentId, skillId);
    const evidenceCount = allEvidence.length;

    let newConfidence: SkillConfidence = 'LIMITED_EVIDENCE';
    if (evidenceCount >= 4) {
      newConfidence = 'VERIFIED';
    } else if (evidenceCount >= 2) {
      newConfidence = 'STRONG_EVIDENCE';
    } else if (evidenceCount === 1) {
      newConfidence = 'DEVELOPING_EVIDENCE';
    }

    studentSkill.evidence_count = evidenceCount;
    studentSkill.confidence = newConfidence;
    studentSkill.last_updated_at = now;
    await db.saveStudentSkill(studentSkill);

    return evidence;
  }

  /**
   * Conduct Skill Gap Analysis against a target Career Role
   */
  public static async getSkillGaps(studentId: string, targetRoleId: string): Promise<SkillGapAnalysisResult> {
    const role = await db.getCareerRoleById(targetRoleId);
    if (!role) {
      throw new NotFoundError(`Career role '${targetRoleId}' not found`);
    }

    const studentSkills = await db.getStudentSkills(studentId);
    const skillMap = new Map(studentSkills.map((s) => [s.skill_name.toLowerCase(), s]));

    const strengths: { skill: string; evidence_state: SkillConfidence; evidence_count: number }[] = [];
    const gaps: {
      skill: string;
      evidence_state: SkillConfidence;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      recommended_learning_resource?: {
        title: string;
        type: 'COURSE' | 'NOTES' | 'DOC' | 'CODING' | 'DSA' | 'QUIZ' | 'PROJECT';
        reference_id?: string;
      };
      recommended_project?: string;
      recommended_practice?: string;
    }[] = [];

    role.skills.forEach((reqSkill, idx) => {
      const match = Array.from(skillMap.keys()).find(
        (k) => reqSkill.toLowerCase().includes(k) || k.includes(reqSkill.toLowerCase())
      );
      const studentSkill = match ? skillMap.get(match) : undefined;

      if (
        studentSkill &&
        (studentSkill.confidence === 'VERIFIED' || studentSkill.confidence === 'STRONG_EVIDENCE')
      ) {
        strengths.push({
          skill: reqSkill,
          evidence_state: studentSkill.confidence,
          evidence_count: studentSkill.evidence_count,
        });
      } else {
        const state: SkillConfidence = studentSkill?.confidence || 'NOT_ASSESSED';
        const priority = idx < 2 ? 'HIGH' : idx < 4 ? 'MEDIUM' : 'LOW';

        gaps.push({
          skill: reqSkill,
          evidence_state: state,
          priority: priority,
          recommended_learning_resource: {
            title: `Master ${reqSkill} Core Concepts`,
            type: reqSkill.toLowerCase().includes('dsa') || reqSkill.toLowerCase().includes('algorithm') ? 'DSA' : 'COURSE',
            reference_id: role.recommended_courses[0] || 'crs_01j8k9m3q1',
          },
          recommended_project: role.recommended_projects[0] || 'Full-stack System',
          recommended_practice: `Complete ${reqSkill} assessment or coding problems to add verified evidence.`,
        });
      }
    });

    const coverage = Math.round((strengths.length / Math.max(1, role.skills.length)) * 100);

    return {
      target_role: role.name,
      current_strengths: strengths,
      skills_to_develop: gaps,
      coverage_percentage: coverage,
      disclaimer: 'Skill gaps describe current evidence captured on the platform relative to typical industry expectations. They are not judgments of your personal potential or innate ability.',
    };
  }
}
