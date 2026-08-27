import { useState } from 'react';
import { User, Bell, Palette, SlidersHorizontal } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import UserAvatar from '../../components/common/UserAvatar';

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
];

export default function Settings() {
  const [section, setSection] = useState('profile');
  const user = useAuthStore((s) => s.user);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and application preferences." />
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className="focus-ring flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm"
              style={{ background: section === s.key ? 'var(--accent-soft)' : 'transparent', color: section === s.key ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </nav>

        <div className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          {section === 'profile' && (
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name} color={user.avatarColor} size="lg" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.department}</p>
              </div>
            </div>
          )}
          {section === 'notifications' && (
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {['Email notifications', 'In-app notifications', 'Critical issue alerts'].map((l) => (
                <label key={l} className="flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                  {l}
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
                </label>
              ))}
            </div>
          )}
          {section === 'appearance' && (
            <div className="flex gap-3">
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="focus-ring flex-1 rounded-[var(--radius-md)] border py-4 text-sm font-medium capitalize"
                  style={{ borderColor: theme === t ? 'var(--accent)' : 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {t} theme
                </button>
              ))}
            </div>
          )}
          {section === 'preferences' && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Preference persistence will be available once the backend is connected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
