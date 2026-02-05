import { memo, useCallback } from 'react';

type HotkeysModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '320px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    lineHeight: 1,
  },
  hotkey: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  hotkeyLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  action: {
    fontSize: '0.875rem',
    color: '#334155',
  },
  key: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#475569',
    fontWeight: 500,
  },
};

const HotkeysModal = memo(function HotkeysModal({ isOpen, onClose }: HotkeysModalProps) {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Keyboard Shortcuts</h2>
          <button style={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div style={styles.hotkey}>
          <span style={styles.action}>Start pomo / Join wave</span>
          <span style={styles.key}>Space</span>
        </div>
        <div style={styles.hotkeyLast}>
          <span style={styles.action}>Close modal</span>
          <span style={styles.key}>Esc</span>
        </div>
      </div>
    </div>
  );
});

export default HotkeysModal;
