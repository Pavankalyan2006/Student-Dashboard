// Regression tests for defects found during the learning-workspace audit.
// See docs/project-audit/BUG_TRACKER.md for the defect IDs referenced below.
import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { NotesService } from '../../server/services/notes';
import { CourseService } from '../../server/services/courses';
import { appendQueryParams } from '../api/client';

const studentA = 'std_audit_regression_a';
const studentB = 'std_audit_regression_b';

describe('BUG-006: partial note updates keep existing fields', () => {
  it('editing only the title does not erase content or tags', async () => {
    const note = await NotesService.createManualNote(studentA, {
      title: 'Original title',
      content: 'Binary search runs in O(log n).',
      tags: ['dsa'],
    });

    // Routes forward every known field, so unspecified ones arrive as undefined.
    const updated = await NotesService.updateNote(note.id, studentA, {
      title: 'Renamed',
      content: undefined,
      tags: undefined,
      is_favorite: undefined,
      structured_data: undefined,
    });

    expect(updated.title).toBe('Renamed');
    expect(updated.content).toBe('Binary search runs in O(log n).');
    expect(updated.tags).toEqual(['dsa']);

    const listed = await NotesService.listNotes(studentA, { search: 'binary' });
    expect(listed.items.some((n) => n.id === note.id)).toBe(true);
  });

  it('rejects a blank title on update', async () => {
    const note = await NotesService.createManualNote(studentA, { title: 'T', content: 'C' });
    await expect(NotesService.updateNote(note.id, studentA, { title: '   ' })).rejects.toThrow(/title/i);
  });
});

describe('BUG-007: shared catalog courses are read-only for students', () => {
  it('a student cannot rename or add chapters to a catalog course', async () => {
    const catalog = await CourseService.listCourses({ limit: 1 }, studentB);
    const course = catalog.items[0];
    expect(course.is_custom).toBeFalsy();

    await expect(CourseService.updateCourse(course.id, studentB, { title: 'Hacked' } as any)).rejects.toThrow(
      /permission/i
    );
    await expect(CourseService.addChapter(course.id, studentB, { title: 'Injected' })).rejects.toThrow(/permission/i);

    const after = await CourseService.getCourse(course.id, studentA);
    expect(after.title).toBe(course.title);
  });

  it('the owner can still edit their own custom course', async () => {
    const custom = await CourseService.createCustomCourse(studentA, { title: 'My Custom Course' } as any);
    const updated = await CourseService.updateCourse(custom.id, studentA, { title: 'My Custom Course v2' } as any);
    expect(updated.title).toBe('My Custom Course v2');
    await expect(CourseService.updateCourse(custom.id, studentB, { title: 'x' } as any)).rejects.toThrow(/permission/i);
  });
});

describe('BUG-008: student-attached course resources are private', () => {
  it('hides another student resource and blocks deleting it', async () => {
    const catalog = await CourseService.listCourses({ limit: 1 }, studentA);
    const courseId = catalog.items[0].id;
    const resource = await CourseService.addResource(courseId, studentA, {
      title: 'A private link',
      type: 'LINK',
      url: 'https://example.test/a',
    });

    const asB = await CourseService.getCourse(courseId, studentB);
    expect(asB.resources.some((r) => r.id === resource.id)).toBe(false);

    await expect(CourseService.removeResource(courseId, resource.id, studentB)).rejects.toThrow(/permission/i);

    const asA = await CourseService.getCourse(courseId, studentA);
    expect(asA.resources.some((r) => r.id === resource.id)).toBe(true);
  });
});

describe('BUG-004: apiClient builds query strings from { params }', () => {
  it('appends defined params and skips empty ones', () => {
    expect(appendQueryParams('/languages', { query: 'hin', region: undefined, limit: 5 })).toBe(
      '/languages?query=hin&limit=5'
    );
    expect(appendQueryParams('/x?a=1', { b: 'two words' })).toBe('/x?a=1&b=two+words');
    expect(appendQueryParams('/x', undefined)).toBe('/x');
  });
});

describe('BUG-002: AI Tutor context options use existing store methods', () => {
  it('db exposes the document and note readers the route relies on', async () => {
    expect(typeof db.getDocuments).toBe('function');
    expect(typeof db.getNotes).toBe('function');
    expect(Array.isArray(await db.getNotes(studentA))).toBe(true);
  });
});
