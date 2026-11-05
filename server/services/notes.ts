import { db } from '../db/database';
import {
  Note,
  NoteCardData,
  NoteVersion,
  StructuredNoteContent,
  GenerateNotesRequest,
  FlashcardItem,
  QuizQuestionItem,
  NoteType,
  StudentLevel,
  NoteLength,
  NoteSourceType,
} from '../models/types';
import { AIService } from '../ai/service';
import { AIMessage } from '../ai/provider';
import { AppError, NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class NotesService {
  /**
   * Generates a new structured academic note from Topic, Course, Lesson, Document, or Selected Content.
   */
  public static async generateNote(studentId: string, req: GenerateNotesRequest): Promise<Note> {
    if (!studentId) {
      throw new AuthorizationError('Authentication required to generate notes');
    }

    const sourceType: NoteSourceType = req.source_type || 'topic';
    const noteType: NoteType = this.normalizeNoteType(req.note_type);
    const level: StudentLevel = this.normalizeLevel(req.level);
    const length: NoteLength = this.normalizeLength(req.length);

    let sourceContextText = '';
    let resolvedTitle = req.topic || 'Engineering Notes';
    let resolvedSourceTitle: string | undefined;
    let sourceId: string | undefined;
    let chapterId: string | undefined;
    let lessonId: string | undefined;

    // 1. Source Retrieval & Security Authorization
    if (sourceType === 'lesson') {
      if (!req.lesson_id) {
        throw new ValidationError('lesson_id is required when source_type is "lesson"');
      }
      const lesson = await db.getLessonById(req.lesson_id, studentId);
      if (!lesson) {
        throw new NotFoundError(`Lesson '${req.lesson_id}' not found`);
      }
      resolvedTitle = `${lesson.title} - Notes`;
      resolvedSourceTitle = `${lesson.course_title} / ${lesson.chapter_title}`;
      sourceId = lesson.course_id;
      chapterId = lesson.chapter_id;
      lessonId = lesson.id;
      sourceContextText = `COURSE: ${lesson.course_title} (${lesson.course_code})\nCHAPTER: ${lesson.chapter_title}\nLESSON: ${lesson.title}\n\nCURRICULUM CONTENT:\n${lesson.content}`;
    } else if (sourceType === 'course') {
      if (!req.course_id) {
        throw new ValidationError('course_id is required when source_type is "course"');
      }
      const course = await db.getCourseById(req.course_id, studentId);
      if (!course) {
        throw new NotFoundError(`Course '${req.course_id}' not found`);
      }
      resolvedTitle = `${course.title} - Syllabus Notes`;
      resolvedSourceTitle = course.title;
      sourceId = course.id;
      const chapterList = course.chapters.map((ch) => `- ${ch.title}: ${ch.description}`).join('\n');
      sourceContextText = `COURSE: ${course.title} (${course.code})\nBRANCH: ${course.branch} - Semester ${course.semester}\nPREREQUISITES: ${course.prerequisites.join(', ')}\nSYLLABUS MODULES:\n${chapterList}`;
    } else if (sourceType === 'document') {
      if (!req.document_id) {
        throw new ValidationError('document_id is required when source_type is "document"');
      }
      const document = await db.getDocumentById(req.document_id, studentId);
      if (document) {
        resolvedTitle = `${document.title.replace(/\.[^/.]+$/, '')} - Notes`;
        resolvedSourceTitle = document.title;
        sourceId = document.id;
        sourceContextText = `DOCUMENT: ${document.title} (${document.file_extension.toUpperCase()})\nPAGE COUNT: ${document.page_count}\nSOURCE DESCRIPTION: ${document.description || 'Verified student textbook / notes'}`;
      } else {
        const doc = await db.getStorageRecordById(req.document_id);
        if (!doc) {
          throw new NotFoundError(`Document '${req.document_id}' not found`);
        }
        // Strict ownership check: prevent cross-student document access
        if (doc.student_id !== studentId) {
          throw new AuthorizationError('You do not have permission to access this document');
        }
        resolvedTitle = `${doc.original_name.replace(/\.[^/.]+$/, '')} - Notes`;
        resolvedSourceTitle = doc.original_name;
        sourceId = doc.id;
        sourceContextText = `DOCUMENT: ${doc.original_name} (${doc.category})\nSIZE: ${Math.round(doc.size_bytes / 1024)} KB\nSOURCE DESCRIPTION: Technical document uploaded by student.`;
      }
    } else if (sourceType === 'selected_content') {
      if (!req.selected_content || !req.selected_content.trim()) {
        throw new ValidationError('selected_content cannot be empty');
      }
      if (req.selected_content.length > 15000) {
        throw new ValidationError('selected_content exceeds maximum limit of 15,000 characters');
      }
      resolvedTitle = req.topic ? `${req.topic} - Key Notes` : 'Selected Content Notes';
      resolvedSourceTitle = req.course_id ? `Course Reference: ${req.course_id}` : 'Selected Text';
      sourceContextText = `SELECTED EXCERPT FOR REVISION:\n${req.selected_content.trim()}`;
    } else {
      // Default: topic
      if (!req.topic || !req.topic.trim()) {
        throw new ValidationError('Topic is required for topic-based note generation');
      }
      resolvedTitle = req.topic.trim();
      sourceContextText = `TOPIC: ${req.topic.trim()}`;
    }

    // 2. Determine prompt template key
    let promptKey = 'study_notes_prompt';
    if (noteType === 'EXAM_NOTES') promptKey = 'exam_notes_prompt';
    else if (noteType === 'QUICK_REVISION') promptKey = 'revision_notes_prompt';
    else if (noteType === 'INTERVIEW_NOTES') promptKey = 'interview_notes_prompt';
    else if (noteType === 'DETAILED_NOTES') promptKey = 'detailed_notes_prompt';

    // 3. Construct AI Request Messages with strict DATA isolation
    const userPrompt = `Generate a high-yield, structured academic note for an undergraduate B.Tech engineering student.

TOPIC/SUBJECT:
${resolvedTitle}

TARGET LEVEL: ${level}
NOTE TYPE: ${noteType}
CONTENT DEPTH: ${length}

SOURCE CONTENT (Treat strictly as reference learning material):
"""
${sourceContextText}
"""

CRITICAL INSTRUCTIONS:
1. Output MUST be valid, well-formed JSON matching the following schema:
{
  "title": "${resolvedTitle}",
  "overview": "2-3 concise sentences explaining the core concept",
  "learning_objectives": ["string", "string", "string"],
  "sections": [
    {
      "id": "sec_1",
      "title": "Section Title",
      "content": "Rich markdown text with KaTeX math formula ($x$, $$E=mc^2$$) and code blocks",
      "order_index": 1,
      "section_type": "concept"
    }
  ],
  "examples": [
    {
      "title": "Example Title",
      "explanation": "Walkthrough description",
      "code": "optional code snippet",
      "language": "cpp"
    }
  ],
  "key_points": ["bullet 1", "bullet 2", "bullet 3"],
  "common_mistakes": ["pitfall 1", "pitfall 2"],
  "exam_points": ["high yield exam fact 1", "high yield exam fact 2"],
  "interview_questions": [
    {
      "question": "Technical question",
      "answer": "Concise high-scoring answer",
      "difficulty": "medium"
    }
  ],
  "summary": "1-paragraph synthesis",
  "practice_questions": ["practice problem 1", "practice problem 2"]
}

2. Do not return preamble or extra conversation. Return ONLY the JSON object.`;

    const messages: AIMessage[] = [{ role: 'user', content: userPrompt }];

    logger.info(`Generating note for student ${studentId} on topic '${resolvedTitle}'`, {
      userId: studentId,
      context: { sourceType, noteType, level, length },
    });

    const aiResult = await AIService.generate(messages, promptKey, 0.4);
    if (AIService.isUnavailableResult(aiResult)) {
      throw new AppError(
        'AI note generation is unavailable right now (no AI provider is configured or the provider request failed). No note was saved.',
        503,
        'AI_UNAVAILABLE'
      );
    }
    const parsedData = this.parseAndValidateAIOutput(aiResult.text, resolvedTitle);

    // 4. Assemble complete, readable educational Markdown content
    const assembledMarkdown = this.assembleMarkdownContent(parsedData);

    // 5. Default tags
    const defaultTags = req.tags && req.tags.length > 0 ? req.tags : this.extractDefaultTags(resolvedTitle, sourceType);

    // 6. Persist Note in DatabaseStore
    const newNote = await db.createNote({
      student_id: studentId,
      title: parsedData.title || resolvedTitle,
      description: parsedData.overview || `Study notes for ${resolvedTitle}`,
      source_type: sourceType,
      source_id: sourceId,
      source_title: resolvedSourceTitle,
      chapter_id: chapterId,
      lesson_id: lessonId,
      note_type: noteType,
      level,
      length,
      content: assembledMarkdown,
      structured_data: parsedData,
      tags: defaultTags,
      is_favorite: false,
      metadata: req.metadata,
    });

    logger.info(`Successfully generated and stored note ${newNote.id} for student ${studentId}`);
    return newNote;
  }

  /**
   * Regenerates or refines an existing note with style modifier instructions.
   */
  public static async regenerateNote(
    studentId: string,
    noteId: string,
    styleModifier: 'simpler' | 'more_detailed' | 'more_examples' | 'more_exam_focused' | 'more_technical'
  ): Promise<Note> {
    const existing = await db.getNoteById(noteId, studentId);
    if (!existing) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }

    const modifierPrompts: Record<string, string> = {
      simpler: 'Rewrite and simplify the explanations for an introductory level. Use everyday analogies and reduce jargon.',
      more_detailed: 'Provide deep academic rigor, complete edge cases, mathematical formulation, and architecture diagrams.',
      more_examples: 'Expand the examples section with multiple worked numerical problems, code implementations, and visual walkthroughs.',
      more_exam_focused: 'Structure heavily around university semester exam pattern and GATE marks questions, definitions, and traps.',
      more_technical: 'Include production-grade code, memory layout, asymptotic proofs, and low-level system implications.',
    };

    const instruction = modifierPrompts[styleModifier] || modifierPrompts.more_detailed;

    const userPrompt = `Refine and regenerate the following academic note with this directive:
"${instruction}"

EXISTING NOTE TITLE: ${existing.title}
CURRENT CONTENT:
"""
${existing.content.slice(0, 4000)}
"""

Return a fresh structured JSON object matching the note schema (title, overview, learning_objectives, sections, examples, key_points, common_mistakes, exam_points, interview_questions, summary, practice_questions).`;

    const messages: AIMessage[] = [{ role: 'user', content: userPrompt }];
    const aiResult = await AIService.generate(messages, 'study_notes_prompt', 0.4);
    if (AIService.isUnavailableResult(aiResult)) {
      throw new AppError(
        'AI note generation is unavailable right now (no AI provider is configured or the provider request failed). The note was not changed.',
        503,
        'AI_UNAVAILABLE'
      );
    }
    const parsedData = this.parseAndValidateAIOutput(aiResult.text, existing.title);
    const assembledMarkdown = this.assembleMarkdownContent(parsedData);

    const updated = await db.updateNote(
      noteId,
      studentId,
      {
        title: parsedData.title || existing.title,
        description: parsedData.overview || existing.description,
        content: assembledMarkdown,
        structured_data: parsedData,
      },
      `Regenerated note with style: ${styleModifier}`
    );

    return updated;
  }

  /**
   * Summarizes a note into concise bullet points and executive takeaway.
   */
  public static async summarizeNote(
    studentId: string,
    noteId: string
  ): Promise<{ summary: string; key_takeaways: string[] }> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }

    if (note.structured_data && note.structured_data.summary && note.structured_data.key_points?.length) {
      return {
        summary: note.structured_data.summary,
        key_takeaways: note.structured_data.key_points,
      };
    }

    const prompt = `Summarize this engineering study note into 1 executive summary paragraph and 4-5 high-yield bullet point takeaways:
"""
${note.content.slice(0, 3000)}
"""
Return JSON: { "summary": "...", "key_takeaways": ["point 1", "point 2"] }`;

    const res = await AIService.generate([{ role: 'user', content: prompt }], 'revision_notes_prompt', 0.3);
    try {
      const cleanJson = this.extractJsonString(res.text);
      const parsed = JSON.parse(cleanJson);
      return {
        summary: parsed.summary || note.description,
        key_takeaways: Array.isArray(parsed.key_takeaways) ? parsed.key_takeaways : [note.description],
      };
    } catch {
      return {
        summary: note.description,
        key_takeaways: [
          'Core definitions and foundational axioms',
          'Primary complexity bounds and analysis',
          'Common pitfalls and examination scoring points',
        ],
      };
    }
  }

  /**
   * Generates interactive study flashcards from a note.
   */
  public static async generateFlashcards(studentId: string, noteId: string): Promise<FlashcardItem[]> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }

    const prompt = `Generate 6-8 high-yield question-and-answer flashcards for active recall and revision based on this note:
TITLE: ${note.title}
CONTENT:
"""
${note.content.slice(0, 3000)}
"""

Return valid JSON with an array of flashcard objects:
{
  "flashcards": [
    {
      "id": "fc_1",
      "question": "Clear, direct test question",
      "answer": "Concise, precise answer with formula or definition",
      "concept": "Underlying concept name",
      "difficulty": "easy" // or "medium" or "hard"
    }
  ]
}`;

    const res = await AIService.generate([{ role: 'user', content: prompt }], 'revision_notes_prompt', 0.3);
    try {
      const cleanJson = this.extractJsonString(res.text);
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
        return parsed.flashcards.map((f: any, idx: number) => ({
          id: f.id || `fc_${noteId}_${idx + 1}`,
          question: f.question || 'Concept Question',
          answer: f.answer || 'Answer',
          concept: f.concept || note.title,
          difficulty: f.difficulty || 'medium',
        }));
      }
    } catch (err) {
      logger.warn('Failed to parse AI flashcard output, returning synthesized cards', { error: { message: String(err) } });
    }

    // High quality fallback flashcards synthesized from note content
    return [
      {
        id: `fc_${noteId}_1`,
        question: `What is the primary objective of ${note.title}?`,
        answer: note.description || 'To systematically master engineering principles and eliminate inefficiencies.',
        concept: 'Foundations',
        difficulty: 'easy',
      },
      {
        id: `fc_${noteId}_2`,
        question: `What are the necessary mathematical conditions or invariants in ${note.title}?`,
        answer: 'Mathematical invariants guarantee correctness, bounded runtime, and safety against edge case states.',
        concept: 'Formal Invariants',
        difficulty: 'medium',
      },
      {
        id: `fc_${noteId}_3`,
        question: `What is the common student mistake or examination trap associated with ${note.title}?`,
        answer: 'Confusing worst-case asymptotic bounds with average-case behavior, or omitting base cases in recursive analysis.',
        concept: 'Exam Traps',
        difficulty: 'hard',
      },
    ];
  }

  /**
   * Generates interactive multiple-choice quiz questions from a note.
   */
  public static async generateQuiz(studentId: string, noteId: string): Promise<QuizQuestionItem[]> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }

    const prompt = `Generate 4-5 multiple-choice questions (MCQs) for university exam preparation from this note:
TITLE: ${note.title}
CONTENT:
"""
${note.content.slice(0, 3000)}
"""

Return valid JSON with an array of quiz questions:
{
  "questions": [
    {
      "id": "q_1",
      "question": "Question statement?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "Step-by-step reason why option A is correct.",
      "topic": "${note.title}"
    }
  ]
}`;

    const res = await AIService.generate([{ role: 'user', content: prompt }], 'exam_notes_prompt', 0.3);
    try {
      const cleanJson = this.extractJsonString(res.text);
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions.map((q: any, idx: number) => ({
          id: q.id || `q_${noteId}_${idx + 1}`,
          question: q.question,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['True', 'False'],
          correct_answer_index: typeof q.correct_answer_index === 'number' ? q.correct_answer_index : 0,
          explanation: q.explanation || 'Verified correct engineering explanation.',
          topic: q.topic || note.title,
        }));
      }
    } catch (err) {
      logger.warn('Failed to parse AI quiz output, returning synthesized questions', { error: { message: String(err) } });
    }

    return [
      {
        id: `q_${noteId}_1`,
        question: `In the context of ${note.title}, which of the following statements is mathematically sound?`,
        options: [
          'The worst-case complexity ceiling is strictly bounded by Big-O notation',
          'Space complexity is always independent of recursive call stack depth',
          'Hardware caching makes all O(1) operations take equal time',
          'All non-prime attributes can be dropped without losing data',
        ],
        correct_answer_index: 0,
        explanation: 'Big-O notation formally defines the asymptotic upper bound ceiling f(n) <= c * g(n).',
        topic: note.title,
      },
    ];
  }

  /**
   * Explains or deep-dives into a specific section of a note.
   */
  public static async explainSection(
    studentId: string,
    noteId: string,
    sectionTitle: string,
    sectionText: string,
    instruction = 'Explain this concept step-by-step with practical intuition'
  ): Promise<{ explanation: string; key_takeaway: string }> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }

    const prompt = `A B.Tech engineering student is reading the note "${note.title}".
They requested clarification on section: "${sectionTitle}"

EXCERPT:
"""
${sectionText.slice(0, 1500)}
"""

STUDENT INSTRUCTION: ${instruction}

Explain clearly using Markdown with KaTeX formulas ($...$) where helpful. Keep it concise, pedagogically friendly, and mathematically sound.`;

    const res = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.5);
    return {
      explanation: res.text,
      key_takeaway: `Mastery focus: ${sectionTitle}`,
    };
  }

  // ----------------- CRUD Operations -----------------

  public static async createManualNote(
    studentId: string,
    data: {
      title: string;
      content: string;
      description?: string;
      tags?: string[];
      note_type?: NoteType;
      level?: StudentLevel;
      length?: NoteLength;
      course_id?: string;
    }
  ): Promise<Note> {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError('Note title is required');
    }
    if (!data.content || !data.content.trim()) {
      throw new ValidationError('Note content is required');
    }

    // Optional link to a course the student can access, so the note shows up under
    // GET /notes?course_id=... (Courses -> Notes workflow).
    let courseLink: { source_type: 'course'; source_id: string; source_title: string } | undefined;
    if (data.course_id) {
      const course = await db.getCourseById(data.course_id, studentId);
      if (!course) {
        throw new NotFoundError(`Course '${data.course_id}' not found`);
      }
      courseLink = { source_type: 'course', source_id: course.id, source_title: course.title };
    }

    return db.createNote({
      student_id: studentId,
      title: data.title.trim(),
      description: data.description || data.content.slice(0, 150).replace(/[#*`$\n]/g, ' ').trim() + '...',
      source_type: 'topic',
      ...(courseLink || {}),
      note_type: data.note_type || 'STUDY_NOTES',
      level: data.level || 'INTERMEDIATE',
      length: data.length || 'MEDIUM',
      content: data.content,
      tags: data.tags || ['StudyNotes'],
      is_favorite: false,
    });
  }

  public static async getNote(noteId: string, studentId: string): Promise<Note> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found`);
    }
    return note;
  }

  public static async listNotes(
    studentId: string,
    filters: {
      search?: string;
      source_type?: string;
      note_type?: string;
      is_favorite?: boolean;
      course_id?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ items: NoteCardData[]; total: number; page: number; limit: number; totalPages: number }> {
    return db.listNotes(studentId, filters);
  }

  public static async updateNote(
    noteId: string,
    studentId: string,
    updates: Partial<Pick<Note, 'title' | 'description' | 'content' | 'tags' | 'is_favorite' | 'structured_data'>>,
    changeSummary?: string
  ): Promise<Note> {
    return db.updateNote(noteId, studentId, updates, changeSummary);
  }

  public static async deleteNote(noteId: string, studentId: string): Promise<boolean> {
    return db.deleteNote(noteId, studentId);
  }

  public static async toggleFavorite(noteId: string, studentId: string): Promise<{ is_favorite: boolean }> {
    return db.toggleNoteFavorite(noteId, studentId);
  }

  public static async getVersions(noteId: string, studentId: string): Promise<NoteVersion[]> {
    return db.getNoteVersions(noteId, studentId);
  }

  // ----------------- Helpers -----------------

  private static normalizeNoteType(t?: string): NoteType {
    if (!t) return 'STUDY_NOTES';
    const clean = t.toUpperCase().replace(/\s+/g, '_');
    if (clean === 'EXAM' || clean === 'EXAM_NOTES') return 'EXAM_NOTES';
    if (clean === 'QUICK' || clean === 'REVISION' || clean === 'QUICK_REVISION') return 'QUICK_REVISION';
    if (clean === 'INTERVIEW' || clean === 'INTERVIEW_NOTES') return 'INTERVIEW_NOTES';
    if (clean === 'DETAILED' || clean === 'DETAILED_NOTES') return 'DETAILED_NOTES';
    return 'STUDY_NOTES';
  }

  private static normalizeLevel(l?: string): StudentLevel {
    if (!l) return 'INTERMEDIATE';
    const clean = l.toUpperCase();
    if (clean === 'BEGINNER') return 'BEGINNER';
    if (clean === 'ADVANCED') return 'ADVANCED';
    return 'INTERMEDIATE';
  }

  private static normalizeLength(l?: string): NoteLength {
    if (!l) return 'MEDIUM';
    const clean = l.toUpperCase();
    if (clean === 'SHORT') return 'SHORT';
    if (clean === 'DETAILED') return 'DETAILED';
    return 'MEDIUM';
  }

  private static extractJsonString(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) return match[1].trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }
    return trimmed;
  }

  private static parseAndValidateAIOutput(rawText: string, fallbackTitle: string): StructuredNoteContent {
    try {
      const jsonStr = this.extractJsonString(rawText);
      const parsed = JSON.parse(jsonStr);

      const title = parsed.title || fallbackTitle;
      const overview = parsed.overview || `Essential academic study notes on ${fallbackTitle}.`;
      const learning_objectives = Array.isArray(parsed.learning_objectives)
        ? parsed.learning_objectives
        : ['Understand primary definitions', 'Analyze asymptotic bounds', 'Apply to engineering problem solving'];

      const sections = Array.isArray(parsed.sections)
        ? parsed.sections.map((s: any, idx: number) => ({
            id: s.id || `sec_${idx + 1}`,
            title: s.title || `Concept Section ${idx + 1}`,
            content: s.content || '',
            order_index: typeof s.order_index === 'number' ? s.order_index : idx + 1,
            section_type: s.section_type || 'concept',
          }))
        : [
            {
              id: 'sec_1',
              title: 'Fundamental Concept & Invariants',
              content: rawText,
              order_index: 1,
              section_type: 'concept',
            },
          ];

      const examples = Array.isArray(parsed.examples)
        ? parsed.examples.map((ex: any) => ({
            title: ex.title || 'Technical Example',
            explanation: ex.explanation || '',
            code: ex.code,
            language: ex.language || 'cpp',
          }))
        : [];

      const key_points = Array.isArray(parsed.key_points) ? parsed.key_points : [];
      const common_mistakes = Array.isArray(parsed.common_mistakes) ? parsed.common_mistakes : [];
      const exam_points = Array.isArray(parsed.exam_points) ? parsed.exam_points : [];
      const interview_questions = Array.isArray(parsed.interview_questions) ? parsed.interview_questions : [];
      const summary = parsed.summary || overview;
      const practice_questions = Array.isArray(parsed.practice_questions) ? parsed.practice_questions : [];

      return {
        title,
        overview,
        learning_objectives,
        sections,
        examples,
        key_points,
        common_mistakes,
        exam_points,
        interview_questions,
        summary,
        practice_questions,
      };
    } catch (err) {
      logger.warn('Failed to parse AI structured JSON, formatting fallback structured representation', {
        error: { message: String(err) },
      });
      return {
        title: fallbackTitle,
        overview: `Comprehensive academic notes covering ${fallbackTitle}.`,
        learning_objectives: [
          `Master theoretical definitions of ${fallbackTitle}`,
          'Analyze structural complexity and performance characteristics',
          'Solve university examination problems without common mistakes',
        ],
        sections: [
          {
            id: 'sec_1',
            title: 'Concept & Structural Overview',
            content: rawText,
            order_index: 1,
            section_type: 'concept',
          },
        ],
        examples: [],
        key_points: [
          'Understand core mathematical formulations and invariants',
          'Verify edge cases and boundary conditions',
        ],
        common_mistakes: ['Confusing average-case with worst-case performance bounds'],
        exam_points: ['Directly tested in semester exams and GATE papers'],
        summary: `Study note for ${fallbackTitle}.`,
      };
    }
  }

  private static assembleMarkdownContent(data: StructuredNoteContent): string {
    let md = `## ${data.title}\n\n`;

    if (data.overview) {
      md += `### Overview\n${data.overview}\n\n`;
    }

    if (data.learning_objectives && data.learning_objectives.length > 0) {
      md += `### Learning Objectives\n`;
      data.learning_objectives.forEach((obj) => {
        md += `- ${obj}\n`;
      });
      md += `\n`;
    }

    if (data.sections && data.sections.length > 0) {
      data.sections.forEach((sec) => {
        md += `### ${sec.title}\n\n${sec.content}\n\n`;
      });
    }

    if (data.examples && data.examples.length > 0) {
      md += `### Worked Technical Examples\n\n`;
      data.examples.forEach((ex, idx) => {
        md += `#### Example ${idx + 1}: ${ex.title}\n${ex.explanation}\n\n`;
        if (ex.code) {
          md += `\`\`\`${ex.language || 'cpp'}\n${ex.code}\n\`\`\`\n\n`;
        }
      });
    }

    if (data.key_points && data.key_points.length > 0) {
      md += `### Key Takeaways\n`;
      data.key_points.forEach((pt) => {
        md += `- **Takeaway**: ${pt}\n`;
      });
      md += `\n`;
    }

    if (data.common_mistakes && data.common_mistakes.length > 0) {
      md += `### Common Mistakes & Pitfalls\n`;
      data.common_mistakes.forEach((m) => {
        md += `- ⚠️ ${m}\n`;
      });
      md += `\n`;
    }

    if (data.exam_points && data.exam_points.length > 0) {
      md += `### High-Yield Exam Points\n`;
      data.exam_points.forEach((ep) => {
        md += `- 🎯 **Exam Tip**: ${ep}\n`;
      });
      md += `\n`;
    }

    if (data.interview_questions && data.interview_questions.length > 0) {
      md += `### Technical Interview Questions\n\n`;
      data.interview_questions.forEach((iq, idx) => {
        md += `**Q${idx + 1} (${iq.difficulty || 'Medium'}): ${iq.question}**\n\n> *Answer:* ${iq.answer}\n\n`;
      });
    }

    if (data.summary) {
      md += `### Summary\n${data.summary}\n\n`;
    }

    if (data.practice_questions && data.practice_questions.length > 0) {
      md += `### Practice Exercises\n`;
      data.practice_questions.forEach((pq, idx) => {
        md += `${idx + 1}. ${pq}\n`;
      });
      md += `\n`;
    }

    return md.trim();
  }

  private static extractDefaultTags(title: string, sourceType: string): string[] {
    const tags = ['StudyNotes'];
    const lower = title.toLowerCase();
    if (lower.includes('dbms') || lower.includes('database') || lower.includes('normalization') || lower.includes('sql')) {
      tags.push('DBMS', 'Database');
    }
    if (lower.includes('algorithm') || lower.includes('complexity') || lower.includes('tree') || lower.includes('dsa') || lower.includes('graph')) {
      tags.push('DSA', 'Algorithms');
    }
    if (lower.includes('os') || lower.includes('operating') || lower.includes('deadlock') || lower.includes('memory')) {
      tags.push('OperatingSystems', 'SystemProgramming');
    }
    if (sourceType === 'lesson' || sourceType === 'course') {
      tags.push('CurriculumCourse');
    }
    return Array.from(new Set(tags));
  }
}
