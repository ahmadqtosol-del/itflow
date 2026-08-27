import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

/**
 * Renders a list of direct messages.
 *
 * Supported message shapes:
 * {
 *   id,
 *   body,
 *   senderId,
 *   createdAt
 * }
 *
 * Legacy shape is also supported:
 * {
 *   id,
 *   text,
 *   from: 'agent' | ...
 *   time
 * }
 */
export default function MessageList({
  messages = [],
  currentUserId,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  function isOwn(message) {
    if (!message) return false;

    if (currentUserId && message.senderId != null) {
      return String(message.senderId) === String(currentUserId);
    }

    // Legacy message format.
    return message.from === 'agent';
  }

  function formatTime(message) {
    if (!message) return '';

    if (message.createdAt) {
      const date = new Date(message.createdAt);

      if (!Number.isNaN(date.getTime())) {
        return format(date, 'HH:mm');
      }
    }

    return message.time || '';
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          No messages yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
      role="log"
      aria-live="polite"
      aria-label="Messages"
    >
      {messages.map((message, index) => {
        if (!message) return null;

        const own = isOwn(message);

        /*
         * A valid backend message should always have an id.
         * The fallback prevents React key warnings for malformed
         * legacy/mock messages.
         */
        const key =
          message.id ??
          `${message.createdAt ?? 'message'}-${index}`;

        const body = message.body ?? message.text ?? '';

        return (
          <div
            key={key}
            className={`flex ${
              own ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className="max-w-[70%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm"
              style={{
                background: own
                  ? 'var(--accent)'
                  : 'var(--bg-elevated)',
                color: own
                  ? '#fff'
                  : 'var(--text-primary)',
              }}
            >
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {body}
              </p>

              <p className="mt-1 text-[10px] opacity-70">
                {formatTime(message)}
              </p>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}