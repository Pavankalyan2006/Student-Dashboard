import { describe, it, expect } from 'vitest';
import { StorageService } from '../../server/storage/storage';

describe('Storage & File Security Foundation', () => {
  it('rejects disallowed file extensions', async () => {
    await expect(
      StorageService.upload({
        studentId: 'std_01j8k9x2p4',
        originalName: 'exploit.exe',
        mimeType: 'application/octet-stream',
        sizeBytes: 1024,
        category: 'document',
      })
    ).rejects.toThrow();
  });

  it('rejects files exceeding maximum size limit', async () => {
    await expect(
      StorageService.upload({
        studentId: 'std_01j8k9x2p4',
        originalName: 'giant_textbook.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 50 * 1024 * 1024, // 50MB (limit is 20MB)
        category: 'document',
      })
    ).rejects.toThrow(/File size exceeds/);
  });

  it('validates and stores valid engineering document', async () => {
    const file = await StorageService.upload({
      studentId: 'std_01j8k9x2p4',
      originalName: 'Digital_Signal_Processing_Unit1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 400,
      category: 'document',
      dataBuffer: 'sample-base64-data',
    });

    expect(file.id).toBeDefined();
    expect(file.student_id).toBe('std_01j8k9x2p4');
    expect(file.original_name).toBe('Digital_Signal_Processing_Unit1.pdf');

    // Ownership check: another student cannot access it
    await expect(
      StorageService.getMetadata(file.id, 'std_other_student', 'STUDENT')
    ).rejects.toThrow(/permission/);

    // Super admin can access
    const adminMetadata = await StorageService.getMetadata(file.id, 'admin_user', 'SUPER_ADMIN');
    expect(adminMetadata.id).toBe(file.id);
  });
});
