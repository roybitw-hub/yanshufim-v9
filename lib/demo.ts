// Demo snapshot used when NOTION_TOKEN is missing (local preview).
// Mirrors the real Notion data shape as of 30.10.2026.
import type { Course, Item, Snapshot } from './types';
import { lookFor } from './mappers';

type C = Partial<Course> & { id: string; name: string; code: string };
const c = (x: C, i: number): Course => {
  const look = lookFor(x.code, x.name, i);
  return {
    short: look.short, icon: look.icon, color: look.color, lecturer: null, format: null, weekday: null, start: null, end: null,
    location: null, totalLessons: null, examWeight: null, workWeight: null, passGrade: null, attendancePolicy: null,
    courseStart: null, courseEnd: null, lemidaUrl: null, updated: '2026-10-30T00:00:00Z', ...x,
  };
};

export const DEMO_COURSES: Course[] = [
  { id: 'c-nh', name: 'ניהול שינויים בארגונים', code: '879323203', lecturer: 'ד״ר דוד שלום', format: 'זום', weekday: 5, start: '10:15', end: '13:25', location: 'זום דרך למדה', examWeight: 70, workWeight: 30, passGrade: 60, attendancePolicy: 'חובת נוכחות; מצלמה פתוחה בזום.', courseStart: '2026-10-16', totalLessons: 13 },
  { id: 'c-en', name: 'אנגלית בסיסי', code: '874190402', lecturer: 'יהודית מליחי', format: 'פרונטלי', weekday: 2, start: '18:00', end: '20:30', location: 'בניין 507 חדר 206', examWeight: 40, attendancePolicy: 'נוכחות חובה', courseStart: '2026-10-13', totalLessons: 13 },
  { id: 'c-mi', name: 'מבוא לכלכלה־מיקרו', code: '879340003', lecturer: 'ד״ר איתי דאבוש', format: 'זום', weekday: 5, start: '07:30', end: '10:00', location: 'זום דרך למדה', totalLessons: 13 },
  { id: 'c-dm', name: 'קבלת החלטות', code: '879305603', lecturer: 'דניאלה שנקר', format: 'פרונטלי', weekday: 3, start: '18:45', end: '20:15', examWeight: 80, workWeight: 20, totalLessons: 13 },
  { id: 'c-ob', name: 'התנהגות ארגונית א׳', code: '879300503', lecturer: 'ד״ר דביר קוה', format: 'פרונטלי', weekday: 3, start: '17:00', end: '18:30', totalLessons: 14 },
  { id: 'c-ai', name: 'בינה מלאכותית ואוריינות אקדמית', code: '879301902', lecturer: 'יניב פוקס', format: 'מתוקשב', workWeight: 60, courseStart: '2026-10-15' },
  { id: 'c-hz', name: 'הרי זו כתובתך — קידושין ונישואין בתולדות ישראל', code: '870454239', lecturer: 'חגית עמרני', format: 'מתוקשב' },
  { id: 'c-ka', name: 'כתיבה אקדמית', code: '879300403', lecturer: 'אליאב טאוב', format: 'מתוקשב' },
  { id: 'c-da', name: 'דיני ויחסי עבודה', code: '879340503', lecturer: 'אייל ברגר', format: 'מתוקשב' },
].map(c);

type I = Partial<Item> & { id: string; title: string; type: Item['type']; courseId: string };
const it = (x: I): Item => ({
  status: null, parentId: null, date: null, time: null, computedDue: null, lessonNumber: null, attendance: null, learning: null,
  recording: null, recordingUrl: null, pinned: false, weight: null, grade: null, verification: null, needsCheck: false, intro: null,
  action: null, examSitting: null, exceptionType: null, affectedDate: null, docUrl: null, sourceUrl: null, updated: '2026-10-29T12:00:00Z', ...x,
});

