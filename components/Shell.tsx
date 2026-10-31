import { getSnapshot } from '@/lib/data';
import { localParts, semesterWeek, todayIL } from '@/lib/dates';
import { SEMESTER } from '@/lib/config';
import { computeMessages, computeSignals, computeStats } from '@/lib/feed';
import { Icon } from './Icon';
import { OwlBadge } from './Owl';
import { MenuButton } from './MenuButton';

export type NavKey = 'home' | 'schedule' | 'courses' | 'tasks' | 'inbox' | 'none';

async function navData() {
  const snap = await getSnapshot();
  const today = todayIL();
  const now = localParts(new Date()).time;
  const signals = computeSignals(snap, today, now);
  const stats = computeStats(snap, signals, today);
  const msgs = computeMessages(snap, today);
  const checks = snap.items.filter((i) => i.needsCheck && i.status !== 'הושלם' && i.status !== 'הוגש').length;
  const synced = localParts(new Date(snap.fetchedAt)).time;
  return { snap, stats, msgs, checks, synced, week: semesterWeek(today, SEMESTER.start) };
}

function MenuPanel({ active, d }: { active: NavKey; d: Awaited<ReturnType<typeof navData>> }) {
  const item = (key: NavKey | '', href: string, icon: string, label: string, right?: React.ReactNode) => (
    <a href={href} className="frost-item" aria-current={key === active ? 'page' : undefined}>
      <Icon name={icon} size={22} color={key === active ? '#5B3FF0' : 'var(--soft)'} stroke={key === active ? 2 : 1.8} opacity={key === active ? 0.22 : 0.14} />
      <span style={{ flex: 1 }}>{label}</span>
      {right}
    </a>
  );
  return (
    <nav className="frost" aria-label="תפריט">
      <div className="frost-head">
        <OwlBadge size={48} />
        <div className="col">
          <span style={{ fontSize: 19, fontWeight: 800 }}>ינשופים</span>
          <span className="ellipsis" style={{ fontSize: 14, color: 'var(--faint)' }}>סמסטר א׳ · שבוע {d.week}</span>
        </div>
      </div>
      <div className="frost-hr" />
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span className="frost-label">ראשי</span>
        {item('home', '/', 'home', 'בית')}
        {item('schedule', '/schedule', 'calendar', 'לו״ז')}
        {item('courses', '/courses', 'courses', 'הקורסים שלי', <span className="count">{d.snap.courses.length}</span>)}
        {item('tasks', '/tasks', 'tasks', 'משימות', <span className="count">{d.stats.openTasks}</span>)}
        {item('inbox', '/inbox', 'bell', 'כל ההודעות', d.msgs.length ? <span className="count red">{d.msgs.length}</span> : null)}
        <div className="frost-hr" />
        <span className="frost-label">מצב המערכת</span>
        {item('', '/status', 'sync', 'סנכרון עם נושן',
          <span className="status-dot" style={{ ['--c' as string]: d.snap.source === 'notion' ? '#14A36A' : '#E8721A' }}>
            {d.snap.source === 'notion' ? d.synced : 'דמו'}
          </span>)}
        {item('', '/status', 'warn', 'בדיקת תקינות', d.checks ? <span className="count red">{d.checks}</span> : null)}
        <div style={{ flex: 1 }} />
        <div className="frost-hr" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 20px' }}>
          <span style={{ fontSize: 12, color: 'var(--faint)' }}>ינשופים V9</span>
          <a href="/api/logout" style={{ fontSize: 14, fontWeight: 700, color: '#B0193F' }}>התנתקות</a>
        </div>
      </div>
    </nav>
  );
}

export async function Shell({ active, children }: { active: NavKey; children: React.ReactNode }) {
  const d = await navData();
  const panel = <MenuPanel active={active} d={d} />;
  const nav = (key: NavKey, href: string, icon: string, label: string, badge?: number) => (
    <a href={href} aria-current={key === active ? 'page' : undefined}>
      <Icon name={icon} size={22} />
      {label}
      {badge ? <span className="badge-dot">{badge}</span> : null}
    </a>
  );
  return (
    <div className="app">
      <aside className="sidebar">{panel}</aside>
      <div className="main">
        {children}
      </div>
      <nav className="bottom-nav" aria-label="ניווט ראשי">
        {nav('home', '/', 'home', 'בית')}
        {nav('schedule', '/schedule', 'calendar', 'לו״ז')}
        <a href="/add" className="fab" aria-label="הוספה"><Icon name="plus" size={26} stroke={2.4} /></a>
        {nav('courses', '/courses', 'courses', 'קורסים')}
        {nav('inbox', '/inbox', 'inbox', 'תיבה', d.msgs.length)}
      </nav>
      <MenuButton>{panel}</MenuButton>
    </div>
  );
}
