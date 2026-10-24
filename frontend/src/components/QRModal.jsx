import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, Camera, Copy, Check, Download, X } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Enhanced QR Code Modal Component
 * 1. Generates and renders a high-res QR code containing full profile metadata
 * 2. Provides interactive scanning via webcam or image upload
 */
export function QRModal({ isOpen, onClose, title, data, onScanSuccess }) {
  const [activeTab, setActiveTab] = useState("view"); // "view" | "scan"
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const scannerRef = useRef(null);

  const jsonString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  useEffect(() => {
    if (isOpen && data) {
      QRCode.toDataURL(
        jsonString,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        },
        (err, url) => {
          if (!err) setQrDataUrl(url);
        }
      );
    }
  }, [isOpen, data, jsonString]);

  useEffect(() => {
    if (isOpen && activeTab === "scan") {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          try {
            const parsed = JSON.parse(decodedText);
            if (onScanSuccess) onScanSuccess(parsed, decodedText);
          } catch (e) {
            if (onScanSuccess) onScanSuccess(decodedText, decodedText);
          }
          scanner.clear();
          onClose();
        },
        (error) => {
          // scanning continuous errors can be ignored
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${title.replace(/\s+/g, "_")}_QR.png`;
    a.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: "rgba(14, 165, 233, 0.12)",
                color: "var(--primary-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>
                {title || "Personal Medical QR Code"}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                Decentralized on-chain profile & identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg)",
          }}
        >
          <button
            onClick={() => setActiveTab("view")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderBottom: activeTab === "view" ? "2px solid var(--primary-600)" : "2px solid transparent",
              backgroundColor: "transparent",
              color: activeTab === "view" ? "var(--primary-600)" : "var(--text-muted)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            My QR Code
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderBottom: activeTab === "scan" ? "2px solid var(--primary-600)" : "2px solid transparent",
              backgroundColor: "transparent",
              color: activeTab === "scan" ? "var(--primary-600)" : "var(--text-muted)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Camera size={15} /> Scan Any QR Code
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 20px", textAlign: "center" }}>
          {activeTab === "view" ? (
            <>
              {qrDataUrl ? (
                <div
                  style={{
                    display: "inline-block",
                    padding: 12,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <img src={qrDataUrl} alt="Identity QR Code" style={{ width: 240, height: 240, display: "block" }} />
                </div>
              ) : (
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Generating QR...
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  maxHeight: 100,
                  overflowY: "auto",
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--text-muted)",
                }}
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{jsonString}</pre>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Button variant="secondary" onClick={handleCopy} style={{ flex: 1 }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span style={{ marginLeft: 6 }}>{copied ? "Copied Data" : "Copy Payload"}</span>
                </Button>
                <Button variant="primary" onClick={handleDownload} style={{ flex: 1 }}>
                  <Download size={16} />
                  <span style={{ marginLeft: 6 }}>Download QR</span>
                </Button>
              </div>
            </>
          ) : (
            <div>
              <div id="qr-reader-container" style={{ width: "100%", minHeight: 280 }} />
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                Point camera at a Doctor or Patient QR code to automatically read their identity and address.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
