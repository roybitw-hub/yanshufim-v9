import { Tile } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { dm } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function Inbox() {
  const snap = await getSnapshot();
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const approve = snap.items.filter((i) => i.status === 'ממתין לאישור');
  const notices = snap.items.filter((i) => i.type === 'הודעה').sort((a, b) => (b.date || b.updated).localeCompare(a.date || a.updated));
  const row = (i: (typeof notices)[number], icon: string, color: string) => {
    const c = i.courseId ? course.get(i.courseId) : undefined;
    return (
      <a key={i.id} href={`/items/${i.id}`} className="row" style={{ alignItems: 'flex-start' }}>
        <Tile icon={icon} color={color} size={38} />
        <div className="col"><span className="t12 muted">{c?.short ?? 'כללי'}{i.date ? ' · ' + dm(i.date) : ''}</span><span className="t14 b8">{i.title}</span></div>
        {i.status && <span className={`chip ${i.status === 'דורשת פעולה' ? 'orange' : i.status === 'ממתין לאישור' ? 'violet' : 'gray'}`}>{i.status}</span>}
      </a>
    );
  };
  return (
    <Shell active="inbox">
      <SubHero back="/" title="תיבה" kicker={`${approve.length} ממתינים לאישור · ${notices.length} הודעות`} />
      <div className="content">
        <section className="card" aria-label="ממתינים לאישור">
          <div className="card-head"><h2>ממתינים לאישור</h2></div>
          {approve.length ? approve.map((i) => row(i, i.type === 'שיעור' ? 'lesson' : 'summary', '#0F9E8E')) : <span className="t14 muted">אין מה לאשר.</span>}
        </section>
        <section className="card" aria-label="הודעות">
          <div className="card-head"><h2>הודעות</h2></div>
          {notices.map((i) => row(i, /ציון/.test(i.title) ? 'grade' : /ביטול/.test(i.title) ? 'cal-x' : /הקלט/.test(i.title) ? 'record' : 'announce', /ציון/.test(i.title) ? '#14A36A' : /ביטול/.test(i.title) ? '#E23A5E' : '#B08A10'))}
        </section>
      </div>
    </Shell>
  );
}
