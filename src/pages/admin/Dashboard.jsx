import { useEffect, useState } from 'react';
import {
  ListChecks,
  Clock,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  Timer,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
    issueService.list().then((all) => {
      setRecent(all.slice(0, 6));
    });
    performanceService
      .getDashboardTrend()
      .then(setTrend);
  }, []);

  return (
    <div className="relative">
      <PageHeader
        title="IT Support Dashboard"
        subtitle="Monitor and manage your organization's IT support activity."
      />

      {/* Statistics */}
      {!summary ? (
        <LoadingState rows={2} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Issues"
            value={summary.totalIssues}
            icon={ListChecks}
          />

          <StatCard
            label="Open"
            value={summary.open}
            icon={Clock}
            tone="info"
          />

          <StatCard
            label="In Progress"
            value={summary.inProgress}
            icon={Wrench}
          />

          <StatCard
            label="Critical"
            value={summary.critical}
            icon={AlertOctagon}
            tone="critical"
          />

          <StatCard
            label="Resolved Today"
            value={summary.resolvedToday}
            icon={CheckCircle2}
            tone="low"
          />

          <StatCard
            label="Avg Resolution"
            value={summary.avgResolution}
            icon={Timer}
            tone="high"
          />
        </div>
      )}

      {/* Chart */}
      <ChartCard
        title="Issue Overview"
        subtitle="Issues created vs. resolved"
        className="mb-6"
        action={
          <FilterSelect
            value={range}
            onChange={setRange}
            options={[
              {
                value: 'today',
                label: 'Today',
              },
              {
                value: '7',
                label: '7 Days',
              },
              {
                value: '30',
                label: '30 Days',
              },
              {
                value: '90',
                label: '3 Months',
              },
            ]}
          />
        }
      >
        {!trend ? (
          <LoadingState rows={1} />
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={trend}
                margin={{
                  top: 8,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="createdGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--chart-color-2)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-color-2)"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="resolvedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--chart-color-3)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-color-3)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--border-soft)"
                  strokeOpacity={0.55}
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />

                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{
                    stroke: 'var(--glass-border-strong)',
                  }}
                  contentStyle={{
                    background: 'var(--glass-bg-strong)',
                    border: '1px solid var(--glass-border-strong)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-glass)',
                    backdropFilter: 'blur(18px)',
                  }}
                  labelStyle={{
                    color: 'var(--text-secondary)',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="var(--chart-color-2)"
                  strokeWidth={2.5}
                  fill="url(#createdGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 0,
                  }}
                  name="Created"
                />

                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="var(--chart-color-3)"
                  strokeWidth={2.5}
                  fill="url(#resolvedGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 0,
                  }}
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Recent issues */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2
              className="text-sm font-semibold"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              Recent Issues
            </h2>

            <p
              className="mt-0.5 text-[11px]"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Latest support activity
            </p>
          </div>
        </div>

        {!recent ? (
          <LoadingState rows={4} />
        ) : (
          <IssueTable
            issues={recent}
            showEmployee
            basePath="/admin/issues"
          />
        )}
      </section>
    </div>
  );
}