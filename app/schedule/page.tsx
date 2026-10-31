import { Icon, Tile } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { addDays, DAY_NAME, dm, localParts, semesterWeek, weekday } from '@/lib/dates';
import { SEMESTER } from '@/lib/config';
import { eventsBetween, lessonOnDate } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export default async function Schedule({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const { w } = await searchParams;
  const off = Number(w) || 0;
  const snap = await getSnapshot();
  const { date: today } = localParts(new Date());
  const start = addDays(today, -weekday(today) + off * 7); // Sunday
  const end = addDays(start, 6);
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const ev = eventsBetween(snap, start, end);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const online = snap.courses.filter((c) => c.format === 'מתוקשב');

  return (
    <Shell active="schedule">
      <SubHero back={null} title="לו״ז" kicker={<>שבוע {semesterWeek(start, SEMESTER.start)} · <bdi dir="ltr">{dm(start)} – {dm(end)}</bdi></>}
        actions={<>
          <a href={`/schedule?w=${off - 1}`} className="hero-key" aria-label="השבוע הקודם"><Icon name="chev-r" size={20} color="#fff" stroke={2.4} /></a>
          {off !== 0 && <a href="/schedule" className="hero-key" aria-label="השבוע הנוכחי" style={{ width: 'auto', padding: '0 12px', fontSize: 13, fontWeight: 800 }}>היום</a>}
          <a href={`/schedule?w=${off + 1}`} className="hero-key" aria-label="השבוע הבא"><Icon name="chev-l" size={20} color="#fff" stroke={2.4} /></a>
        </>} />
      <div className="content">
        {days.map((d) => {
          const list = ev.filter((e) => e.date === d);
          if (!list.length) return null;
          return (
            <section key={d} style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-label={d}>
              <div className="card-head" style={{ padding: '6px 4px 0' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800 }}>{DAY_NAME[weekday(d)]} {dm(d)}</h3>
                {d === today && <span className="chip violet">היום</span>}
              </div>
              {list.map((e) => {
                const c = e.courseId ? course.get(e.courseId) : undefined;
                const col = c?.color || '#5B3FF0';
                const lesson = e.kind === 'session' && e.courseId ? lessonOnDate(snap.items, e.courseId, e.date) : undefined;
                const past = d < today;
                const href = e.itemId ? `/items/${e.itemId}` : lesson ? `/items/${lesson.id}` : c ? `/courses/${c.id}` : '#';
                const isDue = e.kind !== 'session';
                return (
                  <a key={e.key} href={href} className="card" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 14px', borderRadius: 22, opacity: e.cancelled ? 0.55 : 1,
                    ...(isDue ? { background: 'linear-gradient(155deg, rgba(255,247,238,0.95), rgba(255,236,220,0.75))', border: '1px solid rgba(232,114,26,0.35)' } : {}) }}>
                    <div style={{ width: 48, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                      <span className="t15 b8">{e.time || (e.kind === 'exam' ? 'מבחן' : 'מועד')}</span>
                    </div>
                    <Tile icon={isDue ? (e.kind === 'exam' ? 'exam' : e.kind === 'event' ? 'zoom' : 'deadline') : c?.icon || 'lesson'} color={isDue ? '#E8721A' : col} size={40} />
                    <div className="col">
                      <span className="t15 b8" style={{ textDecoration: e.cancelled ? 'line-through' : undefined }}>{isDue ? e.label : c?.name + (e.label.includes('·') ? ' · ' + e.label.split('·')[1].trim() : '')}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {isDue && c && <span className="chip gray">{c.short}</span>}
                        {!isDue && c?.format && <span className="chip blue">{c.format}</span>}
                        {!isDue && c?.location && c.format !== 'זום' && <span className="chip gray">{c.location}</span>}
                        {e.cancelled && <span className="chip red">בוטל</span>}
                        {!isDue && !e.cancelled && past && (lesson ? <span className="chip green">תועד</span> : <span className="chip red">אין תיעוד</span>)}
                      </div>
                    </div>
                  </a>
                );
              })}
            </section>
          );
        })}
        {ev.length === 0 && <div className="card"><span className="t14 muted">אין מפגשים או מועדים בשבוע הזה.</span></div>}
        <section className="card" aria-label="מתוקשבים">
          <div className="card-head"><div className="col"><h2>מתוקשבים</h2><span className="sub">בלי שעה קבועה</span></div></div>
          {online.map((c) => (
            <a key={c.id} href={`/courses/${c.id}`} className="row"><Tile icon={c.icon} color={c.color} size={36} /><span className="t14 b8" style={{ flex: 1 }}>{c.short}</span><Icon name="chev-l" size={16} color="var(--muted)" /></a>
          ))}
        </section>
      </div>
    </Shell>
  );
}
