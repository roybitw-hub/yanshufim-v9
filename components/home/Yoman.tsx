'use client';

import { useState } from 'react';
import { Icon } from '../Icon';

export interface YEvent { key: string; date: string; time: string | null; label: string; color: string; kind: string; documented: boolean; cancelled?: boolean; href?: string }

const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const iso = (d: Date) => d.toISOString().slice(0, 10);
const add = (s: string, n: number) => { const d = parse(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const dm = (s: string) => { const d = parse(s); return `${d.getUTCDate()}.${d.getUTCMonth() + 1}`; };

export function Yoman({ today, now, events }: { today: string; now: string; events: YEvent[] }) {
  const on = (d: string) => events.filter((e) => e.date === d && !e.cancelled);
  const todays = on(today);
  const [range, setRange] = useState<'day' | 'week' | 'month'>(todays.length ? 'day' : 'week');
  const [monthOff, setMonthOff] = useState(0);

  const next = events.find((e) => !e.cancelled && (e.date > today || (e.date === today && e.time && mins(e.time) > mins(now))));
  const nextLine = next ? `${DAYS[parse(next.date).getUTCDay()]} ${dm(next.date)}${next.time ? ' · ' + next.time : ''} ${next.label}` : 'אין מפגשים קרובים';

  const week = Array.from({ length: 7 }, (_, i) => add(today, i));
  const sessionsToday = todays.filter((e) => e.kind === 'session');
  const undocumented = sessionsToday.filter((e) => !e.documented && e.time && mins(e.time) < mins(now)).length;
  const weekCount = week.reduce((a, d) => a + on(d).filter((e) => e.kind === 'session').length, 0);

  const base = parse(today);
  const mBase = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOff, 1));
  const dim = new Date(Date.UTC(mBase.getUTCFullYear(), mBase.getUTCMonth() + 1, 0)).getUTCDate();
  const monthDays = Array.from({ length: dim }, (_, i) => iso(new Date(Date.UTC(mBase.getUTCFullYear(), mBase.getUTCMonth(), i + 1))));
  const monthSessions = monthDays.reduce((a, d) => a + on(d).filter((e) => e.kind === 'session').length, 0);

  const sub = range === 'day'
    ? (sessionsToday.length ? `היום: ${sessionsToday.length} מפגשים${undocumented ? ` · ${undocumented} לא תועדו` : ''}` : todays.length ? `היום: ${todays[0].label}` : 'אין לימודים היום')
    : range === 'week' ? `7 הימים הקרובים: ${weekCount} מפגשים` : `${monthSessions} מפגשים בחודש`;

  // ---- day timeline
  const n = todays.length;
  const step = n > 1 ? 66 / (n - 1) : 0;
  const nowM = mins(now);
  const past = todays.filter((e) => e.time && mins(e.time) <= nowM).length;
  const prog = past === 0 ? 0 : past >= n ? 100 : (past - 1) * step + step / 2 + 4;

  return (
    <section className="card" aria-label="היומן שלי">
      <div className="card-head">
        <div className="row">
          <span className="key"><Icon name="calendar" size={22} color="#5B3FF0" /></span>
          <div className="col"><h2 style={{ fontSize: 16, fontWeight: 800 }}>היומן שלי</h2><span className="t12 muted">{sub}</span></div>
        </div>
        <a href="/schedule" className="key" aria-label="ללו״ז המלא"><Icon name="chev-l" size={18} stroke={2.4} /></a>
      </div>
      <div className="seg" role="group" aria-label="טווח">
        {(['day', 'week', 'month'] as const).map((r) => (
          <button key={r} aria-pressed={range === r} onClick={() => setRange(r)}>{r === 'day' ? 'יום' : r === 'week' ? 'שבוע' : 'חודש'}</button>
        ))}
      </div>

      {range === 'day' && (n ? (
        <div className="tl">
          <span className="tl-base" style={{ right: '4%', left: '6%' }} />
          <span className="tl-prog" style={{ right: '4%', width: `${prog}%` }} />
          {todays.map((e, i) => {
            const isPast = !!e.time && mins(e.time) <= nowM;
            const dot = e.kind !== 'session'
              ? { width: 18, height: 18, marginTop: 2, borderRadius: 5, background: e.color, transform: 'rotate(45deg) scale(0.8)' }
              : isPast && !e.documented
                ? { width: 18, height: 18, marginTop: 2, boxSizing: 'border-box' as const, borderRadius: 9, border: `3px solid ${e.color}`, background: '#fff' }
                : { width: 18, height: 18, marginTop: 2, borderRadius: 9, background: e.color, boxShadow: `0 0 0 4px ${e.color}33` };
            return (
              <a key={e.key} href={e.href || '#'} className="tl-node" style={{ right: `${n === 1 ? 30 : 4 + i * step}%` }}>
                <span style={dot} />
                <b className="t14">{e.time || 'מועד'}</b>
                <span className="t12" style={{ color: 'var(--muted2)' }}>{e.label}</span>
              </a>
            );
          })}
          <span className="tl-now" style={past >= n ? { left: 0 } : { right: `${Math.max(0, (past - 0.5) * step + 2)}%` }}>
            <span /><b style={{ fontSize: 11, color: '#B0193F' }}>עכשיו</b>
          </span>
        </div>
      ) : <span className="t14" style={{ color: 'var(--muted2)' }}>אין מפגשים או מועדים היום.</span>)}

      {range === 'week' && (
        <div className="tl" style={{ height: 96 }}>
          <span className="tl-base" style={{ right: 6, left: 6, top: 15, background: 'linear-gradient(270deg, #5EEAD4, #6B4DFF)', opacity: 0.85 }} />
          {week.map((d, i) => {
            const ev = on(d);
            const due = ev.find((e) => e.kind !== 'session');
            const col = due ? due.color : ev[0]?.color;
            const dot = i === 0
              ? { width: 20, height: 20, marginTop: 7, borderRadius: 10, background: 'linear-gradient(160deg, #6B5BFF, #8A4DFF)', boxShadow: '0 0 0 4px rgba(110,77,255,0.22)' }
              : ev.length ? { width: 16, height: 16, marginTop: 9, borderRadius: due ? 4 : 8, transform: due ? 'rotate(45deg) scale(0.85)' : undefined, background: col, boxShadow: `0 0 0 4px ${col}2E` }
                : { width: 12, height: 12, marginTop: 11, boxSizing: 'border-box' as const, borderRadius: 6, border: '2.5px solid #C9C2EC', background: '#fff' };
            const first = ev.find((e) => e.kind === 'session') || ev[0];
            return (
              <div key={d} className="tl-node" style={{ right: `${i * (84 / 6)}%`, width: 52, marginRight: -14, gap: 3 }}>
                <span style={dot} />
                <span style={{ fontSize: 12, fontWeight: i === 0 ? 900 : 800, color: i === 0 ? '#4325C8' : 'var(--ink)' }}>{DAYS[parse(d).getUTCDay()]} {parse(d).getUTCDate()}</span>
                <span className="ellipsis" style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', maxWidth: 50 }}>{first ? (first.kind === 'session' ? first.label : 'מועד') : ''}</span>
                {ev.length > 1 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>+{ev.length - 1}</span>}
              </div>
            );
          })}
        </div>
      )}

      {range === 'month' && (
        <>
          <div className="card-head">
            <button className="key sm" aria-label="החודש הקודם" onClick={() => setMonthOff(monthOff - 1)}><Icon name="chev-r" size={16} stroke={2.4} /></button>
            <span className="t15 b8" style={{ fontSize: 16, fontWeight: 900 }}>{MONTHS[mBase.getUTCMonth()]} {mBase.getUTCFullYear()}</span>
            <button className="key sm" aria-label="החודש הבא" onClick={() => setMonthOff(monthOff + 1)}><Icon name="chev-l" size={16} stroke={2.4} /></button>
          </div>
          <div className="month-grid">
            {DAYS.map((x) => <span key={x} className="t12 muted b7" style={{ paddingBottom: 4 }}>{x}</span>)}
            {Array.from({ length: mBase.getUTCDay() }, (_, i) => <span key={'b' + i} />)}
            {monthDays.map((d) => {
              const ev = on(d);
              const isT = d === today;
              return (
                <div key={d} className="month-cell" style={isT ? { background: 'linear-gradient(160deg, #6B5BFF, #8A4DFF)', color: '#fff' } : ev.length ? { background: 'rgba(255,255,255,0.7)' } : { color: 'var(--muted)' }}>
                  <span>{parse(d).getUTCDate()}</span>
                  <div style={{ display: 'flex', gap: 2, height: 5 }}>
                    {ev.slice(0, 3).map((e) => <span key={e.key} style={{ width: 5, height: 5, borderRadius: e.kind === 'session' ? 3 : 1, background: isT ? '#fff' : e.color }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <span className="t13" style={{ color: 'var(--muted2)' }}>הבא: <b>{nextLine}</b></span>
    </section>
  );
}
