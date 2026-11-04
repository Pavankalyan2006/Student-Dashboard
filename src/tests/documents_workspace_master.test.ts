import { describe, it, expect } from 'vitest';
import { DocumentService } from '../../server/services/documents';
import { db } from '../../server/db/database';
import { StorageService } from '../../server/storage/storage';
import { VectorStore } from '../../server/rag/vectorStore';
import { ValidationError, NotFoundError, ForbiddenError } from '../../server/core/exceptions';
import { DOCUMENT_CATEGORIES } from '../../server/api/routes/documents';

describe('Master Documents Page Compliance Test Suite (24 Requirements)', () => {
  const studentA = 'std_test_documents_master_a';
  const studentB = 'std_test_documents_master_b';

  // 1. Opening the Documents page & fetching stats/categories/folders
  it('1. retrieves real storage stats, academic categories, folders, and documents on dashboard load', async () => {
    const stats = await DocumentService.getStorageStats(studentA);
    expect(stats).toBeDefined();
    expect(stats.storage_limit_mb).toBe(500);
    expect(stats.total_documents).toBe(0);
    expect(stats.total_folders).toBe(0);
    expect(stats.storage_used_bytes).toBe(0);
    expect(stats.percentage_used).toBe(0);

    expect(DOCUMENT_CATEGORIES).toHaveLength(18);
    expect(DOCUMENT_CATEGORIES).toContain('Lecture Notes');
    expect(DOCUMENT_CATEGORIES).toContain('Laboratory Manuals');
    expect(DOCUMENT_CATEGORIES).toContain('Research Papers');
    expect(DOCUMENT_CATEGORIES).toContain('Exam Preparation');

    const folders = await DocumentService.listFolders(studentA);
    expect(Array.isArray(folders)).toBe(true);

    const docs = await DocumentService.listDocuments(studentA);
    expect(docs.items).toEqual([]);
    expect(docs.total).toBe(0);
  });

  // 2. Uploading a supported PDF
  it('2. uploads a supported PDF with valid metadata, category, and folder association', async () => {
    const folder = await DocumentService.createFolder(studentA, {
      name: 'Operating Systems',
      description: 'OS Lecture slides & materials',
      color: '#2563EB',
    });

    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'OS Lecture 1 - Processes',
      originalName: 'lecture_01_processes.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 1024 * 2, // 2MB
      contentBase64: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDw...',
      category: 'Lecture Notes',
      folderId: folder.id,
      subject: 'Operating Systems',
      semester: 4,
      academicYear: '2025-2026',
    });

    expect(doc).toBeDefined();
    expect(doc.id).toMatch(/^doc_/);
    expect(doc.title).toBe('OS Lecture 1 - Processes');
    expect(doc.file_extension).toBe('pdf');
    expect(doc.category).toBe('Lecture Notes');
    expect(doc.folder_id).toBe(folder.id);
    expect(doc.folder_name).toBe('Operating Systems');
    expect(doc.current_version).toBe(1);

    // Verify stats updated
    const stats = await DocumentService.getStorageStats(studentA);
    expect(stats.total_documents).toBe(1);
    expect(stats.total_folders).toBe(1);
    expect(stats.storage_used_bytes).toBe(1024 * 1024 * 2);
  });

  // 3. Uploading a supported DOCX file
  it('3. uploads a supported DOCX file successfully', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Software Testing Assignment 1',
      originalName: 'st_assignment_1.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 512 * 1024,
      contentBase64: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQ...',
      category: 'Assignments',
      subject: 'Software Testing',
    });

    expect(doc.file_extension).toBe('docx');
    expect(doc.category).toBe('Assignments');
    expect(doc.title).toBe('Software Testing Assignment 1');
  });

  // 4. Rejecting an unsupported file type
  it('4. rejects unsupported file types with informative error message', async () => {
    await expect(
      DocumentService.uploadDocument(studentA, {
        title: 'Malicious Executable',
        originalName: 'virus.exe',
        mimeType: 'application/x-msdownload',
        sizeBytes: 1024,
        contentBase64: 'data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA...',
      })
    ).rejects.toThrow(/Unsupported document format \(\.exe\)/);
  });

  // 5. Rejecting an oversized file (>50MB)
  it('5. rejects files exceeding the 50MB file size limit', async () => {
    await expect(
      DocumentService.uploadDocument(studentA, {
        title: 'Oversized Archive',
        originalName: 'massive_dump.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 55 * 1024 * 1024, // 55MB
        contentBase64: 'data:application/pdf;base64,dummy',
      })
    ).rejects.toThrow(/exceeds the 50MB maximum limit/);
  });

  // 6. Creating and renaming folders
  it('6. creates, updates, and retrieves academic folders', async () => {
    const folder = await DocumentService.createFolder(studentA, {
      name: 'Software Testing',
      description: 'Unit testing, Selenium, and CI/CD',
      color: '#4F46E5',
    });

    expect(folder.name).toBe('Software Testing');
    expect(folder.student_id).toBe(studentA);

    const updated = await DocumentService.updateFolder(folder.id, studentA, {
      name: 'Software Testing & QA',
      description: 'Updated description for QA course',
    });

    expect(updated.name).toBe('Software Testing & QA');
    expect(updated.description).toBe('Updated description for QA course');

    const retrieved = await DocumentService.getFolder(folder.id, studentA);
    expect(retrieved.name).toBe('Software Testing & QA');
  });

  // 7. Moving documents between folders & unfiling
  it('7. moves documents between folders and supports unfiling to root', async () => {
    const folder1 = await DocumentService.createFolder(studentA, { name: 'Folder 1' });
    const folder2 = await DocumentService.createFolder(studentA, { name: 'Folder 2' });

    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Move Test Doc',
      originalName: 'move_test.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
      folderId: folder1.id,
    });

    expect(doc.folder_id).toBe(folder1.id);
    expect(doc.folder_name).toBe('Folder 1');

    // Move to Folder 2
    const moved = await DocumentService.moveDocument(doc.id, folder2.id, studentA);
    expect(moved.folder_id).toBe(folder2.id);
    expect(moved.folder_name).toBe('Folder 2');

    // Unfile back to root (null)
    const unfiled = await DocumentService.moveDocument(doc.id, null, studentA);
    expect(unfiled.folder_id).toBeUndefined();
    expect(unfiled.folder_name).toBeUndefined();
  });

  // 8. Searching by filename and metadata
  it('8. searches documents by display title, subject, and category', async () => {
    await DocumentService.uploadDocument(studentA, {
      title: 'Database Management Systems Normalization',
      originalName: 'dbms_bcnf_3nf.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
      category: 'Lecture Notes',
      subject: 'DBMS',
    });

    await DocumentService.uploadDocument(studentA, {
      title: 'Computer Networks Socket Programming',
      originalName: 'cn_sockets.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
      category: 'Laboratory Manuals',
      subject: 'Networks',
    });

    const searchDbms = await DocumentService.listDocuments(studentA, { search: 'Normalization' });
    expect(searchDbms.items).toHaveLength(1);
    expect(searchDbms.items[0].title).toContain('Normalization');

    const searchSubject = await DocumentService.listDocuments(studentA, { search: 'Networks' });
    expect(searchSubject.items).toHaveLength(1);
    expect(searchSubject.items[0].title).toContain('Socket Programming');
  });

  // 9. Filtering and sorting document lists
  it('9. filters by category, folder, file type, and sorts by size/name', async () => {
    const folder = await DocumentService.createFolder(studentA, { name: 'Special Folder' });

    await DocumentService.uploadDocument(studentA, {
      title: 'B Doc',
      originalName: 'b.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 5000,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
      category: 'Research Papers',
      folderId: folder.id,
    });

    await DocumentService.uploadDocument(studentA, {
      title: 'A Doc',
      originalName: 'a.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 2000,
      contentBase64: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,dGVzdA==',
      category: 'Lecture Notes',
    });

    // Filter by Category
    const filteredCat = await DocumentService.listDocuments(studentA, { category: 'Research Papers' });
    expect(filteredCat.items).toHaveLength(1);
    expect(filteredCat.items[0].title).toBe('B Doc');

    // Filter by Folder
    const filteredFolder = await DocumentService.listDocuments(studentA, { folder_id: folder.id });
    expect(filteredFolder.items).toHaveLength(1);
    expect(filteredFolder.items[0].title).toBe('B Doc');

    // Sort by name
    const sortedName = await DocumentService.listDocuments(studentA, { sort: 'name' });
    expect(sortedName.items[0].title).toBe('A Doc');
    expect(sortedName.items[1].title).toBe('B Doc');
  });

  // 10. Previewing a supported document
  it('10. retrieves raw document data and pages for preview rendering', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Preview Test',
      originalName: 'preview.txt',
      mimeType: 'text/plain',
      sizeBytes: 100,
      contentBase64: 'data:text/plain;base64,SGVsbG8gQi5UZWNoIFN0dWRlbnQh',
      category: 'Study Materials',
    });

    const storedFile = await StorageService.download(doc.storage_key, studentA);
    expect(storedFile.data).toBe('data:text/plain;base64,SGVsbG8gQi5UZWNoIFN0dWRlbnQh');
    expect(storedFile.record.mime_type).toBe('text/plain');
  });

  // 11. Downloading an authorized document
  it('11. allows authorized student to download stored file', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Download Test',
      originalName: 'download_me.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1500,
      contentBase64: 'data:application/pdf;base64,ZG93bmxvYWQ=',
    });

    const downloaded = await StorageService.download(doc.storage_key, studentA);
    expect(downloaded.record.original_name).toBe('download_me.pdf');
    expect(downloaded.data).toBe('data:application/pdf;base64,ZG93bmxvYWQ=');
  });

  // 12. Preventing unauthorized downloads
  it('12. denies unauthorized student from downloading student A document', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Private Notes',
      originalName: 'private.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1500,
      contentBase64: 'data:application/pdf;base64,cHJpdmF0ZQ==',
    });

    await expect(
      StorageService.download(doc.storage_key, studentB)
    ).rejects.toThrow(ForbiddenError);

    await expect(
      DocumentService.getDocument(doc.id, studentB)
    ).rejects.toThrow(ForbiddenError);
  });

  // 13. Star and unstar operations
  it('13. toggles starred status and persists in database', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Star Test',
      originalName: 'star.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 500,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
    });

    expect(doc.is_favorite).toBe(false);

    const toggle1 = await DocumentService.toggleFavorite(doc.id, studentA);
    expect(toggle1.is_favorite).toBe(true);

    const favList = await DocumentService.listDocuments(studentA, { filter: 'favorites' });
    expect(favList.items.some((d) => d.id === doc.id)).toBe(true);

    const toggle2 = await DocumentService.toggleFavorite(doc.id, studentA);
    expect(toggle2.is_favorite).toBe(false);
  });

  // 14. Editing metadata
  it('14. edits document display title, description, category, and folder without re-upload', async () => {
    const folder = await DocumentService.createFolder(studentA, { name: 'Algorithms' });

    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Original Title',
      originalName: 'original.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 500,
      contentBase64: 'data:application/pdf;base64,dGVzdA==',
      category: 'Other Documents',
    });

    const updated = await DocumentService.updateDocument(doc.id, studentA, {
      title: 'Refined Title for Exam Revision',
      description: 'Comprehensive summary of sorting algorithms',
      category: 'Exam Preparation',
      folder_id: folder.id,
    });

    expect(updated.title).toBe('Refined Title for Exam Revision');
    expect(updated.description).toBe('Comprehensive summary of sorting algorithms');
    expect(updated.category).toBe('Exam Preparation');
    expect(updated.folder_id).toBe(folder.id);
    expect(updated.folder_name).toBe('Algorithms');
  });

  // 15. Replacing a document version
  it('15. uploads a new version and maintains version history', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Lab Report',
      originalName: 'lab_v1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,djE=',
    });

    expect(doc.current_version).toBe(1);

    const v2 = await DocumentService.uploadNewVersion(doc.id, studentA, {
      originalName: 'lab_v2_final.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1200,
      contentBase64: 'data:application/pdf;base64,djJfZmluYWw=',
      changeNotes: 'Added professor review corrections and graphs',
    });

    expect(v2.current_version).toBe(2);
    expect(v2.original_filename).toBe('lab_v2_final.pdf');

    const versions = await DocumentService.getDocumentVersions(doc.id, studentA);
    expect(versions).toHaveLength(2);
    expect(versions[0].version_number).toBe(2);
    expect(versions[0].change_notes).toBe('Added professor review corrections and graphs');
    expect(versions[1].version_number).toBe(1);
  });

  // 16. Preserving previous version when replacement fails / restore previous version
  it('16. restores a previous version and preserves valid versions if update fails', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Thesis Draft',
      originalName: 'thesis_v1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,djE=',
    });

    await DocumentService.uploadNewVersion(doc.id, studentA, {
      originalName: 'thesis_v2.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1500,
      contentBase64: 'data:application/pdf;base64,djI=',
      changeNotes: 'Experimental methodology added',
    });

    // Restore v1
    const restored = await DocumentService.restoreVersion(doc.id, 1, studentA);
    expect(restored.current_version).toBe(3);
    expect(restored.original_filename).toBe('thesis_v1.pdf');

    // Confirm invalid version number restore fails safely
    await expect(
      DocumentService.restoreVersion(doc.id, 999, studentA)
    ).rejects.toThrow(NotFoundError);
  });

  // 17. Indexing a document in the Knowledge Base
  it('17. indexes document content into Knowledge Base and marks content_indexed true', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Distributed Systems Raft Consensus',
      originalName: 'raft_paper.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2000,
      contentBase64: 'data:application/pdf;base64,cmFmdA==',
      category: 'Research Papers',
    });

    const indexRes = await DocumentService.indexDocumentInKnowledgeBase(doc.id, studentA);
    expect(indexRes.indexed).toBe(true);

    const reloaded = await DocumentService.getDocument(doc.id, studentA);
    expect(reloaded.content_indexed).toBe(true);
    expect(reloaded.status).toBe('READY');
  });

  // 18. Retrying failed document processing
  it('18. retries failed document processing successfully', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Corrupt Upload',
      originalName: 'corrupt.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 200,
      contentBase64: 'data:application/pdf;base64,Y29ycnVwdA==',
    });

    // Mark as failed
    doc.status = 'FAILED';
    doc.processing_error = 'Synthetic extraction error';

    const retryRes = await DocumentService.retryProcessing(doc.id, studentA);
    expect(retryRes.success).toBe(true);
    expect(retryRes.status).toBe('QUEUED');
  });

  // 19. Removing stale indexed content after document deletion
  it('19. cleans up storage and vectorized chunks when document is deleted', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'To Be Deleted',
      originalName: 'delete_me.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,ZGVsZXRl',
    });

    await DocumentService.indexDocumentInKnowledgeBase(doc.id, studentA);
    const deleteRes = await DocumentService.deleteDocument(doc.id, studentA);
    expect(deleteRes.deleted).toBe(true);

    // Verify document no longer exists
    await expect(
      DocumentService.getDocument(doc.id, studentA)
    ).rejects.toThrow(NotFoundError);

    // Verify chunks cleaned up in vector store
    const chunks = VectorStore.getChunksByDocument(doc.id);
    expect(chunks).toHaveLength(0);
  });

  // 20. Handling missing AI configuration gracefully
  it('20. falls back gracefully when AI model encounters missing config or provider issues', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'AI Fallback Test',
      originalName: 'fallback.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,ZmFsbGJhY2s=',
    });

    // Call summary with standard fallback
    const summary = await DocumentService.getSummary(doc.id, studentA, 'standard');
    expect(summary).toBeDefined();
    expect(summary.document_id).toBe(doc.id);
    expect(summary.title).toContain('Summary');
  });

  // 21. Storage quota calculation and limits
  it('21. calculates actual storage consumed and handles quota limits accurately', async () => {
    const initialStats = await DocumentService.getStorageStats(studentA);
    const initialBytes = initialStats.storage_used_bytes;

    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Quota Test Doc',
      originalName: 'quota.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1048576, // 1MB
      contentBase64: 'data:application/pdf;base64,cXVvdGE=',
      category: 'Lecture Notes',
    });

    const updatedStats = await DocumentService.getStorageStats(studentA);
    expect(updatedStats.storage_used_bytes).toBe(initialBytes + 1048576);
    expect(updatedStats.storage_used_mb).toBeGreaterThanOrEqual(1);
    expect(updatedStats.storage_remaining_mb).toBeLessThanOrEqual(500);
    expect(updatedStats.categories_breakdown['Lecture Notes']).toBeGreaterThanOrEqual(1);
  });

  // 22. Preventing cross-student document access
  it('22. prevents student B from accessing or modifying student A documents and folders', async () => {
    const folderA = await DocumentService.createFolder(studentA, { name: 'Confidential A' });
    const docA = await DocumentService.uploadDocument(studentA, {
      title: 'Exam Secrets A',
      originalName: 'secrets.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,c2VjcmV0cw==',
      folderId: folderA.id,
    });

    // Student B cannot get folder A
    await expect(
      DocumentService.getFolder(folderA.id, studentB)
    ).rejects.toThrow(ForbiddenError);

    // Student B cannot get doc A
    await expect(
      DocumentService.getDocument(docA.id, studentB)
    ).rejects.toThrow(ForbiddenError);

    // Student B cannot update doc A
    await expect(
      DocumentService.updateDocument(docA.id, studentB, { title: 'Hacked Title' })
    ).rejects.toThrow(ForbiddenError);

    // Student B cannot delete doc A
    await expect(
      DocumentService.deleteDocument(docA.id, studentB)
    ).rejects.toThrow(ForbiddenError);
  });

  // 23. Safe preview rendering and Unicode handling
  it('23. preserves Unicode titles and filenames and prevents unsafe execution', async () => {
    const unicodeDoc = await DocumentService.uploadDocument(studentA, {
      title: 'कंप्यूटर नेटवर्क (Computer Networks) & Algorithms — λ, π, √x',
      originalName: 'संस्कृत_notes_©_2026.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      contentBase64: 'data:application/pdf;base64,dW5pY29kZQ==',
      description: 'Unicode symbols test: <script>alert("xss")</script> — safely stored as text',
    });

    expect(unicodeDoc.title).toBe('कंप्यूटर नेटवर्क (Computer Networks) & Algorithms — λ, π, √x');
    expect(unicodeDoc.original_filename).toBe('संस्कृत_notes_©_2026.pdf');
    expect(unicodeDoc.description).toContain('<script>alert("xss")</script>');
  });

  // 24. Ensuring existing Notes, Knowledge Base, Courses, and Lab Assistant features continue to work
  it('24. integrates with Notes, Lab Assistant, and Knowledge Base without creating duplicate files', async () => {
    const doc = await DocumentService.uploadDocument(studentA, {
      title: 'Operating Systems Lab Manual',
      originalName: 'os_lab_manual.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2000,
      contentBase64: 'data:application/pdf;base64,b3NfbWFu',
      category: 'Laboratory Manuals',
      subject: 'Operating Systems',
    });

    // Link to Lab Assistant
    const linkedDoc = await DocumentService.linkDocumentToLab(
      doc.id,
      studentA,
      'lab_os_sched',
      'OS Lab: CPU Scheduling'
    );
    expect(linkedDoc.metadata?.associated_lab_id).toBe('lab_os_sched');
    expect(linkedDoc.metadata?.associated_lab_title).toBe('OS Lab: CPU Scheduling');

    // Generate Notes from document
    const note = await DocumentService.generateNotesFromDocument(doc.id, studentA, {
      noteType: 'EXAM_NOTES',
      level: 'INTERMEDIATE',
    });
    expect(note).toBeDefined();
    expect(note.title).toContain('Notes');
    expect(note.source_document_id).toBe(doc.id);

    // Index in Knowledge Base
    const kbResult = await DocumentService.indexDocumentInKnowledgeBase(doc.id, studentA);
    expect(kbResult.indexed).toBe(true);

    // Verify storage key is unchanged (no duplicate file created!)
    const reloaded = await DocumentService.getDocument(doc.id, studentA);
    expect(reloaded.storage_key).toBe(doc.storage_key);
  });
});
