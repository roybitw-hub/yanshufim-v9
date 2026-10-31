// Notion property readers / writers (shared, no server-only imports).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotionProp = { type: string } & Record<string, any>;

/* ---------- property readers ---------- */

export const read = {
  text(p?: NotionProp): string | null {
    if (!p) return null;
    const arr = p.type === 'title' ? p.title : p.type === 'rich_text' ? p.rich_text : null;
    if (!arr) return null;
    const s = (arr as { plain_text: string }[]).map((x) => x.plain_text).join('').trim();
    return s || null;
  },
  select(p?: NotionProp): string | null {
    if (!p) return null;
    if (p.type === 'select') return p.select?.name ?? null;
    if (p.type === 'status') return p.status?.name ?? null;
    return null;
  },
  number(p?: NotionProp): number | null {
    return p?.type === 'number' && typeof p.number === 'number' ? p.number : null;
  },
  checkbox(p?: NotionProp): boolean {
    return p?.type === 'checkbox' ? !!p.checkbox : false;
  },
  date(p?: NotionProp): string | null {
    return p?.type === 'date' ? p.date?.start ?? null : null;
  },
  url(p?: NotionProp): string | null {
    return p?.type === 'url' ? p.url ?? null : null;
  },
  relation(p?: NotionProp): string[] {
    return p?.type === 'relation' ? (p.relation as { id: string }[]).map((r) => r.id) : [];
  },
};

/* ---------- property writers ---------- */

export const write = {
  title: (s: string) => ({ title: [{ text: { content: s } }] }),
  text: (s: string) => ({ rich_text: s ? [{ text: { content: s } }] : [] }),
  select: (name: string | null) => ({ select: name ? { name } : null }),
  checkbox: (v: boolean) => ({ checkbox: v }),
  number: (n: number | null) => ({ number: n }),
  date: (start: string | null) => ({ date: start ? { start } : null }),
  relation: (ids: string[]) => ({ relation: ids.map((id) => ({ id })) }),
};
