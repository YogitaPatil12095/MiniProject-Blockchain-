import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { usePHR } from "./hooks/usePHR";

// Member A UI Components
import { TopBar } from "./components/ui/TopBar";
import { DemoBanner } from "./components/ui/DemoBanner";

// Smart Container Pages
import LoginRegisterPage from "./pages/LoginRegisterPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import PreviewPage from "./pages/PreviewPage";

function NavigationWrapper() {
  const { account, chainId, connectWallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  const activeRole = location.pathname.startsWith("/doctor") ? "doctor" : "patient";
  const networkLabel = chainId === 31337 ? "Hardhat Local (31337)" : chainId === 11155111 ? "Sepolia Testnet" : chainId ? `Chain ${chainId}` : "Not Connected";

  const handleRoleSwitch = (role) => {
    if (role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <TopBar
        networkName={networkLabel}
        address={account || ""}
        activeRole={activeRole}
        onRoleSwitch={handleRoleSwitch}
        onConnect={connectWallet}
      />
      <DemoBanner />
    </>
  );
}

function MainRoutes() {
  const { account } = useWallet();
  const { isRegistered, loading } = usePHR();

  return (
    <main className="main-content" style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px" }}>
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
        <div className="app-container" style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
          <NavigationWrapper />
          <MainRoutes />
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}
