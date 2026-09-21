# MEMORY.md — Project Memory

> Living document. The agent must read this at the start of every session and update it at the end of every phase. Keep entries short and factual.

## 1. Current status

| Field | Value |
|---|---|
| Current phase | Phase 3 Complete (Frontend and Smart Container Layer Ready) |
| Last completed milestone | Phase 2 (Deploy) & Phase 3 (Frontend & Container Pages) |
| Next action | Phase 4 (README, E2E demo review, and documentation pass) |
| Blockers | None |
| Last updated | 2026-09-21 |

## 2. Fixed decisions (do not revisit without the user's approval)

| # | Decision | Reason |
|---|---|---|
| D1 | Base paper: Sentausa & Hareva (ICTIIA 2022), Ethereum + IPFS PHR dApp | Small scope, code snippets provided, testable |
| D2 | Hardhat 2.x, not 3, Truffle, or Ganache | Toolbox compatibility, stable docs, Waffle-style matchers |
| D3 | Solidity 0.8.24 | Modern, close to paper's 0.8.13 |
| D4 | React + Vite + ethers v6 | Fast setup |
| D5 | IPFS via Pinata, JWT from `VITE_PINATA_JWT` | Free tier, simple upload |
| D6 | Roles: patient and doctor only. Access codes `v`, `c`, `m` | Matches the paper |
| D7 | Keep the paper's revert messages verbatim | Test cases rely on them |
| D8 | Timestamps via `block.timestamp` | Deviation, declared |
| D9 | Added `revokeAccess`, events, register-once, mapping-based checks | Improvements, declared |
| D10 | No encryption, ML, chatbot, appointments, or admin role | Out of scope for the mini-project |
| D11 | Local chain first (chainId 31337); Sepolia optional | Rinkeby is dead |
| D12 | UI designed via Google Stitch using `DESIGN.md` | Consistent design system |

## 3. Key facts about the paper (for quick reference)

- 6 features: Login, View Health Record, View Access List, Grant Access, View Patient Record, Create Patient Record.
- Write features (cost gas): Login/`setUserData`, `grantAccess`, `createEHR`. Reads are free.
- Tests: 5 sections × 4 cases = 20 tests, 4 dummy users: Patient, Doctor (master), User1 (creator), User2 (viewer).
- Paper's gas (Fig 22, avg): `setUserData` 206,029 · `grantAccess` 75,142 · `createEHR` 203,904. Deployment ≈ 2,766,773 gas (9.2% of block limit).
- Paper's testnet: Rinkeby (no longer available).

## 4. Environment notes

- Node: 20 or 22 LTS
- Local RPC: `http://127.0.0.1:8545`, chainId `31337`, symbol ETH
- Sepolia chainId: `11155111`
- Env files: root `.env` (`SEPOLIA_RPC_URL`, `DEPLOYER_PRIVATE_KEY`); `frontend/.env` (`VITE_PINATA_JWT`, `VITE_CHAIN_ID`)
- Deployed contract address: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (local)
- Pinata gateway used: `https://gateway.pinata.cloud/ipfs/`

## 5. Known gotchas (pre-loaded)

1. **Restarting `hardhat node`** resets the chain. MetaMask then shows nonce errors. Fix: MetaMask → Settings → Advanced → Clear activity tab data.
2. **View functions use `msg.sender`.** Calling with a bare provider returns `address(0)` as sender and the call reverts. Use a signer-connected contract.
3. **ethers v6 `Result` objects** are read-only tuples. Map to plain objects (`{creator, name, cid, createdAt: Number(...)}`). BigInt must be converted before rendering or JSON.
4. **BigInt in JSON:** `JSON.stringify` fails on BigInt. Convert first.
5. **Pinata API changes.** Verify the current docs before coding the upload.
6. **Vite env vars** must start with `VITE_` and need a dev-server restart after change.
7. **Duplicate registration** reverts. The UI must check `isRegistered` first.

## 6. Phase log

