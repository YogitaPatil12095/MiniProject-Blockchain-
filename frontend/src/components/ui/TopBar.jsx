import React from 'react';
import { AddressChip } from './AddressChip';
import { Activity, Calendar, ShieldCheck, UserCheck, Stethoscope } from 'lucide-react';

/**
 * Presentational TopBar Component for Intellihealth
 */
export function TopBar({
  networkName = 'Hardhat Local (31337)',
  address = '',
  activeRole = 'patient',
  activeTab = '',
  onRoleSwitch,
  onNavigate,
  onConnect,
  className = ''
}) {
  const barStyle = {
    height: '68px',
    backgroundColor: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: 'var(--shadow-sm)',
    flexWrap: 'wrap',
    gap: '12px',
  };

  const navItemStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
    transition: 'all 0.15s ease',
  });

  return (
    <header style={barStyle} className={`top-bar ${className}`}>
      {/* Brand */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/')}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(15, 118, 110, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={22} color="var(--primary-600)" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-600)', lineHeight: 1.1, margin: 0 }}>
            Intellihealth
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Secured Decentralized EHR & AI System
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      {address && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            style={navItemStyle(activeRole === 'patient' && !activeTab)}
            onClick={() => onRoleSwitch && onRoleSwitch('patient')}
          >
            <UserCheck size={15} />
            <span>Patient Portal</span>
          </button>
          <button
            type="button"
            style={navItemStyle(activeRole === 'doctor' && !activeTab)}
            onClick={() => onRoleSwitch && onRoleSwitch('doctor')}
          >
            <Stethoscope size={15} />
            <span>Doctor Portal</span>
          </button>
          <button
            type="button"
            style={navItemStyle(activeRole === 'admin' && !activeTab)}
            onClick={() => onRoleSwitch && onRoleSwitch('admin')}
          >
            <ShieldCheck size={15} />
            <span>Admin Portal</span>
          </button>
          <button
            type="button"
            style={navItemStyle(activeTab === 'appointments')}
            onClick={() => onNavigate && onNavigate('/appointments')}
          >
            <Calendar size={15} />
            <span>Appointments</span>
          </button>
          <button
            type="button"
            style={{
              ...navItemStyle(activeTab === 'ai-diagnosis'),
              backgroundColor: activeTab === 'ai-diagnosis' ? '#6366F1' : 'transparent',
              color: activeTab === 'ai-diagnosis' ? '#FFFFFF' : 'var(--accent-500)',
            }}
            onClick={() => onNavigate && onNavigate('/ai-diagnosis')}
          >
            <Activity size={15} />
            <span>AI ML Diagnosis</span>
          </button>
        </nav>
      )}

      {/* Right: Network & Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Network Chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px solid rgba(15, 118, 110, 0.2)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>{networkName}</span>
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
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-600)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

