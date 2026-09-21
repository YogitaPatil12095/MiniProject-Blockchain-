import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePHR } from "../hooks/usePHR";
import { Shield, Fuel, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { truncateAddress } from "../lib/contract";

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
  const [txSuccess, setTxSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setTxSuccess(null);

    if (!formData.fullName || !formData.homeAddress || !formData.phone || !formData.birthday) {
      setFormError("Please fill in all required registration fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerUser(formData);
      setTxSuccess(res.txHash);
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 1500);
      }
    } catch (err) {
      setFormError(err.message || "Registration transaction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Shield size={32} color="var(--primary-600)" />
          </div>
          <h1 className="card-title" style={{ fontSize: "1.5rem" }}>Your Health Records, Under Your Control</h1>
          <p className="card-subtitle" style={{ marginBottom: "2rem" }}>
            Decentralized Personal Health Record (PHR) powered by Ethereum and IPFS. Secure, patient-owned, tamper-evident.
          </p>

          {walletError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{walletError}</span>
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%", height: 48, fontSize: "1rem" }}
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting to MetaMask..." : "Connect MetaMask"}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: "0 auto 1rem" }} />
          <h2 className="card-title">Incorrect Blockchain Network</h2>
          <p className="card-subtitle">
            Please switch MetaMask to the local Hardhat network (Chain ID: 31337) or Sepolia testnet to continue.
          </p>
          <button className="btn btn-primary" onClick={() => switchNetwork()}>
            Switch Network in MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (isRegistered === false) {
    return (
      <div style={{ maxWidth: 540, margin: "2.5rem auto" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="card-title" style={{ margin: 0 }}>Register New User Profile</h2>
            <div className="gas-badge">
              <Fuel size={14} /> Requires gas
            </div>
          </div>
          <p className="card-subtitle">
            Connected Address: <span className="chip-address">{truncateAddress(account, 8, 6)}</span>
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Registration is a one-time blockchain transaction (<code>setUserData</code>) that initializes your identity as a Patient.
          </p>

          {(formError || phrError) && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{formError || phrError}</span>
            </div>
          )}

          {txSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>Successfully registered on-chain! Tx: {truncateAddress(txSuccess, 10, 8)}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="input"
                name="fullName"
                type="text"
                placeholder="e.g. Alice Smith"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="select" name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Home Address *</label>
              <input
                className="input"
                name="homeAddress"
                type="text"
                placeholder="e.g. 123 Maple Street"
                value={formData.homeAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className="input"
                name="phone"
                type="tel"
                placeholder="e.g. +1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                className="input"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={submitting || phrLoading}
            >
              {submitting ? "Signing & Confirming Tx..." : "Register on Blockchain"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading user state from blockchain...</p>
    </div>
  );
}
