import React from 'react';
import { AddressChip } from './AddressChip';
import { Activity, Calendar, ShieldCheck, UserCheck, Stethoscope, LogOut, LayoutDashboard } from 'lucide-react';

/**
 * Role-aware TopBar — shows only navigation links the connected role is authorised to see.
 *
 * userRole: "admin" | "doctor" | "patient" | null (not yet registered / not connected)
 */
export function TopBar({
  networkName = 'Hardhat Local (31337)',
  address = '',
  userRole = null,       // effective role from blockchain
  activeRole = '',
  activeTab = '',
  onNavigate,
  onConnect,
  onDisconnect,
  className = '',
}) {
  const barStyle = {
    height: '72px',
    backgroundColor: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    boxShadow: 'var(--shadow-sm)',
    flexWrap: 'wrap',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'var(--glass-backdrop)',
  };

  const navItemStyle = (isActive, accentColor) => ({
    padding: '8px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 500,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: isActive ? (accentColor || 'var(--primary-600)') : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
    transition: 'all var(--transition-fast)',
    boxShadow: isActive ? '0 2px 6px rgba(15, 118, 110, 0.25)' : 'none',
  });

  // Role badge colours
  const roleBadge = {
    admin:   { label: 'Admin Portal',   bg: '#FEF3C7', color: '#92400E' },
    doctor:  { label: 'Doctor Portal',  bg: '#DBEAFE', color: '#1E40AF' },
    patient: { label: 'Patient Portal', bg: '#D1FAE5', color: '#065F46' },
  }[userRole] || null;

  return (
    <header style={barStyle} className={`top-bar ${className}`}>

      {/* ── Brand / Logo ── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/')}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          backgroundColor: 'var(--primary-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
          color: '#FFFFFF',
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-800)', lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
            IntelliHealth
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Secured Decentralized EHR Platform
          </span>
        </div>
      </div>

      {/* ── Role-scoped Navigation ── */}
      {address && userRole && (
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: 'var(--bg)', padding: '5px',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
        }}>

          {/* ADMIN nav */}
          {userRole === 'admin' && (
            <button
              type="button"
              id="nav-admin-portal"
              style={navItemStyle(activeRole === 'admin', 'var(--primary-600)')}
              onClick={() => onNavigate && onNavigate('/admin')}
            >
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </button>
          )}

          {/* DOCTOR nav */}
          {userRole === 'doctor' && (
            <>
              <button
                type="button"
                id="nav-doctor-portal"
                style={navItemStyle(activeRole === 'doctor', 'var(--primary-600)')}
                onClick={() => onNavigate && onNavigate('/doctor')}
              >
                <Stethoscope size={16} />
                <span>Doctor Portal</span>
              </button>
              <button
                type="button"
                id="nav-ai-diagnosis"
                style={navItemStyle(activeTab === 'ai-diagnosis', 'var(--indigo-600)')}
                onClick={() => onNavigate && onNavigate('/ai-diagnosis')}
              >
                <Activity size={16} />
                <span>AI Diagnostics</span>
              </button>
            </>
          )}

          {/* PATIENT nav */}
          {userRole === 'patient' && (
            <>
              <button
                type="button"
                id="nav-patient-portal"
                style={navItemStyle(activeRole === 'patient', 'var(--primary-600)')}
                onClick={() => onNavigate && onNavigate('/patient')}
              >
                <UserCheck size={16} />
                <span>My Health Portal</span>
              </button>
              <button
                type="button"
                id="nav-appointments"
                style={navItemStyle(activeTab === 'appointments', 'var(--accent-600)')}
                onClick={() => onNavigate && onNavigate('/appointments')}
              >
                <Calendar size={16} />
                <span>Appointments</span>
              </button>
              <button
                type="button"
                id="nav-ai-diagnosis-patient"
                style={navItemStyle(activeTab === 'ai-diagnosis', 'var(--indigo-600)')}
                onClick={() => onNavigate && onNavigate('/ai-diagnosis')}
              >
                <Activity size={16} />
                <span>AI Diagnostics</span>
              </button>
            </>
          )}
        </nav>
      )}

      {/* ── Right: Network + Role badge + Wallet Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Network chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)',
          borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
          border: '1px solid rgba(15, 118, 110, 0.2)',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: 'var(--success)',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
          }} />
          <span>{networkName}</span>
        </div>

        {/* Role badge */}
        {roleBadge && (
          <span style={{
            fontSize: '11px', fontWeight: 700,
            backgroundColor: roleBadge.bg, color: roleBadge.color,
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            border: `1px solid ${roleBadge.color}40`,
            letterSpacing: '0.02em',
          }}>
            {roleBadge.label}
          </span>
        )}

        {/* Wallet controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {address ? (
            <>
              <AddressChip address={address} isSelf={true} />
              <button
                type="button"
                id="btn-disconnect"
                onClick={onDisconnect}
                title="Disconnect wallet"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                  border: '1px solid #FECACA', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCA5A5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-bg)'; }}
              >
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              id="btn-connect-topbar"
              onClick={onConnect}
              style={{
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)', color: '#FFFFFF',
                border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-700)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-600)'; }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

