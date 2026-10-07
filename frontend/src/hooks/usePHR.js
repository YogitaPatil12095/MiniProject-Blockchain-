import { useState, useCallback, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { mapContractError } from "../lib/constants";
import {
  formatEHRList,
  formatUserData,
  formatDemographics,
  formatDoctorProfile,
  formatAppointmentList,
  formatChatbotLog,
} from "../lib/contract";

export function usePHR() {
  const { contract, account } = useWallet();

  const [isRegistered, setIsRegistered] = useState(null);
  const [userRole, setUserRole] = useState("patient"); // "admin" | "doctor" | "patient"
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [patientDemographicsData, setPatientDemographicsData] = useState(null);
  const [doctorProfileData, setDoctorProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch caller's registration status & profile data
  const checkRegistration = useCallback(async () => {
    if (!contract || !account) {
      setIsRegistered(null);
      setUserProfile(null);
      setUserRole("patient");
      setIsAdmin(false);
      return;
    }

    try {
      setLoading(true);
      const registered = await contract.isUserRegistered(account);
      setIsRegistered(registered);

      // Check admin
      const adminAddr = await contract.admin();
      const userIsAdmin = adminAddr.toLowerCase() === account.toLowerCase();
      setIsAdmin(userIsAdmin);

      // Check role tag
      const role = await contract.userRoles(account);
      setUserRole(userIsAdmin ? "admin" : (role || "patient"));

      if (registered) {
        const rawProfile = await contract.getUserData(account);
        setUserProfile(formatUserData(rawProfile));

        // Fetch patient demographics
        try {
          const rawDemo = await contract.patientDemographics(account);
          setPatientDemographicsData(formatDemographics(rawDemo));
        } catch (e) {
          setPatientDemographicsData(null);
        }

        // Fetch doctor profile if applicable
        try {
          const rawDoc = await contract.doctorProfiles(account);
          setDoctorProfileData(formatDoctorProfile(rawDoc));
        } catch (e) {
          setDoctorProfileData(null);
        }
      } else {
        setUserProfile(null);
        setPatientDemographicsData(null);
        setDoctorProfileData(null);
      }
    } catch (err) {
      console.error("Error checking registration status:", err);
      setIsRegistered(false);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    checkRegistration();
  }, [checkRegistration]);

  /**
   * Base self-registration
   */
  const registerUser = async (formData) => {
    if (!contract) throw new Error("Contract not ready or wallet not connected.");
    setError(null);
    try {
      const birthdayTimestamp = Math.floor(new Date(formData.birthday).getTime() / 1000);
      const tx = await contract.setUserData(
        formData.fullName,
        formData.gender,
        formData.homeAddress,
        formData.phone,
        birthdayTimestamp
      );
      const receipt = await tx.wait();
      await checkRegistration();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Admin: Register Doctor (FR-2)
   */
  const adminRegisterDoctor = async (docData) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.registerDoctor(
        docData.doctorAddress,
        docData.doctorId,
        docData.fullName,
        docData.specialty,
        docData.qualification,
        docData.phoneNumber,
        docData.location,
        docData.photoIpfsCid || ""
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Admin: Register Patient with Aadhaar (FR-2)
   */
  const adminRegisterPatient = async (patientData) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const bday = Math.floor(new Date(patientData.birthday).getTime() / 1000);
      const tx = await contract.registerPatient(
        patientData.patientAddress,
        patientData.aadhaarNumber,
        patientData.fullName,
        patientData.gender,
        patientData.homeAddress,
        patientData.phoneNumber,
        bday,
        patientData.bloodType || "O+",
        Number(patientData.heightCm || 170),
        Number(patientData.weightKg || 65),
        patientData.photoIpfsCid || ""
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Admin: Revoke User Account (FR-2)
   */
  const adminRevokeUser = async (userAddress) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.revokeUserAccount(userAddress);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Admin: Fetch registered doctors and patients lists
   */
  const fetchRegisteredDoctors = async () => {
    if (!contract) return [];
    try {
      return await contract.getRegisteredDoctors();
    } catch (e) {
      return [];
    }
  };

  const fetchRegisteredPatients = async () => {
    if (!contract) return [];
    try {
      return await contract.getRegisteredPatients();
    } catch (e) {
      return [];
    }
  };

  /**
   * Update Patient Demographics (FR-4)
   */
  const updatePatientDemographics = async (data) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.updatePatientDemographics(
        data.homeAddress,
        data.phoneNumber,
        data.bloodType,
        Number(data.heightCm),
        Number(data.weightKg),
        data.photoIpfsCid || ""
      );
      const receipt = await tx.wait();
      await checkRegistration();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Update Doctor Profile (FR-3)
   */
  const updateDoctorProfile = async (data) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.updateDoctorProfile(
        data.phoneNumber,
        data.location,
        data.photoIpfsCid || ""
      );
      const receipt = await tx.wait();
      await checkRegistration();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * View patient's EHR records (FR-5)
   */
  const fetchEHRRecords = async (patientAddress) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const rawRecords = await contract.viewEHR(patientAddress);
      return formatEHRList(rawRecords);
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Create detailed EHR record with prescriptions & tests (FR-6)
   */
  const createDetailedEHRRecord = async (
    patientAddress,
    creatorName,
    ipfsCID,
    diagnosis,
    medications,
    tests,
    followUpNotes
  ) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const medsJson = JSON.stringify(medications || []);
      const testsJson = JSON.stringify(tests || []);
      const tx = await contract.createDetailedEHR(
        patientAddress,
        creatorName,
        ipfsCID,
        diagnosis || "Clinical Consultation",
        medsJson,
        testsJson,
        followUpNotes || ""
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Update existing EHR record (FR-7)
   */
  const updateEHRRecord = async (patientAddress, index, diagnosis, medications, tests, followUpNotes) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.updateEHR(
        patientAddress,
        index,
        diagnosis,
        JSON.stringify(medications || []),
        JSON.stringify(tests || []),
        followUpNotes || ""
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Delete outdated EHR record (FR-7)
   */
  const deleteEHRRecord = async (patientAddress, index) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.deleteEHR(patientAddress, index);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Access Control: fetch access list (FR-8)
   */
  const fetchMyAccessList = async () => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const [viewers, creators] = await contract.getMyAccessList();
      return {
        viewers: [...viewers],
        creators: [...creators],
      };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Access Control: Grant access (FR-8)
   */
  const grantAccess = async (targetAddress, role) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.grantAccess(targetAddress, role);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Access Control: Revoke access (FR-8)
   */
  const revokeAccess = async (targetAddress, role) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.revokeAccess(targetAddress, role);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Appointments: Book appointment (FR-9)
   */
  const bookAppointment = async (doctorAddress, specialty, dateTimestamp, timeSlot) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.bookAppointment(doctorAddress, specialty, dateTimestamp, timeSlot);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Appointments: Update status (FR-9)
   */
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.updateAppointmentStatus(appointmentId, newStatus);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Appointments: Fetch patient / doctor / admin appointments
   */
  const fetchPatientAppointments = async (patientAddress) => {
    if (!contract) return [];
    try {
      const list = await contract.getPatientAppointments(patientAddress || account);
      return formatAppointmentList(list);
    } catch (e) {
      return [];
    }
  };

  const fetchDoctorAppointments = async (doctorAddress) => {
    if (!contract) return [];
    try {
      const list = await contract.getDoctorAppointments(doctorAddress || account);
      return formatAppointmentList(list);
    } catch (e) {
      return [];
    }
  };

  const fetchAllAppointments = async () => {
    if (!contract) return [];
    try {
      const list = await contract.getAllAppointments();
      return formatAppointmentList(list);
    } catch (e) {
      return [];
    }
  };

  /**
   * Chatbot: Log query & fetch logs (FR-10)
   */
  const logChatbotQuery = async (query, category) => {
    if (!contract) return;
    try {
      const tx = await contract.logChatbotInteraction(query, category || "General Navigation");
      await tx.wait();
    } catch (e) {
      console.warn("Could not log chatbot interaction on-chain:", e);
    }
  };

  const fetchChatbotLogs = async () => {
    if (!contract) return [];
    try {
      const logs = await contract.getChatbotLogs();
      return logs.map(formatChatbotLog);
    } catch (e) {
      return [];
    }
  };

  /**
   * Helper: Check address registration
   */
  const checkIsUserRegistered = async (userAddress) => {
    if (!contract) return false;
    try {
      return await contract.isUserRegistered(userAddress);
    } catch (err) {
      return false;
    }
  };

  /**
   * Helper: Get specific doctor profile
   */
  const getDoctorProfileByAddress = async (doctorAddress) => {
    if (!contract) return null;
    try {
      const raw = await contract.doctorProfiles(doctorAddress);
      return formatDoctorProfile(raw);
    } catch (e) {
      return null;
    }
  };

  return {
    isRegistered,
    userRole,
    isAdmin,
    userProfile,
    patientDemographicsData,
    doctorProfileData,
    loading,
    error,
    checkRegistration,
    registerUser,
    adminRegisterDoctor,
    adminRegisterPatient,
    adminRevokeUser,
    fetchRegisteredDoctors,
    fetchRegisteredPatients,
    updatePatientDemographics,
    updateDoctorProfile,
    fetchEHRRecords,
    createDetailedEHRRecord,
    updateEHRRecord,
    deleteEHRRecord,
    fetchMyAccessList,
    grantAccess,
    revokeAccess,
    bookAppointment,
    updateAppointmentStatus,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    fetchAllAppointments,
    logChatbotQuery,
    fetchChatbotLogs,
    checkIsUserRegistered,
    getDoctorProfileByAddress,
  };
}

