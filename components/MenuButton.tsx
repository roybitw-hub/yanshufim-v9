'use client';

import { useEffect, useState } from 'react';

const EVT = 'ys:menu';

/** Hosts the mobile menu drawer; opened by <MenuTrigger/> anywhere on the page. */
export function MenuButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setOpen(true);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener(EVT, on);
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener(EVT, on); window.removeEventListener('keydown', key); };
  }, []);
  if (!open) return null;
  return (
    <>
      <button className="drawer-scrim" aria-label="סגירת התפריט" onClick={() => setOpen(false)} style={{ border: 'none' }} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="תפריט">{children}</div>
    </>
  );
}

export function MenuTrigger({ children, className, label = 'תפריט' }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <button className={className} aria-label={label} onClick={() => window.dispatchEvent(new Event(EVT))}>
      {children}
    </button>
  );
}
