import { addDays, diffDays, dm, inDays, timeToMinutes } from './dates';
import { DONE, dueDate, lessonOnDate, sessionsBetween } from './schedule';
import type { Course, Item, Signal, Snapshot } from './types';

/**
 * "מה חשוב עכשיו" — derives signals from the data, each with a stable key so
 * read / pinned / snoozed state (stored in Notion) survives re-computation.
 */
export function computeSignals(snap: Snapshot, today: string, now: string): Signal[] {
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const out: Signal[] = [];
  const ver = (it: Item) => it.updated.slice(0, 16);

  for (const it of snap.items) {
    const c = it.courseId ? course.get(it.courseId) : undefined;
    const due = dueDate(it);
    const open = !DONE.has(it.status || '');

    // Deadlines (assignments + steps)
    if ((it.type === 'מטלה' || it.type === 'שלב') && open && due) {
      const n = diffDays(today, due);
      if (n <= 14) {
        const overdue = n < 0;
        out.push({
          key: `due:${it.id}`, kind: overdue ? 'איחור' : 'מועד קרוב', category: 'due', courseId: it.courseId, itemId: it.id,
          title: it.title, meta: `${dm(due)}${it.verification === 'לא מאומת' ? ' · מועד לא מאומת' : ''}`,
          tag: overdue ? 'באיחור' : inDays(n), tone: overdue || n <= 2 ? 'red' : 'orange',
          priority: overdue ? 100 : n <= 2 ? 95 : n <= 7 ? 85 : 70, version: ver(it),
        });
        continue;
      }
    }

    // The open next step of a parent assignment
    if (it.type === 'שלב' && it.status === 'פתוח' && it.parentId) {
      const parent = snap.items.find((p) => p.id === it.parentId);
      out.push({
        key: `step:${it.id}`, kind: 'מטלת בת', category: 'due', courseId: it.courseId, itemId: it.id,
        title: it.title, meta: parent ? `מטלת בת · ${parent.title.split('—')[0].trim()}` : 'מטלת בת',
        tag: 'הצעד הבא', tone: 'violet', priority: 82, version: ver(it),
      });
      continue;
    }

    // Assignments that are still incomplete (no date yet)
    if (it.type === 'מטלה' && open && !due && (it.status === 'ממתין' || it.status === 'בתהליך')) {
      out.push({
        key: `incomplete:${it.id}`, kind: 'מטלה לא מלאה', category: 'due', courseId: it.courseId, itemId: it.id,
        title: it.title, meta: [it.weight ? `${it.weight}% מהציון` : '', 'אין מועד'].filter(Boolean).join(' · '),
        tag: 'טרם הושלם', tone: 'violet', priority: 60, version: ver(it),
      });
    }

    // Exams within 30 days
    if (it.type === 'מבחן' && due) {
      const n = diffDays(today, due);
      if (n >= 0 && n <= 30) {
        out.push({
          key: `exam:${it.id}`, kind: 'מבחן קרוב', category: 'due', courseId: it.courseId, itemId: it.id,
          title: it.title, meta: `${dm(due)}${it.time ? ' · ' + it.time : ''}`, tag: inDays(n), tone: n <= 7 ? 'red' : 'orange',
          priority: n <= 7 ? 92 : 78, version: ver(it),
        });
      }
    }

    // Feedback / grade that asks for action
    if (it.type === 'הודעה' && it.status === 'דורשת פעולה') {
      const grade = it.title.match(/(\d{2,3})\s*$/);
      out.push({
        key: `feedback:${it.id}`, kind: 'משוב', category: 'approve', courseId: it.courseId, itemId: it.id,
        title: it.title.replace(/^פורסם ציון\s*—\s*/, 'משוב לבדיקה — ').replace(/:\s*\d+$/, ''),
        meta: it.action?.split('.')[0] || 'לפתוח את המשוב', tag: grade ? `ציון ${grade[1]}` : 'משוב', tone: 'green', priority: 72, version: ver(it),
      });
    }

    // Recording available but attendance not reported
    if (it.type === 'שיעור' && it.recording === 'זמינה' && (!it.attendance || it.attendance === 'לא ידוע') && it.date) {
      out.push({
        key: `recording:${it.id}`, kind: 'הקלטה', category: 'lessons', courseId: it.courseId, itemId: it.id,
        title: `הקלטת מפגש ${dm(it.date)} זמינה`, meta: 'נוכחות לא דווחה', tag: 'הקלטה חדשה', tone: 'blue', priority: 66, version: ver(it),
        actions: [{ label: 'נכחתי', action: 'attend:נכח' }, { label: 'צפיתי', action: 'attend:צפה בהקלטה' }],
      });
    }
    void c;
  }

  // Past sessions without a lesson record (last 21 days)
  const nowMin = timeToMinutes(now);
  const missing = new Map<string, { courseId: string; date: string; times: string[] }>();
  for (const s of sessionsBetween(snap, addDays(today, -21), today)) {
    if (s.cancelled) continue;
    if (s.date === today && timeToMinutes(s.end) > nowMin) continue;
    if (lessonOnDate(snap.items, s.courseId, s.date)) continue;
    const k = `${s.courseId}:${s.date}`;
    const row = missing.get(k) || { courseId: s.courseId, date: s.date, times: [] };
    row.times.push(s.label ? `${s.label} ${s.start}` : s.start);
    missing.set(k, row);
  }
  for (const m of missing.values()) {
    const n = diffDays(m.date, today);
    out.push({
      key: `missing-lesson:${m.courseId}:${m.date}`, kind: 'שיעור חסר תיעוד', category: 'lessons', courseId: m.courseId, itemId: null,
      title: `מפגש ${dm(m.date)} לא תועד`, meta: m.times.join(' · '), tag: 'אין תיעוד', tone: 'red',
      priority: n <= 7 ? 76 : 58, version: m.date,
      actions: [{ label: 'הוסף תיעוד', action: `lesson:${m.date}` }, { label: 'לא התקיים', action: 'dismiss' }],
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

export interface FeedView {
  pinned: Signal[];
  feed: Signal[];
  read: Signal[];
}

/** Applies the user's stored state (read / pinned / snoozed) to computed signals. */
export function applyState(signals: Signal[], snap: Snapshot, today: string): FeedView {
  const state = new Map(snap.feed.map((f) => [f.key, f]));
  const itemPinned = new Set(snap.items.filter((i) => i.pinned).map((i) => i.id));
  const pinned: Signal[] = [];
  const feed: Signal[] = [];
  const read: Signal[] = [];
  for (const s of signals) {
    const st = state.get(s.key);
    // A substantial change (new version) brings a read card back.
    const isRead = !!st?.read && (!st.version || st.version === s.version);
    const snoozed = !!st?.snoozedUntil && st.snoozedUntil > today;
    const isPinned = st ? st.pinned : !!(s.itemId && itemPinned.has(s.itemId));
    if (isRead || snoozed) read.push(s);
    else if (isPinned) pinned.push(s);
    else feed.push(s);
  }
  return { pinned, feed, read };
}

export interface Message {
  key: string;
  courseId: string | null;
  itemId: string;
  kicker: string;
  text: string;
  icon: string;
  tone: string;
  when: string;
}

/** Rotating "הודעות": recent notices, grades and recordings (last 14 days). */
export function computeMessages(snap: Snapshot, today: string): Message[] {
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const state = new Map(snap.feed.map((f) => [f.key, f]));
  const out: Message[] = [];
  for (const it of snap.items) {
    if (it.type !== 'הודעה') continue;
    const when = it.date || it.updated.slice(0, 10);
    const age = diffDays(when, today);
    if (age > 14 || age < 0) continue;
    const key = `msg:${it.id}`;
    if (state.get(key)?.read) continue;
    const c = it.courseId ? course.get(it.courseId) : undefined;
    let icon = 'announce';
    let tone = '#B08A10';
    if (/ציון/.test(it.title)) { icon = 'grade'; tone = '#14A36A'; }
    else if (/הקלטה|הקלטת/.test(it.title)) { icon = 'record'; tone = '#2F6BFF'; }
    else if (/ביטול/.test(it.title)) { icon = 'cal-x'; tone = '#E23A5E'; }
    else if (/אישור|אושר/.test(it.title)) { icon = 'done'; tone = '#14A36A'; }
    out.push({
      key, courseId: it.courseId, itemId: it.id, icon, tone, when,
      kicker: `${c?.short ?? 'כללי'} · ${inDays(-age)}`,
      text: it.title.replace(/\s*—\s*/, ' · '),
    });
  }
  return out.sort((a, b) => b.when.localeCompare(a.when)).slice(0, 8);
}

export interface Stats {
  openTasks: number;
  doneTasks: number;
  totalTasks: number;
  urgentToday: number;
  urgentWeek: number;
  nextDueDays: number | null;
}

export function computeStats(snap: Snapshot, signals: Signal[], today: string): Stats {
  const tasks = snap.items.filter((i) => i.type === 'מטלה' || i.type === 'שלב');
  const done = tasks.filter((t) => DONE.has(t.status || '')).length;
  const dues = snap.items
    .filter((i) => (i.type === 'מטלה' || i.type === 'שלב' || i.type === 'מבחן') && !DONE.has(i.status || ''))
    .map((i) => dueDate(i))
    .filter((d): d is string => !!d && d >= today)
    .sort();
  return {
    openTasks: tasks.length - done,
    doneTasks: done,
    totalTasks: tasks.length,
    urgentToday: signals.filter((s) => s.priority >= 90).length,
    urgentWeek: signals.filter((s) => s.priority >= 75).length,
    nextDueDays: dues.length ? diffDays(today, dues[0]) : null,
  };
}

/** Course card numbers: open items and lessons learned out of total. */
export function courseProgress(c: Course, items: Item[]) {
  const mine = items.filter((i) => i.courseId === c.id);
  const lessons = mine.filter((i) => i.type === 'שיעור');
  const learned = lessons.filter((l) => l.learning === 'נלמד' || l.status === 'נלמד' || l.status === 'סוכם').length;
  const open = mine.filter((i) => (i.type === 'מטלה' || i.type === 'שלב') && !DONE.has(i.status || '')).length;
  const total = c.totalLessons || (c.format === 'מתוקשב' ? null : 13);
  return { learned, total, open, pct: total ? Math.round((learned / total) * 100) : learned ? 30 : 0, unitLabel: c.format === 'מתוקשב' ? 'יחידות' : 'שיעורים' };
}
