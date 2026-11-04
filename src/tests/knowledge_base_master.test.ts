// src/tests/knowledge_base_master.test.ts
// Comprehensive Test Suite for Knowledge Base & Document Repository System

import { describe, it, expect, beforeEach } from 'vitest';
import { knowledgeBaseService } from '../../server/services/knowledgeBaseService';
import { database } from '../../server/db/database';

describe('Knowledge Base & Document Repository System', () => {
  const TEST_STUDENT_ID = 'student_kb_test_' + Date.now();
  let createdCollectionId: string = '';
  let sampleDocId: string = '';

  beforeEach(() => {
    // Setup initial conditions
  });

  describe('1. Onboarding State & Dashboard Analytics', () => {
    it('returns a clean onboarding state for a student with no collections or documents', async () => {
      const stats = await knowledgeBaseService.getDashboardStats('new_student_empty_' + Date.now());
      expect(stats.total_collections).toBe(0);
      expect(stats.total_documents).toBe(0);
      expect(stats.indexed_documents).toBe(0);
      expect(stats.is_onboarding).toBe(true);
      expect(stats.total_questions_asked).toBe(0);
    });
  });

  describe('2. Subject Collection Management', () => {
    it('creates a new subject collection with semester and metadata', async () => {
      const col = await knowledgeBaseService.createCollection(TEST_STUDENT_ID, {
        name: 'Operating Systems & Concurrency',
        code: 'CS301',
        category: 'COURSEWORK',
        description: 'Processes, threads, CPU scheduling, deadlocks, and virtual memory.',
        semester: 5,
        color: '#6366F1',
        icon: 'Cpu',
      });

      expect(col).toBeDefined();
      expect(col.id).toBeDefined();
      expect(col.name).toBe('Operating Systems & Concurrency');
      expect(col.code).toBe('CS301');
      expect(col.semester).toBe(5);
      expect(col.document_ids).toEqual([]);
      createdCollectionId = col.id;
    });

    it('lists all collections for the student with accurate counts', async () => {
      const list = await knowledgeBaseService.getCollections(TEST_STUDENT_ID);
      expect(list.length).toBeGreaterThanOrEqual(1);
      const found = list.find((c) => c.id === createdCollectionId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Operating Systems & Concurrency');
    });

    it('updates collection metadata', async () => {
      const updated = await knowledgeBaseService.updateCollection(
        TEST_STUDENT_ID,
        createdCollectionId,
        {
          description: 'Updated OS syllabus covering Linux kernel internals and POSIX threads.',
        }
      );
      expect(updated.description).toContain('Linux kernel internals');
    });
  });

  describe('3. Document Assignment & Collections', () => {
    it('creates a mock document and assigns it to a collection', async () => {
      const doc = await database.createDocument({
        student_id: TEST_STUDENT_ID,
        title: 'Virtual Memory & Demand Paging',
        original_filename: 'OS_Unit_4_Paging.pdf',
        mime_type: 'application/pdf',
        file_extension: 'pdf',
        file_size: 1024 * 500,
        storage_key: 'uploads/mock_paging.pdf',
        status: 'READY',
        page_count: 18,
      });
      sampleDocId = doc.id;

      // Assign to collection
      const updatedCol = await knowledgeBaseService.assignDocumentToCollection(
        TEST_STUDENT_ID,
        createdCollectionId,
        sampleDocId
      );
      expect(updatedCol.document_ids).toContain(sampleDocId);

      // Verify collection list reflects the document
      const list = await knowledgeBaseService.getCollections(TEST_STUDENT_ID);
      const target = list.find((c) => c.id === createdCollectionId);
      expect(target?.document_ids).toContain(sampleDocId);
    });

    it('reindexes a document to refresh status and vector representation', async () => {
      const reindexed = await knowledgeBaseService.reindexDocument(TEST_STUDENT_ID, sampleDocId);
      expect(reindexed.id).toBe(sampleDocId);
      expect(reindexed.status).toBe('READY');
    });
  });

  describe('4. Semantic Vector Search', () => {
    it('finds relevant document chunks by keyword and concept matching', async () => {
      const results = await knowledgeBaseService.search(TEST_STUDENT_ID, {
        query: 'virtual memory page fault handler',
      });

      expect(results).toBeDefined();
      expect(results.query).toBe('virtual memory page fault handler');
      expect(results.matches.length).toBeGreaterThan(0);
      expect(results.matches[0].document_title).toBe('Virtual Memory & Demand Paging');
      expect(results.matches[0].score).toBeGreaterThan(0.5);
    });

    it('scopes search by collection filter', async () => {
      const results = await knowledgeBaseService.search(TEST_STUDENT_ID, {
        query: 'paging',
        collection_id: createdCollectionId,
      });

      expect(results.matches.length).toBeGreaterThan(0);
      for (const match of results.matches) {
        expect(match.document_id).toBe(sampleDocId);
      }
    });
  });

  describe('5. Grounded AI Tutor Question Answering', () => {
    it('synthesizes an answer with page citations and key concepts', async () => {
      const qaResponse = await knowledgeBaseService.askQuestion(TEST_STUDENT_ID, {
        question: 'Explain the page fault handling mechanism and how page tables work.',
        document_id: sampleDocId,
      });

      expect(qaResponse.question).toContain('page fault');
      expect(qaResponse.answer).toBeDefined();
      expect(qaResponse.answer.length).toBeGreaterThan(50);
      expect(qaResponse.citations.length).toBeGreaterThan(0);
      expect(qaResponse.citations[0].document_id).toBe(sampleDocId);
      expect(qaResponse.citations[0].page_number).toBeGreaterThan(0);
      expect(qaResponse.key_concepts.length).toBeGreaterThan(0);
      expect(qaResponse.follow_up_questions.length).toBeGreaterThan(0);
    });

    it('persists question history and retrieves recent questions', async () => {
      const history = await knowledgeBaseService.getQuestionHistory(TEST_STUDENT_ID, 5);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].question).toContain('page fault');
    });
  });

  describe('6. Active Recall & Interactive Study Material Generation', () => {
    it('generates interactive flashcards with questions, answers, and difficulty', async () => {
      const material = await knowledgeBaseService.generateStudyMaterial(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        type: 'FLASHCARDS',
        topic: 'Virtual Memory',
      });

      expect(material.type).toBe('FLASHCARDS');
      expect(material.content.flashcards).toBeDefined();
      expect(material.content.flashcards!.length).toBeGreaterThan(0);
      const firstCard = material.content.flashcards![0];
      expect(firstCard.question).toBeDefined();
      expect(firstCard.answer).toBeDefined();
      expect(['EASY', 'MEDIUM', 'HARD']).toContain(firstCard.difficulty);
    });

    it('generates multiple choice quiz questions with explanations', async () => {
      const material = await knowledgeBaseService.generateStudyMaterial(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        type: 'QUIZ',
      });

      expect(material.type).toBe('QUIZ');
      expect(material.content.quiz_questions).toBeDefined();
      expect(material.content.quiz_questions!.length).toBeGreaterThan(0);
      const firstQ = material.content.quiz_questions![0];
      expect(firstQ.options.length).toBe(4);
      expect(firstQ.correct_answer_index).toBeGreaterThanOrEqual(0);
      expect(firstQ.correct_answer_index).toBeLessThan(4);
      expect(firstQ.explanation).toBeDefined();
    });

    it('generates executive summary with key takeaways and prerequisites', async () => {
      const material = await knowledgeBaseService.generateStudyMaterial(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        type: 'SUMMARY',
      });

      expect(material.type).toBe('SUMMARY');
      expect(material.content.summary).toBeDefined();
      expect(material.content.key_takeaways).toBeDefined();
      expect(material.content.key_takeaways!.length).toBeGreaterThan(0);
    });

    it('generates formula & complexity reference sheet', async () => {
      const material = await knowledgeBaseService.generateStudyMaterial(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        type: 'FORMULA_SHEET',
      });

      expect(material.type).toBe('FORMULA_SHEET');
      expect(material.content.formula_sheet).toBeDefined();
      expect(material.content.formula_sheet!.length).toBeGreaterThan(0);
      const firstFormula = material.content.formula_sheet![0];
      expect(firstFormula.name).toBeDefined();
      expect(firstFormula.formula).toBeDefined();
    });
  });

  describe('7. Bookmarks & Margin Annotations', () => {
    let bookmarkId = '';
    let noteId = '';

    it('saves a bookmark on a specific page of a document', async () => {
      const bookmark = await knowledgeBaseService.createBookmark(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        page_number: 4,
        title: 'TLB Hit and Miss Timing Calculations',
        note: 'Review before mid-semester examination',
      });

      expect(bookmark.id).toBeDefined();
      expect(bookmark.page_number).toBe(4);
      bookmarkId = bookmark.id;

      const list = await knowledgeBaseService.getBookmarks(TEST_STUDENT_ID, sampleDocId);
      expect(list.some((b) => b.id === bookmarkId)).toBe(true);
    });

    it('saves an annotation / note on a document page', async () => {
      const note = await knowledgeBaseService.createNote(TEST_STUDENT_ID, {
        document_id: sampleDocId,
        page_number: 4,
        selected_text: 'TLB hit ratio is typically 98% in modern processors',
        note_text: 'Remember formula for EAT = (1+e)*hit + (2+e)*(1-hit)',
        color: '#FBBF24',
      });

      expect(note.id).toBeDefined();
      expect(note.selected_text).toContain('TLB hit ratio');
      noteId = note.id;

      const list = await knowledgeBaseService.getNotes(TEST_STUDENT_ID, sampleDocId);
      expect(list.some((n) => n.id === noteId)).toBe(true);
    });

    it('deletes bookmark and note', async () => {
      const delB = await knowledgeBaseService.deleteBookmark(TEST_STUDENT_ID, bookmarkId);
      expect(delB).toBe(true);

      const delN = await knowledgeBaseService.deleteNote(TEST_STUDENT_ID, noteId);
      expect(delN).toBe(true);
    });
  });

  describe('8. External Reference Resources', () => {
    let resourceId = '';

    it('attaches an external reference link to a collection', async () => {
      const res = await knowledgeBaseService.createResource(TEST_STUDENT_ID, {
        collection_id: createdCollectionId,
        title: 'MIT 6.004 Computation Structures - Virtual Memory Lecture',
        url: 'https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/',
        type: 'VIDEO',
        description: 'Complete video lecture on page tables, paging algorithms, and MMU hardware.',
      });

      expect(res.id).toBeDefined();
      expect(res.title).toContain('MIT 6.004');
      expect(res.type).toBe('VIDEO');
      resourceId = res.id;

      const allRes = await knowledgeBaseService.getResources(TEST_STUDENT_ID, createdCollectionId);
      expect(allRes.some((r) => r.id === resourceId)).toBe(true);
    });

    it('deletes external reference resource', async () => {
      const delRes = await knowledgeBaseService.deleteResource(TEST_STUDENT_ID, resourceId);
      expect(delRes).toBe(true);
    });
  });

  describe('9. Complete Collection Teardown', () => {
    it('deletes a collection while keeping associated documents intact', async () => {
      const res = await knowledgeBaseService.deleteCollection(
        TEST_STUDENT_ID,
        createdCollectionId,
        false
      );
      expect(res).toBe(true);

      const list = await knowledgeBaseService.getCollections(TEST_STUDENT_ID);
      expect(list.some((c) => c.id === createdCollectionId)).toBe(false);

      // Verify document still exists in repository
      const doc = await database.getDocumentById(sampleDocId);
      expect(doc).toBeDefined();
    });
  });
});
