# DESIGN.md — UI Design System and Screen Specs

> Used two ways: (1) paste the **Stitch prompts** in section 9 into Google Stitch to generate screens; (2) the coding agent implements the UI in React using the tokens and rules here.
> The exported Stitch design is a reference. If it conflicts with this file on tokens, this file wins.

## 1. Design principles

1. **Trustworthy and calm.** Healthcare feel: clean, spacious, low-noise.
2. **Blockchain is visible but not scary.** Always show which actions cost gas and what state a transaction is in.
3. **One primary action per screen.**
4. **Errors are human.** Map contract reverts to plain language.
5. **Honest about privacy.** A demo-only banner is always visible.

## 2. Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--primary-600` | `#0F766E` | Primary buttons, active nav, links |
| `--primary-700` | `#115E59` | Button hover |
| `--primary-50` | `#F0FDFA` | Selected rows, soft backgrounds |
| `--accent-500` | `#6366F1` | Blockchain/wallet elements (address chips, tx hash) |
| `--bg` | `#F8FAFC` | Page background |
| `--surface` | `#FFFFFF` | Cards, modals |
| `--border` | `#E2E8F0` | Dividers, input borders |
| `--text` | `#0F172A` | Primary text |
| `--text-muted` | `#64748B` | Secondary text |
| `--success` | `#16A34A` | Success states |
| `--warning-bg` / `--warning-text` | `#FEF3C7` / `#92400E` | Demo banner, gas badge |
| `--danger` | `#DC2626` | Errors, revoke |

Role badge colors: Viewer `#0EA5E9`, Creator `#F59E0B`, Master `#8B5CF6`.

### Typography
- Font: **Inter**, fallback `system-ui, sans-serif`. Mono for addresses and hashes: `JetBrains Mono, ui-monospace`.
- Scale: H1 28/36 semibold · H2 22/30 semibold · H3 18/26 medium · Body 15/24 · Small 13/20 · Mono 13/20.

### Spacing, radius, elevation
- 4 px base grid: 4, 8, 12, 16, 24, 32, 48.
- Radius: inputs/buttons 8 px, cards 12 px, chips 999 px.
- Elevation: cards `0 1px 2px rgba(15,23,42,.06)`; modals `0 10px 30px rgba(15,23,42,.15)`.

## 3. Layout

- Max content width 1040 px, centered. Left sidebar (220 px) on ≥ 900 px; collapses to a top bar with a menu on mobile.
- **Top bar:** app name "PHR Chain", network chip (e.g. "Hardhat Local" / "Sepolia"), truncated wallet address chip (`0x12…ab34`), and role switch (Patient | Doctor).
- **Demo banner** (full width, under the top bar, warning colors, non-dismissible): *"Demo only: files on IPFS are publicly accessible by CID. Use dummy data, not real medical records."*
- Cards stack in one column on mobile; two columns on desktop where noted.

## 4. Components

| Component | Spec |
|---|---|
| **Button** | Primary (teal fill), Secondary (outline), Danger (red outline). Disabled 50% opacity. Loading shows a spinner and the label "Waiting for wallet…" or "Confirming…". |
| **Gas badge** | Small pill, warning colors, ⛽ icon, text "Requires gas". Placed beside every write button. |
| **Address chip** | Mono text, indigo tint, truncated, copy-on-click, full address on hover. |
| **Role badge** | Pill using the role colors above: Viewer / Creator / Master. |
| **Input** | 40 px height, 1 px border, focus ring teal 2 px, helper and error text below. Address inputs validate `0x` + 40 hex chars. |
| **Select** | Same as input; used for the access role (Viewer, Creator, Master). |
| **File picker** | Dashed drop zone, shows file name and size, 10 MB max. |
| **Record card** | Left: file icon. Middle: creator name, date, CID (mono, truncated). Right: "Open on IPFS ↗" link. |
| **Empty state** | Muted icon, one sentence, optional action. |
| **Toast / Status panel** | Pending (spinner), Success (green, tx hash chip), Error (red, friendly message + "details" expander with the raw revert reason). |
| **Modal** | Used for confirmations such as revoke. Title, body, Cancel and Confirm. |
| **Stepper** | For record creation: 1 Upload to IPFS → 2 Confirm in wallet → 3 Recorded. |

## 5. Screens

### S1 — Connect / Login (UC-1)
- Centered card: logo, title "Your health records, under your control", short subtitle, **Connect MetaMask** button.
- States: no MetaMask (link to install), wrong network (Switch network button), connecting, connected-and-unregistered (goes to S2), connected-and-registered (goes to dashboard).

### S2 — Register (first-time login)
- Form: Full name, Gender (Male/Female select), Home address, Phone number, Birthday (date picker).
- Primary **Register** + gas badge. Note: "Registration is a one-time blockchain transaction."
- On success, show a toast and go to the dashboard.

### S3 — Patient Dashboard (UC-2, UC-3, UC-4, revoke)
- Sidebar: My Records · Access List · Grant Access.
- **My Records:** list of Record cards, newest first. Empty state: "No records yet. Ask your doctor to add one."
- **Access List:** two columns, Viewers and Creators. Each row: address chip and a **Revoke** action (danger, opens a confirm modal). The patient's own address is shown as "You" with no revoke.
- **Grant Access:** address input, role select, **Grant** button + gas badge. Inline errors: "Address is not registered," "Already granted as viewer."

