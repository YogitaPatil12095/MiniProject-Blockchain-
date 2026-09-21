import React from 'react';
import { AddressChip } from './AddressChip';

/**
 * Presentational RecordCard Component
 * @param {Object} props
 * @param {Object} props.record
 * @param {string} props.record.creatorName - Name of doctor/creator
 * @param {string} [props.record.creatorAddress] - 0x creator address
 * @param {string} props.record.cid - IPFS CID string
 * @param {number} props.record.createdAt - Unix timestamp in seconds
 * @param {string} [props.record.gatewayUrl] - Direct Pinata/IPFS link
 * @param {string} [props.record.fileName] - Optional filename
 */
export function RecordCard({ record, className = '' }) {
  if (!record) return null;

  const {
    creatorName = 'Doctor',
    creatorAddress = '',
    cid = '',
    createdAt = 0,
    gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`,
    fileName = 'Medical Record'
  } = record;

  const formatDate = (unixSeconds) => {
    if (!unixSeconds) return 'Unknown date';
    const d = new Date(unixSeconds * 1000);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    gap: '16px',
    transition: 'all var(--transition-fast)',
  };

  const iconBoxStyle = {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary-50)',
    color: 'var(--primary-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  };

  return (
    <div style={cardStyle} className={`record-card card ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
        <div style={iconBoxStyle}>🩺</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <h4 style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>
            {fileName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
              Created by <strong style={{ color: 'var(--text)' }}>{creatorName}</strong>
            </span>
            {creatorAddress && <AddressChip address={creatorAddress} copyable={false} />}
            <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>• {formatDate(createdAt)}</span>
          </div>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'var(--fw-medium)', color: 'var(--text-muted)' }}>CID:</span>
            <code style={{ fontSize: 'var(--fs-mono)', color: 'var(--accent-600)', backgroundColor: 'var(--accent-50)', padding: '1px 6px', borderRadius: '4px' }}>
              {cid ? `${cid.slice(0, 12)}…${cid.slice(-8)}` : 'N/A'}
            </code>
          </div>
        </div>
      </div>

      <a
        href={gatewayUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-700)',
          fontWeight: 'var(--fw-medium)',
          fontSize: 'var(--fs-small)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(15, 118, 110, 0.2)',
          flexShrink: 0,
        }}
      >
        <span>Open on IPFS</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}
