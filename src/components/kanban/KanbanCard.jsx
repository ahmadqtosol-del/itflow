import {
  Paperclip,
  MessageSquare,
} from 'lucide-react';

import { PriorityBadge } from '../common/Badge';
import UserAvatar from '../common/UserAvatar';
import { timeAgo } from '../../utils/format';

export default function KanbanCard({
  issue,
  onClick,
  onDragStart,
  onDragEnd,
  showEmployee = false,
  canChangeStatus = false,
}) {
  function handleDragStart(event) {
    if (!canChangeStatus) {
      event.preventDefault();
      return;
    }

    /*
     * Store the issue ID in the browser drag payload.
     * The KanbanBoard also keeps the ID in React state.
     */
    try {
      event.dataTransfer.effectAllowed = 'move';

      event.dataTransfer.setData(
        'text/plain',
        String(issue.id)
      );
    } catch {
      // Ignore unsupported drag APIs.
    }

    onDragStart?.(event, issue.id);
  }

  function handleDragEnd() {
    onDragEnd?.();
  }

  return (
    <div
      draggable={canChangeStatus}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`
        rounded-[var(--radius-md)]
        border
        p-3
        text-left
        transition-colors
        ${
          canChangeStatus
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-pointer'
        }
      `}
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-medium"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          {issue.id}
        </span>

        <PriorityBadge
          priority={issue.priority}
        />
      </div>

      <p
        className="mt-2 text-sm font-medium leading-snug"
        style={{
          color: 'var(--text-primary)',
        }}
      >
        {issue.title}
      </p>

      {showEmployee && issue.employee && (
        <p
          className="mt-1 text-xs"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          {issue.employee.name}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[11px]"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          {issue.hasAttachment && (
            <Paperclip size={12} />
          )}

          {issue.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare size={12} />
              {issue.commentCount}
            </span>
          )}

          <span>
            {timeAgo(issue.createdAt)}
          </span>
        </div>

        {issue.technician ? (
          <UserAvatar
            name={issue.technician.name}
            size="sm"
          />
        ) : (
          <span
            className="text-[11px]"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            Unassigned
          </span>
        )}
      </div>
    </div>
  );
}