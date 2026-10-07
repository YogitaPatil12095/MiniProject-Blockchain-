import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle, Shield, Calendar, Activity } from "lucide-react";
import { usePHR } from "../../hooks/usePHR";
import { useWallet } from "../../context/WalletContext";

const QUICK_PROMPTS = [
  { label: "Book Appointment", icon: Calendar, query: "How do I book an appointment with a specialist?" },
  { label: "AI Disease Scanner", icon: Activity, query: "How does the AI scan for Pneumonia and Brain Tumors?" },
  { label: "Grant Doctor Access", icon: Shield, query: "How can I allow my doctor to view or add medical records?" },
  { label: "Hospital Assistance", icon: HelpCircle, query: "I need to contact hospital staff regarding my consultation." },
];

const BOT_KNOWLEDGE_BASE = {
  appointment: "To schedule a consultation, visit the 'Book Appointment' panel. Choose your required specialty (e.g. Pulmonology, Neurology), select an available doctor, pick a date and open time slot, and submit. The doctor will confirm your slot.",
  ai: "Our Predictive AI Analysis system evaluates uploaded Chest X-Rays for Pneumonia and Brain MRI scans for Tumors. Navigate to 'AI Diagnosis' in the top bar, drop your scan image, and get instant preliminary analysis with confidence scores.",
  access: "Under the Patient Portal -> 'Access Control' tab, enter your doctor's Ethereum address and choose 'Viewer' (read-only), 'Creator' (add records), or 'Master' (both). You can revoke access at any time.",
  doctor: "Doctors can review patient history, upload encrypted diagnostic reports to IPFS, prescribe medications with dosage & frequency schedules, order clinical lab tests, and manage appointments.",
  default: "I am the Intellihealth Assistive Navigation Chatbot. You can ask me how to book appointments, upload medical scans for AI screening, manage doctor permissions, or send a note to hospital administration.",
};

export function ChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your Intellihealth Assistive AI. How can I help you navigate the decentralized health record system today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { logChatbotQuery } = usePHR();
  const { account } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const textToSend = userText || inputQuery;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user", text: textToSend, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Optional on-chain logging if wallet connected
    if (account) {
      logChatbotQuery(textToSend, "Assistive Navigation");
    }

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let replyText = BOT_KNOWLEDGE_BASE.default;

      if (lower.includes("appointment") || lower.includes("book") || lower.includes("schedule")) {
        replyText = BOT_KNOWLEDGE_BASE.appointment;
      } else if (lower.includes("ai") || lower.includes("scan") || lower.includes("mri") || lower.includes("x-ray") || lower.includes("pneumonia") || lower.includes("tumor")) {
        replyText = BOT_KNOWLEDGE_BASE.ai;
      } else if (lower.includes("grant") || lower.includes("access") || lower.includes("permission") || lower.includes("revoke")) {
        replyText = BOT_KNOWLEDGE_BASE.access;
      } else if (lower.includes("doctor") || lower.includes("prescription") || lower.includes("ehr")) {
        replyText = BOT_KNOWLEDGE_BASE.doctor;
      } else if (lower.includes("contact") || lower.includes("staff") || lower.includes("hospital")) {
        replyText = "Your message has been logged for hospital administration review. For emergency support, please contact the hospital desk directly.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          backgroundColor: "var(--accent-teal, #0f766e)",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(15, 118, 110, 0.4)",
          fontSize: 14,
          fontWeight: 600,
          transition: "transform 0.2s, background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Open Assistive Chatbot"
      >
        <Bot size={20} />
        <span>IntelliBot Assistant</span>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            right: 24,
            width: 380,
            maxWidth: "calc(100vw - 48px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            backgroundColor: "#111827",
            color: "#f9fafb",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10000,
            overflow: "hidden",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #0f766e 0%, #1e293b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} color="#f9fafb" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  IntelliBot AI
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      display: "inline-block",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.75)" }}>EHR Assistive Guide</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#f9fafb",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#1e293b",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {QUICK_PROMPTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(p.query)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(15, 118, 110, 0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                >
                  <Icon size={12} color="#06b6d4" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                {m.sender === "bot" && (
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: "#0f766e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Bot size={14} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.45,
                    backgroundColor: m.sender === "user" ? "#0f766e" : "#1f293d",
                    color: "#f8fafc",
                    border: m.sender === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderBottomRightRadius: m.sender === "user" ? 2 : 12,
                    borderBottomLeftRadius: m.sender === "bot" ? 2 : 12,
                  }}
                >
                  <div>{m.text}</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: 4,
                      textAlign: m.sender === "user" ? "right" : "left",
                    }}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: "#0f766e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={14} color="#fff" />
                </div>
                <div
                  style={{
                    backgroundColor: "#1f293d",
                    padding: "8px 14px",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  IntelliBot is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              backgroundColor: "#1e293b",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or request hospital help..."
              style={{
                flex: 1,
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              style={{
                backgroundColor: inputQuery.trim() ? "#0f766e" : "#334155",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: inputQuery.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
