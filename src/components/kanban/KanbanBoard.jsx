import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { issueService } from '../../services/api/issueService';

import { STATUSES, STATUS_LABELS } from '../../mock/issues';

export default function KanbanBoard({
  issues = [],
  setIssues,
  basePath = '/employee/problems',
  showEmployee = false,

  /*
   * IMPORTANT:
   * undefined = automatically determine permission from logged-in user.
   *
   * TECHNICIAN / ADMIN -> draggable
   * EMPLOYEE -> read-only
   *
   * Explicit true/false still works when a page wants to override it.
   */
  canChangeStatus,
}) {
  const navigate = useNavigate();

  const pushToast = useUiStore((s) => s.pushToast);
  const currentUser = useAuthStore((s) => s.user);

  const [draggedId, setDraggedId] = useState(null);

  /*
   * -------------------------------------------------------
   * STATUS CHANGE PERMISSION
   * -------------------------------------------------------
   */

  const userRole = String(
    currentUser?.role ||
      currentUser?.user_role ||
      ''
  ).toUpperCase();

  const roleCanChangeStatus =
    userRole === 'TECHNICIAN' ||
    userRole === 'ADMIN';

  /*
   * If the parent explicitly supplied canChangeStatus,
   * respect it.
   *
   * Otherwise determine it from the logged-in role.
   */
  const statusChangeAllowed =
    typeof canChangeStatus === 'boolean'
      ? canChangeStatus
      : roleCanChangeStatus;

  /*
   * -------------------------------------------------------
   * DRAG START
   * -------------------------------------------------------
   */

  function handleDragStart(event, issueId) {
    if (!statusChangeAllowed) {
      return;
    }

    setDraggedId(issueId);

    /*
     * Required by some browsers for reliable HTML5 drag/drop.
     */
    try {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(
        'text/plain',
        String(issueId)
      );
    } catch {
      // Ignore browsers that do not expose dataTransfer.
    }
  }

  /*
   * -------------------------------------------------------
   * DRAG END
   * -------------------------------------------------------
   */

  function handleDragEnd() {
    setDraggedId(null);
  }

  /*
   * -------------------------------------------------------
   * DROP
   * -------------------------------------------------------
   */

  async function handleDrop(status) {
    if (!statusChangeAllowed) {
      setDraggedId(null);
      return;
    }

    if (!draggedId) {
      return;
    }

    const movedIssue = issues.find(
      (issue) => String(issue.id) === String(draggedId)
    );

    if (!movedIssue) {
      setDraggedId(null);
      return;
    }

    /*
     * Do nothing when dropped into the same column.
     */
    if (movedIssue.status === status) {
      setDraggedId(null);
      return;
    }

    const issueId = movedIssue.id;
    const previousStatus = movedIssue.status;

    /*
     * Clear drag state immediately.
     */
    setDraggedId(null);

    /*
     * -----------------------------------------------------
     * OPTIMISTIC UI UPDATE
     * -----------------------------------------------------
     */

    setIssues((previousIssues) =>
      previousIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status,
            }
          : issue
      )
    );

    try {
      /*
       * ---------------------------------------------------
       * REAL BACKEND UPDATE
       * ---------------------------------------------------
       *
       * PATCH /issues/{issue_id}
       * {
       *   status: "QUEUED"
       * }
       */

      const updatedIssue =
        await issueService.updateStatus(
          issueId,
          status
        );

      /*
       * Backend response is the final source of truth.
       */
      setIssues((previousIssues) =>
        previousIssues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                ...updatedIssue,
                status: updatedIssue.status,
              }
            : issue
        )
      );

      pushToast({
        type: 'success',
        title: 'Issue status updated',
        message: `${issueId} moved to ${STATUS_LABELS[updatedIssue.status] || updatedIssue.status}.`,
      });
    } catch (error) {
      /*
       * ---------------------------------------------------
       * ROLLBACK
       * ---------------------------------------------------
       */

      setIssues((previousIssues) =>
        previousIssues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: previousStatus,
              }
            : issue
        )
      );

      console.error(
        'Kanban status update failed:',
        error
      );

      pushToast({
        type: 'error',
        title: 'Status update failed',
        message:
          error?.message ||
          'The server rejected the status change.',
      });
    }
  }

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {STATUSES.map((status) => {
        const columnIssues = issues.filter(
          (issue) => issue.status === status
        );

        return (
          <KanbanColumn
            key={status}
            title={STATUS_LABELS[status]}
            count={columnIssues.length}
            onDragOver={
              statusChangeAllowed
                ? (event) => {
                    event.preventDefault();

                    try {
                      event.dataTransfer.dropEffect =
                        'move';
                    } catch {
                      // Ignore unsupported dataTransfer APIs.
                    }
                  }
                : undefined
            }
            onDrop={
              statusChangeAllowed
                ? (event) => {
                    event.preventDefault();
                    void handleDrop(status);
                  }
                : undefined
            }
          >
            {columnIssues.length === 0 ? (
              <p
                className="px-1 py-6 text-center text-xs"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                No issues
              </p>
            ) : (
              columnIssues.map((issue) => (
                <KanbanCard
                  key={issue.id}
                  issue={issue}
                  showEmployee={showEmployee}
                  canChangeStatus={
                    statusChangeAllowed
                  }
                  onDragStart={
                    handleDragStart
                  }
                  onDragEnd={
                    handleDragEnd
                  }
                  onClick={() =>
                    navigate(
                      `${basePath}/${issue.id}`
                    )
                  }
                />
              ))
            )}
          </KanbanColumn>
        );
      })}
    </div>
  );
}