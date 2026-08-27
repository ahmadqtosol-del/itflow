import { useEffect, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterBar, { FilterSelect } from '../../components/common/FilterBar';
import IssueTable from '../../components/issues/IssueTable';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { issueService } from '../../services/api/issueService';
import { STATUSES, STATUS_LABELS, PRIORITIES } from '../../mock/issues';

export default function MyProblems() {
  const user = useAuthStore((s) => s.user);
  const [issues, setIssues] = useState(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const { categories, fetchCategories } = useSettingsStore();

  function load() {
    setIssues(null);
    setError(false);
    issueService.list({ mine: true }).then(setIssues).catch(() => setError(true));
  }
  useEffect(() => {
    load();
    fetchCategories();
  }, [user?.id]);

  const filtered = (issues || []).filter((i) => {
    if (status && i.status !== status) return false;
    if (priority && i.priority !== priority) return false;
    if (category && i.category !== category) return false;
    if (search && !`${i.id} ${i.title}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="My Problems" subtitle="Track all IT support requests submitted by you." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search issues…" className="w-64" />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c.name, label: c.name }))} />
        </FilterBar>

        <div className="flex rounded-[var(--radius-md)] border p-0.5" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setView('table')}
            className="focus-ring flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium"
            style={{ background: view === 'table' ? 'var(--accent)' : 'transparent', color: view === 'table' ? '#fff' : 'var(--text-secondary)' }}
          >
            <List size={14} /> Table
          </button>
          <button
            onClick={() => setView('kanban')}
            className="focus-ring flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium"
            style={{ background: view === 'kanban' ? 'var(--accent)' : 'transparent', color: view === 'kanban' ? '#fff' : 'var(--text-secondary)' }}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : !issues ? (
        <LoadingState rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No problems found" description="Try adjusting your filters, or report a new issue." />
      ) : view === 'table' ? (
        <IssueTable issues={filtered} />
      ) : (
        <KanbanBoard
          issues={filtered}
          setIssues={setIssues}
          canChangeStatus={user?.role === 'TECHNICIAN' || user?.role === 'ADMIN'}
        />
      )}
    </div>
  );
}
