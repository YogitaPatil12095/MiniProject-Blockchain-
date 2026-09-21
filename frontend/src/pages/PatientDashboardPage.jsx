import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { ethers } from "ethers";

// Member A UI Components
import { RecordCard } from "../components/ui/RecordCard";
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
  const { fetchEHRRecords, fetchMyAccessList, grantAccess, revokeAccess, userProfile } = usePHR();

  const [activeTab, setActiveTab] = useState("records"); // "records" | "access" | "grant"
  const [records, setRecords] = useState([]);
  const [accessList, setAccessList] = useState({ viewers: [], creators: [] });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [txState, setTxState] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  // Grant form state
  const [grantAddress, setGrantAddress] = useState("");
  const [grantRole, setGrantRole] = useState("v"); // "v" | "c" | "m"

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState(null); // { address, role }

  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      const [ehrData, accessData] = await Promise.all([
        fetchEHRRecords(account),
        fetchMyAccessList(),
      ]);
      setRecords([...ehrData].sort((a, b) => b.createdAt - a.createdAt));
      setAccessList(accessData);
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
  }, [account, fetchEHRRecords, fetchMyAccessList]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Patient Header Banner */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
              Welcome, {userProfile?.fullName || "Patient"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>My Patient Address:</span>
              <AddressChip address={account} isSelf={true} />
            </div>
          </div>
          <Button variant="secondary" onClick={loadData} isLoading={loading} loadingText="Refreshing...">
            🔄 Refresh Records
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
        <Button
          variant={activeTab === "records" ? "primary" : "secondary"}
          onClick={() => setActiveTab("records")}
          style={{ height: 38 }}
        >
          📋 My Records ({records.length})
        </Button>
        <Button
          variant={activeTab === "access" ? "primary" : "secondary"}
          onClick={() => setActiveTab("access")}
          style={{ height: 38 }}
        >
          👥 Access List ({accessList.viewers.length + accessList.creators.length})
        </Button>
        <Button
          variant={activeTab === "grant" ? "primary" : "secondary"}
          onClick={() => setActiveTab("grant")}
          style={{ height: 38 }}
        >
          ➕ Grant Access
        </Button>
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
              title="No Health Records Yet"
              description="You have no medical records stored on IPFS. Grant a doctor Creator access so they can upload your health records."
              actionLabel="Grant Access to Doctor"
              onAction={() => setActiveTab("grant")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {records.map((rec, idx) => (
                <RecordCard
                  key={idx}
                  record={{
                    creatorName: rec.creator_name,
                    creatorAddress: rec.creator_address,
                    cid: rec.ipfs_location,
                    createdAt: rec.createdAt,
                    gatewayUrl: `${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`,
                    fileName: `EHR Record #${records.length - idx}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Access List (FR-3 & FR-7) */}
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

      {/* TAB 3: Grant Access (FR-4) */}
      {activeTab === "grant" && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                Grant Record Access
              </h3>
              <GasBadge />
            </div>
            <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginBottom: "24px" }}>
              Grant an authorized physician or clinic Viewer, Creator, or Master (both) permissions.
            </p>

            <form onSubmit={handleGrantAccess}>
              <Input
                label="Target Ethereum Address"
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
  );
}
