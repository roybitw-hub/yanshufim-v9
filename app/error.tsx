'use client';

import { Owl } from '@/components/Owl';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const notion = /Notion|data_source|NOTION_TOKEN/.test(error.message || '');
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ width: 220 }}><Owl mood="alert" /></div>
      <h1 style={{ fontSize: 24, fontWeight: 900 }}>{notion ? 'אין גישה לנתונים בנושן' : 'לא הצלחתי לטעון את הנתונים'}</h1>
      <p className="t14 muted" style={{ maxWidth: 360, lineHeight: 1.6 }}>
        {notion
          ? 'האינטגרציה "ינשופים V9" עדיין לא רואה את המאגרים. בנושן: לפתוח את עמוד מערך הלימודים ← ··· ← Connections ← להוסיף את "ינשופים V9".'
          : 'בדרך כלל זה אומר שהאינטגרציה "ינשופים V9" לא מחוברת למאגרים בנושן, או שנושן לא זמין כרגע. נסה שוב בעוד רגע.'}
      </p>
      {error.digest && <span className="t12 muted">קוד: {error.digest}</span>}
      <button className="btn primary" onClick={reset}>לנסות שוב</button>
    </main>
  );
}
