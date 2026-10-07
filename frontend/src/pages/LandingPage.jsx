import React from "react";
import { useWallet } from "../context/WalletContext";
import { ShieldCheck, Stethoscope, UserCheck, Lock, Cpu, Globe, Activity, CheckCircle2, FileText } from "lucide-react";

export default function LandingPage() {
  const { connectWallet, isConnecting, error } = useWallet();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0369a1 100%)",
        padding: "80px 24px 70px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 840, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "999px",
            padding: "6px 18px", fontSize: "13px", marginBottom: "28px",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
            fontWeight: 500,
          }}>
            <ShieldCheck size={16} color="#2DD4BF" />
            <span>IEEE ICBDS 2024 · IntelliHealth Reference Implementation</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
          }}>
            Secured Decentralized<br />Electronic Health Record System
          </h1>

          <p style={{
            fontSize: "1.15rem", color: "rgba(255,255,255,0.85)",
            maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Patient medical records client-side encrypted (AES-256), stored on IPFS, and access-controlled by Ethereum smart contracts. Connect your wallet to enter your role-specific dashboard.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <button
              id="landing-connect-btn"
              onClick={connectWallet}
              disabled={isConnecting}
              style={{
                display: "inline-flex", alignItems: "center", gap: "12px",
                padding: "16px 36px", fontSize: "16px", fontWeight: 700,
                backgroundColor: "#10B981", color: "#fff",
                border: "none", borderRadius: "var(--radius-lg)", cursor: isConnecting ? "not-allowed" : "pointer",
                boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)",
                transition: "all 0.2s ease",
                opacity: isConnecting ? 0.8 : 1,
              }}
              onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {isConnecting ? (
                <>
                  <div style={{
                    width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Connecting to MetaMask…
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    style={{ width: 24, height: 24 }}
                  />
                  <span>Connect Wallet & Enter Dashboard</span>
                </>
              )}
            </button>

            {error && (
              <div style={{
                fontSize: "13px",
                backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5",
                padding: "10px 20px", borderRadius: "var(--radius-md)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                display: "inline-flex", alignItems: "center", gap: "8px",
              }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
              MetaMask account selection determines your role (Admin / Doctor / Patient).
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ maxWidth: 1100, margin: "-30px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            { icon: <Lock size={22} color="var(--primary-600)" />, title: "AES-256 Encryption", desc: "Client-side pre-encryption of diagnostic files before pinning" },
            { icon: <Globe size={22} color="var(--accent-600)" />, title: "IPFS Storage", desc: "Decentralized, immutable medical report storage via Pinata" },
            { icon: <ShieldCheck size={22} color="var(--indigo-600)" />, title: "On-Chain RBAC", desc: "Solidity smart contracts enforce role permissions & viewer/creator access" },
            { icon: <Activity size={22} color="var(--success)" />, title: "AI ML Screening", desc: "Predictive model inference for Pneumonia & Brain Tumor scans" },
          ].map((feat) => (
            <div
              key={feat.title}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "10px",
                backgroundColor: "var(--primary-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>{feat.title}</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles & Workflows Section */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
            Role-Based Access Control Architecture
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: 580, margin: "0 auto" }}>
            Your Ethereum wallet address maps to your role authorized on the blockchain.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {[
            {
              icon: <ShieldCheck size={28} color="#D97706" />,
              role: "Hospital Admin",
              badge: "Authority Owner",
              badgeBg: "#FEF3C7",
              badgeColor: "#92400E",
              accentColor: "#D97706",
              desc: "Manages doctor credentials, registers patients with Aadhaar identity verification, audits appointments, and inspects chatbot logs.",
              perms: ["Register Verified Doctors & Patients", "Revoke User Accounts On-Chain", "Master Hospital Appointment Schedule", "Chatbot Telemetry Audit Logs"],
            },
            {
              icon: <Stethoscope size={28} color="var(--primary-600)" />,
              role: "Medical Doctor",
              badge: "Verified Medical Staff",
              badgeBg: "#CCFBF1",
              badgeColor: "var(--primary-800)",
              accentColor: "var(--primary-600)",
              desc: "Searches patient records, creates detailed EHRs with prescriptions & diagnostic lab tests, uploads encrypted files, and manages appointments.",
              perms: ["View Patient History & EHRs", "Prescribe Medication Schedules", "Order Diagnostic Tests & Follow-ups", "Approve & Manage Consultation Slots"],
            },
            {
              icon: <UserCheck size={28} color="var(--accent-600)" />,
              role: "Registered Patient",
              badge: "Aadhaar Identity Verified",
              badgeBg: "#E0F2FE",
              badgeColor: "#0369A1",
              accentColor: "var(--accent-600)",
              desc: "Owns and controls their health data, views clinical records, books appointments with specialists, and manages doctor access permissions.",
              perms: ["View Personal Health Records", "Book Specialist Doctor Appointments", "Grant & Revoke Doctor Permissions", "AI Medical Scan Disease Screening"],
            },
          ].map((r) => (
            <div
              key={r.role}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "12px",
                  backgroundColor: r.badgeBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {r.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{r.role}</h3>
                  <span style={{
                    fontSize: "11px", fontWeight: 600,
                    backgroundColor: r.badgeBg, color: r.badgeColor,
                    padding: "2px 8px", borderRadius: "999px",
                    display: "inline-block", marginTop: "2px",
                  }}>
                    {r.badge}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                {r.desc}
              </p>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
                  Key Capabilities:
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {r.perms.map((p) => (
                    <li key={p} style={{
                      fontSize: "12px", color: "var(--text)",
                      display: "flex", alignItems: "center", gap: "8px",
                    }}>
                      <CheckCircle2 size={14} color={r.accentColor} style={{ flexShrink: 0 }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "32px 24px",
        backgroundColor: "var(--surface)", marginTop: "auto",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexWrap: "wrap", gap: "24px",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
            IntelliHealth IEEE 2024 EHR Reference System
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {[
              { icon: <Lock size={15} />, label: "AES-GCM 256-bit" },
              { icon: <Globe size={15} />, label: "Pinata IPFS" },
              { icon: <Cpu size={15} />, label: "Solidity 0.8.24" },
              { icon: <ShieldCheck size={15} />, label: "Aadhaar Identity" },
            ].map((t) => (
              <div key={t.label} style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "12px", color: "var(--text-muted)", fontWeight: 500,
              }}>
                {t.icon} <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

