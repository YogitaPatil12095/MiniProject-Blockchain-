# PRD — Intellihealth: Secured Decentralized EHR System (Ethereum + IPFS + AI/ML)

**Version:** 2.0  
**Type:** Blockchain & AI Electronic Health Record System  
**Base paper:** Parshionikar, Verulkar, & Katkar, *Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain*, 2024 IEEE International Conference on Blockchain and Distributed Systems Security (ICBDS 2024), Pune, India (DOI: [10.1109/ICBDS61829.2024.10837083](https://doi.org/10.1109/ICBDS61829.2024.10837083))

---

## 1. Overview

**Intellihealth** is an online, decentralized Electronic Health Record (EHR) management dApp. Unlike conventional centralized healthcare platforms vulnerable to data breaches and loss of physical medical histories, Intellihealth uses Ethereum smart contracts for immutable access control, encrypted IPFS (via Pinata / FileBase) for distributed storage of high-volume medical scans (X-rays, MRI scans, lab reports), and an integrated **Predictive Machine Learning Analysis System** for preliminary diagnosis of conditions such as Pneumonia and Brain Tumors. The system binds each user's MetaMask Ethereum wallet to their **Aadhaar Number** as the primary identity verification key.

---

## 2. Goals & Key Objectives

1. **Complete Paper Conformance:** Implement all features and workflows defined in the IEEE 2024 Intellihealth paper (3 User Roles, 10 Core System Actions, Admin Workflow, Doctor Workflow, Patient Workflow, Appointment Booking Bar, Navigation Chatbot, and Predictive AI/ML Disease Analysis).
2. **Multi-Role Access Control:** 
   - **System Administrator (Hospital Representative):** Supreme oversight to add/remove registered doctors and patients, monitor booked appointments, manage hospital schedules, and audit chatbot communication logs.
   - **Doctor:** Review personal profiles (specialization, qualifications, photo, phone), view patient medical history, upload/update/delete patient health records and prescriptions (medications, brand names, dosages, frequencies, remarks), order clinical tests, and set follow-up schedules.
   - **Patient:** Read-only access to complete medical history and diagnostic reports, update personal demographics (name, age, phone, address, photo, blood group, height, weight), print records, grant/revoke doctor access permissions (`Viewer`, `Creator`, `Master`), book appointments, interact with the navigation chatbot, and submit medical scans for automated AI disease detection.
3. **Data Privacy & Compliance:** Pre-upload client-side encryption of sensitive medical records stored on IPFS to satisfy HIPAA and GDPR security guidelines.
4. **Reproducible Gas Benchmarks:** Benchmarking smart contract gas usage for deployment and key transaction functions (`setUserData`, `registerDoctor`, `grantAccess`, `createEHR`, `bookAppointment`, `revokeAccess`).

---

## 3. Users, Roles & Authorization Matrix

| Role | Access Level | Description | Key Capabilities |
|---|---|---|---|
| **System Administrator (Admin)** | Level 1 (Supreme) | Hospital representative / System owner | Add/verify doctors & patients, revoke accounts, manage appointments, monitor system logs, view chatbot text history. |
| **Doctor** | Level 2 (Clinical) | Verified medical practitioner | View profile, view patient history (requires Viewer/Master permission), add/update/delete patient EHRs & prescriptions (requires Creator/Master permission), prescribe drugs & lab tests. |
| **Patient** | Level 3 (Patient Owner) | End-user / Record owner | Register with Aadhaar ID, update demographic profile, view own records (read-only), print records, grant/revoke access permissions, book doctor appointments, submit scans to AI detection system. |

---

## 4. Functional Requirements

| ID | Module / Feature | Description | On-Chain Gas? |
|---|---|---|---|
| **FR-1** | **Identity & Account Sign-In** | Connect MetaMask wallet linked with **Aadhaar Number** as primary unique identifier. Checks role registration on load. | Yes (Registration) |
| **FR-2** | **Admin Dashboard & Management** | Administrator dashboard for adding/verifying doctors (Name, DOB, Specialty, Contact, Doctor ID) and patients, revoking accounts, and inspecting all hospital activity. | Yes |
| **FR-3** | **Doctor Profile & Dashboard** | Doctors access personal profile (Name, Specialization, Qualifications, DOB, Contact, Photo) and active appointments list. | Free (Reads) |
| **FR-4** | **Patient Profile & Demographics** | Patients view and update demographic attributes (Name, Address, Age, Contact, Blood Type, Height, Weight, Photo) signed via MetaMask. | Yes (Updates) |
| **FR-5** | **Permission-Based EHR Viewing** | Patient views own history. Doctors with **Viewer (`v`)** or **Master (`m`)** access view full patient consultation history. | Free (Reads) |
| **FR-6** | **Comprehensive EHR & Prescription Creation** | Doctors with **Creator (`c`)** or **Master (`m`)** access upload encrypted medical files to IPFS and anchor diagnosis, prescribed drugs (brand, dosage, frequency, remarks), clinical lab tests, and follow-up notes via smart contract. | Yes |
| **FR-7** | **Record Updating & Deletion** | Doctors can modify existing prescriptions or remove outdated records to prevent clutter while retaining blockchain ledger integrity. | Yes |
| **FR-8** | **Patient Access Control (Grant & Revoke)** | Patient grants or revokes Viewer (`v`), Creator (`c`), or Master (`m`) permissions per doctor address. | Yes |
| **FR-9** | **Appointment Booking System** | Patients view doctor availability by specialty and book time slots. Doctors and Admins view, approve, and manage incoming appointments. | Yes |
| **FR-10** | **Assistive Navigation Chatbot** | Convenient messaging UI allowing patients to navigate portal functions and contact hospital staff. | Free (Client API) |
| **FR-11** | **Predictive AI/ML Disease Detection** | Patients upload medical scans (X-rays, MRI scans) for automated preliminary detection of **Pneumonia** and **Brain Tumors** using integrated machine learning inference models. | Free (Off-chain ML) |
| **FR-12** | **Record Printing & Export** | Patients can generate print-friendly formatted summaries of their health records and prescriptions. | Free (Client) |

---

## 5. Data Model Architecture

```solidity
struct Medication {
    string brandName;
    string dosage;
    string frequency;
    uint256 durationDays;
    string remarks;
}

struct ClinicalTest {
    string testName;
    string testCategory;
    string remarks;
}

struct EHR {
    address creator_address;
    string creator_name;
    string ipfs_location;       // Encrypted IPFS CID
    string diagnosis;
    Medication[] medications;
    ClinicalTest[] tests;
    string followUpNotes;
    uint256 createdAt;
}

struct UserDemographics {
    string aadhaarNumber;
    string fullName;
    string gender;
    string homeAddress;
    string phoneNumber;
    uint256 birthday;
    string bloodType;
    uint256 heightCm;
    uint256 weightKg;
    string photoIpfsCid;
}

struct DoctorProfile {
    string doctorId;
    string fullName;
    string specialty;
    string qualification;
    string phoneNumber;
    string location;
    string photoIpfsCid;
}

struct Appointment {
    uint256 appointmentId;
    address patientAddress;
    address doctorAddress;
    string specialty;
    uint256 dateTimestamp;
    string timeSlot;
    string status;             // "Pending", "Confirmed", "Completed", "Cancelled"
}
```

---

## 6. System Architecture

```
                      +---------------------------------------+
                      |       MetaMask Ethereum Wallet        |
                      |     (Linked with Aadhaar Number)      |
                      +-------------------+-------------------+
                                          |
                                          v
+------------------+     +----------------+-------------------+     +------------------+
| IPFS (Pinata/    | <== |     React Frontend Web Application    | ==> | Predictive AI/ML |
| FileBase Storage)|     | (Admin, Doctor, & Patient Portals) |     | Disease Inference|
+------------------+     +----------------+-------------------+     +------------------+
                                          |
                                          v
                         +----------------+-------------------+
                         |      Ethereum Smart Contract       |
                         |      (Intellihealth / PHR.sol)     |
                         +------------------------------------+
```

---

## 7. Acceptance Criteria & Verification

1. **Contract Execution:** `npx hardhat test` passes all tests covering Admin operations, Doctor EHR management, Patient access controls, Appointment booking, and account revocation.
2. **Gas Optimization:** Gas consumption logged for all state-changing calls (`setUserData`, `registerDoctor`, `grantAccess`, `createEHR`, `bookAppointment`, `revokeAccess`) with comparison to paper benchmarks.
3. **Multi-Portal UI:** React frontend renders distinct dashboards for Admin, Doctor, and Patient with responsive CSS styling.
4. **AI/ML Module Integration:** Functional diagnostic scanner accepting X-ray/MRI image uploads and returning preliminary detection confidence scores (Pneumonia & Brain Tumor).
5. **IPFS & Privacy:** Files uploaded to IPFS are encrypted client-side prior to CID registration.
6. **Documentation & README:** Full setup guide, architecture diagrams, live demo steps, and test execution details published in `README.md`.

---

## 8. Declared Enhancements & Future Work

- **Client-Side Symmetric Key Management:** AES-256-GCM encryption of files with viewer-key sharing via RSA/ECDH.
- **Aadhaar Identity Linkage:** Integration with official identity verification sandboxes.
- **Mainnet Scaling:** Deployment on Ethereum L2 networks (Arbitrum, Polygon) for reduced gas fees.

