import UserAvatar from './UserAvatar';

export default function UserAvatarGroup({ users = [], max = 4 }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => (
        <UserAvatar key={u.id || u.name} name={u.name} color={u.avatarColor} size="sm" className="ring-2" />
      ))}
      {extra > 0 && (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '2px solid var(--bg-surface)' }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
