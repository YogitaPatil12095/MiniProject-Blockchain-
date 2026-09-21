import React, { useEffect } from 'react';
import { Button } from './Button';

/**
 * Presentational Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {Function} props.onClose
 * @param {Function} [props.onConfirm]
 * @param {string} [props.confirmLabel='Confirm']
 * @param {'primary'|'danger'|'secondary'} [props.confirmVariant='danger']
 * @param {boolean} [props.isLoading=false]
 */
export function Modal({
  isOpen = false,
  title = '',
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    animation: 'fadeIn 150ms ease-out',
  };

  const modalStyle = {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-modal)',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  };

  return (
    <div style={overlayStyle} onClick={() => !isLoading && onClose()} className={`modal-overlay ${className}`}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()} className="modal-card">
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: 'var(--text-muted)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {children}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
