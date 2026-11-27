import { describe, it, expect } from 'vitest';
import {
  sanitiseTimetable,
  sanitiseBoard,
  findClashes,
  currentAndNext,
  weeklyHours,
  boardSummary,
  PlannerService,
  type TimetableSlot,
} from '../../server/services/plannerService';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const slot = (p: Partial<TimetableSlot>): TimetableSlot => ({
  id: p.id ?? Math.random().toString(36).slice(2),
  subject: 'DSA',
  day: 0,
  start: '09:00',
  end: '10:00',
  room: '',
  teacher: '',
  kind: 'lecture',
  color: 'blue',
  ...p,
});

describe('Class timetable', () => {
  it('keeps valid classes and rejects bad times', () => {
    const t = sanitiseTimetable('s1', { slots: [{ subject: 'DBMS', day: 2, start: '10:00', end: '11:30', color: 'nope' }] });
    expect(t.slots).toHaveLength(1);
    expect(t.slots[0].color).toBe('blue');
    expect(() => sanitiseTimetable('s1', { slots: [{ subject: 'OS', day: 1, start: '11:00', end: '10:00' }] })).toThrow(/end after/);
    expect(() => sanitiseTimetable('s1', { slots: [{ subject: 'OS', day: 9, start: '09:00', end: '10:00' }] })).toThrow(/day/);
    expect(() => sanitiseTimetable('s1', { slots: [{ subject: '', day: 1, start: '09:00', end: '10:00' }] })).toThrow(/subject/);
  });

  it('finds clashes on the same day only', () => {
    const a = slot({ id: 'a', start: '09:00', end: '10:00' });
    const b = slot({ id: 'b', start: '09:30', end: '10:30' });
    const c = slot({ id: 'c', start: '10:00', end: '11:00' });
    const d = slot({ id: 'd', day: 1, start: '09:00', end: '10:00' });
    expect(findClashes([a, b, c, d]).map(([x, y]) => x.id + y.id)).toEqual(['ab', 'bc']);
  });

  it('finds the class on now and the next one, wrapping into next week', () => {
    // Monday 2026-11-30 09:30
    const mon = new Date(2026, 10, 30, 9, 30);
    const slots = [slot({ id: 'now', day: 0, start: '09:00', end: '10:00' }), slot({ id: 'later', day: 0, start: '14:00', end: '15:00' })];
    const r = currentAndNext(slots, mon);
    expect(r.current?.id).toBe('now');
    expect(r.next?.slot.id).toBe('later');
    expect(r.next?.minutesAway).toBe(270);
    const evening = new Date(2026, 10, 30, 18, 0);
    expect(currentAndNext(slots, evening).next?.slot.id).toBe('now');
    expect(weeklyHours(slots)).toBe(2);
  });
});

describe('Task board', () => {
  it('validates tasks and stamps completion', () => {
    const b = sanitiseBoard('s1', { tasks: [{ title: 'Lab record', status: 'done', priority: 'urgent', due: 'tomorrow' }] });
    expect(b.tasks[0].priority).toBe('medium');
    expect(b.tasks[0].due).toBeNull();
    expect(b.tasks[0].completed_at).not.toBeNull();
    expect(() => sanitiseBoard('s1', { tasks: [{ title: '  ' }] })).toThrow(/title/);
  });

  it('summarises open, overdue and due-today tasks', () => {
    const b = sanitiseBoard('s1', {
      tasks: [
        { title: 'a', status: 'done' },
        { title: 'b', due: '2026-11-01' },
        { title: 'c', due: '2026-11-27' },
        { title: 'd' },
      ],
    });
    expect(boardSummary(b.tasks, '2026-11-27')).toMatchObject({ total: 4, done: 1, open: 3, overdue: 1, dueToday: 1, percent: 25 });
  });

  it('keeps each student separate', () => {
    PlannerService.saveBoard('alice', { tasks: [{ title: 'only alice' }] });
    expect(PlannerService.board('bob').tasks).toHaveLength(0);
    expect(PlannerService.board('alice').tasks[0].title).toBe('only alice');
  });

  it('is reachable from the sidebar', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    expect(hrefs).toContain('/timetable');
    expect(hrefs).toContain('/tasks');
  });
});
