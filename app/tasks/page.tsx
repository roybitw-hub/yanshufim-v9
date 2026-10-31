import { Tile } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { diffDays, dm, inDays, localParts } from '@/lib/dates';
import { DONE, dueDate } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export default async function Tasks() {
  const snap = await getSnapshot();
  const today = localParts(new Date()).date;
  const tasks = snap.items.filter((i) => i.type === 'מטלה' || i.type === 'שלב' || i.type === 'מבחן');
  const open = tasks.filter((t) => !DONE.has(t.status || ''));
  const done = tasks.filter((t) => DONE.has(t.status || ''));
  const byCourse = snap.courses.map((c) => ({ c, list: open.filter((t) => t.courseId === c.id).sort((a, b) => (dueDate(a) || '9').localeCompare(dueDate(b) || '9')) })).filter((x) => x.list.length);
  return (
    <Shell active="tasks">
      <SubHero back="/" title="משימות" kicker={`${open.length} פתוחות · ${done.length} הושלמו`} />
      <div className="content">
        {byCourse.map(({ c, list }) => (
          <section key={c.id} className="card" aria-label={c.short}>
            <div className="row"><Tile icon={c.icon} color={c.color} size={36} /><h2 style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>{c.short}</h2><a href={`/add?course=${c.id}`} className="t13 b8" style={{ color: '#5B3FF0' }}>+ הוספה</a></div>
            {list.map((t) => {
              const d = dueDate(t);
              const n = d ? diffDays(today, d) : null;
              return (
                <a key={t.id} href={`/items/${t.id}`} className="row" style={{ paddingRight: t.type === 'שלב' ? 18 : 0 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 10, flexShrink: 0, border: `2px solid ${t.type === 'מבחן' ? '#E23A5E' : '#C9C2EC'}`, background: '#fff' }} />
                  <div className="col"><span className="t14 b7">{t.title}</span><span className="t12 muted">{t.type}{t.weight ? ` · ${t.weight}%` : ''}{t.status ? ` · ${t.status}` : ''}</span></div>
                  {d && <span className={`chip ${n != null && n < 0 ? 'red' : n != null && n <= 7 ? 'orange' : 'gray'}`}>{n != null && Math.abs(n) <= 14 ? inDays(n) : dm(d)}</span>}
                </a>
              );
            })}
          </section>
        ))}
      </div>
    </Shell>
  );
}
