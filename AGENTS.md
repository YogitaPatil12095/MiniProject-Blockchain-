# AGENTS.md — Instructions for AI Coding Agents

> Read this file first, every session. Then read `MEMORY.md` (current state) and `MILESTONES.md` (what to do next).

## 1. Project in one paragraph

A decentralized Personal Health Record (PHR) dApp based on the IEEE paper *"Decentralize Application for Storing Personal Health Record using Ethereum Blockchain and Interplanetary File System"* (Sentausa & Hareva, ICTIIA 2022). Medical files go to **IPFS** (via Pinata). Only the returned **CID** plus metadata is stored in an **Ethereum smart contract**. Two roles: **patient** and **doctor**. Access is granted by the patient per address as viewer, creator, or master (both).

## 2. Source-of-truth documents

| File | Purpose |
|---|---|
| `PRD.md` | What we are building and why. Scope is defined here. |
| `DESIGN.md` | UI design system and screen specs. |
| `MILESTONES.md` | Ordered phases with acceptance criteria. |
| `MEMORY.md` | Decisions made, current status, known issues. Update it after every phase. |
| `REVIEW.md` | Checklists to run before declaring a phase done. |

If documents conflict, priority is: `PRD.md` > `MILESTONES.md` > `DESIGN.md` > this file. Ask the user before deviating.

## 3. Tech stack (do not substitute)

- **Contracts:** Solidity `0.8.24`, Hardhat `2.x` (JavaScript), `@nomicfoundation/hardhat-toolbox`, `dotenv`. No Hardhat 3, Truffle, or Ganache.
- **Tests:** Hardhat + chai matchers (Waffle-compatible), `loadFixture`, gas reporter enabled.
- **Frontend:** Vite + React + `ethers` v6 + `react-router-dom`, plain CSS (no UI framework unless the user approves).
- **IPFS:** Pinata. **Before writing upload code, read Pinata's current official docs** for the endpoint and auth header. Do not guess from memory; the API has changed over time.
- **Networks:** Hardhat local node (chainId `31337`); optional Sepolia (`11155111`). Rinkeby (used in the paper) is shut down.

## 4. Repository layout

```
phr-dapp/
├── AGENTS.md  PRD.md  MEMORY.md  MILESTONES.md  DESIGN.md  REVIEW.md
├── contracts/PHR.sol
├── test/PHR.test.js
├── scripts/deploy.js            # also writes frontend/src/contract.json
├── hardhat.config.js
├── .env.example  .gitignore  README.md
└── frontend/
    ├── .env.example
    └── src/ (components, pages, lib, contract.json)
```

## 5. Commands

```bash
npm install                                        # root deps
npx hardhat compile
npx hardhat test                                   # must be all green, gas report printed
npx hardhat node                                   # terminal 1: local chain
npx hardhat run scripts/deploy.js --network localhost   # terminal 2
cd frontend && npm install && npm run dev
```

## 6. Working rules

1. **Work phase by phase** as in `MILESTONES.md`. Stop and ask for approval at the end of each phase.
2. **Plan first.** Before coding a phase, state a short plan and the files you will touch.
3. **Small, verifiable steps.** Compile and run tests after each contract change. Run the app after each UI change.
4. **Keep it simple and readable.** This is a student mini-project. Prefer plain code with comments over clever abstractions.
5. **No scope creep.** Do not add features not listed in `PRD.md` (see Out of Scope).
6. **Fix, then report.** If an install or build fails, fix it and tell the user what changed and why.
7. **Update `MEMORY.md`** at the end of every phase: status, decisions, gotchas.
8. **Never fabricate results.** Only claim tests pass if you ran them and saw the output. Paste real output.
9. **Ask when ambiguous** instead of guessing, especially on paper-conformance questions.

## 7. Smart contract conventions

- Function names follow the paper: `setUserData`, `grantAccess`, `viewEHR`, `createEHR`, `getUserData`, `isRegistered`, `isGrantedToView`, `isGrantedToCreate`.
- Role codes for `grantAccess`: `"v"` viewer, `"c"` creator, `"m"` master (both).
- Keep the paper's revert messages exactly (tests depend on them):
  - `"Access Role Not Valid"`, `"User not found"`
  - `"Already Granted As Viewer"`, `"Already Granted As Creator"`, `"Already Granted As Master"`
  - `"Address not registered"`, `"You are not granted as viewer"`, `"You are not granted as a creator"`
- Documented improvements over the paper (allowed): `block.timestamp` for `createdAt`, mapping-based O(1) role checks (arrays kept only for listing), `revokeAccess`, events, register-once protection.
- Add NatSpec comments to every external/public function. Emit events for all state changes.
- Use `custom errors` only if the paper's revert strings are still preserved. Otherwise keep revert strings.

## 8. Frontend conventions

- Connect with `new ethers.BrowserProvider(window.ethereum)`.
- **Contract view functions depend on `msg.sender`.** Always call them through a **signer-connected** contract (`await provider.getSigner()`), never a bare provider.
- ethers v6 returns structs as `Result` objects. Convert to plain objects before rendering.
- Check chain ID on load; prompt to switch networks. Handle `accountsChanged` and `chainChanged`.
- Every write action shows: "requires gas" badge, pending state, success state with tx hash, and a friendly error mapped from the revert reason.
- Always show the banner: *"Demo only: files on IPFS are publicly accessible by CID. Use dummy data, not real medical records."*
- Follow `DESIGN.md` for tokens, layout, and components.

## 9. Security rules

- Never commit secrets: `.env`, private keys, JWTs. Provide `.env.example` only.
- The Pinata JWT in `VITE_PINATA_JWT` is exposed to the browser. Acceptable for a demo only. Note this in the README.
- Use throwaway wallets for Sepolia. Never ask the user for a real wallet key.
- Treat all data on-chain and on public IPFS as world-readable. Say so in the README.

## 10. Out of scope (do not build)

Encryption, ML diagnosis, chatbot, appointments, admin role, Aadhaar/KYC linking, mainnet deployment, mobile app, multi-contract upgrade patterns.

## 11. Definition of done for any phase

- Code compiles with no warnings you can fix.
- Relevant checklist in `REVIEW.md` passes.
- Real command output shown to the user.
- `MEMORY.md` updated.
- Waiting for user approval before the next phase.
