import React from 'react';

/**
 * Presentational Input Component
 * @param {Object} props
 * @param {string} props.label - Label above input
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.placeholder='']
 * @param {string} [props.error=''] - Error message
 * @param {string} [props.helperText=''] - Helper guidance
 * @param {boolean} [props.isAddress=false] - If true, validates 0x address format
 * @param {boolean} [props.required=false]
 */
export function Input({
  label = '',
  value = '',
  onChange,
  type = 'text',
  placeholder = '',
  error = '',
  helperText = '',
  isAddress = false,
  required = false,
  className = '',
  ...rest
}) {
  const isValidAddress = isAddress && value && /^0x[a-fA-F0-9]{40}$/.test(value);
  const isInvalidAddress = isAddress && value && !isValidAddress;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    width: '100%',
  };

  const labelStyle = {
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-medium)',
    color: 'var(--text)',
  };

  const inputStyle = {
    height: '40px',
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error || isInvalidAddress ? 'var(--danger)' : 'var(--border)'}`,
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    fontFamily: isAddress ? 'var(--font-mono)' : 'var(--font-sans)',
    fontSize: isAddress ? 'var(--fs-mono)' : 'var(--fs-body)',
  };

  return (
    <div style={containerStyle} className={`input-group ${className}`}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...inputStyle, width: '100%' }}
          {...rest}
        />
        {isAddress && value && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              fontSize: '14px',
              color: isValidAddress ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {isValidAddress ? '✓ Valid' : '✕ Invalid 0x...'}
          </span>
        )}
      </div>

      {error && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--danger)' }}>{error}</span>}
      {!error && isInvalidAddress && (
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--danger)' }}>
          Must be a valid 42-character Ethereum hex address (0x...)
        </span>
      )}
      {!error && !isInvalidAddress && helperText && (
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{helperText}</span>
      )}
    </div>
  );
}
