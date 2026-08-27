import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Drawer from '../../components/common/Drawer';
import LoadingState from '../../components/common/LoadingState';
import { PriorityBadge } from '../../components/common/Badge';
import { issueService } from '../../services/api/issueService';
import { shortDate } from '../../utils/format';

export default function SolvedIssues() {
  const [issues, setIssues] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    issueService.list().then((all) => setIssues(all.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status))));
  }, []);

  const filtered = (issues || []).filter((i) => !search || `${i.id} ${i.title} ${i.employee.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Solved Issues" subtitle="Full history of resolved and closed IT support requests." action={<SearchBar value={search} onChange={setSearch} className="w-64" />} />
      {!issues ? (
        <LoadingState rows={5} />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                {['Issue', 'Employee', 'Technician', 'Priority', 'Resolved', 'Resolution Time', 'Rating'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} onClick={() => setSelected(i)} className="cursor-pointer border-t" style={{ borderColor: 'var(--border-soft)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{i.id}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{i.title}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{i.employee.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{i.technician?.name || '—'}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={i.priority} /></td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{shortDate(i.updatedAt)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{i.resolutionTime || '—'}</td>
                  <td className="px-4 py-3">
                    {i.employeeRating ? <span className="flex items-center gap-1" style={{ color: 'var(--medium)' }}><Star size={13} fill="currentColor" /> {i.employeeRating}</span> : '—'}
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
            <div><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Employee Feedback</p><p style={{ color: 'var(--text-primary)' }}>{selected.employeeFeedback || '—'}</p></div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
