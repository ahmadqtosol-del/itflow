import { useEffect, useState } from 'react';
import { Eye, Pencil, Ban, Plus, Loader2, UserCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import UserAvatar from '../../components/common/UserAvatar';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { userService } from '../../services/api/userService';
import { shortDate } from '../../utils/format';

// ─── Shared helpers ─────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, required, type = 'text', disabled }) {
  return (
    <input
      type={type}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm disabled:opacity-60"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  );
}

function SelectInput({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="focus-ring w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm disabled:opacity-60"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      <option value="">— Select —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Footer buttons rendered INSIDE the form so type="submit" fires onSubmit. */
function FormFooter({ onCancel, saving, saveLabel = 'Save' }) {
  return (
    <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={onCancel}
        className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium"
        style={{ background: 'var(--bg-elevated-hover)', color: 'var(--text-secondary)' }}
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

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'EMPLOYEE',   label: 'Employee' },
  { value: 'TECHNICIAN', label: 'IT Technician' },
  { value: 'ADMIN',      label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Disabled', label: 'Disabled' },
];

const AVATAR_COLORS = [
  '#3b82f6', '#22d3ee', '#a78bfa', '#f79009',
  '#22c55e', '#f04438', '#ec4899', '#f97316',
];

// ─── View Employee Modal ──────────────────────────────────────────────────────
function ViewModal({ employee, onClose }) {
  if (!employee) return null;

  const rows = [
    ['Email',           employee.email],
    ['Department',      employee.department || '—'],
    ['Role',            employee.role],
    ['Status',          employee.status],
    ['Open Issues',     employee.openIssues ?? 0],
    ['Resolved Issues', employee.resolvedIssues ?? 0],
    ['Registered On',   shortDate(employee.lastActivity) || '—'],
  ];

  return (
    <Modal open={!!employee} onClose={onClose} title="Employee Details" size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium"
          style={{ background: 'var(--bg-elevated-hover)', color: 'var(--text-secondary)' }}
        >
          Close
        </button>
      }
    >
      <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <UserAvatar name={employee.name} color={employee.avatarColor} size="lg" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{employee.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{employee.email}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</dt>
            <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>{String(value)}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

// ─── Add Employee Modal ───────────────────────────────────────────────────────
function AddModal({ open, onClose, onCreated, departments }) {
  const EMPTY = {
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'EMPLOYEE',
    status: 'Active',
    avatar_color: AVATAR_COLORS[0],
  };
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const pushToast = useUiStore((s) => s.pushToast);

  function f(key) { return (val) => setForm((prev) => ({ ...prev, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await userService.createEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department || null,
        role: form.role,
        status: form.status,
        avatar_color: form.avatar_color,
      });
      pushToast({ type: 'success', title: 'Employee added', message: `${created.name} has been created.` });
      onCreated(created);
      onClose();
      setForm(EMPTY);
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to create employee', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  // Reset form when modal closes
  useEffect(() => { if (!open) setForm(EMPTY); }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Add Employee" size="md">
      {/* Form wraps everything including the footer so type="submit" works */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="space-y-3 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Full Name *</FieldLabel>
              <TextInput value={form.name} onChange={f('name')} placeholder="e.g. Jane Smith" required />
            </div>
            <div>
              <FieldLabel>Email *</FieldLabel>
              <TextInput type="email" value={form.email} onChange={f('email')} placeholder="jane@company.com" required />
            </div>
          </div>
          <div>
            <FieldLabel>Password *</FieldLabel>
            <TextInput
              type="password"
              value={form.password}
              onChange={f('password')}
              placeholder="Set initial password"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Department</FieldLabel>
              <SelectInput
                value={form.department}
                onChange={f('department')}
                options={departments.map((d) => ({ value: d.name, label: d.name }))}
              />
            </div>
            <div>
              <FieldLabel>Role</FieldLabel>
              <SelectInput value={form.role} onChange={f('role')} options={ROLE_OPTIONS} />
            </div>
          </div>
          <div>
            <FieldLabel>Avatar Color</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => f('avatar_color')(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: form.avatar_color === c ? 'var(--text-primary)' : 'transparent' }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <FormFooter onCancel={onClose} saving={saving} saveLabel="Create Employee" />
      </form>
    </Modal>
  );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────────────
function EditModal({ employee, onClose, onUpdated, departments }) {
  const [form, setForm] = useState({ name: '', department: '', role: 'EMPLOYEE', status: 'Active', specialization: '' });
  const [saving, setSaving] = useState(false);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || '',
        department: employee.department || '',
        role: employee.role || 'EMPLOYEE',
        status: employee.status || 'Active',
        specialization: employee.specialization || '',
      });
    }
  }, [employee]);

  function f(key) { return (val) => setForm((prev) => ({ ...prev, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateEmployee(employee.id, {
        name: form.name.trim(),
        department: form.department || null,
        role: form.role,
        status: form.status,
        specialization: form.specialization || null,
      });
      pushToast({ type: 'success', title: 'Employee updated', message: `${updated.name} saved.` });
      onUpdated(updated);
      onClose();
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to update employee', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!employee) return null;

  return (
    <Modal open={!!employee} onClose={onClose} title={`Edit — ${employee.name}`} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="space-y-3 px-5 py-4">
          <div>
            <FieldLabel>Full Name *</FieldLabel>
            <TextInput value={form.name} onChange={f('name')} placeholder="Full name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Department</FieldLabel>
              <SelectInput
                value={form.department}
                onChange={f('department')}
                options={departments.map((d) => ({ value: d.name, label: d.name }))}
              />
            </div>
            <div>
              <FieldLabel>Role</FieldLabel>
              <SelectInput value={form.role} onChange={f('role')} options={ROLE_OPTIONS} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Status</FieldLabel>
              <SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTIONS} />
            </div>
            <div>
              <FieldLabel>Specialization</FieldLabel>
              <TextInput value={form.specialization} onChange={f('specialization')} placeholder="e.g. Networking" />
            </div>
          </div>
          <div>
            <FieldLabel>Email (read-only)</FieldLabel>
            <TextInput value={employee.email} onChange={() => {}} disabled />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Email cannot be changed after creation.</p>
          </div>
        </div>
        <FormFooter onCancel={onClose} saving={saving} saveLabel="Save Changes" />
      </form>
    </Modal>
  );
}

// ─── Main Employees Page ──────────────────────────────────────────────────────
export default function Employees() {
  const [employees, setEmployees]           = useState(null);
  const [search, setSearch]                 = useState('');
  const [viewTarget, setViewTarget]         = useState(null);
  const [editTarget, setEditTarget]         = useState(null);
  const [disableTarget, setDisableTarget]   = useState(null);
  const [addOpen, setAddOpen]               = useState(false);

  const pushToast = useUiStore((s) => s.pushToast);
  const { departments, fetchDepartments }   = useSettingsStore();

  useEffect(() => {
    userService.listEmployees().then(setEmployees).catch((err) => {
      pushToast({ type: 'error', title: 'Failed to load employees', message: err.message });
      setEmployees([]);
    });
    fetchDepartments();
  }, []);

  const filtered = (employees || []).filter(
    (e) => !search || `${e.name} ${e.department || ''} ${e.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreated(newEmp) {
    setEmployees((prev) => [newEmp, ...(prev || [])]);
  }

  function handleUpdated(updated) {
    setEmployees((prev) =>
      (prev || []).map((e) => (e.id === updated.id ? { ...e, ...updated } : e)),
    );
  }

  async function handleDisable() {
    if (!disableTarget) return;
    try {
      const result = await userService.deleteEmployee(disableTarget.id);
      if (result) {
        setEmployees((prev) =>
          (prev || []).map((e) => (e.id === disableTarget.id ? { ...e, status: result.status } : e)),
        );
        pushToast({
          type: 'success',
          title: result.status === 'Disabled' ? 'Employee disabled' : 'Employee removed',
          message: result.status === 'Disabled'
            ? `${disableTarget.name} is now disabled. Historical records preserved.`
            : `${disableTarget.name} has been permanently removed.`,
        });
      } else {
        setEmployees((prev) => (prev || []).filter((e) => e.id !== disableTarget.id));
        pushToast({ type: 'success', title: 'Employee removed', message: `${disableTarget.name} deleted.` });
      }
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to disable employee', message: err.message });
    } finally {
      setDisableTarget(null);
    }
  }

  function statusStyle(status) {
    return status === 'Active'
      ? { background: 'var(--low-soft)', color: 'var(--low)' }
      : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' };
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage employee accounts and view their issue history."
        action={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} className="w-64" />
            <button
              onClick={() => setAddOpen(true)}
              className="focus-ring flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={14} /> Add Employee
            </button>
          </div>
        }
      />

      {!employees ? (
        <LoadingState rows={5} />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                {['Employee', 'Department', 'Email', 'Open Issues', 'Resolved Issues', 'Registered On', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No employees found.</td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id} className="border-t" style={{ borderColor: 'var(--border-soft)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={e.name} color={e.avatarColor} size="sm" />
                      <span style={{ color: 'var(--text-primary)' }}>{e.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.department || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.email}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.openIssues ?? 0}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.resolvedIssues ?? 0}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{shortDate(e.lastActivity) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={statusStyle(e.status)}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <button className="focus-ring" title="View details" aria-label="View employee" onClick={() => setViewTarget(e)}>
                        <Eye size={15} />
                      </button>
                      <button className="focus-ring" title="Edit employee" aria-label="Edit employee" onClick={() => setEditTarget(e)}>
                        <Pencil size={15} />
                      </button>
                      {e.status !== 'Disabled' ? (
                        <button
                          className="focus-ring"
                          title="Disable employee"
                          aria-label="Disable employee"
                          onClick={() => setDisableTarget(e)}
                          style={{ color: 'var(--critical)' }}
                        >
                          <Ban size={15} />
                        </button>
                      ) : (
                        <span title="Already disabled" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
                          <UserCheck size={15} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
        departments={departments}
      />

      <ViewModal employee={viewTarget} onClose={() => setViewTarget(null)} />

      <EditModal
        employee={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleUpdated}
        departments={departments}
      />

      <ConfirmDialog
        open={!!disableTarget}
        onClose={() => setDisableTarget(null)}
        onConfirm={handleDisable}
        title="Disable Employee"
        description={
          `Disable "${disableTarget?.name}"? ` +
          `If they have existing issues the account will be set to Disabled and all historical records preserved. ` +
          `If they have no issues the account will be permanently deleted.`
        }
        confirmLabel="Disable"
        danger
      />
    </div>
  );
}