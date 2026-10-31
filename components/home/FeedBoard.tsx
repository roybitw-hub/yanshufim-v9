'use client';

import { useRef, useState, useTransition } from 'react';
import { feedAction, itemAction } from '@/app/actions';
import type { Signal } from '@/lib/types';
import { Icon, Tile } from '../Icon';

export interface CourseLite { id: string; short: string; icon: string; color: string }
type Cat = 'all' | 'due' | 'lessons' | 'approve';

/** "כרטיסיות נעוצות" + "מה חשוב עכשיו": swipe right to pin, left to mark done. */
export function FeedBoard({ pinned, feed, courses }: { pinned: Signal[]; feed: Signal[]; courses: Record<string, CourseLite> }) {
  const [pinState, setPin] = useState<Record<string, boolean>>(() => Object.fromEntries(pinned.map((s) => [s.key, true])));
  const [readState, setRead] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Cat>('all');
  const [showAll, setShowAll] = useState(false);
  const [drag, setDrag] = useState<{ key: string; x0: number; dx: number } | null>(null);
  const moved = useRef(false);
  const [, start] = useTransition();

  const all = [...pinned, ...feed];
  const meta = (s: Signal) => ({ kind: s.kind, courseId: s.courseId, itemId: s.itemId, version: s.version });
  const pin = (s: Signal) => {
    const v = !pinState[s.key];
    setPin((p) => ({ ...p, [s.key]: v }));
    start(() => feedAction(s.key, v ? 'pin' : 'unpin', meta(s)));
  };
  const done = (s: Signal) => {
    setRead((r) => ({ ...r, [s.key]: true }));
    start(() => feedAction(s.key, 'read', meta(s)));
  };
  const act = (s: Signal, a: string) => {
    if (a === 'dismiss') return done(s);
    if (a.startsWith('attend:') && s.itemId) {
      setRead((r) => ({ ...r, [s.key]: true }));
      start(async () => { await itemAction(s.itemId!, { attendance: a.slice(7) }); await feedAction(s.key, 'read', meta(s)); });
      return;
    }
    if (a.startsWith('lesson:') && s.courseId) window.location.href = `/add?type=שיעור&course=${s.courseId}&date=${a.slice(7)}`;
  };

  const pinnedNow = all.filter((s) => pinState[s.key] && !readState[s.key]);
  const feedNow = all.filter((s) => !pinState[s.key] && !readState[s.key]).filter((s) => filter === 'all' || s.category === filter);
  const readNow = all.filter((s) => readState[s.key]);
  const course = (id: string | null) => (id && courses[id]) || { id: '', short: 'כללי', icon: 'book', color: '#5B3FF0' };

  const card = (s: Signal) => {
    const c = course(s.courseId);
    const dx = drag?.key === s.key ? drag.dx : 0;
    return (
      <div key={s.key} className="feed-card">
        <div aria-hidden="true" className="feed-under" style={{ background: dx > 0 ? 'linear-gradient(90deg, #8A4DFF, #4F6BFF)' : dx < 0 ? 'linear-gradient(270deg, #14A36A, #5FDCA6)' : 'transparent' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dx < 0 ? Math.min(1, -dx / 80) : 0 }}><Icon name="check" size={20} stroke={2.6} />בוצע</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dx > 0 ? Math.min(1, dx / 80) : 0 }}>נעיצה<Icon name="pin" size={20} /></span>
        </div>
        <article className="feed-body"
          style={{ transform: `translateX(${dx}px)`, transition: drag?.key === s.key ? 'none' : 'transform .25s ease' }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button,a')) return;
            moved.current = false;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setDrag({ key: s.key, x0: e.clientX, dx: 0 });
          }}
          onPointerMove={(e) => { if (drag?.key === s.key) { moved.current = true; setDrag({ ...drag, dx: e.clientX - drag.x0 }); } }}
          onPointerUp={() => { if (!drag || drag.key !== s.key) return; const d = drag.dx; setDrag(null); if (d > 90) pin(s); else if (d < -90) done(s); }}
          onPointerCancel={() => setDrag(null)}>
          <Tile icon={c.icon} color={c.color} size={42} />
          <div className="col" style={{ gap: 2 }}>
            <div className="card-head" style={{ gap: 8 }}>
              <span className="t14 b8 ellipsis" style={{ color: c.color }}>{c.short}</span>
              <span className={`chip ${s.tone}`}>{s.tag}</span>
            </div>
            <a href={s.itemId ? `/items/${s.itemId}` : s.courseId ? `/courses/${s.courseId}` : '#'} className="t15 b7" style={{ lineHeight: 1.35 }}>{s.title}</a>
            <span className="t12 muted">{s.meta}</span>
            {s.actions?.length ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {s.actions.map((a, i) => <button key={a.label} className={`btn ${i === 0 ? 'primary' : 'ghost'}`} style={{ minHeight: 32, fontSize: 12.5 }} onClick={() => act(s, a.action)}>{a.label}</button>)}
              </div>
            ) : null}
          </div>
          <div className="feed-actions">
            <button className="key sm" aria-label={`נעיצה: ${s.title}`} onClick={() => pin(s)} style={{ color: '#5B3FF0' }}><Icon name="pin" size={17} /></button>
            <button className="key sm" aria-label={`סמן כבוצע: ${s.title}`} onClick={() => done(s)} style={{ color: '#14A36A' }}><Icon name="check" size={17} stroke={2.4} /></button>
          </div>
          <button className="sr-only" onClick={() => pin(s)}>נעץ את {s.title}</button>
          <button className="sr-only" onClick={() => done(s)}>סמן כבוצע: {s.title}</button>
        </article>
      </div>
    );
  };

  return (
    <>
      {pinnedNow.length > 0 && (
        <section aria-label="כרטיסיות נעוצות" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row" style={{ gap: 8 }}><Icon name="pin" size={18} color="#5B3FF0" /><h2 style={{ fontSize: 18, fontWeight: 800 }}>כרטיסיות נעוצות</h2></div>
          <div className={`pin-strip ${pinnedNow.length === 1 ? 'single' : ''}`}>
            {pinnedNow.map((s) => {
              const c = course(s.courseId);
              return (
                <article key={s.key} className="pin-card">
                  <div className="card-head">
                    <span className="t14 b8 ellipsis" style={{ color: c.color }}>{c.short}</span>
                    <button className="key sm" aria-label="בטל נעיצה" onClick={() => pin(s)} style={{ width: 32, height: 32, color: '#5B3FF0' }}><Icon name="pin" size={15} opacity={0.5} /></button>
                  </div>
                  <a href={s.itemId ? `/items/${s.itemId}` : '#'} className="t15 b7" style={{ lineHeight: 1.3 }}>{s.title}</a>
                  <div className="row" style={{ gap: 6 }}><span className={`chip ${s.tone}`}>{s.tag}</span><span className="t12 muted ellipsis">{s.meta}</span></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section aria-label="מה חשוב עכשיו" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="card-head">
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>מה חשוב עכשיו</h2>
          <span className="t12 muted">{feedNow.length} פריטים</span>
        </div>
        <div className="pills" role="group" aria-label="סינון">
          {([['all', 'הכול'], ['due', 'מטלות'], ['lessons', 'שיעורים'], ['approve', 'לבדיקה']] as [Cat, string][]).map(([k, l]) => (
            <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        {feedNow.length ? (showAll ? feedNow : feedNow.slice(0, 5)).map(card) : (
          <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><span className="t14" style={{ color: 'var(--muted2)' }}>אין כאן משהו דחוף. כל הכבוד.</span></div>
        )}
        {!showAll && feedNow.length > 5 && (
          <button className="btn ghost" style={{ alignSelf: 'center', minHeight: 40 }} onClick={() => setShowAll(true)}>עוד {feedNow.length - 5} פריטים</button>
        )}
        <span className="t12 muted swipe-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="swipe" size={14} />החלקה ימינה נועצת, שמאלה מסמנת כבוצע</span>
        {readNow.length > 0 && (
          <details className="t13" style={{ color: 'var(--muted2)' }}>
            <summary>סומנו עכשיו ({readNow.length})</summary>
            {readNow.map((s) => (
              <div key={s.key} className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="ellipsis">{s.title}</span>
                <button className="btn ghost" style={{ minHeight: 30 }} onClick={() => { setRead((r) => ({ ...r, [s.key]: false })); start(() => feedAction(s.key, 'unread', meta(s))); }}>החזר</button>
              </div>
            ))}
          </details>
        )}
      </section>
    </>
  );
}
