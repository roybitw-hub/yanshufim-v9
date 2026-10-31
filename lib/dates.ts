import { TZ } from './config';

export const DAY_LETTER = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
export const DAY_NAME = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTH_NAME = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
});

/** Local (Israel) date + time parts of an instant. */
export function localParts(d: Date): { date: string; time: string } {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  const hour = p.hour === '24' ? '00' : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${hour}:${p.minute}` };
}

/**
 * Normalises a Notion date string. Date-only values stay as-is (no time);
 * date-times are converted to Israel local date + time.
 */
export function parseNotionDate(s: string | null | undefined): { date: string | null; time: string | null } {
  if (!s) return { date: null, time: null };
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: null };
  const d = new Date(s.replace(' ', 'T'));
  if (isNaN(d.getTime())) return { date: null, time: null };
  return localParts(d);
}

export function todayIL(now = new Date()): string {
  return localParts(now).date;
}

export function nowTimeIL(now = new Date()): string {
  return localParts(now).time;
}

/** Calendar arithmetic on YYYY-MM-DD strings (timezone-free). */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function weekday(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function diffDays(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function dm(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}.${m}`;
}

export function dayLabel(iso: string): string {
  return `${DAY_LETTER[weekday(iso)]} ${dm(iso)}`;
}

export function longDay(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${DAY_NAME[weekday(iso)]} · ${d} ב${MONTH_NAME[m - 1]}`;
}

export function inDays(n: number): string {
  if (n === 0) return 'היום';
  if (n === 1) return 'מחר';
  if (n === -1) return 'אתמול';
  if (n < 0) return `לפני ${-n} ימים`;
  return `בעוד ${n} ימים`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function greeting(time: string): string {
  const h = Number(time.slice(0, 2));
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}

export function semesterWeek(today: string, start: string): number {
  return Math.floor(diffDays(start, today) / 7) + 1;
}
