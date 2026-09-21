import React from 'react';

/**
 * Presentational GasBadge Component
 * Placed beside write action buttons to visually indicate blockchain gas cost.
 */
export function GasBadge({ label = 'Requires gas', className = '' }) {
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-medium)',
    border: '1px solid rgba(146, 64, 14, 0.15)',
    userSelect: 'none',
  };

  return (
    <span style={style} className={`gas-badge ${className}`} title="This action submits a transaction to Ethereum and consumes gas">
      <span role="img" aria-label="fuel">⛽</span>
      <span>{label}</span>
    </span>
  );
}
