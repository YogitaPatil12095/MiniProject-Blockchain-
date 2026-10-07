# AGENTS.md — Instructions for AI Coding Agents

> Read this file first, every session. Then read `MEMORY.md` (current state) and `MILESTONES.md` (what to do next).

## 1. Project in one paragraph

A secured decentralized Electronic Health Record (EHR) dApp based on the IEEE paper *"Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain"* (Parshionikar, Verulkar, & Katkar, IEEE ICBDS 2024). Medical files, diagnostic reports (X-rays, MRI scans), and clinical prescriptions are encrypted and stored on **IPFS** (via Pinata / FileBase), with tamper-evident **CIDs** and metadata recorded on an **Ethereum smart contract**. The system features three primary user roles (**Admin / Hospital Owner**, **Doctor**, and **Patient**), primary identity verification linked with **Aadhaar Number**, an **Appointment Booking System**, an **Assistive Navigation Chatbot**, and an integrated **Predictive AI/ML Analysis System** for preliminary disease detection (Pneumonia and Brain Tumor).

## 2. Source-of-truth documents

| File | Purpose |
|---|---|
| `PRD.md` | What we are building and why. Full functional scope based on the Intellihealth 2024 paper. |
| `DESIGN.md` | UI design system, color tokens, and screen specifications (Admin, Doctor, Patient, AI/ML, Chatbot). |
| `MILESTONES.md` | Ordered implementation phases with acceptance criteria. |
| `MEMORY.md` | Current status, decisions made, pending items, and phase logs. Update after every phase. |
| `REVIEW.md` | Quality and paper-conformance checklists before declaring a phase complete. |
| `ROLES.md` | Team workspace boundaries and React component props interface. |

If documents conflict, priority is: `PRD.md` > `MILESTONES.md` > `DESIGN.md` > this file.

## 3. Tech stack (do not substitute)

- **Contracts:** Solidity `0.8.24`, Hardhat `2.x` (JavaScript), `@nomicfoundation/hardhat-toolbox`, `dotenv`.
- **Tests:** Hardhat + Chai matchers, `loadFixture`, gas reporter enabled.
- **Frontend:** Vite + React + `ethers` v6 + `react-router-dom`, plain CSS design system.
- **IPFS:** Pinata / FileBase API integration with client-side report encryption (HIPAA/GDPR compliance).
- **AI/ML Service:** Lightweight Python/JS inference API for medical report & image analysis (Pneumonia / Brain Tumor preliminary diagnostic model).
- **Networks:** Hardhat local node (chainId `31337`); optional Sepolia (`11155111`).

## 4. Repository layout

```
phr-dapp/
├── AGENTS.md  PRD.md  MEMORY.md  MILESTONES.md  DESIGN.md  REVIEW.md  ROLES.md
├── contracts/PHR.sol
├── test/PHR.test.js
├── scripts/deploy.js            # also writes frontend/src/contract.json
├── hardhat.config.js
├── .env.example  .gitignore  README.md
└── frontend/
    ├── .env.example
    └── src/ (components, pages, lib, context, hooks, contract.json)
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

1. **Work phase by phase** as specified in `MILESTONES.md`.
2. **Plan first.** State a short plan and files to touch before coding a phase.
3. **Small, verifiable steps.** Compile contracts and run tests after contract changes; test UI after frontend updates.
4. **Keep code clean & readable.** Document functions using NatSpec.
5. **Update `MEMORY.md`** at the end of every phase with status, key decisions, and metrics.
6. **Never fabricate test results.** Run commands and paste exact outputs.

## 7. Smart contract conventions

- Function names follow paper operations: `setUserData`, `registerDoctor`, `registerPatient`, `grantAccess`, `revokeAccess`, `viewEHR`, `createEHR`, `updateEHR`, `deleteEHR`, `bookAppointment`, `updateAppointmentStatus`, `getUserData`, `isRegistered`, `isGrantedToView`, `isGrantedToCreate`.
- Access roles for `grantAccess`: `"v"` (Viewer), `"c"` (Creator), `"m"` (Master - both).
- Primary identification uses wallet address bound to Aadhaar Number.
- Standard revert string checks: `"Access Role Not Valid"`, `"User not found"`, `"Address not registered"`, `"You are not granted as viewer"`, `"You are not granted as a creator"`, `"Admin authorization required"`.

## 8. Frontend conventions

- Connect via `new ethers.BrowserProvider(window.ethereum)`.
- Contract view functions calling `msg.sender` must use a **signer-connected** contract instance (`await provider.getSigner()`).
- Parse ethers v6 `Result` structs into plain JavaScript objects before rendering.
- Render role-specific dashboards: **Admin Portal**, **Doctor Dashboard**, **Patient Portal**, **Appointment Booking Bar**, **Assistive Navigation Chatbot**, and **Predictive AI Diagnostic Panel**.
- Show gas requirement badges, transaction states, and human-readable error handling.

## 9. Security & Compliance rules

- Never commit secrets (`.env`, private keys, JWTs). Provide `.env.example`.
- Sensitive health data (X-rays, MRI scans, prescriptions) must be encrypted prior to IPFS storage for HIPAA & GDPR compliance.
- Treat on-chain data as public metadata pointers; contract access control governs functions.

## 10. In-Scope Implementations (Intellihealth IEEE 2024 Paper Conformance)

- Multi-Role Auth (Admin, Doctor, Patient) & Aadhaar linking.
- Admin management (Add/Remove Doctor & Patient, Monitor Appointments, View Chatbot Logs).
- Doctor features (Manage profiles, View patient history, Add/Update/Delete EHRs, Prescribe medications, Order tests, Set follow-up).
- Patient features (Demographics update, View read-only EHRs, Print records, Grant/Revoke doctor access).
- Appointment Booking Panel (Doctor availability, scheduling, approval status).
- Interactive Assistive Navigation Chatbot.
- Predictive AI/ML Disease Analysis System (Pneumonia & Brain Tumor detection from medical scans).

## 11. Definition of done for any phase

- Code compiles with no warnings.
- Relevant checklist in `REVIEW.md` passes.
- Real command execution outputs verified.
- `MEMORY.md` updated and ready for verification.
