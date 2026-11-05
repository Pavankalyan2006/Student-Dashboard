import { Router } from 'express';
import { NotesService } from '../../services/notes';
import { requireAuth } from '../../middleware/auth';
import { ValidationError } from '../../core/exceptions';
import { GenerateNotesRequest } from '../../models/types';

export const notesRouter = Router();

// All notes endpoints strictly require authentication
notesRouter.use('/notes', requireAuth);

// GET /api/v1/notes/search - Quick search across notes
notesRouter.get('/notes/search', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const query = String(req.query.q || '');
    const result = await NotesService.listNotes(studentId, { search: query, limit: 10 });
    res.json({
      success: true,
      data: result.items,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notes - List notes with filtering and pagination
notesRouter.get('/notes', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { search, source_type, note_type, is_favorite, course_id, page, limit } = req.query;

    const result = await NotesService.listNotes(studentId, {
      search: search ? String(search) : undefined,
      source_type: source_type ? String(source_type) : undefined,
      note_type: note_type ? String(note_type) : undefined,
      is_favorite: is_favorite !== undefined ? is_favorite === 'true' : undefined,
      course_id: course_id ? String(course_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/generate - AI Notes Generation Pipeline
notesRouter.post('/notes/generate', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const body = req.body as GenerateNotesRequest;

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Invalid request body for notes generation');
    }

    const note = await NotesService.generateNote(studentId, body);
    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes - Manual note creation
notesRouter.post('/notes', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { title, content, description, tags, note_type, level, length, course_id } = req.body;

    if (!title) {
      throw new ValidationError('Title is required');
    }
    if (!content) {
      throw new ValidationError('Content is required');
    }

    const note = await NotesService.createManualNote(studentId, {
      title,
      content,
      description,
      tags,
      note_type,
      level,
      length,
      course_id: course_id ? String(course_id) : undefined,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notes/:noteId - Retrieve single note by ID
notesRouter.get('/notes/:noteId', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const note = await NotesService.getNote(noteId, studentId);
    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notes/:noteId - Update note title, content, tags, or favorite
notesRouter.patch('/notes/:noteId', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const { title, content, tags, is_favorite, structured_data, changeSummary } = req.body;

    const updated = await NotesService.updateNote(
      noteId,
      studentId,
      { title, content, tags, is_favorite, structured_data },
      changeSummary
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/notes/:noteId - Delete note
notesRouter.delete('/notes/:noteId', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    await NotesService.deleteNote(noteId, studentId);
    res.json({
      success: true,
      message: `Note '${noteId}' successfully deleted`,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/favorite - Toggle favorite state
notesRouter.post('/notes/:noteId/favorite', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const result = await NotesService.toggleFavorite(noteId, studentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notes/:noteId/versions - Get version history
notesRouter.get('/notes/:noteId/versions', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const versions = await NotesService.getVersions(noteId, studentId);
    res.json({
      success: true,
      data: versions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/regenerate - AI Regeneration with style modifier
notesRouter.post('/notes/:noteId/regenerate', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const styleModifier = req.body.style || 'more_detailed';
    const note = await NotesService.regenerateNote(studentId, noteId, styleModifier);
    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/summarize - Summarize note
notesRouter.post('/notes/:noteId/summarize', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const summaryResult = await NotesService.summarizeNote(studentId, noteId);
    res.json({
      success: true,
      data: summaryResult,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/flashcards - Generate revision flashcards
notesRouter.post('/notes/:noteId/flashcards', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const flashcards = await NotesService.generateFlashcards(studentId, noteId);
    res.json({
      success: true,
      data: flashcards,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/quiz - Generate quiz MCQs
notesRouter.post('/notes/:noteId/quiz', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const questions = await NotesService.generateQuiz(studentId, noteId);
    res.json({
      success: true,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notes/:noteId/explain-section - Explain specific note section
notesRouter.post('/notes/:noteId/explain-section', async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { noteId } = req.params;
    const { sectionTitle, sectionText, instruction } = req.body;

    if (!sectionTitle || !sectionText) {
      throw new ValidationError('sectionTitle and sectionText are required');
    }

    const result = await NotesService.explainSection(
      studentId,
      noteId,
      sectionTitle,
      sectionText,
      instruction
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
