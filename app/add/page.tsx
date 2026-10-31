import { addItemAction } from '@/app/actions';
import { Icon } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { SubHero } from '@/components/SubHero';
import { getSnapshot } from '@/lib/data';

export const dynamic = 'force-dynamic';

const TYPES = ['מטלה', 'שלב', 'מבחן', 'שיעור', 'אירוע'] as const;

export default async function Add({ searchParams }: { searchParams: Promise<{ type?: string; course?: string; parent?: string; date?: string }> }) {
  const q = await searchParams;
  const snap = await getSnapshot();
  const parents = snap.items.filter((i) => i.type === 'מטלה' && (!q.course || i.courseId === q.course));
  return (
    <Shell active="none">
      <SubHero back="/" title="הוספה" kicker="נשמר ישר לנושן" />
      <div className="content">
        <form action={addItemAction} className="card" style={{ gap: 16 }}>
          <div className="field">
            <label>סוג</label>
            <div className="seg" role="radiogroup">
              {TYPES.map((t) => (
                <label key={t} style={{ flex: 1 }}>
                  <input type="radio" name="type" value={t} defaultChecked={(q.type || 'מטלה') === t} className="sr-only" />
                  <span className="seg-opt">{t === 'שלב' ? 'מטלת בת' : t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="title">שם</label><input id="title" name="title" className="input" required placeholder="למשל: הגשת חלק א׳" /></div>
          <div className="field">
            <label htmlFor="courseId">קורס</label>
            <select id="courseId" name="courseId" className="input" defaultValue={q.course || ''} required>
              <option value="" disabled>בחר קורס</option>
              {snap.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="date">תאריך</label><input id="date" name="date" type="date" className="input" defaultValue={q.date || ''} /></div>
          <div className="field">
            <label htmlFor="parentId">שייך למטלה (למטלת בת)</label>
            <select id="parentId" name="parentId" className="input" defaultValue={q.parent || ''}>
              <option value="">ללא</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <button type="submit" className="btn primary" style={{ minHeight: 48, justifyContent: 'center', fontSize: 15 }}><Icon name="plus" size={18} stroke={2.4} />הוספה</button>
          {snap.source === 'demo' && <span className="t12 muted">מצב דמו: אין חיבור לנושן, ההוספה לא תישמר.</span>}
        </form>
      </div>
    </Shell>
  );
}
