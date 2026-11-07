import { ResumeService } from './resumeService';
import { ResumeAnalysisResult } from '../models/careerResumeTypes';
import { CareerService, skillMatches } from './careerService';

export class ResumeAnalysisService {
  /**
   * Rule-based resume checklist. Every number comes from a count on the resume; nothing is estimated.
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
    // Length is the only readability property measured here. Score 100 inside 150-800 words, scaled down outside it.
    let readabilityScore = 100;
    if (totalWords < 150) {
      readabilityIssues.push(`Resume text is brief (${totalWords} words, under 150). Describe what you built and how in your projects.`);
      readabilityScore = Math.round((totalWords / 150) * 100);
    } else if (totalWords > 800) {
      readabilityIssues.push(`Resume text is long (${totalWords} words, over 800). Aim for a single page.`);
      readabilityScore = Math.round((800 / totalWords) * 100);
    }
    const readingLevel = totalWords < 150 ? 'Brief draft (length only)' : totalWords > 800 ? 'Long (length only)' : 'Within 150-800 words (length only)';

    // 4. Weak phrasing. We point at the phrase; we do not rewrite it, because a stronger verb could overstate what the
    // student did (earlier versions turned "responsible for" into "Engineered"). The editor's AI wording tool can suggest text.
    const weakPatterns = [
      { regex: /^(worked on|helped with|responsible for|made a|created a simple|did)\b/i, fix: 'Starts with a vague phrase. Begin with the verb for what you actually did (for example Built, Wrote, Tested), keeping the same facts.' },
      { regex: /tried to|attempted to/i, fix: 'Tentative phrasing. State what you did and, if it was not finished, say so plainly.' },
      { regex: /etc\.|and so on/i, fix: 'Avoid "etc."; name the tools or features.' },
    ];
    const weakBulletPhrasings: { current: string; suggestion: string; reason: string }[] = [];
    for (const bullet of allBulletTexts) {
      const wp = weakPatterns.find((w) => w.regex.test(bullet.trim()));
      if (wp) weakBulletPhrasings.push({ current: bullet, suggestion: '', reason: wp.fix });
    }

    // 5. Keyword coverage against the target role's skills from the career role catalogue. Without a recognised target
    // role there is no reference list, so coverage is not scored (null) instead of comparing against a generic list.
    const targetRole = resume.target_role?.trim() || '';
    const roles = targetRole ? await CareerService.listRoles() : [];
    const t = targetRole.toLowerCase();
    const role = roles.find((r) => r.name.toLowerCase() === t || r.slug === t.replace(/\s+/g, '-'))
      || roles.find((r) => t && (t.includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(t)));
    const resumeSkillNames = skills.map((sk: any) => String(sk.skill || sk.name || '')).filter(Boolean);
    const resumeText = [
      resume.summary || '',
      ...projects.flatMap((p: any) => [p.title || '', p.description_override || '', ...(p.technologies || []), ...(p.highlighted_features || [])]),
      ...experience.flatMap((e: any) => [e.title || '', e.description || '', ...(e.achievements || [])]),
      ...certifications.map((c: any) => c.name || c.title || ''),
    ].join(' ');
    const foundKeywords = role ? role.skills.filter((req) => skillMatches(req, resumeSkillNames) || skillMatches(req, [resumeText])) : [];
    const missingKeywords = role ? role.skills.filter((req) => !foundKeywords.includes(req)) : [];
    const coveragePercentage = role && role.skills.length ? Math.round((foundKeywords.length / role.skills.length) * 100) : null;

    // 6. Formatting Consistency
    const formattingIssues: string[] = [];
    const formattingSuggestions: string[] = [];
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

    // 7. Role alignment = share of the role's skills listed in the resume Skills section (not inferred from prose).
    const roleAlignmentNotes: string[] = [];
    const roleRecommendations: string[] = [];
    let alignmentPercentage: number | null = null;
    if (!targetRole) {
      roleRecommendations.push('Set a target role on this resume to compare it with that role\'s skills.');
    } else if (!role) {
      roleRecommendations.push(`"${targetRole}" is not in the career role catalogue, so role alignment was not measured.`);
    } else {
      const listed = role.skills.filter((req) => skillMatches(req, resumeSkillNames));
      alignmentPercentage = role.skills.length ? Math.round((listed.length / role.skills.length) * 100) : null;
      roleAlignmentNotes.push(`${listed.length} of ${role.skills.length} skills for ${role.name} appear in your Skills section${listed.length ? `: ${listed.join(', ')}` : ''}.`);
      const notListed = role.skills.filter((req) => !listed.includes(req));
      if (notListed.length) roleRecommendations.push(`Only list these if you have actually used them: ${notListed.slice(0, 6).join(', ')}.`);
    }
    if (projects.length < 2) roleRecommendations.push(`Your resume has ${projects.length} project(s); recruiters for student roles usually look for at least 2.`);

    // 8. Score: each component is measured from the resume; components that cannot be measured are left out and the
    // total is rescaled to the components that were measured. There are no baseline points.
    const contactFields = 4;
    const contactScore = Math.round(((contactFields - missingContact.length) / contactFields) * 15);
    const structureScore = Math.round((presentSections.length / Math.max(5, presentSections.length + missingSections.length)) * 25);
    const readScore = Math.round((readabilityScore / 100) * 20);
    const parts: { label: string; got: number; max: number }[] = [
      { label: 'Contact fields', got: contactScore, max: 15 },
      { label: 'Section structure', got: structureScore, max: 25 },
      { label: 'Length', got: readScore, max: 20 },
    ];
    if (coveragePercentage !== null) parts.push({ label: `Keywords for ${role!.name}`, got: Math.round((coveragePercentage / 100) * 25), max: 25 });
    if (alignmentPercentage !== null) parts.push({ label: 'Skills section vs role', got: Math.round((alignmentPercentage / 100) * 15), max: 15 });
    const got = parts.reduce((a, b) => a + b.got, 0);
    const max = parts.reduce((a, b) => a + b.max, 0);
    const calculatedScore = Math.round((got / max) * 100);
    const skipped = coveragePercentage === null ? ' Keyword and role checks were not scored because no catalogue target role is set.' : '';
    const scoringExplanation = `Resume checklist score ${calculatedScore}/100 = ${parts.map((x) => `${x.label} ${x.got}/${x.max}`).join(' + ')} (${got}/${max}, rescaled to 100).${skipped}`;

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
        target_role: role?.name || targetRole || null,
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
      disclaimer: 'A checklist of measurable resume properties (contact fields, sections, length, role skills). It is not an ATS score and does not predict screening or hiring outcomes.',
    };
  }
}
