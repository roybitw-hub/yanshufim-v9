import { Icon, Tile } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';
import { dm, localParts } from '@/lib/dates';
import { DONE } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export default async function Status() {
  const snap = await getSnapshot();
  const course = new Map(snap.courses.map((c) => [c.id, c]));
  const checks = snap.items.filter((i) => i.needsCheck && !DONE.has(i.status || ''));
  const t = localParts(new Date(snap.fetchedAt));
  const missingTotals = snap.courses.filter((c) => c.format !== 'מתוקשב' && !c.totalLessons);
  return (
    <Shell active="none">
      <SubHero back="/" title="מצב המערכת" kicker={snap.source === 'notion' ? `מחובר לנושן · נקרא ב־${t.time}` : 'נתוני דמו · אין NOTION_TOKEN'} />
      <div className="content">
        <section className="card">
          <div className="row">
            <Tile icon="sync" color={snap.source === 'notion' ? '#14A36A' : '#E8721A'} size={40} />
            <div className="col"><span className="t15 b8">{snap.source === 'notion' ? 'סנכרון עם נושן פעיל' : 'מצב דמו'}</span>
              <span className="t12 muted">{snap.courses.length} קורסים · {snap.items.length} פריטים פעילים · {snap.feed.length} מצבי פיד</span></div>
            <a href="/status" className="btn ghost"><Icon name="sync" size={15} />רענון</a>
          </div>
          <span className="t12 muted">הנתונים נשמרים בזיכרון עד 45 שניות; כל שינוי מהאפליקציה נכתב מיד לנושן ומרענן.</span>
        </section>
        <section className="card" aria-label="בדיקת תקינות">
          <div className="card-head"><div className="col"><h2>בדיקת תקינות</h2><span className="sub">{checks.length} פריטים מסומנים ״דורש בירור״</span></div></div>
          {checks.map((i) => (
            <a key={i.id} href={`/items/${i.id}`} className="row">
              <Tile icon="warn" color="#E8721A" size={34} />
              <div className="col"><span className="t14 b7">{i.title}</span><span className="t12 muted">{course.get(i.courseId || '')?.short ?? ''}{i.date ? ' · ' + dm(i.date) : ''}</span></div>
            </a>
          ))}
          {missingTotals.length > 0 && (
            <div className="row" style={{ padding: '10px 12px', borderRadius: 16, background: 'rgba(232,114,26,0.1)' }}>
              <Icon name="warn" size={18} color="#E8721A" />
              <span className="t13 b7" style={{ color: '#8F3E00' }}>חסר ״מספר שיעורים כולל״: {missingTotals.map((c) => c.short).join(', ')}</span>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
