import { QuizDifficulty, AdaptiveState } from '../models/quizTypes';

const DIFFICULTY_LEVELS: QuizDifficulty[] = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED'];

export class AdaptiveQuizService {
  /**
   * Initializes a new adaptive state
   */
  public static createInitialState(startingDifficulty: QuizDifficulty = 'MEDIUM'): AdaptiveState {
    return {
      current_difficulty: startingDifficulty,
      correct_streak: 0,
      incorrect_streak: 0,
      recent_accuracy: 100,
      history: [],
    };
  }

  public static initializeAdaptiveState(startingDifficulty: QuizDifficulty = 'MEDIUM'): AdaptiveState {
    return this.createInitialState(startingDifficulty);
  }

  /**
   * Updates adaptive state when an answer is evaluated
   */
  public static recordAnswer(
    state: AdaptiveState,
    questionId: string,
    isCorrect: boolean
  ): AdaptiveState {
    const history = [
      ...state.history,
      {
        question_id: questionId,
        difficulty: state.current_difficulty,
        is_correct: isCorrect,
      },
    ];

    const correct_streak = isCorrect ? state.correct_streak + 1 : 0;
    const incorrect_streak = !isCorrect ? state.incorrect_streak + 1 : 0;

    // Calculate recent accuracy over last 5 answers
    const recent5 = history.slice(-5);
    const recentCorrect = recent5.filter((h) => h.is_correct).length;
    const recent_accuracy = Math.round((recentCorrect / Math.max(1, recent5.length)) * 100);

    let nextDifficulty = state.current_difficulty;
    const currentIdx = DIFFICULTY_LEVELS.indexOf(state.current_difficulty);

    // Rule: 2 consecutive correct answers elevate difficulty
    if (correct_streak >= 2 && currentIdx < DIFFICULTY_LEVELS.length - 1) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIdx + 1];
    }
    // Rule: 2 consecutive incorrect answers lower difficulty
    else if (incorrect_streak >= 2 && currentIdx > 0) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIdx - 1];
    }

    const nextIdx = DIFFICULTY_LEVELS.indexOf(nextDifficulty);

    return {
      current_difficulty: nextDifficulty,
      correct_streak,
      incorrect_streak,
      recent_accuracy,
      history,
      adjustment_reason:
        nextDifficulty !== state.current_difficulty
          ? nextIdx > currentIdx
            ? `Elevated difficulty to ${nextDifficulty} following a streak of ${correct_streak} correct answers.`
            : `Lowered difficulty to ${nextDifficulty} following a streak of ${incorrect_streak} incorrect answers.`
          : undefined,
    };
  }

  public static initAdaptiveState(startingDifficulty: QuizDifficulty = 'MEDIUM'): AdaptiveState {
    return this.createInitialState(startingDifficulty);
  }

  public static evaluateAdaptiveStep(
    state: AdaptiveState,
    isCorrect: boolean,
    _currentDifficulty?: QuizDifficulty
  ): AdaptiveState & { adjustment_reason?: string } {
    return this.recordAnswer(state, `step_${Date.now()}`, isCorrect) as any;
  }
}
