import 'server-only';

/**
 * Minimal Notion REST client (no SDK), server-only.
 * - Uses the data-sources API (Notion-Version 2025-09-03).
 * - A small queue keeps us under ~3 requests/second and retries 429/5xx.
 */

const API = 'https://api.notion.com/v1';
const VERSION = '2025-09-03';
const MIN_GAP_MS = 350;

let chain: Promise<unknown> = Promise.resolve();
let last = 0;

function token(): string {
  const t = process.env.NOTION_TOKEN;
  if (!t) throw new Error('NOTION_TOKEN is not set');
  return t;
}

export function hasNotion(): boolean {
  return !!process.env.NOTION_TOKEN;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function raw<T>(method: string, path: string, body?: unknown, attempt = 0): Promise<T> {
  const wait = Math.max(0, last + MIN_GAP_MS - Date.now());
  if (wait) await sleep(wait);
  last = Date.now();
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const ra = Number(res.headers.get('retry-after'));
    await sleep(ra > 0 ? ra * 1000 : 600 * 2 ** attempt);
    return raw<T>(method, path, body, attempt + 1);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Notion ${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Serialises calls so concurrent server work still respects the rate limit. */
export function notion<T>(method: string, path: string, body?: unknown): Promise<T> {
  const p = chain.then(() => raw<T>(method, path, body));
  chain = p.catch(() => undefined);
  return p;
}

export interface NotionPage {
  id: string;
  last_edited_time: string;
  archived?: boolean;
  in_trash?: boolean;
  properties: Record<string, NotionProp>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotionProp = { type: string } & Record<string, any>;

export async function queryAll(dataSourceId: string, body: Record<string, unknown> = {}): Promise<NotionPage[]> {
  const out: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>(
      'POST', `/data_sources/${dataSourceId}/query`, { page_size: 100, ...body, ...(cursor ? { start_cursor: cursor } : {}) },
    );
    out.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return out.filter((p) => !p.archived && !p.in_trash);
}

export function updatePage(pageId: string, properties: Record<string, unknown>) {
  return notion<NotionPage>('PATCH', `/pages/${pageId}`, { properties });
}

export function createPage(dataSourceId: string, properties: Record<string, unknown>) {
  return notion<NotionPage>('POST', '/pages', { parent: { type: 'data_source_id', data_source_id: dataSourceId }, properties });
}

export { read, write } from './props';
