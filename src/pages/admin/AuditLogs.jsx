import { useEffect, useState } from 'react';
import { Wrench, Users, Settings as SettingsIcon, Server } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import { FilterSelect } from '../../components/common/FilterBar';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { auditService } from '../../services/api/auditService';
import { timeAgo, shortDate } from '../../utils/format';

const ICONS = { Issue: Wrench, Employee: Users, Settings: SettingsIcon, System: Server };

export default function AuditLogs() {
  const [logs, setLogs] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    auditService.list(category).then(setLogs);
  }, [category]);

  const filtered = (logs || []).filter((l) => {
    if (search && !`${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A record of administrative and system actions." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} className="w-64" placeholder="Search logs…" />
        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={['Issue', 'Employee', 'Settings', 'System'].map((c) => ({ value: c, label: c }))}
        />
      </div>

      {!logs ? (
        <LoadingState rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No audit logs found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const Icon = ICONS[log.category] || Server;
            return (
              <div key={log.id} className="flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
                  <Icon size={15} />
                </span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.actor}</strong> {log.action}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{shortDate(log.time)} · {timeAgo(log.time)} · {log.target}</p>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                  {log.category}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
