// Simple wallet-address-based auth middleware (demo project — no JWT)
// Trusts wallet address from x-wallet-address header
module.exports = function authMiddleware(req, res, next) {
  const walletAddress = req.headers['x-wallet-address'];
  if (!walletAddress) {
    return res.status(401).json({ error: 'Missing x-wallet-address header' });
  }
  req.walletAddress = walletAddress.toLowerCase().trim();
  next();
};
