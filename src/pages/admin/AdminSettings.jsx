import { useEffect, useState } from 'react';

import {
  User,
  Bell,
  Palette,
  ShieldCheck,
  Tag,
  Building2,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader';
import UserAvatar from '../../components/common/UserAvatar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';

// ─── Sidebar nav sections ─────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'sla', label: 'SLA Rules', icon: ShieldCheck },
  { key: 'categories', label: 'Issue Categories', icon: Tag },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'priority', label: 'Priority Configuration', icon: SlidersHorizontal },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label
      className="mb-1 block text-xs font-medium"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
    />
  );
}

function ActionBtn({ onClick, title, icon: Icon, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="focus-ring rounded p-1 transition-colors"
      style={{
        color: danger ? 'var(--critical)' : 'var(--text-muted)',
      }}
    >
      <Icon size={14} />
    </button>
  );
}

/**
 * Buttons rendered INSIDE the <form> so type="submit" actually fires onSubmit.
 */
function FormFooter({ onCancel, saving, saveLabel = 'Save' }) {
  return (
    <div
      className="flex justify-end gap-2 border-t px-5 py-4"
      style={{ borderColor: 'var(--border)' }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium"
        style={{
          background: 'var(--bg-elevated-hover)',
          color: 'var(--text-secondary)',
        }}
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="focus-ring flex items-center gap-1.5 rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        style={{ background: 'var(--accent)' }}
      >
        {saving && <Loader2 size={13} className="animate-spin" />}
        {saving ? 'Saving…' : saveLabel}
      </button>
    </div>
  );
}

function SectionAddBtn({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-medium"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      <Plus size={13} /> {label}
    </button>
  );
}

// ─── IMPORTANT FIX ────────────────────────────────────────────────────────────
// These form components MUST stay outside SLASection/CategoriesSection/
// DepartmentsSection.
//
// Previously they were declared inside those components. Every keystroke
// changed parent state, which recreated the child component type, causing
// React to remount the input and lose focus.
//
// Keeping them at module scope preserves the component identity and therefore
// preserves focus while typing.

function SLAForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  isEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className="space-y-3 px-5 py-4">
        <div>
          <FieldLabel>Priority Label *</FieldLabel>
          <TextInput
            value={form.priority}
            onChange={onChange('priority')}
            placeholder="e.g. Critical"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Response Target *</FieldLabel>
            <TextInput
              value={form.response_target}
              onChange={onChange('response_target')}
              placeholder="e.g. 15 min"
              required
            />
          </div>

          <div>
            <FieldLabel>Resolution Target *</FieldLabel>
            <TextInput
              value={form.resolution_target}
              onChange={onChange('resolution_target')}
              placeholder="e.g. 30 min"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Response (minutes)</FieldLabel>
            <TextInput
              type="number"
              value={form.response_minutes}
              onChange={onChange('response_minutes')}
              placeholder="15"
            />
          </div>

          <div>
            <FieldLabel>Resolution (minutes)</FieldLabel>
            <TextInput
              type="number"
              value={form.resolution_minutes}
              onChange={onChange('resolution_minutes')}
              placeholder="30"
            />
          </div>
        </div>
      </div>

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Create Rule'}
      />
    </form>
  );
}

function CatForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  isEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className="space-y-3 px-5 py-4">
        <div>
          <FieldLabel>Category Name *</FieldLabel>
          <TextInput
            value={form.name}
            onChange={onChange('name')}
            placeholder="e.g. Cloud Infrastructure"
            required
          />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>

          <textarea
            value={form.description}
            onChange={(e) => onChange('description')(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Create Category'}
      />
    </form>
  );
}

function DeptForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  isEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className="space-y-3 px-5 py-4">
        <div>
          <FieldLabel>Department Name *</FieldLabel>
          <TextInput
            value={form.name}
            onChange={onChange('name')}
            placeholder="e.g. Engineering"
            required
          />
        </div>

        <div>
          <FieldLabel>Department Code</FieldLabel>
          <TextInput
            value={form.code}
            onChange={onChange('code')}
            placeholder="e.g. ENG"
          />
        </div>
      </div>

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        saveLabel={isEdit ? 'Save Changes' : 'Create Department'}
      />
    </form>
  );
}

// ─── SLA Rules Section ────────────────────────────────────────────────────────

