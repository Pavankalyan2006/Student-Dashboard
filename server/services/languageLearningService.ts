// server/services/languageLearningService.ts
// Comprehensive core service for the Language Learning Platform (Up to 150 Languages)

import { db } from '../db/database';
import {
  LanguageEntry,
  StudentLanguageEnrollment,
  LanguageLearningPath,
  LanguageLessonDetail,
  LanguageVocabItem,
  SpacedRepetitionCard,
  WritingSubmission,
  ConversationSession,
  ContextualTranslationResult,
  QuizSubmissionResult,
  StudentLanguageAnalytics,
  ReviewRating,
  CEFRLevel,
  StudentProficiencyLevel,
  LearningPurpose,
} from '../models/languageLearningTypes';
import {
  MASTER_LANGUAGE_CATALOG,
  SAMPLE_LEARNING_PATHS,
  SAMPLE_LESSON_DETAILS,
} from '../db/languageCatalog';
import { AIService } from '../ai/service';
import { AIMessage } from '../ai/provider';
import { ValidationError, NotFoundError, AuthorizationError, AppError } from '../core/exceptions';
import { logger } from '../core/logging';

export class LanguageLearningService {
  // =========================================================================
  // 1. Language Catalog & Discovery
  // =========================================================================

  public static async getCatalog(params: {
    query?: string;
    region?: string;
    script?: string;
    capability?: string;
    studentId?: string;
  }): Promise<{
    languages: Array<LanguageEntry & { is_enrolled?: boolean; current_level?: string }>;
    total_count: number;
    regions: string[];
    scripts: string[];
  }> {
    let list = [...MASTER_LANGUAGE_CATALOG];

    // Filter by query (English name, native name, code)
    if (params.query && params.query.trim().length > 0) {
      const q = params.query.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.native_name.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          (l.family && l.family.toLowerCase().includes(q))
      );
    }

    // Filter by region
    if (params.region && params.region !== 'ALL') {
      list = list.filter((l) => l.region.toLowerCase() === params.region!.toLowerCase());
    }

    // Filter by script
    if (params.script && params.script !== 'ALL') {
      list = list.filter((l) =>
        l.scripts.some((s) => s.toLowerCase() === params.script!.toLowerCase())
      );
    }

    // Filter by capability
    if (params.capability && params.capability !== 'ALL') {
      const capKey = params.capability as keyof LanguageEntry['capabilities'];
      list = list.filter((l) => l.capabilities[capKey] === 'SUPPORTED');
    }

    // Attach student enrollment status if studentId provided
    let enrolledMap = new Map<string, StudentLanguageEnrollment>();
    if (params.studentId) {
      const enrollments = await db.getLanguageEnrollments(params.studentId);
      for (const e of enrollments) {
        enrolledMap.set(e.language_code.toLowerCase(), e);
      }
    }

    const enhanced = list.map((l) => {
      const enrollment = enrolledMap.get(l.code.toLowerCase());
      return {
        ...l,
        is_enrolled: !!enrollment,
        current_level: enrollment ? enrollment.cefr_level : undefined,
      };
    });

    // Collect available unique regions and scripts for frontend filter tabs
    const regions = Array.from(new Set(MASTER_LANGUAGE_CATALOG.map((l) => l.region)));
    const scripts = Array.from(
      new Set(MASTER_LANGUAGE_CATALOG.flatMap((l) => l.scripts))
    ).sort();

