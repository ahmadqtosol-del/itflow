import { useEffect, useState } from 'react';
import { Wrench, Clock, Hourglass, CheckCircle2, PlusCircle, ClipboardList, MessageSquare, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import IssueTable from '../../components/issues/IssueTable';
import UnresolvedBanner from '../../components/layout/UnresolvedBanner';
import LoadingState from '../../components/common/LoadingState';
import { useAuthStore } from '../../store/authStore';
import { issueService } from '../../services/api/issueService';
import { dashboardService } from '../../services/api/dashboardService';
import { activities } from '../../mock/activities';
import { timeAgo } from '../../utils/format';

const QUICK_ACTIONS = [
  { label: 'Report a Problem', icon: PlusCircle, to: '/employee/report' },
  { label: 'View My Problems', icon: ClipboardList, to: '/employee/problems' },
  { label: 'Contact IT', icon: MessageSquare, to: '/employee/messages' },
  { label: 'View Solved Tasks', icon: ListChecks, to: '/employee/solved' },
];

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [issues, setIssues] = useState(null);
  const [summary, setSummary] = useState({ open: 0, inProgress: 0, waiting: 0, resolved: 0 });

  useEffect(() => {
    const isTech = user?.role === 'TECHNICIAN';
    const filters = isTech ? {} : { mine: true };
    issueService.list(filters).then(setIssues);
    dashboardService.getEmployeeSummary().then(setSummary);
  }, [user?.id, user?.role]);

  const active = (issues || []).filter((i) => !['RESOLVED', 'CLOSED'].includes(i.status));

  return (
    <div>
      {user?.role === 'TECHNICIAN' && <UnresolvedBanner count={active.length} />}

      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Good morning, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Here's an overview of your IT support requests.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open Issues" value={summary.open} icon={Clock} tone="info" />
        <StatCard label="In Progress" value={summary.inProgress} icon={Wrench} tone="default" />
        <StatCard label="Waiting" value={summary.waiting} icon={Hourglass} tone="high" />
        <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle2} tone="low" />
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Issues</h2>
          <button onClick={() => navigate('/employee/problems')} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>View all</button>
        </div>
        {!issues ? <LoadingState rows={3} /> : <IssueTable issues={active.slice(0, 4)} />}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{a.text}</p>
                <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(a.time)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="focus-ring flex flex-col items-start gap-2 rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-colors hover:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
              >
                <a.icon size={18} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
