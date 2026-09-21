import React, { useState } from 'react';

/**
 * Presentational StatusToast / StatusPanel Component
 * @param {Object} props
 * @param {'idle'|'pending'|'success'|'error'} props.state - Current transaction state
 * @param {string} props.message - User friendly status message
 * @param {string} [props.txHash] - Ethereum transaction hash
 * @param {string} [props.rawError] - Raw revert message for expander
 * @param {Function} [props.onDismiss] - Optional close handler
 */
export function StatusToast({
  state = 'idle',
  message = '',
  txHash = '',
  rawError = '',
  onDismiss,
  className = ''
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (state === 'idle' || !message) return null;

  const config = {
    pending: {
      bgColor: 'var(--primary-50)',
      borderColor: 'var(--primary-600)',
      textColor: 'var(--primary-800)',
      icon: (
        <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2 a10 10 0 0 1 10 10" />
        </svg>
      ),
      title: 'Transaction Pending',
    },
    success: {
      bgColor: 'var(--success-bg)',
      borderColor: 'var(--success)',
      textColor: '#14532D',
      icon: <span style={{ fontSize: '20px' }}>✅</span>,
      title: 'Success',
    },
    error: {
      bgColor: 'var(--danger-bg)',
      borderColor: 'var(--danger)',
      textColor: '#7F1D1D',
      icon: <span style={{ fontSize: '20px' }}>⚠️</span>,
      title: 'Transaction Error',
    },
  };

  const item = config[state] || config.pending;

  const panelStyle = {
    padding: '16px 20px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: item.bgColor,
    border: `1px solid ${item.borderColor}`,
    color: item.textColor,
    boxShadow: 'var(--shadow-card)',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    animation: 'fadeIn var(--transition-normal) forwards',
  };

  return (
    <div style={panelStyle} className={`status-toast toast-${state} ${className}`} role="alert" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {item.icon}
          <div>
            <h4 style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)', color: item.textColor }}>
              {item.title}
            </h4>
            <p style={{ fontSize: 'var(--fs-small)', marginTop: '2px', color: item.textColor }}>
              {message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: item.textColor,
              fontSize: '18px',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Success Transaction Hash */}
      {state === 'success' && txHash && (
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--fs-small)', fontWeight: 'var(--fw-medium)' }}>Tx Hash:</span>
          <code
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono)',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(22, 163, 74, 0.3)',
            }}
          >
            {txHash.slice(0, 14)}…{txHash.slice(-10)}
          </code>
        </div>
      )}

      {/* Error Details Expander */}
      {state === 'error' && rawError && (
        <div style={{ marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: item.textColor,
              fontSize: 'var(--fs-small)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'var(--fw-medium)',
              padding: 0,
            }}
          >
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </button>

          {showDetails && (
            <pre
              style={{
                marginTop: '8px',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: '#991B1B',
              }}
            >
              {rawError}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
