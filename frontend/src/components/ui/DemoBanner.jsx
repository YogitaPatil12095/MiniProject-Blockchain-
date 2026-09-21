import React from 'react';

/**
 * Presentational DemoBanner Component
 * Non-dismissible top warning banner required across all screens.
 */
export function DemoBanner({ className = '' }) {
  const bannerStyle = {
    width: '100%',
    backgroundColor: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    padding: '8px 16px',
    textAlign: 'center',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-medium)',
    borderBottom: '1px solid rgba(146, 64, 14, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    userSelect: 'none',
  };

  return (
    <aside style={bannerStyle} className={`demo-banner ${className}`}>
      <span style={{ fontSize: '16px' }}>⚠️</span>
      <span>
        <strong>Demo only:</strong> files on IPFS are publicly accessible by CID. Use dummy data, not real medical records.
      </span>
    </aside>
  );
}
