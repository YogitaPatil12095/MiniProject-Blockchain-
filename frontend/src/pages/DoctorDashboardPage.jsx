import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { uploadToIPFS } from "../lib/ipfs";
import { ethers } from "ethers";

// Member A UI Components
import { RecordCard } from "../components/ui/RecordCard";
import { FilePicker } from "../components/ui/FilePicker";
import { Stepper } from "../components/ui/Stepper";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GasBadge } from "../components/ui/GasBadge";
import { AddressChip } from "../components/ui/AddressChip";
import { StatusToast } from "../components/ui/StatusToast";

export default function DoctorDashboardPage() {
  const { account } = useWallet();
  const { fetchEHRRecords, createEHRRecord, userProfile } = usePHR();

  const [activeTab, setActiveTab] = useState("view"); // "view" | "create"

  // View records state (FR-5)
  const [searchAddress, setSearchAddress] = useState("");
  const [patientRecords, setPatientRecords] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewToast, setViewToast] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  // Create record state (FR-6)
  const [createPatientAddress, setCreatePatientAddress] = useState("");
  const [doctorName, setDoctorName] = useState(userProfile?.fullName || "Dr. Medical Professional");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(1); // 1: Upload to IPFS, 2: Confirm in wallet, 3: Recorded on-chain
  const [createLoading, setCreateLoading] = useState(false);
  const [createToast, setCreateToast] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  const ipfsGatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
  const pinataJWT = import.meta.env.VITE_PINATA_JWT || "";

  const handleSearchPatientRecords = async (e) => {
    e.preventDefault();
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
        message: err.message || "Failed to retrieve records.",
        rawError: err.message,
      });
    } finally {
      setViewLoading(false);
    }
  };

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
    if (!selectedFile) {
      setCreateToast({
        status: "error",
        message: "Please select a health record file to upload.",
        rawError: "",
      });
      return;
    }

    try {
      setCreateLoading(true);

      // Step 1: Upload to IPFS via Pinata
      setUploadStep(1);
      setCreateToast({ status: "pending", message: "Step 1/3: Pinning medical record to IPFS via Pinata..." });
      const ipfsRes = await uploadToIPFS(selectedFile, pinataJWT);

      // Step 2: Write CID to Ethereum smart contract
      setUploadStep(2);
      setCreateToast({ status: "pending", message: "Step 2/3: Confirming record creation transaction in MetaMask..." });
      const txRes = await createEHRRecord(createPatientAddress, doctorName, ipfsRes.cid);

      // Step 3: Success
      setUploadStep(3);
      setCreateToast({
        status: "success",
        message: `EHR recorded on-chain! IPFS CID: ${ipfsRes.cid}`,
        txHash: txRes.txHash,
      });
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Doctor Header Banner */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
          Doctor / Healthcare Provider Portal
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>Doctor Address:</span>
          <AddressChip address={account} isSelf={true} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
        <Button
          variant={activeTab === "view" ? "primary" : "secondary"}
          onClick={() => setActiveTab("view")}
          style={{ height: 38 }}
        >
          🔍 View Patient Records (FR-5)
        </Button>
        <Button
          variant={activeTab === "create" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("create");
            setUploadStep(1);
          }}
          style={{ height: 38 }}
        >
          📤 Upload & Create Record (FR-6)
        </Button>
      </div>

      {/* TAB 1: View Patient Records (FR-5) */}
      {activeTab === "view" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "28px", maxWidth: 640 }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "4px" }}>
              Search Patient Records
            </h3>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "20px" }}>
              Enter the Ethereum address of a registered patient who has granted you Viewer access. (Free blockchain query, 0 gas).
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
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", margin: "8px 0 16px" }}>
                Records for {searchAddress.slice(0, 8)}…{searchAddress.slice(-6)} ({patientRecords.length})
              </h3>
              {patientRecords.length === 0 ? (
                <EmptyState
                  title="No Records Found"
                  description="This patient does not have any records stored in their health record profile yet."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {patientRecords.map((rec, idx) => (
                    <RecordCard
                      key={idx}
                      record={{
                        creatorName: rec.creator_name,
                        creatorAddress: rec.creator_address,
                        cid: rec.ipfs_location,
                        createdAt: rec.createdAt,
                        gatewayUrl: `${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`,
                        fileName: `Medical Record #${patientRecords.length - idx}`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Create Patient Record (FR-6) */}
      {activeTab === "create" && (
        <div style={{ maxWidth: 640 }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                Upload & Create Patient Record
              </h3>
              <GasBadge />
            </div>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "24px" }}>
              Uploads the medical document to IPFS and anchors the immutable CID on Ethereum with your signature.
            </p>

            <Stepper currentStep={uploadStep} />

            <StatusToast
              state={createToast.status}
              message={createToast.message}
              txHash={createToast.txHash}
              rawError={createToast.rawError}
              onDismiss={() => setCreateToast({ status: "idle", message: "" })}
            />

            <form onSubmit={handleCreateRecord}>
              <Input
                label="Patient Ethereum Address"
                placeholder="0x..."
                value={createPatientAddress}
                onChange={(e) => setCreatePatientAddress(e.target.value)}
                isAddress={true}
                required
              />

              <Input
                label="Doctor / Clinic Display Name"
                placeholder="e.g. Dr. Bob Smith"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "var(--fs-small)", fontWeight: "var(--fw-medium)", color: "var(--text)", display: "block", marginBottom: "6px" }}>
                  Medical Document / Scan File *
                </label>
                <FilePicker
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  maxSizeMB={10}
                />
              </div>

              <div style={{ marginTop: "24px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createLoading}
                  loadingText="Processing..."
                  style={{ width: "100%", height: 44 }}
                >
                  Upload to IPFS & Record on Blockchain
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
