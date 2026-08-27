import {
  useState,
  useEffect,
  useRef,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
} from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader';
import { PriorityBadge } from '../../components/common/Badge';

import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';

import { issueService } from '../../services/api/issueService';

import { PRIORITIES } from '../../mock/issues';

const SLA = {
  LOW: '24 hours',
  MEDIUM: '8 hours',
  HIGH: '2 hours',
  CRITICAL: '30 minutes',
};

export default function ReportProblem() {
  const navigate = useNavigate();

  const pushToast = useUiStore(
    (state) => state.pushToast
  );

  const {
    categories,
    fetchCategories,
  } = useSettingsStore();

  const fileInputRef =
    useRef(null);

  const screenshotInputRef =
    useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: 'MEDIUM',
    description: '',
    department: '',
    device: '',
    location: '',
  });

  const [attachments, setAttachments] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (
      categories.length > 0 &&
      !form.category
    ) {
      setForm((current) => ({
        ...current,
        category:
          categories[0].name,
      }));
    }
  }, [
    categories,
    form.category,
  ]);

  function update(
    key,
    value
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleFileButtonClick() {
    if (submitting) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleScreenshotButtonClick() {
    if (submitting) {
      return;
    }

    screenshotInputRef.current?.click();
  }

  function addFiles(
    files,
    attachmentType
  ) {
    const selectedFiles =
      Array.from(files || []);

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const newAttachments =
      selectedFiles.map(
        (file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,

          file,

          attachmentType,
        })
      );

    setAttachments(
      (current) => [
        ...current,
        ...newAttachments,
      ]
    );
  }

  function handleFileChange(
    event
  ) {
    addFiles(
      event.target.files,
      'file'
    );

    event.target.value = '';
  }

  function handleScreenshotChange(
    event
  ) {
    addFiles(
      event.target.files,
      'screenshot'
    );

    event.target.value = '';
  }

  function removeAttachment(id) {
    setAttachments(
      (current) =>
        current.filter(
          (attachment) =>
            attachment.id !== id
        )
    );
  }

  async function submit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    if (!title) {
      pushToast({
        type: 'error',
        title: 'Missing title',
        message:
          'Please enter an issue title.',
      });

      return;
    }

    if (!description) {
      pushToast({
        type: 'error',
        title:
          'Missing description',
        message:
          'Please describe the problem.',
      });

      return;
    }

    if (!form.category) {
      pushToast({
        type: 'error',
        title:
          'Missing category',
        message:
          'Please select a category.',
      });

      return;
    }

    setSubmitting(true);

    try {
      /*
       * STEP 1:
       * Create the issue.
       */
      const created =
        await issueService.create({
          ...form,
          title,
          description,
        });

      if (!created?.id) {
        throw new Error(
          'The server created the issue but did not return an issue ID.'
        );
      }

      /*
       * STEP 2:
       * Upload each attachment after the issue exists.
       */
      const uploadErrors = [];

      for (
        const attachment of attachments
      ) {
        try {
          await issueService.uploadAttachment(
            created.id,
            attachment.file,
            attachment.attachmentType
          );
        } catch (uploadError) {
          console.error(
            'Attachment upload failed:',
            uploadError
          );

          uploadErrors.push(
            attachment.file.name
          );
        }
      }

      if (
        uploadErrors.length > 0
      ) {
        pushToast({
          type: 'warning',
          title:
            'Issue submitted with attachment warning',
          message:
            `${created.id} was created, but ${uploadErrors.length} attachment(s) could not be uploaded.`,
        });
      } else {
        pushToast({
          type: 'success',
          title: 'Issue submitted',
          message:
            `${created.id} was created — our team will respond shortly.`,
        });
      }

      setAttachments([]);

      setForm({
        title: '',
        category:
          categories[0]?.name || '',
        priority: 'MEDIUM',
        description: '',
        department: '',
        device: '',
        location: '',
      });

      navigate(
        '/employee/problems'
      );
    } catch (error) {
      console.error(
        'Failed to submit issue:',
        error
      );

      pushToast({
        type: 'error',
        title:
          'Issue submission failed',
        message:
          error?.message ||
          'Unable to submit the issue. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Report a Problem"
        subtitle="Tell us what is wrong and our IT team will help you."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-[var(--radius-lg)] border p-5"
          style={{
            borderColor:
              'var(--border)',
            background:
              'var(--bg-surface)',
          }}
        >
          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Issue Title
            </label>

            <input
              required
              disabled={submitting}
              value={form.title}
              onChange={(event) =>
                update(
                  'title',
                  event.target.value
                )
              }
              placeholder="e.g. Cannot connect to office Wi-Fi"
              className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              style={{
                background:
                  'var(--bg-elevated)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Category
              </label>

              <select
                required
                disabled={submitting}
                value={form.category}
                onChange={(event) =>
                  update(
                    'category',
                    event.target.value
                  )
                }
                className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                style={{
                  background:
                    'var(--bg-elevated)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-primary)',
                }}
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={
                        category.name
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Department
              </label>

              <input
                disabled={submitting}
                value={
                  form.department
                }
                onChange={(event) =>
                  update(
                    'department',
                    event.target.value
                  )
                }
                placeholder="e.g. Finance"
                className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                style={{
                  background:
                    'var(--bg-elevated)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Priority
            </label>

            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map(
                (priority) => (
                  <button
                    type="button"
                    key={priority}
                    onClick={() =>
                      update(
                        'priority',
                        priority
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="focus-ring rounded-[var(--radius-md)] border px-2 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor:
                        form.priority ===
                        priority
                          ? priority ===
                            'CRITICAL'
                            ? 'var(--critical)'
                            : 'var(--accent)'
                          : 'var(--border)',

                      background:
                        form.priority ===
                        priority
                          ? priority ===
                            'CRITICAL'
                            ? 'var(--critical-soft)'
                            : 'var(--accent-soft)'
                          : 'var(--bg-elevated)',

                      color:
                        form.priority ===
                        priority
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {priority
                      .charAt(0)
                      .toUpperCase() +
                      priority
                        .slice(1)
                        .toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              Description
            </label>

            <textarea
              required
              disabled={submitting}
              rows={5}
              value={
                form.description
              }
              onChange={(event) =>
                update(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe what's happening, when it started, and any error messages you see."
              className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              style={{
                background:
                  'var(--bg-elevated)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Device / Computer Name
              </label>

              <input
                disabled={submitting}
                value={form.device}
                onChange={(event) =>
                  update(
                    'device',
                    event.target.value
                  )
                }
                placeholder="e.g. LAPTOP-FIN-014"
                className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                style={{
                  background:
                    'var(--bg-elevated)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Location
              </label>

              <input
                disabled={submitting}
                value={form.location}
                onChange={(event) =>
                  update(
                    'location',
                    event.target.value
                  )
                }
                placeholder="e.g. Floor 3, Finance Wing"
                className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                style={{
                  background:
                    'var(--bg-elevated)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={
              handleFileChange
            }
          />

          <input
            ref={screenshotInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={
              handleScreenshotChange
            }
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={
                handleFileButtonClick
              }
              disabled={submitting}
              className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border py-2.5 text-xs font-medium transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-secondary)',
              }}
            >
              <Paperclip size={14} />
              Attach file
            </button>

            <button
              type="button"
              onClick={
                handleScreenshotButtonClick
              }
              disabled={submitting}
              className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border py-2.5 text-xs font-medium transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-secondary)',
              }}
            >
              <ImageIcon size={14} />
              Add screenshot
            </button>
          </div>

          {attachments.length > 0 && (
            <div
              className="space-y-2 rounded-[var(--radius-md)] border p-3"
              style={{
                borderColor:
                  'var(--border)',
                background:
                  'var(--bg-elevated)',
              }}
            >
              <p
                className="text-xs font-medium"
                style={{
                  color:
                    'var(--text-secondary)',
                }}
              >
                Selected attachments (
                {attachments.length})
              </p>

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
                        'var(--bg-surface)',
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {attachment.attachmentType ===
                      'screenshot' ? (
                        <ImageIcon
                          size={15}
                          style={{
                            color:
                              'var(--accent)',
                          }}
                        />
                      ) : (
                        <FileText
                          size={15}
                          style={{
                            color:
                              'var(--accent)',
                          }}
                        />
                      )}

                      <div className="min-w-0">
                        <p
                          className="truncate text-xs font-medium"
                          style={{
                            color:
                              'var(--text-primary)',
                          }}
                        >
                          {
                            attachment.file
                              .name
                          }
                        </p>

                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          {formatFileSize(
                            attachment.file
                              .size
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeAttachment(
                          attachment.id
                        )
                      }
                      disabled={
                        submitting
                      }
                      className="focus-ring shrink-0 rounded p-1 disabled:opacity-50"
                      aria-label={`Remove ${attachment.file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-[var(--radius-md)] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:
                'var(--accent)',
            }}
          >
            {submitting
              ? 'Submitting…'
              : 'Submit Issue'}
          </button>
        </form>

        <aside
          className="h-fit rounded-[var(--radius-lg)] border p-5"
          style={{
            borderColor:
              'var(--border)',
            background:
              'var(--bg-surface)',
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Issue Preview
          </h3>

          <p
            className="text-sm font-medium"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            {form.title ||
              'Your issue title will appear here'}
          </p>

          <div className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Priority
              </span>

              <PriorityBadge
                priority={
                  form.priority
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Category
              </span>

              <span
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {form.category ||
                  '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                Expected Response
              </span>

              <span
                style={{
                  color:
                    'var(--text-primary)',
                }}
              >
                {
                  SLA[
                    form.priority
                  ]
                }
              </span>
            </div>

            {attachments.length >
              0 && (
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  Attachments
                </span>

                <span
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {attachments.length}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 B';
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