import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Timer, Clock, Star, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import UserAvatar from '../../components/common/UserAvatar';
import LoadingState from '../../components/common/LoadingState';
import { FilterSelect } from '../../components/common/FilterBar';
import { userService } from '../../services/api/userService';
import { performanceService } from '../../services/api/performanceService';

const COLORS = ['#3b82f6', '#22d3ee', '#a78bfa', '#f79009', '#22c55e', '#f04438'];

export default function Performance() {
  const [technicians, setTechnicians] = useState(null);
  const [charts, setCharts] = useState(null);
  const [stats, setStats] = useState(null);
  const [range, setRange] = useState('30');

  useEffect(() => {
    const days = parseInt(range, 10) || 30;
    userService.listTechnicians(days).then(setTechnicians);
    performanceService.getTechnicianCharts(days).then((res) => {
      setCharts(res.charts);
      setStats(res.stats);
    });
  }, [range]);

  return (
    <div>
      <PageHeader
        title="IT Team Performance"
        subtitle="Track technician workload, response times, and satisfaction."
        action={
          <FilterSelect
            label={range === '7' ? '7 Days' : range === '90' ? '3 Months' : '30 Days'}
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: '7 Days' },
              { value: '30', label: '30 Days' },
              { value: '90', label: '3 Months' },
            ]}
          />
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Tasks Solved" value={stats?.tasks_solved ?? 0} icon={CheckCircle2} tone="low" />
        <StatCard label="Avg Response" value={stats?.avg_response ?? '0m'} icon={Clock} tone="info" />
        <StatCard label="Avg Resolution" value={stats?.avg_resolution ?? '0m'} icon={Timer} tone="high" />
        <StatCard label="Avg Rating" value={stats?.avg_rating ? `${stats.avg_rating} / 5` : '0 / 5'} icon={Star} />
        <StatCard label="SLA Success" value={stats?.sla_success !== undefined ? `${stats.sla_success}%` : '0%'} icon={ShieldCheck} tone="low" />
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Technician Performance</h2>
        {!technicians ? (
          <LoadingState rows={3} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technicians.map((t) => (
              <div key={t.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={t.name} status={t.status} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.solvedIssues} issues solved</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><p style={{ color: 'var(--text-muted)' }}>Avg Resolution</p><p style={{ color: 'var(--text-primary)' }}>{t.avgResolution}</p></div>
                  <div><p style={{ color: 'var(--text-muted)' }}>Avg Response</p><p style={{ color: 'var(--text-primary)' }}>{t.avgResponse}</p></div>
                  <div><p style={{ color: 'var(--text-muted)' }}>Rating</p><p style={{ color: 'var(--text-primary)' }}>{t.rating} / 5</p></div>
                  <div><p style={{ color: 'var(--text-muted)' }}>SLA</p><p style={{ color: 'var(--text-primary)' }}>{t.sla}%</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!charts ? (
        <LoadingState rows={2} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Tasks Solved by Technician">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicians?.map((t) => ({ name: t.name.split(' ')[0], solved: t.solvedIssues }))}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="solved" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Average Resolution Time (min)">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.resolutionByTech}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="minutes" fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Customer Satisfaction Trend">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.satisfactionTrend}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[4, 5]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="rating" stroke="var(--medium)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Issues by Category">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {charts.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
