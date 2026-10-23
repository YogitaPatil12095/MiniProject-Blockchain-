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

  // State 3: Connected but Unregistered — contact admin
  if (isRegistered === false) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto" }}>
        <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
          <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "12px" }}>
            Not Yet Registered
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)", lineHeight: "1.6", marginBottom: "28px" }}>
            You are connected but not yet registered in the Intellihealth system. Please contact your hospital administrator to register your wallet address.
          </p>

          <div style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Wallet Address
            </p>
            <AddressChip address={account} isSelf={true} />
            <div style={{ marginTop: "12px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px", textAlign: "left" }}>
              <code style={{ fontSize: "12px", color: "var(--text)", wordBreak: "break-all", fontFamily: "monospace" }}>
                {account}
              </code>
            </div>
          </div>

          <div style={{ backgroundColor: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: "24px", textAlign: "left" }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
              ℹ️ <strong style={{ color: "var(--text)" }}>Registration is done only by the hospital admin on-chain.</strong> Share your wallet address with your admin. Once registered, refresh this page to access your dashboard.
            </p>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            You cannot self-register. Only the authorized hospital admin can register Doctors and Patients on the blockchain.
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
