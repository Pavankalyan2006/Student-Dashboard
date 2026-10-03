import { StorageRecord } from '../models/types';
import { db } from '../db/database';
import { config } from '../core/config';
import { ValidationError, AuthorizationError, NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface UploadFileInput {
  studentId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: 'document' | 'notes' | 'resume' | 'project' | 'attachment';
  dataBuffer?: Buffer | string;
}

export class StorageService {
  // In-memory buffer cache for simulated secure local / S3 storage
  private static fileBlobs: Map<string, string> = new Map();

  public static async upload(input: UploadFileInput): Promise<StorageRecord> {
    // 1. File size validation
    if (input.sizeBytes > config.maxUploadSizeBytes) {
      throw new ValidationError(
        `File size exceeds maximum permitted limit (${config.maxUploadSizeBytes / (1024 * 1024)}MB)`
      );
    }

    // 2. MIME type validation
    if (!config.allowedUploadMimeTypes.includes(input.mimeType)) {
      throw new ValidationError(`Unsupported file type: ${input.mimeType}`);
    }

    // 3. Extension safety validation
    const ext = input.originalName.split('.').pop()?.toLowerCase();
    const disallowedExtensions = ['exe', 'bat', 'sh', 'py', 'js', 'cmd', 'vbs', 'dll'];
    if (!ext || disallowedExtensions.includes(ext)) {
      throw new ValidationError(`Disallowed file extension: .${ext}`);
    }

    const storedName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const record = await db.createStorageRecord({
      student_id: input.studentId,
      original_name: input.originalName,
      stored_name: storedName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      category: input.category,
    });

    if (input.dataBuffer) {
      const dataStr = typeof input.dataBuffer === 'string' ? input.dataBuffer : input.dataBuffer.toString('base64');
      this.fileBlobs.set(record.id, dataStr);
    }

    logger.info('File uploaded and validated', {
      userId: input.studentId,
      context: { fileId: record.id, originalName: input.originalName, size: input.sizeBytes },
    });

    return record;
  }

  public static async getMetadata(fileId: string, studentId: string, role: string): Promise<StorageRecord> {
    const record = await db.getStorageRecordById(fileId);
    if (!record) {
      throw new NotFoundError('Requested document not found');
    }

    // Enforce student ownership isolation (Super Admin can inspect if necessary)
    if (role !== 'SUPER_ADMIN' && record.student_id !== studentId) {
      throw new AuthorizationError('You do not have permission to access this document');
    }

    return record;
  }

  public static async download(fileId: string, studentId: string, role: string): Promise<{ record: StorageRecord; data: string }> {
    const record = await this.getMetadata(fileId, studentId, role);
    const data = this.fileBlobs.get(fileId) || '';
    return { record, data };
  }

  public static async delete(fileId: string, studentId: string, role: string): Promise<boolean> {
    await this.getMetadata(fileId, studentId, role);
    this.fileBlobs.delete(fileId);
    return db.deleteStorageRecord(fileId, studentId);
  }

  public static async listStudentFiles(studentId: string): Promise<StorageRecord[]> {
    return db.getStudentStorageRecords(studentId);
  }
}
