import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Background from '../components/common/Background';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/employee');
    } catch {
      // error is already set in store
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Background variant="login" />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[var(--radius-lg)] border shadow-2xl lg:grid-cols-2" style={{ borderColor: 'var(--border)' }}>
        <div
          className="hidden flex-col justify-between p-10 lg:flex"
          style={{ background: 'linear-gradient(160deg, rgba(59,130,246,0.16), rgba(10,15,30,0.4))' }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#login-grad)" />
              <path d="M9 14.5L12.2 17.7L19 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="login-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>QTOSOL</span>
          </div>

          <div>
            <h1 className="text-3xl font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              IT support,<br />simplified.
            </h1>
            <p className="mt-4 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
              Report issues, track resolutions, and stay connected with your IT team — all in one modern workspace.
            </p>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 ITFlow. Internal IT support platform.</p>
        </div>

        <div className="p-8 sm:p-10" style={{ background: 'var(--bg-elevated)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to continue to ITFlow.</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="focus-ring w-full rounded-[var(--radius-md)] border py-2 pl-9 pr-3 text-sm"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                  className="focus-ring w-full rounded-[var(--radius-md)] border py-2 pl-9 pr-3 text-sm"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--accent)]" /> Remember me
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent)' }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Use admin@itflow.com / Admin@123 for admin access.
          </p>
        </div>
      </div>
    </div>
  );
}
