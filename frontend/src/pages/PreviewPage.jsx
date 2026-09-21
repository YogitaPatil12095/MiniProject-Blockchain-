import React from "react";
import { Shield, FileText, AlertTriangle, Fuel } from "lucide-react";

/**
 * PreviewPage — Dedicated route for Member A (Designer) to preview UI components with mock data.
 * Does not require MetaMask, Hardhat, or Pinata.
 */
export default function PreviewPage() {
  const mockRecord = {
    creatorName: "Dr. Bob Smith",
    creatorAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    createdAt: Math.floor(Date.now() / 1000) - 3600 * 24,
  };

  return (
    <div>
      <div className="card">
        <h1 className="card-title">🎨 UI Component Preview (Design Mode)</h1>
        <p className="card-subtitle">
          This preview sandbox allows reviewing presentational components with static mock data without interacting with the blockchain.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ fontSize: "1.125rem" }}>Sample Mock Record Card</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={24} color="var(--primary-600)" />
            </div>
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>Record added by {mockRecord.creatorName}</h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Date: {new Date(mockRecord.createdAt * 1000).toLocaleString()} • Creator: <span style={{ fontFamily: "var(--font-mono)" }}>{mockRecord.creatorAddress.slice(0, 8)}...</span>
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--accent-500)", fontFamily: "var(--font-mono)" }}>
                CID: {mockRecord.cid.slice(0, 16)}...
              </p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ height: 36, fontSize: "0.875rem" }}>
            Open on IPFS ↗
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ fontSize: "1.125rem" }}>Design Tokens & Badges</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <span className="gas-badge"><Fuel size={14} /> Requires gas</span>
          <span className="role-badge role-badge-viewer">Viewer</span>
          <span className="role-badge role-badge-creator">Creator</span>
          <span className="role-badge role-badge-master">Master</span>
          <span className="chip-address">0x1234...5678</span>
        </div>
      </div>
    </div>
  );
}
