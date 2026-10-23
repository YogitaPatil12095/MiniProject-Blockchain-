/**
 * Hardened IPFS upload helper for Intellihealth EHR dApp.
 * Features: demo mode fallback, file validation, AbortController timeout, retry on network errors.
 */

const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.dcm'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Returns true if VITE_PINATA_JWT is not configured (demo / dev mode).
 */
export function isIPFSDemoMode() {
  return !import.meta.env.VITE_PINATA_JWT;
}

/**
 * Generates a deterministic fake CID for demo mode using SHA-256 of filename.
 * @param {File} file
 * @returns {Promise<string>} CID-like string starting with 'Qm'
 */
export async function generateDemoCID(file) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(file.name + file.size));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return 'Qm' + hex.slice(0, 44);
}

/**
 * Validates file before upload. Throws descriptive errors.
 * @param {File} file
 */
function validateFile(file) {
  if (!file || file.size === 0) {
    throw new Error('Cannot upload an empty file.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File too large. Maximum allowed size is 10 MB. (Your file: ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  // Post-encryption files come as application/octet-stream — skip ext check for those
  if (file.type !== 'application/octet-stream') {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      throw new Error('Invalid file type. Allowed: PDF, PNG, JPG, JPEG, DICOM (.dcm)');
    }
  }
}

/**
 * Makes a single attempt to pin a file to Pinata IPFS with a 15s timeout.
 * @param {File} file
 * @param {string} jwt
 * @returns {Promise<Object>} Pinata response JSON
 */
async function pinToIPFS(file, jwt) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: `PHR_Record_${Date.now()}_${file.name}`,
      keyvalues: {
        app: 'PHR-dApp',
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })
  );
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 401) {
      throw new Error('Pinata JWT is invalid or expired. Please check your VITE_PINATA_JWT configuration.');
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.error?.details || err.error?.message || `IPFS upload failed: HTTP ${response.status}`
      );
    }
    return response.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Uploads a file to IPFS via Pinata, with validation, demo-mode fallback, and retry.
 *
 * @param {File} file - The file to upload (use encrypted blob for medical files)
 * @param {string} jwt - Pinata JWT token (from VITE_PINATA_JWT)
 * @returns {Promise<{ cid: string, gatewayUrl: string, size: number, isDemoMode?: boolean }>}
 */
export async function uploadToIPFS(file, jwt) {
  // 1. Validate (instant — no network)
  validateFile(file);

  const gatewayBase = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  const normalizedBase = gatewayBase.endsWith('/') ? gatewayBase : gatewayBase + '/';

  // 2. Demo mode — no JWT configured
  if (!jwt || isIPFSDemoMode()) {
    const cid = await generateDemoCID(file);
    return {
      cid,
      gatewayUrl: 'demo://not-pinned',
      size: file.size,
      isDemoMode: true,
    };
  }

  // 3. Real upload with one retry on network/timeout errors
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await pinToIPFS(file, jwt);
      const cid = data.IpfsHash;
      return {
        cid,
        gatewayUrl: `${normalizedBase}${cid}`,
        size: data.PinSize,
        isDemoMode: false,
      };
    } catch (err) {
      lastError = err;
      const isRetryable =
        err.name === 'AbortError' ||
        err.message.toLowerCase().includes('fetch') ||
        err.message.toLowerCase().includes('network') ||
        err.message.toLowerCase().includes('timeout');
      if (!isRetryable || attempt === 2) {
        if (err.name === 'AbortError') {
          throw new Error('Upload timed out. Please check your connection and try again.');
        }
        throw err;
      }
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Should not reach here, but guard anyway
  if (lastError?.name === 'AbortError') {
    throw new Error('Upload timed out. Please check your connection and try again.');
  }
  throw lastError;
}
