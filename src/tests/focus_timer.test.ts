import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { parseSessions, minutesByDay, focusStreak, summarize, formatClock, formatMinutes, dayKey, focusKey, type FocusSession } from '../features/focus/focusSessions';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const at = (y: number, m: number, d: number, h = 10) => new Date(y, m - 1, d, h).toISOString();
const s = (ended_at: string, minutes = 25, label = 'x'): FocusSession => ({ id: ended_at + minutes, ended_at, minutes, label });

describe('Focus Timer', () => {
  it('is a sidebar page with a real route', () => {
    expect(ALL_NAV_ITEMS.some((i) => i.href === '/focus')).toBe(true);
    const app = readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');
    expect(app).toMatch(/path === '\/focus'/);
    expect(app).toMatch(/<FocusTimerPage/);
  });

  it('keeps only valid stored sessions', () => {
    const raw = JSON.stringify([s(at(2026, 11, 14)), { id: 'bad', ended_at: 'nope', minutes: 25, label: 'x' }, { id: 'neg', ended_at: at(2026, 11, 14), minutes: -5, label: 'x' }, null]);
    expect(parseSessions(raw)).toHaveLength(1);
    expect(parseSessions('not json')).toEqual([]);
    expect(parseSessions(null)).toEqual([]);
    expect(parseSessions('{"a":1}')).toEqual([]);
  });

  it('totals minutes per day for the last 7 days, ending today', () => {
    const now = new Date(2026, 10, 14, 18);
    const week = minutesByDay([s(at(2026, 11, 14)), s(at(2026, 11, 14), 50), s(at(2026, 11, 12), 15), s(at(2026, 11, 1), 25)], now);
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ day: '2026-11-14', minutes: 75 });
    expect(week[4]).toMatchObject({ day: '2026-11-12', minutes: 15 });
    expect(week.reduce((n, d) => n + d.minutes, 0)).toBe(90);
  });

  it('counts the streak from today, or from yesterday if today has no session yet', () => {
    const now = new Date(2026, 10, 14, 9);
    expect(focusStreak([s(at(2026, 11, 14)), s(at(2026, 11, 13)), s(at(2026, 11, 12)), s(at(2026, 11, 10))], now)).toBe(3);
    expect(focusStreak([s(at(2026, 11, 13)), s(at(2026, 11, 12))], now)).toBe(2);
    expect(focusStreak([s(at(2026, 11, 11))], now)).toBe(0);
    expect(focusStreak([], now)).toBe(0);
  });

  it('summarizes today and the week', () => {
    const now = new Date(2026, 10, 14, 18);
    const sum = summarize([s(at(2026, 11, 14)), s(at(2026, 11, 14), 50), s(at(2026, 11, 10), 15)], now);
    expect(sum).toMatchObject({ todayMinutes: 75, todaySessions: 2, weekMinutes: 90, streak: 1 });
  });

  it('formats the clock and durations', () => {
    expect(formatClock(25 * 60)).toBe('25:00');
    expect(formatClock(61)).toBe('01:01');
    expect(formatClock(-3)).toBe('00:00');
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(135)).toBe('2 h 15 min');
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('stores history per student, never shared', () => {
    expect(focusKey('a')).not.toBe(focusKey('b'));
    const page = readFileSync(path.resolve(__dirname, '../features/focus/pages/FocusTimerPage.tsx'), 'utf8');
    expect(page).toMatch(/loadSessions\(studentId\)/);
    expect(page).toMatch(/getTodayTasks/);
  });
});
