import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, User } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { issueService } from '../../services/api/issueService';
import { userService } from '../../services/api/userService';

export default function GlobalSearch() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ issues: [], people: [] });
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ issues: [], people: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [issuesList, employeesList, techniciansList] = await Promise.all([
          issueService.list({ search: query }),
          userService.listEmployees(),
          userService.listTechnicians(),
        ]);
        const q = query.toLowerCase();
        const people = [...employeesList, ...techniciansList].filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
        setResults({ issues: issuesList.slice(0, 5), people });
      } catch (e) {
        console.warn('Search error:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24">
      <div className="absolute inset-0" style={{ background: 'rgba(5,8,16,0.6)' }} onClick={() => setOpen(false)} />
      <div
        className="relative w-full max-w-xl animate-fade-in-up overflow-hidden rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <Search size={17} style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, employees, messages…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }} aria-label="Close search">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Try searching "IT-00124" or an employee name
            </p>
          )}
          {results.issues.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Issues</p>
              {results.issues.map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/employee/problems/${i.id}`);
                  }}
                  className="focus-ring flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm hover:bg-[var(--bg-elevated-hover)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileText size={15} style={{ color: 'var(--text-muted)' }} />
                  <span className="font-medium">{i.id}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{i.title}</span>
                </button>
              ))}
            </div>
          )}
          {results.people.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>People</p>
              {results.people.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <User size={15} style={{ color: 'var(--text-muted)' }} />
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
