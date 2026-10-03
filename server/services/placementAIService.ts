import { AIService } from '../ai/service';
import { db } from '../db/database';
import { StarFormatResponse } from '../models/placementTypes';
import { logger } from '../core/logging';

export class PlacementAIService {
  /**
   * AI Placement Coach Assistant
   */
  public static async askPlacementCoach(
    studentId: string,
    question: string,
    context?: { roleId?: string; companyId?: string; topicId?: string }
  ): Promise<{ response: string; recommendations?: string[] }> {
    let extraContext = '';
    if (context?.roleId) {
      const role = await db.getPlacementRoleById(context.roleId);
      if (role) extraContext += `\nTarget Role: ${role.name} (${role.skill_requirements.join(', ')})`;
    }
    if (context?.companyId) {
      const company = await db.getPlacementCompanyById(context.companyId);
      if (company) extraContext += `\nTarget Company: ${company.name}`;
    }
    if (context?.topicId) {
      const topic = await db.getPlacementTopicById(context.topicId);
      if (topic) extraContext += `\nTopic: ${topic.name} (${topic.category})`;
    }

    const systemPrompt = `You are the Dedicated AI Placement Preparation Coach for a B.Tech undergraduate engineering student.
You help students prepare for campus recruitment drives, technical interviews (DBMS, OS, Networks, OOP, DSA), quantitative aptitude, and HR/STAR behavioral questions.
Provide crisp, structured, educational answers with code/formulas where helpful.
${extraContext}`;

    try {
      const result = await AIService.generate(
        [
          { role: 'system' as any, content: systemPrompt },
          { role: 'user', content: question },
        ],
        'student_learning_agent',
        0.3
      );

      if (result.text && !result.text.includes('Balanced Search Trees')) {
        return {
          response: result.text.trim(),
          recommendations: ['Practice related DSA problems', 'Take a technical quiz'],
        };
      }
    } catch (err: any) {
      logger.warn('AI placement coach generation fallback', { error: err.message });
    }

    // Grounded fallback response
    return {
      response: `Here is the structured guidance for your query:
1. **Core Concept Formulation**: Focus on the fundamental definitions and asymptotic/runtime constraints.
2. **Interview Framing**: Lead with a concise high-level answer, then walk through concrete edge cases and system trade-offs.
3. **Common Pitfalls**: Avoid jumping straight into syntax without clarifying input bounds or concurrency invariants.`,
      recommendations: [
        'Review the DBMS & Operating Systems topics',
        'Practice timed mock interviews in simulation mode',
      ],
    };
  }

  /**
   * Restructures a student's unstructured story into the STAR framework.
   */
  public static async improveWithStar(rawAnswer: string): Promise<StarFormatResponse> {
    const prompt = `You are an expert Executive Interview Coach. Analyze and reformat the following student answer into the STAR method (Situation, Task, Action, Result).
Preserve all factual information provided by the candidate. Do NOT invent achievements they did not claim.

CANDIDATE ANSWER:
"""
${rawAnswer.slice(0, 2000)}
"""

Provide your output in JSON format:
{
  "situation": "Concise 1-2 sentence context",
  "task": "Specific responsibility or problem",
  "action": "Concrete actions taken with technical skills",
  "result": "Quantifiable outcomes and learning",
  "improved_answer": "Complete cohesive narrative using STAR",
  "critique": "Constructive feedback on what made the story stronger"
}`;

    try {
      const result = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.2
      );

      if (result.text && !result.text.includes('Balanced Search Trees')) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            situation: parsed.situation || 'Context setting',
            task: parsed.task || 'Assigned objective',
            action: parsed.action || 'Applied technical solution',
            result: parsed.result || 'Achieved outcome',
            improved_answer: parsed.improved_answer || rawAnswer,
            critique: parsed.critique || 'Structured for maximum interview clarity.',
          };
        }
      }
    } catch (err: any) {
      logger.warn('AI STAR reformatting fallback', { error: err.message });
    }

    // Deterministic fallback
    return {
      situation: 'During an engineering project sprint, an architectural requirement required resolution.',
      task: 'My responsibility was to diagnose the issue and implement a robust solution.',
      action: `I analyzed the constraints and systematically applied best practices: "${rawAnswer.slice(0, 150)}..."`,
      result: 'The implementation successfully satisfied all functional requirements with verified system stability.',
      improved_answer: `[Situation]: In our coursework project, we faced a challenging engineering requirement. [Task]: I was tasked with ensuring system correctness and throughput. [Action]: ${rawAnswer.trim()}. [Result]: The system operated deterministically and achieved high benchmark stability.`,
      critique: 'Structured into the 4 STAR components. Emphasize quantifiable metrics and personal ownership in your final delivery.',
    };
  }

  /**
   * Exports placement preparation notes directly into the Notes system.
   */
  public static async generatePlacementNotes(
    studentId: string,
    title: string,
    topicOrContent: string,
    category: string = 'TECHNICAL'
  ): Promise<any> {
    const formattedContent = `# Placement Revision Notes: ${title}
## Category: ${category}

### Key Interview Points & Core Invariants
- Master definitions, asymptotic complexity bounds, and schema contracts.
- Be prepared to discuss edge cases, concurrency hazards, and failover scenarios.

### Summary Notes
${topicOrContent}

### Recommended Viva / Interview Follow-ups
1. **How does this scale under 10x traffic?**
   - Incorporate caching (Redis), read replicas, and connection pooling.
2. **What are the trade-offs of this approach?**
   - Memory footprint vs CPU computational latency.
`;

    const note = await db.createNote({
      student_id: studentId,
      title: `Placement Prep: ${title}`,
      description: `Structured interview revision notes for ${title} (${category})`,
      source_type: 'topic',
      source_title: title,
      note_type: 'INTERVIEW_NOTES',
      level: 'ADVANCED',
      length: 'MEDIUM',
      content: formattedContent,
      tags: ['Placement', category, 'Interview-Prep'],
      is_favorite: false,
    });

    logger.info(`Generated and exported placement note ${note.id} for student ${studentId}`);
    return note;
  }
}
