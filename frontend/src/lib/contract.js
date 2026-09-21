/**
 * Formats an EHR struct result from ethers into a plain JavaScript object.
 * Converts BigInt timestamp to standard Number (unix seconds).
 * 
 * @param {Array|Object} ehrResult 
 * @returns {{ creator_address: string, creator_name: string, ipfs_location: string, createdAt: number }}
 */
export function formatEHR(ehrResult) {
  return {
    creator_address: ehrResult.creator_address || ehrResult[0],
    creator_name: ehrResult.creator_name || ehrResult[1],
    ipfs_location: ehrResult.ipfs_location || ehrResult[2],
    createdAt: Number(ehrResult.createdAt !== undefined ? ehrResult.createdAt : ehrResult[3]),
  };
}

/**
 * Formats an array of EHR structs into plain JavaScript objects.
 * 
 * @param {Array} ehrList 
 * @returns {Array<{ creator_address: string, creator_name: string, ipfs_location: string, createdAt: number }>}
 */
export function formatEHRList(ehrList) {
  if (!Array.isArray(ehrList)) return [];
  return ehrList.map(formatEHR);
}

/**
 * Formats a User profile struct result into a plain JavaScript object.
 * 
 * @param {Array|Object} userResult 
 * @returns {{ address: string, fullName: string, gender: string, homeAddress: string, phone: string, birthday: number }}
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
 * Truncates an Ethereum address (e.g. 0x1234...5678)
 * 
 * @param {string} address 
 * @param {number} startChars 
 * @param {number} endChars 
 * @returns {string}
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncates a CID string for display
 * 
 * @param {string} cid 
 * @returns {string}
 */
export function truncateCID(cid, startChars = 8, endChars = 6) {
  if (!cid) return "";
  if (cid.length <= startChars + endChars) return cid;
  return `${cid.slice(0, startChars)}...${cid.slice(-endChars)}`;
}
