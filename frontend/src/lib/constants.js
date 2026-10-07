export const NETWORKS = {
  31337: {
    chainId: "0x7a69",
    chainName: "Hardhat Localhost",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  11155111: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

export const MEDICAL_SPECIALTIES = [
  "Pulmonology & Respiratory Medicine",
  "Neurology & Neurosurgery",
  "Cardiology & Vascular Medicine",
  "Radiology & Diagnostic Imaging",
  "General Internal Medicine",
  "Oncology & Hematology",
  "Orthopedics & Sports Medicine",
  "Pediatrics & Child Health",
];

export const TIME_SLOTS = [
  "09:00 AM - 09:30 AM",
  "09:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:30 AM - 12:00 PM",
  "02:00 PM - 02:30 PM",
  "03:00 PM - 03:30 PM",
  "04:00 PM - 04:30 PM",
  "05:00 PM - 05:30 PM",
];

export const ERROR_MESSAGES = {
  "Already registered": "You are already registered.",
  "Admin authorization required": "Admin authorization required for this action.",
  "Doctor already registered": "This doctor address is already registered.",
  "Patient already registered": "This patient address is already registered.",
  "Aadhaar required": "A valid Aadhaar number is required.",
  "Aadhaar already linked": "This Aadhaar number is already linked to another wallet.",
  "Access Role Not Valid": "Choose Viewer (v), Creator (c), or Master (m).",
  "User not found": "That address has not registered yet.",
  "Already Granted As Viewer": "This address already has Viewer access.",
  "Already Granted As Creator": "This address already has Creator access.",
  "Already Granted As Master": "This address already has Master access.",
  "Address not registered": "The target address is not registered.",
  "You are not granted as viewer": "The patient has not given you permission to view their records.",
  "You are not granted as a creator": "The patient has not given you permission to add/modify records.",
  "Not granted": "Nothing to revoke for this address.",
  "Cannot revoke own access": "Patients cannot revoke their own viewer access.",
  "Cannot revoke admin": "System administrator account cannot be revoked.",
  "Unauthorized to update appointment": "You are not authorized to update this appointment status.",
  "ACTION_REJECTED": "You cancelled the transaction in MetaMask.",
  "4001": "You cancelled the transaction in MetaMask.",
};

export function mapContractError(error) {
  if (!error) return "An unknown error occurred.";

  const errorString = error.message || String(error);

  if (error.code === 4001 || error.code === "ACTION_REJECTED" || errorString.includes("user rejected action") || errorString.includes("User rejected")) {
    return ERROR_MESSAGES["ACTION_REJECTED"];
  }

  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.includes(key)) {
      return value;
    }
  }

  // Check if reason is extracted by ethers
  if (error.reason && ERROR_MESSAGES[error.reason]) {
    return ERROR_MESSAGES[error.reason];
  }

  if (errorString.includes("insufficient funds")) {
    return "Not enough ETH to pay for transaction gas fee.";
  }

  return error.reason || error.shortMessage || error.message || "Transaction failed.";
}

