import { Icon, Tile } from '@/components/Icon';
import { MenuTrigger } from '@/components/MenuButton';
import { Owl } from '@/components/Owl';
import { Shell } from '@/components/Shell';
import { FeedBoard } from '@/components/home/FeedBoard';
import { Ticker } from '@/components/home/Ticker';
import { Yoman } from '@/components/home/Yoman';
import { getSnapshot } from '@/lib/data';
import { localParts } from '@/lib/dates';
import { buildHome } from '@/lib/home';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const snap = await getSnapshot();
  const { date: today, time: now } = localParts(new Date());
  const h = buildHome(snap, today, now);

  return (
    <Shell active="home">
      <section className="hero" aria-label="פתיח">
        <div className="hero-top">
          <a href="/inbox" className="icon-plain" aria-label="התראות">
            <Icon name="bell" size={24} color="#fff" opacity={0.3} />
            {h.messages.length > 0 && <span style={{ position: 'absolute', top: 2, right: 0, minWidth: 18, height: 18, borderRadius: 9, background: '#FDBA74', color: '#5A2A00', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{h.messages.length}</span>}
          </a>
          <MenuTrigger className="icon-plain"><Icon name="menu" size={26} color="#fff" stroke={2.4} /></MenuTrigger>
        </div>
        <div className="hero-tools" aria-hidden="false">
          <a href="/inbox" className="glass-pill" aria-label="התראות"><Icon name="bell" size={20} color="#fff" opacity={0.3} /></a>
          <a href="/courses" className="glass-pill"><Icon name="courses" size={18} color="#fff" opacity={0.3} /><span className="t14" style={{ opacity: 0.9 }}>הקורסים שלי</span></a>
        </div>
        <div className="hero-body">
          <div className="hero-text">
            <span className="hero-kicker">{h.dayLabel} · שבוע {h.week}</span>
            <h1>{h.greeting}, רועי</h1>
            <span className="hero-sub">{h.summary}</span>
            <div className="hero-stats">
              <div className="hero-stat"><b>{h.todaySessions}</b><span>מפגשים היום</span></div>
              <div className="hero-stat"><b>{h.stats.openTasks}</b><span>משימות פתוחות</span></div>
              <div className="hero-stat"><b>{h.stats.urgentWeek}</b><span>דורש טיפול</span></div>
              <div className="hero-stat"><b>{h.stats.nextDueDays ?? '—'}</b><span>ימים למועד הבא</span></div>
            </div>
          </div>
          <div className="hero-owl" aria-hidden="true">
            <Owl mood={h.mood} className="ow-enter" />
          </div>
        </div>
      </section>

      <div className="content">
        <div className="home-grid">
          <div>
            <Ticker messages={h.messages} />
            <Yoman today={today} now={now} events={h.events} />
            <div className="bento">
              <a href="/tasks" className="card">
                <Tile icon="task" color="#14A36A" size={38} />
                <div className="col"><span className="t13 b8" style={{ color: 'var(--muted2)' }}>משימות פתוחות</span>
                  <span className="t12 muted"><b style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 900 }}>{h.stats.openTasks}</b> · {h.stats.doneTasks}/{h.stats.totalTasks} הושלמו</span></div>
              </a>
              <a href="#feed" className="card">
                <Tile icon="urgent" color="#5B3FF0" size={38} />
                <div className="col"><span className="t13 b8" style={{ color: 'var(--muted2)' }}>דורש טיפול</span>
                  <span className="t12 muted"><b style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 900 }}>{h.stats.urgentToday}</b> היום · {h.stats.urgentWeek} השבוע</span></div>
              </a>
            </div>
            <div id="feed" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FeedBoard pinned={h.view.pinned} feed={h.view.feed} courses={h.courseLite} />
            </div>
          </div>
          <div>
            {h.later.length > 0 && (
              <section className="card" aria-label="בהמשך">
                <div className="card-head"><h2>בהמשך</h2></div>
                {h.later.map((l, i) => (
                  <div key={l.href + i}>
                    {i > 0 && <div className="divider" style={{ marginBottom: 12 }} />}
                    <a href={l.href} className="row">
                      <Tile icon={l.icon} color={l.color} size={36} />
                      <span className="t14 b7" style={{ flex: 1 }}>{l.title}</span>
                      <span className="t12 muted">{l.right}</span>
                    </a>
                  </div>
                ))}
              </section>
            )}
            <section aria-label="הקורסים שלי" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="card-head">
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>הקורסים שלי</h2>
                <a href="/courses" className="t14 b8" style={{ color: '#5B3FF0' }}>הכול · {h.courses.length}</a>
              </div>
              <div className="course-strip">
                {h.courses.map((c) => (
                  <a key={c.id} href={`/courses/${c.id}`} className="course-card">
                    <div className="card-head">
                      <Tile icon={c.icon} color={c.color} size={40} />
                      {c.open > 0 && <span className="chip red">{c.open}</span>}
                    </div>
                    <span className="t15 b8" style={{ lineHeight: 1.25, minHeight: 38 }}>{c.short}</span>
                    <div className="bar"><span style={{ width: `${Math.max(c.pct, 4)}%`, background: c.color }} /></div>
                    <span className="t12 b7" style={{ color: 'var(--muted2)' }}>{c.total ? `${c.learned}/${c.total} נלמדו` : c.learned ? `${c.learned} ${c.unitLabel} נלמדו` : 'אין תיעוד עדיין'}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Shell>
  );
}
