import { notFound } from 'next/navigation';
import { Icon, Tile } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { DAY_NAME, dm, localParts } from '@/lib/dates';
import { DONE, dueDate, lessonOnDate, sessionsBetween } from '@/lib/schedule';
import { SEMESTER } from '@/lib/config';
import type { Item } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STEP_MARK: Record<string, React.ReactNode> = {
  done: <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 13, background: '#14A36A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} stroke={2.8} /></span>,
  next: <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 13, border: '2.5px solid #6B4DF0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 5, background: '#6B4DF0' }} /></span>,
  wait: <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 13, border: '2px dashed #E8721A', background: '#fff' }} />,
  todo: <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 13, border: '2px solid #C9C2EC', background: '#fff' }} />,
};

function stepState(s: Item, firstOpen: boolean) {
  if (DONE.has(s.status || '')) return 'done';
  if (s.status === 'ממתין') return 'wait';
  return firstOpen ? 'next' : 'todo';
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snap = await getSnapshot();
  const c = snap.courses.find((x) => x.id === id);
  if (!c) notFound();
  const today = localParts(new Date()).date;
  const mine = snap.items.filter((i) => i.courseId === c.id);
  const lessons = mine.filter((i) => i.type === 'שיעור').sort((a, b) => (b.lessonNumber ?? 0) - (a.lessonNumber ?? 0) || (b.date || '').localeCompare(a.date || ''));
  const parents = mine.filter((i) => i.type === 'מטלה');
  const exams = mine.filter((i) => i.type === 'מבחן');
  const updates = mine.filter((i) => i.type === 'הודעה').sort((a, b) => (b.date || b.updated).localeCompare(a.date || a.updated)).slice(0, 3);

  // Semester strip: real sessions (or numbered lessons for online courses)
  const sessions = sessionsBetween(snap, c.courseStart || SEMESTER.start, SEMESTER.end).filter((s) => s.courseId === c.id);
  const days = Array.from(new Set(sessions.map((s) => s.date)));
  const strip = days.length
    ? days.map((d, i) => {
        const cancelled = sessions.find((s) => s.date === d)?.cancelled;
        const l = lessonOnDate(snap.items, c.id, d);
        const st = cancelled ? 'off' : l ? (l.learning === 'נלמד' ? 'learned' : 'doc') : d < today ? 'miss' : 'fut';
        return { key: d, label: cancelled ? 'בוטל' : `שיעור ${i + 1}`, sub: dm(d), st, href: l ? `/items/${l.id}` : undefined };
      })
    : lessons.slice().reverse().map((l, i) => ({ key: l.id, label: `יחידה ${l.lessonNumber ?? i + 1}`, sub: l.learning === 'נלמד' ? 'נלמדה' : '', st: l.learning === 'נלמד' ? 'learned' : 'doc', href: `/items/${l.id}` }));
  const W = 66;
  const nowIdx = days.length ? days.filter((d) => d <= today).length : strip.length;
  const learnedCount = strip.filter((s) => s.st === 'learned').length;
  const docCount = strip.filter((s) => s.st === 'doc').length;
  const dot = (st: string) => ({
    learned: { width: 20, height: 20, borderRadius: 10, background: c.color, boxShadow: `0 0 0 4px ${c.color}38` },
    doc: { width: 20, height: 20, borderRadius: 10, border: `3.5px solid ${c.color}`, background: '#fff' },
    miss: { width: 20, height: 20, borderRadius: 10, border: '3.5px solid #E8721A', background: '#FFF4EA' },
    fut: { width: 14, height: 14, margin: '3px 0', borderRadius: 7, border: '2.5px solid #C9C2EC', background: '#fff' },
    off: { width: 16, height: 16, margin: '2px 0', borderRadius: 4, transform: 'rotate(45deg)', border: '2px dashed #D9B84A', background: '#FFFBEA' },
  } as Record<string, React.CSSProperties>)[st];

  const learnedNotes = lessons.filter((l) => l.intro).slice(0, 5);

  return (
    <Shell active="courses">
      <SubHero back="/courses" title={c.name} kicker={<bdi dir="ltr">{c.code}</bdi>} icon={c.icon}
        chips={<>
          {c.format && <span className="chip white">{c.format}</span>}
          {c.weekday != null && c.start && <span className="chip white">{DAY_NAME[c.weekday]} <bdi dir="ltr">{c.start}–{c.end}</bdi></span>}
          {c.lecturer && <span className="chip white">{c.lecturer}</span>}
          {(c.examWeight || c.workWeight) && <span className="chip white">{c.examWeight ? <>מבחן <bdi>{c.examWeight}%</bdi></> : null}{c.examWeight && c.workWeight ? ' · ' : ''}{c.workWeight ? <>עבודה <bdi>{c.workWeight}%</bdi></> : null}</span>}
          {c.lemidaUrl && <a className="chip white" href={c.lemidaUrl} target="_blank" rel="noreferrer">למדה ↗</a>}
        </>} />
      <div className="content">
        {updates.length > 0 && (
          <section className="card" aria-label="עדכונים חשובים">
            <div className="card-head"><h2>עדכונים חשובים</h2></div>
            {updates.map((u) => (
              <a key={u.id} href={`/items/${u.id}`} className="row" style={{ alignItems: 'flex-start' }}>
                <Tile icon="announce" color="#B08A10" size={36} />
                <div className="col"><span className="t14 b8">{u.title}</span><span className="t12 muted">{u.date ? dm(u.date) : ''}{u.intro ? ' · ' + u.intro.slice(0, 90) : ''}</span></div>
              </a>
            ))}
          </section>
        )}

        <section className="card" aria-label="מפת הסמסטר">
          <div className="card-head"><div className="col"><h2>מפת הסמסטר</h2><span className="sub">נלמדו {learnedCount} · תועדו {docCount} · {strip.length} בסך הכול</span></div><span className="t12 muted row" style={{ gap: 4 }}><Icon name="swipe" size={14} />גלילה</span></div>
          <div className="strip-scroll">
            <div style={{ position: 'relative', width: strip.length * W + 36, height: 64, margin: '0 18px' }}>
              <span style={{ position: 'absolute', top: 8, right: W / 2, width: Math.max(0, (strip.length - 1) * W), height: 4, borderRadius: 2, background: 'rgba(120,105,210,0.18)' }} />
              <span style={{ position: 'absolute', top: 8, right: W / 2, width: Math.max(0, (nowIdx - 1) * W), height: 4, borderRadius: 2, background: `linear-gradient(270deg, #5EEAD4, ${c.color})` }} />
              {days.length > 0 && nowIdx < strip.length && <span aria-label="עכשיו" style={{ position: 'absolute', top: -2, right: nowIdx * W - 2, width: 3, height: 24, borderRadius: 2, background: '#E23A5E' }} />}
              {strip.map((s, i) => (
                <a key={s.key} href={s.href || '#'} style={{ position: 'absolute', top: 0, right: i * W, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <span style={{ boxSizing: 'border-box', ...dot(s.st) }} />
                  <span style={{ fontSize: 12, fontWeight: s.st === 'fut' ? 600 : 800, color: s.st === 'miss' ? '#8F3E00' : s.st === 'fut' ? 'var(--muted)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.sub}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <nav className="pills" aria-label="אזורים בקורס" style={{ padding: 4, borderRadius: 999, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.9)' }}>
          <a href="#learned" aria-current="true">סקירה</a>
          <a href="#lessons">שיעורים</a>
          <a href="#tasks">מטלות</a>
          <a href="#exams">מבחנים</a>
        </nav>

        <section id="learned" className="card" aria-label="מה למדנו עד עכשיו">
          <div className="card-head"><h2>מה למדנו עד עכשיו</h2><span className="chip green"><Icon name="sync" size={12} color="#0B7A4B" />מנושן</span></div>
          {learnedNotes.length ? learnedNotes.map((l) => (
            <a key={l.id} href={`/items/${l.id}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, marginTop: 2, minWidth: 26, height: 22, padding: '0 6px', borderRadius: 8, background: `color-mix(in srgb, ${c.color} 12%, transparent)`, color: c.color, fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.lessonNumber ?? '•'}</span>
              <div className="col"><span className="t14 b8">{l.title.replace(/^(שיעור|יחידה)\s*\d+\s*—\s*/, '').split('|')[0]}</span><span className="t13" style={{ color: 'var(--muted2)', lineHeight: 1.45 }}>{l.intro}</span></div>
            </a>
          )) : <span className="t14 muted">עוד אין תוכן מתועד מהשיעורים.</span>}
        </section>

        <div id="tasks" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parents.map((p) => {
            const steps = mine.filter((s) => s.type === 'שלב' && s.parentId === p.id);
            const firstOpen = steps.find((s) => !DONE.has(s.status || '') && s.status !== 'ממתין');
            const due = dueDate(p);
            return (
              <section key={p.id} className="card" aria-label={p.title}>
                <a href={`/items/${p.id}`} className="row">
                  <Tile icon="task" color={c.color} size={44} />
                  <div className="col"><span className="t12 b8" style={{ color: c.color }}>מטלה{p.weight ? ` · ${p.weight}%` : ''}</span><span className="b8" style={{ fontSize: 17 }}>{p.title}</span></div>
                  <span className={`chip ${DONE.has(p.status || '') ? 'green' : 'violet'}`}>{p.status || 'פתוח'}</span>
                </a>
                {(due || p.grade != null) && <span className="t13" style={{ color: 'var(--muted2)' }}>{due ? `מועד: ${dm(due)}${p.computedDue && !p.date ? ' · מחושב' : ''}` : ''}{p.grade != null ? ` · ציון ${p.grade}` : ''}</span>}
                {steps.length > 0 && (
                  <div className="steps">
                    {steps.map((s) => {
                      const st = stepState(s, s === firstOpen);
                      return (
                        <a key={s.id} href={`/items/${s.id}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                          {STEP_MARK[st]}
                          <div className="col" style={{ paddingTop: 2 }}>
                            <span className="t14" style={{ fontWeight: st === 'next' ? 800 : 600, textDecoration: st === 'done' ? 'line-through' : undefined, color: st === 'done' ? 'var(--muted)' : undefined }}>{s.title}</span>
                            {st === 'next' && <span><span className="chip violet">הצעד הבא</span></span>}
                            {st === 'wait' && <span><span className="chip orange">ממתין</span></span>}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
                <a href={`/add?type=שלב&course=${c.id}&parent=${p.id}`} className="t13 b8" style={{ color: '#5B3FF0' }}>+ מטלת בת</a>
              </section>
            );
          })}
        </div>

        <section id="lessons" className="card" aria-label="שיעורים">
          <div className="card-head"><div className="col"><h2>שיעורים</h2><span className="sub">{lessons.length} מתועדים</span></div>
            <a href={`/add?type=שיעור&course=${c.id}`} className="btn ghost" style={{ color: '#5B3FF0' }}><Icon name="plus" size={15} stroke={2.4} />שיעור</a></div>
          {lessons.map((l, i) => (
            <div key={l.id}>
              {i > 0 && <div className="divider" style={{ marginBottom: 12 }} />}
              <a href={`/items/${l.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="row">
                  <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 10, background: `color-mix(in srgb, ${c.color} 12%, transparent)`, color: c.color, fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.lessonNumber ?? '•'}</span>
                  <div className="col"><span className="t14 b8 ellipsis">{l.title.replace(/^(שיעור|יחידה)\s*\d+\s*—\s*/, '').split('|')[0]}</span><span className="t12 muted">{l.date ? dm(l.date) : 'חסר תאריך'}</span></div>
                  <Icon name="chev-l" size={18} color="var(--muted)" />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingRight: 42 }}>
                  <span className={`chip ${l.attendance === 'נכח' || l.attendance === 'צפה בהקלטה' ? 'green' : l.attendance === 'נעדר' ? 'red' : 'gray'}`}>נוכחות: {l.attendance || 'לא ידוע'}</span>
                  <span className={`chip ${l.learning === 'נלמד' ? 'green' : 'gray'}`}>למידה: {l.learning || 'לא ידוע'}</span>
                  <span className={`chip ${l.status === 'סוכם' ? 'green' : l.status === 'ממתין לאישור' ? 'violet' : 'gray'}`}>{l.status || 'ללא סטטוס'}</span>
                </div>
              </a>
            </div>
          ))}
        </section>

        <div id="exams" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {exams.map((x) => {
            const d = dueDate(x);
            return (
              <section key={x.id} className="card" aria-label={x.title}>
                <a href={`/items/${x.id}`} className="row">
                  <Tile icon="exam" color="#E23A5E" size={44} />
                  <div className="col"><span className="t12 b8" style={{ color: '#B0193F' }}>מבחן{x.weight ? ` · ${x.weight}%` : ''}</span><span className="b8" style={{ fontSize: 17 }}>{x.examSitting ? `מועד ${x.examSitting}׳` : x.title}{d ? ` · ${dm(d)}${x.time ? ', ' + x.time : ''}` : ''}</span></div>
                </a>
                {x.verification === 'לא מאומת' && (
                  <div className="row" style={{ padding: '10px 12px', borderRadius: 16, background: 'rgba(232,114,26,0.1)' }}>
                    <Icon name="warn" size={18} color="#E8721A" />
                    <span className="t13 b7" style={{ flex: 1, color: '#8F3E00' }}>{d ? 'המועד עוד לא אומת במערכת הבחינות' : 'מועד לא ידוע'}</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
