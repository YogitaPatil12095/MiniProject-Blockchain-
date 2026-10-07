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

  const navItemStyle = (isActive, accentColor) => ({
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: isActive ? (accentColor || 'var(--primary-600)') : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
    transition: 'all 0.15s ease',
  });

  // Role badge colours
  const roleBadge = {
    admin:   { label: 'Admin',   bg: '#FEF3C7', color: '#92400E' },
    doctor:  { label: 'Doctor',  bg: '#DBEAFE', color: '#1E40AF' },
    patient: { label: 'Patient', bg: '#D1FAE5', color: '#065F46' },
  }[userRole] || null;

  return (
    <header style={barStyle} className={`top-bar ${className}`}>

      {/* ── Brand ── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/')}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: 'rgba(15, 118, 110, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldCheck size={22} color="var(--primary-600)" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-600)', lineHeight: 1.1, margin: 0 }}>
            Intellihealth
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Secured Decentralized EHR &amp; AI System
          </span>
        </div>
      </div>

      {/* ── Role-scoped Navigation ── */}
      {address && userRole && (
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          backgroundColor: 'var(--bg)', padding: '4px',
          borderRadius: '10px', border: '1px solid var(--border)',
        }}>

          {/* ADMIN nav */}
          {userRole === 'admin' && (
            <button
              type="button"
              id="nav-admin-portal"
              style={navItemStyle(activeRole === 'admin', '#B45309')}
              onClick={() => onNavigate && onNavigate('/admin')}
            >
              <ShieldCheck size={15} />
              <span>Admin Portal</span>
            </button>
          )}

          {/* DOCTOR nav */}
          {userRole === 'doctor' && (
            <>
              <button
                type="button"
                id="nav-doctor-portal"
                style={navItemStyle(activeRole === 'doctor', '#1D4ED8')}
                onClick={() => onNavigate && onNavigate('/doctor')}
              >
                <Stethoscope size={15} />
                <span>Doctor Dashboard</span>
              </button>
              <button
                type="button"
                id="nav-ai-diagnosis"
                style={navItemStyle(activeTab === 'ai-diagnosis', '#6366F1')}
                onClick={() => onNavigate && onNavigate('/ai-diagnosis')}
              >
                <Activity size={15} />
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
                <UserCheck size={15} />
                <span>My Health Portal</span>
              </button>
              <button
                type="button"
                id="nav-appointments"
                style={navItemStyle(activeTab === 'appointments', '#0284C7')}
                onClick={() => onNavigate && onNavigate('/appointments')}
              >
                <Calendar size={15} />
                <span>Book Appointment</span>
              </button>
              <button
                type="button"
                id="nav-ai-diagnosis-patient"
                style={navItemStyle(activeTab === 'ai-diagnosis', '#6366F1')}
                onClick={() => onNavigate && onNavigate('/ai-diagnosis')}
              >
                <Activity size={15} />
                <span>AI Diagnostics</span>
              </button>
            </>
          )}
        </nav>
      )}

      {/* ── Right: Network + Role badge + Wallet ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Network chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)',
          borderRadius: '999px', fontSize: '12px', fontWeight: 500,
          border: '1px solid rgba(15, 118, 110, 0.2)',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>{networkName}</span>
        </div>

        {/* Role badge */}
        {roleBadge && (
          <span style={{
            fontSize: '11px', fontWeight: 700,
            backgroundColor: roleBadge.bg, color: roleBadge.color,
            padding: '3px 10px', borderRadius: '999px',
            border: `1px solid ${roleBadge.color}33`,
          }}>
            {roleBadge.label}
          </span>
        )}

        {/* Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {address ? (
            <>
              <AddressChip address={address} isSelf={true} />
              <button
                type="button"
                id="btn-disconnect"
                onClick={onDisconnect}
                title="Disconnect wallet"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: '6px',
                  backgroundColor: '#FEE2E2', color: '#DC2626',
                  border: '1px solid #FECACA', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCA5A5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              id="btn-connect-topbar"
              onClick={onConnect}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                backgroundColor: 'var(--primary-600)', color: '#FFFFFF',
                border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
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