### S4 — Doctor Dashboard (UC-5, UC-6)
- Sidebar: View Patient Record · Create Record.
- **View Patient Record:** patient address input → **Load records** (free, no gas). Results as Record cards. Blocked state: red panel "You have not been granted viewer access by this patient."
- **Create Record:** patient address, doctor display name, file picker, **Upload and Save** + gas badge. Stepper shows progress. On success show the CID and tx hash.
- If the doctor lacks creator access, show a red panel before the upload starts.

### S5 — Global states
Wrong network banner, wallet locked, account changed toast ("Switched to 0x…"), transaction rejected in MetaMask ("You cancelled the transaction").

## 6. Error message map

| Contract revert | Friendly message |
|---|---|
| `Already registered` | You are already registered. |
| `Access Role Not Valid` | Choose Viewer, Creator, or Master. |
| `User not found` | That address has not registered yet. |
| `Already Granted As Viewer/Creator/Master` | This address already has that access. |
| `Address not registered` | The patient address is not registered. |
| `You are not granted as viewer` | The patient has not given you permission to view their records. |
| `You are not granted as a creator` | The patient has not given you permission to add records. |
| `Not granted` | Nothing to revoke for this address. |
| User rejected (code 4001 / `ACTION_REJECTED`) | You cancelled the transaction in MetaMask. |
| Insufficient funds | Not enough ETH for gas. |

## 7. Accessibility and responsiveness

- Contrast ≥ 4.5:1 for text. Never use color alone to signal state (icons and text too).
- All controls keyboard reachable; visible focus ring; buttons ≥ 40 px tall.
- Labels tied to inputs; errors announced with `aria-live="polite"`.
- Breakpoints: 360 (mobile), 768 (tablet), 1024 (desktop).

## 8. Iconography and tone

- Icon set: Lucide (outline, 1.5 px). Icons: `wallet`, `file-text`, `shield-check`, `user-plus`, `user-minus`, `upload`, `external-link`, `fuel`.
- Tone: plain, reassuring, short sentences. Avoid jargon; when unavoidable, explain in a tooltip (e.g., "CID: a fingerprint of your file on IPFS").

## 9. Google Stitch prompts

Use one prompt per screen, in order. First paste the **Global prompt**, then the screen prompts. Ask Stitch to reuse the same style for all screens.

### Global prompt
```
Design a responsive web app called "PHR Chain", a decentralized personal health record dApp. Style: clean, calm healthcare UI. Primary color teal #0F766E, accent indigo #6366F1 for blockchain elements, page background #F8FAFC, white cards with 12px radius and subtle shadow, Inter font, monospace for wallet addresses and hashes. Layout: top bar with app name, a network chip, a truncated wallet address chip, and a Patient/Doctor role switch. Under the top bar, a full-width amber banner: "Demo only: files on IPFS are publicly accessible by CID. Use dummy data, not real medical records." Left sidebar navigation on desktop. Every action that costs gas shows a small amber pill "⛽ Requires gas" next to its button. Use rounded 8px inputs and outline icons.
```

### S1 Connect
```
Login screen: centered card with a shield-heart logo, headline "Your health records, under your control", one-line subtitle about IPFS and Ethereum, and a large teal button "Connect MetaMask" with a fox/wallet icon. Below, small text "Need MetaMask? Install the extension". Show a secondary state variant with an amber "Wrong network, Switch network" alert.
```

### S2 Register
```
Registration screen for a first-time wallet. Card with a form: Full name, Gender (select Male/Female), Home address, Phone number, Birthday (date). A teal "Register" button with the amber "Requires gas" pill. Helper text: "Registration is a one-time blockchain transaction." Show the connected address chip at the top of the card.
```

### S3 Patient dashboard
```
Patient dashboard with left sidebar (My Records, Access List, Grant Access). Main area shows "My Records": a list of record cards, each with a file icon, creator name ("Dr. David"), date, a truncated monospace IPFS CID, and an "Open on IPFS" link. Include an empty state variant. Also design the Access List view with two columns "Viewers" and "Creators", each row an address chip with a role badge (Viewer blue, Creator amber, Master purple) and a red outline "Revoke" button, and the Grant Access view with an address input, a role select (Viewer, Creator, Master), and a teal "Grant" button with the gas pill.
```

### S4 Doctor dashboard
```
Doctor dashboard with sidebar (View Patient Record, Create Record). View Patient Record: patient address input and a "Load records" button (no gas), results as record cards, plus a red blocked-state panel "You have not been granted viewer access by this patient." Create Record: patient address, doctor name, dashed file drop zone, a 3-step progress indicator (Upload to IPFS, Confirm in wallet, Recorded), and a teal "Upload and Save" button with the gas pill. Success state shows the CID and transaction hash as copyable chips.
```

### S5 States
```
Design shared UI states: a pending transaction toast with spinner "Waiting for wallet confirmation", a success toast with a green check and transaction hash chip, an error toast "You cancelled the transaction in MetaMask", and a confirmation modal "Revoke access from 0x12…ab34?" with Cancel and a red Confirm button.
```

### Stitch → code workflow
1. Generate screens S1–S5 and check them against the tokens above.
2. Export or copy the design/HTML for reference and place it in `/design/` in the repo.
3. Tell the coding agent: "Implement the React UI following `DESIGN.md`. Use `/design/` only as a visual reference."
