import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

export default function MessageComposer({
  onSend,
  disabled = false,
}) {
  const [text, setText] = useState('');

  function submit(event) {
    event.preventDefault();

    const value = text.trim();

    if (!value || disabled) {
      return;
    }

    onSend?.(value);
    setText('');
  }

  function handleKeyDown(event) {
    /*
     * Enter sends the message.
     *
     * Shift + Enter creates a new line.
     */
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent?.isComposing
    ) {
      event.preventDefault();

      const form = event.currentTarget.form;

      if (form) {
        form.requestSubmit();
      }
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 border-t p-3"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <button
        type="button"
        disabled={disabled}
        className="focus-ring rounded-[var(--radius-sm)] p-2 disabled:opacity-50"
        style={{
          color: 'var(--text-muted)',
        }}
        aria-label="Attach file"
        title="Attach file"
      >
        <Paperclip size={17} />
      </button>

      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled}
        autoComplete="off"
        className="focus-ring flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-sm disabled:opacity-60"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        aria-label="Message"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-white disabled:opacity-50"
        style={{
          background: 'var(--accent)',
        }}
        aria-label="Send message"
        title="Send message"
      >
        <Send size={15} />
      </button>
    </form>
  );
}