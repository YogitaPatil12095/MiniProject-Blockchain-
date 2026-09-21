import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import PreviewPage from "./pages/PreviewPage";
import { Shield, Stethoscope, User, AlertTriangle, LogOut, ExternalLink, Network } from "lucide-react";
import { truncateAddress } from "./lib/contract";
import { usePHR } from "./hooks/usePHR";

function NavigationHeader() {
  const { account, chainId, disconnectWallet, targetChainId } = useWallet();
  const { isRegistered } = usePHR();
  const location = useLocation();
  const navigate = useNavigate();

  const networkName = chainId === 31337 ? "Hardhat Local" : chainId === 11155111 ? "Sepolia Testnet" : `Chain ${chainId || ""}`;

  return (
    <>
      <header className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link to="/" className="brand">
            <Shield size={22} />
            <span>PHR Chain</span>
          </Link>

          {account && isRegistered && (
            <nav style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className={`btn ${location.pathname === "/" ? "btn-primary" : "btn-secondary"}`}
                style={{ height: 34, padding: "0 0.75rem", fontSize: "0.8125rem" }}
                onClick={() => navigate("/")}
              >
                <User size={14} /> Patient Portal
              </button>
              <button
                className={`btn ${location.pathname === "/doctor" ? "btn-primary" : "btn-secondary"}`}
                style={{ height: 34, padding: "0 0.75rem", fontSize: "0.8125rem" }}
                onClick={() => navigate("/doctor")}
              >
                <Stethoscope size={14} /> Doctor Portal
              </button>
            </nav>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            to="/preview"
            style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginRight: "0.5rem" }}
          >
            🎨 Preview Mode
          </Link>

          {account ? (
            <>
              <span className="role-badge" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)", border: "1px solid var(--border)" }}>
                <Network size={12} style={{ display: "inline", marginRight: 4 }} />
                {networkName}
              </span>
              <span className="chip-address">{truncateAddress(account, 6, 4)}</span>
              <button
                className="btn btn-secondary"
                style={{ height: 34, padding: "0 0.5rem" }}
                onClick={disconnectWallet}
                title="Disconnect Wallet"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Wallet Disconnected</span>
          )}
        </div>
      </header>

      {/* Demo Warning Banner */}
      <div className="banner">
        <AlertTriangle size={16} />
        <span>Demo only: files on IPFS are publicly accessible by CID. Use dummy data, not real medical records.</span>
      </div>
    </>
  );
}

function MainRoutes() {
  const { account } = useWallet();
  const { isRegistered } = usePHR();

  return (
    <main className="main-content">
      <Routes>
        <Route
          path="/"
          element={
            !account || isRegistered === false ? (
              <LoginRegisterPage />
            ) : (
              <PatientDashboardPage />
            )
          }
        />
        <Route
          path="/doctor"
          element={
            !account || isRegistered === false ? (
              <LoginRegisterPage />
            ) : (
              <DoctorDashboardPage />
            )
          }
        />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="app-container">
          <NavigationHeader />
          <MainRoutes />
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}
