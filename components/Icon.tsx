import { ICONS } from '@/lib/icon-data';

/** One icon language: 24 grid, 2px round stroke, one soft fill layer. */
export function Icon({ name, size = 22, color = 'currentColor', fill, opacity = 0.22, stroke = 2 }: {
  name: string; size?: number; color?: string; fill?: string; opacity?: number; stroke?: number;
}) {
  const def = ICONS[name] || ICONS.book;
  const [d, f, extra] = def;
  const fc = fill || color;
  const inner =
    (f ? `<g fill="${fc}" opacity="${opacity}" stroke="none">${f}</g>` : '') +
    (extra ? `<g fill="${fc}" stroke="${color}" stroke-width="${stroke}">${extra.replace(/SC/g, color)}</g>` : '') +
    `<path d="${d}"/>`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

/** Flat tinted tile with a coloured glyph — used for courses and content types. */
export function Tile({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  return (
    <span className="tile" aria-hidden="true" style={{
      width: size, height: size, borderRadius: Math.round(size * 0.3),
      background: `color-mix(in srgb, ${color} 11%, transparent)`,
    }}>
      <Icon name={icon} size={Math.round(size * 0.62)} color={color} opacity={0.2} />
    </span>
  );
}
