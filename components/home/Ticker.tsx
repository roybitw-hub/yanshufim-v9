'use client';

import { useEffect, useState, useTransition } from 'react';
import { feedAction } from '@/app/actions';
import { Icon, Tile } from '../Icon';

export interface TMsg { key: string; kicker: string; text: string; icon: string; tone: string; href: string; courseId: string | null; itemId: string }

export function Ticker({ messages }: { messages: TMsg[] }) {
  const [gone, setGone] = useState<Record<string, boolean>>({});
  const [idx, setIdx] = useState(0);
  const [, start] = useTransition();
  const live = messages.filter((m) => !gone[m.key]);
  const cur = live.length ? live[idx % live.length] : null;

  useEffect(() => {
    if (live.length < 2) return;
    const t = setInterval(() => setIdx((i) => i + 1), 4500);
    return () => clearInterval(t);
  }, [live.length]);

  const markRead = () => {
    if (!cur) return;
    setGone((g) => ({ ...g, [cur.key]: true }));
    start(() => feedAction(cur.key, 'read', { kind: 'חדש', courseId: cur.courseId, itemId: cur.itemId }));
  };

  return (
    <section className="card" aria-label="הודעות" style={{ padding: '14px 16px', gap: 10 }}>
      <div className="card-head">
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>הודעות</h2>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
            {live.map((m, i) => (
              <button key={m.key} onClick={() => setIdx(i)} tabIndex={-1}
                style={{ width: i === idx % live.length ? 16 : 6, height: 6, padding: 0, border: 'none', borderRadius: 3, background: i === idx % live.length ? '#5B3FF0' : 'rgba(120,105,210,0.35)', transition: 'width .2s' }} />
            ))}
          </div>
          <a href="/inbox" className="key sm" aria-label="כל ההודעות"><Icon name="list" size={19} /></a>
        </div>
      </div>
      <div className="row ticker" aria-live="polite">
        {cur ? (
          <>
            <Tile icon={cur.icon} color={cur.tone} size={40} />
            <a href={cur.href} className="col">
              <span className="t12 muted ellipsis">{cur.kicker}</span>
              <span className="t15 b8 ellipsis">{cur.text}</span>
            </a>
            <button className="key sm" aria-label="סמן כנקרא" onClick={markRead} style={{ color: '#14A36A' }}><Icon name="read" size={19} /></button>
          </>
        ) : (
          <span className="t14" style={{ color: 'var(--muted2)' }}>אין הודעות חדשות.</span>
        )}
      </div>
    </section>
  );
}
