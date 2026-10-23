# MILESTONES.md — Phased Implementation Plan

> Living project roadmap aligned with the Intellihealth IEEE ICBDS 2024 paper.

## Overview & Phase Schedule

| Phase | Module Name | Estimated Time | Primary Output | Status |
|---|---|---|---|---|
| **Phase 0** | Prerequisites & Workspace Setup | 1 h | Dev environment, MetaMask, Pinata API, project config | ✅ Complete |
| **Phase 1** | Smart Contract Core & Verification | 4–6 h | `PHR.sol` contract, 35 Hardhat tests green, gas benchmarks | ✅ Complete |
| **Phase 2** | Deploy Script & Local Chain Setup | 1–2 h | `deploy.js`, contract ABI sync (`contract.json`), Hardhat network | ✅ Complete |
| **Phase 3** | Core Frontend & Portals Scaffold | 6–8 h | Wallet context, patient & doctor base dashboards, IPFS client upload | ✅ Complete |
| **Phase 4** | Admin Portal & Profile Extensions | 4–5 h | Admin workflow dashboard, Aadhaar linking, extended user profile data | ✅ Complete |
| **Phase 5** | Appointment Booking & Chatbot | 3–4 h | Appointment scheduling bar, slot reservation, interactive navigation chatbot UI | ✅ Complete |
| **Phase 6** | AI/ML Predictive Disease Diagnosis | 4–5 h | Pneumonia & Brain Tumor scan upload, preliminary ML detection inference module | ✅ Complete |
| **Phase 7** | UX Flow Improvements | 2 h | How It Works section, welcome cards, quick-start guide, contact-admin flow | ✅ Complete |
| **Phase 8** | MongoDB Backend + Deployment Config | 3–4 h | Express REST API, MongoDB Atlas schemas, Vercel + Render config, single-cmd startup | ✅ Complete |
| **Phase 9** | IPFS Hardening & Security | 1 h | Demo mode fallback, file validation, AbortController retry, hidden admin route | ✅ Complete |

---

## Phase 0 — Prerequisites & Workspace Setup ✅

- [x] Node 20/22 LTS, Git, VS Code / Antigravity configured
- [x] MetaMask extension installed with 3 pre-funded local accounts (Admin, Doctor, Patient)
- [x] Pinata JWT configured in local `.env`
- [x] Project markdown files synchronized

---

## Phase 1 — Smart Contract Core & Verification ✅

- [x] Hardhat 2.x setup with Solidity `0.8.24`
- [x] Full `PHR.sol` with all paper functions
- [x] 35 Hardhat tests passing with gas reporter
- [x] Contract extension: Admin role, Aadhaar linkage, Appointments, Medication[] struct

---

## Phase 2 — Deploy Script & Local Chain Setup ✅

- [x] `scripts/deploy.js` deploying contract and exporting `frontend/src/contract.json`
- [x] `scripts/deploy-and-export.js` — also exports `backend/contract.json`
- [x] Local Hardhat network running (`chainId 31337`)
- [x] Private keys importable to MetaMask for local testing

---

## Phase 3 — Core Frontend & Portals Scaffold ✅

- [x] Vite + React app setup in `/frontend` with `ethers` v6 and `react-router-dom`
- [x] WalletContext with account tracking, network switching prompt, and event handlers
- [x] Base Patient Dashboard and Doctor Dashboard
- [x] Pinata IPFS file upload integration (`lib/ipfs.js`) — now hardened with demo mode + validation

---

## Phase 4 — Admin Portal & Profile Extensions ✅

- [x] **Admin Portal (`AdminDashboardPage.jsx`):** Register Doctors/Patients, revoke accounts, audit logs
- [x] **Admin route secured:** `/admin` → `/sys-panel-9f3a` (invisible to non-admin users)
- [x] **Extended Demographic Profiles:** Patient and Doctor profile editors

---

## Phase 5 — Appointment Booking & Chatbot ✅

- [x] Appointment booking form for patients
- [x] Doctor & Admin appointment approval / status dashboard
- [x] Assistive Navigation Chatbot floating modal
- [x] Chatbot session persistence via MongoDB backend API

---

## Phase 6 — AI/ML Predictive Disease Diagnosis ✅

- [x] File dropzone for uploading medical reports, X-rays, and MRI scans
- [x] Pneumonia Detection (chest X-ray) and Brain Tumor Detection (MRI) inference
- [x] Confidence score display & preliminary diagnostic summary card

---

## Phase 7 — UX Flow Improvements ✅

- [x] `LandingPage.jsx` — "How It Works" 3-step section (numbered badge cards)
- [x] `LoginRegisterPage.jsx` — State 3 (unregistered) shows admin-contact card, not a self-registration form
- [x] `PatientDashboardPage.jsx` — Empty records tab shows welcome card with Grant Access CTA
- [x] `DoctorDashboardPage.jsx` — Create tab has quick-start instructional card at top

---

## Phase 8 — MongoDB Backend + Single-Command Startup ✅

- [x] `backend/server.js` — Express app with CORS, rate limiting, graceful MongoDB degradation
- [x] `backend/models/` — 4 Mongoose schemas: UserProfile, ChatbotLog, AuditLog, AppointmentMeta
- [x] `backend/routes/` — profile, chatbot, audit REST endpoints
- [x] `backend/middleware/auth.js` — wallet-address header auth
- [x] `backend/render.yaml` — Render.com deployment manifest
- [x] `frontend/src/lib/api.js` — thin fetch wrapper with graceful-degradation
- [x] Root `package.json` — `npm run dev`, `npm run install:all`, `npm run start:backend`
- [x] `concurrently` and `wait-on` added to devDependencies

---

## Phase 9 — Deployment Configuration ✅

- [x] `frontend/vercel.json` — SPA rewrite rule for React Router on Vercel
- [x] `frontend/vite.config.js` — `base: '/'`, `build.outDir: 'dist'`
- [x] `frontend/.env.production.example` — production environment template
- [x] `README.md` — updated with single-cmd startup, MongoDB setup, Vercel/Render deployment guide

---

## Remaining / Future Work

- [ ] **Real ML Model Weights:** Replace JS heuristic with ONNX/TF.js model (Python training out of scope).
- [ ] **Sepolia Testnet Deployment:** Configure Alchemy + deploy contract to Sepolia for live demo.
- [ ] **Code Splitting:** Bundle > 500 kB — apply dynamic import() for Admin/AI pages.
