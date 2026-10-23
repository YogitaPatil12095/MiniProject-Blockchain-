# Intellihealth EHR dApp Overhaul

This change adds a MongoDB Atlas backend API, hardens the IPFS upload path, improves UX across all four major pages, secures the admin portal route, adds single-command startup, and wires up Vercel and Render deployment configs. The approach is additive — MongoDB is a supplementary layer and the smart contract remains authoritative for all medical records and RBAC. Documentation was updated across all five existing markdown files.

**Watch for:**
- Auth middleware accepts wallet address purely from a self-asserted HTTP header — any caller who knows (or enumerates on-chain) a wallet address can impersonate that user on every backend endpoint, including the admin audit-log read. **Confirmed.**
- The static encryption passphrase `"Intellihealth-HIPAA-Key"` is hardcoded as the default in both `crypto.js` and `DoctorDashboardPage.jsx`. Any file encrypted with the default is decryptable by anyone who reads the source. **Confirmed.**
- `AppointmentMeta` model exists but no `/api/appointment` route is mounted in `server.js` — the model is unreachable from the frontend. **Confirmed.**
- The `dev` script's third process uses `wait-on file:frontend/src/contract.json`, which on Windows resolves to the literal path and will block indefinitely if the deploy step writes to a different relative path. **Likely.**

**Verdict**: NEEDS_CHANGES

---

## High-level view

The IPFS upload path is the most hardened part of this change. Empty-file, size-over-10MB, invalid-extension, timeout-with-retry, and JWT-missing cases all have explicit branches. The 401 path from Pinata is caught separately inside `pinToIPFS`, so it is never silently swallowed by the retry loop.

The admin route `/sys-panel-9f3a` does not appear in any JSX rendered for non-admin roles. The TopBar emits the nav button only under `{userRole === 'admin'}`, and `App.jsx`'s wrong-role redirect to `/sys-panel-9f3a` only fires when `effectiveRole === "admin"`. The `ProtectedRoute` wrapper enforces RBAC on the route itself as a second layer.

The auth middleware trades real security for demo convenience in a way that deserves explicit attention before any public deployment. The header-only scheme means every authenticated endpoint — including the admin-gated audit-log read — is bypassable by header forgery. The middleware's own comment documents this, but the risk is not just theoretical: wallet addresses are publicly enumerable on-chain, so impersonation requires no privileged information.

The static AES encryption key is a direct consequence of the same demo-vs-production trade-off. Files encrypted with the default `"Intellihealth-HIPAA-Key"` are as protected as a file with its password in a comment. The `DoctorDashboardPage.jsx` passphrase field is pre-filled with that same value.

Backend API completeness has a gap: `AppointmentMeta` has a Mongoose model and schema but no route file, and `server.js` mounts only three routes — `/api/profile`, `/api/chatbot`, `/api/audit`. Any frontend call that would write appointment notes to MongoDB silently hits nothing.

The `dev` script chains four processes with `concurrently` and uses `wait-on file:frontend/src/contract.json` to hold the frontend until the deploy finishes. This works on Unix but `wait-on`'s `file:` protocol resolves relative paths from the working directory at invocation time, which on Windows with PowerShell may not match where `deploy.js` writes the file. If the path doesn't resolve, the frontend process blocks indefinitely with no error output to guide the developer.

All five UX criteria are satisfied: "How It Works" 3-step section on LandingPage, State 3 on LoginRegisterPage shows only the admin-contact card with the wallet address and no registration form, PatientDashboard shows the welcome card on empty records tab, and DoctorDashboard has a quick-start instructional card on the create tab.

---

<details>
<summary>Issues (4)</summary>

1. **Header-only auth — impersonation of any wallet** — The `x-wallet-address` header is trusted without cryptographic verification. Any HTTP client can forge any wallet address and write to profile, chatbot logs, audit logs, or read admin audit logs. Before public deployment, replace with a nonce-sign-verify scheme using `ethers.verifyMessage()` on the server.

2. **Hardcoded AES passphrase** — `"Intellihealth-HIPAA-Key"` is the default in `crypto.js` and pre-filled in `DoctorDashboardPage.jsx`. Any record encrypted with the default is decryptable by anyone reading the source. Derive a per-user key from MetaMask `personal_sign` output, or at minimum require doctors to supply a passphrase explicitly with no default.

3. **AppointmentMeta model has no route** — `backend/models/AppointmentMeta.js` exists and is well-formed, but `server.js` mounts only `/api/profile`, `/api/chatbot`, and `/api/audit`. There is no `/api/appointment` route file. Any frontend feature that stores appointment notes in MongoDB will silently get a 404. Either add the route or remove the model to avoid confusion.

4. **`wait-on file:` path in dev script may block on Windows** — The root `package.json` `dev` script uses `wait-on file:frontend/src/contract.json`. On Windows, `wait-on`'s `file:` protocol resolves relative paths from the CWD at the time `concurrently` spawns the process. If CWD differs from the repo root (e.g., running from a VS Code terminal that opened in a subdirectory), the watch never resolves and the frontend process hangs silently. Change the argument to an absolute path using `__dirname` or switch to a `tcp:` check against a port the deploy script signals.

</details>

<details>
<summary>Details</summary>

### Header-only auth and the admin audit-log bypass

