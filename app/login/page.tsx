import { Owl } from '@/components/Owl';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--grad)' }}>
      <form method="post" action="/api/login" className="card" style={{ width: '100%', maxWidth: 380, alignItems: 'stretch', gap: 16, padding: 24 }}>
        <div style={{ width: 220, alignSelf: 'center', marginTop: -10 }}><Owl mood="happy" /></div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>ינשופים</h1>
          <p className="t14 muted">מערך הלימודים שלי</p>
        </div>
        <input type="hidden" name="next" value={next || '/'} />
        <div className="field">
          <label htmlFor="password">סיסמה</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" autoFocus required />
        </div>
        {error && <span className="chip red" style={{ alignSelf: 'flex-start' }}>הסיסמה לא נכונה</span>}
        <button type="submit" className="btn primary" style={{ minHeight: 48, justifyContent: 'center', fontSize: 15 }}>כניסה</button>
      </form>
    </main>
  );
}
