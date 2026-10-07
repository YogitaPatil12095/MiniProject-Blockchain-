import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { usePHR } from "./hooks/usePHR";

// UI Shell
import { TopBar } from "./components/ui/TopBar";
import { DemoBanner } from "./components/ui/DemoBanner";
import { ChatbotModal } from "./components/ui/ChatbotModal";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AppointmentPage from "./pages/AppointmentPage";
import AIDiagnosisPage from "./pages/AIDiagnosisPage";

// ─────────────────────────────────────────────────────────────────────────────
// Role-Based Protected Route
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ allowedRole, children }) {
  const { account } = useWallet();
  const { isRegistered, userRole, isAdmin, loading } = usePHR();

  // Not connected at all → landing
  if (!account) return <Navigate to="/" replace />;

  // Still loading role from chain → show spinner
  if (loading || isRegistered === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⛓️</div>
          <p>Verifying role on blockchain…</p>
        </div>
      </div>
    );
  }

  const effectiveRole = isAdmin ? "admin" : (isRegistered ? userRole : null);

  // Admin trying to access admin route ✅
  if (allowedRole === "admin" && effectiveRole === "admin") return children;

  // Doctor trying to access doctor route ✅
  if (allowedRole === "doctor" && effectiveRole === "doctor") return children;

  // Patient trying to access patient route ✅
  if (allowedRole === "patient" && effectiveRole === "patient") return children;

  // Not registered yet → registration page
  if (!isRegistered) return <Navigate to="/register" replace />;

  // Wrong role → redirect to their own dashboard
  if (effectiveRole === "admin")   return <Navigate to="/admin" replace />;
  if (effectiveRole === "doctor")  return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart redirect after connect: sends user to their dashboard automatically
// ─────────────────────────────────────────────────────────────────────────────
function RoleRedirect() {
  const { account } = useWallet();
  const { isRegistered, userRole, isAdmin, loading } = usePHR();

  if (!account) return <LandingPage />;
  if (loading || isRegistered === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⛓️</div>
          <p>Reading your role from blockchain…</p>
        </div>
      </div>
    );
  }

  if (isAdmin)                         return <Navigate to="/admin"   replace />;
  if (isRegistered && userRole === "doctor")  return <Navigate to="/doctor"  replace />;
  if (isRegistered && userRole === "patient") return <Navigate to="/patient" replace />;

  // Connected but not yet registered
  return <Navigate to="/register" replace />;
}

// ─────────────────────────────────────────────────────────────────────────────
// TopBar wrapper — shows only role-appropriate navigation
// ─────────────────────────────────────────────────────────────────────────────
function NavigationWrapper() {
  const { account, chainId, connectWallet, disconnectWallet } = useWallet();
  const { userRole, isAdmin, isRegistered } = usePHR();
  const location = useLocation();
  const navigate = useNavigate();

  const networkLabel =
    chainId === 31337
      ? "Hardhat Local (31337)"
      : chainId === 11155111
      ? "Sepolia Testnet"
      : chainId
      ? `Chain ${chainId}`
      : "Not Connected";

  const effectiveRole = isAdmin ? "admin" : (isRegistered ? userRole : null);

  // What the active tab/role is for highlight purposes
  const activeTab =
    location.pathname === "/appointments" ? "appointments"
    : location.pathname === "/ai-diagnosis" ? "ai-diagnosis"
    : "";
  const activeRole = location.pathname === "/doctor" ? "doctor"
    : location.pathname === "/admin" ? "admin"
    : location.pathname === "/patient" ? "patient"
    : "";

  return (
    <>
      <TopBar
        networkName={networkLabel}
        address={account || ""}
        userRole={effectiveRole}
        activeRole={activeRole}
        activeTab={activeTab}
        onNavigate={(path) => navigate(path)}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      <DemoBanner />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Route definitions
// ─────────────────────────────────────────────────────────────────────────────
function MainRoutes() {
  const { account } = useWallet();

  return (
    <main className="main-content" style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Routes>
        {/* Root: auto-redirect based on role */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Registration page for unregistered connected users */}
        <Route path="/register" element={account ? <LoginRegisterPage /> : <Navigate to="/" replace />} />

        {/* ── RBAC Protected Portals ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Shared pages (require any connected + registered user) */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRole="patient">
              <AppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/ai-diagnosis" element={<AIDiagnosisPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="app-container" style={{ minHeight: "100vh", backgroundColor: "var(--bg)", position: "relative" }}>
          <NavigationWrapper />
          <MainRoutes />
          <ChatbotModal />
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}
