# MILESTONES.md — Phased Plan

> Stop for user approval at the end of each phase. Tick boxes as you go, and mirror status in `MEMORY.md`.
> Time estimates assume one focused person; adjust to your deadline.

## Overview

| Phase | Name | Est. time | Output |
|---|---|---|---|
| 0 | Setup and prerequisites | 1 h | Accounts and tools ready |
| 1 | Smart contract and tests | 4–6 h | `PHR.sol`, 23+ passing tests, gas report |
| 2 | Deploy and local network | 1–2 h | `deploy.js`, `contract.json`, MetaMask configured |
| 3 | Frontend | 6–10 h | Working UI for all 7 features |
| 4 | Docs, review, demo | 3–4 h | README, screenshots, report material |
| 5 | (Optional) Sepolia | 1–2 h | Public testnet deployment |

---

## Phase 0 — Setup and prerequisites

- [x] Node 20/22 LTS, Git, VS Code/Antigravity installed
- [x] MetaMask extension installed; three accounts prepared (patient, doctor, spare)
- [x] Pinata account created; API JWT saved locally (not committed)
- [x] (Optional) Alchemy/Infura Sepolia RPC URL and a throwaway wallet with Sepolia ETH
- [x] Empty repo initialised; the six `.md` files copied to the root

**Done when:** `node -v` works, MetaMask shows accounts, and the JWT is in a local `.env`.

---

## Phase 1 — Smart contract and tests

- [x] Hardhat 2.x project initialised; sample files removed
- [x] `hardhat.config.js`: Solidity 0.8.24, gas reporter on, localhost and sepolia networks
- [x] `PHR.sol` with structs, mappings, all functions in `PRD.md`, events, NatSpec
- [x] Paper's revert messages preserved verbatim
- [x] `PHR.test.js` with `loadFixture` and four signers

**Tests to implement**
- [x] Creating New User (4): Patient, Doctor, User1, User2
- [x] Granting Access (4 + 1): already-viewer fails, Doctor `m`, User1 `c`, User2 `v`, invalid role fails
- [x] Viewing Access List (4)
- [x] Viewing EHR (4): patient ✔, doctor ✔, User1 ✘, User2 ✔
- [x] Creating EHR (4): patient ✘, doctor ✔, User1 ✔, User2 ✘
- [x] Extras (≥3): revoke viewer, revoke creator, duplicate registration reverts

**Acceptance criteria**
- `npx hardhat test` all green; output pasted in `MEMORY.md`
- Gas table (min/max/avg) for `setUserData`, `grantAccess`, `createEHR` recorded
- `REVIEW.md` sections A (contract) and B (tests) pass

---

## Phase 2 — Deploy and local network

- [ ] `scripts/deploy.js` deploys `PHR` and prints the address
- [ ] Script writes `frontend/src/contract.json` with `{ address, abi }`
- [ ] `npx hardhat node` runs; deploy to `localhost` succeeds
- [ ] MetaMask custom network added (RPC `http://127.0.0.1:8545`, chainId `31337`)
- [ ] Three Hardhat private keys imported into MetaMask
- [ ] Deployed address recorded in `MEMORY.md`

**Acceptance criteria**
- `contract.json` regenerates on every deploy
- MetaMask shows a 10,000 ETH balance on the imported accounts

---

## Phase 3 — Frontend

### 3.1 Scaffold and wiring
- [ ] Vite React app in `/frontend`, deps: `ethers`, `react-router-dom`
- [ ] Design tokens from `DESIGN.md` in a global CSS file
- [ ] Wallet context: connect, account, chainId, signer, contract
- [ ] Chain check with a "Switch network" prompt
- [ ] `accountsChanged` and `chainChanged` listeners

### 3.2 Pages and features
- [ ] **Login/Register** (FR-1): connect → `isRegistered` → register form → `setUserData`
- [ ] **Patient Dashboard**
  - [ ] My Health Records (FR-2) with IPFS gateway links
  - [ ] My Access List (FR-3)
  - [ ] Grant Access (FR-4)
  - [ ] Revoke Access (FR-7)
- [ ] **Doctor Dashboard**
  - [ ] View Patient Record (FR-5)
  - [ ] Create Patient Record (FR-6): file → Pinata → CID → `createEHR`

### 3.3 Cross-cutting
- [ ] "Requires gas fee" badge on all writes
- [ ] Loading, success (tx hash), and error states
- [ ] Revert reason → friendly message map
- [ ] Persistent "Demo only" warning banner
- [ ] Responsive layout (≥360 px)

**Acceptance criteria**
- `npm run dev` runs without console errors
- Full manual E2E (below) succeeds
- `REVIEW.md` sections C (frontend) and D (integration) pass

### E2E demo script (use for screenshots)
1. Account 1 registers as patient. Account 2 registers as doctor.
2. Patient grants doctor **Master**.
3. Doctor tries to create a record → uploads a dummy PDF → confirms in MetaMask.
4. Patient opens My Health Records → sees the record → opens the IPFS link.
5. Account 3 (unregistered or not granted) tries to view → sees the blocked error.
6. Patient revokes the doctor → doctor's next view is blocked.

---

## Phase 4 — Docs, review, demo

- [ ] `README.md`: setup, env vars, MetaMask config, running tests, demo steps, Sepolia steps
- [ ] README "Deviations from the paper" and "Limitations" sections
- [ ] Full pass of `REVIEW.md`; results logged
- [ ] Screenshots: tests passing, gas table, each UI screen, MetaMask confirmations
- [ ] Comparison table: our gas vs the paper's Fig 22
- [ ] Final `MEMORY.md` update

**Acceptance criteria**
- A new person can clone the repo, follow the README, and run the demo
- No secrets in git history (`git log -p | grep -i jwt` finds nothing)

---

## Phase 5 — (Optional) Sepolia deployment

- [ ] `.env` has `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` (throwaway wallet)
- [ ] `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] Frontend `VITE_CHAIN_ID=11155111`; MetaMask on Sepolia
- [ ] Re-run the E2E demo; record tx hashes and Etherscan links

---

## Report and presentation outline (suggested)

1. Problem and motivation
2. Base paper summary and architecture
3. Our implementation and tech stack
4. Smart contract walkthrough
5. Test plan and results (20+ tests)
6. Gas cost comparison with the paper
7. Live demo
8. Deviations, limitations, and future work
