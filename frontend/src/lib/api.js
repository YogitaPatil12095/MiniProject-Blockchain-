/**
 * Intellihealth Backend API Client
 * Thin fetch wrapper for the Express REST API.
 * All functions fail gracefully — if backend is down, they return null / empty array.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Internal helper — wraps fetch with default headers.
 * Returns parsed JSON or throws on non-OK responses.
 */
async function apiFetch(path, options = {}, walletAddress = '') {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(walletAddress ? { 'x-wallet-address': walletAddress } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}`);
  }
  return res.json();
}

// ── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /api/profile/:address
 * Returns the user profile object, or null if not found or backend is down.
 */
export async function getProfile(address) {
  try {
    return await apiFetch(`/api/profile/${address}`);
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('not found')) return null;
    console.warn('[api] getProfile failed:', err.message);
    return null;
  }
}

/**
 * PUT /api/profile/:address
 * Upserts the profile for `address`. Sends x-wallet-address header for auth.
 * Returns the updated profile, or null on error.
 */
export async function upsertProfile(address, data) {
  try {
    return await apiFetch(
      `/api/profile/${address}`,
      { method: 'PUT', body: JSON.stringify(data) },
      address
    );
  } catch (err) {
    console.warn('[api] upsertProfile failed:', err.message);
    return null;
  }
}

// ── Chatbot ──────────────────────────────────────────────────────────────────

/**
 * POST /api/chatbot/log
 * Upserts a chatbot log session and pushes messages.
 * Returns the log document, or null on error.
 */
export async function logChatbotMessage(walletAddress, sessionId, role, message) {
  try {
    return await apiFetch(
      '/api/chatbot/log',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          role,
          messages: Array.isArray(message) ? message : [message],
        }),
      },
      walletAddress
    );
  } catch (err) {
    console.warn('[api] logChatbotMessage failed:', err.message);
    return null;
  }
}

/**
 * GET /api/chatbot/logs/:address
 * Returns array of chatbot log sessions, or empty array on error.
 */
export async function getChatbotHistory(address) {
  try {
    return await apiFetch(`/api/chatbot/logs/${address}`, {}, address);
  } catch (err) {
    console.warn('[api] getChatbotHistory failed:', err.message);
    return [];
  }
}

// ── Audit ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/audit/log
 * Saves an audit event. Returns the saved document, or null on error.
 */
export async function logAuditEvent(walletAddress, event, role, details) {
  try {
    return await apiFetch(
      '/api/audit/log',
      {
        method: 'POST',
        body: JSON.stringify({ event, role, details: details || {} }),
      },
      walletAddress
    );
  } catch (err) {
    console.warn('[api] logAuditEvent failed:', err.message);
    return null;
  }
}

/**
 * GET /api/audit/logs
 * Returns all audit logs (admin only — requires ADMIN_ADDRESS set on server).
 * Sends x-wallet-address header for the admin address check.
 * Returns empty array on error or if not authorized.
 */
export async function getAuditLogs(adminAddress) {
  try {
    return await apiFetch('/api/audit/logs', {}, adminAddress);
  } catch (err) {
    console.warn('[api] getAuditLogs failed:', err.message);
    return [];
  }
}
