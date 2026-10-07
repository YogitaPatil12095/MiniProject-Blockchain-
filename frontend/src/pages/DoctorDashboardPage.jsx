import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { uploadToIPFS } from "../lib/ipfs";
import { encryptMedicalFile } from "../lib/crypto";
import { ethers } from "ethers";
import {
  Stethoscope,
  FilePlus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pill,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
  Plus
} from "lucide-react";

// Member A UI Components
import { FilePicker } from "../components/ui/FilePicker";
import { Stepper } from "../components/ui/Stepper";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GasBadge } from "../components/ui/GasBadge";
import { AddressChip } from "../components/ui/AddressChip";
import { StatusToast } from "../components/ui/StatusToast";
import { Modal } from "../components/ui/Modal";

export default function DoctorDashboardPage() {
  const { account } = useWallet();
  const {
    fetchEHRRecords,
    createDetailedEHRRecord,
    updateEHRRecord,
    deleteEHRRecord,
    fetchDoctorAppointments,
    updateAppointmentStatus,
    updateDoctorProfile,
    doctorProfileData,
    userProfile,
  } = usePHR();

  const [activeTab, setActiveTab] = useState("view"); // "view" | "create" | "appointments" | "profile"

  // View records state (FR-5 & FR-7)
  const [searchAddress, setSearchAddress] = useState("");
  const [patientRecords, setPatientRecords] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewToast, setViewToast] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  // Edit record modal state
  const [editingRecord, setEditingRecord] = useState(null); // { index, ...record }
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");
  const [editMeds, setEditMeds] = useState([]);
  const [editTests, setEditTests] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete record modal state
  const [deletingRecordIndex, setDeletingRecordIndex] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create record state (FR-6)
  const [createPatientAddress, setCreatePatientAddress] = useState("");
  const [doctorName, setDoctorName] = useState(userProfile?.fullName || doctorProfileData?.fullName || "Dr. Medical Specialist");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "1-0-1", duration: "5 days", remarks: "After food" },
  ]);
  const [testsInput, setTestsInput] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState("Intellihealth-Secure-Key-2024");
  const [uploadStep, setUploadStep] = useState(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createToast, setCreateToast] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  // Doctor Appointments state (FR-9)
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptActionLoading, setApptActionLoading] = useState(false);

  // Doctor Profile Form state (FR-3)
  const [profilePhone, setProfilePhone] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  const ipfsGatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
  const pinataJWT = import.meta.env.VITE_PINATA_JWT || "";

  // Load appointments
  const loadDoctorAppointments = useCallback(async () => {
    if (!account) return;
    try {
      setApptLoading(true);
      const list = await fetchDoctorAppointments(account);
      setAppointments([...list].sort((a, b) => b.dateTimestamp - a.dateTimestamp));
    } catch (e) {
      console.error("Error loading doctor appointments:", e);
    } finally {
      setApptLoading(false);
    }
  }, [account, fetchDoctorAppointments]);

  useEffect(() => {
    if (activeTab === "appointments") {
      loadDoctorAppointments();
    }
  }, [activeTab, loadDoctorAppointments]);

  useEffect(() => {
    if (doctorProfileData) {
      setProfilePhone(doctorProfileData.phoneNumber || "");
      setProfileLocation(doctorProfileData.location || "");
    }
  }, [doctorProfileData]);

  // Handle Search Records
  const handleSearchPatientRecords = async (e) => {
    if (e) e.preventDefault();
    setViewToast({ status: "idle", message: "" });
    setPatientRecords(null);

    if (!ethers.isAddress(searchAddress)) {
      setViewToast({
        status: "error",
        message: "Please enter a valid patient Ethereum address (0x...)",
        rawError: "",
      });
      return;
    }

    try {
      setViewLoading(true);
      const records = await fetchEHRRecords(searchAddress);
      setPatientRecords([...records].sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      setViewToast({
        status: "error",
        message: err.message || "Failed to retrieve records. Ensure the patient granted you Viewer access.",
        rawError: err.message,
      });
    } finally {
      setViewLoading(false);
    }
  };

  // Add & Remove Medication Row in Creation form
  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "1-0-1", duration: "5 days", remarks: "After food" },
    ]);
  };

  const handleMedChange = (index, field, value) => {
    setMedications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveMedication = (index) => {
    if (medications.length <= 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Create EHR Record
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setCreateToast({ status: "idle", message: "" });

    if (!ethers.isAddress(createPatientAddress)) {
      setCreateToast({
        status: "error",
        message: "Please enter a valid patient Ethereum address.",
        rawError: "",
      });
      return;
    }
    if (!diagnosis.trim()) {
      setCreateToast({
        status: "error",
        message: "Please enter a clinical diagnosis / consultation title.",
        rawError: "",
      });
      return;
    }

    try {
      setCreateLoading(true);
      let finalIpfsCid = "QmIntellihealthEncryptedRecordEmpty";

      // Step 1: Encrypt file if provided and pin to IPFS
      setUploadStep(1);
      if (selectedFile) {
        setCreateToast({
          status: "pending",
          message: "Step 1/3: Encrypting diagnostic document (AES-GCM 256-bit) & Pinning to IPFS...",
        });
        const fileBuffer = await selectedFile.arrayBuffer();
        const encryptedBlob = await encryptMedicalFile(fileBuffer, encryptionPassphrase);
        const encryptedFileObj = new File([encryptedBlob], `enc_${selectedFile.name}`, {
          type: "application/octet-stream",
        });
        const ipfsRes = await uploadToIPFS(encryptedFileObj, pinataJWT);
        finalIpfsCid = ipfsRes.cid;
      } else {
        setCreateToast({
          status: "pending",
          message: "Step 1/3: Preparing EHR metadata payload...",
        });
      }

      // Step 2: Write to Ethereum smart contract
      setUploadStep(2);
      setCreateToast({
        status: "pending",
        message: "Step 2/3: Confirming detailed EHR creation transaction in MetaMask...",
      });

      const parsedTests = testsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const activeMeds = medications.filter((m) => m.name.trim().length > 0);

      const txRes = await createDetailedEHRRecord(
        createPatientAddress,
        doctorName,
        finalIpfsCid,
        diagnosis,
        activeMeds,
        parsedTests,
        followUpNotes
      );

      // Step 3: Success
      setUploadStep(3);
      setCreateToast({
        status: "success",
        message: `Clinical EHR recorded on-chain successfully! IPFS CID: ${finalIpfsCid}`,
        txHash: txRes.txHash,
      });

      // Reset form fields
      setDiagnosis("");
      setMedications([{ name: "", dosage: "", frequency: "1-0-1", duration: "5 days", remarks: "After food" }]);
      setTestsInput("");
      setFollowUpNotes("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Create record failed:", err);
      setUploadStep(1);
      setCreateToast({
        status: "error",
        message: err.message || "Failed to create medical record.",
        rawError: err.message,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit Record Modal open
  const handleOpenEdit = (rec, idx) => {
    setEditingRecord({ ...rec, recordIndex: idx });
    setEditDiagnosis(rec.diagnosis || "");
    setEditFollowUp(rec.followUpNotes || "");
    setEditMeds(Array.isArray(rec.medications) && rec.medications.length > 0 ? rec.medications : [{ name: "", dosage: "", frequency: "1-0-1", duration: "5 days", remarks: "" }]);
    setEditTests(Array.isArray(rec.tests) ? rec.tests.join(", ") : "");
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      setEditLoading(true);
      const parsedTests = editTests.split(",").map((t) => t.trim()).filter(Boolean);
      const activeMeds = editMeds.filter((m) => m.name.trim().length > 0);

      const res = await updateEHRRecord(
        searchAddress,
        editingRecord.recordIndex,
        editDiagnosis,
        activeMeds,
        parsedTests,
        editFollowUp
      );

      setViewToast({
        status: "success",
        message: "Record successfully updated on blockchain!",
        txHash: res.txHash,
      });
      setEditingRecord(null);
      await handleSearchPatientRecords();
    } catch (err) {
      setViewToast({
        status: "error",
        message: err.message || "Failed to update EHR record.",
        rawError: err.message,
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async () => {
    if (deletingRecordIndex === null) return;
    try {
      setDeleteLoading(true);
      const res = await deleteEHRRecord(searchAddress, deletingRecordIndex);
      setViewToast({
        status: "success",
        message: "EHR record successfully removed from patient profile.",
        txHash: res.txHash,
      });
      setDeletingRecordIndex(null);
      await handleSearchPatientRecords();
    } catch (err) {
      setViewToast({
        status: "error",
        message: err.message || "Failed to delete EHR record.",
        rawError: err.message,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Appointment Status Update
  const handleApptStatusChange = async (appointmentId, newStatus) => {
    try {
      setApptActionLoading(true);
      await updateAppointmentStatus(appointmentId, newStatus);
      await loadDoctorAppointments();
    } catch (e) {
      console.error("Error updating appointment status:", e);
    } finally {
      setApptActionLoading(false);
    }
  };

  // Handle Update Profile
  const handleUpdateDoctorProfile = async (e) => {
    e.preventDefault();
    setProfileToast({ status: "idle", message: "" });
    try {
      setProfileLoading(true);
      const res = await updateDoctorProfile({
        phoneNumber: profilePhone,
        location: profileLocation,
        photoIpfsCid: doctorProfileData?.photoIpfsCid || "",
      });
      setProfileToast({
        status: "success",
        message: "Doctor profile successfully updated on-chain!",
        txHash: res.txHash,
      });
    } catch (err) {
      setProfileToast({
        status: "error",
        message: err.message || "Failed to update profile.",
        rawError: err.message,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Doctor Header Banner */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "rgba(15, 118, 110, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-600)",
              }}
            >
              <Stethoscope size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                {doctorProfileData?.fullName || userProfile?.fullName || "Doctor / Healthcare Provider Portal"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>Specialty: <strong>{doctorProfileData?.specialty || "General Medicine"}</strong></span>
                <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>•</span>
                <AddressChip address={account} isSelf={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", flexWrap: "wrap" }}>
        <Button
          variant={activeTab === "view" ? "primary" : "secondary"}
          onClick={() => setActiveTab("view")}
          style={{ height: 38 }}
        >
          🔍 View & Manage Patient Records (FR-5 & FR-7)
        </Button>
        <Button
          variant={activeTab === "create" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("create");
            setUploadStep(1);
          }}
          style={{ height: 38 }}
        >
          <FilePlus size={16} />
          <span>Upload & Create Detailed EHR (FR-6)</span>
        </Button>
        <Button
          variant={activeTab === "appointments" ? "primary" : "secondary"}
          onClick={() => setActiveTab("appointments")}
          style={{ height: 38 }}
        >
          <Calendar size={16} />
          <span>My Patient Appointments (FR-9)</span>
        </Button>
        <Button
          variant={activeTab === "profile" ? "primary" : "secondary"}
          onClick={() => setActiveTab("profile")}
          style={{ height: 38 }}
        >
          <User size={16} />
          <span>Doctor Profile Settings (FR-3)</span>
        </Button>
      </div>

      {/* TAB 1: View Patient Records (FR-5 & FR-7) */}
      {activeTab === "view" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "28px", maxWidth: 680 }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "4px" }}>
              Search Patient Health Records
            </h3>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "20px" }}>
              Enter the Ethereum address of a registered patient who has granted you Viewer access. (Direct, zero gas query).
            </p>

            <form onSubmit={handleSearchPatientRecords}>
              <Input
                label="Patient Ethereum Address"
                placeholder="0x..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                isAddress={true}
                required
              />

              <div style={{ marginTop: "16px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={viewLoading}
                  loadingText="Loading Records..."
                >
                  Load Patient Records
                </Button>
              </div>
            </form>
          </div>

          <StatusToast
            state={viewToast.status}
            message={viewToast.message}
            txHash={viewToast.txHash}
            rawError={viewToast.rawError}
            onDismiss={() => setViewToast({ status: "idle", message: "" })}
          />

          {patientRecords !== null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)" }}>
                  Clinical Records for {searchAddress.slice(0, 8)}…{searchAddress.slice(-6)} ({patientRecords.length})
                </h3>
                <GasBadge />
              </div>

              {patientRecords.length === 0 ? (
                <EmptyState
                  title="No Health Records Found"
                  description="This patient has no records in their EHR profile yet, or has revoked access."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {patientRecords.map((rec, idx) => {
                    const isDoctorRecord = rec.creator_address.toLowerCase() === account.toLowerCase();
                    return (
                      <div key={idx} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Card Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--primary-700)" }}>
                                {rec.diagnosis || `Clinical Consultation #${patientRecords.length - idx}`}
                              </h4>
                              {rec.isDetailed && (
                                <span style={{ padding: "2px 8px", borderRadius: "999px", backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366F1", fontSize: "11px", fontWeight: "600" }}>
                                  Detailed Prescription
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginTop: "4px" }}>
                              Recorded by <strong>{rec.creator_name}</strong> ({rec.creator_address.slice(0, 6)}…{rec.creator_address.slice(-4)}) on{" "}
                              {new Date(rec.createdAt * 1000).toLocaleString()}
                            </p>
                          </div>

                          {/* Action Buttons for Authorized Doctor */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {isDoctorRecord && (
                              <>
                                <Button
                                  variant="secondary"
                                  onClick={() => handleOpenEdit(rec, idx)}
                                  style={{ height: 32, padding: "0 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <Edit size={13} />
                                  <span>Edit</span>
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => setDeletingRecordIndex(idx)}
                                  style={{ height: 32, padding: "0 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </Button>
                              </>
                            )}
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
                                    <th style={{ padding: "6px 8px" }}>Brand / Drug</th>
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

                        {/* Diagnostic Tests & Follow-Up */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                          {Array.isArray(rec.tests) && rec.tests.length > 0 && (
                            <div style={{ backgroundColor: "var(--bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                                Recommended Diagnostic Tests:
                              </span>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {rec.tests.map((t, tIdx) => (
                                  <span key={tIdx} style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text)" }}>
                                    🔬 {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.followUpNotes && (
                            <div style={{ backgroundColor: "var(--bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                                Clinical Follow-Up Notes:
                              </span>
                              <p style={{ fontSize: "13px", color: "var(--text)", margin: 0 }}>{rec.followUpNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Encrypted File Attachment & IPFS CID */}
                        {rec.ipfs_location && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Lock size={14} color="var(--primary-600)" />
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Encrypted IPFS CID: <code>{rec.ipfs_location.slice(0, 16)}…{rec.ipfs_location.slice(-8)}</code>
                              </span>
                            </div>
                            <a
                              href={`${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--primary-600)", fontWeight: "600", textDecoration: "none" }}
                            >
                              <span>View Raw IPFS Payload</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Upload & Create Detailed EHR (FR-6) */}
      {activeTab === "create" && (
        <div style={{ maxWidth: 840 }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                Prescribe Medication & Create Detailed EHR
              </h3>
              <GasBadge />
            </div>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "24px" }}>
              Complies with IEEE 2024 Intellihealth standard: client-side AES-GCM 256-bit encryption, Pinata IPFS decentralized storage, and smart contract anchoring.
            </p>

            <Stepper currentStep={uploadStep} />

            <StatusToast
              state={createToast.status}
              message={createToast.message}
              txHash={createToast.txHash}
              rawError={createToast.rawError}
              onDismiss={() => setCreateToast({ status: "idle", message: "" })}
            />

            <form onSubmit={handleCreateRecord} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1: Patient & Doctor */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <Input
                  label="Patient Ethereum Address *"
                  placeholder="0x..."
                  value={createPatientAddress}
                  onChange={(e) => setCreatePatientAddress(e.target.value)}
                  isAddress={true}
                  required
                />
                <Input
                  label="Doctor / Clinic Display Name *"
                  placeholder="e.g. Dr. Jane Specialist"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  required
                />
              </div>

              {/* Diagnosis */}
              <Input
                label="Diagnosis / Consultation Summary *"
                placeholder="e.g. Acute Viral Bronchitis & Respiratory Congestion"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />

              {/* Dynamic Medications Table */}
              <div style={{ backgroundColor: "var(--bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label style={{ fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Pill size={16} color="var(--primary-600)" />
                    <span>Prescribed Medications ({medications.length})</span>
                  </label>
                  <Button type="button" variant="secondary" onClick={handleAddMedication} style={{ height: 30, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Plus size={12} />
                    <span>Add Drug Row</span>
                  </Button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {medications.map((med, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr auto", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Drug / Brand (e.g. Amoxicillin)"
                        value={med.name}
                        onChange={(e) => handleMedChange(idx, "name", e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage (500mg)"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Freq (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Duration (5d)"
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Remarks (After meals)"
                        value={med.remarks}
                        onChange={(e) => handleMedChange(idx, "remarks", e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}
                      />
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          style={{ border: "none", background: "transparent", color: "var(--danger)", cursor: "pointer", padding: "4px" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests & Follow up */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <Input
                  label="Recommended Diagnostic Tests (Comma separated)"
                  placeholder="e.g. Chest X-Ray PA, Complete Blood Count, CRP"
                  value={testsInput}
                  onChange={(e) => setTestsInput(e.target.value)}
                />
                <Input
                  label="Follow-Up Advice & Consultation Notes"
                  placeholder="e.g. Follow up in 7 days if symptoms persist. Stay hydrated."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                />
              </div>

              {/* Encrypted Document Picker */}
              <div>
                <label style={{ fontSize: "var(--fs-small)", fontWeight: "var(--fw-medium)", color: "var(--text)", display: "block", marginBottom: "6px" }}>
                  Attach Scanned Report / Diagnostic Image (Encrypted with AES-GCM before IPFS)
                </label>
                <FilePicker
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  maxSizeMB={15}
                />
                <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={14} color="var(--primary-600)" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Encryption Key:</span>
                  <input
                    type="password"
                    value={encryptionPassphrase}
                    onChange={(e) => setEncryptionPassphrase(e.target.value)}
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", width: "220px" }}
                  />
                </div>
              </div>

              {/* Submit */}
              <div style={{ marginTop: "12px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createLoading}
                  loadingText="Encrypting & Anchoring..."
                  style={{ width: "100%", height: 46 }}
                >
                  Confirm & Anchor Prescription on Blockchain
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Doctor Appointments (FR-9) */}
      {activeTab === "appointments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)" }}>
                  Patient Appointment Bookings ({appointments.length})
                </h3>
                <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>
                  Review and manage consultation appointments scheduled by patients.
                </p>
              </div>
              <Button variant="secondary" onClick={loadDoctorAppointments} isLoading={apptLoading} loadingText="Refreshing...">
                🔄 Refresh
              </Button>
            </div>

            {appointments.length === 0 ? (
              <EmptyState
                title="No Appointments Scheduled"
                description="Patients have not booked any appointments with you yet."
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
                          Appt #{appt.id}: {appt.specialty}
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
                        <span>Patient: <AddressChip address={appt.patientAddress} /></span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} />
                          {new Date(appt.dateTimestamp * 1000).toLocaleDateString()} at {appt.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {appt.status === "Pending" && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => handleApptStatusChange(appt.id, "Approved")}
                            disabled={apptActionLoading}
                            style={{ height: 32, fontSize: "12px", padding: "0 12px" }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleApptStatusChange(appt.id, "Cancelled")}
                            disabled={apptActionLoading}
                            style={{ height: 32, fontSize: "12px", padding: "0 12px" }}
                          >
                            <XCircle size={13} />
                            <span>Decline</span>
                          </Button>
                        </>
                      )}
                      {appt.status === "Approved" && (
                        <Button
                          variant="secondary"
                          onClick={() => handleApptStatusChange(appt.id, "Completed")}
                          disabled={apptActionLoading}
                          style={{ height: 32, fontSize: "12px", padding: "0 12px" }}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Doctor Profile Settings (FR-3) */}
      {activeTab === "profile" && (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", marginBottom: "4px" }}>
              Doctor Profile & Clinic Information
            </h3>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "20px" }}>
              Update your on-chain contact number and clinic consultation location.
            </p>

            <StatusToast
              state={profileToast.status}
              message={profileToast.message}
              txHash={profileToast.txHash}
              rawError={profileToast.rawError}
              onDismiss={() => setProfileToast({ status: "idle", message: "" })}
            />

            <form onSubmit={handleUpdateDoctorProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input
                label="Full Name"
                value={doctorProfileData?.fullName || userProfile?.fullName || ""}
                disabled
              />
              <Input
                label="Specialty"
                value={doctorProfileData?.specialty || "General Medicine"}
                disabled
              />
              <Input
                label="Qualifications"
                value={doctorProfileData?.qualification || "MBBS, MD"}
                disabled
              />
              <Input
                label="Direct Phone Number"
                placeholder="+91 98765 43210"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                required
              />
              <Input
                label="Hospital / Clinic Location"
                placeholder="Apollo Health City, Room 402"
                value={profileLocation}
                onChange={(e) => setProfileLocation(e.target.value)}
                required
              />

              <div style={{ marginTop: "12px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={profileLoading}
                  loadingText="Updating On-Chain..."
                  style={{ width: "100%", height: 42 }}
                >
                  Save Profile Updates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Record Modal (FR-7) */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onConfirm={handleSaveEdit}
        title="Edit Patient EHR Record"
        confirmLabel="Save Changes on Blockchain"
        variant="primary"
        isLoading={editLoading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input
            label="Diagnosis / Consultation Title"
            value={editDiagnosis}
            onChange={(e) => setEditDiagnosis(e.target.value)}
            required
          />
          <Input
            label="Recommended Tests (Comma separated)"
            value={editTests}
            onChange={(e) => setEditTests(e.target.value)}
          />
          <Input
            label="Follow-Up Notes"
            value={editFollowUp}
            onChange={(e) => setEditFollowUp(e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <GasBadge />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Modifying records updates the immutable version history.</span>
          </div>
        </div>
      </Modal>

      {/* Delete Record Modal (FR-7) */}
      <Modal
        isOpen={deletingRecordIndex !== null}
        onClose={() => setDeletingRecordIndex(null)}
        onConfirm={handleDeleteRecord}
        title="Delete EHR Record Confirmation"
        confirmLabel="Delete On-Chain"
        variant="danger"
        isLoading={deleteLoading}
      >
        <p style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginBottom: "12px" }}>
          Are you sure you want to remove Record #{deletingRecordIndex !== null ? deletingRecordIndex + 1 : ""} from this patient's profile?
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <GasBadge />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>This action requires a MetaMask transaction.</span>
        </div>
      </Modal>
    </div>
  );
}
