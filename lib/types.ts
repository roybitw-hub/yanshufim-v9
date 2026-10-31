export type ItemType = 'שיעור' | 'מטלה' | 'שלב' | 'מבחן' | 'חומר' | 'סיכום' | 'הודעה' | 'אירוע';

export interface Course {
  id: string;
  name: string;
  code: string; // 9-digit
  short: string;
  icon: string;
  color: string;
  lecturer: string | null;
  format: string | null;
  weekday: number | null; // 0 = Sunday
  start: string | null; // HH:MM
  end: string | null;
  location: string | null;
  totalLessons: number | null;
  examWeight: number | null;
  workWeight: number | null;
  passGrade: number | null;
  attendancePolicy: string | null;
  courseStart: string | null; // YYYY-MM-DD
  courseEnd: string | null;
  lemidaUrl: string | null;
  updated: string;
}

export interface Item {
  id: string;
  title: string;
  type: ItemType | null;
  status: string | null;
  courseId: string | null;
  parentId: string | null;
  /** Local date YYYY-MM-DD */
  date: string | null;
  /** Local time HH:MM if the date had a time */
  time: string | null;
  computedDue: string | null;
  lessonNumber: number | null;
  attendance: string | null; // לא ידוע | נכח | נעדר | צפה בהקלטה
  learning: string | null; // לא ידוע | לא נלמד | נלמד
  recording: string | null; // זמינה | לא ידוע | לא פורסמה
  recordingUrl: string | null;
  pinned: boolean;
  weight: number | null;
  grade: number | null;
  verification: string | null;
  needsCheck: boolean;
  intro: string | null;
  action: string | null;
  examSitting: string | null;
  exceptionType: string | null; // שינוי שעה | ביטול | השלמה
  affectedDate: string | null;
  docUrl: string | null;
  sourceUrl: string | null;
  updated: string;
}

export interface FeedStateRow {
  pageId: string;
  key: string;
  read: boolean;
  pinned: boolean;
  snoozedUntil: string | null;
  version: string | null;
}

export interface Snapshot {
  courses: Course[];
  items: Item[];
  feed: FeedStateRow[];
  fetchedAt: string;
  source: 'notion' | 'demo';
}

export interface Session {
  key: string;
  courseId: string;
  date: string;
  start: string;
  end: string;
  label: string;
  cancelled: boolean;
}

export interface CalEvent {
  key: string;
  courseId: string | null;
  itemId: string | null;
  date: string;
  time: string | null;
  label: string;
  kind: 'session' | 'due' | 'exam' | 'event';
  cancelled?: boolean;
}

export type Tone = 'violet' | 'orange' | 'red' | 'blue' | 'green' | 'gray';

export interface Signal {
  key: string;
  kind: string; // matches the feed DB "סוג אות" options
  category: 'due' | 'lessons' | 'approve' | 'info';
  courseId: string | null;
  itemId: string | null;
  title: string;
  meta: string;
  tag: string;
  tone: Tone;
  priority: number;
  version: string;
  actions?: { label: string; action: string }[];
}
