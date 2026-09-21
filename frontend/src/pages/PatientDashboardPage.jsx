import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { ethers } from "ethers";
import { FileText, Users, UserPlus, Trash2, ExternalLink, Fuel, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { truncateAddress, truncateCID } from "../lib/contract";

export default function PatientDashboardPage() {
  const { account } = useWallet();
  const { fetchEHRRecords, fetchMyAccessList, grantAccess, revokeAccess, userProfile } = usePHR();

  const [activeTab, setActiveTab] = useState("records"); // "records" | "access" | "grant"
  const [records, setRecords] = useState([]);
  const [accessList, setAccessList] = useState({ viewers: [], creators: [] });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Grant form state
  const [grantAddress, setGrantAddress] = useState("");
  const [grantRole, setGrantRole] = useState("v"); // "v" | "c" | "m"

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState(null); // { address, role }

  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      setError(null);
      const [ehrData, accessData] = await Promise.all([
        fetchEHRRecords(account),
        fetchMyAccessList(),
      ]);
      // Sort records newest first
      setRecords([...ehrData].sort((a, b) => b.createdAt - a.createdAt));
      setAccessList(accessData);
    } catch (err) {
      console.error("Error loading patient data:", err);
      setError(err.message || "Failed to load records or access list.");
    } finally {
      setLoading(false);
    }
  }, [account, fetchEHRRecords, fetchMyAccessList]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!ethers.isAddress(grantAddress)) {
      setError("Please enter a valid Ethereum address (0x...)");
      return;
    }

    try {
      setActionLoading(true);
      const res = await grantAccess(grantAddress, grantRole);
      setSuccessMsg(`Access granted! Tx: ${truncateAddress(res.txHash, 10, 8)}`);
      setGrantAddress("");
      await loadData();
      setActiveTab("access");
    } catch (err) {
      setError(err.message || "Failed to grant access.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!revokeTarget) return;
    setError(null);
    setSuccessMsg(null);

    try {
      setActionLoading(true);
      const res = await revokeAccess(revokeTarget.address, revokeTarget.role);
      setSuccessMsg(`Access revoked! Tx: ${truncateAddress(res.txHash, 10, 8)}`);
      setRevokeTarget(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to revoke access.");
    } finally {
      setActionLoading(false);
    }
  };

  const ipfsGatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

  return (
    <div>
      {/* Patient Header Banner */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="card-title" style={{ fontSize: "1.5rem" }}>
              Welcome, {userProfile?.fullName || "Patient"}
            </h1>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Address: <span className="chip-address">{truncateAddress(account, 8, 6)}</span>
            </p>
          </div>
          <button className="btn btn-secondary" onClick={loadData} disabled={loading} style={{ height: 36, padding: "0 0.875rem" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        <button
          className={`btn ${activeTab === "records" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("records")}
          style={{ height: 38 }}
        >
          <FileText size={16} /> My Records ({records.length})
        </button>
        <button
          className={`btn ${activeTab === "access" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("access")}
          style={{ height: 38 }}
        >
          <Users size={16} /> Access List ({accessList.viewers.length + accessList.creators.length})
        </button>
        <button
          className={`btn ${activeTab === "grant" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("grant")}
          style={{ height: 38 }}
        >
          <UserPlus size={16} /> Grant Access
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: My Health Records (FR-2) */}
      {activeTab === "records" && (
        <div>
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem 0", textAlign: "center" }}>Loading health records from Ethereum & IPFS...</p>
          ) : records.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <FileText size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>No medical records found</h3>
              <p className="card-subtitle" style={{ margin: 0 }}>
                You have not had any EHR records uploaded yet. Grant a doctor Creator access so they can add your records.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {records.map((rec, idx) => {
                const dateStr = new Date(rec.createdAt * 1000).toLocaleString();
                const recordUrl = `${ipfsGatewayBase.endsWith("/") ? ipfsGatewayBase : ipfsGatewayBase + "/"}${rec.ipfs_location}`;
                return (
                  <div key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", margin: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={24} color="var(--primary-600)" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>Record added by {rec.creator_name}</h4>
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          Date: {dateStr} • Creator: <span style={{ fontFamily: "var(--font-mono)" }}>{truncateAddress(rec.creator_address, 6, 4)}</span>
                        </p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--accent-500)", fontFamily: "var(--font-mono)" }}>
                          IPFS CID: {truncateCID(rec.ipfs_location, 10, 8)}
                        </p>
                      </div>
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

      {/* TAB 2: Access List (FR-3 & FR-7) */}
      {activeTab === "access" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {/* Viewers Column */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Authorized Viewers ({accessList.viewers.length})
            </h3>
            <p className="card-subtitle">Addresses allowed to read your health records.</p>
            {accessList.viewers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No viewers granted.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {accessList.viewers.map((viewerAddr, idx) => {
                  const isSelf = viewerAddr.toLowerCase() === account.toLowerCase();
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="chip-address">{truncateAddress(viewerAddr, 8, 6)}</span>
                        {isSelf && <span className="role-badge role-badge-viewer">You</span>}
                      </div>
                      {!isSelf && (
                        <button
                          className="btn btn-danger"
                          style={{ height: 32, padding: "0 0.625rem", fontSize: "0.75rem" }}
                          onClick={() => setRevokeTarget({ address: viewerAddr, role: "v" })}
                          disabled={actionLoading}
                        >
                          <Trash2 size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creators Column */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Authorized Creators ({accessList.creators.length})
            </h3>
            <p className="card-subtitle">Doctors and clinics allowed to add records to your file.</p>
            {accessList.creators.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No creators granted.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {accessList.creators.map((creatorAddr, idx) => {
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span className="chip-address">{truncateAddress(creatorAddr, 8, 6)}</span>
                      <button
                        className="btn btn-danger"
                        style={{ height: 32, padding: "0 0.625rem", fontSize: "0.75rem" }}
                        onClick={() => setRevokeTarget({ address: creatorAddr, role: "c" })}
                        disabled={actionLoading}
                      >
                        <Trash2 size={12} /> Revoke
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Grant Access (FR-4) */}
      {activeTab === "grant" && (
        <div style={{ maxWidth: 540 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 className="card-title" style={{ margin: 0 }}>Grant Record Access</h3>
              <div className="gas-badge">
                <Fuel size={14} /> Requires gas
              </div>
            </div>
            <p className="card-subtitle">
              Grant a doctor or third party permission to view your records, create new records, or both (Master).
            </p>

            <form onSubmit={handleGrantAccess}>
              <div className="form-group">
                <label className="form-label">Grantee Ethereum Address *</label>
                <input
                  className="input input-mono"
                  type="text"
                  placeholder="0x..."
                  value={grantAddress}
                  onChange={(e) => setGrantAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Access Level *</label>
                <select className="select" value={grantRole} onChange={(e) => setGrantRole(e.target.value)}>
                  <option value="v">Viewer (Can only read your records)</option>
                  <option value="c">Creator (Can only upload new records for you)</option>
                  <option value="m">Master (Both Viewer and Creator permissions)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.75rem" }}
                disabled={actionLoading}
              >
                {actionLoading ? "Signing & Confirming Tx..." : "Confirm Grant in MetaMask"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div className="card" style={{ maxWidth: 440, width: "100%", margin: 0, boxShadow: "var(--shadow-modal)" }}>
            <h3 className="card-title" style={{ color: "var(--danger)" }}>Revoke Access Confirmation</h3>
            <p style={{ fontSize: "0.9375rem", margin: "1rem 0" }}>
              Are you sure you want to revoke {revokeTarget.role === "v" ? "Viewer" : revokeTarget.role === "c" ? "Creator" : "Master"} access from:
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", backgroundColor: "var(--bg)", padding: "0.5rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              {revokeTarget.address}
            </p>
            <div className="gas-badge" style={{ marginBottom: "1.25rem" }}>
              <Fuel size={14} /> Requires gas
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button className="btn btn-secondary" onClick={() => setRevokeTarget(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRevokeAccess} disabled={actionLoading}>
                {actionLoading ? "Confirming..." : "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
