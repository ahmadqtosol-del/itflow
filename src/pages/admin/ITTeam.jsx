import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import UserAvatar from '../../components/common/UserAvatar';
import LoadingState from '../../components/common/LoadingState';
import { userService } from '../../services/api/userService';

export default function ITTeam() {
  const [technicians, setTechnicians] = useState(null);

  useEffect(() => {
    userService.listTechnicians().then(setTechnicians);
  }, []);

  return (
    <div>
      <PageHeader title="IT Team" subtitle="Your support technicians and their current workload." />
      {!technicians ? (
        <LoadingState rows={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((t) => (
            <div key={t.id} className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-3">
                <UserAvatar name={t.name} size="lg" status={t.status} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.role}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.specialization}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Open Issues</span><span className="text-right" style={{ color: 'var(--text-primary)' }}>{t.openIssues}</span>
                <span style={{ color: 'var(--text-muted)' }}>Solved Issues</span><span className="text-right" style={{ color: 'var(--text-primary)' }}>{t.solvedIssues}</span>
                <span style={{ color: 'var(--text-muted)' }}>Avg Resolution</span><span className="text-right" style={{ color: 'var(--text-primary)' }}>{t.avgResolution}</span>
                <span style={{ color: 'var(--text-muted)' }}>SLA</span><span className="text-right" style={{ color: 'var(--text-primary)' }}>{t.sla}%</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  {t.status}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--medium)' }}>
                  <Star size={13} fill="currentColor" /> {t.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
