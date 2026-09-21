# MEMORY.md — Project Memory

> Living document. The agent must read this at the start of every session and update it at the end of every phase. Keep entries short and factual.

## 1. Current status

| Field | Value |
|---|---|
| Current phase | Phase 0 — Not started |
| Last completed milestone | — |
| Next action | Produce implementation plan, begin Phase 1 |
| Blockers | None |
| Last updated | (date) |

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
- Deployed contract address: `(fill after Phase 2)`
- Pinata gateway used: `(fill after Phase 3)`

## 5. Known gotchas (pre-loaded)

1. **Restarting `hardhat node`** resets the chain. MetaMask then shows nonce errors. Fix: MetaMask → Settings → Advanced → Clear activity tab data.
2. **View functions use `msg.sender`.** Calling with a bare provider returns `address(0)` as sender and the call reverts. Use a signer-connected contract.
3. **ethers v6 `Result` objects** are read-only tuples. Map to plain objects (`{creator, name, cid, createdAt: Number(...)}`). BigInt must be converted before rendering or JSON.
4. **BigInt in JSON:** `JSON.stringify` fails on BigInt. Convert first.
5. **Pinata API changes.** Verify the current docs before coding the upload.
6. **Vite env vars** must start with `VITE_` and need a dev-server restart after change.
7. **Duplicate registration** reverts. The UI must check `isRegistered` first.

## 6. Phase log

Append one entry per phase using this template.

```
### Phase N — <name> — <date>
- Done:
- Files changed:
- Commands run and result (paste real output summary):
- Decisions or deviations:
- Issues found and how they were fixed:
- Open questions for the user:
```

### Phase 1 — Contract and tests
_(not started)_

### Phase 2 — Deploy script and local network
_(not started)_

### Phase 3 — Frontend
_(not started)_

### Phase 4 — README, review, demo
_(not started)_

## 7. Open questions

- [ ] Which Pinata gateway to show in links: public `gateway.pinata.cloud` or the user's dedicated gateway?
- [ ] Will the demo run local-only, or also on Sepolia?
- [ ] Is the report/PPT required to include gas tables and screenshots (yes/no)?

## 8. Test results snapshot (fill in after Phase 1)

| Section | Cases | Pass |
|---|---|---|
| Creating New User | 4 | — |
| Granting Access | 4 (+1 invalid role) | — |
| Viewing Access List | 4 | — |
| Viewing EHR | 4 | — |
| Creating EHR | 4 | — |
| Extras (revoke, duplicate) | ≥3 | — |

| Method | Min gas | Max gas | Avg gas | Paper avg |
|---|---|---|---|---|
| `setUserData` | — | — | — | 206,029 |
| `grantAccess` | — | — | — | 75,142 |
| `createEHR` | — | — | — | 203,904 |
