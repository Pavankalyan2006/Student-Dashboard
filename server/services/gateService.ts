// server/services/gateService.ts
// Comprehensive business logic and evaluation engine for GATE Exam Preparation

import { db } from '../db/database';
import {
  GatePaper,
  GateSyllabusSection,
  GateQuestion,
  GateMockTest,
  GateStudentProfile,
  GateQuestionAttempt,
  GateTestSession,
  GateTestResult,
  GateStudyTask,
  GateDashboardData,
  TopicStatus,
  StudentConfidence
} from '../models/gateTypes';
import { GoogleGenAI } from '@google/genai';
import { config } from '../core/config';
import { logger } from '../core/logging';

export class GateService {
  // --- Paper & Syllabus ---
  public static async getPapers(): Promise<GatePaper[]> {
    return await db.getGatePapers();
  }

  public static async getPaperByCode(code: string): Promise<GatePaper | null> {
    return await db.getGatePaperByCode(code);
  }

  public static async getSyllabus(paperCode: string, studentId?: string): Promise<GateSyllabusSection[]> {
    return await db.getGateSyllabus(paperCode, studentId);
  }

  // --- Profile & Preferences ---
  public static async getProfile(studentId: string): Promise<GateStudentProfile> {
    return await db.getGateStudentProfile(studentId);
  }

  public static async updateProfile(studentId: string, updates: Partial<GateStudentProfile>): Promise<GateStudentProfile> {
    return await db.saveGateStudentProfile(studentId, updates);
  }

  public static async updateTopicStatus(
    studentId: string,
    topicId: string,
    data: {
      status?: TopicStatus;
      confidence?: StudentConfidence;
      revision_flag?: boolean;
      student_notes?: string;
    }
  ): Promise<any> {
    return await db.saveGateTopicStatus(studentId, topicId, data);
  }

  // --- Questions & Practice ---
  public static async getQuestions(filters: {
    paper_code?: string;
    subject?: string;
    topic_id?: string;
    difficulty?: string;
    question_type?: string;
    is_pyq?: boolean;
    search?: string;
  }): Promise<GateQuestion[]> {
    return await db.getGateQuestions(filters);
  }

  public static async getQuestionById(id: string): Promise<GateQuestion | null> {
    return await db.getGateQuestionById(id);
  }

  /**
   * Authoritative server-side evaluation of individual question practice
   */
  public static async attemptQuestion(
    studentId: string,
    questionId: string,
    selectedAnswer: any,
    timeSpentSeconds: number
  ): Promise<{
    attempt: GateQuestionAttempt;
    is_correct: boolean;
    marks_awarded: number;
    negative_deducted: number;
    correct_answer: any;
    explanation: string;
  }> {
    const question = await db.getGateQuestionById(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    let isCorrect = false;
    let marksAwarded = 0;
    let negativeDeducted = 0;

    if (question.question_type === 'MCQ') {
      if (String(selectedAnswer).trim().toUpperCase() === String(question.correct_answer).trim().toUpperCase()) {
        isCorrect = true;
        marksAwarded = question.marks;
      } else {
        isCorrect = false;
        negativeDeducted = question.negative_marks;
        marksAwarded = -negativeDeducted;
      }
    } else if (question.question_type === 'MSQ') {
      const correctArr = Array.isArray(question.correct_answer)
        ? question.correct_answer.slice().sort()
        : [question.correct_answer];
      const userArr = Array.isArray(selectedAnswer) ? selectedAnswer.slice().sort() : [selectedAnswer];
      if (correctArr.length === userArr.length && correctArr.every((v, i) => v === userArr[i])) {
        isCorrect = true;
        marksAwarded = question.marks;
      } else {
        isCorrect = false;
        marksAwarded = 0;
      }
    } else if (question.question_type === 'NAT') {
      const val = parseFloat(selectedAnswer);
      if (!isNaN(val)) {
        let minVal = 0;
        let maxVal = 0;
        if (typeof question.correct_answer === 'object' && 'min' in question.correct_answer) {
          minVal = question.correct_answer.min;
          maxVal = question.correct_answer.max;
        } else if (question.tolerance_range) {
          minVal = question.tolerance_range[0];
          maxVal = question.tolerance_range[1];
        } else {
          const exact = parseFloat(String(question.correct_answer));
          minVal = exact - 0.05;
          maxVal = exact + 0.05;
        }

        if (val >= minVal && val <= maxVal) {
          isCorrect = true;
          marksAwarded = question.marks;
        } else {
          isCorrect = false;
          marksAwarded = 0;
        }
      }
    }

    const attempt: GateQuestionAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      question_id: questionId,
      paper_code: question.paper_code,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      marks_awarded: marksAwarded > 0 ? marksAwarded : 0,
      negative_deducted: negativeDeducted,
      time_spent_seconds: timeSpentSeconds || 60,
      attempted_at: new Date().toISOString(),
    };

    await db.recordGateQuestionAttempt(attempt);

    return {
      attempt,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
      negative_deducted: negativeDeducted,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
    };
  }

  public static async toggleBookmark(studentId: string, questionId: string, notes?: string) {
    return await db.toggleGateBookmark(studentId, questionId, notes);
  }

  public static async getBookmarks(studentId: string) {
    return await db.getGateBookmarks(studentId);
  }

  // --- Mock Tests ---
  public static async getMockTests(paperCode?: string, type?: string): Promise<GateMockTest[]> {
    return await db.getGateMockTests(paperCode, type);
  }

  public static async getMockTestById(id: string): Promise<GateMockTest | null> {
    return await db.getGateMockTestById(id);
  }

  public static async startMockTest(studentId: string, testId: string): Promise<GateTestSession> {
    return await db.startGateTestSession(studentId, testId);
  }

