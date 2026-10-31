// Static configuration for semester A (תשפ״ז). Everything else comes from Notion.

export const TZ = 'Asia/Jerusalem';

export const SEMESTER = {
  id: '2026-27-A',
  label: 'סמסטר א׳ · תשפ״ז',
  start: '2026-10-11',
  end: '2027-01-17',
  breakEnd: '2027-02-28',
};

export const DS = {
  courses: process.env.NOTION_DS_COURSES || '4d280c0b-dc28-4bd9-be81-566210b36f80',
  items: process.env.NOTION_DS_ITEMS || '6071d36d-e389-4f16-902a-e2ebffc6eba1',
  feed: process.env.NOTION_DS_FEED || 'c7af9570-12a2-4011-8aae-1fe3dd5920a5',
};

/** Visual identity per course, keyed by the 9-digit course code. */
export const COURSE_LOOK: Record<string, { short: string; icon: string; color: string }> = {
  '879323203': { short: 'ניהול שינויים', icon: 'change', color: '#6B4DF0' },
  '874190402': { short: 'אנגלית', icon: 'english', color: '#0F9E8E' },
  '879340003': { short: 'מיקרו', icon: 'micro', color: '#2F6BFF' },
  '879305603': { short: 'קבלת החלטות', icon: 'decide', color: '#E0458F' },
  '879300503': { short: 'התנהגות ארגונית', icon: 'org', color: '#E8721A' },
  '879301902': { short: 'בינה מלאכותית', icon: 'ai', color: '#4B57C9' },
  '870454239': { short: 'הרי זו כתובתך', icon: 'scroll', color: '#B08A10' },
  '879300403': { short: 'כתיבה אקדמית', icon: 'pen', color: '#1F86B5' },
  '879340503': { short: 'דיני עבודה', icon: 'scales', color: '#2E9548' },
};

export const FALLBACK_COLORS = ['#6B4DF0', '#0F9E8E', '#2F6BFF', '#E0458F', '#E8721A', '#4B57C9', '#B08A10', '#1F86B5', '#2E9548'];

/**
 * Weekly meetings that a single course record cannot express
 * (e.g. micro: lecture + tutorial back to back). Keyed by course code.
 * Times are local (Asia/Jerusalem). weekday: 0 = Sunday.
 */
export const SESSION_OVERRIDES: Record<string, { weekday: number; start: string; end: string; label: string }[]> = {
  '879340003': [
    { weekday: 5, start: '07:30', end: '09:00', label: 'הרצאה' },
    { weekday: 5, start: '09:10', end: '10:00', label: 'תרגיל' },
  ],
};

export const HEB_DAY_TO_INDEX: Record<string, number> = { א: 0, ב: 1, ג: 2, ד: 3, ה: 4, ו: 5, ש: 6 };
