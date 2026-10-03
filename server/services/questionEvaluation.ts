import { QuizQuestion, QuestionType } from '../models/quizTypes';

export interface EvaluationResult {
  is_correct: boolean;
  score_ratio: number; // 0.0 to 1.0
  feedback?: string;
  normalized_student_answer: string | string[];
}

export class QuestionEvaluationService {
  /**
   * Deterministically evaluates student answer against question specifications
   */
  public static evaluate(
    question: QuizQuestion,
    selectedAnswer: string | string[] | null | undefined
  ): EvaluationResult {
    return this.evaluateAnswer(question, selectedAnswer);
  }

  public static evaluateAnswer(
    question: QuizQuestion,
    selectedAnswer: string | string[] | null | undefined
  ): EvaluationResult {
    if (selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === '') {
      return {
        is_correct: false,
        score_ratio: 0,
        feedback: 'No answer was provided.',
        normalized_student_answer: '',
      };
    }

    switch (question.question_type) {
      case 'MCQ':
        return this.evaluateMCQ(question, selectedAnswer);
      case 'MULTI_SELECT':
        return this.evaluateMultiSelect(question, selectedAnswer);
      case 'TRUE_FALSE':
        return this.evaluateTrueFalse(question, selectedAnswer);
      case 'SHORT_ANSWER':
        return this.evaluateShortAnswer(question, selectedAnswer);
      case 'CODE_OUTPUT':
        return this.evaluateCodeOutput(question, selectedAnswer);
      default:
        return this.evaluateMCQ(question, selectedAnswer);
    }
  }

  private static evaluateMCQ(
    question: QuizQuestion,
    answer: string | string[]
  ): EvaluationResult {
    const studentStr = Array.isArray(answer) ? answer[0] || '' : String(answer);
    const correctStr = Array.isArray(question.correct_answer)
      ? question.correct_answer[0] || ''
      : String(question.correct_answer);

    const normStudent = studentStr.trim().toLowerCase();
    const normCorrect = correctStr.trim().toLowerCase();

    const isCorrect = normStudent === normCorrect;

    return {
      is_correct: isCorrect,
      score_ratio: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? 'Correct answer!'
        : `Incorrect. You selected "${studentStr}".`,
      normalized_student_answer: studentStr.trim(),
    };
  }

  private static evaluateMultiSelect(
    question: QuizQuestion,
    answer: string | string[]
  ): EvaluationResult {
    const studentArr: string[] = Array.isArray(answer)
      ? answer.map((s) => String(s).trim())
      : [String(answer).trim()];

    const correctArr: string[] = Array.isArray(question.correct_answer)
      ? question.correct_answer.map((s) => String(s).trim())
      : [String(question.correct_answer).trim()];

    const normStudentSet = new Set(studentArr.map((s) => s.toLowerCase()));
    const normCorrectSet = new Set(correctArr.map((s) => s.toLowerCase()));

    // Check if exact set match
    let correctMatches = 0;
    for (const item of normStudentSet) {
      if (normCorrectSet.has(item)) {
        correctMatches++;
      }
    }

    const isExactMatch =
      normStudentSet.size === normCorrectSet.size &&
      correctMatches === normCorrectSet.size;

    return {
      is_correct: isExactMatch,
      score_ratio: isExactMatch ? 1.0 : 0.0,
      feedback: isExactMatch
        ? 'All correct options selected!'
        : `Selected ${correctMatches} of ${normCorrectSet.size} correct answers.`,
      normalized_student_answer: studentArr,
    };
  }

  private static evaluateTrueFalse(
    question: QuizQuestion,
    answer: string | string[]
  ): EvaluationResult {
    const studentStr = (Array.isArray(answer) ? answer[0] || '' : String(answer))
      .trim()
      .toLowerCase();

    const correctStr = (Array.isArray(question.correct_answer)
      ? question.correct_answer[0] || ''
      : String(question.correct_answer)
    )
      .trim()
      .toLowerCase();

    const normStudent = studentStr === 'true' || studentStr === 't' || studentStr === 'yes' ? 'true' : 'false';
    const normCorrect = correctStr === 'true' || correctStr === 't' || correctStr === 'yes' ? 'true' : 'false';

    const isCorrect = normStudent === normCorrect;

    return {
      is_correct: isCorrect,
      score_ratio: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect.',
      normalized_student_answer: normStudent === 'true' ? 'True' : 'False',
    };
  }

  private static evaluateShortAnswer(
    question: QuizQuestion,
    answer: string | string[]
  ): EvaluationResult {
    const studentRaw = (Array.isArray(answer) ? answer[0] || '' : String(answer)).trim();
    const studentNorm = studentRaw.toLowerCase().replace(/\s+/g, ' ');

    const correctRaw = Array.isArray(question.correct_answer)
      ? question.correct_answer[0] || ''
      : String(question.correct_answer);

    const acceptableTargets = [
      correctRaw.toLowerCase().replace(/\s+/g, ' '),
      ...(question.metadata?.criteria?.map((c) => c.toLowerCase().trim()) || []),
    ];

    // Normalize Big-O notation and mathematical expressions
    const normalizeBigO = (str: string) =>
      str
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/^[oO0]\s*\((.*)\)$/, '$1')
        .replace(/^[oO0]\s*\[(.*)\]$/, '$1')
        .replace(/^theta\s*\((.*)\)$/, '$1')
        .replace(/^omega\s*\((.*)\)$/, '$1')
        .replace(/[\*\^]/g, '');

    const isMatch = acceptableTargets.some((target) => {
      if (studentNorm === target) return true;
      if (normalizeBigO(studentNorm) === normalizeBigO(target)) return true;
      // Partial inclusion if concept is specifically described
      if (target.length > 5 && studentNorm.includes(target)) return true;
      return false;
    });

    return {
      is_correct: isMatch,
      score_ratio: isMatch ? 1.0 : 0.0,
      feedback: isMatch
        ? 'Accurate concept explanation!'
        : `Target concept was "${correctRaw}".`,
      normalized_student_answer: studentRaw,
    };
  }

  private static evaluateCodeOutput(
    question: QuizQuestion,
    answer: string | string[]
  ): EvaluationResult {
    const studentStr = (Array.isArray(answer) ? answer[0] || '' : String(answer))
      .trim()
      .replace(/\r\n/g, '\n');

    const expectedStr = (
      question.metadata?.expected_output ||
      (Array.isArray(question.correct_answer)
        ? question.correct_answer[0]
        : String(question.correct_answer))
    )
      .trim()
      .replace(/\r\n/g, '\n');

    const isCorrect = studentStr.toLowerCase() === expectedStr.toLowerCase();

    return {
      is_correct: isCorrect,
      score_ratio: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? 'Exact program output matched!'
        : `Program output expected: "${expectedStr}", got: "${studentStr}".`,
      normalized_student_answer: studentStr,
    };
  }
}
