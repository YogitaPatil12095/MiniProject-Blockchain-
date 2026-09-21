import React from 'react';
import { Button } from './Button';

/**
 * Presentational EmptyState Component
 * @param {Object} props
 * @param {string} [props.icon='📂']
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.actionLabel]
 * @param {Function} [props.onAction]
 */
export function EmptyState({
  icon = '📋',
  title = 'No records found',
  description = 'There are no items to display right now.',
  actionLabel = '',
  onAction,
  className = ''
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    gap: '12px',
  };

  return (
    <div style={containerStyle} className={`empty-state ${className}`}>
      <div style={{ fontSize: '42px', marginBottom: '4px' }}>{icon}</div>
      <h3 style={{ fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: 'var(--fs-body)' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div style={{ marginTop: '8px' }}>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