  public static async saveMockTestAnswers(
    sessionId: string,
    studentId: string,
    answers: Record<string, any>,
    remainingSeconds: number
  ): Promise<GateTestSession> {
    return await db.saveGateTestSessionAnswers(sessionId, studentId, answers, remainingSeconds);
  }

  public static async submitMockTest(sessionId: string, studentId: string): Promise<GateTestResult> {
    return await db.submitGateTestSession(sessionId, studentId);
  }

  public static async getMockTestSession(sessionId: string, studentId: string): Promise<GateTestSession | null> {
    return await db.getGateTestSession(sessionId, studentId);
  }

  public static async getTestResults(studentId: string): Promise<GateTestResult[]> {
    return await db.getGateTestResults(studentId);
  }

  // --- Study Planner ---
  public static async getStudyPlan(studentId: string, paperCode?: string): Promise<GateStudyTask[]> {
    return await db.getGateStudyPlan(studentId, paperCode);
  }

  public static async toggleStudyTask(studentId: string, taskId: string): Promise<GateStudyTask | null> {
    return await db.toggleGateStudyTask(studentId, taskId);
  }

  public static async addStudyTask(studentId: string, task: Omit<GateStudyTask, 'id' | 'student_id'>): Promise<GateStudyTask> {
    const fullTask: GateStudyTask = {
      ...task,
      id: `gtask_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      is_completed: false,
    };
    return await db.addGateStudyTask(fullTask);
  }

  // --- Dashboard ---
  public static async getDashboard(studentId: string): Promise<GateDashboardData> {
    return await db.getGateDashboardData(studentId);
  }

  // --- AI GATE Study Assistant ---
  public static async queryAiTutor(
    studentId: string,
    prompt: string,
    mode: 'SOLVE' | 'CONCEPT' | 'HINT' | 'MISTAKE_ANALYSIS' = 'CONCEPT',
    context?: any
  ): Promise<{ response: string; formulas?: string[]; follow_up_questions?: string[] }> {
    const profile = await db.getGateStudentProfile(studentId);
    const paper = await db.getGatePaperByCode(profile.target_paper);

    const systemPrompt = `You are GateGuru, a distinguished professor of engineering and premier GATE (Graduate Aptitude Test in Engineering) examination tutor for the ${paper?.name || 'Computer Science'} (${profile.target_paper}) stream.
The student is preparing for ${profile.exam_cycle} with a target score of ${profile.target_score || 75}/100.

Guidelines:
1. Provide mathematically rigorous, step-by-step explanations using KaTeX syntax ($...$ for inline and $$...$$ for display equations).
2. Clearly highlight formulas, time/space complexities, and canonical edge cases tested in GATE.
3. If mode is "HINT", DO NOT reveal the final numerical or option answer; provide an intuitive hint to guide their reasoning.
4. If mode is "SOLVE", provide a structured solution: Given Data -> Key Theorems/Formulas -> Derivation Steps -> Final Answer.
5. Emphasize common traps, unit conversions (e.g. bits vs bytes, ms vs us), and negative marking avoidance.`;

    if (config.geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        const userMessage = `Mode: ${mode}
Student Context: Paper = ${profile.target_paper}, Topic = ${context?.topic_name || 'General GATE Concept'}
Question / Prompt: ${prompt}
Additional Context: ${JSON.stringify(context || {})}`;

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
          ]
        });

        const reply = result.text || '';
        return {
          response: reply,
          formulas: [
            '\\text{EMAT} = h \\cdot (t + m) + (1-h) \\cdot (t + 2m)',
            'T(n) = a T(n/b) + \\Theta(n^k \\log^p n)',
            '\\text{Throughput} = \\frac{W_s \\cdot L}{\\text{RTT} + T_t}'
          ],
          follow_up_questions: [
            'Would you like to practice a 2-mark GATE PYQ on this exact formula?',
            'Shall we derive this using first principles?',
            'What is the common trap that causes 1/3 negative marking here?'
          ]
        };
      } catch (err) {
        logger.warn('AI Gate Tutor call failed, using deterministic educational fallback', { error: err instanceof Error ? err.message : String(err) });
      }
    }

    // Deterministic educational fallback
    let fallbackText = `### GATE Engineering Explanation (${profile.target_paper})

**Concept Overview:**
When analyzing **${context?.topic_name || 'this topic'}** in the GATE examination, you must pay strict attention to exact definitions and boundary conditions.

**Core Formula:**
$$\\text{Effective Value} = \\sum_{i=1}^n P(X = x_i) \\cdot x_i$$

**Step-by-Step Derivation:**
1. **Identify the constraints:** Check whether the question is an **MCQ** (with negative marking of $-0.33$ or $-0.66$) or a **NAT** question (no negative marks, decimal tolerance interval).
2. **Apply the theorem:** Decompose the state space into mutually exclusive cases.
3. **Verify Edge Cases:** Watch for zero indexes, strictly binary conditions, and memory alignment constraints.

*Tip for ${profile.exam_cycle}:* Never guess on 2-mark MCQs unless you have eliminated at least two options.`;

    if (mode === 'HINT') {
      fallbackText = `💡 **GATE Tutor Hint**:
Notice the critical constraint given in the problem statement. Consider how the formula behaves at the boundary condition.
- What happens when $n = 1$?
- Does the algorithm satisfy the prerequisite condition (e.g., non-negative weights, sorted input, or acyclic graph)?`;
    }

    return {
      response: fallbackText,
      formulas: ['EMAT = h*(t + m) + (1-h)*(t + 2m)'],
      follow_up_questions: [
        'Would you like to practice a similar Previous Year Question?',
        'Can I test your understanding with a quick 1-mark quiz?'
      ]
    };
  }
}

export const gateService = GateService;
