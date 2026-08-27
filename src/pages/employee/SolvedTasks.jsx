import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Drawer from '../../components/common/Drawer';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { PriorityBadge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/authStore';
import { issueService } from '../../services/api/issueService';
import { shortDate } from '../../utils/format';

export default function SolvedTasks() {
  const user = useAuthStore((s) => s.user);
  const [issues, setIssues] = useState(null);
  const [selected, setSelected] = useState(null);

  // Rating widget state — local to whichever issue is open in the drawer
  const [hoverStar, setHoverStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    issueService.list({ mine: true }).then((all) =>
      setIssues(all.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)))
    );
  }, [user?.id]);

  function openIssue(issue) {
    setSelected(issue);
    setHoverStar(0);
    setFeedbackText('');
    setRateError('');
  }

  async function submitRating(stars) {
    if (!selected || submitting) return;
    setSubmitting(true);
    setRateError('');
    try {
      const updated = await issueService.rate(selected.id, stars, feedbackText.trim());
      setSelected(updated);
      setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setRateError(err?.message || 'Could not submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Solved Tasks" subtitle="A history of your resolved IT support requests." />
      {!issues ? (
        <LoadingState rows={4} />
      ) : issues.length === 0 ? (
        <EmptyState title="No solved issues yet" />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                {['Issue', 'Priority', 'Technician', 'Resolved', 'Resolution Time', 'Rating'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.id} onClick={() => openIssue(i)} className="cursor-pointer border-t" style={{ borderColor: 'var(--border-soft)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{i.id}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{i.title}</p>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={i.priority} /></td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{i.technician?.name || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{shortDate(i.updatedAt)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{i.resolutionTime || '—'}</td>
                  <td className="px-4 py-3">
                    {i.employeeRating ? (
                      <span className="flex items-center gap-1" style={{ color: 'var(--medium)' }}>
                        <Star size={13} fill="currentColor" /> {i.employeeRating}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Rate it</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.id} subtitle={selected?.title}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Root Cause</p><p style={{ color: 'var(--text-primary)' }}>{selected.rootCause || '—'}</p></div>
            <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Resolution</p><p style={{ color: 'var(--text-primary)' }}>{selected.resolution || '—'}</p></div>
            <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Technician</p><p style={{ color: 'var(--text-primary)' }}>{selected.technician?.name || '—'}</p></div>
            <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Time Spent</p><p style={{ color: 'var(--text-primary)' }}>{selected.timeSpent || '—'}</p></div>

            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {selected.employeeRating ? 'Your Rating' : 'Rate this resolution'}
              </p>

              {selected.employeeRating ? (
                <>
                  <div className="mt-1 flex items-center gap-1" style={{ color: 'var(--medium)' }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} fill={n <= selected.employeeRating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  {selected.employeeFeedback && (
                    <p className="mt-2" style={{ color: 'var(--text-primary)' }}>{selected.employeeFeedback}</p>
                  )}
                </>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={submitting}
                        onMouseEnter={() => setHoverStar(n)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => submitRating(n)}
                        style={{ color: 'var(--medium)', lineHeight: 0 }}
                        aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Star size={22} fill={n <= hoverStar ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={submitting}
                    placeholder="Optional feedback for the technician..."
                    rows={2}
                    className="w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />

                  {rateError && <p style={{ color: 'var(--critical, #f04438)' }}>{rateError}</p>}
                  {submitting && <p style={{ color: 'var(--text-muted)' }}>Submitting...</p>}
                  <p style={{ color: 'var(--text-muted)' }}>Click a star to submit your rating.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}