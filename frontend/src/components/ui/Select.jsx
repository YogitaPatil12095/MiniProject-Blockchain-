import React from 'react';

/**
 * Presentational Select Component
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.error='']
 * @param {string} [props.helperText='']
 */
export function Select({
  label = '',
  value = '',
  onChange,
  options = [],
  error = '',
  helperText = '',
  required = false,
  className = '',
  ...rest
}) {
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

  const selectStyle = {
    height: '40px',
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  };

  return (
    <div style={containerStyle} className={`select-group ${className}`}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} style={selectStyle} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--danger)' }}>{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{helperText}</span>
      )}
    </div>
  );
}