The `authMiddleware` in `backend/middleware/auth.js` reads `req.headers['x-wallet-address']` and sets `req.walletAddress` without any signature verification. The audit route's admin check compares `req.walletAddress` to `process.env.ADMIN_ADDRESS` — so anyone who knows (or looks up on-chain) the admin's wallet address can set that header and read the full audit log dump. The `api.js` client sends the header value directly from whatever address is passed in; there is no client-side signing step. The middleware file contains an explicit warning comment identifying this gap, which is good documentation hygiene, but the code path is live. The fix is a challenge-response: server issues a nonce, client signs with MetaMask (`personal_sign`), server calls `ethers.verifyMessage(nonce, signature)` and checks the recovered address.

### Static encryption passphrase

`crypto.js` exports `encryptMedicalFile(data, secretKey = "Intellihealth-HIPAA-Key")` and `decryptMedicalFile(encryptedBuffer, secretKey = "Intellihealth-HIPAA-Key")`. In `DoctorDashboardPage.jsx`, `encryptionPassphrase` is initialized to `"Intellihealth-HIPAA-Key"` and passed to `encryptMedicalFile`. Both files carry the warning comment — but a demo file uploaded with this default is AES-encrypted with a publicly known key and is therefore practically plaintext to anyone who has the IPFS CID. The PBKDF2 derivation (100,000 iterations, SHA-256) is sound; the weakness is exclusively the static passphrase. Per-user key derivation via `window.ethereum.request({ method: 'personal_sign', params: [nonce, account] })` is the standard pattern in this architecture.

### AppointmentMeta model without a backing route

`backend/models/AppointmentMeta.js` defines a schema with `appointmentId`, `patientAddress`, `doctorAddress`, and a `notes` field, but no route file exists under `backend/routes/`. `server.js` mounts three routes and the model is never required anywhere else in the backend. The `api.js` client has no appointment-related functions either. The on-chain `AppointmentPage` and appointment tabs in both dashboards read and write directly to the smart contract, so this is likely an incomplete stub rather than a functional regression — but it leaves a dead model in the codebase and may confuse the next developer who expects it to work.

### `dev` script wait-on path reliability

```json
"dev": "concurrently ... \"wait-on tcp:8545 && wait-on file:frontend/src/contract.json && cd frontend && npm run dev\""
```

`wait-on` resolves `file:` paths relative to the process working directory, which is the directory where `concurrently` was launched. On Linux/Mac this is reliably the repo root. On Windows, VS Code integrated terminals and some CI runners can set CWD differently. The `deploy.js` script writes `frontend/src/contract.json` relative to the Hardhat project root — if `wait-on` is watching a different resolution of that path, it either watches the wrong inode or polls a path that never exists. A `tcp:3000` reverse check after the frontend starts, or using `node -e "process.chdir(__dirname)"` at the head of the script, would make this cross-platform reliable.


</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `backend/server.js` | New Express entry point — CORS, rate limiting, 3 route mounts, MongoDB graceful connect |
| `backend/routes/profile.js` | GET + PUT /api/profile with field allowlist and wallet-address ownership check |
| `backend/routes/chatbot.js` | POST /api/chatbot/log upsert and GET /api/chatbot/logs/:address |
| `backend/routes/audit.js` | POST /api/audit/log and GET /api/audit/logs with ADMIN_ADDRESS env check |
| `backend/middleware/auth.js` | Wallet-address header extraction; no cryptographic verification (demo) |
| `backend/models/UserProfile.js` | Mongoose schema for display name, photo CID, preferences |
| `backend/models/ChatbotLog.js` | Mongoose schema for chatbot session + messages array |
| `backend/models/AuditLog.js` | Mongoose schema for audit events with role and details |
| `backend/models/AppointmentMeta.js` | Mongoose schema stub — no backing route |
| `backend/render.yaml` | Render.com web service manifest with env var placeholders |
| `frontend/src/lib/ipfs.js` | Hardened upload: demo mode, file validation, AbortController timeout, retry |
| `frontend/src/lib/crypto.js` | AES-GCM 256-bit encrypt/decrypt helpers + round-trip verifier |
| `frontend/src/lib/api.js` | Thin fetch wrapper with 6 exported functions for all 3 backend resource types |
| `frontend/src/App.jsx` | Admin route renamed to `/sys-panel-9f3a`, RBAC redirects and activeRole detection updated |
| `frontend/src/components/ui/TopBar.jsx` | Admin nav button gated behind `userRole === 'admin'`; navigates to `/sys-panel-9f3a` |
| `frontend/src/pages/LandingPage.jsx` | Added "How It Works" 3-step section and role capability cards |
| `frontend/src/pages/LoginRegisterPage.jsx` | State 3 (unregistered) shows admin-contact card with wallet address display; no self-registration form |
| `frontend/src/pages/PatientDashboardPage.jsx` | Empty records tab shows welcome card with Grant Doctor Access CTA |
| `frontend/src/pages/DoctorDashboardPage.jsx` | Create tab has quick-start instructional card; IPFS demo mode notice injected |
| `frontend/vercel.json` | SPA catch-all rewrite to `index.html` |
| `frontend/vite.config.js` | Added `base: '/'` and `build.outDir: 'dist'` |
| `package.json` | Added `dev`, `install:all`, `start:backend` scripts; added `concurrently` and `wait-on` deps |
| `README.md` | Architecture diagram, setup instructions, deployment steps, RBAC workflow updated |
| `MEMORY.md` | Decisions D9/D10 added; phase 5/6/8 logs updated |
| `MILESTONES.md` | Phases 7, 8, 9 marked complete |
| `DESIGN.md` | Screen 7 (Backend REST API) added; Screen 2 admin route note updated |
| `AGENTS.md` | Section 9 security note updated with `/sys-panel-9f3a` |

Full diff: `git diff main` from repo root.

</details>
