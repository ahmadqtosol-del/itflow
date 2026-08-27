import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--bg-elevated-hover)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: danger ? 'var(--critical)' : 'var(--accent)' }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </Modal>
  );
}
