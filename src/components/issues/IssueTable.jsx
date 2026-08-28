import { useNavigate } from 'react-router-dom';
import {
  Paperclip,
  MessageSquare,
} from 'lucide-react';

import {
  PriorityBadge,
  StatusBadge,
} from '../common/Badge';

import UserAvatar from '../common/UserAvatar';
import { timeAgo } from '../../utils/format';

export default function IssueTable({
  issues = [],
  showEmployee = false,
  basePath = '/employee/problems',
}) {
  const navigate = useNavigate();

  return (
    <div
      className="overflow-x-auto rounded-2xl border"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead>
          <tr
            style={{
              background: 'rgba(255,255,255,0.035)',
            }}
          >
            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Issue
            </th>

            {showEmployee && (
              <th
                className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Employee
              </th>
            )}

            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Priority
            </th>

            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Status
            </th>

            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Assigned To
            </th>

            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Created
            </th>

            <th
              className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Time Open
            </th>
          </tr>
        </thead>

        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              onClick={() =>
                navigate(`${basePath}/${issue.id}`)
              }
              className="group cursor-pointer border-t transition-all duration-200"
              style={{
                borderColor: 'var(--border-soft)',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  'rgba(59,130,246,0.045)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              <td className="px-4 py-3.5">
                <p
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {issue.id}
                </p>

                <p
                  className="mt-1 flex items-center gap-2 text-xs"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="max-w-[260px] truncate">
                    {issue.title}
                  </span>

                  {issue.hasAttachment && (
                    <Paperclip size={11} />
                  )}

                  {issue.commentCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={11} />
                      {issue.commentCount}
                    </span>
                  )}
                </p>
              </td>

              {showEmployee && (
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={
                        issue.employee?.name ||
                        'Unknown'
                      }
                      size="sm"
                    />

                    <span
                      className="text-xs font-medium"
                      style={{
                        color: 'var(--text-primary)',
                      }}
                    >
                      {issue.employee?.name ||
                        'Unknown'}
                    </span>
                  </div>
                </td>
              )}

              <td className="px-4 py-3.5">
                <PriorityBadge
                  priority={issue.priority}
                />
              </td>

              <td className="px-4 py-3.5">
                <StatusBadge
                  status={issue.status}
                />
              </td>

              <td
                className="px-4 py-3.5 text-xs"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                {issue.technician
                  ? issue.technician.name
                  : 'Unassigned'}
              </td>

              <td
                className="px-4 py-3.5 text-xs"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                {timeAgo(issue.createdAt)}
              </td>

              <td
                className="px-4 py-3.5 text-xs"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                {timeAgo(issue.createdAt)}
              </td>
            </tr>
          ))}

          {issues.length === 0 && (
            <tr>
              <td
                colSpan={showEmployee ? 7 : 6}
                className="px-4 py-12 text-center text-sm"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                No issues found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}