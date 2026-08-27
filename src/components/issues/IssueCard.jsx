import { useNavigate } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import UserAvatar from '../common/UserAvatar';
import { timeAgo } from '../../utils/format';

export default function IssueCard({ issue, basePath = '/employee/problems' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`${basePath}/${issue.id}`)}
      className="focus-ring w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors hover:border-[var(--accent)]"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{issue.id}</span>
        <PriorityBadge priority={issue.priority} />
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={issue.status} />
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {issue.technician && <UserAvatar name={issue.technician.name} size="sm" />}
          {timeAgo(issue.createdAt)}
        </div>
      </div>
    </button>
  );
}
