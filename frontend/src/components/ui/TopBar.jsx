import React from 'react';
import { AddressChip } from './AddressChip';

/**
 * Presentational TopBar Component
 * @param {Object} props
 * @param {string} [props.networkName='Hardhat Local (31337)']
 * @param {string} [props.address]
 * @param {'patient'|'doctor'} [props.activeRole='patient']
 * @param {Function} [props.onRoleSwitch]
 * @param {Function} [props.onConnect]
 */
export function TopBar({
  networkName = 'Hardhat Local (31337)',
  address = '',
  activeRole = 'patient',
  onRoleSwitch,
  onConnect,
  className = ''
}) {
  const barStyle = {
    height: '64px',
    backgroundColor: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: 'var(--shadow-sm)',
  };

  const toggleStyle = {
    display: 'inline-flex',
    backgroundColor: 'var(--bg)',
    borderRadius: 'var(--radius-full)',
    padding: '3px',
    border: '1px solid var(--border)',
  };

  const getRoleBtnStyle = (role) => ({
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-medium)',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: activeRole === role ? 'var(--primary-600)' : 'transparent',
    color: activeRole === role ? '#FFFFFF' : 'var(--text-muted)',
    transition: 'all var(--transition-fast)',
  });

  return (
    <header style={barStyle} className={`top-bar ${className}`}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.svg" alt="PHR Chain Logo" style={{ width: '32px', height: '32px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--primary-600)', lineHeight: 1 }}>
            PHR Chain
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Decentralized Health Records</span>
        </div>
      </div>

      {/* Middle Network & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Network Chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--fs-small)',
            fontWeight: 'var(--fw-medium)',
            border: '1px solid rgba(15, 118, 110, 0.2)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>{networkName}</span>
        </div>

        {/* Role Toggle */}
        {address && onRoleSwitch && (
          <div style={toggleStyle}>
            <button
              type="button"
              style={getRoleBtnStyle('patient')}
              onClick={() => onRoleSwitch('patient')}
            >
              Patient View
            </button>
            <button
              type="button"
              style={getRoleBtnStyle('doctor')}
              onClick={() => onRoleSwitch('doctor')}
            >
              Doctor View
            </button>
          </div>
        )}
      </div>

      {/* Wallet Status */}
      <div>
        {address ? (
          <AddressChip address={address} isSelf={true} />
        ) : (
          <button
            type="button"
            onClick={onConnect}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-600)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 'var(--fw-medium)',
              fontSize: 'var(--fs-small)',
              cursor: 'pointer',
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
