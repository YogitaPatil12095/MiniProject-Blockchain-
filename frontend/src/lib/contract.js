/**
 * Formats an EHR struct result from ethers into a plain JavaScript object.
 * Converts BigInt timestamp to standard Number (unix seconds).
 * 
 * @param {Array|Object} ehrResult 
 */
export function formatEHR(ehrResult) {
  let medications = [];
  let tests = [];

  const medsRaw = ehrResult.medicationsJson || ehrResult[5] || "[]";
  const testsRaw = ehrResult.testsJson || ehrResult[6] || "[]";

  try {
    medications = JSON.parse(medsRaw);
  } catch (e) {
    medications = [];
  }

  try {
    tests = JSON.parse(testsRaw);
  } catch (e) {
    tests = [];
  }

  return {
    creator_address: ehrResult.creator_address || ehrResult[0],
    creator_name: ehrResult.creator_name || ehrResult[1],
    ipfs_location: ehrResult.ipfs_location || ehrResult[2],
    createdAt: Number(ehrResult.createdAt !== undefined ? ehrResult.createdAt : ehrResult[3]),
    diagnosis: ehrResult.diagnosis || ehrResult[4] || "General Consultation",
    medications: Array.isArray(medications) ? medications : [],
    tests: Array.isArray(tests) ? tests : [],
    followUpNotes: ehrResult.followUpNotes || ehrResult[7] || "",
  };
}

/**
 * Formats an array of EHR structs into plain JavaScript objects.
 */
export function formatEHRList(ehrList) {
  if (!Array.isArray(ehrList)) return [];
  return ehrList.map(formatEHR);
}

/**
 * Formats a User profile struct result into a plain JavaScript object.
 */
export function formatUserData(userResult) {
  return {
    address: userResult.user_address || userResult[0],
    fullName: userResult.full_name || userResult[1],
    gender: userResult.gender || userResult[2],
    homeAddress: userResult.home_address || userResult[3],
    phone: userResult.phone_number || userResult[4],
    birthday: Number(userResult.birthday !== undefined ? userResult.birthday : userResult[5]),
  };
}

/**
 * Formats extended Patient Demographics struct.
 */
export function formatDemographics(demoResult) {
  if (!demoResult) return null;
  return {
    aadhaarNumber: demoResult.aadhaarNumber || demoResult[0] || "",
    fullName: demoResult.fullName || demoResult[1] || "",
    gender: demoResult.gender || demoResult[2] || "",
    homeAddress: demoResult.homeAddress || demoResult[3] || "",
    phoneNumber: demoResult.phoneNumber || demoResult[4] || "",
    birthday: Number(demoResult.birthday !== undefined ? demoResult.birthday : demoResult[5] || 0),
    bloodType: demoResult.bloodType || demoResult[6] || "O+",
    heightCm: Number(demoResult.heightCm !== undefined ? demoResult.heightCm : demoResult[7] || 170),
    weightKg: Number(demoResult.weightKg !== undefined ? demoResult.weightKg : demoResult[8] || 65),
    photoIpfsCid: demoResult.photoIpfsCid || demoResult[9] || "",
  };
}

/**
 * Formats Doctor Profile struct.
 */
export function formatDoctorProfile(docResult) {
  if (!docResult) return null;
  return {
    doctorId: docResult.doctorId || docResult[0] || "",
    fullName: docResult.fullName || docResult[1] || "",
    specialty: docResult.specialty || docResult[2] || "General Medicine",
    qualification: docResult.qualification || docResult[3] || "MBBS, MD",
    phoneNumber: docResult.phoneNumber || docResult[4] || "",
    location: docResult.location || docResult[5] || "",
    photoIpfsCid: docResult.photoIpfsCid || docResult[6] || "",
  };
}

/**
 * Formats an Appointment struct.
 */
export function formatAppointment(apptResult) {
  return {
    appointmentId: Number(apptResult.appointmentId !== undefined ? apptResult.appointmentId : apptResult[0]),
    patientAddress: apptResult.patientAddress || apptResult[1],
    patientName: apptResult.patientName || apptResult[2] || "Patient",
    doctorAddress: apptResult.doctorAddress || apptResult[3],
    doctorName: apptResult.doctorName || apptResult[4] || "Doctor",
    specialty: apptResult.specialty || apptResult[5] || "General Consultation",
    dateTimestamp: Number(apptResult.dateTimestamp !== undefined ? apptResult.dateTimestamp : apptResult[6]),
    timeSlot: apptResult.timeSlot || apptResult[7] || "10:00 AM",
    status: apptResult.status || apptResult[8] || "Pending",
  };
}

/**
 * Formats a list of appointments.
 */
export function formatAppointmentList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(formatAppointment);
}

/**
 * Formats a Chatbot Log entry.
 */
export function formatChatbotLog(log) {
  return {
    userAddress: log.userAddress || log[0],
    query: log.query || log[1],
    category: log.category || log[2] || "General",
    timestamp: Number(log.timestamp !== undefined ? log.timestamp : log[3] || Date.now() / 1000),
  };
}

/**
 * Truncates an Ethereum address (e.g. 0x1234...5678)
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncates a CID string for display
 */
export function truncateCID(cid, startChars = 8, endChars = 6) {
  if (!cid) return "";
  if (cid.length <= startChars + endChars) return cid;
  return `${cid.slice(0, startChars)}...${cid.slice(-endChars)}`;
}

