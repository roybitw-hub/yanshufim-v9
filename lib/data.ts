import 'server-only';
import { DS } from './config';
import { demoSnapshot } from './demo';
import { courseFromPage, feedFromPage, itemFromPage } from './mappers';
import { createPage, hasNotion, queryAll, updatePage, write } from './notion';
import type { FeedStateRow, Item, Snapshot } from './types';

/**
 * Reads everything the app needs in three paginated queries and keeps it
 * in memory for a short time. Writes invalidate the cache immediately.
 */
const TTL_MS = 45_000;
let cached: { at: number; snap: Snapshot } | null = null;
let inflight: Promise<Snapshot> | null = null;

export function invalidate() {
  cached = null;
}

export async function getSnapshot(): Promise<Snapshot> {
  if (!hasNotion()) return demoSnapshot();
  if (cached && Date.now() - cached.at < TTL_MS) return cached.snap;
  if (inflight) return inflight;
  inflight = (async () => {
    const [cp, ip, fp] = [
      await queryAll(DS.courses),
      await queryAll(DS.items, { filter: { property: 'לא פעיל', checkbox: { equals: false } } }),
      await queryAll(DS.feed).catch(() => []),
    ];
    const snap: Snapshot = {
      courses: cp.map((p, i) => courseFromPage(p, i)),
      items: ip.map(itemFromPage).filter((x): x is Item => !!x),
      feed: fp.map(feedFromPage).filter((f) => f.key),
      fetchedAt: new Date().toISOString(),
      source: 'notion',
    };
    cached = { at: Date.now(), snap };
    return snap;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/* ---------------- writes ---------------- */

const APP = write.select('אפליקציה');

export async function setFeedState(
  key: string,
  patch: Partial<Pick<FeedStateRow, 'read' | 'pinned' | 'snoozedUntil'>>,
  meta: { kind?: string; courseId?: string | null; itemId?: string | null; version?: string },
) {
  if (!hasNotion()) return;
  const snap = await getSnapshot();
  const row = snap.feed.find((f) => f.key === key);
  const props: Record<string, unknown> = {};
  if (patch.read !== undefined) props['נקרא'] = write.checkbox(patch.read);
  if (patch.pinned !== undefined) props['חשוב'] = write.checkbox(patch.pinned);
  if (patch.snoozedUntil !== undefined) props['נדחה עד'] = write.date(patch.snoozedUntil);
  if (meta.version) props['גרסת נתון'] = write.text(meta.version);
  if (row) {
    await updatePage(row.pageId, props);
  } else {
    await createPage(DS.feed, {
      'מפתח אות': write.title(key),
      ...(meta.kind ? { 'סוג אות': write.select(meta.kind) } : {}),
      ...(meta.courseId ? { 'קורס': write.relation([meta.courseId]) } : {}),
      ...(meta.itemId ? { 'פריט': write.relation([meta.itemId]) } : {}),
      ...props,
    });
  }
  invalidate();
}

const ATTENDANCE = ['לא ידוע', 'נכח', 'נעדר', 'צפה בהקלטה'];
const LEARNING = ['לא ידוע', 'לא נלמד', 'נלמד'];
const STATUS = ['פתוח', 'בתהליך', 'ממתין', 'הושלם', 'הוגש'];

export async function updateItem(itemId: string, patch: { attendance?: string; learning?: string; status?: string; pinned?: boolean }) {
  if (!hasNotion()) return;
  const props: Record<string, unknown> = { 'כותב': APP };
  if (patch.attendance && ATTENDANCE.includes(patch.attendance)) props['נוכחות'] = write.select(patch.attendance);
  if (patch.learning && LEARNING.includes(patch.learning)) props['למידה'] = write.select(patch.learning);
  if (patch.status && STATUS.includes(patch.status)) props['סטטוס'] = write.select(patch.status);
  if (patch.pinned !== undefined) props['נעוץ'] = write.checkbox(patch.pinned);
  await updatePage(itemId, props);
  invalidate();
}

export async function createItem(input: {
  type: 'מטלה' | 'שלב' | 'מבחן' | 'שיעור' | 'אירוע';
  title: string;
  courseId: string;
  date?: string | null;
  parentId?: string | null;
  lessonNumber?: number | null;
}) {
  if (!hasNotion()) return null;
  const page = await createPage(DS.items, {
    'שם': write.title(input.title),
    'מזהה': write.text(`app:${crypto.randomUUID()}`),
    'סוג': write.select(input.type),
    'סטטוס': write.select('פתוח'),
    'קורס': write.relation([input.courseId]),
    'כותב': APP,
    ...(input.date ? { 'תאריך': write.date(input.date) } : {}),
    ...(input.parentId ? { 'אב': write.relation([input.parentId]) } : {}),
    ...(input.lessonNumber ? { 'מספר שיעור': write.number(input.lessonNumber) } : {}),
  });
  invalidate();
  return page.id;
}
