import { OWL } from '@/lib/owl-svg';

export type OwlMood = 'full' | 'happy' | 'sleep' | 'alert';

/** The ינשופים owl. Animated by CSS classes inside the SVG (see globals.css). */
export function Owl({ mood = 'full', className, style }: { mood?: OwlMood; className?: string; style?: React.CSSProperties }) {
  return <span className={className} style={{ display: 'block', ...style }} dangerouslySetInnerHTML={{ __html: OWL[mood] }} />;
}

export function OwlHead({ size = 40 }: { size?: number }) {
  return <span aria-hidden="true" style={{ display: 'block', width: size, height: size * 1.09 }} dangerouslySetInnerHTML={{ __html: OWL.head }} />;
}

export function OwlBadge({ size = 50 }: { size?: number }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0, borderRadius: size * 0.32, background: 'var(--grad)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(80,60,200,0.35)',
    }}>
      <OwlHead size={size * 0.78} />
    </span>
  );
}
