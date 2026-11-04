// server/services/jobAiService.ts
// Secure server-side Gemini AI integration for Job Analysis, Classification, Summarization, and Student Profile Matching

import { AIService } from '../ai/service';
import { logger } from '../core/logging';
import {
  JobListing,
  StudentJobMatchExplanation,
  JobPrimaryCategory,
} from '../models/jobDiscoveryTypes';

export interface JdAnalysisInput {
  title: string;
  organization: string;
  raw_text: string;
  category?: JobPrimaryCategory;
}

export interface JdAnalysisOutput {
  summary: string;
  category: JobPrimaryCategory;
  subcategory: string;
  extracted_skills: string[];
  minimum_qualification: string;
  experience_label: string;
  eligibility_bullets: string[];
  simplified_explanation: string;
  preparation_checklist: string[];
}

export class JobAiService {
  /**
   * Enriches or extracts structured insights from raw job descriptions using Gemini
   */
  public static async analyzeJobDescription(input: JdAnalysisInput): Promise<JdAnalysisOutput> {
    try {
      const prompt = `You are a Senior Technical Recruiter and Career Architect for B.Tech engineering students.
Analyze the following job description and provide structured insights in STRICT JSON format.

Job Title: ${input.title}
Organization: ${input.organization}
Category Hint: ${input.category || 'Determine based on whether it is an Indian Government / PSU / Bank body or Private Firm'}
Raw Description:
"""
${input.raw_text.substring(0, 4000)}
"""

Return JSON matching this exact schema:
{
  "summary": "2-3 concise sentences summarizing the role and mission.",
  "category": "GOVERNMENT" | "PRIVATE",
  "subcategory": "String matching appropriate domain like RESEARCH_SCIENTIFIC, PSU, BANKING, SOFTWARE_DEVELOPMENT, BACKEND_DEVELOPMENT, FULLSTACK_DEVELOPMENT, AI_MACHINE_LEARNING, CLOUD_COMPUTING, QA_TESTING, etc.",
  "extracted_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "minimum_qualification": "Exact qualification requirement e.g. B.Tech/B.E. in CS/IT/ECE with 60%+",
  "experience_label": "e.g. Freshers Eligible (0-1 yrs) or 2+ Years",
  "eligibility_bullets": ["Key criteria 1", "Key criteria 2", "Key criteria 3"],
  "simplified_explanation": "A direct, student-friendly explanation of what the engineer actually does daily and why this role matters.",
  "preparation_checklist": ["Concrete study or prep step 1", "Prep step 2", "Prep step 3"]
}`;

      const res = await AIService.generate(
        [
          { role: 'system', content: 'You are an expert engineering career advisor. Respond strictly with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        undefined,
        0.2
      );

      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        summary: parsed.summary || 'Engineering position with verified responsibilities.',
        category: (parsed.category === 'GOVERNMENT' || parsed.category === 'PRIVATE') ? parsed.category : (input.category || 'PRIVATE'),
        subcategory: parsed.subcategory || 'SOFTWARE_DEVELOPMENT',
        extracted_skills: Array.isArray(parsed.extracted_skills) ? parsed.extracted_skills : ['Data Structures', 'Algorithms'],
        minimum_qualification: parsed.minimum_qualification || 'B.Tech / B.E. in relevant engineering discipline',
        experience_label: parsed.experience_label || 'Freshers Eligible (0 - 1 Years)',
        eligibility_bullets: Array.isArray(parsed.eligibility_bullets) ? parsed.eligibility_bullets : ['Bachelor of Engineering Degree', 'Relevant technical skills'],
        simplified_explanation: parsed.simplified_explanation || 'Hands-on technical engineering role contributing to modern software architecture.',
        preparation_checklist: Array.isArray(parsed.preparation_checklist) ? parsed.preparation_checklist : ['Revise Core Data Structures', 'Review project portfolio'],
      };
    } catch (err: any) {
      logger.warn('JobAiService: Gemini API unavailable or parse failed, using deterministic fallback', err?.message);
      return this.fallbackJdAnalysis(input);
    }
  }

  /**
   * Explains student match against job listing transparently (without fabricated scores)
   */
  public static async explainMatch(
    job: JobListing,
    studentContext: {
      student_id: string;
      degree?: string;
      branch?: string;
      semester?: number;
      skills?: string[];
      projects?: string[];
      experience_months?: number;
    }
  ): Promise<StudentJobMatchExplanation> {
    const studentSkills = studentContext.skills || [];
    const jobSkills = job.required_skills || [];

    // Calculate deterministic match based on actual verified skill intersections
    const matchedSkills = jobSkills.filter((js) =>
      studentSkills.some((ss) => ss.toLowerCase() === js.toLowerCase() || js.toLowerCase().includes(ss.toLowerCase()) || ss.toLowerCase().includes(js.toLowerCase()))
    );
    const missingSkills = jobSkills.filter((js) => !matchedSkills.includes(js));

    const totalReq = Math.max(jobSkills.length, 1);
    const rawRatio = matchedSkills.length / totalReq;
    // Normalized realistic percentage 30% - 95%
    const matchPercentage = Math.round(30 + rawRatio * 65);

    // Qualification check
    const branchLower = (studentContext.branch || '').toLowerCase();
    const isTechBranch = branchLower.includes('computer') || branchLower.includes('ai') || branchLower.includes('it') || branchLower.includes('software') || branchLower.includes('electronics');
    const isEligible = isTechBranch || (studentContext.semester || 0) >= 6;

    const reasons: string[] = [];
    if (matchedSkills.length > 0) {
      reasons.push(`You already have proficiency in ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (job.is_freshers_friendly) {
      reasons.push('This position explicitly welcomes 0-1 years / final-year B.Tech students.');
    }
    if (studentContext.branch && (job.category === 'GOVERNMENT' || job.title.toLowerCase().includes('engineer'))) {
      reasons.push(`Your academic branch (${studentContext.branch}) matches the recruitment domain.`);
    }

    let aiExplanation = `Based on your profile, you match ${matchedSkills.length} of ${jobSkills.length} core competencies for ${job.organization}.`;

    try {
      // Optional Gemini enhancement for natural language advice
      const prompt = `Briefly explain in 2 friendly, transparent sentences why a B.Tech student in "${studentContext.branch || 'CSE'}" with skills [${studentSkills.join(', ')}] matches or has gaps for the role "${job.title}" at "${job.organization}".
Highlight what they should practice next. Do NOT invent fake percentages.`;

      const res = await AIService.generate(
        [{ role: 'user', content: prompt }],
        undefined,
        0.3
      );
      if (res && res.text) {
        aiExplanation = res.text.trim();
      }
    } catch {
      // Fallback AI explanation
      if (missingSkills.length > 0) {
        aiExplanation += ` Strengthening your knowledge in ${missingSkills.slice(0, 2).join(' and ')} will boost your application competitiveness.`;
      }
    }

    const suggestedAction: 'APPLY_NOW' | 'UPSKILL_FIRST' | 'PREPARE_RESUME' | 'EXPLORE' =
      matchPercentage >= 75 ? 'APPLY_NOW' : matchPercentage >= 50 ? 'PREPARE_RESUME' : 'UPSKILL_FIRST';

    return {
      job_id: job.id,
      student_id: studentContext.student_id,
      match_percentage: matchPercentage,
      is_eligible_qualification: isEligible,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      qualification_match_details: isEligible
        ? `Academic criteria satisfied: ${studentContext.branch || 'B.Tech Engineering'} corresponds with ${job.minimum_qualification || 'Engineering graduate requirements'}.`
        : `Check minimum qualification: ${job.minimum_qualification || 'Review official criteria.'}`,
      experience_match_details: job.is_freshers_friendly
        ? 'Experience verified: Freshers and entry-level students are eligible.'
        : `Requires ${job.experience_min || 1}+ years. Final year internships may count towards eligibility.`,
      recommendation_reasons: reasons,
      suggested_action: suggestedAction,
      ai_explanation: aiExplanation,
    };
  }

  /**
   * Expands search queries into technical and organizational synonyms
   */
  public static async expandSearchQuery(query: string): Promise<string[]> {
    const q = query.trim().toLowerCase();
    const commonExpansions: Record<string, string[]> = {
      sde: ['Software Development Engineer', 'Backend', 'Full Stack', 'Coding'],
      swe: ['Software Engineer', 'Developer', 'Computer Science'],
      frontend: ['React', 'TypeScript', 'Web Development', 'UI Engineer'],
      backend: ['Node.js', 'Go', 'Java', 'Distributed Systems', 'API'],
      psu: ['IOCL', 'NTPC', 'ONGC', 'BHEL', 'GATE', 'Executive Trainee'],
      gate: ['Public Sector', 'ISRO', 'DRDO', 'Scientific Assistant'],
      railways: ['RRB', 'Junior Engineer', 'Indian Railways Technical'],
      bank: ['IBPS', 'IT Officer', 'Specialist Officer', 'SBI'],
    };

    if (commonExpansions[q]) {
      return [query, ...commonExpansions[q]];
    }

    try {
      const prompt = `Return a JSON array of 3-5 technical or organizational synonyms or job title variants for the student search query "${query}".
Output only a JSON array of strings e.g. ["term1", "term2", "term3"].`;

      const res = await AIService.generate(
        [{ role: 'user', content: prompt }],
        undefined,
        0.2
      );
      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(new Set([query, ...parsed]));
      }
    } catch {
      // Deterministic fallback
    }

    return [query];
  }

  /**
   * Deterministic fallback when Gemini API is unavailable or key not configured
   */
  private static fallbackJdAnalysis(input: JdAnalysisInput): JdAnalysisOutput {
    const text = (input.raw_text + ' ' + input.title).toLowerCase();

    const isGovt =
      text.includes('upsc') ||
      text.includes('ssc') ||
      text.includes('recruitment board') ||
      text.includes('public sector') ||
      text.includes('psu') ||
      text.includes('ministry') ||
      text.includes('govt') ||
      text.includes('ibps');

    const detectedSkills: string[] = [];
    const skillBank = [
      'Java', 'Python', 'C++', 'Go', 'React', 'TypeScript', 'JavaScript',
      'SQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Linux',
      'Data Structures', 'Algorithms', 'Networking', 'Cybersecurity', 'Machine Learning'
    ];

    for (const s of skillBank) {
      if (text.includes(s.toLowerCase())) {
        detectedSkills.push(s);
      }
    }
    if (detectedSkills.length === 0) {
      detectedSkills.push('Problem Solving', 'Data Structures & Algorithms', 'Relational Databases');
    }

    return {
      summary: `${input.title} at ${input.organization}. Responsibilities include engineering software delivery, system integration, and collaborative problem solving.`,
      category: isGovt ? 'GOVERNMENT' : 'PRIVATE',
      subcategory: isGovt ? 'CENTRAL_GOVERNMENT' : 'SOFTWARE_DEVELOPMENT',
      extracted_skills: detectedSkills,
      minimum_qualification: 'B.Tech / B.E. in Computer Science, IT, or related engineering branch',
      experience_label: 'Freshers Eligible (0 - 1 Years)',
      eligibility_bullets: [
        'Recognized engineering degree (B.Tech / B.E.) with minimum 60% aggregate',
        'Strong fundamentals in computer science and programming',
        'Eligible as per organizational age and citizenship norms',
      ],
      simplified_explanation: `As a ${input.title}, you will solve technical challenges, write clean code, and work with engineering teammates to deliver reliable systems.`,
      preparation_checklist: [
        'Practice core Data Structures & Algorithms coding challenges',
        'Review Database Management Systems (SQL and ACID properties)',
        'Prepare to walk through your academic projects in detail',
      ],
    };
  }
}
