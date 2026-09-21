import React from 'react';

/**
 * Presentational RoleBadge Component
 * @param {Object} props
 * @param {'viewer'|'creator'|'master'|string} props.role - Role level
 */
export function RoleBadge({ role = 'viewer', className = '' }) {
  const normalizedRole = (role || '').toLowerCase();

  const config = {
    viewer: {
      label: 'Viewer',
      color: 'var(--role-viewer)',
      bg: 'var(--role-viewer-bg)',
      icon: '👁️',
    },
    creator: {
      label: 'Creator',
      color: 'var(--role-creator)',
      bg: 'var(--role-creator-bg)',
      icon: '✏️',
    },
    master: {
      label: 'Master (Both)',
      color: 'var(--role-master)',
      bg: 'var(--role-master-bg)',
      icon: '⭐',
    },
  };

  const item = config[normalizedRole] || config.viewer;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    backgroundColor: item.bg,
    color: item.color,
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-semibold)',
    border: `1px solid ${item.color}33`,
    userSelect: 'none',
  };

  return (
    <span style={style} className={`role-badge role-${normalizedRole} ${className}`}>
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
}
