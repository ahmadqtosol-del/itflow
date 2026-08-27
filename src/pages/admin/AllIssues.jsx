import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterBar, { FilterSelect } from '../../components/common/FilterBar';
import IssueTable from '../../components/issues/IssueTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { issueService } from '../../services/api/issueService';
import { useSettingsStore } from '../../store/settingsStore';
import { STATUSES, STATUS_LABELS, PRIORITIES } from '../../mock/issues';

export default function AllIssues({ statusFilter, title = 'All Issues', subtitle = 'Every IT support request across the organization.' }) {
  const [issues, setIssues] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState([]);

  const { categories, fetchCategories } = useSettingsStore();

  useEffect(() => {
    issueService.list().then(setIssues);
    fetchCategories();
  }, []);

  const base = (issues || []).filter((i) => (statusFilter ? statusFilter.includes(i.status) : true));
  const filtered = base.filter((i) => {
    if (status && i.status !== status) return false;
    if (priority && i.priority !== priority) return false;
    if (category && i.category !== category) return false;
    if (search && !`${i.id} ${i.title} ${i.employee.name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <FilterBar className="mb-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} className="w-64" />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c.name, label: c.name }))} />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {selected.length} selected
            <button className="rounded-[var(--radius-sm)] border px-2.5 py-1.5" style={{ borderColor: 'var(--border)' }}>Assign</button>
            <button className="rounded-[var(--radius-sm)] border px-2.5 py-1.5" style={{ borderColor: 'var(--border)' }}>Change Priority</button>
            <button className="rounded-[var(--radius-sm)] border px-2.5 py-1.5" style={{ borderColor: 'var(--border)' }}>Change Status</button>
          </div>
        )}
      </FilterBar>

      {!issues ? (
        <LoadingState rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No issues match your filters" />
      ) : (
        <IssueTable issues={filtered} showEmployee basePath="/admin/issues" />
      )}
    </div>
  );
}
