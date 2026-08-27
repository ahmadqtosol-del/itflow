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
      className="overflow-x-auto rounded-[var(--radius-lg)] border"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead>
          <tr
            style={{
              background:
                'var(--bg-surface-2)',
            }}
          >
            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Issue
            </th>

            {showEmployee && (
              <th
                className="px-4 py-3 font-medium"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Employee
              </th>
            )}

            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Priority
            </th>

            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Status
            </th>

            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Assigned To
            </th>

            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              Created
            </th>

            <th
              className="px-4 py-3 font-medium"
              style={{
                color: 'var(--text-muted)',
              }}
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
                navigate(
                  `${basePath}/${issue.id}`
                )
              }
              className="cursor-pointer border-t transition-colors"
              style={{
                borderColor:
                  'var(--border-soft)',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  'var(--bg-elevated)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              <td className="px-4 py-3">
                <p
                  className="font-medium"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {issue.id}
                </p>

                <p
                  className="mt-0.5 flex items-center gap-2 text-xs"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  {issue.title}

                  {issue.hasAttachment && (
                    <Paperclip size={11} />
                  )}

                  {issue.commentCount > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare
                        size={11}
                      />

                      {issue.commentCount}
                    </span>
                  )}
                </p>
              </td>

              {showEmployee && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={
                        issue.employee
                          ?.name || 'Unknown'
                      }
                      size="sm"
                    />

                    <span
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {issue.employee
                        ?.name ||
                        'Unknown'}
                    </span>
                  </div>
                </td>
              )}

              <td className="px-4 py-3">
                <PriorityBadge
                  priority={issue.priority}
                />
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  status={issue.status}
                />
              </td>

              <td
                className="px-4 py-3"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                {issue.technician
                  ? issue.technician.name
                  : 'Unassigned'}
              </td>

              <td
                className="px-4 py-3"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                {timeAgo(issue.createdAt)}
              </td>

              <td
                className="px-4 py-3"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                {timeAgo(issue.createdAt)}
              </td>
            </tr>
          ))}

          {issues.length === 0 && (
            <tr>
              <td
                colSpan={
                  showEmployee ? 7 : 6
                }
                className="px-4 py-8 text-center text-sm"
                style={{
                  color:
                    'var(--text-muted)',
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