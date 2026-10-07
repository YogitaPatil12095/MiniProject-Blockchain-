# MILESTONES.md — Phased Implementation Plan

> Living project roadmap aligned with the Intellihealth IEEE ICBDS 2024 paper.

## Overview & Phase Schedule

| Phase | Module Name | Estimated Time | Primary Output |
|---|---|---|---|
| **Phase 0** | Prerequisites & Workspace Setup | 1 h | Dev environment, MetaMask, Pinata API, project config |
| **Phase 1** | Smart Contract Core & Verification | 4–6 h | `PHR.sol` contract, 28+ Hardhat tests green, gas benchmarks |
| **Phase 2** | Deploy Script & Local Chain Setup | 1–2 h | `deploy.js`, contract ABI sync (`contract.json`), Hardhat network |
| **Phase 3** | Core Frontend & Portals Scaffold | 6–8 h | Wallet context, patient & doctor base dashboards, IPFS client upload |
| **Phase 4** | Admin Portal & Profile Extensions | 4–5 h | Admin workflow dashboard, Aadhaar linking, extended user profile data |
| **Phase 5** | Appointment Booking & Chatbot | 3–4 h | Appointment scheduling bar, slot reservation, interactive navigation chatbot UI |
| **Phase 6** | AI/ML Predictive Disease Diagnosis | 4–5 h | Pneumonia & Brain Tumor scan upload, preliminary ML detection inference module |
| **Phase 7** | Documentation, Review & Demo | 3–4 h | Comprehensive README, test screenshots, gas table, final project verification |

---

## Phase 0 — Prerequisites & Workspace Setup

- [x] Node 20/22 LTS, Git, VS Code / Antigravity configured
- [x] MetaMask extension installed with 3 pre-funded local accounts (Admin, Doctor, Patient)
- [x] Pinata JWT configured in local `.env`
- [x] Project markdown files (`AGENTS.md`, `PRD.md`, `MILESTONES.md`, `MEMORY.md`, `DESIGN.md`, `REVIEW.md`, `ROLES.md`) synchronized

---

## Phase 1 — Smart Contract Core & Verification

- [x] Hardhat 2.x setup with `@nomicfoundation/hardhat-toolbox` and Solidity `0.8.24`
- [x] Implement core `PHR.sol` with `User`, `EHR`, `grantAccess`, `createEHR`, `revokeAccess`, and events
- [x] Hardhat test suite `test/PHR.test.js` passing 28 tests with gas reporter
- [ ] Contract extension for Admin role, Aadhaar linkage, Appointments struct, and prescription details (`Medication[]`, `ClinicalTest[]`)

---

## Phase 2 — Deploy Script & Local Chain Setup

- [x] `scripts/deploy.js` deploying contract and exporting `frontend/src/contract.json`
- [x] Local Hardhat network running (`chainId 31337`)
- [x] Private keys imported to MetaMask for local testing

---

## Phase 3 — Core Frontend & Portals Scaffold

- [x] Vite + React app setup in `/frontend` with `ethers` v6 and `react-router-dom`
- [x] WalletContext with account tracking, network switching prompt, and event handlers
- [x] Base Patient Dashboard (view records, grant/revoke access) and Doctor Dashboard (create/view EHR)
- [x] Pinata IPFS file upload integration (`lib/ipfs.js`)

---

## Phase 4 — Admin Portal & Profile Extensions

- [ ] **Admin Portal (`AdminDashboardPage.jsx`):**
  - [ ] Add/Register Doctors with specialty, qualifications, location, and Doctor ID
  - [ ] Add/Register Patients with Aadhaar Number and demographics
  - [ ] Revoke user accounts & view system audit logs
- [ ] **Extended Demographic Profiles:**
  - [ ] Patient profile editor (Age, Phone, Address, Blood Group, Height, Weight, Photo)
  - [ ] Doctor profile page (Qualifications, Specialty, Contact)

---

## Phase 5 — Appointment Booking & Chatbot

- [ ] **Appointment Scheduling System:**
  - [ ] Appointment booking form for patients (Doctor select, Specialty, Date & Time slot)
  - [ ] Doctor & Admin appointment approval / status dashboard (`Pending`, `Confirmed`, `Completed`)
- [ ] **Assistive Navigation Chatbot:**
  - [ ] Interactive floating messaging modal to assist patients in navigating portals and contacting hospital staff

---

## Phase 6 — AI/ML Predictive Disease Diagnosis

- [ ] **Predictive AI Analysis Scanner (`AIDiagnosisPage.jsx`):**
  - [ ] File dropzone for uploading medical reports, X-rays, and MRI scans
  - [ ] Automated preliminary inference engine for:
    - [ ] **Pneumonia Detection** from chest X-rays
    - [ ] **Brain Tumor Detection** from MRI scans
  - [ ] Confidence score display & preliminary diagnostic summary card

---

## Phase 7 — Documentation, Review & Demo

- [ ] `README.md` update with Intellihealth IEEE 2024 paper details, architecture diagrams, features table, setup instructions, and gas metrics
- [ ] `REVIEW.md` verification checklist pass
- [ ] Final `MEMORY.md` update with completed milestones, decisions, and system verification evidence

