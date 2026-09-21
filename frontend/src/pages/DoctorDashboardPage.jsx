import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { uploadToIPFS } from "../lib/ipfs";
import { ethers } from "ethers";
import { Stethoscope, Search, Upload, FileUp, ExternalLink, Fuel, AlertCircle, CheckCircle, Check, Loader2 } from "lucide-react";
import { truncateAddress, truncateCID } from "../lib/contract";

export default function DoctorDashboardPage() {
  const { account } = useWallet();
  const { fetchEHRRecords, createEHRRecord, userProfile } = usePHR();

  const [activeTab, setActiveTab] = useState("view"); // "view" | "create"

  // View records state (FR-5)
  const [searchAddress, setSearchAddress] = useState("");
  const [patientRecords, setPatientRecords] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  // Create record state (FR-6)
  const [createPatientAddress, setCreatePatientAddress] = useState("");
  const [doctorName, setDoctorName] = useState(userProfile?.fullName || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(0); // 0: Idle, 1: Uploading to IPFS, 2: Confirming in Wallet, 3: Success
  const [uploadResult, setUploadResult] = useState(null); // { cid, txHash }
  const [createError, setCreateError] = useState(null);

  const ipfsGatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
  const pinataJWT = import.meta.env.VITE_PINATA_JWT || "";

  const handleSearchPatientRecords = async (e) => {
    e.preventDefault();
    setViewError(null);
    setPatientRecords(null);

    if (!ethers.isAddress(searchAddress)) {
      setViewError("Please enter a valid patient Ethereum address (0x...)");
      return;
    }

    try {
      setViewLoading(true);
      const records = await fetchEHRRecords(searchAddress);
      setPatientRecords([...records].sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      setViewError(err.message || "Failed to retrieve records.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setCreateError("File size exceeds 10 MB limit.");
        return;
      }
      setSelectedFile(file);
      setCreateError(null);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setUploadResult(null);

    if (!ethers.isAddress(createPatientAddress)) {
      setCreateError("Please enter a valid patient Ethereum address.");
      return;
    }
    if (!selectedFile) {
      setCreateError("Please select a medical file to upload.");
      return;
    }
    if (!doctorName) {
      setCreateError("Please provide your doctor/creator name.");
      return;
    }

    try {
      // Step 1: Upload to IPFS via Pinata
      setUploadStep(1);
      const ipfsRes = await uploadToIPFS(selectedFile, pinataJWT);

      // Step 2: Write CID and metadata to Ethereum smart contract
      setUploadStep(2);
      const txRes = await createEHRRecord(createPatientAddress, doctorName, ipfsRes.cid);

      // Step 3: Done
      setUploadStep(3);
      setUploadResult({
        cid: ipfsRes.cid,
        gatewayUrl: ipfsRes.gatewayUrl,
        txHash: txRes.txHash,
      });
      setSelectedFile(null);
    } catch (err) {
      console.error("Create record failed:", err);
      setCreateError(err.message || "Failed to create medical record.");
      setUploadStep(0);
    }
  };

  return (
    <div>
      {/* Doctor Header */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--accent-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={26} color="var(--accent-500)" />
          </div>
          <div>
            <h1 className="card-title" style={{ fontSize: "1.5rem", margin: 0 }}>
              Doctor Portal: {userProfile?.fullName || "Physician"}
            </h1>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Connected as: <span className="chip-address">{truncateAddress(account, 8, 6)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        <button
          className={`btn ${activeTab === "view" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("view")}
          style={{ height: 38 }}
        >
          <Search size={16} /> View Patient Records (FR-5)
        </button>
        <button
          className={`btn ${activeTab === "create" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            setActiveTab("create");
            setUploadStep(0);
          }}
          style={{ height: 38 }}
        >
          <Upload size={16} /> Create Patient Record (FR-6)
        </button>
      </div>

      {/* TAB 1: View Patient Records (FR-5) */}
      {activeTab === "view" && (
        <div>
          <div className="card" style={{ maxWidth: 640 }}>
            <h3 className="card-title" style={{ fontSize: "1.125rem" }}>Search Patient EHR</h3>
            <p className="card-subtitle">
              Enter the Ethereum address of a registered patient who has granted you Viewer access. (Free blockchain query, 0 gas).
            </p>

            <form onSubmit={handleSearchPatientRecords} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                className="input input-mono"
                style={{ flex: 1, minWidth: 260 }}
                type="text"
                placeholder="Patient Address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={viewLoading}>
                {viewLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                Load Records
              </button>
            </form>
          </div>

          {viewError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{viewError}</span>
            </div>
          )}

          {patientRecords !== null && (
            <div>
              <h3 style={{ fontSize: "1.125rem", margin: "1.5rem 0 1rem" }}>
                Records for {truncateAddress(searchAddress, 8, 6)} ({patientRecords.length})
              </h3>
              {patientRecords.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>This patient has 0 records on-chain.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {patientRecords.map((rec, idx) => {
                    const dateStr = new Date(rec.createdAt * 1000).toLocaleString();
                    const recordUrl = `${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`;
                    return (
                      <div key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", margin: 0 }}>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>Created by: {rec.creator_name}</h4>
                          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Date: {dateStr}</p>
                          <p style={{ fontSize: "0.8125rem", color: "var(--accent-500)", fontFamily: "var(--font-mono)" }}>
                            CID: {truncateCID(rec.ipfs_location, 10, 8)}
                          </p>
                        </div>
                        <a
                          href={recordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ height: 36, fontSize: "0.875rem" }}
                        >
                          Open on IPFS <ExternalLink size={14} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Create Patient Record (FR-6) */}
      {activeTab === "create" && (
        <div style={{ maxWidth: 640 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 className="card-title" style={{ margin: 0 }}>Upload & Record New EHR</h3>
              <div className="gas-badge">
                <Fuel size={14} /> Requires gas
              </div>
            </div>
            <p className="card-subtitle">
              Uploads the medical document to IPFS and anchors the immutable CID on Ethereum with your digital signature.
            </p>

            {/* Stepper Progress */}
            <div style={{ display: "flex", justifyContent: "space-between", margin: "1.5rem 0", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: uploadStep >= 1 ? "var(--primary-600)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {uploadStep > 1 ? <Check size={14} /> : "1"}
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: uploadStep === 1 ? 700 : 400 }}>1. IPFS Upload</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: uploadStep >= 2 ? "var(--primary-600)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {uploadStep > 2 ? <Check size={14} /> : "2"}
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: uploadStep === 2 ? 700 : 400 }}>2. Wallet Sign</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: uploadStep === 3 ? "var(--success)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {uploadStep === 3 ? <Check size={14} /> : "3"}
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: uploadStep === 3 ? 700 : 400 }}>3. Recorded</span>
              </div>
            </div>

            {createError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{createError}</span>
              </div>
            )}

            {uploadResult && (
              <div className="alert alert-success" style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <CheckCircle size={18} />
                  <strong>EHR Record Created Successfully!</strong>
                </div>
                <p style={{ fontSize: "0.8125rem", margin: "0.25rem 0" }}>
                  IPFS CID: <span style={{ fontFamily: "var(--font-mono)" }}>{uploadResult.cid}</span>
                </p>
                <p style={{ fontSize: "0.8125rem", margin: "0.25rem 0" }}>
                  Tx Hash: <span style={{ fontFamily: "var(--font-mono)" }}>{truncateAddress(uploadResult.txHash, 12, 10)}</span>
                </p>
                <div style={{ marginTop: "0.75rem" }}>
                  <a href={uploadResult.gatewayUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ height: 32, fontSize: "0.8125rem" }}>
                    Verify File on IPFS <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateRecord}>
              <div className="form-group">
                <label className="form-label">Patient Ethereum Address *</label>
                <input
                  className="input input-mono"
                  type="text"
                  placeholder="0x..."
                  value={createPatientAddress}
                  onChange={(e) => setCreatePatientAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Doctor / Creator Display Name *</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Dr. Bob Smith"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medical File (PDF, Image, Report, max 10MB) *</label>
                <div
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "var(--bg)",
                  }}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <FileUp size={32} color="var(--primary-600)" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {selectedFile ? selectedFile.name : "Click to select or drop a medical file"}
                  </p>
                  {selectedFile && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                  <input id="file-input" type="file" style={{ display: "none" }} onChange={handleFileChange} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={uploadStep === 1 || uploadStep === 2}
              >
                {uploadStep === 1
                  ? "Uploading to IPFS via Pinata..."
                  : uploadStep === 2
                  ? "Confirming Transaction in MetaMask..."
                  : "Upload & Save Record on Blockchain"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
