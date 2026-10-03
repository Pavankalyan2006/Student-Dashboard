import { Router } from 'express';
import { StorageService } from '../../storage/storage';
import { requireAuth } from '../../middleware/auth';
import { ValidationError } from '../../core/exceptions';

export const storageRouter = Router();

// GET /api/v1/storage - list student files
storageRouter.get('/storage', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const files = await StorageService.listStudentFiles(studentId);
    res.json({
      success: true,
      data: files,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/storage/upload
storageRouter.post('/storage/upload', requireAuth, async (req, res, next) => {
  try {
    const { originalName, mimeType, sizeBytes, category, contentBase64 } = req.body;

    if (!originalName || !mimeType || sizeBytes === undefined) {
      throw new ValidationError('Missing required file parameters (originalName, mimeType, sizeBytes)');
    }

    const studentId = req.user!.userId;
    const record = await StorageService.upload({
      studentId,
      originalName,
      mimeType,
      sizeBytes: Number(sizeBytes),
      category: category || 'document',
      dataBuffer: contentBase64,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/storage/:id/metadata
storageRouter.get('/storage/:id/metadata', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;
    const role = req.user!.role;

    const record = await StorageService.getMetadata(id, studentId, role);
    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/storage/:id/download
storageRouter.get('/storage/:id/download', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;
    const role = req.user!.role;

    const { record, data } = await StorageService.download(id, studentId, role);
    res.json({
      success: true,
      data: {
        record,
        content: data,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/storage/:id
storageRouter.delete('/storage/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;
    const role = req.user!.role;

    const deleted = await StorageService.delete(id, studentId, role);
    res.json({
      success: true,
      data: { id, deleted },
    });
  } catch (err) {
    next(err);
  }
});
