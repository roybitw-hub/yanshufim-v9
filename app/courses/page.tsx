import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { Tile } from '@/components/Icon';
import { getSnapshot } from '@/lib/data';
import { courseProgress } from '@/lib/feed';
import { DAY_NAME } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function Courses() {
  const snap = await getSnapshot();
  const list = snap.courses.map((c) => ({ c, p: courseProgress(c, snap.items) }));
  const live = list.filter((x) => x.c.format !== 'מתוקשב');
  const online = list.filter((x) => x.c.format === 'מתוקשב');
  const card = ({ c, p }: (typeof list)[number]) => (
    <a key={c.id} href={`/courses/${c.id}`} className="card" style={{ gap: 10 }}>
      <div className="row">
        <Tile icon={c.icon} color={c.color} size={46} />
        <div className="col">
          <span className="t15 b8">{c.name}</span>
          <span className="t12 muted">{[c.lecturer, c.weekday != null && c.start ? `${DAY_NAME[c.weekday]} ${c.start}` : c.format].filter(Boolean).join(' · ')}</span>
        </div>
        {p.open > 0 && <span className="chip red">{p.open} פתוחים</span>}
      </div>
      <div className="bar"><span style={{ width: `${Math.max(p.pct, 3)}%`, background: c.color }} /></div>
      <span className="t12 b7" style={{ color: 'var(--muted2)' }}>{p.total ? `${p.learned}/${p.total} נלמדו` : p.learned ? `${p.learned} ${p.unitLabel} נלמדו` : 'אין תיעוד עדיין'}</span>
    </a>
  );
  return (
    <Shell active="courses">
      <SubHero title="הקורסים שלי" kicker={`סמסטר א׳ · ${snap.courses.length} קורסים`} />
      <div className="content">
        <h2 style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>מפגשים קבועים</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>{live.map(card)}</div>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>מתוקשבים</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>{online.map(card)}</div>
      </div>
    </Shell>
  );
}
