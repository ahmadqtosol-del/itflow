import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  Paperclip,
  Download,
} from 'lucide-react';

import {
  PriorityBadge,
  StatusBadge,
} from '../../components/common/Badge';

import Timeline from '../../components/common/Timeline';

import MessageList from '../../components/messages/MessageList';
import MessageComposer from '../../components/messages/MessageComposer';

import LoadingState from '../../components/common/LoadingState';

import { issueService } from '../../services/api/issueService';

import { shortDate } from '../../utils/format';

import { useAuthStore } from '../../store/authStore';

const FIELDS = [
  [
    'employee',
    (issue) =>
      issue.employee?.name || '—',
  ],

  [
    'department',
    (issue) =>
      issue.employee?.department ||
      issue.department ||
      '—',
  ],

  [
    'category',
    (issue) =>
      issue.category || '—',
  ],

  [
    'assigned technician',
    (issue) =>
      issue.technician?.name ||
      'Unassigned',
  ],

  [
    'created',
    (issue) =>
      shortDate(issue.createdAt),
  ],

  [
    'last updated',
    (issue) =>
      shortDate(issue.updatedAt),
  ],

  [
    'response time',
    (issue) =>
      issue.responseTime || '—',
  ],

  [
    'resolution time',
    (issue) =>
      issue.resolutionTime || '—',
  ],
];

function formatFileSize(bytes) {
  if (!bytes) {
    return '';
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const size =
    bytes /
    Math.pow(1024, index);

  return `${size.toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  async function loadIssue() {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await issueService.get(id);

      setIssue(result);
    } catch (loadError) {
      console.error(
        'Failed to load issue:',
        loadError
      );

      setError(
        loadError?.message ||
          'Unable to load issue.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssue();
  }, [id]);

  async function handleSendMessage(text) {
    if (!text?.trim()) {
      return;
    }

    try {
      await issueService.addComment(
        id,
        text
      );

      await loadIssue();
    } catch (sendError) {
      console.error(
        'Failed to send message:',
        sendError
      );
    }
  }

  async function handleDownloadAttachment(attachment) {
    if (!attachment?.url) {
      return;
    }

    const { user, token } = useAuthStore.getState();

    try {
      const response = await fetch(
        attachment.url,
        {
          headers: {
            ...(user?.email
              ? {
                  'X-Dev-User-Email':
                    user.email,
                }
              : {}),
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to download attachment (${response.status})`
        );
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = blobUrl;

      link.download =
        attachment.originalFilename ||
        attachment.original_filename ||
        'attachment';

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error(
        'Failed to download attachment:',
        downloadError
      );
    }
  }

  if (loading) {
    return <LoadingState rows={6} />;
  }

  if (error || !issue) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="focus-ring flex items-center gap-1.5 text-xs font-medium"
          style={{
            color:
              'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div
          className="rounded-[var(--radius-lg)] border p-5"
          style={{
            borderColor:
              'var(--border)',
            background:
              'var(--bg-surface)',
          }}
        >
          <p
            className="text-sm"
            style={{
              color:
                'var(--text-secondary)',
            }}
          >
            {error ||
              'Issue not found.'}
          </p>
        </div>
      </div>
    );
  }

  const messages =
    issue.comments || [];

  const attachments =
    issue.attachments || [];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="focus-ring mb-4 flex items-center gap-1.5 text-xs font-medium"
        style={{
          color:
            'var(--text-secondary)',
        }}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-medium"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {issue.id}
          </p>

          <h1
            className="mt-0.5 text-xl font-semibold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {issue.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={issue.status}
          />

          <PriorityBadge
            priority={issue.priority}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <section
            className="rounded-[var(--radius-lg)] border p-5"
            style={{
              borderColor:
                'var(--border)',
              background:
                'var(--bg-surface)',
            }}
          >
            <h2
              className="mb-3 text-sm font-semibold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Problem Description
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              {issue.description}
            </p>
          </section>

          {attachments.length > 0 && (
            <section
              className="rounded-[var(--radius-lg)] border p-5"
              style={{
                borderColor:
                  'var(--border)',
                background:
                  'var(--bg-surface)',
              }}
            >
              <h2
                className="mb-4 text-sm font-semibold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Attachments
              </h2>

              <div className="space-y-2">
                {attachments.map(
                  (attachment) => (
                    <div
                      key={
                        attachment.id
                      }
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-2"
                      style={{
                        borderColor:
                          'var(--border-soft)',
                        background:
                          'var(--bg-elevated)',
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Paperclip
                          size={15}
                          style={{
                            color:
                              'var(--accent)',
                          }}
                        />

                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-medium"
                            style={{
                              color:
                                'var(--text-primary)',
                            }}
                          >
                            {attachment.originalFilename ||
                              attachment.original_filename ||
                              'Attachment'}
                          </p>

                          {attachment.fileSize && (
                            <p
                              className="text-[11px]"
                              style={{
                                color:
                                  'var(--text-muted)',
                              }}
                            >
                              {formatFileSize(
                                attachment.fileSize
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {attachment.url && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadAttachment(
                              attachment
                            );
                          }}
                          className="focus-ring shrink-0 rounded p-1"
                          aria-label="Download attachment"
                          title="Download attachment"
                          style={{
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          <Download
                            size={15}
                          />
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          <section
            className="rounded-[var(--radius-lg)] border p-5"
            style={{
              borderColor:
                'var(--border)',
              background:
                'var(--bg-surface)',
            }}
          >
            <h2
              className="mb-4 text-sm font-semibold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Timeline
            </h2>

            <Timeline
              items={issue.timeline || []}
            />
          </section>

          {issue.resolution && (
            <section
              className="rounded-[var(--radius-lg)] border p-5"
              style={{
                borderColor:
                  'var(--low)',
                background:
                  'var(--low-soft)',
              }}
            >
              <h2
                className="mb-2 text-sm font-semibold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Resolution
              </h2>

              <p
                className="text-sm"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                <strong
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  Root cause:
                </strong>{' '}
                {issue.rootCause ||
                  '—'}
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                <strong
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  Resolution:
                </strong>{' '}
                {issue.resolution}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section
            className="rounded-[var(--radius-lg)] border p-5"
            style={{
              borderColor:
                'var(--border)',
              background:
                'var(--bg-surface)',
            }}
          >
            <h2
              className="mb-3 text-sm font-semibold"
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              Details
            </h2>

            <dl className="space-y-2.5">
              {FIELDS.map(
                ([label, get]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <dt
                      className="capitalize"
                      style={{
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      {label}
                    </dt>

                    <dd
                      className="text-right"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {get(issue)}
                    </dd>
                  </div>
                )
              )}
            </dl>
          </section>

          <section
            className="flex h-[420px] flex-col overflow-hidden rounded-[var(--radius-lg)] border"
            style={{
              borderColor:
                'var(--border)',
              background:
                'var(--bg-surface)',
            }}
          >
            <div
              className="border-b px-5 py-3"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >
              <h2
                className="text-sm font-semibold"
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                Communication
              </h2>
            </div>

            <MessageList
              messages={messages}
            />

            <MessageComposer
              onSend={handleSendMessage}
            />
          </section>
        </div>
      </div>
    </div>
  );
}