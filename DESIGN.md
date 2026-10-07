# DESIGN.md — UI/UX Design System & Screen Specifications

> Design specifications for the Intellihealth EHR dApp (IEEE ICBDS 2024 paper).

---

## 1. Aesthetic Vision & Design System Tokens

Intellihealth features a modern, clean, clinical dark-mode aesthetic with vibrant teal, indigo, and emerald accents. It communicates trust, security, and high technology.

### Color Tokens

```css
:root {
  /* Brand Core */
  --bg-primary: #0b0f19;
  --bg-secondary: #111827;
  --bg-card: #1f293d;
  --bg-card-hover: #28354d;
  
  /* Text & Content */
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  
  /* Accent Colors */
  --accent-cyan: #06b6d4;
  --accent-teal: #14b8a6;
  --accent-indigo: #6366f1;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  
  /* Status Colors */
  --status-pending: #f59e0b;
  --status-success: #10b981;
  --status-error: #ef4444;
  
  /* UI Borders & Glassmorphism */
  --border-color: rgba(255, 255, 255, 0.1);
  --glass-bg: rgba(17, 24, 39, 0.75);
  --glass-border: rgba(255, 255, 255, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-glow: 0 0 25px rgba(6, 182, 212, 0.15);
}
```

---

## 2. Screen Specifications & Layouts

### Screen 1: Homepage & Identity Authentication (`/`)
- **Header:** Logo, Network indicator badge, MetaMask Connect Wallet button.
- **Hero Banner:** "Intellihealth — Secured Decentralized EHR System".
- **Portal Selection Cards:**
  1. **System Administrator Portal**
  2. **Doctor Portal**
  3. **Patient Portal**
- **Authentication Modal:** Connect wallet -> Prompt Aadhaar Number linking & unique user verification.

---

### Screen 2: System Administrator Dashboard (`/admin`)
- **Header Metrics:** Total Registered Doctors, Total Patients, Total Booked Appointments, System Audit Status.
- **Admin Tabs:**
  - **Register Doctor:** Input Name, DOB, Contact, Unique Doctor ID (Ganache/Eth), Location, Specialty.
  - **Register Patient:** Input Name, Aadhaar Number, Contact, City, State.
  - **Account Management:** Table of active users with "Revoke Account" action.
  - **Appointment Monitor:** Real-time log of booked appointments across all doctors.
  - **Chatbot Activity Audit:** Review patient navigation messages and hospital staff requests.

---

### Screen 3: Doctor Dashboard (`/doctor`)
- **Doctor Profile Header:** Photo, Doctor ID, Full Name, Specialization, Qualifications, Contact Details.
- **Action Tabs:**
  - **My Appointments:** Incoming patient appointment requests with "Approve" / "Reschedule" controls.
  - **Patient Health Record Lookup:** Search patient address or Aadhaar ID -> Verify Viewer/Master permission status.
  - **Add Patient Record & Prescription:** 
    - Diagnostic condition (e.g. Heart Disease, Migraine, Fever).
    - Prescribed medications table (Brand name, Dosage, Frequency, Duration, Remarks).
    - Recommended clinical tests (Lab scans, X-rays, Blood tests).
    - Follow-up instructions (e.g. "Revisit in 2 weeks").
    - Drag-and-drop file upload -> Encrypted IPFS upload -> MetaMask contract confirmation.
  - **Manage / Update Patient Records:** Edit prescriptions or delete outdated records.

---

### Screen 4: Patient Dashboard (`/patient`)
- **Patient Profile Card:** Photo, Aadhaar ID, Name, Address, Age, Blood Type, Height, Weight, Phone. "Edit Profile" button to update demographics via smart contract.
- **Navigation Tabs:**
  - **My Health Records:** Read-only timeline of medical consultations, creator doctor details, timestamp, diagnosis, prescribed drugs, clinical tests, follow-up notes, and "Open Encrypted File on IPFS" link. "Print Records" button.
  - **Access Control Manager:** View active Viewers and Creators list. Grant new access (`Viewer`, `Creator`, `Master`) or Revoke existing permissions.
  - **Book Appointment Bar:** Select specialty, doctor, date, and open time slot.
  - **Predictive AI Diagnostic Scanner:** Upload chest X-rays or MRI scans for preliminary ML disease detection (Pneumonia & Brain Tumor).

---

### Screen 5: Assistive Navigation Chatbot Component (Global Floating Widget)
- **Floating Launcher:** Circular message icon at bottom-right corner.
- **Chat Interface:** Quick navigation buttons ("How to book appointment", "View my records", "Contact doctor"), automated help text, and messaging interface to send notes to hospital staff.

---

### Screen 6: Predictive AI/ML Disease Analysis Scanner (`/ai-diagnosis`)
- **Scan Upload Card:** Supports DICOM / PNG / JPEG X-rays and MRI scans.
- **Model Selection Toggle:** 
  - *Chest X-Ray Scanner* (Pneumonia Detection)
  - *Brain MRI Scanner* (Tumor Detection)
- **Diagnostic Result Card:** Visual heatmap / highlight, detection result ("Normal" vs "Detected"), and confidence score percentage with disclaimer: *"Preliminary AI analysis only. Consult a registered physician for official diagnosis."*
