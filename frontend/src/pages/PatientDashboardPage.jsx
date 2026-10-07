import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { ethers } from "ethers";
import {
  User,
  FileText,
  Shield,
  Calendar,
  Pill,
  Printer,
  Edit,
  Lock,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Member A UI Components
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { GasBadge } from "../components/ui/GasBadge";
import { AddressChip } from "../components/ui/AddressChip";
import { RoleBadge } from "../components/ui/RoleBadge";
import { Modal } from "../components/ui/Modal";
import { StatusToast } from "../components/ui/StatusToast";

export default function PatientDashboardPage() {
  const { account } = useWallet();
  const {
    fetchEHRRecords,
    fetchMyAccessList,
    grantAccess,
    revokeAccess,
    updatePatientDemographics,
    fetchPatientAppointments,
    patientDemographicsData,
    userProfile,
  } = usePHR();

  const [activeTab, setActiveTab] = useState("records"); // "records" | "demographics" | "access" | "grant" | "appointments"
  const [records, setRecords] = useState([]);
  const [accessList, setAccessList] = useState({ viewers: [], creators: [] });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [txState, setTxState] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  // Demographics edit modal state
  const [isEditDemoOpen, setIsEditDemoOpen] = useState(false);
  const [demoAddress, setDemoAddress] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoBlood, setDemoBlood] = useState("O+");
  const [demoHeight, setDemoHeight] = useState(170);
  const [demoWeight, setDemoWeight] = useState(65);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Grant form state
  const [grantAddress, setGrantAddress] = useState("");
  const [grantRole, setGrantRole] = useState("v");

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState(null);

  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      const [ehrData, accessData, appts] = await Promise.all([
        fetchEHRRecords(account),
        fetchMyAccessList(),
        fetchPatientAppointments(account),
      ]);
      setRecords([...ehrData].sort((a, b) => b.createdAt - a.createdAt));
      setAccessList(accessData);
      setAppointments([...appts].sort((a, b) => b.dateTimestamp - a.dateTimestamp));
    } catch (err) {
      console.error("Error loading patient data:", err);
      setTxState({
        status: "error",
        message: err.message || "Failed to load records or access list.",
        rawError: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [account, fetchEHRRecords, fetchMyAccessList, fetchPatientAppointments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (patientDemographicsData) {
      setDemoAddress(patientDemographicsData.homeAddress || userProfile?.homeAddress || "");
      setDemoPhone(patientDemographicsData.phoneNumber || userProfile?.phone || "");
      setDemoBlood(patientDemographicsData.bloodType || "O+");
      setDemoHeight(patientDemographicsData.heightCm || 170);
      setDemoWeight(patientDemographicsData.weightKg || 65);
    }
  }, [patientDemographicsData, userProfile]);

  // Handle Edit Demographics Submit
  const handleSaveDemographics = async (e) => {
    e.preventDefault();
    setTxState({ status: "pending", message: "Updating patient demographics on Ethereum...", txHash: "" });
    try {
      setActionLoading(true);
      const res = await updatePatientDemographics({
        homeAddress: demoAddress,
        phoneNumber: demoPhone,
        bloodType: demoBlood,
        heightCm: demoHeight,
        weightKg: demoWeight,
        photoIpfsCid: patientDemographicsData?.photoIpfsCid || "",
      });
      setTxState({
        status: "success",
        message: "Demographics successfully updated on blockchain!",
        txHash: res.txHash,
      });
      setIsEditDemoOpen(false);
      await loadData();
    } catch (err) {
      setTxState({
        status: "error",
        message: err.message || "Failed to update demographics.",
        rawError: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Grant Access
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setTxState({ status: "pending", message: "Granting permissions on Ethereum...", txHash: "" });

    if (!ethers.isAddress(grantAddress)) {
      setTxState({ status: "error", message: "Please enter a valid Ethereum address (0x...)", rawError: "" });
      return;
    }

    try {
      setActionLoading(true);
      const res = await grantAccess(grantAddress, grantRole);
      setTxState({
        status: "success",
        message: `Successfully granted ${grantRole === "v" ? "Viewer" : grantRole === "c" ? "Creator" : "Master"} access!`,
        txHash: res.txHash,
      });
      setGrantAddress("");
      await loadData();
      setActiveTab("access");
    } catch (err) {
      setTxState({
        status: "error",
        message: err.message || "Failed to grant access.",
        rawError: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Revoke Access
  const handleRevokeAccess = async () => {
    if (!revokeTarget) return;
    setTxState({ status: "pending", message: "Revoking access on Ethereum...", txHash: "" });

    try {
      setActionLoading(true);
      const res = await revokeAccess(revokeTarget.address, revokeTarget.role);
      setTxState({
        status: "success",
        message: "Successfully revoked access permissions.",
        txHash: res.txHash,
      });
      setRevokeTarget(null);
      await loadData();
    } catch (err) {
      setTxState({
        status: "error",
        message: err.message || "Failed to revoke access.",
        rawError: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const ipfsGatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

  const maskedAadhaar = patientDemographicsData?.aadhaarNumber
    ? showAadhaar
      ? patientDemographicsData.aadhaarNumber
      : `XXXX-XXXX-${patientDemographicsData.aadhaarNumber.slice(-4)}`
    : "Not Registered";

  return (
    <div className="portal-layout">
      {/* ── Left Sidebar Navigation ── */}
      <aside className="portal-sidebar">
        {/* Patient Profile Card Snippet */}
        <div style={{ padding: "12px", backgroundColor: "var(--primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(15, 118, 110, 0.15)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "var(--primary-600)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{userProfile?.fullName || "Patient"}</div>
              <span style={{ fontSize: "11px", color: "var(--primary-800)", fontWeight: 600 }}>Aadhaar Verified</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(15, 118, 110, 0.15)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
            <span style={{ color: "var(--text-muted)" }}>Blood Group:</span>
            <strong style={{ color: "var(--danger)" }}>{patientDemographicsData?.bloodType || "O+"}</strong>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <FileText size={16} />
            <span>Health Records ({records.length})</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "demographics" ? "active" : ""}`}
            onClick={() => setActiveTab("demographics")}
          >
            <User size={16} />
            <span>Demographics Profile</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar size={16} />
            <span>Appointments ({appointments.length})</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "access" ? "active" : ""}`}
            onClick={() => setActiveTab("access")}
          >
            <Shield size={16} />
            <span>Access List ({accessList.viewers.length + accessList.creators.length})</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "grant" ? "active" : ""}`}
            onClick={() => setActiveTab("grant")}
          >
            <Lock size={16} />
            <span>Grant Doctor Access</span>
          </button>
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Banner */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "var(--primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-600)",
                  boxShadow: "0 2px 8px rgba(15, 118, 110, 0.15)",
                }}
              >
                <User size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "700", color: "var(--text)" }}>
                  Patient Health Portal
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>
                    Aadhaar ID: <strong style={{ color: "var(--text)" }}>{maskedAadhaar}</strong>
                  </span>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>•</span>
                  <AddressChip address={account} isSelf={true} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button variant="secondary" onClick={() => window.print()} style={{ height: 38, fontSize: "13px" }}>
                <Printer size={15} />
                <span>Print Records</span>
              </Button>
              <Button variant="secondary" onClick={loadData} isLoading={loading} loadingText="Refreshing..." style={{ height: 38, fontSize: "13px" }}>
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Global Status Toast */}
        <StatusToast
          state={txState.status}
          message={txState.message}
          txHash={txState.txHash}
          rawError={txState.rawError}
          onDismiss={() => setTxState({ status: "idle", message: "" })}
        />

      {/* TAB 1: My Health Records (FR-2) */}
      {activeTab === "records" && (
        <div>
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "32px 0", textAlign: "center" }}>
              Loading health records from Ethereum & IPFS...
            </p>
          ) : records.length === 0 ? (
            <EmptyState
              title="No Health Records Stored"
              description="You have no medical records stored on IPFS. Grant a doctor Creator access so they can prescribe medications and attach diagnostic reports."
              actionLabel="Grant Access to Doctor"
              onAction={() => setActiveTab("grant")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {records.map((rec, idx) => (
                <div key={idx} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--primary-700)" }}>
                          {rec.diagnosis || `Clinical Consultation #${records.length - idx}`}
                        </h3>
                        {rec.isDetailed && (
                          <span style={{ padding: "2px 8px", borderRadius: "999px", backgroundColor: "rgba(15, 118, 110, 0.1)", color: "var(--primary-700)", fontSize: "11px", fontWeight: "600" }}>
                            Verified Clinical Prescription
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginTop: "4px" }}>
                        Consultant: <strong>{rec.creator_name}</strong> • Recorded: {new Date(rec.createdAt * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Prescribed Medications Table */}
                  {Array.isArray(rec.medications) && rec.medications.length > 0 && (
                    <div style={{ backgroundColor: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "var(--primary-700)", fontWeight: "600", fontSize: "13px" }}>
                        <Pill size={16} />
                        <span>Prescribed Medications ({rec.medications.length})</span>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)", fontSize: "12px" }}>
                              <th style={{ padding: "6px 8px" }}>Drug Name</th>
                              <th style={{ padding: "6px 8px" }}>Dosage</th>
                              <th style={{ padding: "6px 8px" }}>Frequency</th>
                              <th style={{ padding: "6px 8px" }}>Duration</th>
                              <th style={{ padding: "6px 8px" }}>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rec.medications.map((m, mIdx) => (
                              <tr key={mIdx} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                                <td style={{ padding: "8px", fontWeight: "600", color: "var(--text)" }}>{m.name}</td>
                                <td style={{ padding: "8px", color: "var(--text-muted)" }}>{m.dosage}</td>
                                <td style={{ padding: "8px", color: "var(--text-muted)" }}>{m.frequency}</td>
                                <td style={{ padding: "8px", color: "var(--text-muted)" }}>{m.duration}</td>
                                <td style={{ padding: "8px", color: "var(--text-muted)" }}>{m.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recommended Lab Tests & Follow-Up */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                    {Array.isArray(rec.tests) && rec.tests.length > 0 && (
                      <div style={{ backgroundColor: "var(--bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                          Recommended Tests / Diagnostics:
                        </span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {rec.tests.map((t, tIdx) => (
                            <span key={tIdx} style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text)" }}>
                              🧪 {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.followUpNotes && (
                      <div style={{ backgroundColor: "var(--bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                          Doctor's Follow-Up Advice:
                        </span>
                        <p style={{ fontSize: "13px", color: "var(--text)", margin: 0 }}>{rec.followUpNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Encrypted Document & IPFS CID */}
                  {rec.ipfs_location && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Lock size={14} color="var(--primary-600)" />
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Encrypted Report IPFS CID: <code>{rec.ipfs_location.slice(0, 16)}…{rec.ipfs_location.slice(-8)}</code>
                        </span>
                      </div>
                      <a
                        href={`${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--primary-600)", fontWeight: "600", textDecoration: "none" }}
                      >
                        <span>View Encrypted Document</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Demographics Profile (FR-4) */}
      {activeTab === "demographics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)" }}>
                Patient Identification & Demographics
              </h3>
              <Button variant="secondary" onClick={() => setIsEditDemoOpen(true)} style={{ height: 34, fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Edit size={14} />
                <span>Edit Profile</span>
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Full Name:</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{userProfile?.fullName || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Aadhaar Number:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{maskedAadhaar}</span>
                  {patientDemographicsData?.aadhaarNumber && (
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      style={{ border: "none", background: "transparent", color: "var(--primary-600)", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                    >
                      {showAadhaar ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Blood Group:</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--danger)" }}>{patientDemographicsData?.bloodType || "O+"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Height & Weight:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>
                  {patientDemographicsData?.heightCm || 170} cm • {patientDemographicsData?.weightKg || 65} kg
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Phone Number:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>{patientDemographicsData?.phoneNumber || userProfile?.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Home Residential Address:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)", maxWidth: "240px", textAlign: "right" }}>
                  {patientDemographicsData?.homeAddress || userProfile?.homeAddress || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Date of Birth:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>{userProfile?.birthday || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: My Appointments (FR-9) */}
      {activeTab === "appointments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)" }}>
                  My Booked Appointments ({appointments.length})
                </h3>
                <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>
                  Track your appointment confirmations and consultation schedules.
                </p>
              </div>
              <Button variant="primary" onClick={() => window.location.href = "/appointments"} style={{ height: 34, fontSize: "13px" }}>
                ➕ Book New Appointment
              </Button>
            </div>

            {appointments.length === 0 ? (
              <EmptyState
                title="No Appointments Scheduled"
                description="You haven't scheduled any doctor consultations yet."
                actionLabel="Book an Appointment"
                onAction={() => window.location.href = "/appointments"}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text)" }}>
                          {appt.specialty} Consultation
                        </span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor:
                              appt.status === "Approved"
                                ? "rgba(16, 185, 129, 0.1)"
                                : appt.status === "Completed"
                                ? "rgba(59, 130, 246, 0.1)"
                                : appt.status === "Cancelled"
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(245, 158, 11, 0.1)",
                            color:
                              appt.status === "Approved"
                                ? "var(--success)"
                                : appt.status === "Completed"
                                ? "#3B82F6"
                                : appt.status === "Cancelled"
                                ? "var(--danger)"
                                : "#D97706",
                          }}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>Doctor: <AddressChip address={appt.doctorAddress} /></span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} />
                          {new Date(appt.dateTimestamp * 1000).toLocaleDateString()} at {appt.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Access List (FR-3 & FR-7) */}
      {activeTab === "access" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Viewers Column */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "4px" }}>
              Authorized Viewers ({accessList.viewers.length})
            </h3>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "16px" }}>
              Addresses permitted to view your encrypted medical records.
            </p>

            {accessList.viewers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-small)" }}>No viewers granted.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {accessList.viewers.map((viewerAddr, idx) => {
                  const isSelf = viewerAddr.toLowerCase() === account.toLowerCase();
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AddressChip address={viewerAddr} />
                        {isSelf ? <RoleBadge role="viewer" customLabel="You" /> : <RoleBadge role="viewer" />}
                      </div>
                      {!isSelf && (
                        <Button
                          variant="danger"
                          onClick={() => setRevokeTarget({ address: viewerAddr, role: "v" })}
                          disabled={actionLoading}
                          style={{ height: 32, padding: "0 10px", fontSize: "12px" }}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creators Column */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "4px" }}>
              Authorized Creators ({accessList.creators.length})
            </h3>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "16px" }}>
              Doctors and clinics permitted to upload new EHR files for you.
            </p>

            {accessList.creators.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-small)" }}>No creators granted.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {accessList.creators.map((creatorAddr, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <AddressChip address={creatorAddr} />
                      <RoleBadge role="creator" />
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => setRevokeTarget({ address: creatorAddr, role: "c" })}
                      disabled={actionLoading}
                      style={{ height: 32, padding: "0 10px", fontSize: "12px" }}
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Grant Access (FR-4) */}
      {activeTab === "grant" && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                Grant Record Access to Doctor
              </h3>
              <GasBadge />
            </div>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "24px" }}>
              Grant an authorized physician or clinic Viewer, Creator, or Master (both) permissions.
            </p>

            <form onSubmit={handleGrantAccess}>
              <Input
                label="Target Doctor Ethereum Address"
                placeholder="0x..."
                value={grantAddress}
                onChange={(e) => setGrantAddress(e.target.value)}
                isAddress={true}
                required
              />

              <Select
                label="Access Permission Level"
                value={grantRole}
                onChange={(e) => setGrantRole(e.target.value)}
                options={[
                  { value: "v", label: "Viewer (Can only read your records)" },
                  { value: "c", label: "Creator (Can only upload new records for you)" },
                  { value: "m", label: "Master (Full Viewer + Creator permissions)" },
                ]}
              />

              <div style={{ marginTop: "24px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={actionLoading}
                  loadingText="Confirming Grant..."
                  style={{ width: "100%", height: 44 }}
                >
                  Grant Permissions in MetaMask
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Demographics Modal */}
      <Modal
        isOpen={isEditDemoOpen}
        onClose={() => setIsEditDemoOpen(false)}
        onConfirm={handleSaveDemographics}
        title="Edit Patient Demographics"
        confirmLabel="Save Demographics"
        variant="primary"
        isLoading={actionLoading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input
            label="Residential Address"
            value={demoAddress}
            onChange={(e) => setDemoAddress(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={demoPhone}
            onChange={(e) => setDemoPhone(e.target.value)}
            required
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <Select
              label="Blood Group"
              value={demoBlood}
              onChange={(e) => setDemoBlood(e.target.value)}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />
            <Input
              label="Height (cm)"
              type="number"
              value={demoHeight}
              onChange={(e) => setDemoHeight(e.target.value)}
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={demoWeight}
              onChange={(e) => setDemoWeight(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <GasBadge />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>This action requires a gas transaction.</span>
          </div>
        </div>
      </Modal>

      {/* Revoke Confirmation Modal (FR-7) */}
      <Modal
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeAccess}
        title="Revoke Permission Confirmation"
        confirmLabel="Revoke Access"
        variant="danger"
        isLoading={actionLoading}
      >
        <p style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginBottom: "12px" }}>
          Are you sure you want to revoke {revokeTarget?.role === "v" ? "Viewer" : revokeTarget?.role === "c" ? "Creator" : "Master"} access from:
        </p>
        <div style={{ marginBottom: "16px" }}>
          <AddressChip address={revokeTarget?.address || ""} copyable={false} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <GasBadge />
          <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>This action requires a blockchain gas transaction.</span>
        </div>
      </Modal>
    </div>
  </div>
  );
}

