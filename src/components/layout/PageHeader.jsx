export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
