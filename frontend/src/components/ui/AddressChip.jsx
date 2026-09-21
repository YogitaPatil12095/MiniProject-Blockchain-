import React, { useState } from 'react';

/**
 * Presentational AddressChip Component
 * @param {Object} props
 * @param {string} props.address - 0x Ethereum address
 * @param {string} [props.label] - Optional label (e.g. "Dr. David")
 * @param {boolean} [props.isSelf=false] - If true, displays "(You)" badge
 * @param {boolean} [props.copyable=true] - Allows clicking to copy address
 */
export function AddressChip({
  address = '',
  label = '',
  isSelf = false,
  copyable = true,
  className = ''
}) {
  const [copied, setCopied] = useState(false);

  const truncate = (addr) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!address || !copyable) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: 'var(--accent-50)',
    color: 'var(--accent-600)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--fs-mono)',
    fontWeight: 'var(--fw-medium)',
    cursor: copyable ? 'pointer' : 'default',
    transition: 'all var(--transition-fast)',
    userSelect: 'none',
  };

  return (
    <div
      style={chipStyle}
      onClick={handleCopy}
      title={address ? `Click to copy full address: ${address}` : ''}
      className={`address-chip ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {label && <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>{label}</span>}
      <span>{truncate(address)}</span>
      {isSelf && (
        <span
          style={{
            backgroundColor: 'var(--primary-600)',
            color: '#FFFFFF',
            fontSize: '11px',
            padding: '1px 6px',
            borderRadius: '999px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          You
        </span>
      )}
      {copied && (
        <span style={{ fontSize: '11px', color: 'var(--success)', marginLeft: '2px' }}>
          Copied!
        </span>
      )}
    </div>
  );
}
