import React from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";

// Member A UI Components
import { Button } from "../components/ui/Button";
import { AddressChip } from "../components/ui/AddressChip";
import { StatusToast } from "../components/ui/StatusToast";

export default function LoginRegisterPage({ onLoginSuccess }) {
  const { account, connectWallet, isConnecting, error: walletError, isWrongNetwork, switchNetwork } = useWallet();
  const { isRegistered, loading: phrLoading, error: phrError } = usePHR();

  // State 1: Disconnected Wallet
  if (!account) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <img src="/logo.svg" alt="PHR Logo" style={{ width: 36, height: 36 }} />
          </div>
          <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "8px" }}>
            Your Health Records, Under Your Control
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)", marginBottom: "32px", lineHeight: "24px" }}>
            Decentralized Personal Health Record (PHR) powered by Ethereum and IPFS. Secure, patient-owned, tamper-evident.
          </p>

          {walletError && (
            <StatusToast state="error" message={walletError} />
          )}

          <Button
            variant="primary"
            onClick={connectWallet}
            isLoading={isConnecting}
            loadingText="Connecting to MetaMask..."
            style={{ width: "100%", height: 46 }}
          >
            Connect MetaMask
          </Button>

          <p style={{ marginTop: "16px", fontSize: "var(--fs-small)", color: "var(--text-muted)" }}>
            Need MetaMask? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install the extension</a>
          </p>
        </div>
      </div>
    );
  }

  // State 2: Wrong Network
  if (isWrongNetwork) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
          <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--danger)", marginBottom: "8px" }}>
            Wrong Blockchain Network
          </h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            Please switch MetaMask to the local Hardhat network (Chain ID: 31337) or Sepolia testnet to continue.
          </p>
          <Button variant="primary" onClick={() => switchNetwork()}>
            Switch Network in MetaMask
          </Button>
        </div>
      </div>
    );
  }

  const { registerUser } = usePHR();
  const [selfForm, setSelfForm] = React.useState({
    fullName: "",
    gender: "Male",
    homeAddress: "",
    phone: "",
    birthday: "1998-01-01",
  });
  const [registering, setRegistering] = React.useState(false);
  const [regError, setRegError] = React.useState("");

  const handleSelfRegister = async (e) => {
    e.preventDefault();
    if (!selfForm.fullName.trim()) {
      setRegError("Please enter your full name.");
      return;
    }
    setRegistering(true);
    setRegError("");
    try {
      await registerUser(selfForm);
    } catch (err) {
      setRegError(err.message || "Failed to complete self-registration.");
    } finally {
      setRegistering(false);
    }
  };

  // State 3: Connected but Unregistered — provide instant patient self-registration
  if (isRegistered === false) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto" }}>
        <div className="card" style={{ padding: "36px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏥</div>
            <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "8px" }}>
              Patient Portal Self-Registration
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)", margin: 0, lineHeight: 1.5 }}>
              Register your wallet address directly on the Ethereum blockchain to activate your personal health record portal.
            </p>
          </div>

          <div style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Wallet Address
            </p>
            <AddressChip address={account} isSelf={true} />
          </div>

          {regError && <StatusToast state="error" message={regError} />}

          <form onSubmit={handleSelfRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Aarav Sharma"
                value={selfForm.fullName}
                onChange={(e) => setSelfForm({ ...selfForm, fullName: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                  Gender
                </label>
                <select
                  value={selfForm.gender}
                  onChange={(e) => setSelfForm({ ...selfForm, gender: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={selfForm.birthday}
                  onChange={(e) => setSelfForm({ ...selfForm, birthday: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={selfForm.phone}
                onChange={(e) => setSelfForm({ ...selfForm, phone: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Home Address
              </label>
              <input
                type="text"
                placeholder="City, State"
                value={selfForm.homeAddress}
                onChange={(e) => setSelfForm({ ...selfForm, homeAddress: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              isLoading={registering}
              loadingText="Creating On-Chain Profile..."
              style={{ width: "100%", height: 46, marginTop: 8 }}
            >
              Register as Patient on Blockchain
            </Button>
          </form>

          <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            Note: Doctors are verified & registered exclusively by Hospital Administrators for compliance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)" }}>Loading account state from blockchain...</p>
    </div>
  );
}
