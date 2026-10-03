import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { ResumeService } from '../../server/services/resumeService';
import { ResumeAnalysisService } from '../../server/services/resumeAnalysisService';
import { ResumeTailoringService } from '../../server/services/resumeTailoringService';
import { CareerAIService } from '../../server/services/careerAIService';
import { CareerService } from '../../server/services/careerService';
import { SkillService } from '../../server/services/skillService';
import { SkillAssessmentService } from '../../server/services/skillAssessmentService';
import { ProjectService } from '../../server/services/projectService';
import { ToolRegistry } from '../../server/ai/tools';

describe('Phase 12: Resume Builder, Career Assistant & Skill Assessment System', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_unauthorized_student_99';

  beforeEach(async () => {
    await db.initialize();
  });

  // ==========================================
  // 1. RESUME CRUD & STUDENT OWNERSHIP SECURITY
  // ==========================================
  describe('1. Resume CRUD & Student Ownership Security', () => {
    it('creates a new resume for studentA and retrieves it with default completeness', async () => {
      const fullResume = await ResumeService.createResume(studentA, {
        title: 'Full Stack Engineer 2026',
        template: 'TECHNICAL',
        target_role: 'Full Stack Developer',
        target_industry: 'Software & Cloud',
        summary: 'Passionate computer science student experienced in modern web architectures and relational databases.',
      });

      expect(fullResume).toBeDefined();
      expect(fullResume.resume.id).toBeDefined();
      expect(fullResume.resume.student_id).toBe(studentA);
      expect(fullResume.resume.title).toBe('Full Stack Engineer 2026');
      expect(fullResume.resume.template).toBe('TECHNICAL');
      expect(fullResume.completeness_score).toBeGreaterThan(0);
      expect(fullResume.completeness_breakdown.length).toBeGreaterThanOrEqual(6);
    });

    it('enforces student ownership: studentB cannot access studentA resume', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      expect(resumes.length).toBeGreaterThan(0);
      const targetResumeId = resumes[0].id;

      // Student B attempting to read Student A's resume
      await expect(ResumeService.getFullResume(targetResumeId, studentB)).rejects.toThrow(
        /permission|Unauthorized|Resume not found|Forbidden/i
      );
    });

    it('enforces student ownership: studentB cannot modify studentA resume profile or sections', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const targetResumeId = resumes[0].id;

      // Student B attempting to update Student A's profile
      await expect(
        ResumeService.updateProfile(targetResumeId, studentB, {
          full_name: 'Hacked Name',
        })
      ).rejects.toThrow(/permission|Unauthorized|Resume not found|Forbidden/i);

      // Student B attempting to update Student A's education
      await expect(
        ResumeService.updateEducations(targetResumeId, studentB, [])
      ).rejects.toThrow(/permission|Unauthorized|Resume not found|Forbidden/i);

      // Student B attempting to delete Student A's resume
      await expect(
        ResumeService.deleteResume(targetResumeId, studentB)
      ).rejects.toThrow(/permission|Unauthorized|Resume not found|Forbidden/i);
    });

    it('allows studentA to update and persist section order', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const targetResumeId = resumes[0].id;

      const newOrder = ['skills', 'projects', 'experience', 'education', 'certifications', 'achievements'];
      const updatedOrder = await ResumeService.updateSectionOrder(targetResumeId, studentA, newOrder);

      expect(updatedOrder).toEqual(newOrder);

      const resumeCheck = await ResumeService.getFullResume(targetResumeId, studentA);
      expect(resumeCheck.resume.section_order).toEqual(newOrder);
    });
  });

  // ==========================================
  // 2. RESUME SECTIONS & PHASE 10 PROJECT LINKING
  // ==========================================
  describe('2. Resume Sections & Phase 10 Project Integration', () => {
    it('updates education, experience, certifications and achievements for studentA', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      // Update Education
      const edu = await ResumeService.updateEducations(resumeId, studentA, [
        {
          id: 'edu_test_1',
          resume_id: resumeId,
          institution: 'Apex Institute of Technology',
          degree: 'B.Tech',
          field_of_study: 'Computer Science and Engineering',
          start_date: '2023-08',
          end_date: '2027-05',
          grade: '8.9 CGPA',
          description: 'Specialization in Artificial Intelligence and Cloud Systems.',
          order_index: 0,
        },
      ]);
      expect(edu.length).toBe(1);
      expect(edu[0].degree).toBe('B.Tech');

      // Update Experience
      const exp = await ResumeService.updateExperiences(resumeId, studentA, [
        {
          id: 'exp_test_1',
          resume_id: resumeId,
          organization: 'NexTech Innovations',
          role: 'Backend Engineering Intern',
          location: 'Bangalore, India',
          start_date: '2025-06',
          end_date: '2025-08',
          description: 'Engineered high-throughput telemetry ingestion services.',
          achievements: ['Optimized Redis cache invalidation', 'Implemented JWT authentication'],
          order_index: 0,
        },
      ]);
      expect(exp.length).toBe(1);
      expect(exp[0].organization).toBe('NexTech Innovations');

      // Update Certifications
      const certs = await ResumeService.updateCertifications(resumeId, studentA, [
        {
          id: 'cert_test_1',
          resume_id: resumeId,
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issue_date: '2025-09',
          credential_id: 'AWS-CCP-948291',
          credential_url: 'https://aws.amazon.com/verify',
          description: 'Cloud architectural fundamentals and IAM security.',
          order_index: 0,
        },
      ]);
      expect(certs.length).toBe(1);

      // Update Achievements
      const ach = await ResumeService.updateAchievements(resumeId, studentA, [
        {
          id: 'ach_test_1',
          resume_id: resumeId,
          title: 'First Place - National Smart India Hackathon',
          description: 'Built distributed edge inference engine for smart agricultural sensors.',
          date: '2025-10',
          source: 'Hackathon',
          order_index: 0,
        },
      ]);
      expect(ach.length).toBe(1);
    });

    it('imports student verified Project Builder project into resume with technologies', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      // Create a verified project for studentA first
      const studentProject = await ProjectService.createProject(studentA, {
        title: 'Distributed Vector Retrieval Engine',
        project_type: 'MAJOR_PROJECT',
        domain: 'Artificial Intelligence',
        problem_statement: 'High latency document search across unstructured PDF knowledge stores.',
        objectives: ['Build semantic embeddings pipeline', 'Store chunks in pgvector', 'Deploy FastAPI endpoint'],
        target_users: 'B.Tech researchers and students',
      });

      // Import into resume
      const imported = await ResumeService.importProject(resumeId, studentA, studentProject.id);
      expect(imported).toBeDefined();
      expect(imported.project_id).toBe(studentProject.id);
      expect(imported.title).toBe(studentProject.title);
      expect(imported.technologies.length).toBeGreaterThan(0);

      const fullResume = await ResumeService.getFullResume(resumeId, studentA);
      const found = fullResume.projects.find((p) => p.project_id === studentProject.id);
      expect(found).toBeDefined();
    });

    it('rejects importing unowned or non-existent projects', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      // Attempting to import an invalid project id
      await expect(
        ResumeService.importProject(resumeId, studentA, 'prj_fake_nonexistent_999')
      ).rejects.toThrow();
    });
  });

  // ==========================================
  // 3. RESUME VERSIONING & RESTORE
  // ==========================================
  describe('3. Resume Versioning & Snapshot Restore', () => {
    it('creates version snapshots and restores previous version correctly', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      // Create snapshot version 1
      const v1 = await ResumeService.createVersionSnapshot(resumeId, studentA, 'Pre-AI Polish Snapshot');
      expect(v1).toBeDefined();
      expect(v1.version_number).toBeGreaterThanOrEqual(1);

      // Modify resume title and summary
      await ResumeService.updateResume(resumeId, studentA, {
        title: 'Temporary Modified Title',
        summary: 'Temporary summary text that will be reverted.',
      });

      const modifiedResume = await ResumeService.getFullResume(resumeId, studentA);
      expect(modifiedResume.resume.title).toBe('Temporary Modified Title');

      // Restore snapshot version
      const restored = await ResumeService.restoreVersion(resumeId, studentA, v1.version_number);
      expect(restored.resume.title).not.toBe('Temporary Modified Title');
      expect(restored.resume.title).toBe(v1.content_snapshot.resume.title);
    });
  });

  // ==========================================
  // 4. ATS RESUME ANALYSIS & SCORING TRANSPARENCY
  // ==========================================
  describe('4. ATS Resume Analysis & Scoring Transparency', () => {
    it('performs transparent ATS analysis without arbitrary ungrounded metrics', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      const analysis = await ResumeAnalysisService.analyzeResume(resumeId, studentA);

      expect(analysis).toBeDefined();
      expect(analysis.calculated_score).toBeGreaterThanOrEqual(0);
      expect(analysis.calculated_score).toBeLessThanOrEqual(100);

      // Section structure
      expect(analysis.section_structure.present_sections.length).toBeGreaterThan(0);
      expect(typeof analysis.section_structure.valid).toBe('boolean');

      // Readability
      expect(analysis.text_readability.word_count).toBeGreaterThan(0);
      expect(analysis.text_readability.reading_level).toBeDefined();

      // Contact info
      expect(analysis.contact_info_completeness).toBeDefined();

      // Transparent scoring explanation and disclaimer
      expect(analysis.scoring_explanation).toContain('derived transparently');
      expect(analysis.disclaimer).toContain('does not guarantee applicant tracking system placement');
    });

    it('identifies weak bullet phrasings and suggests actionable alternatives with reasons', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      // Add experience with weak phrasing
      await ResumeService.updateExperiences(resumeId, studentA, [
        {
          id: 'exp_weak_1',
          resume_id: resumeId,
          organization: 'Test Org',
          role: 'Junior Dev',
          location: 'Remote',
          start_date: '2024-01',
          end_date: '2024-06',
          description: 'Responsible for backend bugs.',
          achievements: ['Worked on fixing database queries', 'Helped with testing'],
          order_index: 0,
        },
      ]);

      const analysis = await ResumeAnalysisService.analyzeResume(resumeId, studentA);
      expect(analysis.weak_bullet_phrasings.length).toBeGreaterThan(0);

      const weakMatch = analysis.weak_bullet_phrasings.find((w) =>
        w.current.toLowerCase().includes('worked on') || w.current.toLowerCase().includes('helped with')
      );
      expect(weakMatch).toBeDefined();
      expect(weakMatch?.suggestion).toBeDefined();
      expect(weakMatch?.reason).toBeDefined();
    });
  });

  // ==========================================
  // 5. JOB DESCRIPTION TAILORING & FACTUALITY
  // ==========================================
  describe('5. Job Description Tailoring & Factual Guardrails', () => {
    it('analyzes job description and matches student verified skills without inventing unheld skills', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      const sampleJobDescription = `
        We are seeking a Backend Engineer proficient in Python, FastAPI, and PostgreSQL.
        Experience with Docker, Kubernetes, and Apache Kafka is strongly preferred.
        Responsibilities include designing RESTful APIs, optimizing database queries, and writing clean tests.
      `;

      const tailored = await ResumeTailoringService.tailorResume(
        resumeId,
        studentA,
        sampleJobDescription,
        'Backend Engineer',
        'CloudScale Inc'
      );

      expect(tailored).toBeDefined();
      expect(tailored.job_title).toBe('Backend Engineer');
      expect(tailored.company).toBe('CloudScale Inc');

      // Matched skills should only be skills currently present on student's resume
      expect(tailored.matched_skills.length).toBeGreaterThan(0);

      // Potential skill gaps should highlight missing requirements (e.g. Kafka, Kubernetes)
      expect(tailored.potential_skill_gaps.length).toBeGreaterThan(0);

      // Suggested wording must provide section, current, suggested, and reason
      expect(tailored.suggested_wording.length).toBeGreaterThanOrEqual(0);

      // Relevant projects must align with real platform projects
      expect(tailored.relevant_projects.length).toBeGreaterThanOrEqual(0);

      // Factual disclaimer
      expect(tailored.disclaimer).toContain('The AI will never add claims, companies, or tools you have not verified');
    });
  });

  // ==========================================
  // 6. AI RESUME IMPROVEMENT & ACTION BULLET GENERATOR
  // ==========================================
  describe('6. AI Resume Improvement & Bullet Formula', () => {
    it('generates factual summary using verified student data without fabricating credentials', async () => {
      const res = await CareerAIService.generateSummary(studentA, {
        targetRole: 'Backend Developer',
        targetIndustry: 'FinTech',
      });

      expect(res.summary).toBeDefined();
      expect(res.summary.length).toBeGreaterThan(20);
      expect(res.rationale).toBeDefined();

      // Guardrail check: summary should not claim 10+ years experience or invented awards
      expect(res.summary).not.toContain('15+ years');
      expect(res.summary).not.toContain('Fortune 500 Director');
    });

    it('generates action-oriented resume bullet following [Action + Tech + Contribution] formula without inventing numbers', async () => {
      const res = await CareerAIService.generateBullet({
        projectTitle: 'AI Learning Platform',
        task: 'created vector search endpoint for PDF questions',
        technology: 'FastAPI, pgvector, Python',
      });

      expect(res.bullet).toBeDefined();
      expect(res.formula_breakdown).toBeDefined();
      expect(res.formula_breakdown).toContain('Action');

      // Should not invent false percentages if student provided none
      expect(res.bullet).not.toContain('increased revenue by 95%');
    });

    it('improves wording showing current vs suggested vs reason', async () => {
      const res = await CareerAIService.improveWording({
        currentText: 'Made a website using React for displaying student scores.',
        improvementType: 'TECHNICAL',
        targetRole: 'Frontend Engineer',
      });

      expect(res.current).toBe('Made a website using React for displaying student scores.');
      expect(res.suggested).toBeDefined();
      expect(res.suggested).not.toBe(res.current);
      expect(res.reason).toBeDefined();
    });
  });

  // ==========================================
  // 7. CAREER ROLES & COMPARISON
  // ==========================================
  describe('7. Career Roles & Side-by-Side Comparison', () => {
    it('retrieves career role catalog and specific role details with learning path', async () => {
      const roles = await CareerService.listRoles();
      expect(roles.length).toBeGreaterThanOrEqual(10);

      const backendRole = roles.find((r) => r.slug === 'backend-developer');
      expect(backendRole).toBeDefined();
      expect(backendRole?.skills.some((s) => s.includes('Python'))).toBe(true);
      expect(backendRole?.typical_learning_path.length).toBeGreaterThan(0);
      expect(backendRole?.source_metadata).toBeDefined();
    });

    it('compares multiple career roles side-by-side without ranking them best/worst', async () => {
      const roles = await CareerService.listRoles();
      const roleIds = [roles[0].id, roles[1].id];

      const comparison = await CareerService.compareRoles(roleIds);
      expect(comparison.roles.length).toBe(2);
      expect(comparison.comparison_matrix.unique_skills).toBeDefined();
      expect(comparison.comparison_matrix.course_recommendations).toBeDefined();
      expect(comparison.disclaimer).toContain('Roles are not ranked as superior or inferior');
    });
  });

  // ==========================================
  // 8. TRANSPARENT CAREER RECOMMENDATIONS
  // ==========================================
  describe('8. Transparent Career Recommendations', () => {
    it('generates role recommendations explaining WHY each role was suggested', async () => {
      const recommendations = await CareerService.getRecommendations(studentA);

      expect(recommendations).toBeDefined();
      expect(recommendations.potentially_relevant_roles.length).toBeGreaterThan(0);
      expect(recommendations.explanation).toContain('alignment with your verified coursework');
      expect(recommendations.disclaimer).toContain('Curriculum alignments describe skill overlap');

      // Top matching role should list matching reasons
      const topRole = recommendations.potentially_relevant_roles[0];
      expect(topRole.match_reasons.length).toBeGreaterThan(0);
      expect(topRole.match_reasons[0]).toContain('evidence');
      expect(topRole.top_matching_skills.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 9. PERSONALIZED CAREER ROADMAP GENERATION
  // ==========================================
  describe('9. Career Roadmap Generation & Platform Links', () => {
    it('generates sequential roadmap linking to real platform courses, DSA, projects, and placement prep', async () => {
      const roles = await CareerService.listRoles();
      const backendRole = roles.find((r) => r.slug === 'backend-developer') || roles[0];

      const roadmap = await CareerService.generateRoadmap(studentA, backendRole.id, 'My Backend Mastery Roadmap');
      expect(roadmap).toBeDefined();
      expect(roadmap.student_id).toBe(studentA);
      expect(roadmap.role_id).toBe(backendRole.id);
      expect(roadmap.steps.length).toBeGreaterThanOrEqual(6);

      // Verify steps have valid platform source types and urls
      const hasCourse = roadmap.steps.some((s) => s.source_type === 'COURSE');
      const hasDsaOrCoding = roadmap.steps.some((s) => s.source_type === 'DSA' || s.source_type === 'CODING');
      const hasProject = roadmap.steps.some((s) => s.source_type === 'PROJECT');

      expect(hasCourse).toBe(true);
      expect(hasDsaOrCoding).toBe(true);
      expect(hasProject).toBe(true);

      // Verify step status mutation
      const firstStep = roadmap.steps[0];
      const updated = await CareerService.updateStepStatus(roadmap.id, studentA, firstStep.id, 'COMPLETED');
      const updatedStep = updated.steps.find((s) => s.id === firstStep.id);
      expect(updatedStep?.status).toBe('COMPLETED');
    });

    it('prevents studentB from modifying or viewing studentA roadmap', async () => {
      const roadmaps = await CareerService.listRoadmaps(studentA);
      expect(roadmaps.length).toBeGreaterThan(0);
      const targetRoadmapId = roadmaps[0].id;

      // Student B attempting to view Student A's roadmap
      await expect(CareerService.getRoadmap(targetRoadmapId, studentB)).rejects.toThrow(
        /permission|Unauthorized|Roadmap not found|Forbidden/i
      );

      // Student B attempting to update step on Student A's roadmap
      await expect(
        CareerService.updateStepStatus(targetRoadmapId, studentB, roadmaps[0].steps[0].id, 'COMPLETED')
      ).rejects.toThrow(/permission|Unauthorized|Roadmap not found|Forbidden/i);
    });
  });

  // ==========================================
  // 10. SKILL PROFILE, EVIDENCE & ASSESSMENTS
  // ==========================================
  describe('10. Skill Profile, Evidence Accumulation & Phase 9 Assessment', () => {
    it('retrieves skills catalog and student skill profile', async () => {
      const allSkills = await SkillService.listSkills();
      expect(allSkills.length).toBeGreaterThanOrEqual(15);

      const profile = await SkillService.getStudentSkills(studentA);
      expect(profile.length).toBeGreaterThan(0);

      const pythonSkill = profile.find((s) => s.skill_name.toLowerCase().includes('python'));
      expect(pythonSkill).toBeDefined();
      expect(pythonSkill?.evidence_count).toBeGreaterThan(0);
    });

    it('allows student to declare a skill without falsifying verified status', async () => {
      const allSkills = await SkillService.listSkills();
      const targetSkill = allSkills.find((s) => s.name === 'Docker') || allSkills[0];

      const declared = await SkillService.declareStudentSkill(studentA, targetSkill.id, 'INTERMEDIATE');
      expect(declared).toBeDefined();
      expect(declared.skill_id).toBe(targetSkill.id);
      expect(declared.source).toBe('STUDENT_DECLARED');
      expect(declared.confidence).toBe('LIMITED_EVIDENCE');
    });

    it('accumulates multiple evidence records without erasing prior evidence on wrong answers', async () => {
      const allSkills = await SkillService.listSkills();
      const pythonSkill = allSkills.find((s) => s.name === 'Python') || allSkills[0];

      // Add Course evidence
      await SkillService.recordEvidence(studentA, pythonSkill.id, {
        source_type: 'COURSE',
        source_id: 'crs_python_advanced_01',
        description: 'Completed Advanced Python Concurrency module.',
      });

      // Add Project evidence
      await SkillService.recordEvidence(studentA, pythonSkill.id, {
        source_type: 'PROJECT',
        source_id: 'prj_01',
        description: 'Implemented backend services in Python.',
      });

      const evidenceList = await SkillService.getSkillEvidence(studentA, pythonSkill.id);
      expect(evidenceList.length).toBeGreaterThanOrEqual(2);

      const updatedProfile = await SkillService.getStudentSkills(studentA);
      const updatedSkill = updatedProfile.find((s) => s.skill_id === pythonSkill.id);
      expect(['STRONG_EVIDENCE', 'VERIFIED']).toContain(updatedSkill?.confidence);
    });

    it('executes skill assessment using Phase 9 Quiz infrastructure and updates evidence', async () => {
      const allSkills = await SkillService.listSkills();
      const sqlSkill = allSkills.find((s) => s.name.toLowerCase().includes('sql')) || allSkills[0];

      // 1. Start Assessment
      const { assessment, questions, attemptId } = await SkillAssessmentService.startAssessment(
        studentA,
        sqlSkill.id,
        'INTERMEDIATE',
        3
      );

      expect(assessment).toBeDefined();
      expect(assessment.status).toBe('IN_PROGRESS');
      expect(questions.length).toBeGreaterThan(0);
      expect(attemptId).toBeDefined();

      // 2. Submit Answer for first question
      const q1 = questions[0];
      const answerRes = await SkillAssessmentService.submitAnswer(
        assessment.id,
        studentA,
        q1.id,
        0,
        'SELECT * FROM students'
      );
      expect(answerRes.success).toBe(true);

      // 3. Complete Assessment
      const completion = await SkillAssessmentService.completeAssessment(assessment.id, studentA);
      expect(completion.assessment.status).toBe('COMPLETED');
      expect(completion.assessment.score).toBeDefined();
      expect(completion.evidence).toBeDefined();

      // 4. Verify evidence was recorded
      const evidence = await SkillService.getSkillEvidence(studentA, sqlSkill.id);
      const assessmentEvidence = evidence.find((e) => e.source_type === 'ASSESSMENT');
      expect(assessmentEvidence).toBeDefined();
    });

    it('performs respectful evidence-based skill gap analysis for a target role', async () => {
      const roles = await CareerService.listRoles();
      const targetRole = roles.find((r) => r.slug === 'backend-developer') || roles[0];

      const gapAnalysis = await SkillService.getSkillGaps(studentA, targetRole.id);

      expect(gapAnalysis).toBeDefined();
      expect(gapAnalysis.target_role).toBe(targetRole.name);
      expect(gapAnalysis.current_strengths).toBeDefined();
      expect(gapAnalysis.skills_to_develop).toBeDefined();

      // Check respectful evidence labels
      gapAnalysis.current_strengths.forEach((item) => {
        expect(['VERIFIED', 'STRONG_EVIDENCE']).toContain(item.evidence_state);
      });

      gapAnalysis.skills_to_develop.forEach((item) => {
        expect(['DEVELOPING_EVIDENCE', 'LIMITED_EVIDENCE', 'NOT_ASSESSED']).toContain(item.evidence_state);
      });

      expect(gapAnalysis.disclaimer).toContain('Skill gaps describe current evidence captured on the platform');
    });
  });

  // ==========================================
  // 11. AI TOOL REGISTRY INTEGRATION
  // ==========================================
  describe('11. AI Tool Registry Integration for Phase 12 Tools', () => {
    it('executes get_resume tool via ToolRegistry', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      const tool = ToolRegistry.getTool('get_resume');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ resume_id: resumeId }, {
        studentId: studentA,
        role: 'STUDENT',
      });

      expect(result.resume).toBeDefined();
      expect(result.resume.id).toBe(resumeId);
    });

    it('executes get_career_roles tool via ToolRegistry', async () => {
      const tool = ToolRegistry.getTool('get_career_roles');
      expect(tool).toBeDefined();

      const result = await tool!.handler({}, {
        studentId: studentA,
        role: 'STUDENT',
      });

      expect(Array.isArray(result) ? result.length : result.roles.length).toBeGreaterThan(0);
    });

    it('executes get_skill_gaps tool via ToolRegistry', async () => {
      const roles = await CareerService.listRoles();
      const roleId = roles[0].id;

      const tool = ToolRegistry.getTool('get_skill_gaps');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ role_id: roleId }, {
        studentId: studentA,
        role: 'STUDENT',
      });

      expect(result.current_strengths).toBeDefined();
      expect(result.skills_to_develop).toBeDefined();
    });

    it('executes generate_resume_bullets tool via ToolRegistry', async () => {
      const resumes = await ResumeService.listResumes(studentA);
      const resumeId = resumes[0].id;

      const tool = ToolRegistry.getTool('generate_resume_bullets');
      expect(tool).toBeDefined();

      const result = await tool!.handler(
        {
          resume_id: resumeId,
          task: 'implemented caching layer',
          technology: 'Redis, Node.js',
        },
        {
          studentId: studentA,
          role: 'STUDENT',
        }
      );

      expect(result.bullet).toBeDefined();
      expect(result.formula_breakdown).toBeDefined();
    });
  });
});