function SLASection() {
  const {
    slaRules,
    slaLoading,
    slaError,
    fetchSlaRules,
    createSlaRule,
    updateSlaRule,
    deleteSlaRule,
  } = useSettingsStore();

  const pushToast = useUiStore((s) => s.pushToast);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY = {
    priority: '',
    response_target: '',
    resolution_target: '',
    response_minutes: '',
    resolution_minutes: '',
  };

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    fetchSlaRules();
  }, []);

  function openAdd() {
    setForm(EMPTY);
    setAddOpen(true);
  }

  function openEdit(r) {
    setForm({
      priority: r.priority,
      response_target: r.response_target,
      resolution_target: r.resolution_target,
      response_minutes: r.response_minutes ?? '',
      resolution_minutes: r.resolution_minutes ?? '',
    });

    setEditTarget(r);
  }

  function f(key) {
    return (val) =>
      setForm((prev) => ({
        ...prev,
        [key]: val,
      }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await createSlaRule({
        priority: form.priority,
        response_target: form.response_target,
        resolution_target: form.resolution_target,
        response_minutes: form.response_minutes
          ? parseInt(form.response_minutes, 10)
          : null,
        resolution_minutes: form.resolution_minutes
          ? parseInt(form.resolution_minutes, 10)
          : null,
      });

      pushToast({
        type: 'success',
        title: 'SLA rule created',
        message: `Rule for "${form.priority}" saved.`,
      });

      setAddOpen(false);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Save failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSlaRule(editTarget.id, {
        priority: form.priority,
        response_target: form.response_target,
        resolution_target: form.resolution_target,
        response_minutes: form.response_minutes
          ? parseInt(form.response_minutes, 10)
          : null,
        resolution_minutes: form.resolution_minutes
          ? parseInt(form.resolution_minutes, 10)
          : null,
      });

      pushToast({
        type: 'success',
        title: 'SLA rule updated',
        message: `Rule for "${form.priority}" saved.`,
      });

      setEditTarget(null);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteSlaRule(deleteTarget.id);

      pushToast({
        type: 'success',
        title: 'Deleted',
        message: `SLA rule "${deleteTarget.priority}" removed.`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Delete failed',
        message: err.message,
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (slaLoading) {
    return (
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <Loader2 size={14} className="animate-spin" />
        Loading SLA rules…
      </div>
    );
  }

  if (slaError) {
    return (
      <div
        className="text-sm"
        style={{ color: 'var(--critical)' }}
      >
        Error: {slaError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          SLA Rules
        </h3>

        <SectionAddBtn onClick={openAdd} label="Add Rule" />
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {[
              'Priority',
              'Response Target',
              'Resolution Target',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="pb-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {slaRules.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-4 text-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                No SLA rules yet.
              </td>
            </tr>
          )}

          {slaRules.map((r) => (
            <tr
              key={r.id}
              className="border-t"
              style={{ borderColor: 'var(--border-soft)' }}
            >
              <td
                className="py-2.5 font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {r.priority}
              </td>

              <td
                className="py-2.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {r.response_target}
              </td>

              <td
                className="py-2.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {r.resolution_target}
              </td>

              <td className="py-2.5">
                <div className="flex gap-1">
                  <ActionBtn
                    onClick={() => openEdit(r)}
                    title="Edit"
                    icon={Pencil}
                  />

                  <ActionBtn
                    onClick={() => setDeleteTarget(r)}
                    title="Delete"
                    icon={Trash2}
                    danger
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add SLA Rule"
      >
        <SLAForm
          form={form}
          onChange={f}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          saving={saving}
          isEdit={false}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit SLA Rule"
      >
        <SLAForm
          form={form}
          onChange={f}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
          saving={saving}
          isEdit={true}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete SLA Rule"
        description={`Delete the "${deleteTarget?.priority}" SLA rule? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

function CategoriesSection() {
  const {
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useSettingsStore();

  const pushToast = useUiStore((s) => s.pushToast);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY = {
    name: '',
    description: '',
  };

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    fetchCategories();
  }, []);

  function openAdd() {
    setForm(EMPTY);
    setAddOpen(true);
  }

  function openEdit(c) {
    setForm({
      name: c.name,
      description: c.description || '',
    });

    setEditTarget(c);
  }

  function f(key) {
    return (val) =>
      setForm((prev) => ({
        ...prev,
        [key]: val,
      }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await createCategory({
        name: form.name.trim(),
        description: form.description.trim() || null,
      });

      pushToast({
        type: 'success',
        title: 'Category created',
        message: `"${form.name}" added.`,
      });

      setAddOpen(false);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Save failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateCategory(editTarget.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });

      pushToast({
        type: 'success',
        title: 'Category updated',
        message: `"${form.name}" saved.`,
      });

      setEditTarget(null);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteCategory(deleteTarget.id);

      pushToast({
        type: 'success',
        title: 'Deleted',
        message: `Category "${deleteTarget.name}" removed.`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Cannot delete category',
        message: err.message,
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (categoriesLoading) {
    return (
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <Loader2 size={14} className="animate-spin" />
        Loading categories…
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div
        className="text-sm"
        style={{ color: 'var(--critical)' }}
      >
        Error: {categoriesError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Issue Categories
        </h3>

        <SectionAddBtn
          onClick={openAdd}
          label="Add Category"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 && (
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No categories yet.
          </p>
        )}

        {categories.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
            }}
          >
            {c.name}

            <span className="flex items-center gap-0.5">
              <ActionBtn
                onClick={() => openEdit(c)}
                title="Edit"
                icon={Pencil}
              />

              <ActionBtn
                onClick={() => setDeleteTarget(c)}
                title="Delete"
                icon={Trash2}
                danger
              />
            </span>
          </span>
        ))}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Category"
      >
        <CatForm
          form={form}
          onChange={f}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          saving={saving}
          isEdit={false}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Category"
      >
        <CatForm
          form={form}
          onChange={f}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
          saving={saving}
          isEdit={true}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"? This is blocked if any issues currently reference this category.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Departments Section ──────────────────────────────────────────────────────

function DepartmentsSection() {
  const {
    departments,
    departmentsLoading,
    departmentsError,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useSettingsStore();

  const pushToast = useUiStore((s) => s.pushToast);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY = {
    name: '',
    code: '',
  };

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    fetchDepartments();
  }, []);

  function openAdd() {
    setForm(EMPTY);
    setAddOpen(true);
  }

  function openEdit(d) {
    setForm({
      name: d.name,
      code: d.code || '',
    });

    setEditTarget(d);
  }

  function f(key) {
    return (val) =>
      setForm((prev) => ({
        ...prev,
        [key]: val,
      }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await createDepartment({
        name: form.name.trim(),
        code: form.code.trim() || null,
      });

      pushToast({
        type: 'success',
        title: 'Department created',
        message: `"${form.name}" added.`,
      });

      setAddOpen(false);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Save failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDepartment(editTarget.id, {
        name: form.name.trim(),
        code: form.code.trim() || null,
      });

      pushToast({
        type: 'success',
        title: 'Department updated',
        message: `"${form.name}" saved.`,
      });

      setEditTarget(null);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteDepartment(deleteTarget.id);

      pushToast({
        type: 'success',
        title: 'Deleted',
        message: `Department "${deleteTarget.name}" removed.`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Cannot delete department',
        message: err.message,
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (departmentsLoading) {
    return (
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <Loader2 size={14} className="animate-spin" />
        Loading departments…
      </div>
    );
  }

  if (departmentsError) {
    return (
      <div
        className="text-sm"
        style={{ color: 'var(--critical)' }}
      >
        Error: {departmentsError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Departments
        </h3>

        <SectionAddBtn
          onClick={openAdd}
          label="Add Department"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {departments.length === 0 && (
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No departments yet.
          </p>
        )}

        {departments.map((d) => (
          <span
            key={d.id}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
            }}
          >
            {d.name}
            {d.code ? ` (${d.code})` : ''}

            <span className="flex items-center gap-0.5">
              <ActionBtn
                onClick={() => openEdit(d)}
                title="Edit"
                icon={Pencil}
              />

              <ActionBtn
                onClick={() => setDeleteTarget(d)}
                title="Delete"
                icon={Trash2}
                danger
              />
            </span>
          </span>
        ))}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Department"
      >
        <DeptForm
          form={form}
          onChange={f}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          saving={saving}
          isEdit={false}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Department"
      >
        <DeptForm
          form={form}
          onChange={f}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
          saving={saving}
          isEdit={true}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        description={`Delete "${deleteTarget?.name}"? This is blocked if any employees are assigned to this department.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [section, setSection] = useState('profile');

  const user = useAuthStore((s) => s.user);

  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure organization-wide IT support settings."
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className="focus-ring flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm"
              style={{
                background:
                  section === s.key
                    ? 'var(--accent-soft)'
                    : 'transparent',
                color:
                  section === s.key
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
              }}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div
          className="rounded-[var(--radius-lg)] border p-6"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-surface)',
          }}
        >
          {section === 'profile' && (
            <div className="flex items-center gap-4">
              <UserAvatar
                name={user.name}
                color={user.avatarColor}
                size="lg"
              />

              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user.name}
                </p>

                <p
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user.email}
                </p>

                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {user.department}
                </p>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div
              className="space-y-3 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {[
                'New issue alerts',
                'Critical issue alerts',
                'Daily summary email',
                'SLA breach warnings',
              ].map((l) => (
                <label
                  key={l}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {l}

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
              ))}
            </div>
          )}

          {section === 'appearance' && (
            <div className="flex gap-3">
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className="focus-ring flex-1 rounded-[var(--radius-md)] border py-4 text-sm font-medium capitalize"
                  style={{
                    borderColor:
                      theme === t
                        ? 'var(--accent)'
                        : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t} theme
                </button>
              ))}
            </div>
          )}

          {section === 'sla' && <SLASection />}

          {section === 'categories' && <CategoriesSection />}

          {section === 'departments' && <DepartmentsSection />}

          {section === 'priority' && (
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Priority weighting and escalation rules will be configurable
              in a future update.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}