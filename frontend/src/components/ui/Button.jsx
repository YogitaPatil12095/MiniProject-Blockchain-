import React from 'react';

/**
 * Presentational Button Component
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'} [props.variant='primary']
 * @param {boolean} [props.isLoading=false]
 * @param {string} [props.loadingText='Confirming...']
 * @param {boolean} [props.disabled=false]
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 * @param {string} [props.type='button']
 * @param {string} [props.className='']
 */
export function Button({
  variant = 'primary',
  isLoading = false,
  loadingText = 'Waiting for wallet...',
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ...rest
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '40px',
    padding: '0 16px',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'var(--fw-medium)',
    fontSize: 'var(--fs-body)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    border: '1px solid transparent',
    outline: 'none',
    whiteSpace: 'nowrap',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary-600)',
      color: '#FFFFFF',
      borderColor: 'var(--primary-600)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'var(--surface)',
      color: 'var(--text)',
      borderColor: 'var(--border)',
    },
    danger: {
      backgroundColor: 'var(--surface)',
      color: 'var(--danger)',
      borderColor: 'var(--danger)',
    },
  };

  const style = {
    ...baseStyle,
    ...(variantStyles[variant] || variantStyles.primary),
  };

  return (
    <button
      type={type}
      style={style}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2 a10 10 0 0 1 10 10" />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
