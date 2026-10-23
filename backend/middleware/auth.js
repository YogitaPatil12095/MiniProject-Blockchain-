// Simple wallet-address-based auth middleware (demo project — no JWT)
// Trusts wallet address from x-wallet-address header.
//
// ⚠️  SECURITY WARNING — DEMO / DEVELOPMENT USE ONLY:
// This middleware performs NO cryptographic verification. Any HTTP client that
// knows (or guesses) a wallet address can set the x-wallet-address header to
// impersonate that user. On a public blockchain, every wallet address that has
// ever transacted is publicly visible, so this provides zero security against a
// motivated attacker.
//
// Impact: ALL authenticated endpoints (profile writes, chatbot logs, audit logs)
// are bypassable by header forgery. The admin audit-log check is also bypassable
// by setting the header to the admin's wallet address.
//
// Before any production deployment, replace this middleware with a proper
// challenge-response scheme: issue a random nonce, have the client sign it with
// MetaMask (eth_sign / personal_sign), then verify the signature server-side
// using ethers.verifyMessage() to confirm the caller owns the address.
module.exports = function authMiddleware(req, res, next) {
  const walletAddress = req.headers['x-wallet-address'];
  if (!walletAddress) {
    return res.status(401).json({ error: 'Missing x-wallet-address header' });
  }
  req.walletAddress = walletAddress.toLowerCase().trim();
  next();
};
