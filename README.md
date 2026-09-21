# Decentralized Personal Health Record (PHR) dApp

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.x-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Ethers](https://img.shields.io/badge/Ethers-v6-purple)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A decentralized Personal Health Record (PHR) web application based on the IEEE research paper:
> **"Decentralize Application for Storing Personal Health Record using Ethereum Blockchain and Interplanetary File System"**  
> *R. Sentausa & S. T. Hareva, ICTIIA 2022 (DOI: [10.1109/ICTIIA54654.2022.9935996](https://doi.org/10.1109/ICTIIA54654.2022.9935996))*

---

## 1. Architecture Overview

Medical record files are uploaded to **IPFS** via **Pinata** to minimize on-chain storage costs. Only the tamper-evident cryptographic **CID** (Content Identifier), creator signature, and timestamps are recorded on the **Ethereum smart contract**.

```
  +-------------------+
  |   React Frontend  |
  +----+---------+----+
       |         |
 (File Upload) (Sign Tx & CID)
       |         |
       v         v
   +-------+   +------------------------+
   | IPFS  |   | Ethereum Smart Contract|
   |Pinata |   |      (PHR.sol)         |
   +-------+   +------------------------+
```

---

## 2. Implemented Features (Paper Use Cases)

| ID | Feature | Description | On-Chain Gas? |
|---|---|---|---|
| **FR-1** | **Login & Register** | Connect MetaMask; first-time callers register with `setUserData`. | Yes (First time) |
| **FR-2** | **View Health Records** | Patient views all their own medical records and opens files via IPFS links. | No (Free query) |
| **FR-3** | **View Access List** | Patient inspects authorized Viewers and Creators. | No (Free query) |
| **FR-4** | **Grant Access** | Patient grants an address Viewer (`v`), Creator (`c`), or Master (`m`) access. | Yes |
| **FR-5** | **View Patient Records** | Doctors view records for patients who granted them Viewer access. | No (Free query) |
| **FR-6** | **Create Patient Record** | Doctors upload medical files to IPFS and anchor CIDs via `createEHR`. | Yes |
| **FR-7** | **Revoke Access** | Patient removes viewing or creating permissions from an address. | Yes |

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

# 2. Install root dependencies
npm install

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

### Running Tests & Gas Reporter

```bash
npx hardhat test
```
*Output: 28 tests passing (100% green) with complete gas consumption table.*

---

### Running the Local dApp

#### Terminal 1 — Start Hardhat Local Blockchain Node
```bash
npx hardhat node
```
*Note the 20 pre-funded test accounts (10,000 ETH each) and their private keys.*

#### Terminal 2 — Deploy Contract to Local Node
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*This automatically deploys `PHR.sol` and writes `frontend/src/contract.json`.*

#### Terminal 3 — Start Vite React Frontend
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 4. Configuring MetaMask for Local Testing

1. Open MetaMask -> Click the **Network Selector** (top left) -> **Add a network manually**.
   - **Network Name:** Hardhat Local
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
2. **Import Test Accounts:**
   - In MetaMask, click Account selector -> **Add account or hardware wallet** -> **Import account**.
   - Copy Private Key `#0` (for Patient) and `#1` (for Doctor) from the `npx hardhat node` terminal output and paste into MetaMask.
   - Each account will show a balance of **10,000 ETH**.

---

## 5. End-to-End Demo Workflow

1. **Patient Registration:**
   - Connect Account 1 (Patient). Fill in registration form (Full Name, Gender, Address, Phone, Birthday) and submit.
2. **Doctor Registration:**
   - Switch MetaMask to Account 2 (Doctor). Fill in registration form and submit.
3. **Grant Master Access:**
   - Switch back to Account 1. Go to **Grant Access** -> Paste Account 2's address -> Select **Master** -> Confirm in MetaMask.
4. **Doctor Uploads EHR:**
   - Switch to Account 2 -> Go to **Doctor Portal** -> **Create Patient Record** -> Paste Patient address -> Select sample file -> Click **Upload & Save**.
   - File uploads to IPFS, CID is anchored on-chain.
5. **Patient Inspects Records:**
   - Switch to Account 1 -> Go to **My Records** -> Click **Open on IPFS** to view the uploaded medical document.
6. **Access Control Check:**
   - Switch to Account 3 (Unregistered / Non-granted) -> Attempt to view patient records -> Call is rejected with friendly error message: *"The patient has not given you permission to view their records"*.

---

## 6. Gas Cost Comparison

Comparison between this implementation and the base paper's published gas benchmarks (Fig 22):

| Method | Min Gas | Max Gas | Our Avg Gas | Paper Avg (Fig 22) |
|---|---|---|---|---|
| `setUserData` | 250,740 | 250,776 | **250,758** | 206,029 |
| `grantAccess` | 79,387 | 146,850 | **102,631** | 75,142 |
| `createEHR` | 143,750 | 143,930 | **143,894** | 203,904 |
| `revokeAccess` | 39,537 | 60,953 | **47,446** | *N/A (Added feature)* |
| `Deployment` | — | — | **1,740,814** (2.9% block limit) | 2,766,773 |

---

## 7. Declared Deviations & Limitations

### Deviations from the Base Paper
- **Creation Timestamps:** Uses `block.timestamp` on-chain rather than client-supplied strings to ensure tamper-proof chronology.
- **$O(1)$ Permission Checks:** Implemented nested mapping lookups (`canView`, `canCreate`) rather than linear array iterations.
- **Revocation:** Added `revokeAccess` feature for patients.
- **Events:** Emits Solidity events for all state changes (`UserRegistered`, `AccessGranted`, `AccessRevoked`, `EHRCreated`).
- **Registration Protection:** Registration (`setUserData`) is strictly one-time per address.
- **Networks:** Uses Hardhat Local & Sepolia (Rinkeby used in the paper is deprecated).

### Known Limitations
- Public IPFS files are accessible to anyone with the CID (no end-to-end client-side encryption in this demo).
- Any wallet address can self-register without centralized medical board verification.
- On-chain storage is publicly readable by default; smart contract access control governs contract interactions.

---

## 8. License

MIT License. Educational mini-project implementation.
