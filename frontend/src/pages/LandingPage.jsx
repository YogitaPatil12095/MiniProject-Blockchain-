import React from "react";
import { useWallet } from "../context/WalletContext";
import { Shield, Stethoscope, UserCheck, Lock, Cpu, Globe } from "lucide-react";

export default function LandingPage() {
  const { connectWallet, isConnecting, error } = useWallet();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0f4c35 0%, #0d3d6e 100%)",
        padding: "80px 24px 60px",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "999px",
            padding: "6px 16px", fontSize: "13px", marginBottom: "28px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <Shield size={14} />
            <span>IEEE ICBDS 2024 · Intellihealth Reference Implementation</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}>
            Secured Decentralised<br />Electronic Health Records
          </h1>

          <p style={{
            fontSize: "1.1rem", color: "rgba(255,255,255,0.75)",
            maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            Medical records encrypted, stored on IPFS, and access-controlled by Ethereum smart contracts.
            Connect your wallet — the system automatically detects your role.
          </p>

          <button
            id="landing-connect-btn"
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "14px 32px", fontSize: "16px", fontWeight: 700,
              backgroundColor: "#10B981", color: "#fff",
              border: "none", borderRadius: "12px", cursor: isConnecting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 24px rgba(16, 185, 129, 0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
              opacity: isConnecting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {isConnecting ? (
              <>
                <div style={{
                  width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Awaiting MetaMask…
              </>
            ) : (
              <>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  style={{ width: 22, height: 22 }}
                />
                Connect Wallet & Enter
              </>
            )}
          </button>

          {error && (
            <p style={{
              marginTop: "16px", fontSize: "13px",
              backgroundColor: "rgba(239,68,68,0.15)", color: "#FCA5A5",
              padding: "8px 16px", borderRadius: "8px", display: "inline-block",
            }}>
              ⚠️ {error}
            </p>
          )}

          <p style={{ marginTop: "16px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            MetaMask will show an account picker — choose the account matching your role.
          </p>
        </div>
      </div>

      {/* Roles Explained */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{
          textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
          color: "var(--text)", marginBottom: "8px",
        }}>
          Three Role System
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "48px" }}>
          Your wallet address determines your role — set by the Hospital Admin on-chain.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {[
            {
              icon: <Shield size={28} color="#F59E0B" />,
              role: "Admin",
              badge: "Hospital Owner",
              badgeColor: "#FEF3C7",
              badgeText: "#92400E",
              bg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
              border: "#F59E0B",
              desc: "Register & revoke Doctor/Patient accounts, monitor appointments system-wide, and audit chatbot logs.",
              perms: ["Register Doctors & Patients", "Revoke Accounts", "View All Appointments", "Chatbot Audit Logs"],
            },
            {
              icon: <Stethoscope size={28} color="#3B82F6" />,
              role: "Doctor",
              badge: "Verified Medical Staff",
              badgeColor: "#DBEAFE",
              badgeText: "#1E40AF",
              bg: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
              border: "#3B82F6",
              desc: "View patient histories, create encrypted EHRs with prescriptions, approve/decline appointments.",
              perms: ["Create & Update EHRs", "Prescribe Medications", "Manage Appointments", "Encrypted IPFS Uploads"],
            },
            {
              icon: <UserCheck size={28} color="#10B981" />,
              role: "Patient",
              badge: "Aadhaar Verified",
              badgeColor: "#D1FAE5",
              badgeText: "#065F46",
              bg: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
              border: "#10B981",
              desc: "View your own medical records, book appointments, grant/revoke doctor access, and use AI diagnostics.",
              perms: ["View Health Records", "Book Appointments", "Grant/Revoke Doctor Access", "AI Disease Scan"],
            },
          ].map((r) => (
            <div
              key={r.role}
              style={{
                background: "var(--surface)",
                border: `1px solid ${r.border}33`,
                borderRadius: "16px",
                padding: "28px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: r.bg, padding: "10px", borderRadius: "12px" }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>{r.role}</div>
                  <span style={{
                    fontSize: "11px", fontWeight: 600,
                    backgroundColor: r.badgeColor, color: r.badgeText,
                    padding: "2px 8px", borderRadius: "999px",
                  }}>{r.badge}</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
                {r.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {r.perms.map((p) => (
                  <li key={p} style={{
                    fontSize: "12px", color: "var(--text-muted)",
                    padding: "4px 0", borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span style={{ color: r.border, fontWeight: 700 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "32px 24px",
        backgroundColor: "var(--surface)",
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", flexWrap: "wrap", gap: "24px",
          alignItems: "center", justifyContent: "center",
        }}>
          {[
            { icon: <Lock size={16} />, label: "AES-GCM 256-bit Encryption" },
            { icon: <Globe size={16} />, label: "IPFS via Pinata" },
            { icon: <Cpu size={16} />, label: "Solidity 0.8.24 · Hardhat" },
            { icon: <Shield size={16} />, label: "Aadhaar Identity Binding" },
          ].map((t) => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", color: "var(--text-muted)",
            }}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
