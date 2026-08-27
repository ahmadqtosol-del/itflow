import { apiClient } from './client';

/*
 * ---------------------------------------------------------
 * BACKEND -> FRONTEND ISSUE ADAPTER
 * ---------------------------------------------------------
 */
function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 0) {
    return null;
  }
  const totalMins = Math.round(minutes);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}


function adaptIssue(issue) {
  if (!issue) {
    return null;
  }

  return {
    ...issue,

    id: issue.id,

    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority,
    status: issue.status,

    device: issue.device ?? null,
    location: issue.location ?? null,
    department: issue.department ?? null,

    createdAt:
      issue.created_at ??
      issue.createdAt ??
      null,

    updatedAt:
      issue.updated_at ??
      issue.updatedAt ??
      null,

        resolvedAt:
      issue.resolved_at ??
      issue.resolvedAt ??
      null,

    resolutionTime: (() => {
      const created = issue.created_at ?? issue.createdAt ?? null;
      const resolved = issue.resolved_at ?? issue.resolvedAt ?? null;
      if (!created || !resolved) return null;
      const minutes = (new Date(resolved) - new Date(created)) / 60000;
      return formatDuration(minutes);
    })(),

    rootCause:
      issue.root_cause ??
      issue.rootCause ??
      null,

    resolution:
      issue.resolution ??
      issue.resolution ??
      null,

    timeSpentMinutes:
      issue.time_spent_minutes ??
      issue.timeSpentMinutes ??
      null,

    employeeRating:
      issue.employee_rating ??
      issue.employeeRating ??
      null,

    employeeFeedback:
      issue.employee_feedback ??
      issue.employeeFeedback ??
      null,

    hasAttachment: Boolean(
      issue.has_attachment ??
        issue.hasAttachment ??
        (
          Array.isArray(issue.attachments) &&
          issue.attachments.length > 0
        )
    ),

    employee:
      issue.employee ?? null,

    technician:
      issue.technician ?? null,

    timeline: Array.isArray(issue.timeline)
      ? issue.timeline.map((event) =>
          typeof event === 'string'
            ? event
            : event?.label || ''
        )
      : Array.isArray(issue.timeline_events)
        ? issue.timeline_events.map(
            (event) =>
              typeof event === 'string'
                ? event
                : event?.label || ''
          )
        : [],

    comments: Array.isArray(issue.comments)
      ? issue.comments.map((comment) => ({
          id: comment.id,

          text:
            comment.body ??
            comment.text ??
            '',

          body:
            comment.body ??
            comment.text ??
            '',

          from:
            comment.author_id ===
            issue.employee?.id
              ? 'employee'
              : 'agent',

          authorId:
            comment.author_id ??
            comment.authorId ??
            null,

          authorName:
            comment.author_name ??
            comment.authorName ??
            null,

          time:
            comment.created_at ??
            comment.time ??
            null,

          createdAt:
            comment.created_at ??
            comment.createdAt ??
            null,

          read: Boolean(comment.read),
        }))
      : [],

    attachments: Array.isArray(
      issue.attachments
    )
      ? issue.attachments.map(
          (attachment) => ({
            ...attachment,

            id: attachment.id,

            issueId:
              attachment.issue_id ??
              attachment.issueId ??
              issue.id,

            uploadedById:
              attachment.uploaded_by_id ??
              attachment.uploaded_by ??
              attachment.uploadedById ??
              null,

            originalFilename:
              attachment.original_filename ??
              attachment.originalFilename ??
              '',

            storedFilename:
              attachment.stored_filename ??
              attachment.storedFilename ??
              '',

            filePath:
              attachment.file_path ??
              attachment.filePath ??
              '',

            contentType:
              attachment.content_type ??
              attachment.contentType ??
              null,

            fileSize:
              attachment.file_size ??
              attachment.fileSize ??
              null,

            attachmentType:
              attachment.attachment_type ??
              attachment.attachmentType ??
              'file',

            createdAt:
              attachment.created_at ??
              attachment.createdAt ??
              null,

            url:
              attachment.url ?? null,
          })
        )
      : [],
  };
}

/*
 * ---------------------------------------------------------
 * VALID STATUS VALUES
 * ---------------------------------------------------------
 */

export const STATUSES = [
  'NEW',
  'QUEUED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING',
  'RESOLVED',
  'CLOSED',
];

