const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PHR Smart Contract - Sentausa & Hareva (ICTIIA 2022) Test Suite", function () {
  /**
   * Fixture setting up the deployed PHR contract and standard 4 test signers
   */
  async function deployPHRFixture() {
    const [patient, doctor, user1, user2, unregistered] = await ethers.getSigners();

    const PHRFactory = await ethers.getContractFactory("PHR");
    const phr = await PHRFactory.deploy();
    await phr.waitForDeployment();

    return { phr, patient, doctor, user1, user2, unregistered };
  }

  /**
   * Fixture with 4 registered users (Patient, Doctor, User1, User2)
   */
  async function registeredUsersFixture() {
    const fixture = await deployPHRFixture();
    const { phr, patient, doctor, user1, user2 } = fixture;

    // Register Patient
    await phr.connect(patient).setUserData(
      "Alice Patient",
      "Female",
      "123 Maple Street",
      "+1234567890",
      Math.floor(new Date("1990-01-01").getTime() / 1000)
    );

    // Register Doctor
    await phr.connect(doctor).setUserData(
      "Dr. Bob Smith",
      "Male",
      "456 Hospital Blvd",
      "+1987654321",
      Math.floor(new Date("1980-05-15").getTime() / 1000)
    );

    // Register User1 (Creator)
    await phr.connect(user1).setUserData(
      "Charlie Creator",
      "Male",
      "789 Clinic Lane",
      "+1122334455",
      Math.floor(new Date("1985-08-20").getTime() / 1000)
    );

    // Register User2 (Viewer)
    await phr.connect(user2).setUserData(
      "Diana Viewer",
      "Female",
      "321 Health Road",
      "+1554433221",
      Math.floor(new Date("1995-12-10").getTime() / 1000)
    );

    return fixture;
  }

  /**
   * Fixture with 4 users registered and access granted by Patient:
   * - Doctor: Master ("m")
   * - User1: Creator ("c")
   * - User2: Viewer ("v")
   */
  async function fullAccessSetupFixture() {
    const fixture = await registeredUsersFixture();
    const { phr, patient, doctor, user1, user2 } = fixture;

    await phr.connect(patient).grantAccess(doctor.address, "m");
    await phr.connect(patient).grantAccess(user1.address, "c");
    await phr.connect(patient).grantAccess(user2.address, "v");

    return fixture;
  }

  // ==========================================
  // Section 1: Creating New User (4 tests)
  // ==========================================
  describe("1. Creating New User", function () {
    it("Should allow Patient to register with valid user data", async function () {
      const { phr, patient } = await loadFixture(deployPHRFixture);
      const bday = Math.floor(new Date("1990-01-01").getTime() / 1000);

      await expect(
        phr.connect(patient).setUserData(
          "Alice Patient",
          "Female",
          "123 Maple Street",
          "+1234567890",
          bday
        )
      )
        .to.emit(phr, "UserRegistered")
        .withArgs(patient.address, "Alice Patient");

      expect(await phr.isUserRegistered(patient.address)).to.be.true;
      const data = await phr.getUserData(patient.address);
      expect(data.user_address).to.equal(patient.address);
      expect(data.full_name).to.equal("Alice Patient");
      expect(data.gender).to.equal("Female");
      expect(data.home_address).to.equal("123 Maple Street");
      expect(data.phone_number).to.equal("+1234567890");
      expect(data.birthday).to.equal(bday);
    });

    it("Should allow Doctor to register with valid user data", async function () {
      const { phr, doctor } = await loadFixture(deployPHRFixture);
      const bday = Math.floor(new Date("1980-05-15").getTime() / 1000);

      await expect(
        phr.connect(doctor).setUserData(
          "Dr. Bob Smith",
          "Male",
          "456 Hospital Blvd",
          "+1987654321",
          bday
        )
      )
        .to.emit(phr, "UserRegistered")
        .withArgs(doctor.address, "Dr. Bob Smith");

      expect(await phr.isUserRegistered(doctor.address)).to.be.true;
    });

    it("Should allow User1 to register with valid user data", async function () {
      const { phr, user1 } = await loadFixture(deployPHRFixture);
      const bday = Math.floor(new Date("1985-08-20").getTime() / 1000);

      await expect(
        phr.connect(user1).setUserData(
          "Charlie Creator",
          "Male",
          "789 Clinic Lane",
          "+1122334455",
          bday
        )
      )
        .to.emit(phr, "UserRegistered")
        .withArgs(user1.address, "Charlie Creator");

      expect(await phr.isUserRegistered(user1.address)).to.be.true;
    });

    it("Should allow User2 to register with valid user data", async function () {
      const { phr, user2 } = await loadFixture(deployPHRFixture);
      const bday = Math.floor(new Date("1995-12-10").getTime() / 1000);

      await expect(
        phr.connect(user2).setUserData(
          "Diana Viewer",
          "Female",
          "321 Health Road",
          "+1554433221",
          bday
        )
      )
        .to.emit(phr, "UserRegistered")
        .withArgs(user2.address, "Diana Viewer");

      expect(await phr.isUserRegistered(user2.address)).to.be.true;
    });
  });

  // ==========================================
  // Section 2: Granting Access (4 + 1 tests)
  // ==========================================
  describe("2. Granting Access", function () {
    it("Should allow Patient to grant Doctor Master ('m') access", async function () {
      const { phr, patient, doctor } = await loadFixture(registeredUsersFixture);

      await expect(phr.connect(patient).grantAccess(doctor.address, "m"))
        .to.emit(phr, "AccessGranted")
        .withArgs(patient.address, doctor.address, "m");

      expect(await phr.isGrantedToView(patient.address, doctor.address)).to.be.true;
      expect(await phr.isGrantedToCreate(patient.address, doctor.address)).to.be.true;
    });

    it("Should allow Patient to grant User1 Creator ('c') access", async function () {
      const { phr, patient, user1 } = await loadFixture(registeredUsersFixture);

      await expect(phr.connect(patient).grantAccess(user1.address, "c"))
        .to.emit(phr, "AccessGranted")
        .withArgs(patient.address, user1.address, "c");

      expect(await phr.isGrantedToView(patient.address, user1.address)).to.be.false;
      expect(await phr.isGrantedToCreate(patient.address, user1.address)).to.be.true;
    });

    it("Should allow Patient to grant User2 Viewer ('v') access", async function () {
      const { phr, patient, user2 } = await loadFixture(registeredUsersFixture);

      await expect(phr.connect(patient).grantAccess(user2.address, "v"))
        .to.emit(phr, "AccessGranted")
        .withArgs(patient.address, user2.address, "v");

      expect(await phr.isGrantedToView(patient.address, user2.address)).to.be.true;
      expect(await phr.isGrantedToCreate(patient.address, user2.address)).to.be.false;
    });

    it("Should revert if Patient tries to grant Viewer access to an already granted viewer", async function () {
      const { phr, patient, user2 } = await loadFixture(registeredUsersFixture);

      await phr.connect(patient).grantAccess(user2.address, "v");

      await expect(
        phr.connect(patient).grantAccess(user2.address, "v")
      ).to.be.revertedWith("Already Granted As Viewer");
    });

    it("Should revert with 'Access Role Not Valid' if invalid role code is passed", async function () {
      const { phr, patient, doctor } = await loadFixture(registeredUsersFixture);

      await expect(
        phr.connect(patient).grantAccess(doctor.address, "invalid_role")
      ).to.be.revertedWith("Access Role Not Valid");
    });
  });

  // ==========================================
  // Section 3: Viewing Access List (4 tests)
  // ==========================================
  describe("3. Viewing Access List", function () {
    it("Patient can view their own access list containing granted viewers and creators", async function () {
      const { phr, patient, doctor, user1, user2 } = await loadFixture(fullAccessSetupFixture);

      const [viewers, creators] = await phr.connect(patient).getMyAccessList();

      expect(viewers).to.include(patient.address);
      expect(viewers).to.include(doctor.address);
      expect(viewers).to.include(user2.address);
      expect(viewers).to.not.include(user1.address);

      expect(creators).to.include(doctor.address);
      expect(creators).to.include(user1.address);
      expect(creators).to.not.include(user2.address);
      expect(creators).to.not.include(patient.address);
    });

    it("Doctor can view their own access list", async function () {
      const { phr, doctor } = await loadFixture(fullAccessSetupFixture);

      const [viewers, creators] = await phr.connect(doctor).getMyAccessList();
      expect(viewers).to.deep.equal([doctor.address]);
      expect(creators).to.deep.equal([]);
    });

    it("User1 can view their own access list", async function () {
      const { phr, user1 } = await loadFixture(fullAccessSetupFixture);

      const [viewers, creators] = await phr.connect(user1).getMyAccessList();
      expect(viewers).to.deep.equal([user1.address]);
      expect(creators).to.deep.equal([]);
    });

    it("User2 can view their own access list", async function () {
      const { phr, user2 } = await loadFixture(fullAccessSetupFixture);

      const [viewers, creators] = await phr.connect(user2).getMyAccessList();
      expect(viewers).to.deep.equal([user2.address]);
      expect(creators).to.deep.equal([]);
    });
  });

  // ==========================================
  // Section 4: Viewing EHR (4 tests)
  // ==========================================
  describe("4. Viewing EHR", function () {
    beforeEach(async function () {
      // Set up an EHR record created by Doctor
    });

    it("Case 1: Patient can view their own EHR data", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createEHR(patient.address, "Dr. Bob Smith", "QmSampleCID12345");

      const records = await phr.connect(patient).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].creator_address).to.equal(doctor.address);
      expect(records[0].creator_name).to.equal("Dr. Bob Smith");
      expect(records[0].ipfs_location).to.equal("QmSampleCID12345");
      expect(records[0].createdAt).to.be.gt(0);
    });

    it("Case 2: Doctor (Master access) can view Patient's EHR data", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createEHR(patient.address, "Dr. Bob Smith", "QmSampleCID12345");

      const records = await phr.connect(doctor).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].ipfs_location).to.equal("QmSampleCID12345");
    });

    it("Case 3: User1 (Creator only) is rejected when trying to view Patient's EHR data", async function () {
      const { phr, patient, user1, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createEHR(patient.address, "Dr. Bob Smith", "QmSampleCID12345");

      await expect(
        phr.connect(user1).viewEHR(patient.address)
      ).to.be.revertedWith("You are not granted as viewer");
    });

    it("Case 4: User2 (Viewer access) can view Patient's EHR data", async function () {
      const { phr, patient, user2, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createEHR(patient.address, "Dr. Bob Smith", "QmSampleCID12345");

      const records = await phr.connect(user2).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].ipfs_location).to.equal("QmSampleCID12345");
    });
  });

  // ==========================================
  // Section 5: Creating EHR (4 tests)
  // ==========================================
  describe("5. Creating EHR", function () {
    it("Case 1: Patient is rejected when trying to create EHR for themselves (not a creator)", async function () {
      const { phr, patient } = await loadFixture(fullAccessSetupFixture);

      await expect(
        phr.connect(patient).createEHR(patient.address, "Alice Patient", "QmPatientSelfCID")
      ).to.be.revertedWith("You are not granted as a creator");
    });

    it("Case 2: Doctor (Master access) can create EHR for Patient", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      await expect(
        phr.connect(doctor).createEHR(patient.address, "Dr. Bob Smith", "QmDocCID54321")
      )
        .to.emit(phr, "EHRCreated");

      const records = await phr.connect(patient).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].ipfs_location).to.equal("QmDocCID54321");
    });

    it("Case 3: User1 (Creator access) can create EHR for Patient", async function () {
      const { phr, patient, user1 } = await loadFixture(fullAccessSetupFixture);

      await expect(
        phr.connect(user1).createEHR(patient.address, "Charlie Creator", "QmUser1CID67890")
      )
        .to.emit(phr, "EHRCreated");

      const records = await phr.connect(patient).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].ipfs_location).to.equal("QmUser1CID67890");
    });

    it("Case 4: User2 (Viewer only) is rejected when trying to create EHR for Patient", async function () {
      const { phr, patient, user2 } = await loadFixture(fullAccessSetupFixture);

      await expect(
        phr.connect(user2).createEHR(patient.address, "Diana Viewer", "QmUser2CIDFail")
      ).to.be.revertedWith("You are not granted as a creator");
    });
  });

  // ==========================================
  // Section 6: Extra Tests (Revoke, Duplicate, Edge cases)
  // ==========================================
  describe("6. Extra Tests (Revoke, Duplicate, Edge cases)", function () {
    it("Extra 1: Patient can revoke Viewer access and former viewer is blocked from viewing", async function () {
      const { phr, patient, user2, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createEHR(patient.address, "Dr. Bob", "QmDocCID");

      // Verify User2 can view before revoke
      expect((await phr.connect(user2).viewEHR(patient.address)).length).to.equal(1);

      // Revoke viewer
      await expect(phr.connect(patient).revokeAccess(user2.address, "v"))
        .to.emit(phr, "AccessRevoked")
        .withArgs(patient.address, user2.address, "v");

      expect(await phr.isGrantedToView(patient.address, user2.address)).to.be.false;

      // User2 is now blocked
      await expect(
        phr.connect(user2).viewEHR(patient.address)
      ).to.be.revertedWith("You are not granted as viewer");
    });

    it("Extra 2: Patient can revoke Creator access and former creator is blocked from creating", async function () {
      const { phr, patient, user1 } = await loadFixture(fullAccessSetupFixture);

      // Revoke creator
      await expect(phr.connect(patient).revokeAccess(user1.address, "c"))
        .to.emit(phr, "AccessRevoked")
        .withArgs(patient.address, user1.address, "c");

      expect(await phr.isGrantedToCreate(patient.address, user1.address)).to.be.false;

      // User1 is now blocked
      await expect(
        phr.connect(user1).createEHR(patient.address, "Charlie", "QmCIDFail")
      ).to.be.revertedWith("You are not granted as a creator");
    });

    it("Extra 3: Duplicate user registration reverts with 'Already registered'", async function () {
      const { phr, patient } = await loadFixture(registeredUsersFixture);

      await expect(
        phr.connect(patient).setUserData(
          "Alice Dup",
          "Female",
          "123 Dup St",
          "+1111",
          123456
        )
      ).to.be.revertedWith("Already registered");
    });

    it("Extra 4: Granting access to an unregistered address reverts with 'User not found'", async function () {
      const { phr, patient, unregistered } = await loadFixture(registeredUsersFixture);

      await expect(
        phr.connect(patient).grantAccess(unregistered.address, "v")
      ).to.be.revertedWith("User not found");
    });

    it("Extra 5: Revoking Master access removes both view and create capabilities", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      await expect(phr.connect(patient).revokeAccess(doctor.address, "m"))
        .to.emit(phr, "AccessRevoked")
        .withArgs(patient.address, doctor.address, "m");

      expect(await phr.isGrantedToView(patient.address, doctor.address)).to.be.false;
      expect(await phr.isGrantedToCreate(patient.address, doctor.address)).to.be.false;

      await expect(
        phr.connect(doctor).viewEHR(patient.address)
      ).to.be.revertedWith("You are not granted as viewer");

      await expect(
        phr.connect(doctor).createEHR(patient.address, "Dr. Bob", "QmFail")
      ).to.be.revertedWith("You are not granted as a creator");
    });

    it("Extra 6: Patient cannot revoke own viewer access", async function () {
      const { phr, patient } = await loadFixture(registeredUsersFixture);

      await expect(
        phr.connect(patient).revokeAccess(patient.address, "v")
      ).to.be.revertedWith("Cannot revoke own access");
    });

    it("Extra 7: Reverts when attempting to grant already granted Creator or Master", async function () {
      const { phr, patient, user1, doctor } = await loadFixture(fullAccessSetupFixture);

      await expect(
        phr.connect(patient).grantAccess(user1.address, "c")
      ).to.be.revertedWith("Already Granted As Creator");

      await expect(
        phr.connect(patient).grantAccess(doctor.address, "m")
      ).to.be.revertedWith("Already Granted As Master");
    });
  });

  // ==========================================
  // Section 7: Intellihealth (IEEE ICBDS 2024) Extensions
  // ==========================================
  describe("7. Intellihealth (IEEE 2024) Feature Suite", function () {
    it("Admin can register a verified Doctor with specialty and qualifications", async function () {
      const { phr, patient: admin, doctor } = await loadFixture(deployPHRFixture);

      await expect(
        phr.connect(admin).registerDoctor(
          doctor.address,
          "DOC-GANACHE-001",
          "Dr. Priya Sharma",
          "Pulmonology & Radiology",
          "MBBS, MD",
          "+91-9876543210",
          "Mumbai, Maharashtra",
          "QmDoctorPhotoCid"
        )
      )
        .to.emit(phr, "DoctorRegistered")
        .withArgs(doctor.address, "DOC-GANACHE-001", "Dr. Priya Sharma", "Pulmonology & Radiology");

      expect(await phr.isUserRegistered(doctor.address)).to.be.true;
      const profile = await phr.doctorProfiles(doctor.address);
      expect(profile.doctorId).to.equal("DOC-GANACHE-001");
      expect(profile.fullName).to.equal("Dr. Priya Sharma");
      expect(profile.specialty).to.equal("Pulmonology & Radiology");

      const doctorsList = await phr.getRegisteredDoctors();
      expect(doctorsList).to.include(doctor.address);
    });

    it("Admin can register a Patient with linked Aadhaar Number and demographics", async function () {
      const { phr, patient: admin, user1: patientUser } = await loadFixture(deployPHRFixture);

      const bday = Math.floor(new Date("1998-04-12").getTime() / 1000);
      await expect(
        phr.connect(admin).registerPatient(
          patientUser.address,
          "5432-8765-1234",
          "Rahul Verma",
          "Male",
          "Bandra West, Mumbai",
          "+91-9123456780",
          bday,
          "B+",
          175,
          70,
          "QmPatientPhotoCid"
        )
      )
        .to.emit(phr, "PatientRegistered")
        .withArgs(patientUser.address, "5432-8765-1234", "Rahul Verma");

      expect(await phr.isUserRegistered(patientUser.address)).to.be.true;
      const demo = await phr.patientDemographics(patientUser.address);
      expect(demo.aadhaarNumber).to.equal("5432-8765-1234");
      expect(demo.bloodType).to.equal("B+");
      expect(demo.heightCm).to.equal(175n);
      expect(demo.weightKg).to.equal(70n);

      expect(await phr.aadhaarToAddress("5432-8765-1234")).to.equal(patientUser.address);
    });

    it("Non-admin is rejected when attempting admin functions", async function () {
      const { phr, doctor } = await loadFixture(deployPHRFixture);

      await expect(
        phr.connect(doctor).registerDoctor(
          doctor.address,
          "DOC-002",
          "Fake Doctor",
          "General",
          "MBBS",
          "123",
          "Delhi",
          ""
        )
      ).to.be.revertedWith("Admin authorization required");
    });

    it("Doctor can create detailed EHR with prescriptions, lab tests, and follow-up", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      const medications = JSON.stringify([
        { brandName: "Amoxicillin", dosage: "500mg", frequency: "TID", durationDays: 7, remarks: "After meals" }
      ]);
      const tests = JSON.stringify([
        { testName: "Chest X-Ray", testCategory: "Radiology", remarks: "Check lower lobe" }
      ]);

      await expect(
        phr.connect(doctor).createDetailedEHR(
          patient.address,
          "Dr. Bob Smith",
          "QmEncryptedCID999",
          "Bacterial Pneumonia (Preliminary)",
          medications,
          tests,
          "Follow up after 1 week with repeat X-Ray"
        )
      )
        .to.emit(phr, "EHRCreated");

      const records = await phr.connect(patient).viewEHR(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].diagnosis).to.equal("Bacterial Pneumonia (Preliminary)");
      expect(records[0].medicationsJson).to.equal(medications);
      expect(records[0].testsJson).to.equal(tests);
      expect(records[0].followUpNotes).to.equal("Follow up after 1 week with repeat X-Ray");
    });

    it("Doctor can update and delete an existing EHR prescription record", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      await phr.connect(doctor).createDetailedEHR(
        patient.address,
        "Dr. Bob Smith",
        "QmCID1",
        "Fever",
        "[]",
        "[]",
        "Rest"
      );

      // Update record
      await expect(
        phr.connect(doctor).updateEHR(
          patient.address,
          0,
          "Viral Fever (Resolved)",
          "[]",
          "[]",
          "Complete course"
        )
      ).to.emit(phr, "EHRUpdated").withArgs(patient.address, 0, doctor.address);

      let records = await phr.connect(patient).viewEHR(patient.address);
      expect(records[0].diagnosis).to.equal("Viral Fever (Resolved)");

      // Delete record
      await expect(
        phr.connect(doctor).deleteEHR(patient.address, 0)
      ).to.emit(phr, "EHRDeleted").withArgs(patient.address, 0, doctor.address);

      records = await phr.connect(patient).viewEHR(patient.address);
      expect(records.length).to.equal(0);
    });

    it("Patient can book appointment with Doctor and Doctor can approve it", async function () {
      const { phr, patient, doctor } = await loadFixture(fullAccessSetupFixture);

      const apptTimestamp = Math.floor(Date.now() / 1000) + 86400; // tomorrow
      await expect(
        phr.connect(patient).bookAppointment(
          doctor.address,
          "Neurology & MRI Consultation",
          apptTimestamp,
          "10:00 AM - 10:30 AM"
        )
      )
        .to.emit(phr, "AppointmentBooked")
        .withArgs(1, patient.address, doctor.address, "Neurology & MRI Consultation", "10:00 AM - 10:30 AM");

      const patientAppts = await phr.connect(patient).getPatientAppointments(patient.address);
      expect(patientAppts.length).to.equal(1);
      expect(patientAppts[0].status).to.equal("Pending");

      // Doctor confirms appointment
      await expect(
        phr.connect(doctor).updateAppointmentStatus(1, "Confirmed")
      )
        .to.emit(phr, "AppointmentStatusUpdated")
        .withArgs(1, "Confirmed");

      const doctorAppts = await phr.connect(doctor).getDoctorAppointments(doctor.address);
      expect(doctorAppts[0].status).to.equal("Confirmed");
    });

    it("Chatbot interactions can be logged and viewed by Admin", async function () {
      const { phr, patient: admin, user1: patientUser } = await loadFixture(registeredUsersFixture);

      await expect(
        phr.connect(patientUser).logChatbotInteraction(
          "How do I upload my MRI scan for brain tumor analysis?",
          "Navigation & AI Diagnosis"
        )
      )
        .to.emit(phr, "ChatbotInteractionLogged")
        .withArgs(
          patientUser.address,
          "How do I upload my MRI scan for brain tumor analysis?",
          "Navigation & AI Diagnosis",
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const logs = await phr.connect(admin).getChatbotLogs();
      expect(logs.length).to.equal(1);
      expect(logs[0].query).to.equal("How do I upload my MRI scan for brain tumor analysis?");
      expect(logs[0].userAddress).to.equal(patientUser.address);
    });
  });
});
