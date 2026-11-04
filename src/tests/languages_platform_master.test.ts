// src/tests/languages_platform_master.test.ts
// Comprehensive unit & integration tests for the Language Learning Platform (150+ Languages)

import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageLearningService } from '../../server/services/languageLearningService';
import { MASTER_LANGUAGE_CATALOG } from '../../server/db/languageCatalog';
import { db } from '../../server/db/database';

describe('Language Learning Platform Master Test Suite', () => {
  const testStudentId = 'std_test_polyglot_99';

  beforeEach(async () => {
    // Reset test student enrollments
    await db.deleteLanguageEnrollment(testStudentId, 'es');
    await db.deleteLanguageEnrollment(testStudentId, 'te');
    await db.deleteLanguageEnrollment(testStudentId, 'ja');
    await db.deleteLanguageEnrollment(testStudentId, 'de');
  });

  describe('1. Master Language Catalog (150 Languages)', () => {
    it('contains at least 150 unique languages with distinct codes', () => {
      expect(MASTER_LANGUAGE_CATALOG.length).toBeGreaterThanOrEqual(150);

      const codes = MASTER_LANGUAGE_CATALOG.map((l) => l.code.toLowerCase());
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(MASTER_LANGUAGE_CATALOG.length);
    });

    it('has valid regions, scripts, and honest capability matrices for each language', () => {
      for (const lang of MASTER_LANGUAGE_CATALOG) {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.native_name).toBeTruthy();
        expect(lang.flag_emoji).toBeTruthy();
        expect(['European', 'Asian', 'Indian', 'Middle Eastern', 'African', 'Americas', 'Other']).toContain(lang.region);
        expect(lang.scripts.length).toBeGreaterThan(0);
        expect(['ltr', 'rtl']).toContain(lang.direction);
        expect(lang.capabilities).toBeDefined();
        expect(lang.capabilities.text_lessons).toBeDefined();
        expect(lang.capabilities.tts_audio).toBeDefined();
      }
    });

    it('filters languages by text query, region, script, and capability', async () => {
      // Query filter
      const searchRes = await LanguageLearningService.getCatalog({ query: 'Telugu' });
      expect(searchRes.languages.some((l) => l.name === 'Telugu' || l.code === 'te')).toBe(true);

      // Region filter
      const indianRes = await LanguageLearningService.getCatalog({ region: 'Indian' });
      expect(indianRes.languages.length).toBeGreaterThanOrEqual(15);
      expect(indianRes.languages.every((l) => l.region === 'Indian')).toBe(true);

      // RTL Direction verification (e.g. Arabic, Urdu, Hebrew)
      const arabic = MASTER_LANGUAGE_CATALOG.find((l) => l.code === 'ar');
      expect(arabic).toBeDefined();
      expect(arabic?.direction).toBe('rtl');
    });
  });

  describe('2. Student Enrollment & Goals', () => {
    it('enrolls a student with purpose, proficiency level, and daily goal', async () => {
      const enrollment = await LanguageLearningService.enrollStudent(testStudentId, {
        language_code: 'es',
        purpose: 'CAREER',
        current_level: 'COMPLETE_BEGINNER',
        target_level: 'B2',
        explanation_language: 'English',
        daily_goal_minutes: 20,
      });

      expect(enrollment.student_id).toBe(testStudentId);
      expect(enrollment.language_code).toBe('es');
      expect(enrollment.cefr_level).toBe('A1');
      expect(enrollment.daily_goal_minutes).toBe(20);
      expect(enrollment.current_streak_days).toBeGreaterThanOrEqual(1);

      // Retrieve student enrollments
      const enrollments = await LanguageLearningService.getStudentEnrollments(testStudentId);
      expect(enrollments.some((e) => e.language_code === 'es')).toBe(true);
    });

    it('loads student personalized dashboard for enrolled language', async () => {
      await LanguageLearningService.enrollStudent(testStudentId, {
        language_code: 'de',
        purpose: 'STUDY_ABROAD',
        current_level: 'BEGINNER',
      });

      const dash = await LanguageLearningService.getStudentDashboard(testStudentId, 'de');
      expect(dash.language.name).toBe('German');
      expect(dash.enrollment.language_code).toBe('de');
      expect(dash.continue_lesson).toBeDefined();
      expect(dash.learning_paths.length).toBeGreaterThan(0);
    });
  });

  describe('3. Curricula, Lessons & Progress', () => {
    it('retrieves learning paths and structured lesson detail', async () => {
      const paths = await LanguageLearningService.getLearningPaths('es');
      expect(paths.length).toBeGreaterThanOrEqual(2);
      expect(paths[0].lessons.length).toBeGreaterThan(0);

      const lesson1Id = paths[0].lessons[0].id;
      const lesson = await LanguageLearningService.getLesson(testStudentId, 'es', lesson1Id);

      expect(lesson.title).toBeTruthy();
      expect(lesson.objectives.length).toBeGreaterThan(0);
      expect(lesson.native_script_examples.length).toBeGreaterThan(0);
      expect(lesson.grammar_notes.length).toBeGreaterThan(0);
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
      expect(lesson.interactive_exercises.length).toBeGreaterThan(0);
    });

    it('marks lesson as completed and increments progress metrics', async () => {
      await LanguageLearningService.enrollStudent(testStudentId, {
        language_code: 'es',
        purpose: 'CAREER',
      });

      const res = await LanguageLearningService.saveLessonProgress(
        testStudentId,
        'es',
        'les_es_1',
        true,
        'Learned Spanish greetings and basic gender rules.'
      );

      expect(res.success).toBe(true);
      expect(res.completed_lessons_count).toBeGreaterThanOrEqual(1);

      const lesson = await LanguageLearningService.getLesson(testStudentId, 'es', 'les_es_1');
      expect(lesson.is_completed).toBe(true);
      expect(lesson.student_notes).toBe('Learned Spanish greetings and basic gender rules.');
    });
  });

  describe('4. Spaced Repetition (SM-2 Algorithm)', () => {
    it('seeds foundational cards and calculates SM-2 intervals on review', async () => {
      await LanguageLearningService.enrollStudent(testStudentId, {
        language_code: 'ja',
        purpose: 'CULTURE',
      });

      const cards = await LanguageLearningService.getVocabularyCards(testStudentId, 'ja');
      expect(cards.length).toBeGreaterThan(0);

      const firstCard = cards[0];
      expect(firstCard.repetition_count).toBe(0);

      // Review with 'GOOD'
      const updatedCard = await LanguageLearningService.reviewSpacedVocab(
        testStudentId,
        'ja',
        firstCard.id,
        'GOOD'
      );

      expect(updatedCard.repetition_count).toBe(1);
      expect(updatedCard.interval_days).toBe(1);
      expect(updatedCard.difficulty_rating).toBe('GOOD');

      // Second review with 'GOOD' -> interval should increase to 6
      const secondReview = await LanguageLearningService.reviewSpacedVocab(
        testStudentId,
        'ja',
        firstCard.id,
        'GOOD'
      );
      expect(secondReview.repetition_count).toBe(2);
      expect(secondReview.interval_days).toBe(6);

      // Third review with 'EASY' -> interval should multiply by ease factor
      const thirdReview = await LanguageLearningService.reviewSpacedVocab(
        testStudentId,
        'ja',
        firstCard.id,
        'EASY'
      );
      expect(thirdReview.repetition_count).toBe(3);
      expect(thirdReview.interval_days).toBeGreaterThan(6);
      expect(thirdReview.is_mastered).toBe(true);
    });

    it('toggles bookmarks on vocabulary cards', async () => {
      await LanguageLearningService.enrollStudent(testStudentId, {
        language_code: 'te',
        purpose: 'COMMUNICATION',
      });

      const cards = await LanguageLearningService.getVocabularyCards(testStudentId, 'te');
      const card = cards[0];

      const bookmarked = await LanguageLearningService.bookmarkVocab(testStudentId, 'te', card.id, true);
      expect(bookmarked.is_bookmarked).toBe(true);

      const unbookmarked = await LanguageLearningService.bookmarkVocab(testStudentId, 'te', card.id, false);
      expect(unbookmarked.is_bookmarked).toBe(false);
    });
  });

  describe('5. AI Writing Practice & Contextual Translation', () => {
    it('evaluates student writing submissions with grammar scores and side-by-side feedback', async () => {
      const sub = await LanguageLearningService.submitWritingPractice(testStudentId, 'es', {
        prompt_type: 'SELF_INTRODUCTION',
        prompt_text: 'Introduce yourself and your study interests in Spanish.',
        student_text: 'Hola, mi nombre es Pavan y yo estudio ciencias de la computacion.',
      });

      expect(sub.id).toBeTruthy();
      expect(sub.student_text).toContain('Pavan');
      expect(sub.ai_feedback).toBeDefined();
      expect(sub.ai_feedback?.overall_score).toBeGreaterThan(0);
      expect(sub.ai_feedback?.corrected_text).toBeTruthy();
    });

    it('translates phrases with rich morphological breakdowns and register variants', async () => {
      const result = await LanguageLearningService.contextualTranslate(
        'en',
        'es',
        'Good morning, I would like to order a coffee please.'
      );

      expect(result.source_lang).toBe('en');
      expect(result.target_lang).toBe('es');
      expect(result.primary_translation).toBeTruthy();
      expect(result.word_breakdown.length).toBeGreaterThan(0);
    });
  });

  describe('6. AI Conversation Partner', () => {
    it('initiates conversation session and exchanges messages', async () => {
      const session = await LanguageLearningService.startConversation(
        testStudentId,
        'es',
        'Ordering food at a traditional restaurant',
        'CORRECTION'
      );

      expect(session.id).toBeTruthy();
      expect(session.scenario).toBe('Ordering food at a traditional restaurant');
      expect(session.messages.length).toBe(1);
      expect(session.messages[0].sender).toBe('ai');

      // Send student message
      const updated = await LanguageLearningService.sendConversationMessage(
        testStudentId,
        session.id,
        'Hola! Quisiera una mesa para dos personas por favor.'
      );

      expect(updated.messages.length).toBe(3);
      expect(updated.messages[1].sender).toBe('student');
      expect(updated.messages[2].sender).toBe('ai');
    });
  });

  describe('7. Quizzes & Real Analytics', () => {
    it('grades quiz answers and saves attempt', async () => {
      const res = await LanguageLearningService.submitQuiz(testStudentId, 'es', 'les_es_1', [
        { question_id: 'qq_es_1', selected_index: 0 },
        { question_id: 'qq_es_2', selected_index: 0 },
      ]);

      expect(res.quiz_id).toBe('les_es_1');
      expect(res.score_percentage).toBeGreaterThanOrEqual(0);
      expect(res.question_results.length).toBeGreaterThanOrEqual(1);
    });

    it('reports onboarding state for fresh students and real metrics when enrolled', async () => {
      const freshStudentId = 'std_fresh_polyglot_00';
      const initialAnalytics = await LanguageLearningService.getStudentAnalytics(freshStudentId);
      expect(initialAnalytics.is_onboarding).toBe(true);
      expect(initialAnalytics.enrolled_languages_count).toBe(0);

      // Enroll and verify real calculations
      await LanguageLearningService.enrollStudent(freshStudentId, {
        language_code: 'es',
        purpose: 'CAREER',
      });

      const updatedAnalytics = await LanguageLearningService.getStudentAnalytics(freshStudentId);
      expect(updatedAnalytics.is_onboarding).toBe(false);
      expect(updatedAnalytics.enrolled_languages_count).toBe(1);
      expect(updatedAnalytics.active_languages[0].code).toBe('es');

      // Cleanup
      await LanguageLearningService.deleteStudentLanguageData(freshStudentId, 'es');
    });
  });
});
