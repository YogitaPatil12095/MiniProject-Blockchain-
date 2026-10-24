# Intellihealth — Secured Decentralized Electronic Health Record System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.x-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Ethers](https://img.shields.io/badge/Ethers-v6-purple)](https://docs.ethers.org/v6/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Vercel Frontend](https://img.shields.io/badge/Vercel-Live_App-black?logo=vercel)](https://mini-project-blockchain.vercel.app/)
[![Render Backend](https://img.shields.io/badge/Render-Live_API-46E3B7?logo=render)](https://miniproject-blockchain.onrender.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

### 🚀 Live Deployments
* **Frontend Web Application (Vercel):** [https://mini-project-blockchain.vercel.app/](https://mini-project-blockchain.vercel.app/)
* **Backend REST API (Render):** [https://miniproject-blockchain.onrender.com/api/health](https://miniproject-blockchain.onrender.com/api/health)
* **Technical Whitepaper / Research Paper (IEEE Format):** [`docs/RESEARCH_PAPER_IEEE_FORMAT.md`](docs/RESEARCH_PAPER_IEEE_FORMAT.md)

---

## 1. Architecture & System Overview

Intellihealth combines **Ethereum smart contracts**, **encrypted IPFS storage (Pinata)**, a **MongoDB Atlas backend API** for off-chain supplementary data, and an integrated **Predictive AI/ML Disease Analysis System** for automated preliminary diagnosis of medical scans (Pneumonia from X-rays, Brain Tumors from MRI scans). User identities are linked via MetaMask wallets to their **Aadhaar Number** as the primary identification key. Strict Role-Based Access Control (RBAC) ensures users only access features permitted for their registered role (Admin, Doctor, or Patient).

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
                          +---------------+---------------+
                          |                               |
                          v                               v
         +----------------+-------------------+   +-------+--------+
         |      Ethereum Smart Contract       |   | Express REST   |
         |      (Intellihealth / PHR.sol)     |   | API (Node.js)  |
         +------------------------------------+   +-------+--------+
                                                          |
                                                          v
                                                 +--------+-------+
                                                 | MongoDB Atlas  |
                                                 | (Profiles, Logs|
                                                 |  Audit, Meta)  |
                                                 +----------------+
```

---

## 2. System Modules & Features

| ID | Feature / Module | Description | Role / Access |
|---|---|---|---|
| **FR-1** | **Aadhaar Wallet Sign-In** | Connect MetaMask wallet anchored with user's **Aadhaar Number**. | All Users |
| **FR-2** | **Role-Based Access Control (RBAC)** | Dynamic portal routing based on on-chain registration (Admin, Doctor, Patient). | System-Wide |
| **FR-3** | **Admin Dashboard** | Register & verify Doctors & Patients, manage user permissions, monitor appointment queues, and inspect chatbot audit logs. | Admin Only |
| **FR-4** | **Doctor Profile & Portal** | View registered patient histories, search patients by Aadhaar, write prescriptions, and order diagnostic tests. | Doctor Only |
| **FR-5** | **Patient Demographics & History** | View personal health profile, update demographics (Blood group, Height, Weight, Emergency contact), and read-only EHR records. | Patient Only |
| **FR-6** | **Permissioned EHR Creation** | Authorized doctors (**Creator / Master**) upload encrypted records to IPFS and anchor hash, diagnosis, and prescription on-chain. | Doctor (Granted) |
| **FR-7** | **Access Permission Control** | Patients grant or revoke **Viewer** (`v`), **Creator** (`c`), or **Master** (`m`) access permissions to doctors. | Patient Only |
| **FR-8** | **Appointment Booking System** | Patients request appointments by specialty and date; Doctors and Admins approve or decline bookings. | Patient & Doctor |
| **FR-9** | **Assistive Navigation Chatbot** | Interactive widget assisting users with portal navigation, FAQs, and emergency contacts. | All Portals |
| **FR-10**| **Predictive AI/ML Diagnostic Scanner** | Automated analysis of medical scans (X-ray Pneumonia detection & MRI Brain Tumor detection) with confidence scoring. | Doctor & Patient |
| **FR-11**| **Print & Export Records** | Formatted clean print layout for patient health records and official doctor prescriptions. | Patient & Doctor |

---

## 3. How to Run the Project

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x LTS
- **Git**: Installed on your system
- **MetaMask**: Installed as a browser extension

---

### First-Time Setup

Install all dependencies across root, frontend, and backend with a single command:

```bash
npm run install:all
```

---

### Single-Command Development Start

Start the local blockchain, deploy the contract, and launch the frontend — all in one command:

```bash
npm run dev
```

This runs three concurrent processes:
1. **CHAIN** — `npx hardhat node` (local Ethereum node on port 8545)
2. **DEPLOY** — waits for the node, then deploys `PHR.sol` and writes `frontend/src/contract.json`
3. **FRONTEND** — waits ~8 seconds for deploy to finish, then starts Vite on `http://localhost:3000`

### Backend API Server (Optional — for MongoDB features)

```bash
npm run start:backend
```

Starts the Express REST API on port 4000. Requires `backend/.env` with `MONGODB_URI` set. Without it, the API runs in graceful-degradation mode (all MongoDB features silently skipped; on-chain features work normally).

---

### Manual Multi-Terminal (Alternative)

If you prefer full control:

```bash
# Terminal 1 — Local blockchain
npx hardhat node

# Terminal 2 — Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## 4. MongoDB Atlas Setup

The backend uses MongoDB Atlas for off-chain supplementary data (user display profiles, chatbot history, audit logs, appointment notes). The on-chain smart contract remains the authoritative source for all medical records and access control.

### Steps

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a **free M0 cluster**.
2. In **Database Access**, create a database user with a username and password.
3. In **Network Access**, add your IP (or `0.0.0.0/0` for demo/development).
4. Click **Connect** → **Connect your application** → copy the connection string.
5. Create `backend/.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/intellihealth?retryWrites=true&w=majority
PORT=4000
ALLOWED_ORIGIN=http://localhost:3000
```

6. Start the backend: `npm run start:backend`

---

## 5. Vercel (Frontend) & Render (Backend) Deployment

### Frontend — Vercel

1. Import the GitHub repo in [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Add environment variables from `frontend/.env.production.example`.
5. Deploy. Vercel's `vercel.json` SPA rewrite handles React Router client-side routing.

### Backend — Render

1. Create a new **Web Service** in [render.com](https://render.com).
2. Connect the GitHub repo, set **Root Directory** to `backend`.
3. Render auto-reads `backend/render.yaml` for build/start commands.
4. Add `MONGODB_URI` and `ALLOWED_ORIGIN` (your Vercel URL) in the Render environment.
5. Deploy. The API will be available at `https://intellihealth-api.onrender.com` (or your assigned URL).

---

## 6. MetaMask Configuration & Role-Based Access Control (RBAC) Testing

### Setting Up Hardhat Local Network in MetaMask

1. Open **MetaMask** in your browser.
2. Click the Network Dropdown at top-left -> **Add Network** -> **Add network manually**.
3. Enter the following details:
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Click **Save**.

---

### Importing Test Accounts into MetaMask

Copy private keys from the `npx hardhat node` output:

1. **Admin / Deployer Account**: Account `#0` Private Key (e.g. `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
   - *This address deployed the contract and has initial **Admin** privileges.*
2. **Doctor Account**: Account `#1` Private Key (e.g. `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`).
3. **Patient Account**: Account `#2` Private Key (e.g. `0x5de4111ad1097d02965d3a6f930e2d528cb7aa8d5d667476b477d6cd140b5373`).

---

### Testing Role-Based Workflows

1. **Admin Workflow**:
   - Connect MetaMask with **Account #0** (Admin).
   - You will be redirected to the Admin Portal automatically.
   - Register Account #1 as a **Doctor** (enter Aadhaar, Name, Specialty, Qualifications).
   - Register Account #2 as a **Patient** (enter Aadhaar, Name, Blood Group, Age).

2. **Doctor & Patient Workflows**:
   - As **Patient** (Account #2): View your profile, book appointments, or grant EHR viewer/creator permissions to Doctor (Account #1).
   - As **Doctor** (Account #1): Search Patient by wallet address, add EHR records, prescribe medications, and update appointment status.

---

## 7. Project Directory Structure

```
MiniProject-Blockchain-/
├── contracts/
│   └── PHR.sol                        # Intellihealth Smart Contract (Solidity 0.8.24)
├── test/
│   └── PHR.test.js                    # Comprehensive unit tests & gas reporting
├── scripts/
│   ├── deploy.js                      # Deployment script generating frontend/src/contract.json
│   ├── deploy-and-export.js           # Same + also writes backend/contract.json
│   └── fundAccount.js                 # Helper to distribute test ETH to custom accounts
├── backend/
│   ├── server.js                      # Express REST API entry point
│   ├── models/                        # Mongoose schemas (UserProfile, ChatbotLog, AuditLog, AppointmentMeta)
│   ├── routes/                        # API route handlers (profile, chatbot, audit)
│   ├── middleware/auth.js             # Wallet-address header auth middleware
│   ├── render.yaml                    # Render.com deployment manifest
│   └── package.json
├── hardhat.config.js                  # Hardhat configuration
├── package.json                       # Root — Hardhat + concurrently + dev scripts
└── frontend/
    ├── vercel.json                    # Vercel SPA rewrite rule
    ├── .env.production.example        # Production environment variable template
    ├── src/
    │   ├── components/ui/             # Modular UI design system (Button, Input, Modal, TopBar, etc.)
    │   ├── context/                   # Web3 & MetaMask Wallet Context Provider
    │   ├── lib/
    │   │   ├── api.js                 # Backend REST API client (graceful degradation)
    │   │   ├── ipfs.js                # Hardened IPFS upload (demo mode, validation, retry)
    │   │   └── crypto.js              # AES-GCM 256-bit encrypt/decrypt + verifyEncryption
    │   ├── pages/                     # LandingPage, AdminDashboardPage, DoctorDashboardPage, etc.
    │   ├── styles/                    # Design tokens & global CSS
    │   └── contract.json             # Auto-generated contract deployment metadata
    └── vite.config.js
```

---

## 8. Smart Contract Gas Benchmarks

Gas consumption measured during unit test execution compared against IEEE base paper metrics:

| Function | Min Gas | Max Gas | Our Avg Gas | Paper Benchmark (Fig 22) |
|---|---|---|---|---|
| `setUserData` | 437,819 | 502,730 | **480,081** | 206,029 |
| `grantAccess` | 79,411 | 146,874 | **102,539** | 75,142 |
| `createEHR` | 214,324 | 214,504 | **214,468** | 203,904 |
| `revokeAccess` | 39,539 | 60,955 | **47,448** | *N/A (Enhanced)* |
| **Deployment** | — | — | **6,185,612** (20.6% block limit) | 2,766,773 |

---

## 9. License

MIT License. Educational mini-project implementation of the IEEE ICBDS 2024 paper *Intellihealth*.
