import fs from 'fs';
import path from 'path';
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
  // In-memory buffer cache for rapid access
  private static fileBlobs: Map<string, string> = new Map();

  /**
   * Resolves canonical MIME type from file extension if browser sends generic or empty MIME type
   */
  public static normalizeMimeType(originalName: string, reportedMime: string): string {
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      txt: 'text/plain',
      md: 'text/markdown',
      csv: 'text/csv',
      rtf: 'application/rtf',
    };

    if (!reportedMime || reportedMime === 'application/octet-stream' || reportedMime === 'binary/octet-stream') {
      return mimeMap[ext] || reportedMime || 'application/octet-stream';
    }
    return reportedMime;
  }

  public static async upload(input: UploadFileInput): Promise<StorageRecord> {
    const ext = input.originalName.split('.').pop()?.toLowerCase() || '';
    const dangerousExecutables = ['exe', 'bat', 'cmd', 'vbs', 'dll', 'com', 'scr', 'msi', 'bin'];
    if (!ext || dangerousExecutables.includes(ext) || (ext === 'sh' && input.category !== 'document')) {
      throw new ValidationError(`Disallowed executable file extension: .${ext}`);
    }

    // 1. File size validation
    if (input.sizeBytes > config.maxUploadSizeBytes) {
      throw new ValidationError(
        `File size exceeds maximum permitted limit (${config.maxUploadSizeBytes / (1024 * 1024)}MB)`
      );
    }

    // 2. MIME type normalization & validation
    const normalizedMime = this.normalizeMimeType(input.originalName, input.mimeType);

    const storedName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const record = await db.createStorageRecord({
      student_id: input.studentId,
      original_name: input.originalName,
      stored_name: storedName,
      mime_type: normalizedMime,
      size_bytes: input.sizeBytes,
      category: input.category,
    });

    if (input.dataBuffer) {
      const dataStr = typeof input.dataBuffer === 'string' ? input.dataBuffer : input.dataBuffer.toString('base64');
      this.fileBlobs.set(record.id, dataStr);

      // Persist to local vault directory if configured
      try {
        if (config.storageDriver === 'LOCAL') {
          const vaultDir = path.resolve(process.cwd(), config.storageLocalPath);
          if (!fs.existsSync(vaultDir)) {
            fs.mkdirSync(vaultDir, { recursive: true });
          }
          const diskPath = path.join(vaultDir, storedName);
          const rawBuffer = dataStr.startsWith('data:')
            ? Buffer.from(dataStr.split(',')[1] || '', 'base64')
            : Buffer.from(dataStr, 'base64');
          fs.writeFileSync(diskPath, rawBuffer);
        }
      } catch (diskErr) {
        logger.warn('Failed to write file to local vault disk path', { error: { message: String(diskErr) } });
      }
    }

    logger.info('File uploaded and validated', {
      userId: input.studentId,
      context: { fileId: record.id, originalName: input.originalName, size: input.sizeBytes, mime: normalizedMime },
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
    let data = this.fileBlobs.get(fileId) || '';

    // If memory cache is cold, attempt recovery from local vault
    if (!data && record.stored_name) {
      try {
        const vaultDir = path.resolve(process.cwd(), config.storageLocalPath);
        const diskPath = path.join(vaultDir, record.stored_name);
        if (fs.existsSync(diskPath)) {
          const fileBuf = fs.readFileSync(diskPath);
          data = `data:${record.mime_type};base64,${fileBuf.toString('base64')}`;
          this.fileBlobs.set(fileId, data);
        }
      } catch {
        // Vault read failed
      }
    }

    // Uploads may arrive as a data URL or as bare base64. Always hand back a data URL so parsers
    // never mistake bare base64 for the file's text (which indexed base64 gibberish for .txt/.md files).
    if (data && !data.startsWith('data:')) {
      data = `data:${record.mime_type || 'application/octet-stream'};base64,${data}`;
    }
    return { record, data };
  }

  public static async delete(fileId: string, studentId: string, role: string): Promise<boolean> {
    const record = await this.getMetadata(fileId, studentId, role);
    this.fileBlobs.delete(fileId);

    try {
      if (record.stored_name) {
        const vaultDir = path.resolve(process.cwd(), config.storageLocalPath);
        const diskPath = path.join(vaultDir, record.stored_name);
        if (fs.existsSync(diskPath)) {
          fs.unlinkSync(diskPath);
        }
      }
    } catch {
      // Ignore disk delete errors
    }

    return db.deleteStorageRecord(fileId, studentId);
  }

  public static async listStudentFiles(studentId: string): Promise<StorageRecord[]> {
    return db.getStudentStorageRecords(studentId);
  }
}
