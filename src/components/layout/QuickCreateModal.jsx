import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PRIORITIES } from '../../mock/issues';
import { issueService } from '../../services/api/issueService';

export default function QuickCreateModal() {
  const open = useUiStore((s) => s.quickCreateOpen);
  const setOpen = useUiStore((s) => s.setQuickCreateOpen);
  const pushToast = useUiStore((s) => s.pushToast);
  const { categories, fetchCategories } = useSettingsStore();

  const [form, setForm] = useState({ title: '', category: '', priority: 'MEDIUM', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Load categories when modal is first opened
  useEffect(() => {
    if (open) fetchCategories();
  }, [open]);

  // Default category once categories are loaded and form is blank
  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm((f) => ({ ...f, category: categories[0].name }));
    }
  }, [categories]);

  async function submit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    const created = await issueService.create(form);
    setSubmitting(false);
    setOpen(false);
    setForm({ title: '', category: categories[0]?.name || '', priority: 'MEDIUM', description: '' });
    pushToast({ type: 'success', title: 'Issue submitted', message: `${created.id} was created` });
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="New Issue"
      footer={
        <>
          <button onClick={() => setOpen(false)} className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {submitting ? 'Submitting…' : 'Submit Issue'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Brief summary of the issue"
            className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="What's happening?"
            className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
    </Modal>
  );
}
