import { useEffect, useState } from 'react';
import { ListChecks, Clock, Wrench, AlertOctagon, CheckCircle2, Timer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import IssueTable from '../../components/issues/IssueTable';
import LoadingState from '../../components/common/LoadingState';
import { FilterSelect } from '../../components/common/FilterBar';
import { dashboardService } from '../../services/api/dashboardService';
import { issueService } from '../../services/api/issueService';
import { performanceService } from '../../services/api/performanceService';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState(null);
  const [trend, setTrend] = useState(null);
  const [range, setRange] = useState('7');

  useEffect(() => {
    dashboardService.getAdminSummary().then(setSummary);
    issueService.list().then((all) => setRecent(all.slice(0, 6)));
    performanceService.getDashboardTrend().then(setTrend);
  }, []);

  return (
    <div>
      <PageHeader title="IT Support Dashboard" subtitle="Monitor and manage your organization's IT support activity." />

      {!summary ? (
        <LoadingState rows={2} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
          <StatCard label="Total Issues" value={summary.totalIssues} icon={ListChecks} />
          <StatCard label="Open" value={summary.open} icon={Clock} tone="info" />
          <StatCard label="In Progress" value={summary.inProgress} icon={Wrench} />
          <StatCard label="Critical" value={summary.critical} icon={AlertOctagon} tone="critical" />
          <StatCard label="Resolved Today" value={summary.resolvedToday} icon={CheckCircle2} tone="low" />
          <StatCard label="Avg Resolution" value={summary.avgResolution} icon={Timer} tone="high" />
        </div>
      )}

      <ChartCard
        title="Issue Overview"
        subtitle="Issues created vs. resolved"
        className="mb-6"
        action={
          <FilterSelect
            value={range}
            onChange={setRange}
            options={[{ value: 'today', label: 'Today' }, { value: '7', label: '7 Days' }, { value: '30', label: '30 Days' }, { value: '90', label: '3 Months' }]}
          />
        }
      >
        {!trend ? (
          <LoadingState rows={1} />
        ) : (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="created" stroke="var(--accent)" strokeWidth={2} dot={false} name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="var(--accent-2)" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <section>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Issues</h2>
        {!recent ? <LoadingState rows={4} /> : <IssueTable issues={recent} showEmployee basePath="/admin/issues" />}
      </section>
    </div>
  );
}
