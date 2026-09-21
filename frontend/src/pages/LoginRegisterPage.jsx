import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";

// Member A UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { GasBadge } from "../components/ui/GasBadge";
import { AddressChip } from "../components/ui/AddressChip";
import { StatusToast } from "../components/ui/StatusToast";

export default function LoginRegisterPage({ onLoginSuccess }) {
  const { account, connectWallet, isConnecting, error: walletError, isWrongNetwork, switchNetwork } = useWallet();
  const { isRegistered, registerUser, loading: phrLoading, error: phrError } = usePHR();

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Male",
    homeAddress: "",
    phone: "",
    birthday: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [txState, setTxState] = useState({ status: "idle", message: "", txHash: "", rawError: "" });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTxState({ status: "pending", message: "Waiting for wallet signature and on-chain confirmation...", txHash: "" });

    if (!formData.fullName || !formData.homeAddress || !formData.phone || !formData.birthday) {
      setTxState({ status: "error", message: "Please fill in all required fields.", rawError: "" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerUser(formData);
      setTxState({
        status: "success",
        message: "Successfully registered on the blockchain!",
        txHash: res.txHash,
      });
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 1500);
      }
    } catch (err) {
      setTxState({
        status: "error",
        message: err.message || "Registration transaction failed.",
        rawError: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  // State 3: Connected but Unregistered (FR-1)
  if (isRegistered === false) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto" }}>
        <div className="card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                Register New User Profile
              </h2>
              <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", marginTop: "4px" }}>
                Connected Account: <AddressChip address={account} isSelf={true} />
              </p>
            </div>
            <GasBadge />
          </div>

          <p style={{ fontSize: "var(--fs-small)", color: "var(--text-muted)", margin: "16px 0 24px" }}>
            Registration is a one-time blockchain transaction (<code>setUserData</code>) that establishes your identity as a Patient on Ethereum.
          </p>

          <StatusToast
            state={txState.status}
            message={txState.message}
            txHash={txState.txHash}
            rawError={txState.rawError}
            onDismiss={() => setTxState({ status: "idle", message: "" })}
          />

          <form onSubmit={handleRegister}>
            <Input
              label="Full Name"
              placeholder="e.g. Alice Smith"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              required
            />

            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />

            <Input
              label="Home Address"
              placeholder="e.g. 123 Maple Street, Cityville"
              value={formData.homeAddress}
              onChange={(e) => handleInputChange("homeAddress", e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. +1234567890"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange("birthday", e.target.value)}
              required
            />

            <div style={{ marginTop: "24px" }}>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                loadingText="Signing & Confirming Tx..."
                style={{ width: "100%", height: 44 }}
              >
                Register Profile on Blockchain
              </Button>
            </div>
          </form>
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
