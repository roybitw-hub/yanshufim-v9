import { COURSE_LOOK, FALLBACK_COLORS, HEB_DAY_TO_INDEX } from './config';
import { parseNotionDate } from './dates';
import type { NotionPage } from './notion';
import { read } from './props';
import type { Course, FeedStateRow, Item, ItemType } from './types';

/** "879323203 (93-232-03)" → "879323203" */
export function normCode(raw: string | null): string {
  const m = (raw || '').match(/\d{9}/);
  return m ? m[0] : (raw || '').trim();
}

export function lookFor(code: string, name: string, idx = 0) {
  const look = COURSE_LOOK[code];
  if (look) return look;
  return { short: name.split(/[—–-]/)[0].trim(), icon: 'book', color: FALLBACK_COLORS[idx % FALLBACK_COLORS.length] };
}

export function courseFromPage(p: NotionPage, idx = 0): Course {
  const P = p.properties;
  const name = read.text(P['שם']) || 'קורס';
  const code = normCode(read.text(P['קוד קורס']));
  const look = lookFor(code, name, idx);
  const day = read.select(P['יום מפגש']);
  return {
    id: p.id,
    name,
    code,
    short: look.short,
    icon: look.icon,
    color: look.color,
    lecturer: read.text(P['מרצה']),
    format: read.select(P['פורמט']),
    weekday: day != null && day in HEB_DAY_TO_INDEX ? HEB_DAY_TO_INDEX[day] : null,
    start: read.text(P['שעת התחלה']),
    end: read.text(P['שעת סיום']),
    location: read.text(P['מיקום']),
    totalLessons: read.number(P['מספר שיעורים כולל']),
    examWeight: read.number(P['משקל מבחן']),
    workWeight: read.number(P['משקל עבודה']),
    passGrade: read.number(P['ציון עובר במבחן']),
    attendancePolicy: read.text(P['מדיניות נוכחות']),
    courseStart: parseNotionDate(read.date(P['תחילת קורס'])).date,
    courseEnd: parseNotionDate(read.date(P['סיום קורס'])).date,
    lemidaUrl: read.url(P['למדה']),
    updated: p.last_edited_time,
  };
}

export function itemFromPage(p: NotionPage): Item | null {
  const P = p.properties;
  if (read.checkbox(P['לא פעיל'])) return null;
  const when = parseNotionDate(read.date(P['תאריך']));
  return {
    id: p.id,
    title: read.text(P['שם']) || 'ללא שם',
    type: (read.select(P['סוג']) as ItemType) || null,
    status: read.select(P['סטטוס']),
    courseId: read.relation(P['קורס'])[0] ?? null,
    parentId: read.relation(P['אב'])[0] ?? null,
    date: when.date,
    time: when.time,
    computedDue: parseNotionDate(read.date(P['מועד מחושב'])).date,
    lessonNumber: read.number(P['מספר שיעור']),
    attendance: read.select(P['נוכחות']),
    learning: read.select(P['למידה']),
    recording: read.select(P['מצב הקלטה']),
    recordingUrl: read.url(P['קישור הקלטה']),
    pinned: read.checkbox(P['נעוץ']),
    weight: read.number(P['משקל']),
    grade: read.number(P['ציון']),
    verification: read.select(P['אימות']),
    needsCheck: read.checkbox(P['דורש בירור']),
    intro: read.text(P['פתיח']),
    action: read.text(P['טקסט לפעולה']),
    examSitting: read.select(P['מועד בחינה']),
    exceptionType: read.select(P['סוג חריג']),
    affectedDate: parseNotionDate(read.date(P['מפגש מושפע'])).date,
    docUrl: read.url(P['קישור מסמך']),
    sourceUrl: read.url(P['קישור מקור']),
    updated: p.last_edited_time,
  };
}

export function feedFromPage(p: NotionPage): FeedStateRow {
  const P = p.properties;
  return {
    pageId: p.id,
    key: read.text(P['מפתח אות']) || '',
    read: read.checkbox(P['נקרא']),
    pinned: read.checkbox(P['חשוב']),
    snoozedUntil: parseNotionDate(read.date(P['נדחה עד'])).date,
    version: read.text(P['גרסת נתון']),
  };
}
