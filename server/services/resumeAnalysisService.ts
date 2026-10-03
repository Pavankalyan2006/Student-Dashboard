import { ResumeService } from './resumeService';
import { ResumeAnalysisResult } from '../models/careerResumeTypes';

export class ResumeAnalysisService {
  /**
   * Perform comprehensive, transparent ATS and readability analysis
   */
  public static async analyzeResume(resumeId: string, studentId: string): Promise<ResumeAnalysisResult> {
    const data = await ResumeService.getFullResume(resumeId, studentId);
    const { resume, profile, education, skills, projects, experience, certifications, achievements } = data;

    // 1. Contact Info Completeness
    const missingContact: string[] = [];
    if (!profile?.full_name) missingContact.push('Full Name');
    if (!profile?.email) missingContact.push('Email Address');
    if (!profile?.phone) missingContact.push('Phone Number');
    if (!profile?.github_url && !profile?.linkedin_url) missingContact.push('GitHub or LinkedIn profile link');

    const contactComplete = missingContact.length === 0;

    // 2. Section Structure
    const presentSections: string[] = [];
    const missingSections: string[] = [];
    const structureSuggestions: string[] = [];

    if (profile?.full_name) presentSections.push('Contact Profile');
    else missingSections.push('Contact Profile');

    if (resume.summary?.trim()) presentSections.push('Professional Summary');
    else missingSections.push('Professional Summary');

    if (education.length > 0) presentSections.push('Education');
    else missingSections.push('Education');

    if (skills.length > 0) presentSections.push('Skills');
    else missingSections.push('Skills');

    if (projects.length > 0) presentSections.push('Projects');
    else missingSections.push('Projects');

    if (experience.length > 0) presentSections.push('Experience');
    if (certifications.length > 0) presentSections.push('Certifications');
    if (achievements.length > 0) presentSections.push('Achievements');

    if (missingSections.includes('Projects')) {
      structureSuggestions.push('Technical recruiters heavily evaluate practical projects. Link at least 1-2 projects from Project Builder.');
    }
    if (missingSections.includes('Education')) {
      structureSuggestions.push('Add your degree program, expected graduation year, and GPA/CGPA.');
    }
    if (missingSections.includes('Skills')) {
      structureSuggestions.push('Group skills into categories (e.g., Programming, Frameworks, Databases).');
    }

    // 3. Text Readability & Length
    let totalWords = 0;
    const allBulletTexts: string[] = [];

    if (resume.summary) {
      totalWords += resume.summary.split(/\s+/).filter(Boolean).length;
    }
    for (const edu of education) {
      if (edu.description) totalWords += edu.description.split(/\s+/).filter(Boolean).length;
    }
    for (const p of projects) {
      if (p.description_override) totalWords += p.description_override.split(/\s+/).filter(Boolean).length;
      for (const feat of p.highlighted_features || []) {
        totalWords += feat.split(/\s+/).filter(Boolean).length;
        allBulletTexts.push(feat);
      }
    }
    for (const exp of experience) {
      if (exp.description) totalWords += exp.description.split(/\s+/).filter(Boolean).length;
      for (const ach of exp.achievements || []) {
        totalWords += ach.split(/\s+/).filter(Boolean).length;
        allBulletTexts.push(ach);
      }
    }

    const readabilityIssues: string[] = [];
    let readabilityScore = 85;

    if (totalWords < 150) {
      readabilityIssues.push('Resume is brief (< 150 words). Expand on project technical architectures and responsibilities.');
      readabilityScore -= 20;
    } else if (totalWords > 800) {
      readabilityIssues.push('Resume is lengthy (> 800 words). Aim for a concise single-page layout for collegiate recruitment.');
      readabilityScore -= 15;
    }

    const readingLevel = totalWords > 250 ? 'Undergraduate / Professional (Standard)' : 'Brief Draft';

    // 4. Weak Bullet Phrasing Detection
    const weakPatterns = [
      { regex: /^(worked on|helped with|responsible for|made a|created a simple|did)/i, fix: 'Begin with strong action verbs (e.g., Developed, Engineered, Optimized, Designed).' },
      { regex: /tried to|attempted to/i, fix: 'State concrete contributions rather than tentative phrasing.' },
      { regex: /etc\.|and so on/i, fix: 'Avoid ambiguous terms like "etc."; explicitly name tools and frameworks.' },
    ];

    const weakBulletPhrasings: { current: string; suggestion: string; reason: string }[] = [];

    for (const bullet of allBulletTexts) {
      for (const wp of weakPatterns) {
        if (wp.regex.test(bullet.trim())) {
          let suggestion = bullet.replace(/^(worked on|helped with|responsible for)/i, 'Engineered');
          suggestion = suggestion.replace(/^(made a|created a simple)/i, 'Developed a');
          weakBulletPhrasings.push({
            current: bullet,
            suggestion: suggestion,
            reason: wp.fix,
          });
          break;
        }
      }
    }

    // 5. Keyword Coverage
    const standardKeywords = [
      'Python', 'JavaScript', 'TypeScript', 'React', 'SQL', 'PostgreSQL', 'Docker',
      'Git', 'REST API', 'Data Structures', 'Algorithms', 'Testing', 'Linux', 'Database'
    ];
    const presentKeywords = new Set<string>();
    const resumeTextLower = JSON.stringify(data).toLowerCase();

    for (const kw of standardKeywords) {
      if (resumeTextLower.includes(kw.toLowerCase())) {
        presentKeywords.add(kw);
      }
    }

    const foundKeywords = Array.from(presentKeywords);
    const missingKeywords = standardKeywords.filter((kw) => !presentKeywords.has(kw));
    const coveragePercentage = Math.round((foundKeywords.length / standardKeywords.length) * 100);

    // 6. Formatting Consistency
    const formattingIssues: string[] = [];
    const formattingSuggestions: string[] = [];

    // Check date consistency in education & experience
    const allDates = [
      ...education.map((e) => e.start_date),
      ...education.map((e) => e.end_date),
      ...experience.map((e) => e.start_date),
      ...experience.map((e) => e.end_date),
    ].filter(Boolean);

    const hasStandardDates = allDates.every((d) => /^\d{4}(-\d{2})?$/.test(d) || d.toLowerCase() === 'present');
    if (!hasStandardDates && allDates.length > 0) {
      formattingIssues.push('Inconsistent date formats detected across education or experience entries.');
      formattingSuggestions.push('Use uniform YYYY-MM or Year notations (e.g., "2024-05" or "2024").');
    }

    // 7. Role Alignment
    const targetRole = resume.target_role || 'Software Engineer';
    const roleAlignmentNotes: string[] = [];
    const roleRecommendations: string[] = [];
    let alignmentPercentage = 75;

    if (skills.length >= 5) {
      roleAlignmentNotes.push(`Your resume contains ${skills.length} technical skills aligned with modern software engineering.`);
    } else {
      roleRecommendations.push('Add more foundational technologies matching your target role.');
      alignmentPercentage -= 15;
    }

    if (projects.length >= 2) {
      roleAlignmentNotes.push('Multiple projects demonstrate practical application of engineering tools.');
      alignmentPercentage += 10;
    } else {
      roleRecommendations.push('Aim for at least 2 detailed technical projects.');
      alignmentPercentage -= 10;
    }

    alignmentPercentage = Math.min(100, Math.max(20, alignmentPercentage));

    // 8. Transparent Total Score Calculation
    // Breakdown: Contact (15%) + Structure (25%) + Keywords (25%) + Readability (20%) + Alignment (15%)
    const contactScore = contactComplete ? 15 : 8;
    const structureScore = Math.round((presentSections.length / Math.max(5, presentSections.length + missingSections.length)) * 25);
    const keywordScore = Math.round((coveragePercentage / 100) * 25);
    const readScore = Math.round((readabilityScore / 100) * 20);
    const alignScore = Math.round((alignmentPercentage / 100) * 15);

    const calculatedScore = Math.min(100, contactScore + structureScore + keywordScore + readScore + alignScore);

    const scoringExplanation = `Total calculated ATS readiness score (${calculatedScore}/100) is derived transparently: Contact Information (${contactScore}/15) + Section Structure (${structureScore}/25) + Technical Keyword Coverage (${keywordScore}/25) + Readability & Length (${readScore}/20) + Role Alignment (${alignScore}/15).`;

    return {
      keyword_coverage: {
        found_keywords: foundKeywords,
        missing_keywords: missingKeywords.slice(0, 6),
        coverage_percentage: coveragePercentage,
      },
      section_structure: {
        valid: missingSections.length === 0,
        present_sections: presentSections,
        missing_sections: missingSections,
        suggestions: structureSuggestions,
      },
      text_readability: {
        score: readabilityScore,
        reading_level: readingLevel,
        word_count: totalWords,
        issues: readabilityIssues,
      },
      formatting_consistency: {
        bullet_style_consistent: weakBulletPhrasings.length === 0,
        date_format_consistent: formattingIssues.length === 0,
        issues: formattingIssues,
        suggestions: formattingSuggestions,
      },
      role_alignment: {
        target_role: targetRole,
        alignment_percentage: alignmentPercentage,
        alignment_notes: roleAlignmentNotes,
        recommendations: roleRecommendations,
      },
      contact_info_completeness: {
        complete: contactComplete,
        missing_fields: missingContact,
      },
      weak_bullet_phrasings: weakBulletPhrasings,
      scoring_explanation: scoringExplanation,
      calculated_score: calculatedScore,
      disclaimer: 'This analysis provides heuristic readability and parsing feedback. It does not guarantee applicant tracking system placement or employment outcomes.',
    };
  }
}
