/**
 * Uploads a file to IPFS using Pinata's REST API.
 * Follows current official Pinata documentation (pinFileToIPFS with JWT authorization).
 * 
 * @param {File} file - File object to upload
 * @param {string} jwt - Pinata API JWT token
 * @returns {Promise<{ cid: string, gatewayUrl: string, size: number }>}
 */
export async function uploadToIPFS(file, jwt) {
  if (!jwt) {
    throw new Error("Pinata JWT is missing. Please configure VITE_PINATA_JWT in your frontend .env file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `PHR_Record_${Date.now()}_${file.name}`,
    keyvalues: {
      app: "PHR-dApp",
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.details || errorData.error?.message || `IPFS upload failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const cid = data.IpfsHash;
  const gatewayBase = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
  const gatewayUrl = `${gatewayBase.endsWith("/") ? gatewayBase : gatewayBase + "/"}${cid}`;

  return {
    cid,
    gatewayUrl,
    size: data.PinSize,
  };
}
