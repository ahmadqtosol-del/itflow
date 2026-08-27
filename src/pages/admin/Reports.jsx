import { useState } from 'react';
import { Download, FileBarChart2, Gauge, Timer, Smile, ListChecks } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import { FilterSelect } from '../../components/common/FilterBar';
import { monthlyVolume } from '../../mock/performance';
import { useUiStore } from '../../store/uiStore';

const REPORTS = [
  { key: 'issues', title: 'Issues Report', icon: ListChecks, summary: '128 issues logged this period, 84% resolved within SLA.' },
  { key: 'performance', title: 'Performance Report', icon: Gauge, summary: 'Average resolution time improved by 12% month over month.' },
  { key: 'sla', title: 'SLA Report', icon: Timer, summary: '93% of issues met their SLA target across all priorities.' },
  { key: 'resolution', title: 'Resolution Report', icon: FileBarChart2, summary: 'Network and software issues account for 55% of tickets.' },
  { key: 'satisfaction', title: 'Employee Satisfaction', icon: Smile, summary: 'Average employee rating of 4.7 / 5 across 96 rated tickets.' },
];

export default function Reports() {
  const [range, setRange] = useState('30');
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and review reports on IT support activity." />
      <div className="grid gap-4 lg:grid-cols-2">
        {REPORTS.map((r) => (
          <div key={r.key} className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <r.icon size={17} />
                </span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.title}</h3>
              </div>
              <FilterSelect label="30 Days" value={range} onChange={setRange} options={[{ value: '7', label: '7 Days' }, { value: '30', label: '30 Days' }, { value: '90', label: '3 Months' }]} />
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVolume}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="issues" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{r.summary}</p>
            <button
              onClick={() => pushToast({ type: 'info', title: 'Export coming soon', message: 'Export will be available once the backend is connected.' })}
              className="focus-ring mt-4 flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--accent)' }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