    return {
      languages: enhanced,
      total_count: enhanced.length,
      regions: ['ALL', ...regions],
      scripts: ['ALL', ...scripts],
    };
  }

  public static async getLanguageByCode(code: string): Promise<LanguageEntry> {
    if (code.toLowerCase() === 'en') {
      return {
        code: 'en',
        name: 'English',
        native_name: 'English',
        family: 'Germanic',
        region: 'European',
        scripts: ['Latin'],
        direction: 'ltr',
        flag_emoji: '🇬🇧',
        sample_phrase: 'Hello! How are you?',
        sample_translation: 'Hello! How are you?',
        capabilities: {
          text_lessons: 'SUPPORTED',
          vocabulary: 'SUPPORTED',
          grammar: 'SUPPORTED',
          translation: 'SUPPORTED',
          tts_audio: 'SUPPORTED',
          speech_recognition: 'SUPPORTED',
          pronunciation_eval: 'SUPPORTED',
          listening: 'SUPPORTED',
          reading: 'SUPPORTED',
          writing_feedback: 'SUPPORTED',
          ai_conversation: 'SUPPORTED',
          quizzes: 'SUPPORTED',
        },
        available_levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        total_lessons_count: 30,
        total_vocabulary_count: 500,
        description: 'Global standard English.',
        writing_system_overview: 'Latin alphabet with 26 letters.',
      };
    }
    const lang = MASTER_LANGUAGE_CATALOG.find((l) => l.code.toLowerCase() === code.toLowerCase());
    if (!lang) {
      throw new NotFoundError(`Language with code '${code}' not found in catalog.`);
    }
    return lang;
  }

  // =========================================================================
  // 2. Student Enrollment & Onboarding
  // =========================================================================

  public static async enrollStudent(
    studentId: string,
    params: {
      language_code: string;
      purpose?: LearningPurpose;
      current_level?: StudentProficiencyLevel;
      target_level?: string;
      explanation_language?: string;
      daily_goal_minutes?: number;
      preferred_methods?: string[];
    }
  ): Promise<StudentLanguageEnrollment> {
    if (!params.language_code) {
      throw new ValidationError('Language code is required for enrollment.');
    }

    const lang = await this.getLanguageByCode(params.language_code);

    const cefrMap: Record<StudentProficiencyLevel, CEFRLevel> = {
      COMPLETE_BEGINNER: 'A1',
      BEGINNER: 'A2',
      ELEMENTARY: 'B1',
      INTERMEDIATE: 'B2',
      UPPER_INTERMEDIATE: 'C1',
      ADVANCED: 'C2',
    };

    const level = params.current_level || 'COMPLETE_BEGINNER';
    const cefr = cefrMap[level] || 'A1';

    const enrollment: StudentLanguageEnrollment = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      student_id: studentId,
      language_code: lang.code.toLowerCase(),
      purpose: params.purpose || 'CAREER',
      current_level: level,
      cefr_level: cefr,
      target_level: params.target_level || 'B2',
      explanation_language: params.explanation_language || 'English',
      daily_goal_minutes: params.daily_goal_minutes || 15,
      preferred_methods: params.preferred_methods || ['LESSONS', 'FLASHCARDS', 'CONVERSATION'],
      enrolled_at: new Date().toISOString(),
      last_studied_at: new Date().toISOString(),
      current_streak_days: 1,
      total_minutes_studied: 0,
      completed_lessons_count: 0,
      mastered_vocab_count: 0,
      weak_topics: [],
      status: 'ACTIVE',
    };

    const saved = await db.saveLanguageEnrollment(enrollment);

    // Seed initial foundational vocabulary cards into Spaced Repetition for this student & language
    await this.seedFoundationalSpacedRepetition(studentId, lang.code.toLowerCase());

    logger.info(`Student ${studentId} enrolled in ${lang.name} (${lang.code})`);
    return saved;
  }

  public static async getStudentEnrollments(
    studentId: string
  ): Promise<Array<StudentLanguageEnrollment & { language: LanguageEntry }>> {
    const enrollments = await db.getLanguageEnrollments(studentId);
    return enrollments.map((e) => {
      const lang = MASTER_LANGUAGE_CATALOG.find(
        (l) => l.code.toLowerCase() === e.language_code.toLowerCase()
      ) || {
        code: e.language_code,
        name: e.language_code.toUpperCase(),
        native_name: e.language_code.toUpperCase(),
        family: 'Unknown',
        region: 'Other' as const,
        scripts: ['Latin'],
        direction: 'ltr' as const,
        flag_emoji: '🌐',
        sample_phrase: '',
        sample_translation: '',
        capabilities: {
          text_lessons: 'LIMITED',
          vocabulary: 'LIMITED',
          grammar: 'LIMITED',
          translation: 'SUPPORTED',
          tts_audio: 'LIMITED',
          speech_recognition: 'UNAVAILABLE',
          pronunciation_eval: 'UNAVAILABLE',
          listening: 'LIMITED',
          reading: 'LIMITED',
          writing_feedback: 'LIMITED',
          ai_conversation: 'LIMITED',
          quizzes: 'LIMITED',
        },
        available_levels: ['A1' as const],
        total_lessons_count: 10,
        total_vocabulary_count: 100,
        description: '',
        writing_system_overview: '',
      };

      return {
        ...e,
        language: lang,
      };
    });
  }

  public static async getStudentDashboard(studentId: string, langCode: string) {
    const enrollment = await db.getLanguageEnrollment(studentId, langCode);
    if (!enrollment) {
      throw new NotFoundError(`Student is not enrolled in language '${langCode}'.`);
    }

    const lang = await this.getLanguageByCode(langCode);
    const paths = await this.getLearningPaths(langCode);
    const completedProgress = await db.getAllStudentLanguageLessonProgress(studentId, langCode);
    const completedSet = new Set(completedProgress.map((p) => p.lesson_id));

    // Determine continue learning lesson
    let nextLesson: { path_id: string; lesson_id: string; title: string; order: number } | null = null;
    for (const path of paths) {
      for (const lesson of path.lessons) {
        if (!completedSet.has(lesson.id)) {
          nextLesson = {
            path_id: path.id,
            lesson_id: lesson.id,
            title: lesson.title,
            order: lesson.order,
          };
          break;
        }
      }
      if (nextLesson) break;
    }

    const cards = await db.getSpacedRepetitionCards(studentId, langCode);
    const todayStr = new Date().toISOString().split('T')[0];
    const dueReviews = cards.filter((c) => !c.next_review_date || c.next_review_date <= todayStr);
    const recentQuizzes = await db.getLanguageQuizAttempts(studentId, langCode);

    return {
      enrollment,
      language: lang,
      continue_lesson: nextLesson,
      total_lessons: paths.flatMap((p) => p.lessons).length,
      completed_lessons: completedSet.size,
      progress_percentage: Math.min(
        100,
        Math.round((completedSet.size / Math.max(1, paths.flatMap((p) => p.lessons).length)) * 100)
      ),
      vocabulary_due_count: dueReviews.length,
      mastered_vocab_count: cards.filter((c) => c.is_mastered).length,
      total_saved_vocab: cards.length,
      recent_quizzes: recentQuizzes.slice(0, 5),
      learning_paths: paths,
    };
  }

  // =========================================================================
  // 3. Learning Paths & Curricula
  // =========================================================================

  public static async getLearningPaths(langCode: string): Promise<LanguageLearningPath[]> {
    const code = langCode.toLowerCase();
    if (SAMPLE_LEARNING_PATHS[code]) {
      return SAMPLE_LEARNING_PATHS[code];
    }

    // Procedural curriculum for any catalog language
    const lang = await this.getLanguageByCode(code);
    return [
      {
        id: `path_${code}_a1`,
        language_code: code,
        level: 'A1',
        title: `Beginner ${lang.name} Fundamentals (A1)`,
        description: `Foundations of ${lang.name}: alphabet, essential greetings, numbers, and basic sentence construction.`,
        estimated_hours: 10,
        lessons: [
          { id: `les_${code}_1`, path_id: `path_${code}_a1`, order: 1, title: `Essential Greetings & Introductions`, level: 'A1', estimated_duration_min: 15 },
          { id: `les_${code}_2`, path_id: `path_${code}_a1`, order: 2, title: `Numbers, Dates, and Time`, level: 'A1', estimated_duration_min: 20 },
          { id: `les_${code}_3`, path_id: `path_${code}_a1`, order: 3, title: `Everyday Nouns and Sentence Structure`, level: 'A1', estimated_duration_min: 25 },
        ],
      },
      {
        id: `path_${code}_a2`,
        language_code: code,
        level: 'A2',
        title: `Elementary ${lang.name} Communication (A2)`,
        description: `Practical conversational skills: ordering food, asking directions, and describing routine actions.`,
        estimated_hours: 14,
        lessons: [
          { id: `les_${code}_4`, path_id: `path_${code}_a2`, order: 4, title: `Travel, Directions, and Transit`, level: 'A2', estimated_duration_min: 25 },
          { id: `les_${code}_5`, path_id: `path_${code}_a2`, order: 5, title: `Food, Dining, and Daily Life`, level: 'A2', estimated_duration_min: 25 },
        ],
      },
    ];
  }

  public static async getLesson(studentId: string, langCode: string, lessonId: string): Promise<LanguageLessonDetail> {
    const code = langCode.toLowerCase();
    let detail: LanguageLessonDetail | undefined = SAMPLE_LESSON_DETAILS[lessonId];

    if (!detail) {
      // Procedurally generate rich, fully-structured lesson for the requested language
      const lang = await this.getLanguageByCode(code);
      detail = {
        id: lessonId,
        language_code: code,
        path_id: `path_${code}_a1`,
        order: 1,
        level: 'A1',
        title: `${lang.name} Foundation & Daily Phrases`,
        objectives: [
          `Learn essential spoken and written greetings in ${lang.name}.`,
          `Understand fundamental polite forms and cultural introduction etiquette.`,
          `Practice recognizing native script glyphs and Romanized pronunciation.`,
        ],
        estimated_duration_min: 20,
        explanation: `${lang.name} (${lang.native_name}) belongs to the ${lang.family} family. This lesson introduces everyday conversational patterns and cultural conventions.`,
        native_script_examples: [
          { target: lang.sample_phrase, script: lang.sample_phrase, transliteration: lang.pronunciation_guide || lang.sample_phrase, translation: lang.sample_translation, breakdown: 'Core polite greeting' },
        ],
        grammar_notes: [
          {
            concept: 'Basic Sentence Word Order',
            rule: `In ${lang.name}, sentence structure follows standard syntactic rules with polite conversational markers.`,
            pattern: 'Subject + Object + Verb / Subject + Verb + Object',
            positive_examples: [lang.sample_phrase],
            negative_examples: ['Avoid omitting essential polite address markers in formal settings.'],
            common_mistakes: ['Mixing formal and informal registers.'],
          },
        ],
        vocabulary: [
          {
            id: `v_${code}_sample_1`,
            language_code: code,
            word: lang.sample_phrase.split(' ')[0] || lang.native_name,
            native_script: lang.sample_phrase.split(' ')[0] || lang.native_name,
            transliteration: lang.pronunciation_guide || 'Pronounced naturally',
            translation: lang.sample_translation.split(' ')[0] || 'Hello',
            part_of_speech: 'Greeting',
            example_sentence: lang.sample_phrase,
            example_translation: lang.sample_translation,
            topic: 'Greetings',
            difficulty: 'BEGINNER',
            provenance: 'Master Catalog',
          },
        ],
        interactive_exercises: [
          {
            id: `ex_${code}_1`,
            type: 'MCQ',
            prompt: `What does "${lang.sample_phrase.split(' ')[0] || lang.name}" typically express?`,
            options: ['A polite greeting or introduction', 'A farewell expression', 'A negative response', 'A question marker'],
            correct_answer: 'A polite greeting or introduction',
            explanation: `This is a fundamental polite greeting in ${lang.name}.`,
          },
        ],
        quiz_questions: [
          {
            id: `qq_${code}_1`,
            type: 'MCQ',
            question: `Which writing system is primarily used for ${lang.name}?`,
            options: [lang.scripts[0] || 'Latin', 'Hieroglyphs', 'Cuneiform', 'Runes'],
            correct_index: 0,
            explanation: `${lang.name} is written in the ${lang.scripts.join(', ')} script.`,
          },
        ],
      };
    }

    // Attach student progress and personal notes
    const progress = await db.getLanguageLessonProgress(studentId, code, lessonId);
    return {
      ...detail,
      is_completed: !!progress,
      student_notes: progress?.notes,
    };
  }

  public static async saveLessonProgress(
    studentId: string,
    langCode: string,
    lessonId: string,
    completed: boolean,
    notes?: string
  ): Promise<{ success: boolean; completed_lessons_count: number }> {
    const code = langCode.toLowerCase();
    // Only lessons that exist in this language's curriculum can be completed; an arbitrary id
    // used to be stored and counted towards progress.
    await this.getLanguageByCode(code);
    const paths = await this.getLearningPaths(code);
    if (!paths.some((p) => p.lessons.some((l) => l.id === lessonId))) {
      throw new NotFoundError(`Lesson '${lessonId}' is not part of the ${code} curriculum.`);
    }
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 5000)) {
      throw new ValidationError('Lesson notes must be text of at most 5000 characters.');
    }
    if (completed) {
      await db.saveLanguageLessonProgress(studentId, code, lessonId, {
        completed_at: new Date().toISOString(),
        notes,
      });
    }

    const completedList = await db.getAllStudentLanguageLessonProgress(studentId, code);
    return {
      success: true,
      completed_lessons_count: completedList.length,
    };
  }

  // =========================================================================
  // 4. Vocabulary Trainer & Spaced Repetition (SM-2 Algorithm)
  // =========================================================================

  private static async seedFoundationalSpacedRepetition(studentId: string, langCode: string): Promise<void> {
    const existing = await db.getSpacedRepetitionCards(studentId, langCode);
    if (existing.length > 0) return;

    // Grab vocabulary from lesson 1 if available
    const lesson1Id = `les_${langCode}_1`;
    let vocabItems: LanguageVocabItem[] = [];
    if (SAMPLE_LESSON_DETAILS[lesson1Id]) {
      vocabItems = SAMPLE_LESSON_DETAILS[lesson1Id].vocabulary;
    } else {
      const lang = await this.getLanguageByCode(langCode);
      vocabItems = [
        {
          id: `v_${langCode}_seed_1`,
          language_code: langCode,
          word: lang.sample_phrase.split(' ')[0] || lang.native_name,
          native_script: lang.sample_phrase.split(' ')[0] || lang.native_name,
          transliteration: lang.pronunciation_guide,
          translation: lang.sample_translation.split(' ')[0] || 'Hello',
          part_of_speech: 'Greeting',
          example_sentence: lang.sample_phrase,
          example_translation: lang.sample_translation,
          topic: 'Greetings',
          difficulty: 'BEGINNER',
          provenance: 'Master Catalog',
        },
      ];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    for (const v of vocabItems) {
      const card: SpacedRepetitionCard = {
        id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        student_id: studentId,
        language_code: langCode,
        vocab_id: v.id,
        word: v.word,
        native_script: v.native_script,
        transliteration: v.transliteration,
        translation: v.translation,
        example_sentence: v.example_sentence,
        example_translation: v.example_translation,
        part_of_speech: v.part_of_speech,
        repetition_count: 0,
        interval_days: 1,
        ease_factor: 2.5,
        next_review_date: todayStr,
        last_reviewed_at: new Date().toISOString(),
        difficulty_rating: 'GOOD',
        is_bookmarked: false,
        is_mastered: false,
      };
      await db.saveSpacedRepetitionCard(card);
    }
  }

  public static async getVocabularyCards(studentId: string, langCode: string, topic?: string) {
    const code = langCode.toLowerCase();
    const cards = await db.getSpacedRepetitionCards(studentId, code);
    return cards;
  }

  public static async bookmarkVocab(
    studentId: string,
    langCode: string,
    cardId: string,
    bookmarked: boolean
  ): Promise<SpacedRepetitionCard> {
    const cards = await db.getSpacedRepetitionCards(studentId, langCode);
    const card = cards.find((c) => c.id === cardId || c.vocab_id === cardId);
    if (!card) {
      throw new NotFoundError(`Vocabulary card '${cardId}' not found for student.`);
    }

    card.is_bookmarked = bookmarked;
    return await db.saveSpacedRepetitionCard(card);
  }

  /**
   * SuperMemo SM-2 Interval Calculation
   */
  public static async reviewSpacedVocab(
    studentId: string,
    langCode: string,
    cardId: string,
    rating: ReviewRating
  ): Promise<SpacedRepetitionCard> {
    const cards = await db.getSpacedRepetitionCards(studentId, langCode);
    const card = cards.find((c) => c.id === cardId || c.vocab_id === cardId);
    if (!card) {
      throw new NotFoundError(`Card with ID '${cardId}' not found.`);
    }

    // Map rating to grade (0 to 5)
    const gradeMap: Record<ReviewRating, number> = {
      AGAIN: 0,
      HARD: 3,
      GOOD: 4,
      EASY: 5,
    };
    const grade = gradeMap[String(rating).toUpperCase() as ReviewRating];
    if (grade === undefined) {
      // An unknown rating used to fall through as a pass and advance the card.
      throw new ValidationError('Rating must be AGAIN, HARD, GOOD or EASY.');
    }

    if (grade < 3) {
      // Repeat from start if failed
      card.repetition_count = 0;
      card.interval_days = 1;
      card.is_mastered = false;
    } else {
      if (card.repetition_count === 0) {
        card.interval_days = 1;
      } else if (card.repetition_count === 1) {
        card.interval_days = 6;
      } else {
        card.interval_days = Math.round(card.interval_days * card.ease_factor);
      }
      card.repetition_count += 1;
      if (card.repetition_count >= 3 && card.interval_days >= 6) {
        card.is_mastered = true;
      }
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    card.ease_factor = Math.max(1.3, card.ease_factor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval_days);
    card.next_review_date = nextDate.toISOString().split('T')[0];
    card.last_reviewed_at = new Date().toISOString();
    card.difficulty_rating = rating;

    return await db.saveSpacedRepetitionCard(card);
  }

  public static async getDueRevisions(studentId: string, langCode: string): Promise<SpacedRepetitionCard[]> {
    const cards = await db.getSpacedRepetitionCards(studentId, langCode);
    const todayStr = new Date().toISOString().split('T')[0];
    return cards.filter((c) => !c.next_review_date || c.next_review_date <= todayStr);
  }

  // =========================================================================
  // 5. Writing Practice & AI Evaluation
  // =========================================================================

  public static async submitWritingPractice(
    studentId: string,
    langCode: string,
    params: { prompt_type: string; prompt_text: string; student_text: string }
  ): Promise<WritingSubmission> {
    if (!params.student_text || params.student_text.trim().length === 0) {
      throw new ValidationError('Student writing submission cannot be empty.');
    }

    const lang = await this.getLanguageByCode(langCode);
    const submissionId = `wrt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let aiFeedback: WritingSubmission['ai_feedback'] | undefined = undefined;

    try {
      const prompt = `You are a certified language coach for ${lang.name} (${lang.native_name}).
Review the student's writing submission for:
Prompt: "${params.prompt_text}"
Student Response: "${params.student_text}"

Evaluate and respond ONLY with a valid JSON object matching this schema:
{
  "corrected_text": "polite, natural corrected version of the student's submission in ${lang.name}",
  "grammar_score": 85,
  "vocabulary_score": 90,
  "clarity_score": 88,
  "overall_score": 88,
  "spelling_corrections": [
    { "original": "typo", "corrected": "fixed", "explanation": "why this correction is required" }
  ],
  "grammar_points": ["Key grammar explanation 1", "Key grammar explanation 2"],
  "tone_analysis": "Formal / Casual / Natural",
  "positive_reinforcement": "Encouraging remark on student strengths"
}`;

      const messages: AIMessage[] = [{ role: 'user', content: prompt }];
      const res = await AIService.generate(messages, undefined, 0.2);
      const jsonMatch = res.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiFeedback = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn('AI writing feedback evaluation failed; returning 503', { error: err instanceof Error ? err.message : String(err) });
    }

    // Scores and corrections come only from the model; nothing is saved with invented scores.
    if (!aiFeedback || typeof aiFeedback.overall_score !== 'number') {
      throw new AppError('Writing feedback needs the AI provider, which is not available right now. Your text was not submitted.', 503, 'AI_UNAVAILABLE');
    }

    const submission: WritingSubmission = {
      id: submissionId,
      student_id: studentId,
      language_code: lang.code.toLowerCase(),
      prompt_type: params.prompt_type,
      prompt_text: params.prompt_text,
      student_text: params.student_text,
      created_at: new Date().toISOString(),
      ai_feedback: aiFeedback,
    };

    return await db.saveWritingSubmission(submission);
  }

  public static async getWritingSubmissions(studentId: string, langCode: string): Promise<WritingSubmission[]> {
    return await db.getWritingSubmissions(studentId, langCode);
  }

  // =========================================================================
  // 6. AI Conversation Partner
  // =========================================================================

  public static async startConversation(
    studentId: string,
    langCode: string,
    scenario: string = 'Meeting someone at a university campus',
    mode: 'PRACTICE' | 'CORRECTION' = 'PRACTICE'
  ): Promise<ConversationSession> {
    const lang = await this.getLanguageByCode(langCode);
    const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate initial greeting from AI partner in target language
    const initialText = `${lang.sample_phrase} ${lang.direction === 'rtl' ? '' : '😊'}`;
    const initialTranslation = `${lang.sample_translation}`;

    const session: ConversationSession = {
      id: sessionId,
      student_id: studentId,
      language_code: lang.code.toLowerCase(),
      scenario,
      mode,
      messages: [
        {
          id: `msg_${Date.now()}_ai_0`,
          sender: 'ai',
          text: initialText,
          translation: initialTranslation,
          timestamp: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      session_summary: {
        vocabulary_acquired: [lang.sample_phrase.split(' ')[0] || lang.native_name],
        grammar_tips: ['Use polite conversational openings when speaking to new acquaintances.'],
        corrections_made: 0,
      },
    };

    return await db.saveConversationSession(session);
  }

  public static async sendConversationMessage(
    studentId: string,
    sessionId: string,
    messageText: string
  ): Promise<ConversationSession> {
    const session = await db.getConversationSession(studentId, sessionId);
    if (!session) {
      throw new NotFoundError(`Conversation session '${sessionId}' not found.`);
    }

    if (session.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to access this conversation session.');
    }

    const lang = await this.getLanguageByCode(session.language_code);

    if (!messageText || !String(messageText).trim()) {
      throw new ValidationError('Message cannot be empty.');
    }
    const studentMessage = {
      id: `msg_${Date.now()}_std`,
      sender: 'student' as const,
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    let aiReplyText = '';
    let aiTranslation = '';
    let aiCorrection: string | undefined = undefined;

    try {
      const systemPrompt = `You are a friendly, encouraging native conversation partner in ${lang.name} (${lang.native_name}).
Scenario: "${session.scenario}"
Mode: ${session.mode === 'CORRECTION' ? 'Correction Mode (point out errors, provide better phrasing)' : 'Practice Mode (respond naturally)'}.
Current conversation history:
${[...session.messages, studentMessage].map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

Respond ONLY with a valid JSON object matching this schema:
{
  "reply_in_target_language": "Natural reply in ${lang.name}",
  "english_translation": "Accurate English translation of the reply",
  "correction_note": "Optional tip or corrected phrasing if the student made a grammar/spelling error"
}`;

      const res = await AIService.generate([{ role: 'user', content: systemPrompt }], undefined, 0.4);
      const jsonMatch = res.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiReplyText = parsed.reply_in_target_language;
        aiTranslation = parsed.english_translation;
        aiCorrection = parsed.correction_note;
      }
    } catch (err) {
      logger.warn('AI conversation generation failed; returning 503', { error: err instanceof Error ? err.message : String(err) });
    }

    // No model reply: the conversation is left unchanged rather than answered with a stock phrase.
    if (!aiReplyText) {
      throw new AppError('The conversation partner needs the AI provider, which is not available right now. Your message was not sent.', 503, 'AI_UNAVAILABLE');
    }

    session.messages.push(studentMessage);

    // Append AI reply
    session.messages.push({
      id: `msg_${Date.now()}_ai`,
      sender: 'ai',
      text: aiReplyText,
      translation: aiTranslation,
      correction: aiCorrection,
      timestamp: new Date().toISOString(),
    });

    session.updated_at = new Date().toISOString();
    return await db.saveConversationSession(session);
  }

  public static async getConversationSessions(studentId: string, langCode: string): Promise<ConversationSession[]> {
    return await db.getConversationSessions(studentId, langCode);
  }

  // =========================================================================
  // 7. Contextual AI Translation & Language Comparison
  // =========================================================================

  public static async contextualTranslate(
    sourceLang: string,
    targetLang: string,
    inputText: string
  ): Promise<ContextualTranslationResult> {
    if (!inputText || inputText.trim().length === 0) {
      throw new ValidationError('Input text for translation cannot be empty.');
    }

    const src = await this.getLanguageByCode(sourceLang);
    const tgt = await this.getLanguageByCode(targetLang);

    let result: ContextualTranslationResult | null = null;

    try {
      const prompt = `Translate the following text from ${src.name} to ${tgt.name}.
Input: "${inputText}"

Provide a rich linguistic breakdown. Respond ONLY in valid JSON:
{
  "primary_translation": "Most accurate, natural translation",
  "transliteration": "Phonetic / romanized guide if target language uses non-Latin script",
  "alternative_translations": ["Alternative 1", "Alternative 2"],
  "formal_variant": "Formal or respectful version",
  "informal_variant": "Casual peer version",
  "word_breakdown": [
    { "word": "word", "meaning": "English meaning", "pos": "Noun/Verb/etc." }
  ],
  "grammar_explanation": "Concise grammatical explanation of structure",
  "contextual_warning": "Any idiomatic, cultural, or register nuances",
  "example_sentences": [
    { "target": "example in ${tgt.name}", "source": "meaning in ${src.name}" }
  ]
}`;

      const res = await AIService.generate([{ role: 'user', content: prompt }], undefined, 0.2);
      const jsonMatch = res.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          source_lang: src.code,
          target_lang: tgt.code,
          input_text: inputText,
          ...parsed,
        };
      }
    } catch (err) {
      logger.warn('AI contextual translation failed; returning 503', { error: err instanceof Error ? err.message : String(err) });
    }

    if (!result || !result.primary_translation) {
      throw new AppError('Translation needs the AI provider, which is not available right now.', 503, 'AI_UNAVAILABLE');
    }

    return result;
  }

  // =========================================================================
  // 8. Quizzes & Assessments
  // =========================================================================

  public static async submitQuiz(
    studentId: string,
    langCode: string,
    quizId: string,
    answers: Array<{ question_id: string; selected_index: number; selected_text?: string }>
  ): Promise<QuizSubmissionResult> {
    const code = langCode.toLowerCase();
    const lesson = await this.getLesson(studentId, code, quizId);
    const questions = lesson.quiz_questions || [];
    if (!Array.isArray(answers)) {
      throw new ValidationError('answers must be a list of { question_id, selected_index }.');
    }
    if (questions.length === 0) {
      throw new ValidationError('This lesson has no quiz questions.');
    }

    let correctCount = 0;
    const questionResults: QuizSubmissionResult['question_results'] = [];

    for (const q of questions) {
      const studentAns = answers.find((a) => a.question_id === q.id);
      const isCorrect = studentAns !== undefined && studentAns.selected_index === q.correct_index;
      if (isCorrect) correctCount++;

      questionResults.push({
        question_id: q.id,
        question: q.question,
        user_answer:
          studentAns !== undefined && studentAns.selected_index !== undefined
            ? q.options[studentAns.selected_index] || 'No Answer'
            : 'No Answer',
        correct_answer: q.options[q.correct_index],
        is_correct: isCorrect,
        explanation: q.explanation,
      });
    }

    const totalQuestions = Math.max(1, questions.length);
    const scorePct = Math.round((correctCount / totalQuestions) * 100);

    const result: QuizSubmissionResult = {
      quiz_id: quizId,
      language_code: code,
      total_questions: totalQuestions,
      correct_count: correctCount,
      score_percentage: scorePct,
      passed: scorePct >= 70,
      question_results: questionResults,
      submitted_at: new Date().toISOString(),
    };

    await db.saveLanguageQuizAttempt(studentId, result);
    return result;
  }

  // =========================================================================
  // 9. Unified Language Learning Analytics
  // =========================================================================

  public static async getStudentAnalytics(studentId: string): Promise<StudentLanguageAnalytics> {
    return await db.getStudentLanguageAnalytics(studentId);
  }

  public static async deleteStudentLanguageData(studentId: string, langCode: string): Promise<boolean> {
    await db.deleteLanguageEnrollment(studentId, langCode);
    return true;
  }
}