export const DEMO_ITEMS: Item[] = [
  // ניהול שינויים
  { id: 'i-nh-exam', title: 'מבחן — מועד א', type: 'מבחן', courseId: 'c-nh', status: 'פתוח', date: '2027-02-03', time: '16:00', weight: 70, verification: 'לא מאומת', needsCheck: true, examSitting: 'א', intro: 'התאריך שמופיע כרגע עדיין מחכה לאימות במערכת הבחינות.' },
  { id: 'i-nh-work', title: 'עבודה מסכמת — דרישות והגשה', type: 'מטלה', courseId: 'c-nh', status: 'פתוח', computedDue: '2027-01-27', weight: 30, verification: 'מאומת בריצה', needsCheck: true, intro: 'הנושא „הקמת מחלקת איקומרס ייעודית” אושר כרלוונטי ב־28.10.' },
  { id: 'i-nh-s1', title: 'בחירת נושא והצעה לאישור המרצה', type: 'שלב', courseId: 'c-nh', parentId: 'i-nh-work', status: 'הושלם' },
  { id: 'i-nh-s2', title: 'השלמת ושליחת טופס ההצעה לד״ר דוד', type: 'שלב', courseId: 'c-nh', parentId: 'i-nh-work', status: 'פתוח', action: 'למלא את טופס ההצעה לפי פרקי העבודה שבלמדה ולשלוח לד״ר דוד.' },
  { id: 'i-nh-s3', title: 'השלמת מקורות לעבודה', type: 'שלב', courseId: 'c-nh', parentId: 'i-nh-work', status: 'ממתין', needsCheck: true },
  { id: 'i-nh-l1', title: 'שיעור 1 — להשלמת תוכן', type: 'שיעור', courseId: 'c-nh', status: 'ממתין לסיכום', lessonNumber: 1, attendance: 'לא ידוע', learning: 'לא ידוע', recording: 'לא ידוע', needsCheck: true },
  { id: 'i-nh-l2', title: 'שיעור 2 — שינוי ארגוני', type: 'שיעור', courseId: 'c-nh', status: 'סיכום חלקי', date: '2026-10-23', time: '10:15', lessonNumber: 2, attendance: 'לא ידוע', learning: 'נלמד', recording: 'לא ידוע', intro: 'הוגנות, שינוי בארגון והכוחות שפועלים בעד ונגדו.' },
  { id: 'i-nh-l3', title: 'שיעור 3 — שינוי ארגוני, סביבה חיצונית ובעלי עניין', type: 'שיעור', courseId: 'c-nh', status: 'ממתין', date: '2026-10-30', lessonNumber: 3, attendance: 'לא ידוע', learning: 'לא ידוע', needsCheck: true },
  { id: 'i-nh-sum2', title: 'סיכום שיעור 2 — דגשים מהשיחה', type: 'סיכום', courseId: 'c-nh', status: 'ממתין לאישור' },
  { id: 'i-nh-msg', title: 'אישור רלוונטיות הנושא — הקמת מחלקת איקומרס', type: 'הודעה', courseId: 'c-nh', status: 'לידיעה', pinned: true, updated: '2026-10-29T21:56:42Z', intro: 'ד״ר דודי שלום השיב שהנושא רלוונטי וביקש הצעה לפי הטופס בלמדה.' },
  // אנגלית
  { id: 'i-en-bil', title: 'דו־לשוניות — בירור הנחיית המטלה', type: 'מטלה', courseId: 'c-en', status: 'ממתין', date: '2026-11-03', verification: 'לא מאומת', needsCheck: true, action: 'לברר עם יהודית אם המטלה כבר ניתנה ומה המועד שלה.' },
  { id: 'i-en-exam', title: 'מבחן סופי — מועד לא ידוע', type: 'מבחן', courseId: 'c-en', status: 'פתוח', weight: 40, needsCheck: true },
  { id: 'i-en-l1', title: 'שיעור 1 — היכרות ואוצר מילים', type: 'שיעור', courseId: 'c-en', status: 'סיכום חלקי', date: '2026-10-13', lessonNumber: 1, attendance: 'נכח', learning: 'נלמד' },
  { id: 'i-en-l2', title: 'שיעור 2 — בוחן וחלקי דיבר', type: 'שיעור', courseId: 'c-en', status: 'סיכום חלקי', date: '2026-10-20', lessonNumber: 2, attendance: 'לא ידוע', learning: 'לא ידוע' },
  { id: 'i-en-cancel', title: 'ביטול שיעור — 27.10', type: 'הודעה', courseId: 'c-en', status: 'לידיעה', date: '2026-10-24' },
  { id: 'i-en-sum1', title: 'דגשי שיעור 1 מהשיחה', type: 'סיכום', courseId: 'c-en', status: 'ממתין לאישור' },
  { id: 'i-en-sum2', title: 'דגשי שיעור 2 מהשיחה', type: 'סיכום', courseId: 'c-en', status: 'ממתין לאישור' },
  // מיקרו
  { id: 'i-mi-l', title: 'מפגש 23.10 — להשלים נושא וסיכום', type: 'שיעור', courseId: 'c-mi', status: 'ממתין לסיכום', date: '2026-10-23', attendance: 'לא ידוע', learning: 'לא ידוע', recording: 'זמינה', needsCheck: true },
  { id: 'i-mi-rec', title: 'הקלטת שיעור 23.10 זמינה בלמדה', type: 'הודעה', courseId: 'c-mi', status: 'לידיעה', date: '2026-10-23', time: '15:24', recording: 'זמינה' },
  // קבלת החלטות
  { id: 'i-dm-mid', title: 'מטלת ביניים — שתי שאלות אמריקאיות מקוריות', type: 'מטלה', courseId: 'c-dm', status: 'ממתין', weight: 20, needsCheck: true },
  { id: 'i-dm-l1', title: 'שיעור 1 — קבלת החלטות אנושית ומכונה', type: 'שיעור', courseId: 'c-dm', status: 'סיכום חלקי', date: '2026-10-21', lessonNumber: 1, attendance: 'לא ידוע', learning: 'לא ידוע' },
  { id: 'i-dm-cancel', title: 'ביטול שיעור — 14.10; השלמה טרם נקבעה', type: 'הודעה', courseId: 'c-dm', status: 'לידיעה', date: '2026-10-14', time: '09:34' },
  { id: 'i-dm-sum', title: 'סיכום אישי — שיעור 1, 21.10', type: 'סיכום', courseId: 'c-dm', status: 'ממתין לאישור' },
  // התנהגות ארגונית
  { id: 'i-ob-l1', title: 'שיעור 1 — מבוא להתנהגות ארגונית', type: 'שיעור', courseId: 'c-ob', status: 'ממתין לאישור', date: '2026-10-14', lessonNumber: 1, attendance: 'לא ידוע', learning: 'לא ידוע' },
  { id: 'i-ob-l2', title: 'שיעור 2 — מערכות, כאוס ומושגים פסיכולוגיים', type: 'שיעור', courseId: 'c-ob', status: 'ממתין לאישור', date: '2026-10-21', lessonNumber: 2, attendance: 'לא ידוע', learning: 'לא ידוע' },
  // בינה מלאכותית
  { id: 'i-ai-grade', title: 'פורסם ציון — תרגיל 1: 100', type: 'הודעה', courseId: 'c-ai', status: 'דורשת פעולה', pinned: true, updated: '2026-10-30T10:27:25Z', intro: 'ציון תרגיל 1: 100 מתוך 100.' },
  { id: 'i-ai-ex1', title: 'תרגיל 1 — חמש התנסויות ב־AI', type: 'מטלה', courseId: 'c-ai', status: 'הוגש', grade: 100 },
  { id: 'i-ai-u3', title: 'יחידה 3 — איך לדבר עם בינה מלאכותית', type: 'שיעור', courseId: 'c-ai', status: 'סוכם', lessonNumber: 3, learning: 'נלמד' },
  { id: 'i-ai-final', title: 'פרויקט סיום — הנחיות בהמשך', type: 'מטלה', courseId: 'c-ai', status: 'פתוח', weight: 60 },
  { id: 'i-ai-sum3', title: 'טיוטת סיכום — יחידה 3', type: 'סיכום', courseId: 'c-ai', status: 'ממתין לאישור' },
  // הרי זו כתובתך
  { id: 'i-hz-zoom', title: 'מפגש זום — 2026-11-19', type: 'אירוע', courseId: 'c-hz', status: 'פתוח', date: '2026-11-19', time: '20:00' },
  { id: 'i-hz-u1', title: 'יחידה 1 — הסברים לנישואים: מדוע מתחתנים?', type: 'שיעור', courseId: 'c-hz', status: 'סוכם', lessonNumber: 1, learning: 'נלמד' },
  // כתיבה אקדמית
  { id: 'i-ka-work', title: 'עבודה מסכמת בזוגות — 5 עמודים', type: 'מטלה', courseId: 'c-ka', status: 'פתוח' },
].map(it);

export function demoSnapshot(): Snapshot {
  return { courses: DEMO_COURSES, items: DEMO_ITEMS, feed: [], fetchedAt: new Date().toISOString(), source: 'demo' };
}
