# Intellihealth — Secured Decentralized Electronic Health Record System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.x-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Ethers](https://img.shields.io/badge/Ethers-v6-purple)](https://docs.ethers.org/v6/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A secured decentralized Electronic Health Record (EHR) web application based on the IEEE research paper:
> **"Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain"**  
> *S. Parshionikar, A. Verulkar, & A. Katkar, 2024 IEEE International Conference on Blockchain and Distributed Systems Security (ICBDS 2024), Pune, India (DOI: [10.1109/ICBDS61829.2024.10837083](https://doi.org/10.1109/ICBDS61829.2024.10837083))*

---

## 1. Architecture & System Overview

Intellihealth combines **Ethereum smart contracts**, **encrypted IPFS storage (Pinata / FileBase)**, and an integrated **Predictive AI/ML Disease Analysis System** for automated preliminary diagnosis of medical scans (Pneumonia from X-rays, Brain Tumors from MRI scans). User identities are linked via MetaMask wallets to their **Aadhaar Number** as the primary identification key. Strict Role-Based Access Control (RBAC) ensures users only access features permitted for their registered role (Admin, Doctor, or Patient).

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

## 3. How to Run the Project (Step-by-Step)

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x LTS
- **Git**: Installed on your system
- **MetaMask**: Installed as a browser extension

---

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/YogitaPatil12095/MiniProject-Blockchain-.git
cd MiniProject-Blockchain-

# Install root smart contract dependencies (Hardhat, Ethers, Chai)
npm install

# Install frontend dependencies (React, Vite, Lucide-React, React-Router-DOM)
cd frontend
npm install
cd ..
```

---

### Step 2: Run Smart Contract Unit & Integration Tests (Optional)

Verify smart contract logic and check gas benchmarks before starting:

```bash
npx hardhat test
```
*Expected Output: All 35 tests passing with gas report output.*

---

### Step 3: Start Local Blockchain & Application (Requires 3 Terminals)

#### Terminal 1 — Start Local Hardhat Blockchain Node
```bash
npx hardhat node
```
*This starts a local Ethereum node on `http://127.0.0.1:8545` (Chain ID `31337`) and generates 20 pre-funded test accounts with 10,000 ETH each.*

> **Important**: Keep Terminal 1 open while testing the application.

#### Terminal 2 — Deploy Contract & Fund Test Accounts

Open a new terminal window at the project root and run:

```bash
# 1. Deploy PHR smart contract to local network
npx hardhat run scripts/deploy.js --network localhost

# 2. (Optional) Fund team / custom test accounts with local ETH
npx hardhat run scripts/fundAccount.js --network localhost
```

> **Note**: `deploy.js` automatically creates `frontend/src/contract.json` containing the deployed contract address and ABI.

#### Terminal 3 — Launch React Frontend Web Application

Open a third terminal window, navigate to `frontend`, and start Vite dev server:

```bash
cd frontend
npm run dev
```
*The dev server will run at `http://localhost:3000` (or `http://localhost:5173`). Open the URL in your browser.*

---

## 4. MetaMask Configuration & Role-Based Access Control (RBAC) Testing

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

Copy private keys from **Terminal 1** (`npx hardhat node`) output:

1. **Admin / Deployer Account**: Account `#0` Private Key (e.g. `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
   - *This address deployed the contract and has initial **Admin** privileges.*
2. **Doctor Account**: Account `#1` Private Key (e.g. `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`).
3. **Patient Account**: Account `#2` Private Key (e.g. `0x5de4111ad1097d02965d3a6f930e2d528cb7aa8d5d667476b477d6cd140b5373`).

---

### Testing Role-Based Workflows

1. **Admin Workflow**:
   - Connect MetaMask with **Account #0** (Admin).
   - Navigate to the **Admin Portal**.
   - Register Account #1 as a **Doctor** (enter Aadhaar, Name, Specialty, Qualifications).
   - Register Account #2 as a **Patient** (enter Aadhaar, Name, Blood Group, Age).

2. **Switching Accounts**:
   - Click **Connect MetaMask** or **Switch Wallet** on top navigation bar.
   - Select another account in MetaMask. The app automatically updates permissions and routes to the appropriate dashboard!

3. **Doctor & Patient Workflows**:
   - As **Patient** (Account #2): View your profile, book appointments, or grant EHR viewer/creator permissions to Doctor (Account #1).
   - As **Doctor** (Account #1): Search Patient by Aadhaar or wallet address, add EHR records, prescribe medications, and update appointment status.

---

## 5. Project Directory Structure

```
MiniProject-Blockchain-/
├── contracts/
│   └── PHR.sol                  # Intellihealth Smart Contract (Solidity 0.8.24)
├── test/
│   └── PHR.test.js              # Comprehensive unit tests & gas reporting
├── scripts/
│   ├── deploy.js                # Deployment script generating frontend/src/contract.json
│   └── fundAccount.js           # Helper script to distribute test ETH to custom accounts
├── hardhat.config.js            # Hardhat configuration (Solidity optimizer & network settings)
└── frontend/
    ├── src/
    │   ├── components/ui/       # Modular UI design system (Button, Input, Modal, Select, TopBar)
    │   ├── context/             # Web3 & MetaMask Wallet Context Provider
    │   ├── pages/               # LandingPage, AdminDashboardPage, DoctorDashboardPage, PatientDashboardPage, AIDiagnosisPage, AppointmentPage
    │   ├── styles/              # Design tokens & global CSS styles
    │   └── contract.json        # Auto-generated contract deployment metadata
    └── vite.config.js           # Vite development server settings
```

---

## 6. Smart Contract Gas Benchmarks

Gas consumption measured during unit test execution compared against IEEE base paper metrics:

| Function | Min Gas | Max Gas | Our Avg Gas | Paper Benchmark (Fig 22) |
|---|---|---|---|---|
| `setUserData` | 437,819 | 502,730 | **480,081** | 206,029 |
| `grantAccess` | 79,411 | 146,874 | **102,539** | 75,142 |
| `createEHR` | 214,324 | 214,504 | **214,468** | 203,904 |
| `revokeAccess` | 39,539 | 60,955 | **47,448** | *N/A (Enhanced)* |
| **Deployment** | — | — | **6,185,612** (20.6% block limit) | 2,766,773 |

---

## 7. License

MIT License. Educational mini-project implementation of the IEEE ICBDS 2024 paper *Intellihealth*.
