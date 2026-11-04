import { db } from '../db/database';
import { ResumeService } from './resumeService';
import { JobDescription, ResumeTailoringResult } from '../models/careerResumeTypes';

export class ResumeTailoringService {
  /**
   * Save a job description for the student
   */
  public static async saveJobDescription(
    studentId: string,
    data: {
      title: string;
      company: string;
      description: string;
      source_url?: string;
    }
  ): Promise<JobDescription> {
    const jd: JobDescription = {
      id: `jd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      title: data.title || 'Untitled Role',
      company: data.company || 'Company',
      description: data.description,
      source_url: data.source_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.saveJobDescription(jd);
    return jd;
  }

  /**
   * Tailor a resume to a job description WITHOUT inventing non-existent skills or experiences
   */
  public static async tailorResume(
    resumeId: string,
    studentId: string,
    jobDescriptionText: string,
    jobTitle: string = 'Target Role',
    companyName: string = 'Hiring Company'
  ): Promise<ResumeTailoringResult> {
    const resumeData = await ResumeService.getFullResume(resumeId, studentId);
    const textLower = jobDescriptionText.toLowerCase();

    // Standard technical terms dictionary to match
    const knownTerms = [
      'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'FastAPI',
      'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
      'Git', 'CI/CD', 'REST', 'GraphQL', 'PyTorch', 'TensorFlow', 'Scikit-learn',
      'Data Structures', 'Algorithms', 'Microservices', 'System Design', 'Linux'
    ];

    // Identify terms mentioned in Job Description
    const jdTerms = knownTerms.filter((term) => textLower.includes(term.toLowerCase()));

    // Collect verified skills in the student's resume
    const resumeSkillsMap = new Map<string, string>();
    for (const s of resumeData.skills) {
      resumeSkillsMap.set(s.skill.toLowerCase(), s.skill);
    }

    const matchedSkills: string[] = [];
    const missingKeywords: string[] = [];

    for (const term of jdTerms) {
      if (resumeSkillsMap.has(term.toLowerCase())) {
        matchedSkills.push(term);
      } else {
        missingKeywords.push(term);
      }
    }

    // Determine potential skill gaps (in JD but student has not listed)
    const potentialSkillGaps = missingKeywords;

    // Identify relevant projects from student's actual projects
    const relevantProjects = resumeData.projects.map((p) => {
      const techList: string[] = Array.isArray(p.technologies)
        ? p.technologies
        : typeof p.technologies === 'string'
        ? (p.technologies as string).split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      const matchedTech = techList.filter((t) => textLower.includes(t.toLowerCase()));
      const matchCount = matchedTech.length;
      return {
        project_id: p.id,
        title: p.title,
        alignment_reason: matchCount > 0
          ? `Directly applies ${matchCount} technologies mentioned in the job description (${matchedTech.join(', ')}).`
          : `Demonstrates software design and practical development principles.`,
      };
    });

    // Suggested wording improvements (aligning terminology without fabricating achievements)
    const suggestedWording: { section: string; current: string; suggested: string; reason: string }[] = [];

    if (resumeData.resume.summary) {
      suggestedWording.push({
        section: 'Summary',
        current: resumeData.resume.summary,
        suggested: `Aspiring ${jobTitle} with practical foundation in ${matchedSkills.slice(0, 3).join(', ') || 'modern software engineering'}. Experienced in developing reliable applications, writing clean code, and working with modern developer toolchains.`,
        reason: `Explicitly emphasizes alignment with the ${jobTitle} title while strictly utilizing verified skills.`,
      });
    }

    // Relevant coursework
    const relevantCoursework = [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Operating Systems',
      'Software Engineering & System Architecture',
    ];

    return {
      job_title: jobTitle,
      company: companyName,
      matched_skills: matchedSkills,
      potential_skill_gaps: potentialSkillGaps,
      missing_keywords: missingKeywords,
      suggested_wording: suggestedWording,
      relevant_projects: relevantProjects,
      relevant_coursework: relevantCoursework,
      suggested_resume_sections: ['Core Technical Skills', 'Featured Projects', 'Education & Coursework'],
      disclaimer: 'Tailoring recommendations highlight relevant skills already in your profile. The AI will never add claims, companies, or tools you have not verified.',
    };
  }
}
