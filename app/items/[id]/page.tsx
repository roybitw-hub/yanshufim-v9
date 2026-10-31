import { notFound } from 'next/navigation';
import { Icon, Tile } from '@/components/Icon';
import { ItemControls, type Group } from '@/components/ItemControls';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { dm } from '@/lib/dates';
import { DONE, dueDate } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

const TYPE_ICON: Record<string, string> = { 'שיעור': 'lesson', 'מטלה': 'task', 'שלב': 'task', 'מבחן': 'exam', 'סיכום': 'summary', 'הודעה': 'announce', 'אירוע': 'zoom', 'חומר': 'folder' };

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snap = await getSnapshot();
  const it = snap.items.find((x) => x.id === id);
  if (!it) notFound();
  const c = snap.courses.find((x) => x.id === it.courseId);
  const parent = it.parentId ? snap.items.find((x) => x.id === it.parentId) : undefined;
  const steps = snap.items.filter((x) => x.parentId === it.id);
  const due = dueDate(it);

  const groups: Group[] = [];
  if (it.type === 'שיעור') {
    groups.push(
      { field: 'attendance', label: 'נוכחות', hint: 'דיווח שלך בלבד', icon: 'attend', value: it.attendance || 'לא ידוע',
        options: [{ value: 'נכח', label: 'נכחתי' }, { value: 'נעדר', label: 'נעדרתי' }, { value: 'צפה בהקלטה', label: 'הקלטה' }, { value: 'לא ידוע', label: 'לא ידוע' }] },
      { field: 'learning', label: 'למידה', hint: 'נפרד מנוכחות', icon: 'lesson', value: it.learning || 'לא ידוע',
        options: [{ value: 'לא נלמד', label: 'לא נלמד' }, { value: 'נלמד', label: 'נלמד' }, { value: 'לא ידוע', label: 'לא ידוע' }] },
    );
  } else if (it.type === 'מטלה' || it.type === 'שלב') {
    groups.push({ field: 'status', label: 'מצב', hint: 'מתעדכן גם בקורס ובבית', icon: 'task', value: it.status,
      options: [{ value: 'פתוח', label: 'פתוח' }, { value: 'בתהליך', label: 'בתהליך' }, { value: 'הוגש', label: 'הוגש' }, { value: 'הושלם', label: 'הושלם' }] });
  }

  const links = [
    it.recordingUrl && { href: it.recordingUrl, label: 'הקלטה', icon: 'record' },
    it.docUrl && { href: it.docUrl, label: 'מסמך', icon: 'summary' },
    it.sourceUrl && { href: it.sourceUrl, label: 'מקור', icon: 'link' },
    c?.lemidaUrl && { href: c.lemidaUrl, label: 'למדה', icon: 'courses' },
    { href: `https://www.notion.so/${it.id.replace(/-/g, '')}`, label: 'פתח בנושן', icon: 'link' },
  ].filter(Boolean) as { href: string; label: string; icon: string }[];

  return (
    <Shell active="courses">
      <SubHero back={c ? `/courses/${c.id}` : '/'} title={it.title.split('|')[0].trim()} kicker={`${it.type ?? 'פריט'}${c ? ' · ' + c.short : ''}`}
        icon={TYPE_ICON[it.type || ''] || 'book'}
        chips={<>
          {due && <span className="chip white">{dm(due)}{it.time ? ' · ' + it.time : ''}{it.computedDue && !it.date ? ' · מחושב' : ''}</span>}
          {it.status && <span className="chip white">{it.status}</span>}
          {it.weight != null && <span className="chip white">{it.weight}% מהציון</span>}
          {it.grade != null && <span className="chip white">ציון {it.grade}</span>}
          {it.verification === 'לא מאומת' && <span className="chip white">לא מאומת</span>}
        </>} />
      <div className="content">
        {(it.intro || it.action) && (
          <section className="card">
            {it.intro && <p className="t15" style={{ lineHeight: 1.6 }}>{it.intro}</p>}
            {it.action && (
              <div className="row" style={{ padding: '10px 12px', borderRadius: 16, background: 'rgba(110,77,255,0.08)', alignItems: 'flex-start' }}>
                <Icon name="flag" size={18} color="#5B3FF0" />
                <span className="t14 b7" style={{ flex: 1, color: '#4325C8' }}>{it.action}</span>
              </div>
            )}
            {it.needsCheck && <span className="chip orange" style={{ alignSelf: 'flex-start' }}><Icon name="warn" size={12} color="#8F3E00" />דורש בירור</span>}
          </section>
        )}

        {groups.length > 0 && <ItemControls itemId={it.id} groups={groups} />}

        {parent && (
          <a href={`/items/${parent.id}`} className="card" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Tile icon="task" color={c?.color || '#5B3FF0'} size={38} />
            <div className="col"><span className="t12 muted">חלק ממטלה</span><span className="t14 b8">{parent.title}</span></div>
            <Icon name="chev-l" size={18} color="var(--muted)" />
          </a>
        )}

        {steps.length > 0 && (
          <section className="card">
            <div className="card-head"><h2>שלבים</h2><a href={`/add?type=שלב&course=${it.courseId}&parent=${it.id}`} className="t13 b8" style={{ color: '#5B3FF0' }}>+ שלב</a></div>
            {steps.map((s) => (
              <a key={s.id} href={`/items/${s.id}`} className="row">
                <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: DONE.has(s.status || '') ? '#14A36A' : '#fff', border: DONE.has(s.status || '') ? 'none' : '2px solid #C9C2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {DONE.has(s.status || '') && <Icon name="check" size={13} stroke={3} />}
                </span>
                <span className="t14 b7" style={{ flex: 1 }}>{s.title}</span>
                <span className="chip gray">{s.status || 'פתוח'}</span>
              </a>
            ))}
          </section>
        )}

        <section className="card">
          <div className="card-head"><h2>קישורים</h2></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn ghost"><Icon name={l.icon} size={16} />{l.label}</a>)}
          </div>
        </section>
        <span className="t12 muted" style={{ textAlign: 'center' }}>עודכן {dm(it.updated.slice(0, 10))} · {snap.source === 'notion' ? 'מנושן' : 'נתוני דמו'}</span>
      </div>
    </Shell>
  );
}
