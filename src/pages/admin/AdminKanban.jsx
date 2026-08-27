import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import FilterBar, { FilterSelect } from '../../components/common/FilterBar';
import SearchBar from '../../components/common/SearchBar';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LoadingState from '../../components/common/LoadingState';
import { issueService } from '../../services/api/issueService';
import { useSettingsStore } from '../../store/settingsStore';
import { PRIORITIES } from '../../mock/issues';

export default function AdminKanban() {
  const [issues, setIssues] = useState(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const { categories, fetchCategories } = useSettingsStore();

  useEffect(() => {
    issueService.list().then(setIssues);
    fetchCategories();
  }, []);

  const filtered = (issues || []).filter((i) => {
    if (priority && i.priority !== priority) return false;
    if (category && i.category !== category) return false;

    if (
      search &&
      !`${i.id} ${i.title} ${i.employee.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <PageHeader
        title="Issue Board"
        subtitle="Organization-wide view across all technicians."
      />

      <FilterBar className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          className="w-56"
        />

        <FilterSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={PRIORITIES.map((p) => ({
            value: p,
            label: p,
          }))}
        />

        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({
            value: c.name,
            label: c.name,
          }))}
        />

        <FilterSelect
          label="Assignee"
          value=""
          onChange={() => {}}
          options={[]}
        />
      </FilterBar>

      {!issues ? (
        <LoadingState rows={4} />
      ) : (
        <KanbanBoard
          issues={filtered}
          setIssues={setIssues}
          basePath="/admin/issues"
          showEmployee={true}
          canChangeStatus={true}
        />
      )}
    </div>
  );
}