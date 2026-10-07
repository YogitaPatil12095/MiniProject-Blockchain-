import React, { useState, useEffect } from "react";
import { usePHR } from "../hooks/usePHR";
import { useWallet } from "../context/WalletContext";
import { MEDICAL_SPECIALTIES } from "../lib/constants";
import { truncateAddress } from "../lib/contract";
import { ShieldCheck, UserPlus, Stethoscope, Users, Calendar, MessageSquare, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const { account } = useWallet();
  const {
    isAdmin,
    adminRegisterDoctor,
    adminRegisterPatient,
    adminRevokeUser,
    fetchRegisteredDoctors,
    fetchRegisteredPatients,
    fetchAllAppointments,
    updateAppointmentStatus,
    fetchChatbotLogs,
  } = usePHR();

  const [activeTab, setActiveTab] = useState("register-doctor"); // "register-doctor" | "register-patient" | "manage-users" | "appointments" | "chatbot-logs"
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [chatbotLogsList, setChatbotLogsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionStatus, setActionStatus] = useState({ state: "idle", message: "", txHash: "" });

  // Form States
  const [docForm, setDocForm] = useState({
    doctorAddress: "",
    doctorId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: "",
    specialty: MEDICAL_SPECIALTIES[0],
    qualification: "MBBS, MD",
    phoneNumber: "",
    location: "Mumbai, Maharashtra",
    photoIpfsCid: "",
  });

  const [patientForm, setPatientForm] = useState({
    patientAddress: "",
    aadhaarNumber: "",
    fullName: "",
    gender: "Male",
    homeAddress: "",
    phoneNumber: "",
    birthday: "1995-05-15",
    bloodType: "O+",
    heightCm: 172,
    weightKg: 68,
    photoIpfsCid: "",
  });

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [docs, pats, appts, logs] = await Promise.all([
        fetchRegisteredDoctors(),
        fetchRegisteredPatients(),
        fetchAllAppointments(),
        fetchChatbotLogs(),
      ]);
      setDoctorsList(docs);
      setPatientsList(pats);
      setAppointmentsList(appts);
      setChatbotLogsList(logs);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setActionStatus({ state: "pending", message: "Registering doctor on blockchain...", txHash: "" });
    try {
      const res = await adminRegisterDoctor(docForm);
      setActionStatus({ state: "success", message: `Dr. ${docForm.fullName} successfully registered!`, txHash: res.txHash });
      setDocForm({
        doctorAddress: "",
        doctorId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: "",
        specialty: MEDICAL_SPECIALTIES[0],
        qualification: "MBBS, MD",
        phoneNumber: "",
        location: "Mumbai, Maharashtra",
        photoIpfsCid: "",
      });
      await loadAdminData();
    } catch (err) {
      setActionStatus({ state: "error", message: err.message, txHash: "" });
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setActionStatus({ state: "pending", message: "Registering patient with Aadhaar verification...", txHash: "" });
    try {
      const res = await adminRegisterPatient(patientForm);
      setActionStatus({ state: "success", message: `Patient ${patientForm.fullName} successfully registered!`, txHash: res.txHash });
      setPatientForm({
        patientAddress: "",
        aadhaarNumber: "",
        fullName: "",
        gender: "Male",
        homeAddress: "",
        phoneNumber: "",
        birthday: "1995-05-15",
        bloodType: "O+",
        heightCm: 172,
        weightKg: 68,
        photoIpfsCid: "",
      });
      await loadAdminData();
    } catch (err) {
      setActionStatus({ state: "error", message: err.message, txHash: "" });
    }
  };

  const handleRevokeAccount = async (targetAddress) => {
    if (!window.confirm(`Are you sure you want to revoke account access for ${targetAddress}?`)) return;
    setActionStatus({ state: "pending", message: "Revoking user account on blockchain...", txHash: "" });
    try {
      const res = await adminRevokeUser(targetAddress);
      setActionStatus({ state: "success", message: `Account ${truncateAddress(targetAddress)} revoked.`, txHash: res.txHash });
      await loadAdminData();
    } catch (err) {
      setActionStatus({ state: "error", message: err.message, txHash: "" });
    }
  };

  const handleUpdateAppt = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #1e1b4b 100%)",
          color: "#fff",
          borderRadius: 16,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <ShieldCheck size={26} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>System Administrator Portal</h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
            Supreme Hospital Authority oversight: Manage doctor credentials, register verified Aadhaar patients, audit appointments, and inspect chatbot telemetry.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          disabled={loadingData}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <RefreshCw size={15} className={loadingData ? "spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 13 }}>
            <span>Verified Doctors</span>
            <Stethoscope size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>
            {doctorsList.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--success)", marginTop: 4 }}>Registered on Ledger</div>
        </div>

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 13 }}>
            <span>Aadhaar Patients</span>
            <Users size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>
            {patientsList.length}
          </div>
          <div style={{ fontSize: 11, color: "#6366F1", marginTop: 4 }}>Identity Linked</div>
        </div>

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 13 }}>
            <span>Hospital Appointments</span>
            <Calendar size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>
            {appointmentsList.length}
          </div>
          <div style={{ fontSize: 11, color: "#F59E0B", marginTop: 4 }}>Total System Bookings</div>
        </div>

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 13 }}>
            <span>Chatbot Audit Logs</span>
            <MessageSquare size={18} color="#06B6D4" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>
            {chatbotLogsList.length}
          </div>
          <div style={{ fontSize: 11, color: "#06B6D4", marginTop: 4 }}>Patient Navigation Logs</div>
        </div>
      </div>

      {/* Status Notification */}
      {actionStatus.state !== "idle" && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              actionStatus.state === "pending"
                ? "#FEF3C7"
                : actionStatus.state === "success"
                ? "#DCFCE7"
                : "#FEE2E2",
            color:
              actionStatus.state === "pending"
                ? "#92400E"
                : actionStatus.state === "success"
                ? "#166534"
                : "#991B1B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {actionStatus.state === "success" && <CheckCircle size={18} />}
            {actionStatus.state === "error" && <AlertTriangle size={18} />}
            <span>{actionStatus.message}</span>
          </div>
          {actionStatus.txHash && (
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>
              Tx: {truncateAddress(actionStatus.txHash, 10, 8)}
            </span>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8, overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("register-doctor")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "register-doctor" ? "var(--primary-600)" : "transparent",
            color: activeTab === "register-doctor" ? "#fff" : "var(--text-muted)",
          }}
        >
          Register Doctor
        </button>
        <button
          onClick={() => setActiveTab("register-patient")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "register-patient" ? "var(--primary-600)" : "transparent",
            color: activeTab === "register-patient" ? "#fff" : "var(--text-muted)",
          }}
        >
          Register Patient (Aadhaar)
        </button>
        <button
          onClick={() => setActiveTab("manage-users")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "manage-users" ? "var(--primary-600)" : "transparent",
            color: activeTab === "manage-users" ? "#fff" : "var(--text-muted)",
          }}
        >
          Account Management
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "appointments" ? "var(--primary-600)" : "transparent",
            color: activeTab === "appointments" ? "#fff" : "var(--text-muted)",
          }}
        >
          Hospital Appointments
        </button>
        <button
          onClick={() => setActiveTab("chatbot-logs")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "chatbot-logs" ? "var(--primary-600)" : "transparent",
            color: activeTab === "chatbot-logs" ? "#fff" : "var(--text-muted)",
          }}
        >
          Chatbot Logs Audit
        </button>
      </div>

      {/* Tab 1: Register Doctor */}
      {activeTab === "register-doctor" && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "var(--text)" }}>Add Verified Medical Doctor (Fig 8)</h3>
          <form onSubmit={handleRegisterDoctor} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Doctor Ethereum Wallet Address *
              </label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={docForm.doctorAddress}
                onChange={(e) => setDocForm({ ...docForm, doctorAddress: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Unique Doctor ID (Ganache / Board ID) *
              </label>
              <input
                type="text"
                required
                value={docForm.doctorId}
                onChange={(e) => setDocForm({ ...docForm, doctorId: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Sangeeta Verma"
                value={docForm.fullName}
                onChange={(e) => setDocForm({ ...docForm, fullName: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Medical Specialty *
              </label>
              <select
                value={docForm.specialty}
                onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              >
                {MEDICAL_SPECIALTIES.map((spec, i) => (
                  <option key={i} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Qualifications *
              </label>
              <input
                type="text"
                required
                placeholder="MBBS, MD (Pulmonology)"
                value={docForm.qualification}
                onChange={(e) => setDocForm({ ...docForm, qualification: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Contact Phone *
              </label>
              <input
                type="text"
                required
                placeholder="+91-9876543210"
                value={docForm.phoneNumber}
                onChange={(e) => setDocForm({ ...docForm, phoneNumber: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={actionStatus.state === "pending"}
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserPlus size={16} />
                <span>Submit Doctor Registration (Requires Gas)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Register Patient (Aadhaar) */}
      {activeTab === "register-patient" && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "var(--text)" }}>Register Patient with Aadhaar Verification (Fig 9)</h3>
          <form onSubmit={handleRegisterPatient} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Patient Ethereum Address *
              </label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={patientForm.patientAddress}
                onChange={(e) => setPatientForm({ ...patientForm, patientAddress: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Aadhaar Number (Primary Identifier) *
              </label>
              <input
                type="text"
                required
                placeholder="XXXX-XXXX-XXXX"
                value={patientForm.aadhaarNumber}
                onChange={(e) => setPatientForm({ ...patientForm, aadhaarNumber: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="Aarush Sharma"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Gender *
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Blood Group
              </label>
              <select
                value={patientForm.bloodType}
                onChange={(e) => setPatientForm({ ...patientForm, bloodType: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={patientForm.birthday}
                onChange={(e) => setPatientForm({ ...patientForm, birthday: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Home Address *
              </label>
              <input
                type="text"
                required
                placeholder="Flat 402, Sunshine Heights, Mumbai"
                value={patientForm.homeAddress}
                onChange={(e) => setPatientForm({ ...patientForm, homeAddress: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={actionStatus.state === "pending"}
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserPlus size={16} />
                <span>Submit Patient Registration (Requires Gas)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Manage Users */}
      {activeTab === "manage-users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>Registered Doctors Directory</h3>
            {doctorsList.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No registered doctors found on-chain.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "8px 12px" }}>Doctor Address</th>
                    <th style={{ padding: "8px 12px" }}>Status</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.map((addr, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{addr}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                          Active Doctor
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleRevokeAccount(addr)}
                          style={{ backgroundColor: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                        >
                          Revoke Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>Registered Patients Directory</h3>
            {patientsList.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No registered patients found on-chain.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "8px 12px" }}>Patient Address</th>
                    <th style={{ padding: "8px 12px" }}>Status</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsList.map((addr, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{addr}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                          Verified Patient
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleRevokeAccount(addr)}
                          style={{ backgroundColor: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                        >
                          Revoke Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Hospital Appointments */}
      {activeTab === "appointments" && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>Hospital Master Appointments Schedule</h3>
          {appointmentsList.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No appointments scheduled yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "8px 12px" }}>ID</th>
                  <th style={{ padding: "8px 12px" }}>Patient</th>
                  <th style={{ padding: "8px 12px" }}>Doctor</th>
                  <th style={{ padding: "8px 12px" }}>Specialty & Slot</th>
                  <th style={{ padding: "8px 12px" }}>Status</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Oversight Action</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsList.map((a) => (
                  <tr key={a.appointmentId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>#{a.appointmentId}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div>{a.patientName || "Patient"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{truncateAddress(a.patientAddress)}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div>{a.doctorName || "Doctor"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{truncateAddress(a.doctorAddress)}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div>{a.specialty}</div>
                      <div style={{ fontSize: 11, color: "var(--primary-600)" }}>{a.timeSlot}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor:
                            a.status === "Confirmed"
                              ? "#DCFCE7"
                              : a.status === "Pending"
                              ? "#FEF3C7"
                              : "#F3F4F6",
                          color:
                            a.status === "Confirmed"
                              ? "#166534"
                              : a.status === "Pending"
                              ? "#92400E"
                              : "#374151",
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      {a.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateAppt(a.appointmentId, "Confirmed")}
                          style={{
                            backgroundColor: "var(--primary-600)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: Chatbot Logs Audit */}
      {activeTab === "chatbot-logs" && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>Chatbot Interaction Audit Logs (Fig 3)</h3>
          {chatbotLogsList.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No chatbot interaction records logged yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "8px 12px" }}>Time</th>
                  <th style={{ padding: "8px 12px" }}>User Address</th>
                  <th style={{ padding: "8px 12px" }}>Category</th>
                  <th style={{ padding: "8px 12px" }}>Inquiry / Query</th>
                </tr>
              </thead>
              <tbody>
                {chatbotLogsList.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                      {new Date(log.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>
                      {truncateAddress(log.userAddress)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ backgroundColor: "var(--bg)", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
                        {log.category}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text)" }}>{log.query}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
