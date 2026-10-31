import { Owl } from '@/components/Owl';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, textAlign: 'center' }}>
      <div style={{ width: 220 }}><Owl mood="sleep" /></div>
      <h1 style={{ fontSize: 24, fontWeight: 900 }}>הדף לא נמצא</h1>
      <p className="t14 muted">ייתכן שהפריט נמחק או סומן כלא פעיל בנושן.</p>
      <a href="/" className="btn primary">חזרה לבית</a>
    </main>
  );
}
