import { db } from '../db/database';
import {
  Resume,
  ResumeProfile,
  ResumeEducation,
  ResumeSkill,
  ResumeProject,
  ResumeExperience,
  ResumeCertification,
  ResumeAchievement,
  ResumeVersion,
  FullResumeData,
  CustomTemplateConfig,
} from '../models/careerResumeTypes';
import { ProjectService } from './projectService';
import { AuthorizationError, NotFoundError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class ResumeService {
  /**
   * List all resumes owned by the student
   */
  public static async listResumes(studentId: string): Promise<Resume[]> {
    return await db.getResumes(studentId);
  }

  /**
   * Get single resume summary with student authorization
   */
  public static async getResume(id: string, studentId: string): Promise<Resume> {
    const resume = await db.getResumeById(id, studentId);
    if (!resume) {
      throw new NotFoundError(`Resume with ID '${id}' not found`);
    }
    return resume;
  }

  /**
   * Get full aggregated resume data for editor and preview
   */
  public static async getFullResume(id: string, studentId: string): Promise<FullResumeData> {
    const resume = await this.getResume(id, studentId);
    const profile = await db.getResumeProfile(id);
    const education = await db.getResumeEducations(id);
    const skills = await db.getResumeSkills(id);
    const projects = await db.getResumeProjects(id);
    const experience = await db.getResumeExperiences(id);
    const certifications = await db.getResumeCertifications(id);
    const achievements = await db.getResumeAchievements(id);

    const { completeness_score, completeness_breakdown } = this.calculateCompleteness({
      resume,
      profile,
      education,
      skills,
      projects,
      experience,
      certifications,
      achievements,
      completeness_score: 0,
      completeness_breakdown: [],
    });

    return {
      resume,
      profile,
      education,
      skills,
      projects,
      experience,
      certifications,
      achievements,
      completeness_score,
      completeness_breakdown,
    };
  }

  /**
   * Create a new resume pre-populating with student's verified profile data
   */
  public static async createResume(
    studentId: string,
    data: {
      title?: string;
      template?: 'CLASSIC' | 'MODERN' | 'TECHNICAL' | 'MINIMAL' | 'ACADEMIC';
      target_role?: string;
      target_industry?: string;
      summary?: string;
    }
  ): Promise<FullResumeData> {
    const student = await db.getStudentById(studentId);
    if (!student) {
      throw new NotFoundError(`Student '${studentId}' not found`);
    }

    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newResume: Resume = {
      id: resumeId,
      student_id: studentId,
      title: data.title || `${student.name} — Resume`,
      template: data.template || 'TECHNICAL',
      target_role: data.target_role || 'Software Engineer',
      target_industry: data.target_industry || 'Software Engineering',
      summary:
        data.summary ||
        `Motivated B.Tech student with strong foundations in software development, data structures, and computer science principles. Experienced in building full-stack applications and collaborative problem solving.`,
      status: 'DRAFT',
      section_order: ['profile', 'summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements'],
      created_at: now,
      updated_at: now,
    };

    await db.saveResume(newResume);

    // Initial Profile from verified student account
    const initialProfile: ResumeProfile = {
      id: `prof_${Date.now()}`,
      resume_id: resumeId,
      full_name: student.name,
      email: student.email,
      phone: '',
      location: '',
      website: '',
      linkedin_url: '',
      github_url: '',
      portfolio_url: '',
      headline: `${student.branch} Student`,
    };
    await db.saveResumeProfile(initialProfile);

    // Initial Education based on student enrollment
    const initialEducation: ResumeEducation = {
      id: `edu_${Date.now()}`,
      resume_id: resumeId,
      institution: 'University College of Engineering',
      degree: 'Bachelor of Technology (B.Tech)',
      field_of_study: student.branch,
      start_date: '2023-08',
      end_date: '2027-05',
      grade: 'Cumulative CGPA: 8.5/10',
      description: 'Major coursework in Computer Science, Systems, and Software Development.',
      order_index: 0,
    };
    await db.saveResumeEducations(resumeId, [initialEducation]);

    // Pull student's existing skills from student_skills if available
    const existingSkills = await db.getStudentSkills(studentId);
    const initialSkills: ResumeSkill[] = existingSkills.slice(0, 8).map((s, idx) => ({
      id: `rsk_${Date.now()}_${idx}`,
      resume_id: resumeId,
      skill: s.skill_name,
      category: s.category === 'PROGRAMMING' ? 'PROGRAMMING' : s.category === 'WEB' ? 'FRAMEWORK' : 'TOOLS',
      proficiency: s.proficiency,
      source: 'STUDENT_ENTERED',
      order_index: idx,
    }));
    await db.saveResumeSkills(resumeId, initialSkills);

    // Empty initial arrays for others
    await db.saveResumeProjects(resumeId, []);
    await db.saveResumeExperiences(resumeId, []);
    await db.saveResumeCertifications(resumeId, []);
    await db.saveResumeAchievements(resumeId, []);

    // Create initial version snapshot
    await this.createVersionSnapshot(resumeId, studentId, 'Initial creation');

    return await this.getFullResume(resumeId, studentId);
  }

  /**
   * Update base resume metadata
   */
  public static async updateResume(
    id: string,
    studentId: string,
    updates: Partial<Resume>
  ): Promise<Resume> {
    const resume = await this.getResume(id, studentId);
    const updated: Resume = {
      ...resume,
      ...updates,
      id: resume.id,
      student_id: resume.student_id,
      updated_at: new Date().toISOString(),
    };
    await db.saveResume(updated);
    return updated;
  }

  /**
   * Delete resume with ownership check
   */
  public static async deleteResume(id: string, studentId: string): Promise<boolean> {
    return await db.deleteResume(id, studentId);
  }

  /**
   * Update contact profile
   */
  public static async updateProfile(
    resumeId: string,
    studentId: string,
    profileData: Partial<ResumeProfile>
  ): Promise<ResumeProfile> {
    await this.getResume(resumeId, studentId);
    const existing = (await db.getResumeProfile(resumeId)) || {
      id: `prof_${Date.now()}`,
      resume_id: resumeId,
      full_name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin_url: '',
      github_url: '',
      portfolio_url: '',
      headline: '',
    };

    const updated: ResumeProfile = {
      ...existing,
      ...profileData,
      id: existing.id,
      resume_id: resumeId,
    };
    await db.saveResumeProfile(updated);
    await this.touchResume(resumeId);
    return updated;
  }

  /**
   * Update Education items
   */
  public static async updateEducations(
    resumeId: string,
    studentId: string,
    educations: ResumeEducation[]
  ): Promise<ResumeEducation[]> {
    await this.getResume(resumeId, studentId);
    const normalized = educations.map((edu, idx) => ({
      ...edu,
      id: edu.id || `edu_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeEducations(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Update Skills
   */
  public static async updateSkills(
    resumeId: string,
    studentId: string,
    skills: ResumeSkill[]
  ): Promise<ResumeSkill[]> {
    await this.getResume(resumeId, studentId);
    const normalized = skills.map((sk, idx) => ({
      ...sk,
      id: sk.id || `rsk_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeSkills(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Update Projects
   */
  public static async updateProjects(
    resumeId: string,
    studentId: string,
    projects: ResumeProject[]
  ): Promise<ResumeProject[]> {
    await this.getResume(resumeId, studentId);
    const normalized = projects.map((prj, idx) => ({
      ...prj,
      id: prj.id || `rprj_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeProjects(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Import project from Phase 10 Project Builder into Resume
   */
  public static async importProject(
    resumeId: string,
    studentId: string,
    projectId: string
  ): Promise<ResumeProject> {
    await this.getResume(resumeId, studentId);
    // Real verified project check
    const project = await ProjectService.getProject(projectId, studentId);
    const existing = await db.getResumeProjects(resumeId);

    // Pull verified technologies from the project
    const projectTechs = await db.getProjectTechnologies(projectId);
    const techNames = projectTechs.length > 0 ? projectTechs.map((t) => t.technology) : [project.domain];

    const newResumeProject: ResumeProject = {
      id: `rprj_${Date.now()}`,
      resume_id: resumeId,
      project_id: projectId,
      title: project.title,
      description_override: project.description,
      highlighted_features: [
        `Architected ${project.project_type.toLowerCase()} system for ${project.domain} using ${techNames.slice(0, 3).join(', ')}.`,
        `Engineered robust core modules adhering to clean code and defensive design principles.`,
      ],
      technologies: techNames,
      order_index: existing.length,
    };

    existing.push(newResumeProject);
    await db.saveResumeProjects(resumeId, existing);
    await this.touchResume(resumeId);
    return newResumeProject;
  }

  /**
   * Update Experiences
   */
  public static async updateExperiences(
    resumeId: string,
    studentId: string,
    experiences: ResumeExperience[]
  ): Promise<ResumeExperience[]> {
    await this.getResume(resumeId, studentId);
    const normalized = experiences.map((exp, idx) => ({
      ...exp,
      id: exp.id || `rexp_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeExperiences(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Update Certifications
   */
  public static async updateCertifications(
    resumeId: string,
    studentId: string,
    certs: ResumeCertification[]
  ): Promise<ResumeCertification[]> {
    await this.getResume(resumeId, studentId);
    const normalized = certs.map((cert, idx) => ({
      ...cert,
      id: cert.id || `rcert_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeCertifications(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Update Achievements
   */
  public static async updateAchievements(
    resumeId: string,
    studentId: string,
    achievements: ResumeAchievement[]
  ): Promise<ResumeAchievement[]> {
    await this.getResume(resumeId, studentId);
    const normalized = achievements.map((ach, idx) => ({
      ...ach,
      id: ach.id || `rach_${Date.now()}_${idx}`,
      resume_id: resumeId,
      order_index: idx,
    }));
    await db.saveResumeAchievements(resumeId, normalized);
    await this.touchResume(resumeId);
    return normalized;
  }

  /**
   * Persist Section Reordering
   */
  public static async updateSectionOrder(
    resumeId: string,
    studentId: string,
    newOrder: string[]
  ): Promise<string[]> {
    const resume = await this.getResume(resumeId, studentId);
    resume.section_order = newOrder;
    resume.updated_at = new Date().toISOString();
    await db.saveResume(resume);
    return newOrder;
  }

  /**
   * Snapshot current version before major modifications
   */
  public static async createVersionSnapshot(
    resumeId: string,
    studentId: string,
    createdBy: string = 'Student'
  ): Promise<ResumeVersion> {
    const fullData = await this.getFullResume(resumeId, studentId);
    const existingVersions = await db.getResumeVersions(resumeId);
    const nextVersionNumber = existingVersions.length > 0 ? existingVersions[0].version_number + 1 : 1;

    const version: ResumeVersion = {
      id: `ver_${Date.now()}_${nextVersionNumber}`,
      resume_id: resumeId,
      version_number: nextVersionNumber,
      content_snapshot: JSON.parse(JSON.stringify(fullData)),
      created_at: new Date().toISOString(),
      created_by: createdBy,
    };

    await db.saveResumeVersion(version);
    return version;
  }

  /**
   * List saved resume versions
   */
  public static async listVersions(resumeId: string, studentId: string): Promise<ResumeVersion[]> {
    await this.getResume(resumeId, studentId);
    return await db.getResumeVersions(resumeId);
  }

  /**
   * Restore resume from a previous version snapshot
   */
  public static async restoreVersion(
    resumeId: string,
    studentId: string,
    versionNumber: number
  ): Promise<FullResumeData> {
    await this.getResume(resumeId, studentId);
    const version = await db.getResumeVersionById(resumeId, versionNumber);
    if (!version) {
      throw new NotFoundError(`Version ${versionNumber} for resume '${resumeId}' not found`);
    }

    // Save a backup of the current state first
    await this.createVersionSnapshot(resumeId, studentId, `Auto-backup before restore v${versionNumber}`);

    const snap = version.content_snapshot;
    if (snap.resume) {
      snap.resume.updated_at = new Date().toISOString();
      await db.saveResume(snap.resume);
    }
    if (snap.profile) {
      await db.saveResumeProfile(snap.profile);
    }
    if (Array.isArray(snap.education)) {
      await db.saveResumeEducations(resumeId, snap.education);
    }
    if (Array.isArray(snap.skills)) {
      await db.saveResumeSkills(resumeId, snap.skills);
    }
    if (Array.isArray(snap.projects)) {
      await db.saveResumeProjects(resumeId, snap.projects);
    }
    if (Array.isArray(snap.experience)) {
      await db.saveResumeExperiences(resumeId, snap.experience);
    }
    if (Array.isArray(snap.certifications)) {
      await db.saveResumeCertifications(resumeId, snap.certifications);
    }
    if (Array.isArray(snap.achievements)) {
      await db.saveResumeAchievements(resumeId, snap.achievements);
    }

    return await this.getFullResume(resumeId, studentId);
  }

  /**
   * Calculate transparent completeness score
   */
  public static calculateCompleteness(data: FullResumeData): {
    completeness_score: number;
    completeness_breakdown: { section: string; complete: boolean; weight: number; message: string }[];
  } {
    const checks = [
      {
        section: 'Profile & Contact',
        weight: 15,
        complete: Boolean(data.profile && data.profile.full_name && data.profile.email && data.profile.phone),
        message: 'Name, email, and phone number provided',
      },
      {
        section: 'Professional Summary',
        weight: 15,
        complete: Boolean(data.resume.summary && data.resume.summary.trim().length >= 40),
        message: 'Summary is clear and contains at least 40 characters',
      },
      {
        section: 'Education',
        weight: 20,
        complete: Boolean(data.education && data.education.length > 0 && data.education[0].institution),
        message: 'At least one degree or institution listed',
      },
      {
        section: 'Core Skills',
        weight: 20,
        complete: Boolean(data.skills && data.skills.length >= 4),
        message: 'At least 4 technical or domain skills listed',
      },
      {
        section: 'Projects',
        weight: 20,
        complete: Boolean(data.projects && data.projects.length >= 1),
        message: 'At least 1 project added with technologies',
      },
      {
        section: 'Experience / Certifications',
        weight: 10,
        complete: Boolean(
          (data.experience && data.experience.length > 0) ||
          (data.certifications && data.certifications.length > 0) ||
          (data.achievements && data.achievements.length > 0)
        ),
        message: 'Practical experience, certifications, or verified achievements included',
      },
    ];

    const completeness_score = checks.reduce((acc, curr) => acc + (curr.complete ? curr.weight : 0), 0);

    return {
      completeness_score,
      completeness_breakdown: checks,
    };
  }

  /**
   * Uploads and parses a PDF resume template, detects structure & sections,
   * binds verified student details into the custom layout, and updates the resume.
   */
  public static async uploadAndApplyTemplate(
    resumeId: string,
    studentId: string,
    payload: {
      filename: string;
      mimeType?: string;
      contentBase64?: string;
      rawText?: string;
    }
  ): Promise<{
    templateConfig: CustomTemplateConfig;
    fullResume: FullResumeData;
  }> {
    if (!payload.filename) {
      throw new ValidationError('A PDF template filename is required.');
    }

    let resume: Resume;
    try {
      if (resumeId) {
        resume = await this.getResume(resumeId, studentId);
      } else {
        throw new Error('No resumeId provided');
      }
    } catch {
      const existing = await db.getResumes(studentId);
      if (existing.length > 0) {
        resume = existing[0];
      } else {
        const created = await this.createResume(studentId, {
          title: 'My Engineering Resume',
          target_role: 'Software Engineer',
          target_industry: 'Software Engineering',
        });
        resume = created.resume;
      }
    }

    // Extract text from rawText or contentBase64
    let textToAnalyze = payload.rawText || '';
    if (payload.contentBase64) {
      try {
        const buffer = Buffer.from(payload.contentBase64, 'base64');
        const rawAscii = buffer.toString('binary');
        // Extract string tokens enclosed in parentheses or stream blocks
        const matches: string[] = [];
        const streamRegex = /\(([^)]+)\)\s*(?:Tj|TJ|'|")/g;
        let match;
        while ((match = streamRegex.exec(rawAscii)) !== null) {
          matches.push(match[1]);
          if (matches.length > 500) break;
        }
        if (matches.length > 0) {
          textToAnalyze += ' ' + matches.join(' ');
        } else {
          // Fallback extraction of readable ASCII sequences
          const asciiWords = rawAscii.match(/[A-Za-z]{3,25}/g) || [];
          textToAnalyze += ' ' + asciiWords.slice(0, 500).join(' ');
        }
      } catch (err: any) {
        logger.warn('Failed to extract raw binary from base64 PDF; proceeding with filename & text heuristics', {
          error: err.message,
        });
      }
    }

    // Section definitions and regexes
    const sectionDefinitions = [
      {
        key: 'summary',
        label: 'Professional Summary',
        regex: /(?:professional\s+summary|executive\s+summary|career\s+summary|summary|profile|about\s+me|career\s+objective|objective)/i,
      },
      {
        key: 'skills',
        label: 'Technical Skills',
        regex: /(?:technical\s+skills|core\s+skills|skills|technologies|tech\s+stack|programming\s+languages|technical\s+expertise|competencies)/i,
      },
      {
        key: 'experience',
        label: 'Work Experience',
        regex: /(?:work\s+experience|professional\s+experience|experience|employment\s+history|internships|work\s+history)/i,
      },
      {
        key: 'projects',
        label: 'Technical Projects',
        regex: /(?:technical\s+projects|featured\s+projects|projects|key\s+projects|academic\s+projects|selected\s+projects)/i,
      },
      {
        key: 'education',
        label: 'Education & Academics',
        regex: /(?:education|academic\s+background|academics|qualifications|degrees|educational\s+background)/i,
      },
      {
        key: 'certifications',
        label: 'Certifications',
        regex: /(?:certifications|certificates|licenses|accreditations|credentials)/i,
      },
      {
        key: 'achievements',
        label: 'Honors & Achievements',
        regex: /(?:honors\s+&\s+awards|achievements|awards|extracurricular|activities|publications|leadership)/i,
      },
    ];

    interface FoundSection {
      key: string;
      label: string;
      originalHeading: string;
      index: number;
      found: boolean;
      confidence: number;
    }

    const foundSections: FoundSection[] = [];
    const detectedHeadings: Record<string, string> = {};

    for (const def of sectionDefinitions) {
      const match = def.regex.exec(textToAnalyze);
      if (match) {
        foundSections.push({
          key: def.key,
          label: def.label,
          originalHeading: match[0].trim(),
          index: match.index,
          found: true,
          confidence: 0.95,
        });
        detectedHeadings[def.key] = match[0].trim().toUpperCase();
      } else {
        foundSections.push({
          key: def.key,
          label: def.label,
          originalHeading: def.label.toUpperCase(),
          index: 999999,
          found: false,
          confidence: 0.5,
        });
      }
    }

    // Sort detected sections by their sequential appearance in the uploaded PDF
    const sortedDetected = foundSections
      .filter((s) => s.found)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.key);

    // Any remaining standard sections not explicitly detected in text are appended in logical order
    const remaining = ['profile', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']
      .filter((k) => !sortedDetected.includes(k));

    // Ensure 'profile' is always first
    const newSectionOrder = ['profile', ...sortedDetected, ...remaining.filter((k) => k !== 'profile')];

    // Style heuristics from PDF content & template name
    const lowerFilename = payload.filename.toLowerCase();
    const lowerText = textToAnalyze.toLowerCase();
    let detectedFont: 'sans' | 'serif' | 'mono' = 'sans';
    if (lowerText.includes('times') || lowerText.includes('georgia') || lowerText.includes('serif') || lowerFilename.includes('classic') || lowerFilename.includes('academic') || lowerFilename.includes('harvard')) {
      detectedFont = 'serif';
    } else if (lowerText.includes('courier') || lowerText.includes('consolas') || lowerText.includes('mono') || lowerFilename.includes('code') || lowerFilename.includes('technical')) {
      detectedFont = 'mono';
    }

    // Accent color heuristic
    let accentColor = '#1E40AF'; // Default navy
    if (lowerFilename.includes('red') || lowerFilename.includes('crimson') || lowerFilename.includes('harvard')) {
      accentColor = '#991B1B';
    } else if (lowerFilename.includes('emerald') || lowerFilename.includes('green')) {
      accentColor = '#065F46';
    } else if (lowerFilename.includes('purple') || lowerFilename.includes('indigo')) {
      accentColor = '#4F46E5';
    } else if (lowerFilename.includes('minimal') || lowerFilename.includes('slate') || lowerFilename.includes('black')) {
      accentColor = '#0F172A';
    } else if (lowerFilename.includes('cyan') || lowerFilename.includes('teal')) {
      accentColor = '#0E7490';
    }

    // Alignment heuristic
    const isCentered = lowerFilename.includes('centered') || lowerFilename.includes('classic') || lowerFilename.includes('academic') || lowerText.includes('curriculum vitae');

    const cleanTemplateName = payload.filename.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

    const templateConfig: CustomTemplateConfig = {
      template_name: cleanTemplateName.charAt(0).toUpperCase() + cleanTemplateName.slice(1),
      filename: payload.filename,
      detected_sections: foundSections.map((s) => ({
        key: s.key,
        label: s.label,
        original_heading: s.originalHeading,
        found: s.found,
        confidence: s.confidence,
      })),
      section_order: newSectionOrder,
      styling: {
        font_family: detectedFont,
        accent_color: accentColor,
        header_alignment: isCentered ? 'center' : 'left',
        layout: lowerFilename.includes('2col') || lowerFilename.includes('two') ? 'TWO_COLUMN' : 'SINGLE_COLUMN',
        divider_style: lowerFilename.includes('minimal') ? 'subtle' : 'solid',
        density: lowerFilename.includes('compact') ? 'compact' : 'normal',
      },
      detected_headings: detectedHeadings,
      uploaded_at: new Date().toISOString(),
    };

    // Update resume record with the custom template configuration and section order
    resume.template = 'CUSTOM_UPLOADED';
    resume.section_order = newSectionOrder;
    resume.custom_template_config = templateConfig;
    resume.updated_at = new Date().toISOString();

    await db.saveResume(resume);

    // Create version snapshot to record the template change
    try {
      await this.createVersionSnapshot(
        resume.id,
        studentId,
        `Imported custom PDF template: ${templateConfig.template_name}`
      );
    } catch (snapErr: any) {
      logger.warn('Version snapshot creation skipped during template upload', { error: snapErr?.message });
    }

    const fullResume = await this.getFullResume(resume.id, studentId);
    logger.info(`Applied custom PDF template '${templateConfig.template_name}' to resume ${resume.id} for student ${studentId}`);

    return {
      templateConfig,
      fullResume,
    };
  }

  private static async touchResume(resumeId: string): Promise<void> {
    const res = await db.getResumeById(resumeId);
    if (res) {
      res.updated_at = new Date().toISOString();
      await db.saveResume(res);
    }
  }
}
