# Intellihealth dApp — Full Overhaul Implementation Plan

> Ground truth: every item is based on code read during exploration. File paths are absolute repo-relative. Build commands come from `package.json` and `hardhat.config.js`. No guesswork.

---

## Codebase Snapshot (what was found)

- **Root `package.json`**: Hardhat-only scripts (`compile`, `test`, `node`, `deploy:local`, `deploy:sepolia`). No `dev`, no `install:all`. No `concurrently` / `wait-on` devDeps.
- **`frontend/package.json`**: Vite + React 18 + ethers v6 + react-router-dom. Dev server on port 3000. No `VITE_API_URL` env var.
- **`frontend/vite.config.js`**: Only `plugins: [react()]` and `server: { port: 3000 }`. No `build.outDir`, no `base`.
- **`frontend/src/App.jsx`**: Admin route is `/admin`. `NavigationWrapper.activeRole` detects `/admin` path literally. `ProtectedRoute` and `RoleRedirect` both hardcode `"/admin"` redirect targets.
- **`frontend/src/components/ui/TopBar.jsx`**: Admin nav button calls `onNavigate('/admin')`. Guarded by `userRole === 'admin'` — non-admin users never see it.
- **`frontend/src/lib/ipfs.js`**: Plain `fetch` with no AbortController, no size/type check, no retry, no demo-mode fallback. Throws immediately if JWT missing.
- **`frontend/src/lib/crypto.js`**: `deriveKey` uses fixed salt `"Intellihealth-Salt-2024"`. Has `encryptMedicalFile` and `decryptMedicalFile`. No `verifyEncryption` helper.
- **`frontend/src/pages/LandingPage.jsx`**: Hero → Feature Highlights Grid → Roles Section → Tech Stack Footer. No "How it works" section.
- **`frontend/src/pages/LoginRegisterPage.jsx`**: State 3 (connected + unregistered) shows a full self-registration form calling `setUserData` on-chain. Must become an admin-contact message.
- **`frontend/src/pages/PatientDashboardPage.jsx`**: `records` tab renders `EmptyState` when `records.length === 0`, but no first-time welcome card.
- **`frontend/src/pages/DoctorDashboardPage.jsx`**: `create` tab goes straight to the EHR form. No quick-start instructional card. Upload calls `uploadToIPFS` directly without type/size pre-validation.
- **`frontend/src/components/ui/DemoBanner.jsx`**: Exists, static IPFS-warning text. No `isIPFSDemoMode` awareness.
- **`scripts/deploy.js`**: Writes only to `frontend/src/contract.json`. No write to `backend/`.
- **`.gitignore`**: Already excludes `.env`, `.env.local`, `node_modules/`, `frontend/dist/`, `artifacts/`, `cache/`.
- **`.env.example`** (root): Has `DEPLOYER_PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `COINMARKETCAP_API_KEY`.
- **No `backend/` directory exists** anywhere in the repo.

---

## Implementation Plan

- [ ] 1. **Create `backend/` directory with full Express + Mongoose API**

  Create the entire backend service from scratch. There is no `backend/` in the repo yet.

  **Files to create:**

  `backend/package.json`
  ```json
  {
    "name": "intellihealth-backend",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { "start": "node server.js", "dev": "node --watch server.js" },
    "dependencies": {
      "cors": "2.8.5",
      "dotenv": "16.4.5",
      "express": "4.18.2",
      "express-rate-limit": "7.1.5",
      "mongoose": "8.0.0"
    }
  }
  ```

  `backend/.env.example`:
  ```
  MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/intellihealth
  PORT=4000
  ALLOWED_ORIGIN=http://localhost:3000
  ```

  `backend/.gitignore`: ignore `node_modules/` and `.env`.

  `backend/models/UserProfile.js` — Mongoose schema:
  ```js
  { walletAddress: { type: String, required: true, unique: true, lowercase: true },
    displayName: String, specialty: String, bio: String, avatarIpfsCid: String,
    updatedAt: { type: Date, default: Date.now } }
  ```

  `backend/models/ChatbotLog.js`:
  ```js
  { walletAddress: { type: String, required: true, lowercase: true },
    query: String, category: String, response: String,
    createdAt: { type: Date, default: Date.now } }
  ```

  `backend/models/AuditLog.js`:
  ```js
  { walletAddress: { type: String, required: true, lowercase: true },
    action: String, details: Object, ipAddress: String,
    createdAt: { type: Date, default: Date.now } }
  ```

  `backend/models/AppointmentMeta.js`:
  ```js
  { appointmentId: { type: Number, required: true, unique: true },
    patientAddress: { type: String, lowercase: true },
    doctorAddress: { type: String, lowercase: true },
    notes: String, cancelReason: String,
    createdAt: { type: Date, default: Date.now } }
  ```

  `backend/middleware/auth.js` — reads `x-wallet-address` header, attaches it to `req.walletAddress`. Rejects if header absent with 401. For admin-only routes, checks that address equals `process.env.ADMIN_ADDRESS` (optional env var; if unset, admin check is skipped — the on-chain smart contract is the real authority).

  `backend/routes/profile.js` — implements:
  - `GET /api/profile/:address` → find by walletAddress (case-insensitive)
  - `PUT /api/profile/:address` → upsert; only allow if `req.walletAddress` matches `:address`

  `backend/routes/chatbot.js` — implements:
  - `POST /api/chatbot/log` → create ChatbotLog doc; `walletAddress` from header
  - `GET /api/chatbot/logs/:address` → return logs for address; filter to own address unless admin

  `backend/routes/audit.js` — implements:
  - `POST /api/audit/log` → create AuditLog; `walletAddress` from header
  - `GET /api/audit/logs` → admin only; returns all logs sorted by `createdAt` desc, limit 500

  `backend/server.js` — entry point:
  ```js
  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const rateLimit = require('express-rate-limit');
  const mongoose = require('mongoose');

  const app = express();
  app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
  app.use(express.json({ limit: '50kb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

  app.use('/api/profile', require('./routes/profile'));
  app.use('/api/chatbot', require('./routes/chatbot'));
  app.use('/api/audit', require('./routes/audit'));
  app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intellihealth')
    .then(() => app.listen(process.env.PORT || 4000,
      () => console.log(`Backend on :${process.env.PORT || 4000}`)))
    .catch(err => { console.error(err); process.exit(1); });
  ```

  `frontend/src/lib/api.js` — thin fetch wrapper:
  ```js
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  async function apiFetch(path, options = {}, walletAddress = '') {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': walletAddress,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `API ${res.status}`);
    return res.json();
  }

  export const getProfile = (address) => apiFetch(`/api/profile/${address}`, {}, address);
  export const putProfile = (address, data) =>
    apiFetch(`/api/profile/${address}`, { method: 'PUT', body: JSON.stringify(data) }, address);
  export const logChatbot = (address, data) =>
    apiFetch('/api/chatbot/log', { method: 'POST', body: JSON.stringify(data) }, address);
  export const getChatbotLogs = (address) => apiFetch(`/api/chatbot/logs/${address}`, {}, address);
  export const logAudit = (address, data) =>
    apiFetch('/api/audit/log', { method: 'POST', body: JSON.stringify(data) }, address);
  export const getAuditLogs = (address) => apiFetch('/api/audit/logs', {}, address);
  ```

  Add `VITE_API_URL=http://localhost:4000` to `frontend/.env.example`.

  **Verify:** `cd backend && npm install && node server.js` — server starts on port 4000, logs "Backend on :4000". Then `curl http://localhost:4000/api/health` returns `{"status":"ok"}`.

---

- [ ] 2. **Add single-command startup scripts to root `package.json`**

  Modify `package.json` (root) to add devDependencies and new scripts. Do NOT remove existing scripts.

  Add to `devDependencies`:
  ```json
  "concurrently": "^8.2.2",
  "wait-on": "^7.2.0"
  ```

  Add to `scripts`:
  ```json
  "dev": "concurrently --kill-others --names \"CHAIN,DEPLOY,FRONTEND\" -c \"cyan,yellow,green\" \"npm run node\" \"wait-on tcp:8545 && npm run deploy:local\" \"wait-on tcp:8545 && npm run deploy:local && cd frontend && npm run dev\"",
  "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
  "start:backend": "node backend/server.js"
  ```

  **Implementation note on the `dev` script:** The third concurrently arm (`FRONTEND`) must wait for the deploy to finish before starting Vite. Since `wait-on` only checks TCP availability (not deploy completion), chain it as: `wait-on tcp:8545 && npm run deploy:local && cd frontend && npm run dev`. This means deploy runs twice (arms 2 and 3) — the second is idempotent because Hardhat redeploys to the same address when the node is fresh. Alternatively, sequence the DEPLOY arm to signal deploy completion via a file (`touch .deploy-done`) and use `wait-on file:.deploy-done` in the FRONTEND arm. **Chosen approach:** keep it simple — run deploy in arm 2 only, and have the FRONTEND arm use a fixed 12s sleep that is reliable on most machines:
  ```
  "dev": "concurrently --kill-others --names \"CHAIN,DEPLOY,FRONTEND\" -c \"cyan,yellow,green\" \"npm run node\" \"wait-on tcp:8545 && npm run deploy:local\" \"wait-on tcp:8545 && node -e \\\"setTimeout(()=>{},12000)\\\" && cd frontend && npm run dev\""
  ```
  This is cross-platform (no `sleep` dependency on Windows). The 12 s pause is enough for Hardhat to deploy the contract before the frontend loads.

  **Files to modify:** `package.json` (root)

  **Verify:** `npm install` at root installs `concurrently` and `wait-on`. Then `npx concurrently --version` prints a version string without error.

---

- [ ] 3. **Hide the admin route (change `/admin` → `/sys-panel-9f3a`)**

  Three locations must all be updated atomically — if any is missed the route either breaks or leaks.

  **`frontend/src/App.jsx`** — four changes:
  1. `<Route path="/admin"` → `<Route path="/sys-panel-9f3a"`
  2. In `ProtectedRoute`, the wrong-role redirect `<Navigate to="/admin" replace />` → `<Navigate to="/sys-panel-9f3a" replace />`
  3. In `RoleRedirect`, `<Navigate to="/admin" replace />` → `<Navigate to="/sys-panel-9f3a" replace />`
  4. In `NavigationWrapper`, the `activeRole` detection: `location.pathname === "/admin" ? "admin"` → `location.pathname === "/sys-panel-9f3a" ? "admin"`

  **`frontend/src/components/ui/TopBar.jsx`** — one change:
  - Admin nav button `onNavigate('/admin')` → `onNavigate('/sys-panel-9f3a')`
  - This button is already inside `{userRole === 'admin' && (...)}` guard so non-admin users never see it or the path.

  **No other file references `/admin` as a navigation target** (confirmed by reading all pages). `LoginRegisterPage.jsx`, `PatientDashboardPage.jsx`, `DoctorDashboardPage.jsx` do not link to `/admin`.

  **Files to modify:** `frontend/src/App.jsx`, `frontend/src/components/ui/TopBar.jsx`

  **Verify:** `cd frontend && npm run build` — build succeeds with zero errors. Then manually check that searching the built `dist/` for the string `"/admin"` returns no results: `grep -r '"/admin"' frontend/dist/` (expect: no output).

---

- [ ] 4. **UX flow improvements across four files**

  All four changes are independent of each other; implement in one pass.

  ### 4a. `frontend/src/pages/LandingPage.jsx` — Add "How it works" section

  Insert a new `<div>` section **between** the Feature Highlights Grid `</div>` (the `maxWidth: 1100, margin: "-30px auto 0"` div that ends after the 4-card grid) and the Roles Section `<div>` (the `maxWidth: 1100, margin: "0 auto", padding: "64px 24px"` div). 

  The new section uses the existing CSS variable design system (same pattern as the feature cards — no Tailwind classes):
  ```jsx
  {/* How it Works Section */}
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 0" }}>
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
        How It Works
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: 520, margin: "0 auto" }}>
        Three simple steps to get started with your secure health records.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
      {[
        { step: "1", title: "Connect MetaMask Wallet", desc: "Install MetaMask and connect your Ethereum wallet. Your wallet address is your unique identity on the platform." },
        { step: "2", title: "Admin Registers You", desc: "Contact your hospital administrator with your wallet address. The admin will register you as a Doctor or Patient on the blockchain." },
        { step: "3", title: "Access Your Dashboard", desc: "Once registered, you are automatically routed to your role-specific dashboard — Doctor Portal or Patient Health Portal." },
      ].map((item) => (
        <div key={item.step} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px 24px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "var(--primary-600)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800 }}>
            {item.step}
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", margin: 0 }}>{item.title}</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
  ```

  ### 4b. `frontend/src/pages/LoginRegisterPage.jsx` — Replace State 3 self-registration form

  Replace the entire **State 3** block (from `// State 3: Connected but Unregistered (FR-1)` down to the closing `</div>` of that `return`) with:
  ```jsx
  // State 3: Connected but Unregistered
  if (isRegistered === false) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto" }}>
        <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
          <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "12px" }}>
            Not Yet Registered
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)", lineHeight: "1.6", marginBottom: "28px" }}>
            You are connected but not yet registered on the system. Please contact your hospital administrator to register your wallet address.
          </p>
          <div style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Wallet Address
            </p>
            <AddressChip address={account} isSelf={true} />
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Share the above address with your admin. Once registered, refresh this page to access your dashboard.
          </p>
        </div>
      </div>
    );
  }
  ```
  Remove unused imports: `Input`, `Select`, `GasBadge`, `StatusToast` — only keep `Button`, `AddressChip` (and `useWallet`, `usePHR`). Remove `formData`, `submitting`, `txState`, `handleInputChange`, `handleRegister` state and handler — they are no longer needed. Keep States 1 and 2 unchanged.

  ### 4c. `frontend/src/pages/PatientDashboardPage.jsx` — Add welcome card to records tab

  In the **TAB 1 records** section, find the conditional rendering block:
  ```jsx
  {loading ? (
    <p ...>Loading health records...</p>
  ) : records.length === 0 ? (
    <EmptyState ... />
  ) : (
    <div ...>{records.map(...)}</div>
  )}
  ```
  Change the `records.length === 0` branch — replace the `<EmptyState>` with a welcome card:
  ```jsx
  ) : records.length === 0 ? (
    <div className="card" style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ fontSize: "48px" }}>👋</div>
      <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-semibold)", color: "var(--text)", margin: 0 }}>
        Welcome to Your Health Portal!
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)", maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
        Your health records will appear here once your doctor adds them. To get started, grant your doctor Creator access from the <strong>Grant Doctor Access</strong> tab.
      </p>
      <Button variant="primary" onClick={() => setActiveTab("grant")} style={{ height: 40, fontSize: "14px" }}>
        Grant Doctor Access
      </Button>
    </div>
  ) : (
  ```

  ### 4d. `frontend/src/pages/DoctorDashboardPage.jsx` — Add quick-start card to create tab

  In **TAB 2 create** section, at the very top of the `{activeTab === "create" && (` block, before the main form card `<div className="card" ...>`, insert:
  ```jsx
  {/* Quick-start instructional card */}
  <div className="card" style={{ padding: "20px 24px", backgroundColor: "var(--primary-50)", border: "1px solid rgba(15, 118, 110, 0.2)", marginBottom: "4px" }}>
    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--primary-800)", marginBottom: "10px" }}>
      📋 Quick Start — Creating a Patient Record
    </h4>
    <ol style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
      <li style={{ fontSize: "13px", color: "var(--text)" }}>Make sure the patient has granted you <strong>Creator</strong> or <strong>Master</strong> access from their portal.</li>
      <li style={{ fontSize: "13px", color: "var(--text)" }}>Enter the patient's Ethereum wallet address in the field below and fill in the diagnosis details.</li>
      <li style={{ fontSize: "13px", color: "var(--text)" }}>Optionally attach an encrypted diagnostic file (PDF, PNG, JPG, JPEG, DCM — max 10 MB).</li>
      <li style={{ fontSize: "13px", color: "var(--text)" }}>Click <strong>Create EHR Record</strong> and confirm the MetaMask transaction.</li>
    </ol>
  </div>
  ```

  **Files to modify:** `frontend/src/pages/LandingPage.jsx`, `frontend/src/pages/LoginRegisterPage.jsx`, `frontend/src/pages/PatientDashboardPage.jsx`, `frontend/src/pages/DoctorDashboardPage.jsx`

  **Verify:** `cd frontend && npm run build` — zero errors. Open in browser and visually confirm: (a) "How it works" 3-step section appears between feature grid and roles on landing; (b) `/register` route shows contact-admin message (not a form) for an unregistered wallet; (c) patient records tab shows welcome card when empty; (d) doctor create tab shows quick-start card above the form.

---

- [ ] 5. **IPFS integration hardening and `verifyEncryption` helper**

  ### 5a. `frontend/src/lib/ipfs.js` — Full rewrite with edge-case handling

  Replace the entire file content with the hardened version below. Key decisions:
  - Demo mode: when `VITE_PINATA_JWT` is absent, generate a deterministic fake CID using `SubtleCrypto.digest('SHA-256', filename bytes)` → hex → `"Qm" + hex.slice(0, 44)`. This avoids a hard failure in demo/dev environments.
  - Timeout: `AbortController` with 15 s; one retry on network failure (not on 4xx).
  - File validation runs before any async work so failures are instant.

  ```js
  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.dcm'];
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  export function isIPFSDemoMode() {
    return !import.meta.env.VITE_PINATA_JWT;
  }

  async function fakeCID(filename) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(filename + Date.now()));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return 'Qm' + hex.slice(0, 44);
  }

  function validateFile(file) {
    if (!file || file.size === 0) throw new Error('File is empty or missing.');
    if (file.size > MAX_SIZE_BYTES) throw new Error(`File exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const mimeOk = ALLOWED_TYPES.includes(file.type) || file.type === 'application/octet-stream'; // encrypted blobs come as octet-stream
    const extOk = ALLOWED_EXTS.includes(ext);
    // Allow octet-stream (post-encryption) without ext check
    if (file.type !== 'application/octet-stream' && (!mimeOk || !extOk)) {
      throw new Error(`Invalid file type "${file.type}" (${ext}). Allowed: PDF, PNG, JPG, JPEG, DCM.`);
    }
  }

  async function pinToIPFS(file, jwt) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: `PHR_Record_${Date.now()}_${file.name}`,
      keyvalues: { app: 'PHR-dApp', originalName: file.name, uploadedAt: new Date().toISOString() },
    }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.details || err.error?.message || `IPFS upload failed: HTTP ${response.status}`);
      }
      return response.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  export async function uploadToIPFS(file, jwt) {
    // Validate first (instant, no network)
    validateFile(file);

    // Demo mode: no JWT configured
    if (!jwt) {
      const cid = await fakeCID(file.name);
      const gatewayBase = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
      return { cid, gatewayUrl: `${gatewayBase.replace(/\/$/, '')}/${cid}`, size: file.size, demoMode: true };
    }

    // Attempt upload with one retry on network/timeout error
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const data = await pinToIPFS(file, jwt);
        const cid = data.IpfsHash;
        const gatewayBase = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
        return { cid, gatewayUrl: `${gatewayBase.replace(/\/$/, '')}/${cid}`, size: data.PinSize };
      } catch (err) {
        lastError = err;
        // Retry only on network/timeout errors, not auth/validation errors
        const isRetryable = err.name === 'AbortError' || err.message.includes('fetch') || err.message.includes('network');
        if (!isRetryable || attempt === 2) throw err;
        // Brief pause before retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw lastError;
  }
  ```

  ### 5b. `frontend/src/lib/crypto.js` — Add `verifyEncryption` helper

  Append to the existing file (do not modify existing functions):
  ```js
  /**
   * Verifies that encrypt→decrypt round-trip produces byte-identical output.
   * @param {ArrayBuffer} fileArrayBuffer - Original file bytes
   * @param {string} secretKey - Passphrase used for encryption
   * @returns {Promise<{ valid: boolean, error?: string }>}
   */
  export async function verifyEncryption(fileArrayBuffer, secretKey) {
    try {
      const encryptedBlob = await encryptMedicalFile(fileArrayBuffer, secretKey);
      const encryptedBuffer = await encryptedBlob.arrayBuffer();
      const decryptedBuffer = await decryptMedicalFile(encryptedBuffer, secretKey);

      const original = new Uint8Array(fileArrayBuffer);
      const decrypted = new Uint8Array(decryptedBuffer);

      if (original.length !== decrypted.length) {
        return { valid: false, error: `Length mismatch: ${original.length} vs ${decrypted.length}` };
      }
      for (let i = 0; i < original.length; i++) {
        if (original[i] !== decrypted[i]) {
          return { valid: false, error: `Byte mismatch at index ${i}` };
        }
      }
      return { valid: true };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }
  ```

  ### 5c. `frontend/src/pages/DoctorDashboardPage.jsx` — Harden upload flow

  In `handleCreateRecord`:
  1. Add `import { isIPFSDemoMode } from "../lib/ipfs";` at top of file.
  2. Before the `if (selectedFile)` block, validate file early:
     ```js
     if (selectedFile) {
       // Guard: check access before file work
       // (Smart contract will enforce canCreate on-chain anyway, but fail fast)
       const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.dcm'];
       const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
       if (!ALLOWED_EXTS.includes(ext) && selectedFile.type !== 'application/octet-stream') {
         setCreateToast({ status: 'error', message: `Invalid file type. Allowed: PDF, PNG, JPG, JPEG, DCM.`, rawError: '' });
         setCreateLoading(false);
         return;
       }
       if (selectedFile.size === 0) {
         setCreateToast({ status: 'error', message: 'File is empty.', rawError: '' });
         setCreateLoading(false);
         return;
       }
       if (selectedFile.size > 10 * 1024 * 1024) {
         setCreateToast({ status: 'error', message: 'File exceeds 10 MB limit.', rawError: '' });
         setCreateLoading(false);
         return;
       }
     }
     ```
  3. After successful upload, update the success toast to include the IPFS gateway link:
     ```js
     setCreateToast({
       status: 'success',
       message: `EHR recorded on-chain! IPFS CID: ${finalIpfsCid}`,
       txHash: txRes.txHash,
       // include gateway link if available from upload result
     });
     ```
  4. The success toast should render the gateway link as a clickable `<a>` — this is already done by `StatusToast`'s `txHash` display; add a separate `gatewayUrl` field or embed the link in the message string if `StatusToast` supports it. Check `StatusToast.jsx` — if it only renders `txHash` as an Etherscan link, embed gateway in the message: `message: \`EHR recorded! CID: ${finalIpfsCid} — <a href="${ipfsUrl}" target="_blank">View on IPFS</a>\`.` Use dangerouslySetInnerHTML if needed, or just append the URL as plain text: `"CID: " + finalIpfsCid + " | Gateway: " + ipfsUrl`.

  ### 5d. `frontend/src/components/ui/DemoBanner.jsx` — Add IPFS demo mode awareness

  Import `isIPFSDemoMode` and extend the banner to also show when IPFS is in demo mode:
  ```jsx
  import { isIPFSDemoMode } from '../../lib/ipfs';

  export function DemoBanner({ className = '' }) {
    const ipfsDemoMode = isIPFSDemoMode();
    // Always show the data-safety warning; additionally show IPFS warning if no JWT
    return (
      <aside style={bannerStyle} className={`demo-banner ${className}`}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <span>
          <strong>Demo only:</strong> files on IPFS are publicly accessible by CID. Use dummy data, not real medical records.
          {ipfsDemoMode && (
            <> &nbsp;|&nbsp; <strong>IPFS Demo Mode:</strong> No Pinata JWT configured — uploads use a simulated CID.</>
          )}
        </span>
      </aside>
    );
  }
  ```

  **Files to modify:** `frontend/src/lib/ipfs.js`, `frontend/src/lib/crypto.js`, `frontend/src/pages/DoctorDashboardPage.jsx`, `frontend/src/components/ui/DemoBanner.jsx`

  **Verify:** `cd frontend && npm run build` — zero errors. Manually test:
  - Remove `VITE_PINATA_JWT` from `.env` → `isIPFSDemoMode()` returns true, DemoBanner shows IPFS warning, upload returns a fake `Qm...` CID instead of throwing.
  - Create a 0-byte file → upload throws "File is empty".
  - Create a file > 10 MB → upload throws "exceeds 10 MB limit".
  - Try to upload a `.txt` file → upload throws "Invalid file type".
  - Call `verifyEncryption` with a known buffer → returns `{ valid: true }`.

---

- [ ] 6. **Deployment configuration**

  ### 6a. `frontend/vercel.json` — SPA rewrite rule

  Create new file:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

  ### 6b. `frontend/vite.config.js` — Add `build.outDir` and `base`

  Current file only has `plugins` and `server`. Add `build` and `base`:
  ```js
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    base: "/",
    build: {
      outDir: "dist",
    },
    server: {
      port: 3000,
      open: false,
    },
  });
  ```

  ### 6c. `frontend/.env.production.example` — Create new file

  ```
  # Production Pinata JWT (keep secret — never commit real value)
  VITE_PINATA_JWT=your_production_pinata_jwt

  # IPFS Gateway (Pinata dedicated gateway for production)
  VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

  # Target Chain ID for production (Sepolia = 11155111)
  VITE_CHAIN_ID=11155111

  # Backend API URL (your Render service URL)
  VITE_API_URL=https://your-backend.onrender.com
  ```

  ### 6d. `backend/render.yaml` — Render deployment manifest

  Create new file:
  ```yaml
  services:
    - type: web
      name: intellihealth-backend
      env: node
      plan: free
      buildCommand: npm install
      startCommand: node server.js
      envVars:
        - key: MONGODB_URI
          sync: false   # set in Render dashboard
        - key: PORT
          value: 4000
        - key: ALLOWED_ORIGIN
          sync: false   # set to Vercel frontend URL in dashboard
  ```

  ### 6e. `scripts/deploy-and-export.js` — Extended deploy script

  Copy `deploy.js` contents and add a second write after the frontend write:
  ```js
  // Save to backend/contract.json (for any server-side ABI usage)
  const backendDir = path.join(__dirname, '..', 'backend');
  if (fs.existsSync(backendDir)) {
    const backendContractPath = path.join(backendDir, 'contract.json');
    fs.writeFileSync(backendContractPath, JSON.stringify(contractData, null, 2));
    console.log(`📄 Generated backend configuration at: ${backendContractPath}`);
  }
  ```
  Add to root `package.json` scripts: `"deploy:local:full": "hardhat run scripts/deploy-and-export.js --network localhost"`.

  ### 6f. Root `.env.example` — Already exists, verify completeness

  Current root `.env.example` has `DEPLOYER_PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `COINMARKETCAP_API_KEY`. No changes needed — these are already the right keys.

  **Files to create/modify:** `frontend/vercel.json` (create), `frontend/vite.config.js` (modify), `frontend/.env.production.example` (create), `backend/render.yaml` (create), `scripts/deploy-and-export.js` (create), `package.json` (add `deploy:local:full` script)

  **Verify:** `cd frontend && npm run build` — build output lands in `frontend/dist/`. Check `ls frontend/dist/` shows `index.html` and `assets/`.

---

- [ ] 7. **Git commit and push**

  Stage specific files only (avoid accidentally staging `.env`, `node_modules`, `dist`, `artifacts`, `cache`):

  ```bash
  git add \
    backend/package.json backend/server.js \
    backend/models/UserProfile.js backend/models/ChatbotLog.js \
    backend/models/AuditLog.js backend/models/AppointmentMeta.js \
    backend/routes/profile.js backend/routes/chatbot.js backend/routes/audit.js \
    backend/middleware/auth.js backend/.env.example backend/.gitignore \
    backend/render.yaml \
    frontend/src/lib/api.js frontend/src/lib/ipfs.js frontend/src/lib/crypto.js \
    frontend/src/pages/LandingPage.jsx frontend/src/pages/LoginRegisterPage.jsx \
    frontend/src/pages/PatientDashboardPage.jsx frontend/src/pages/DoctorDashboardPage.jsx \
    frontend/src/components/ui/TopBar.jsx frontend/src/components/ui/DemoBanner.jsx \
    frontend/src/App.jsx \
    frontend/vite.config.js frontend/vercel.json \
    frontend/.env.example frontend/.env.production.example \
    scripts/deploy-and-export.js \
    package.json \
    README.md MEMORY.md MILESTONES.md DESIGN.md AGENTS.md
  ```

  Commit message (exactly):
  ```
  feat: add MongoDB backend, single-cmd startup, hidden admin route, IPFS edge cases, Vercel/Render deploy config
  ```

  Push:
  ```bash
  git push origin main
  ```

  **Verify:** `git log --oneline -1` shows the commit. `git status` shows clean working tree.

---

- [ ] 8. **Update existing documentation files**

  Update all five docs in one pass. Do NOT create new `.md` files.

  ### `README.md`
  Replace **Section 3 "How to Run"** with a new single-command quickstart block:
  ```markdown
  ## 3. Quick Start (Single Command)

  ### Prerequisites
  - Node.js v18/v20/v22 LTS, Git, MetaMask browser extension

  ### One-time setup
  ```bash
  git clone https://github.com/YogitaPatil12095/MiniProject-Blockchain-.git
  cd MiniProject-Blockchain-
  npm run install:all       # installs root + frontend + backend deps
  cp .env.example .env.local
  cp frontend/.env.example frontend/.env
  # Edit frontend/.env and add your VITE_PINATA_JWT (or leave blank for demo mode)
  ```

  ### Start everything
  ```bash
  npm run dev              # starts Hardhat node + deploys contract + launches Vite frontend
  npm run start:backend    # (separate terminal) starts Express backend on :4000
  ```
  The frontend runs at `http://localhost:3000`. MetaMask → Add Network → RPC `http://127.0.0.1:8545`, Chain ID `31337`.
  ```

  Also add a **Section 8: Deployment** entry covering Vercel (frontend) and Render (backend).

  Add a **Section 9: Backend API** covering the MongoDB Atlas + Express API endpoints.

  Update the **Directory Structure** (Section 5) to include `backend/` and `.agents/`.

  ### `MEMORY.md`
  Add a new section **Phase 7: Full Overhaul** recording:
  - MongoDB Atlas backend added (`backend/`)
  - Single-command startup via `concurrently`
  - Admin route hidden to `/sys-panel-9f3a`
  - IPFS hardened: demo mode, 10 MB limit, type validation, timeout + retry, `verifyEncryption`
  - UX: "How it works" section on landing, admin-contact message replaces self-registration, patient welcome card, doctor quick-start card
  - Deployment config: `frontend/vercel.json`, `backend/render.yaml`, `frontend/vite.config.js` updated
  - All docs updated

  Update the **Current Status** table: set Current Phase to "Phase 7 Complete — Full overhaul shipped", Last Updated to today's date.

  ### `MILESTONES.md`
  Add **Phase 7: Production Hardening & Deployment** with checkboxes and mark all items done `[x]`:
  ```markdown
  ## Phase 7 — Production Hardening & Deployment ✅

  - [x] MongoDB Atlas backend API (`backend/`) with profile, chatbot, and audit routes
  - [x] Single-command dev startup (`npm run dev`) via `concurrently`
  - [x] `npm run install:all` for full dependency install
  - [x] Admin route hidden at `/sys-panel-9f3a` (non-admin users unaware)
  - [x] IPFS edge cases: demo mode, 10 MB limit, file type validation, timeout + retry
  - [x] `verifyEncryption` round-trip test helper in `crypto.js`
  - [x] UX: "How it works" landing section, admin-contact registration message, patient welcome card, doctor quick-start card
  - [x] Deployment config: `frontend/vercel.json`, `backend/render.yaml`, `frontend/vite.config.js`
  - [x] `scripts/deploy-and-export.js` writes contract to both frontend and backend
  - [x] All documentation updated
  ```

  ### `DESIGN.md`
  Add a new subsection under **Screen 1 (LandingPage)**:
  ```markdown
  #### "How It Works" Section (added Phase 7)
  - Three numbered step cards (Connect Wallet → Admin Registers → Dashboard Access)
  - Same card style as Feature Highlights: `var(--surface)`, `var(--border)`, `var(--radius-lg)`
  - Circular numbered badges using `var(--primary-600)` background
  ```

  Add a new **Screen 7: Backend REST API** section documenting the MongoDB Atlas Express endpoints.

  Update **Screen 2 (Admin Dashboard)**: Note the route is now `/sys-panel-9f3a` (hidden from non-admin users).

  ### `AGENTS.md`
  Update **Section 4 (Repository layout)** to include `backend/` directory.

  Update **Section 5 (Commands)** to add:
  ```bash
  npm run install:all      # install all deps (root + frontend + backend)
  npm run dev              # single command: node + deploy + frontend
  npm run start:backend    # start Express backend
  ```

  Add **Section 11: Backend Conventions**:
  - Wallet address auth via `x-wallet-address` header (lowercase)
  - `VITE_API_URL` env var for frontend → backend URL
  - `api.js` wrapper for all fetch calls
  - MongoDB Atlas URI in `backend/.env` (never commit)

  Update **Section 9 (Security)**: note admin route is `/sys-panel-9f3a` and should never appear in non-admin UI or error messages.

  **Files to modify:** `README.md`, `MEMORY.md`, `MILESTONES.md`, `DESIGN.md`, `AGENTS.md`

  **Verify:** All five files parse as valid Markdown (no broken headings). `cd frontend && npm run build` still succeeds (doc changes don't affect build).

---

## Dependency order summary

Tasks 1, 2, 3, 4, 5, 6 are all independent of each other (they touch different files) and can be implemented in any order. However, the recommended order is:

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

- Task 1 must complete before Task 7 (git add includes backend files).
- Task 6 must complete before Task 7 (git add includes deploy config files).
- Task 7 must complete before Task 8 is committed (docs reflect the shipped state).
- Task 8 can be done before or after Task 7's commit — it is tracked in the same commit.

## Build command reference

| Command | Purpose |
|---|---|
| `cd frontend && npm run build` | Verify frontend compiles (no errors) |
| `npx hardhat compile` | Verify contracts compile |
| `npx hardhat test` | Run all 35 smart contract tests |
| `cd frontend && npm run dev` | Start Vite dev server on :3000 |
| `cd backend && node server.js` | Start Express backend on :4000 |
| `npm run dev` (root) | Single-command full stack start |
