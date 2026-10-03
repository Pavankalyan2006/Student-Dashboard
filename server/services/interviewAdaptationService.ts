import {
  MockInterviewSession,
  MockInterviewQuestion,
  MockInterviewAnswer,
  AnswerEvaluation,
} from '../models/placementTypes';

export interface AdaptationDecision {
  should_follow_up: boolean;
  follow_up_direction: 'DEEPEN' | 'CLARIFY' | 'NEXT_TOPIC';
  suggested_concept?: string;
  rationale: string;
}

export class InterviewAdaptationService {
  private static MAX_CONSECUTIVE_FOLLOW_UPS = 1;

  /**
   * Evaluates the student's recent answer and determines whether an adaptive follow-up
   * or a new topic question should be asked based on deterministic pedagogical rules.
   */
  public static determineNextStep(
    session: MockInterviewSession,
    lastQuestion: MockInterviewQuestion,
    lastAnswer: MockInterviewAnswer,
    allQuestions: MockInterviewQuestion[]
  ): AdaptationDecision {
    // Check if session question limit has already been met
    if (session.current_question_index >= session.max_questions) {
      return {
        should_follow_up: false,
        follow_up_direction: 'NEXT_TOPIC',
        rationale: 'Maximum session question limit reached; interview should conclude.',
      };
    }

    // Check how many consecutive follow-ups were already asked in this thread
    let consecutiveFollowUps = 0;
    let curr: MockInterviewQuestion | undefined = lastQuestion;
    while (curr && curr.follow_up_to) {
      consecutiveFollowUps++;
      curr = allQuestions.find((q) => q.id === curr?.follow_up_to);
    }

    if (consecutiveFollowUps >= this.MAX_CONSECUTIVE_FOLLOW_UPS) {
      return {
        should_follow_up: false,
        follow_up_direction: 'NEXT_TOPIC',
        rationale: `Reached limit of ${this.MAX_CONSECUTIVE_FOLLOW_UPS} consecutive follow-up(s); transitioning to next core topic.`,
      };
    }

    const evaluation: AnswerEvaluation = lastAnswer.evaluation;

    // Rule 1: High performance (Score >= 80 and missing concepts <= 1) -> Deep dive into edge cases/tradeoffs
    if (evaluation.score >= 80 && evaluation.missing_concepts.length <= 1) {
      return {
        should_follow_up: true,
        follow_up_direction: 'DEEPEN',
        suggested_concept: evaluation.covered_concepts[0] || lastQuestion.topic,
        rationale: 'Candidate demonstrated strong baseline understanding; asking deeper architectural/complexity follow-up.',
      };
    }

    // Rule 2: Partial coverage (Score 40 - 79 and missing concepts > 0) -> Clarification question on missed concept
    if (evaluation.score >= 40 && evaluation.missing_concepts.length > 0) {
      return {
        should_follow_up: true,
        follow_up_direction: 'CLARIFY',
        suggested_concept: evaluation.missing_concepts[0],
        rationale: `Candidate missed key concept "${evaluation.missing_concepts[0]}"; asking targeted clarification prompt.`,
      };
    }

    // Rule 3: Poor response (Score < 40) -> Transition to a new fundamental topic without getting stuck
    return {
      should_follow_up: false,
      follow_up_direction: 'NEXT_TOPIC',
      rationale: 'Candidate struggled with current topic; moving to a fresh topic to assess breadth without penalty spiral.',
    };
  }
}
