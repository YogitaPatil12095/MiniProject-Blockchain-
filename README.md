# Intellihealth — Secured Decentralized Electronic Health Record System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.x-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Ethers](https://img.shields.io/badge/Ethers-v6-purple)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A secured decentralized Electronic Health Record (EHR) web application based on the IEEE research paper:
> **"Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain"**  
> *S. Parshionikar, A. Verulkar, & A. Katkar, 2024 IEEE International Conference on Blockchain and Distributed Systems Security (ICBDS 2024), Pune, India (DOI: [10.1109/ICBDS61829.2024.10837083](https://doi.org/10.1109/ICBDS61829.2024.10837083))*

---

## 1. Architecture & Workflow Overview

Intellihealth combines **Ethereum smart contracts**, **encrypted IPFS storage (Pinata / FileBase)**, and an integrated **Predictive AI/ML Disease Analysis System** for automated preliminary diagnosis of medical scans (Pneumonia from X-rays, Brain Tumors from MRI scans). User identities are linked via MetaMask wallets to their **Aadhaar Number** as the primary identification key.

```
                      +---------------------------------------+
                      |       MetaMask Ethereum Wallet        |
                      |     (Linked with Aadhaar Number)      |
                      +-------------------+-------------------+
                                          |
                                          v
+------------------+     +----------------+-------------------+     +------------------+
| IPFS (Pinata/    | <== |     React Frontend Web Application    | ==> | Predictive AI/ML |
| Encrypted Storage|     | (Admin, Doctor, & Patient Portals) |     | Disease Inference|
+------------------+     +----------------+-------------------+     +------------------+
                                          |
                                          v
                         +----------------+-------------------+
                         |      Ethereum Smart Contract       |
                         |      (Intellihealth / PHR.sol)     |
                         +------------------------------------+
```

---

## 2. Comprehensive System Modules & Features

| ID | Feature / Module | Description | On-Chain Gas? |
|---|---|---|---|
| **FR-1** | **Aadhaar Wallet Sign-In** | Connect MetaMask wallet anchored with user's **Aadhaar Number**. | Yes (First registration) |
| **FR-2** | **Admin Dashboard** | System Administrator registers/verifies doctors & patients, revokes accounts, monitors booked appointments, and audits chatbot logs. | Yes |
| **FR-3** | **Doctor Profile & Dashboard** | Doctors access profiles (Specialty, Qualifications, Doctor ID, Photo) and manage patient consultation queues. | Free (Reads) |
| **FR-4** | **Patient Demographics** | Patients view and update profile details (Name, Address, Age, Blood Type, Height, Weight, Photo). | Yes (Updates) |
| **FR-5** | **Permissioned EHR View** | Patients view own medical history. Granted doctors (**Viewer / Master**) load complete consultation logs. | Free (Reads) |
| **FR-6** | **EHR & Prescription Creation** | Granted doctors (**Creator / Master**) upload encrypted files to IPFS and anchor diagnoses, prescribed drugs, lab tests, and follow-up notes. | Yes |
| **FR-7** | **Record Update & Revocation** | Doctors modify active prescriptions; patients revoke viewer/creator permissions. | Yes |
| **FR-8** | **Appointment Booking System** | Patients request appointments by specialty, date, and open time slot. Doctors and Admins approve bookings. | Yes |
| **FR-9** | **Assistive Navigation Chatbot** | Interactive floating chatbot UI helping patients navigate system portals and contact hospital staff. | Free (Client) |
| **FR-10**| **Predictive AI/ML Scanner** | Medical report & image scanner evaluating uploaded X-rays (Pneumonia) and MRI scans (Brain Tumor) for preliminary automated diagnosis. | Free (Off-chain ML) |
| **FR-11**| **Print & Export Records** | Formatted print layout for patient health records and doctor prescriptions. | Free (Client) |

---

## 3. Quickstart & Local Development

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **MetaMask**: Browser extension installed

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YogitaPatil12095/MiniProject-Blockchain-.git
cd MiniProject-Blockchain-

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..
```

### Running Smart Contract Tests

```bash
npx hardhat test
```
*Output: 28 tests passing (100% green) with gas cost benchmarks.*

---

### Running the Application Locally

#### Terminal 1 — Start Hardhat Blockchain Node
```bash
npx hardhat node
```

#### Terminal 2 — Deploy Smart Contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### Terminal 3 — Launch React Frontend
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## 4. Configuring MetaMask

1. Add Custom RPC Network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
2. Import Private Keys from Terminal 1 output:
   - Account `#0`: Admin / Patient
   - Account `#1`: Doctor

---

## 5. Smart Contract Gas Benchmarks

Gas consumption measured during contract execution compared against base paper metrics:

| Function | Min Gas | Max Gas | Our Avg Gas | Paper Benchmark (Fig 22) |
|---|---|---|---|---|
| `setUserData` | 250,740 | 250,776 | **250,758** | 206,029 |
| `grantAccess` | 79,387 | 146,850 | **102,631** | 75,142 |
| `createEHR` | 143,750 | 143,930 | **143,894** | 203,904 |
| `revokeAccess` | 39,537 | 60,953 | **47,446** | *N/A (Enhanced)* |
| **Deployment** | — | — | **1,740,814** (2.9% block limit) | 2,766,773 |

---

## 6. License

MIT License. Educational mini-project implementation of the IEEE ICBDS 2024 paper *Intellihealth*.
ntation.