### Phase 0 & Phase 1 — Setup, Smart Contract and Tests — 2026-09-21
- Done:
  - Initialized branch `build/smart-contract-tests`.
  - Configured project dependencies (`package.json`, `.gitignore`, `.env.example`, `hardhat.config.js`).
  - Implemented `PHR.sol` with exact data structures, paper revert strings, and declared enhancements (`block.timestamp`, O(1) mappings, `revokeAccess`, events).
  - Implemented `PHR.test.js` covering 20 paper-derived tests (5 sections x 4 cases) + 8 extra edge case tests (28 total tests).
  - Configured gas reporter with Solidity 0.8.24 optimizer (runs: 200).
- Files changed: `.gitignore`, `.env.example`, `package.json`, `hardhat.config.js`, `contracts/PHR.sol`, `test/PHR.test.js`, `MEMORY.md`.
- Commands run and result:
  - `npx hardhat compile` -> Compiled 1 Solidity file successfully.
  - `npx hardhat test` -> 28 passing (7s), 0 failing.
- Decisions or deviations:
  - Preserved paper revert strings verbatim for full test compatibility.
  - Gas reporter measured lower gas for `createEHR` (143,894 vs 203,904 in paper) due to Solidity 0.8.24 compiler optimizations.
- Issues found and how they were fixed:
  - Peer dependency resolution conflict with `hardhat-gas-reporter` -> resolved by leveraging `@nomicfoundation/hardhat-toolbox` built-in reporter.

### Phase 2 — Deploy script and local network — 2026-09-21
- Done:
  - Created `scripts/deploy.js` deploying `PHR` and automatically generating `frontend/src/contract.json`.
  - Tested deployment on local hardhat network (Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`).
- Files changed: `scripts/deploy.js`, `frontend/src/contract.json`.

### Phase 3 — Frontend & Smart Container Pages — 2026-09-21
- Done:
  - Scaffolded Vite + React frontend in `/frontend` with `ethers` v6, `react-router-dom`, `lucide-react`.
  - Implemented `WalletContext.jsx` with account and network tracking, auto-connect, chain switching.
  - Implemented `usePHR.js` hook exposing all 7 features (FR-1 through FR-7) with error translation.
  - Implemented `lib/ipfs.js` supporting official Pinata upload (`pinFileToIPFS`).
  - Built smart container pages: `LoginRegisterPage.jsx`, `PatientDashboardPage.jsx`, `DoctorDashboardPage.jsx`, `PreviewPage.jsx` (`/preview` for Member A).
  - Built `App.jsx` with persistent demo warning banner and top navigation.
  - Verified production build (`npm run build` in `frontend` passes with 0 errors).
- Files changed: `frontend/*`.

### Phase 4 — README, review, demo
_(not started)_

## 7. Open questions

- [ ] Which Pinata gateway to show in links: public `gateway.pinata.cloud` or the user's dedicated gateway?
- [ ] Will the demo run local-only, or also on Sepolia?
- [ ] Is the report/PPT required to include gas tables and screenshots (yes/no)?

## 8. Test results snapshot (fill in after Phase 1)

| Section | Cases | Pass |
|---|---|---|
| Creating New User | 4 | 4 / 4 |
| Granting Access | 4 (+1 invalid role) | 5 / 5 |
| Viewing Access List | 4 | 4 / 4 |
| Viewing EHR | 4 | 4 / 4 |
| Creating EHR | 4 | 4 / 4 |
| Extras (revoke, duplicate, edge cases) | ≥3 | 7 / 7 |

| Method | Min gas | Max gas | Avg gas | Paper avg |
|---|---|---|---|---|
| `setUserData` | 250,740 | 250,776 | 250,758 | 206,029 |
| `grantAccess` | 79,387 | 146,850 | 102,631 | 75,142 |
| `createEHR` | 143,750 | 143,930 | 143,894 | 203,904 |
| `revokeAccess` | 39,537 | 60,953 | 47,446 | N/A |

