// Regression tests for defects found during the learning-workspace audit.
// See docs/project-audit/BUG_TRACKER.md for the defect IDs referenced below.
import { describe, it, expect, vi } from 'vitest';
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

describe('BUG-010: in-memory store can be snapshotted and restored', () => {
  it('round-trips Maps, Sets and nested Maps through the snapshot file', async () => {
    const os = await import('os');
    const fsMod = await import('fs');
    const pathMod = await import('path');
    const dir = fsMod.mkdtempSync(pathMod.join(os.tmpdir(), 'snap-'));
    process.env.DATA_SNAPSHOT_PATH = pathMod.join(dir, 'snap.json');
    try {
      vi.resetModules();
      const persistence = await import('../../server/db/persistence');
      const source: Record<string, any> = {
        records: new Map([['a', { id: 'a', tags: ['x'] }]]),
        follows: new Map([['s1', new Set(['t1', 't2'])]]),
        nested: new Map([['s1', new Map([['k', { done: true }]])]]),
        list: [{ id: 1 }],
      };
      persistence.registerPersistentSource('test', source);
      persistence.saveSnapshotNow();

      source.records = new Map([['seed', { id: 'seed' }]]);
      source.follows = new Map();
      source.nested = new Map();
      source.list = [];

      vi.resetModules();
      const fresh = await import('../../server/db/persistence');
      fresh.registerPersistentSource('test', source, ['records', 'follows', 'nested', 'list']);
      expect(fresh.restoreSnapshot()).toBe(true);

      expect(source.records.get('a')).toEqual({ id: 'a', tags: ['x'] });
      expect(source.records.get('seed')).toEqual({ id: 'seed' }); // seed entries are kept (merge)
      expect(source.follows.get('s1')).toBeInstanceOf(Set);
      expect(Array.from(source.follows.get('s1'))).toEqual(['t1', 't2']);
      expect(source.nested.get('s1').get('k')).toEqual({ done: true });
      expect(source.list).toEqual([{ id: 1 }]);
    } finally {
      delete process.env.DATA_SNAPSHOT_PATH;
      fsMod.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('BUG-011: DSA 150 starter code compiles', () => {
  it('every JavaScript starter parses', async () => {
    const { TOP150_PROBLEMS } = await import('../../server/db/dsa150Catalog');
    const broken: string[] = [];
    for (const p of TOP150_PROBLEMS as any[]) {
      const js: string | undefined = p.starter_code?.javascript;
      if (!js) continue;
      try {
        // eslint-disable-next-line no-new-func
        new Function(js.replace(/require\.main === module/g, 'false'));
      } catch {
        broken.push(p.title);
      }
    }
    expect(broken).toEqual([]);
  });

  it('DSA topics carry timestamps', async () => {
    const { seedDSATopics } = await import('../../server/db/seedDsa');
    expect(seedDSATopics.every((t) => !!t.created_at && !!t.updated_at)).toBe(true);
  });
});
