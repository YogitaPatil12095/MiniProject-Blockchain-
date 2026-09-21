# Design Directory & Screen Specifications

This directory contains design specifications, screen exports, and design mock documentation created by **Member A (Designer)**.

## Screen Inventory

### S1 — Connect / Login
- Centered login card with shield-heart branding logo.
- Title: *"Your health records, under your control"*.
- Subtitle: *"Decentralized Personal Health Record (PHR) powered by Ethereum & IPFS"*.
- Connect MetaMask action with wallet icon.
- States: Not connected, network mismatch banner ("Switch Network"), connecting spinner, connected & unregistered -> redirect to S2, connected & registered -> redirect to dashboard.

### S2 — First-time Registration
- Card layout for new wallet addresses.
- Form fields: Full Name, Gender (Male/Female/Other), Home Address, Phone Number, Birthday (Date).
- One-time gas badge warning ("⛽ Requires gas").
- Register button triggering contract `setUserData`.

### S3 — Patient Dashboard
- Left sidebar navigation (My Records, Access List, Grant Access).
- **My Records**: Grid of Record Cards with file icons, doctor/creator name, date, truncated IPFS CID, and direct IPFS viewer link. Includes Empty State view.
- **Access List**: Two-column layout for Viewers and Creators. Shows address chips with role badges (Viewer blue, Creator amber, Master purple) and Revoke actions. Patient's own address labeled "You".
- **Grant Access**: Address input field with format validation, role selector (Viewer, Creator, Master), and Grant button with gas badge.

### S4 — Doctor Dashboard
- Left sidebar navigation (View Patient Record, Create Record).
- **View Patient Record**: Patient address lookup, "Load Records" action (free, no gas). Renders Record Cards or blocked alert panel if viewer access is missing.
- **Create Record**: Patient address field, doctor display name, dashed drag-and-drop file picker (10 MB max), 3-step progress Stepper (1 Upload to IPFS -> 2 Confirm in wallet -> 3 Recorded), and Upload & Save button with gas badge.

### S5 — Global States & Micro-interactions
- Top bar with app title, network badge ("Hardhat Local" / "Sepolia"), truncated address chip, and Role Switcher (Patient | Doctor).
- Full-width amber warning banner: *"Demo only: files on IPFS are publicly accessible by CID. Use dummy data, not real medical records."*
- Transaction status toasts (Pending spinner, Success check + tx hash chip, Error panel + expandable raw revert reason).
- Accessible confirmation modal for Revoke actions.
