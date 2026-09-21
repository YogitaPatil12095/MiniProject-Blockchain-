# PRD — Decentralized PHR dApp (Ethereum + IPFS)

**Version:** 1.0  **Type:** Blockchain mini-project  **Base paper:** Sentausa & Hareva, *Decentralize Application for Storing Personal Health Record using Ethereum Blockchain and Interplanetary File System*, ICTIIA 2022 (DOI 10.1109/ICTIIA54654.2022.9935996)

## 1. Overview

Patients' health records are sensitive and often scattered across hospitals. This project builds a dApp where a patient owns their record and decides which addresses may view or add to it. Files are stored on IPFS, and only the content hash (CID) and metadata are stored on Ethereum. This keeps on-chain cost low while making the record reference tamper-evident.

## 2. Goals

1. Replicate the paper's system: 1 smart contract, 2 roles, 6 features.
2. Reproduce the paper's test plan (5 sections × 4 cases = 20 tests) and gas-cost table.
3. Deliver a working demo: local chain, optional Sepolia, React UI, MetaMask, IPFS upload.
4. Document deviations and limitations honestly.

### Non-goals
Production readiness, real patient data, encryption, ML, chatbot, appointments, admin role, mainnet deployment.

## 3. Users and roles

| Role | Description | Capabilities |
|---|---|---|
| **Patient** | Owns a record, identified by wallet address | Register, view own records, view access list, grant access, revoke access |
| **Doctor** | Any registered user who has been granted access | Register, view a patient's records (needs viewer access), create a record for a patient (needs creator access) |

Access levels a patient can grant to an address: **Viewer (`v`)**, **Creator (`c`)**, **Master (`m`)** = both.
A patient is always a viewer of their own record and is not a creator of their own record (as in the paper's tests).

## 4. Functional requirements

| ID | Feature (paper use case) | Requirement | Gas? |
|---|---|---|---|
| FR-1 | **Login / Register** (UC-1) | Connect MetaMask. If the address is not registered, show a form (full name, gender, home address, phone, birthday) and call `setUserData`. Registration works once per address. | Yes (first time) |
| FR-2 | **View Health Record** (UC-2) | Patient sees their own records: creator name, date, IPFS link. | No |
| FR-3 | **View Access List** (UC-3) | Patient sees viewer list and creator list. | No |
| FR-4 | **Grant Access** (UC-4) | Patient enters an address and picks Viewer, Creator, or Master. Errors: role invalid, user not found, already granted. | Yes |
| FR-5 | **View Patient Record** (UC-5) | Doctor enters a patient address and sees records. Requires viewer access. | No |
| FR-6 | **Create Patient Record** (UC-6) | Doctor enters a patient address, picks a file, file uploads to IPFS, CID is stored via `createEHR`. Requires creator access. | Yes |
| FR-7 | **Revoke Access** (added) | Patient removes viewer, creator, or master access from an address. | Yes |

## 5. Non-functional requirements

- **Security:** Role checks enforced in the contract using `msg.sender`, never client-side only.
- **Cost:** Gas per method should be close to the paper's (see section 8).
- **Usability:** Each write action shows a gas badge, pending, success (tx hash), and a friendly error.
- **Transparency:** A demo-only warning banner about public data is always visible.
- **Portability:** Runs locally with Hardhat node plus MetaMask; Sepolia optional.
- **Code quality:** Readable, commented, NatSpec on public functions.

## 6. Data model (from the paper's Fig 2)

```solidity
struct EHR  { address creator_address; string creator_name; string ipfs_location; uint256 createdAt; }
struct User { address user_address; string full_name; string gender; string home_address;
              string phone_number; uint256 birthday;
              address[] viewerList; address[] creatorList; EHR[] ehr_data; }
mapping(address => User) userData;
```

Additions: `canView` and `canCreate` nested mappings for O(1) checks. Arrays remain for display only.

## 7. Architecture

```
User → React app ──(file)──▶ IPFS (Pinata) ──▶ CID
          │                                     │
          └──(MetaMask signs tx with CID)──▶ PHR smart contract (Ethereum)
```

Reads: free calls through a signer-connected contract. Writes: MetaMask confirmation and gas.

## 8. Acceptance criteria

1. `npx hardhat test` passes all 20 paper-derived tests plus at least 3 extras.
2. Gas report shows min/max/avg for `setUserData`, `grantAccess`, `createEHR`. Reference values from the paper's Fig 22 (gas units): `setUserData` ≈ 206,029, `grantAccess` ≈ 75,142, `createEHR` ≈ 203,904. Ours may differ slightly due to the added mappings and Solidity version.
3. End-to-end demo on local chain with 3 accounts: register patient and doctor → patient grants doctor master → doctor uploads file → patient sees record and opens the IPFS link.
4. Non-granted user is blocked from viewing and creating, with clear UI errors.
5. README explains setup, demo, and deviations.

## 9. Deviations from the paper (declared)

| Paper | This project | Reason |
|---|---|---|
| Client-supplied creation date | `block.timestamp` | Cannot be forged by the caller |
| Array scans for access checks | Mappings for checks, arrays for listing | Cheaper and O(1) |
| No revoke | `revokeAccess` | Patient control |
| No events | Events on all state changes | Easier frontend and auditing |
| Repeatable `setUserData` | Register once | Prevents overwriting |
| Rinkeby testnet | Hardhat local + Sepolia | Rinkeby is shut down |

## 10. Known limitations (state in the report)

- Everything on-chain is publicly readable regardless of Solidity `public`/`private`. Contract-level access control only limits *contract calls*, not raw storage reads.
- Files on public IPFS are accessible to anyone with the CID. No encryption in this version.
- Any address can self-register as a user. There is no doctor verification.
- Pinata JWT is exposed in the browser in this demo setup.
- CIDs are immutable, so "deleting" a record is not possible; only access to the pointer is controlled.

**Future work:** client-side encryption with per-viewer key sharing, admin-verified doctors, backend proxy for IPFS uploads, record revocation flags.

## 11. Risks

| Risk | Mitigation |
|---|---|
| MetaMask nonce errors after restarting the Hardhat node | Document "clear activity tab data" in README |
| Pinata API changes | Agent must read current docs before coding upload |
| ethers v6 struct handling bugs | Convert `Result` to plain objects; test in UI early |
| Time overrun | Follow phase order; UI polish last |
