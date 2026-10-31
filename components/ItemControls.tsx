'use client';

import { useState, useTransition } from 'react';
import { itemAction } from '@/app/actions';
import { Icon } from './Icon';

type Field = 'attendance' | 'learning' | 'status';
export interface Group { field: Field; label: string; hint: string; icon: string; value: string | null; options: { value: string; label: string }[] }

/** Segmented status controls; every change is written straight to Notion. */
export function ItemControls({ itemId, groups }: { itemId: string; groups: Group[] }) {
  const [vals, setVals] = useState<Record<string, string | null>>(() => Object.fromEntries(groups.map((g) => [g.field, g.value])));
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const pick = (f: Field, v: string) => {
    setVals((x) => ({ ...x, [f]: v }));
    setSaved(false);
    start(async () => { await itemAction(itemId, { [f]: v }); setSaved(true); });
  };
  return (
    <section className="card" aria-label="סטטוס">
      <div className="card-head">
        <div className="col"><h2>סטטוס</h2><span className="sub">כל ממד נשמר בנפרד בנושן</span></div>
        <span className="t12 muted" aria-live="polite">{pending ? 'שומר…' : saved ? 'נשמר ✓' : ''}</span>
      </div>
      {groups.map((g) => (
        <div key={g.field} role="group" aria-label={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="tile" style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(110,77,255,0.11)' }}><Icon name={g.icon} size={21} color="#5B3FF0" opacity={0.2} /></span>
            <div className="col"><span className="t15 b8">{g.label}</span><span className="t12 muted">{g.hint}</span></div>
          </div>
          <div className="seg">
            {g.options.map((o) => (
              <button key={o.value} aria-pressed={vals[g.field] === o.value} onClick={() => pick(g.field, o.value)}>{o.label}</button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
