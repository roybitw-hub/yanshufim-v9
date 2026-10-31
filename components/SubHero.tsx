import { Icon } from './Icon';
import { MenuTrigger } from './MenuButton';

export function SubHero({ title, kicker, back = '/', icon, chips, actions, children }: {
  title: string; kicker?: React.ReactNode; back?: string | null; icon?: string;
  chips?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <section className="hero subhero">
      <div className="hero-top" style={{ display: 'flex', marginBottom: 14 }}>
        {back ? <a href={back} className="hero-key" aria-label="חזרה"><Icon name="chev-r" size={20} color="#fff" stroke={2.4} /></a> : <span />}
        <div className="row" style={{ gap: 8 }}>
          {actions}
          <MenuTrigger className="hero-key menu-btn"><Icon name="menu" size={20} color="#fff" stroke={2.4} /></MenuTrigger>
        </div>
      </div>
      <div className="row" style={{ gap: 14, alignItems: 'center' }}>
        {icon && (
          <span aria-hidden="true" style={{ width: 58, height: 58, flexShrink: 0, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={34} color="#fff" opacity={0.3} />
          </span>
        )}
        <div className="col" style={{ gap: 4 }}>
          {kicker && <span className="t13 b7" style={{ opacity: 0.88 }}>{kicker}</span>}
          <h1>{title}</h1>
        </div>
      </div>
      {chips && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>{chips}</div>}
      {children}
    </section>
  );
}
