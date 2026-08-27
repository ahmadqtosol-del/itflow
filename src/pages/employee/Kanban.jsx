import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import FilterBar, { FilterSelect } from '../../components/common/FilterBar';
import SearchBar from '../../components/common/SearchBar';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LoadingState from '../../components/common/LoadingState';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { issueService } from '../../services/api/issueService';
import { PRIORITIES } from '../../mock/issues';

export default function Kanban() {
  const user = useAuthStore((s) => s.user);
  const [issues, setIssues] = useState(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const { categories, fetchCategories } = useSettingsStore();

  useEffect(() => {
    const filters = user?.role === 'EMPLOYEE' ? { mine: true } : {};
    issueService.list(filters).then(setIssues);
    fetchCategories();
  }, [user?.id, user?.role]);

  const filtered = (issues || []).filter((i) => {
    if (priority && i.priority !== priority) return false;
    if (category && i.category !== category) return false;
    if (search && !`${i.id} ${i.title}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Issue Board" subtitle="Drag issues between columns to reflect their progress." />
      <FilterBar className="mb-4">
        <SearchBar value={search} onChange={setSearch} className="w-56" />
        <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c.name, label: c.name }))} />
      </FilterBar>
      {!issues ? <LoadingState rows={4} /> : <KanbanBoard
  issues={filtered}
  setIssues={setIssues}
  canChangeStatus={user?.role === 'TECHNICIAN' || user?.role === 'ADMIN'}
/>}
    </div>
  );
}
