import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { usePHR } from "./hooks/usePHR";

// TopBar & Notification Components
import { TopBar } from "./components/ui/TopBar";
import { DemoBanner } from "./components/ui/DemoBanner";
import { ChatbotModal } from "./components/ui/ChatbotModal";

// Smart Container Pages
import LoginRegisterPage from "./pages/LoginRegisterPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AppointmentPage from "./pages/AppointmentPage";
import AIDiagnosisPage from "./pages/AIDiagnosisPage";
import PreviewPage from "./pages/PreviewPage";

function NavigationWrapper() {
  const { account, chainId, connectWallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab & active role for TopBar highlight
  let activeRole = "patient";
  let activeTab = "";

  if (location.pathname === "/doctor") {
    activeRole = "doctor";
  } else if (location.pathname === "/admin") {
    activeRole = "admin";
  } else if (location.pathname === "/appointments") {
    activeTab = "appointments";
  } else if (location.pathname === "/ai-diagnosis") {
    activeTab = "ai-diagnosis";
  } else {
    activeRole = "patient";
  }

  const networkLabel =
    chainId === 31337
      ? "Hardhat Local (31337)"
      : chainId === 11155111
      ? "Sepolia Testnet"
      : chainId
      ? `Chain ${chainId}`
      : "Not Connected";

  const handleRoleSwitch = (role) => {
    if (role === "doctor") {
      navigate("/doctor");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <TopBar
        networkName={networkLabel}
        address={account || ""}
        activeRole={activeRole}
        activeTab={activeTab}
        onRoleSwitch={handleRoleSwitch}
        onNavigate={handleNavigate}
        onConnect={connectWallet}
      />
      <DemoBanner />
    </>
  );
}

function MainRoutes() {
  const { account } = useWallet();
  const { isRegistered } = usePHR();

  const showDashboard = Boolean(account && isRegistered === true);

  return (
    <main className="main-content" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 16px" }}>
      <Routes>
        {/* Patient Portal */}
        <Route
          path="/"
          element={showDashboard ? <PatientDashboardPage /> : <LoginRegisterPage />}
        />

        {/* Doctor Portal */}
        <Route
          path="/doctor"
          element={showDashboard ? <DoctorDashboardPage /> : <LoginRegisterPage />}
        />

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={account ? <AdminDashboardPage /> : <LoginRegisterPage />}
        />

        {/* Appointment Booking Panel */}
        <Route path="/appointments" element={<AppointmentPage />} />

        {/* Predictive AI Diagnostic Panel */}
        <Route path="/ai-diagnosis" element={<AIDiagnosisPage />} />

        {/* UI Preview Page */}
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="app-container" style={{ minHeight: "100vh", backgroundColor: "var(--bg)", position: "relative" }}>
          <NavigationWrapper />
          <MainRoutes />
          {/* Floating Assistive AI Chatbot (IEEE ICBDS 2024 Conformance) */}
          <ChatbotModal />
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}
