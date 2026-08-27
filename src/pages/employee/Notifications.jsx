import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import NotificationItem from '../../components/notifications/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import { notificationService } from '../../services/api/notificationService';

const TABS = ['All', 'Issues', 'Messages', 'System'];

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    notificationService.list().then(setItems);
  }, []);

  const filtered = (items || []).filter((n) => tab === 'All' || n.category === tab);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay up to date on your issues and messages."
        action={
          <button onClick={() => notificationService.markAllRead()} className="focus-ring text-xs font-medium" style={{ color: 'var(--accent)' }}>
            Mark all as read
          </button>
        }
      />
      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="focus-ring rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: tab === t ? 'var(--accent)' : 'var(--bg-elevated)', color: tab === t ? '#fff' : 'var(--text-secondary)' }}
          >
            {t}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => <NotificationItem key={n.id} notification={n} />)}
        </div>
      )}
    </div>
  );
}
