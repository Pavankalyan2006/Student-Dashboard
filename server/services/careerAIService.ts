import { AIService } from '../ai/service';
import { db } from '../db/database';
import { logger } from '../core/logging';

export class CareerAIService {
  /**
   * Generate an accurate, non-hallucinated Professional Summary based on real platform state
   */
  public static async generateSummary(
    studentId: string,
    inputs: {
      targetRole: string;
      targetIndustry?: string;
      verifiedSkills?: string[];
      topProjects?: string[];
    }
  ): Promise<{ summary: string; rationale: string }> {
    const student = await db.getStudentById(studentId);
    const studentSkills = await db.getStudentSkills(studentId);
    const skillNames = inputs.verifiedSkills || studentSkills.map((s) => s.skill_name);
    const projects = await db.getProjects(studentId);
    const projectNames = inputs.topProjects || projects.map((p) => p.title);

    const prompt = `You are a professional technical resume writer for collegiate engineering students.
Generate a concise, ATS-friendly professional summary (2 to 3 sentences, 40-70 words) for a B.Tech student targeting the role of "${inputs.targetRole}".

CRITICAL FACTUALITY RULES:
1. NEVER invent employment history, internships, company names, or job titles.
2. NEVER invent numerical metrics (e.g. "improved speed by 40%", "handled 100,000 requests") unless explicitly verified.
3. ONLY reference the verified skills and project themes listed below.
4. Keep the tone humble, technical, and achievement-focused based on academic and project building.

Verified Context:
- Student Branch: ${student?.branch || 'Computer Science'}
- Target Role: ${inputs.targetRole}
- Target Industry: ${inputs.targetIndustry || 'Software Engineering'}
- Verified Skills: ${skillNames.slice(0, 6).join(', ') || 'Software Development, Problem Solving'}
- Verified Projects: ${projectNames.slice(0, 2).join(', ') || 'Academic Coursework & Projects'}

Output valid JSON only with keys:
{
  "summary": "...",
  "rationale": "..."
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const cleaned = response.text.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.summary) {
        return {
          summary: parsed.summary,
          rationale: parsed.rationale || 'Tailored to target role using verified platform skills and projects.',
        };
      }
    } catch (err: any) {
      logger.warn('AI summary generation fallback triggered', { error: err.message });
    }

    // High quality deterministic fallback
    const skillsList = skillNames.slice(0, 4).join(', ') || 'modern software development';
    return {
      summary: `Motivated ${student?.branch || 'Computer Science'} student targeting ${inputs.targetRole} opportunities. Demonstrates practical technical foundation in ${skillsList} through hands-on project engineering and disciplined computer science coursework. Eager to contribute high-quality code and collaborative problem-solving to technical teams.`,
      rationale: 'Generated using strictly verified student profile, branch, and recorded skills without unverified metrics.',
    };
  }

  /**
   * Generate an ATS-friendly bullet point using:
   * Action Verb + Technology + Actual Contribution + Outcome (only if student provided)
   */
  public static async generateBullet(inputs: {
    projectTitle?: string;
    task: string;
    technology?: string;
    outcome?: string;
  }): Promise<{ bullet: string; formula_breakdown: string }> {
    const prompt = `You are a resume bullet generator for software engineers.
Generate a single strong resume bullet point adhering strictly to this formula:
[Strong Action Verb] + [Specific Technology] + [Actual Technical Contribution] + [Verified Outcome]

CRITICAL RULES:
1. DO NOT invent fake metrics (percentages, dollar amounts, user counts). If no outcome is provided, do NOT fabricate one.
2. Focus on engineering precision (architecture, type-safety, caching, testing, schema design).

Inputs:
- Project: ${inputs.projectTitle || 'Software Project'}
- Task / Description: ${inputs.task}
- Technology: ${inputs.technology || 'Core stack'}
- Outcome provided by student: ${inputs.outcome || 'None'}

Output JSON only with keys:
{
  "bullet": "...",
  "formula_breakdown": "Action + Tech + Contribution"
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const cleaned = response.text.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.bullet) {
        return {
          bullet: parsed.bullet,
          formula_breakdown: parsed.formula_breakdown || 'Action + Technology + Contribution',
        };
      }
    } catch {
      // Fallback
    }

    const techPart = inputs.technology ? `using ${inputs.technology}` : '';
    const outcomePart = inputs.outcome ? ` to ${inputs.outcome}` : '';
    return {
      bullet: `Engineered ${inputs.task} ${techPart}${outcomePart}, ensuring clean modular structure and reliable error handling.`,
      formula_breakdown: 'Action (Engineered) + Task + Tech + Outcome',
    };
  }

  /**
   * Improve phrasing of an existing bullet or section
   */
  public static async improveWording(inputs: {
    currentText: string;
    improvementType: 'CONCISE' | 'TECHNICAL' | 'ACHIEVEMENT' | 'GRAMMAR' | 'ROLE_ALIGNMENT';
    targetRole?: string;
  }): Promise<{ current: string; suggested: string; reason: string }> {
    const current = inputs.currentText.trim();
    if (!current) {
      return {
        current: '',
        suggested: '',
        reason: 'Empty text provided',
      };
    }

    const prompt = `You are an expert technical resume editor.
Improve the following resume bullet or sentence.
Improvement Goal: ${inputs.improvementType}
Target Role: ${inputs.targetRole || 'Software Engineer'}

Original Text:
"${current}"

CRITICAL RULE:
NEVER invent metrics, percentages, user numbers, or company names that were not in the original text.
Keep factual integrity. Replace passive verbs with decisive engineering actions.

Output JSON only:
{
  "current": "${current.replace(/"/g, '\\"')}",
  "suggested": "...",
  "reason": "..."
}`;

    try {
      const response = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.3
      );
      const cleaned = response.text.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.suggested) {
        return {
          current,
          suggested: parsed.suggested,
          reason: parsed.reason || `Enhanced for ${inputs.improvementType.toLowerCase()} clarity.`,
        };
      }
    } catch {
      // Fallback
    }

    // Deterministic fallback improvements
    let suggested = current;
    let reason = 'Refined sentence structure and strengthened action verb.';

    if (inputs.improvementType === 'CONCISE') {
      suggested = current.replace(/in order to/gi, 'to').replace(/as well as/gi, 'and').replace(/responsible for/gi, 'spearheaded');
      reason = 'Eliminated redundant filler phrases for brevity.';
    } else if (inputs.improvementType === 'TECHNICAL') {
      suggested = current.replace(/made a website/gi, 'developed a responsive web application')
                         .replace(/worked on backend/gi, 'engineered server-side REST APIs')
                         .replace(/stored data/gi, 'modeled relational database schema');
      reason = 'Replaced colloquial terms with standard engineering nomenclature.';
    } else {
      suggested = current.replace(/^(helped|worked on|did)/i, 'Developed');
      reason = 'Replaced weak opener with an active engineering verb.';
    }

    return {
      current,
      suggested,
      reason,
    };
  }
}
