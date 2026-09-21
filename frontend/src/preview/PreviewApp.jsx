import React, { useState } from 'react';
import '../styles/global.css';

import { TopBar } from '../components/ui/TopBar';
import { DemoBanner } from '../components/ui/DemoBanner';
import { Button } from '../components/ui/Button';
import { GasBadge } from '../components/ui/GasBadge';
import { AddressChip } from '../components/ui/AddressChip';
import { RoleBadge } from '../components/ui/RoleBadge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { FilePicker } from '../components/ui/FilePicker';
import { RecordCard } from '../components/ui/RecordCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusToast } from '../components/ui/StatusToast';
import { Modal } from '../components/ui/Modal';
import { Stepper } from '../components/ui/Stepper';

import { mockUsers, mockRecords, mockAccessList, mockTxStates } from '../mocks/mockData';

export function PreviewApp() {
  const [activeScreen, setActiveScreen] = useState('S3_patient'); // S1, S2, S3_patient, S4_doctor, S5_states
  const [activeRole, setActiveRole] = useState('patient');
  const [patientTab, setPatientTab] = useState('records'); // records, accessList, grantAccess
  const [doctorTab, setDoctorTab] = useState('viewRecord'); // viewRecord, createRecord
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isDoctorBlocked, setIsDoctorBlocked] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [targetRevokeAddress, setTargetRevokeAddress] = useState('');
  const [stepperStep, setStepperStep] = useState(1);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);

  // Form states for S2 & S3 & S4
  const [regForm, setRegForm] = useState({ fullName: '', gender: 'Male', homeAddress: '', phone: '', birthday: '' });
  const [grantAddress, setGrantAddress] = useState('');
  const [grantRole, setGrantRole] = useState('v');
  const [lookupAddress, setLookupAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Top Preview Control Switcher */}
      <nav
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6366F1' }}>🎨 Design Preview Mode</span>
          <span style={{ color: '#64748B' }}>|</span>
          <span>Switch Screen:</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'S1', label: 'S1 Connect' },
            { id: 'S2', label: 'S2 Register' },
            { id: 'S3_patient', label: 'S3 Patient Dashboard' },
            { id: 'S4_doctor', label: 'S4 Doctor Dashboard' },
            { id: 'S5_states', label: 'S5 Global States' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScreen(sc.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeScreen === sc.id ? 'var(--primary-600)' : '#1E293B',
                color: activeScreen === sc.id ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main TopBar & Mandatory Banner */}
      <TopBar
        address={activeScreen === 'S1' ? '' : mockUsers.patient.address}
        activeRole={activeRole}
        onRoleSwitch={(r) => {
          setActiveRole(r);
          setActiveScreen(r === 'patient' ? 'S3_patient' : 'S4_doctor');
        }}
      />
      <DemoBanner />

      {/* Main Screen Preview Content */}
      <main className="main-wrapper animate-fade-in">
        {/* ======================================================== */}
        {/* S1: CONNECT SCREEN MOCK */}
        {/* ======================================================== */}
        {activeScreen === 'S1' && (
          <div style={{ maxWidth: '440px', margin: '40px auto' }} className="card text-center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo.svg" alt="PHR Logo" style={{ width: '64px', height: '64px' }} />
            </div>
            <h2>Your health records, under your control</h2>
            <p className="text-muted" style={{ marginTop: '8px', marginBottom: '24px' }}>
              Decentralized Personal Health Record (PHR) system powered by Ethereum blockchain & IPFS.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button variant="primary" onClick={() => setActiveScreen('S2')}>
                🦊 Connect MetaMask
              </Button>
            </div>

            {/* Wrong network alert variant box */}
            <div
              style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: 'var(--warning-bg)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--fs-small)',
                color: 'var(--warning-text)',
                textAlign: 'left',
              }}
            >
              <strong>Wrong network detected!</strong>
              <p style={{ marginTop: '4px' }}>Please switch your wallet to Hardhat Local (Chain ID 31337) or Sepolia.</p>
              <div style={{ marginTop: '8px' }}>
                <Button variant="secondary" style={{ height: '32px', fontSize: '12px' }}>
                  Switch Network
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* S2: REGISTER FORM MOCK */}
        {/* ======================================================== */}
        {activeScreen === 'S2' && (
          <div style={{ maxWidth: '540px', margin: '20px auto' }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2>Create Your Health Profile</h2>
                <p className="text-muted" style={{ fontSize: 'var(--fs-small)' }}>
                  Registration is a one-time blockchain transaction.
                </p>
              </div>
              <GasBadge />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <AddressChip address={mockUsers.patient.address} isSelf={true} label="Wallet Connected" />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setActiveScreen('S3_patient'); }}>
              <Input
                label="Full Name"
                placeholder="e.g. Alice Smith"
                value={regForm.fullName}
                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                required
              />
              <Select
                label="Gender"
                value={regForm.gender}
                onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Input
                label="Home Address"
                placeholder="e.g. 123 Health Ave, Medical City, NY 10001"
                value={regForm.homeAddress}
                onChange={(e) => setRegForm({ ...regForm, homeAddress: e.target.value })}
              />
              <Input
                label="Phone Number"
                placeholder="+1 555-019-2834"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
              <Input
                label="Birthday"
                type="date"
                value={regForm.birthday}
                onChange={(e) => setRegForm({ ...regForm, birthday: e.target.value })}
              />

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <Button type="submit" variant="primary" style={{ flex: 1 }}>
                  Complete Registration & Submit
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* S3: PATIENT DASHBOARD MOCK */}
        {/* ======================================================== */}
        {activeScreen === 'S3_patient' && (
          <div className="layout-with-sidebar">
            {/* Left Sidebar */}
            <aside className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Patient Menu
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'records', label: ' My Records', icon: '📋' },
                  { id: 'accessList', label: ' Access List', icon: '🛡️' },
                  { id: 'grantAccess', label: ' Grant Access', icon: '➕' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPatientTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: patientTab === item.id ? 'var(--primary-50)' : 'transparent',
                      color: patientTab === item.id ? 'var(--primary-700)' : 'var(--text)',
                      fontWeight: patientTab === item.id ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Area */}
            <div>
              {/* Tab 1: My Records */}
              {patientTab === 'records' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2>My Medical Records</h2>
                    <Button variant="secondary" onClick={() => setShowEmptyState(!showEmptyState)}>
                      {showEmptyState ? 'Show Records List' : 'Simulate Empty State'}
                    </Button>
                  </div>

                  {showEmptyState ? (
                    <EmptyState
                      icon="📂"
                      title="No medical records yet"
                      description="You do not have any health records uploaded to IPFS. Grant access to your doctor so they can add a record for you."
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {mockRecords.map((rec) => (
                        <RecordCard key={rec.id} record={rec} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Access List */}
              {patientTab === 'accessList' && (
                <div>
                  <h2 style={{ marginBottom: '16px' }}>Authorized Access List</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Viewers Column */}
                    <div className="card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3>Viewers</h3>
                        <RoleBadge role="viewer" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {mockAccessList.viewers.map((addr, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <AddressChip address={addr} label={i === 0 ? 'Dr. David' : 'User 2'} />
                            <Button
                              variant="danger"
                              style={{ height: '32px', fontSize: '12px' }}
                              onClick={() => {
                                setTargetRevokeAddress(addr);
                                setIsRevokeModalOpen(true);
                              }}
                            >
                              Revoke
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Creators Column */}
                    <div className="card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3>Creators</h3>
                        <RoleBadge role="creator" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {mockAccessList.creators.map((addr, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <AddressChip address={addr} label={i === 0 ? 'Dr. David' : 'Dr. Sarah'} />
                            <Button
                              variant="danger"
                              style={{ height: '32px', fontSize: '12px' }}
                              onClick={() => {
                                setTargetRevokeAddress(addr);
                                setIsRevokeModalOpen(true);
                              }}
                            >
                              Revoke
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Grant Access */}
              {patientTab === 'grantAccess' && (
                <div className="card" style={{ maxWidth: '560px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2>Grant Access Permission</h2>
                    <GasBadge />
                  </div>
                  <p className="text-muted" style={{ marginBottom: '16px', fontSize: 'var(--fs-small)' }}>
                    Authorise a doctor or medical provider by entering their 0x wallet address and selecting their role level.
                  </p>

                  <Input
                    label="Doctor Wallet Address"
                    placeholder="0x..."
                    value={grantAddress}
                    onChange={(e) => setGrantAddress(e.target.value)}
                    isAddress
                    required
                  />

                  <Select
                    label="Access Role Level"
                    value={grantRole}
                    onChange={(e) => setGrantRole(e.target.value)}
                    options={[
                      { value: 'v', label: 'Viewer (v) — Can view health records' },
                      { value: 'c', label: 'Creator (c) — Can upload & add health records' },
                      { value: 'm', label: 'Master (m) — Both view and create records' },
                    ]}
                  />

                  <div style={{ marginTop: '20px' }}>
                    <Button variant="primary">
                      Submit Grant Access
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* S4: DOCTOR DASHBOARD MOCK */}
        {/* ======================================================== */}
        {activeScreen === 'S4_doctor' && (
          <div className="layout-with-sidebar">
            <aside className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Doctor Menu
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'viewRecord', label: ' View Patient Records', icon: '🔍' },
                  { id: 'createRecord', label: ' Create Patient Record', icon: '📝' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDoctorTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: doctorTab === item.id ? 'var(--primary-50)' : 'transparent',
                      color: doctorTab === item.id ? 'var(--primary-700)' : 'var(--text)',
                      fontWeight: doctorTab === item.id ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div>
              {doctorTab === 'viewRecord' && (
                <div>
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h3>Search Patient Records</h3>
                    <p className="text-muted" style={{ fontSize: 'var(--fs-small)', marginBottom: '12px' }}>
                      Reading record CIDs on-chain is free and does not consume gas.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Input
                          placeholder="Enter patient 0x address..."
                          value={lookupAddress}
                          onChange={(e) => setLookupAddress(e.target.value)}
                          isAddress
                        />
                      </div>
                      <Button variant="primary">Load Records</Button>
                      <Button variant="secondary" onClick={() => setIsDoctorBlocked(!isDoctorBlocked)}>
                        {isDoctorBlocked ? 'Unblock Access' : 'Simulate Blocked'}
                      </Button>
                    </div>
                  </div>

                  {isDoctorBlocked ? (
                    <StatusToast
                      state="error"
                      message="You have not been granted viewer access by this patient."
                      rawError="execution reverted: You are not granted as viewer"
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '16px' }}>Patient Records ({mockRecords.length})</h3>
                      {mockRecords.map((r) => (
                        <RecordCard key={r.id} record={r} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {doctorTab === 'createRecord' && (
                <div className="card" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2>Create Patient EHR Record</h2>
                    <GasBadge />
                  </div>

                  <Stepper currentStep={stepperStep} />

                  <Input
                    label="Patient Wallet Address"
                    placeholder="0x..."
                    value={lookupAddress}
                    onChange={(e) => setLookupAddress(e.target.value)}
                    isAddress
                    required
                  />

                  <Input
                    label="Doctor Display Name"
                    value="Dr. David Ross"
                    disabled
                  />

                  <FilePicker
                    selectedFile={selectedUploadFile}
                    onFileSelect={(f) => setSelectedUploadFile(f)}
                  />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button
                      variant="primary"
                      onClick={() => setStepperStep((prev) => (prev % 3) + 1)}
                    >
                      Step Progress ({stepperStep}/3)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* S5: GLOBAL STATES & TOASTS PREVIEW */}
        {/* ======================================================== */}
        {activeScreen === 'S5_states' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px' }}>S5 Global Transaction States & Toasts</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3>Pending Transaction State</h3>
                <StatusToast
                  state={mockTxStates.pending.status}
                  message={mockTxStates.pending.message}
                />
              </div>

              <div>
                <h3>Success Transaction State</h3>
                <StatusToast
                  state={mockTxStates.success.status}
                  message={mockTxStates.success.message}
                  txHash={mockTxStates.success.txHash}
                />
              </div>

              <div>
                <h3>Error Transaction State with Revert Details</h3>
                <StatusToast
                  state={mockTxStates.error.status}
                  message={mockTxStates.error.message}
                  rawError={mockTxStates.error.rawError}
                />
              </div>

              <div className="card" style={{ marginTop: '12px' }}>
                <h3>Confirmation Modal Preview</h3>
                <p className="text-muted" style={{ marginBottom: '12px', fontSize: '14px' }}>
                  Click below to trigger the Revoke Access confirmation modal.
                </p>
                <Button variant="danger" onClick={() => setIsRevokeModalOpen(true)}>
                  Trigger Revoke Confirmation Modal
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        title="Revoke Access Permission?"
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={() => setIsRevokeModalOpen(false)}
        confirmLabel="Yes, Revoke Access"
        confirmVariant="danger"
      >
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text)' }}>
          Are you sure you want to revoke access permissions for address{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
            {targetRevokeAddress || '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC'}
          </code>
          ?
        </p>
        <p style={{ marginTop: '8px', fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
          This will submit a transaction to the Ethereum contract removing their viewer and/or creator access.
        </p>
      </Modal>
    </div>
  );
}
