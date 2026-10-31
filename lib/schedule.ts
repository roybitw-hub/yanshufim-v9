import { SEMESTER, SESSION_OVERRIDES } from './config';
import { addDays, diffDays, weekday } from './dates';
import type { CalEvent, Course, Item, Session, Snapshot } from './types';

/** Dates of lessons that were cancelled, from "ביטול" exceptions or cancellation notices. */
export function cancelledDates(items: Item[]): Set<string> {
  const out = new Set<string>();
  for (const it of items) {
    if (!it.courseId) continue;
    if (it.exceptionType === 'ביטול' && it.affectedDate) out.add(`${it.courseId}|${it.affectedDate}`);
    if (it.type === 'הודעה' && /ביטול/.test(it.title)) {
      const m = it.title.match(/(\d{1,2})\.(\d{1,2})/);
      if (m) {
        const year = Number(m[2]) >= 9 ? SEMESTER.start.slice(0, 4) : String(Number(SEMESTER.start.slice(0, 4)) + 1);
        out.add(`${it.courseId}|${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
      }
    }
  }
  return out;
}

function weeklyFor(c: Course): { weekday: number; start: string; end: string; label: string }[] {
  if (SESSION_OVERRIDES[c.code]) return SESSION_OVERRIDES[c.code];
  if (c.weekday == null || !c.start) return [];
  return [{ weekday: c.weekday, start: c.start, end: c.end || c.start, label: '' }];
}

/** Expands every course's weekly meeting into concrete sessions inside [from, to]. */
export function sessionsBetween(snap: Snapshot, from: string, to: string): Session[] {
  const cancelled = cancelledDates(snap.items);
  const out: Session[] = [];
  const lo = from < SEMESTER.start ? SEMESTER.start : from;
  const hi = to > SEMESTER.end ? SEMESTER.end : to;
  if (lo > hi) return out;
  for (const c of snap.courses) {
    const first = c.courseStart && c.courseStart > lo ? c.courseStart : lo;
    const last = c.courseEnd && c.courseEnd < hi ? c.courseEnd : hi;
    for (const w of weeklyFor(c)) {
      let d = first;
      const shift = (w.weekday - weekday(d) + 7) % 7;
      d = addDays(d, shift);
      for (; d <= last; d = addDays(d, 7)) {
        out.push({
          key: `${c.id}|${d}|${w.start}`,
          courseId: c.id,
          date: d,
          start: w.start,
          end: w.end,
          label: w.label,
          cancelled: cancelled.has(`${c.id}|${d}`),
        });
      }
    }
  }
  return out.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

const DUE_TYPES = new Set(['מטלה', 'שלב']);
export const DONE = new Set(['הושלם', 'הוגש', 'טופלה', 'נלמד', 'סוכם', 'פורסם']);

export function dueDate(it: Item): string | null {
  return it.date || it.computedDue;
}

/** Sessions + dated items (deadlines, exams, events) for a range, in one list. */
export function eventsBetween(snap: Snapshot, from: string, to: string): CalEvent[] {
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const ev: CalEvent[] = sessionsBetween(snap, from, to).map((s) => ({
    key: 's:' + s.key,
    courseId: s.courseId,
    itemId: null,
    date: s.date,
    time: s.start,
    label: course.get(s.courseId)!.short + (s.label ? ' · ' + s.label : ''),
    kind: 'session',
    cancelled: s.cancelled,
  }));
  for (const it of snap.items) {
    const d = dueDate(it);
    if (!d || d < from || d > to) continue;
    if (DUE_TYPES.has(it.type || '') && !DONE.has(it.status || '')) {
      ev.push({ key: 'd:' + it.id, courseId: it.courseId, itemId: it.id, date: d, time: null, label: it.title, kind: 'due' });
    } else if (it.type === 'מבחן') {
      ev.push({ key: 'x:' + it.id, courseId: it.courseId, itemId: it.id, date: d, time: it.time, label: it.title, kind: 'exam' });
    } else if (it.type === 'אירוע') {
      ev.push({ key: 'e:' + it.id, courseId: it.courseId, itemId: it.id, date: d, time: it.time, label: it.title.replace(/\s*—\s*\d{4}-\d{2}-\d{2}$/, ''), kind: 'event' });
    }
  }
  return ev.sort((a, b) => (a.date + (a.time || '23:59')).localeCompare(b.date + (b.time || '23:59')));
}

/** Lesson items for a course, matched to sessions by date. */
export function lessonOnDate(items: Item[], courseId: string, date: string): Item | undefined {
  return items.find((i) => i.type === 'שיעור' && i.courseId === courseId && i.date === date);
}

export function semesterProgress(today: string) {
  const total = Math.ceil((diffDays(SEMESTER.start, SEMESTER.end) + 1) / 7);
  const week = Math.min(total, Math.max(1, Math.floor(diffDays(SEMESTER.start, today) / 7) + 1));
  return { week, total };
}
