import { SEMESTER } from './config';
import { addDays, diffDays, dm, greeting, longDay, semesterWeek } from './dates';
import { applyState, computeMessages, computeSignals, computeStats, courseProgress } from './feed';
import { DONE, dueDate, eventsBetween, lessonOnDate } from './schedule';
import type { Snapshot } from './types';

/** Everything the home screen shows, computed on the server from one snapshot. */
export function buildHome(snap: Snapshot, today: string, now: string) {
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const signals = computeSignals(snap, today, now);
  const view = applyState(signals, snap, today);
  const stats = computeStats(snap, signals, today);

  const events = eventsBetween(snap, addDays(today, -40), addDays(today, 120)).map((e) => {
    const c = e.courseId ? course.get(e.courseId) : undefined;
    const documented = e.kind === 'session' && e.courseId ? !!lessonOnDate(snap.items, e.courseId, e.date) : true;
    return {
      key: e.key, date: e.date, time: e.time, kind: e.kind, documented, cancelled: e.cancelled,
      color: c?.color || '#5B3FF0',
      label: e.kind === 'session' ? e.label : e.kind === 'event' ? `זום · ${c?.short ?? ''}` : `${c?.short ?? ''} · מועד`,
      href: e.itemId ? `/items/${e.itemId}` : e.courseId ? `/courses/${e.courseId}` : undefined,
    };
  });

  const messages = computeMessages(snap, today).map((m) => ({ ...m, href: `/items/${m.itemId}` }));

  // "בהמשך": upcoming beyond this week + pending approvals
  const summaries = snap.items.filter((i) => i.type === 'סיכום' && i.status === 'ממתין לאישור').length;
  const later: { icon: string; color: string; title: string; right: string; href: string }[] = [];
  if (summaries) later.push({ icon: 'summary', color: '#0F9E8E', title: `${summaries} סיכומים ממתינים לאישור`, right: 'לתיבה', href: '/inbox' });
  for (const it of snap.items) {
    const d = dueDate(it);
    if (!d || diffDays(today, d) <= 7 || diffDays(today, d) > 120) continue;
    if (it.type === 'מבחן') later.push({ icon: 'exam', color: '#E23A5E', title: `${it.title.split('—')[0].trim()} · ${course.get(it.courseId || '')?.short ?? ''}`, right: `${dm(d)}${it.verification === 'לא מאומת' ? ' · לא מאומת' : ''}`, href: `/items/${it.id}` });
    else if (it.type === 'אירוע') later.push({ icon: 'zoom', color: '#B08A10', title: `זום · ${course.get(it.courseId || '')?.short ?? ''}`, right: `${dm(d)}${it.time ? ' · ' + it.time : ''}`, href: `/items/${it.id}` });
    else if ((it.type === 'מטלה') && !DONE.has(it.status || '')) later.push({ icon: 'task', color: '#6B4DF0', title: it.title.split('—')[0].trim(), right: dm(d), href: `/items/${it.id}` });
  }
  later.splice(5);

  const courses = snap.courses.map((c) => ({ ...c, ...courseProgress(c, snap.items) }))
    .sort((a, b) => b.open - a.open || (a.format === 'מתוקשב' ? 1 : 0) - (b.format === 'מתוקשב' ? 1 : 0));

  const todaySessions = events.filter((e) => e.date === today && e.kind === 'session' && !e.cancelled).length;
  const urgent = view.feed.filter((s) => s.priority >= 75).length + view.pinned.length;
  return {
    greeting: greeting(now),
    dayLabel: longDay(today),
    week: semesterWeek(today, SEMESTER.start),
    summary: `${Math.min(urgent, 9) || 'אין'} דברים מחכים לך${todaySessions ? ` · ${todaySessions} מפגשים היום` : ''}`,
    stats, view, events, messages, later, courses, todaySessions,
    courseLite: Object.fromEntries(snap.courses.map((c) => [c.id, { id: c.id, short: c.short, icon: c.icon, color: c.color }])),
    mood: (view.feed.some((s) => s.priority >= 90) ? 'alert' : view.feed.length === 0 ? 'happy' : 'full') as 'alert' | 'happy' | 'full',
  };
}