export const STATUS_LABELS = {
  NEW: 'New',
  QUEUED: 'Queued',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const VALID_STATUS_SET = new Set(
  STATUSES
);

/*
 * ---------------------------------------------------------
 * ISSUE SERVICE
 * ---------------------------------------------------------
 */

export const issueService = {
  async list(filters = {}) {
    const params = new URLSearchParams();

    if (filters.status) {
      params.append(
        'status',
        filters.status
      );
    }

    if (filters.priority) {
      params.append(
        'priority',
        filters.priority
      );
    }

    if (filters.search) {
      params.append(
        'search',
        filters.search
      );
    }

    if (filters.mine) {
      params.append(
        'mine',
        'true'
      );
    }

    const query = params.toString()
      ? `?${params.toString()}`
      : '';

    const response =
      await apiClient.get(
        `/issues${query}`
      );

    let list = Array.isArray(response)
      ? response
          .map(adaptIssue)
          .filter(Boolean)
      : [];

    if (filters.employeeId) {
      list = list.filter(
        (issue) =>
          issue.employee?.id ===
          filters.employeeId
      );
    }

    return list;
  },

  async get(id) {
    if (!id) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    const response =
      await apiClient.get(
        `/issues/${id}`
      );

    return adaptIssue(response);
  },

  async create(payload) {
    if (!payload?.title?.trim()) {
      throw new Error(
        'Issue title is required.'
      );
    }

    if (!payload?.description?.trim()) {
      throw new Error(
        'Issue description is required.'
      );
    }

    const response =
      await apiClient.post(
        '/issues',
        {
          title:
            payload.title.trim(),

          description:
            payload.description.trim(),

          category:
            payload.category ||
            'General',

          priority:
            payload.priority ||
            'MEDIUM',

          device:
            payload.device?.trim() ||
            null,

          location:
            payload.location?.trim() ||
            null,

          department:
            payload.department?.trim() ||
            null,
        }
      );

    return adaptIssue(response);
  },

  /*
   * -------------------------------------------------------
   * UPDATE STATUS
   * -------------------------------------------------------
   *
   * Technician/Admin:
   *
   *   PATCH /issues/IT-107
   *
   *   {
   *     "status": "QUEUED"
   *   }
   *
   * The backend response MUST contain the same status.
   * Otherwise the operation is treated as failed.
   */

  async updateStatus(
    issueId,
    newStatus
  ) {
    if (!issueId) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    if (!newStatus) {
      throw new Error(
        'Issue status is required.'
      );
    }

    const status = String(
      newStatus
    ).toUpperCase();

    if (!VALID_STATUS_SET.has(status)) {
      throw new Error(
        `Invalid issue status: ${status}`
      );
    }

    const response =
      await apiClient.patch(
        `/issues/${encodeURIComponent(issueId)}`,
        {
          status,
        }
      );

    if (!response) {
      throw new Error(
        'The server returned an empty response.'
      );
    }

    const updatedIssue =
      adaptIssue(response);

    if (!updatedIssue) {
      throw new Error(
        'The server returned an invalid issue response.'
      );
    }

    const returnedStatus =
      String(
        updatedIssue.status || ''
      ).toUpperCase();

    if (returnedStatus !== status) {
      throw new Error(
        `Issue status was not updated. Expected "${status}" but received "${returnedStatus || 'EMPTY'}".`
      );
    }

    return {
      ...updatedIssue,
      status: returnedStatus,
    };
  },

  async update(
    issueId,
    payload
  ) {
    if (!issueId) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    const response =
      await apiClient.patch(
        `/issues/${encodeURIComponent(issueId)}`,
        payload
      );

    return adaptIssue(response);
  },

  async rate(
    issueId,
    rating,
    feedback = ''
  ) {
    if (!issueId) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    const response =
      await apiClient.post(
        `/issues/${encodeURIComponent(issueId)}/rate`,
        {
          rating,
          feedback,
        }
      );

    return adaptIssue(response);
  },

  async addComment(
    issueId,
    body
  ) {
    if (!issueId) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    const trimmedBody =
      String(body || '').trim();

    if (!trimmedBody) {
      throw new Error(
        'Comment cannot be empty.'
      );
    }

    const response =
      await apiClient.post(
        `/issues/${encodeURIComponent(issueId)}/comments`,
        {
          body: trimmedBody,
        }
      );

    return {
      ...response,

      id: response.id,

      text:
        response.body ??
        response.text ??
        '',

      body:
        response.body ??
        response.text ??
        '',

      authorId:
        response.author_id ??
        response.authorId ??
        null,

      authorName:
        response.author_name ??
        response.authorName ??
        null,

      time:
        response.created_at ??
        response.time ??
        null,

      createdAt:
        response.created_at ??
        response.createdAt ??
        null,
    };
  },

  async uploadAttachment(
    issueId,
    file,
    attachmentType = 'file'
  ) {
    if (!issueId) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    if (!file) {
      throw new Error(
        'File is required.'
      );
    }

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    formData.append(
      'attachment_type',
      attachmentType
    );

    return apiClient.post(
      `/issues/${encodeURIComponent(issueId)}/attachments`,
      formData
    );
  },
};