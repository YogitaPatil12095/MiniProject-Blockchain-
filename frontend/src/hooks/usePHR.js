import { useState, useCallback, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { mapContractError } from "../lib/constants";
import { formatEHRList, formatUserData } from "../lib/contract";

export function usePHR() {
  const { contract, account } = useWallet();

  const [isRegistered, setIsRegistered] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch caller's registration status & profile data
  const checkRegistration = useCallback(async () => {
    if (!contract || !account) {
      setIsRegistered(null);
      setUserProfile(null);
      return;
    }

    try {
      setLoading(true);
      const registered = await contract.isUserRegistered(account);
      setIsRegistered(registered);

      if (registered) {
        const rawProfile = await contract.getUserData(account);
        setUserProfile(formatUserData(rawProfile));
      } else {
        setUserProfile(null);
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
   * Register a new user (FR-1)
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
   * View caller's or granted patient's records (FR-2 / FR-5)
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
   * View caller's access list (FR-3)
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
   * Grant access to an address (FR-4)
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
   * Revoke access from an address (FR-7)
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
   * Create an EHR record with IPFS CID (FR-6)
   */
  const createEHRRecord = async (patientAddress, creatorName, ipfsCID) => {
    if (!contract) throw new Error("Contract not ready.");
    setError(null);
    try {
      const tx = await contract.createEHR(patientAddress, creatorName, ipfsCID);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (err) {
      const friendlyMsg = mapContractError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Helper to check if a specific patient address is registered
   */
  const checkIsUserRegistered = async (userAddress) => {
    if (!contract) return false;
    try {
      return await contract.isUserRegistered(userAddress);
    } catch (err) {
      return false;
    }
  };

  return {
    isRegistered,
    userProfile,
    loading,
    error,
    checkRegistration,
    registerUser,
    fetchEHRRecords,
    fetchMyAccessList,
    grantAccess,
    revokeAccess,
    createEHRRecord,
    checkIsUserRegistered,
  };
}
