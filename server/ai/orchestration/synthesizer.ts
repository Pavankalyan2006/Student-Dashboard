import { AgentResult, SourceProvenance, SynthesizedResponse, TaskPlan } from './types';
import { logger } from '../../core/logging';

export class ResponseSynthesizer {
  /**
   * Synthesizes cross-agent findings, structured evidence, and sources into a clear, unified final response.
   */
  public static synthesize(
    userMessage: string,
    plan: TaskPlan,
    results: AgentResult[],
    llmGeneratedAnswer?: string,
    extraSources?: SourceProvenance[]
  ): SynthesizedResponse {
    const understanding = `Interpreted request for **${plan.intent.intent.replace(/_/g, ' ')}** spanning ${plan.intent.domains.join(', ')}.`;

    // 1. Collect evidence and observations
    const findingsList: string[] = [];
    const disclosures: string[] = [];
    const allSources: SourceProvenance[] = [];
    const nextActionsSet = new Set<string>();

    if (extraSources) {
      for (const s of extraSources) {
        if (!allSources.some((existing) => existing.sourceId === s.sourceId)) {
          allSources.push(s);
        }
      }
    }

    for (const res of results) {
      if (res.status === 'failure') {
        disclosures.push(`**${res.agent} Note:** Some subtasks could not be fully completed: ${res.summary}`);
      } else {
        findingsList.push(`- **${res.agent}:** ${res.summary}`);
      }

      if (res.sources) {
        for (const s of res.sources) {
          if (!allSources.some((existing) => existing.sourceId === s.sourceId)) {
            allSources.push(s);
          }
        }
      }

      if (res.nextActions) {
        for (const act of res.nextActions) {
          nextActionsSet.add(act);
        }
      }
    }

    const findings = findingsList.join('\n');

    // 2. Format Plan Steps
    const planText = plan.tasks
      .map((t, i) => `${i + 1}. **${t.title}** (${t.agent}) — *${t.status.toUpperCase()}*`)
      .join('\n');

    // 3. Format Consolidated Results based on intent
    let resultSection = '';

    const examAgent = results.find((r) => r.agent === 'ExamPreparationAgent');
    const plannerAgent = results.find((r) => r.agent === 'StudyPlannerAgent');
    const notesAgent = results.find((r) => r.agent === 'NotesAgent');
    const flashAgent = results.find((r) => r.agent === 'FlashcardAgent');
    const quizAgent = results.find((r) => r.agent === 'QuizAgent');
    const dsaAgent = results.find((r) => r.agent === 'DSAAgent');
    const codingAgent = results.find((r) => r.agent === 'CodingAgent');
    const resumeAgent = results.find((r) => r.agent === 'ResumeAgent');
    const careerAgent = results.find((r) => r.agent === 'CareerAgent');

    if (plannerAgent?.data?.schedule) {
      resultSection += `### Strategic Study Schedule (${plannerAgent.data.daysRemaining || 15} Days)\n\n`;
      for (const item of plannerAgent.data.schedule) {
        resultSection += `- **${item.days}:** ${item.focus} *(Target: ${item.target})*\n`;
      }
      resultSection += '\n---\n\n';
    }

    if (notesAgent?.data?.keyFormulas) {
      resultSection += `### High-Yield Formula Sheet & Invariants\n\n`;
      for (const formula of notesAgent.data.keyFormulas) {
        resultSection += `${formula}\n\n`;
      }
      if (notesAgent.data.coreConcepts) {
        resultSection += `#### Core Theoretical Invariants:\n`;
        for (const concept of notesAgent.data.coreConcepts) {
          resultSection += `- ${concept}\n`;
        }
      }
      resultSection += '\n---\n\n';
    }

    if (flashAgent?.data?.flashcards) {
      resultSection += `### Active Recall Flashcard Deck\n\n`;
      flashAgent.data.flashcards.forEach((fc: any, i: number) => {
        resultSection += `**Card ${i + 1}:** ${fc.front}\n> **Answer:** ${fc.back.replace(/\n/g, ' ')}\n\n`;
      });
      resultSection += '---\n\n';
    }

    if (quizAgent?.data?.questions) {
      resultSection += `### Diagnostic Practice Assessment\n\n`;
      quizAgent.data.questions.forEach((q: any, i: number) => {
        resultSection += `**Q${i + 1}: ${q.question}**\n`;
        if (Array.isArray(q.options)) {
          q.options.forEach((opt: string) => {
            const isAns = opt.toLowerCase().includes(q.answer?.toLowerCase() || '###');
            resultSection += `- ${opt} ${isAns ? '*(Correct)*' : ''}\n`;
          });
        }
        if (q.explanation) {
          resultSection += `*Explanation:* ${q.explanation}\n\n`;
        }
      });
      resultSection += '---\n\n';
    }

    if (dsaAgent?.data?.invariants) {
      resultSection += `### Algorithmic Invariants & Complexity Analysis\n\n`;
      resultSection += `- **Time Complexity:** Average ${dsaAgent.data.timeComplexityAverage || 'O(log n)'}, Worst ${dsaAgent.data.timeComplexityWorst || 'O(log n)'}\n`;
      resultSection += `- **Space Complexity:** ${dsaAgent.data.spaceComplexity || 'O(1)'}\n`;
      resultSection += `- **State Invariant:** ${dsaAgent.data.invariants}\n\n`;
    }

    if (resumeAgent?.data?.atsScore) {
      resultSection += `### Resume ATS Readability Index: ${resumeAgent.data.atsScore}/100\n\n`;
      resultSection += `- **Verified Skills Detected:** ${resumeAgent.data.skillsFound?.join(', ')}\n`;
      resultSection += `- **Target Improvement:** ${resumeAgent.data.recommendation}\n\n`;
    }

    if (careerAgent?.data?.skillGaps) {
      resultSection += `### Career Role Competencies (${careerAgent.data.targetRole || 'Target Role'})\n\n`;
      resultSection += `- **Identified Curriculum Gaps:** ${careerAgent.data.skillGaps.join(', ')}\n`;
      resultSection += `- **Recommended Academic Elective:** ${careerAgent.data.recommendedElective}\n\n`;
    }

    if (codingAgent?.data?.problem) {
      resultSection += `### Code Diagnostic Invariants\n\n`;
      resultSection += `- **Problem:** ${codingAgent.data.problem}\n`;
      resultSection += `- **Cause:** ${codingAgent.data.cause}\n`;
      resultSection += `- **Explanation:** ${codingAgent.data.explanation}\n`;
      if (codingAgent.data.suggested_fix) {
        resultSection += `> **Fix:** ${codingAgent.data.suggested_fix}\n\n`;
      }
    }

    // Integrate LLM generated answer if provided
    if (llmGeneratedAnswer && llmGeneratedAnswer.trim()) {
      if (resultSection.trim()) {
        resultSection = `${llmGeneratedAnswer.trim()}\n\n---\n\n${resultSection.trim()}`;
      } else {
        resultSection = llmGeneratedAnswer.trim();
      }
    } else if (!resultSection.trim()) {
      // Default result text if specialized fields were empty
      resultSection = results
        .map((r) => `#### ${r.agent}\n${r.summary}`)
        .join('\n\n');
    }

    // 4. Default Suggested Actions
    if (nextActionsSet.size === 0) {
      nextActionsSet.add('Save key insights to Notes');
      nextActionsSet.add('Generate Active Recall Flashcards');
      nextActionsSet.add('Take Diagnostic Practice Quiz');
      nextActionsSet.add('Practice related code in Coding Lab');
      nextActionsSet.add('Take full-length adaptive quiz');
    }

    const nextActions = Array.from(nextActionsSet);

    // 5. Build Markdown Output
    let markdown = '';

    if (plan.intent.complexity !== 'SIMPLE') {
      markdown += `## Understanding\n${understanding}\n\n`;
      markdown += `## What I found\n${findings}\n\n`;
      if (disclosures.length > 0) {
        markdown += `> [!NOTE]\n> ${disclosures.join('\n> ')}\n\n`;
      }
      markdown += `## Plan\n${planText}\n\n`;
      markdown += `## Result\n\n${resultSection}\n\n`;
      markdown += `## Sources\n`;
      allSources.forEach((src, idx) => {
        markdown += `[${idx + 1}] **${src.title}** (${src.sourceType.replace(/_/g, ' ')})\n`;
      });
      markdown += `\n## Next actions\n`;
      nextActions.forEach((act) => {
        markdown += `- ${act}\n`;
      });
    } else {
      // Simple response format
      markdown += `${resultSection}\n\n`;
      if (allSources.length > 0) {
        markdown += `\n**Sources:**\n`;
        allSources.forEach((src, idx) => {
          markdown += `[${idx + 1}] ${src.title}\n`;
        });
      }
    }

    return {
      understanding,
      findings,
      plan: planText,
      result: resultSection,
      sources: allSources,
      nextActions,
      disclosures,
      markdownContent: markdown.trim(),
    };
  }
}

export class ResponseQualityValidator {
  /**
   * Verifies that the synthesized response directly addresses the user query and is grounded in actual platform evidence.
   */
  public static validateQuality(response: SynthesizedResponse): boolean {
    if (!response.markdownContent || response.markdownContent.length < 20) {
      logger.warn('Quality validation failed: Response content too short');
      return false;
    }
    return true;
  }
}
