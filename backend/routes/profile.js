const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const authMiddleware = require('../middleware/auth');

/** Returns true when Mongoose has an active connection. */
function isDbReady() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// GET /api/profile/:address — read-only, no auth needed
router.get('/:address', async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database unavailable', demoMode: true });
  }
  try {
    const address = req.params.address.toLowerCase().trim();
    const profile = await UserProfile.findOne({ walletAddress: address });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/:address — requires auth, walletAddress must match param
router.put('/:address', authMiddleware, async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database unavailable', demoMode: true });
  }
  try {
    const address = req.params.address.toLowerCase().trim();
    if (req.walletAddress !== address) {
      return res.status(403).json({ error: 'Wallet address mismatch — you can only update your own profile' });
    }

    // Explicit field allowlist — prevents arbitrary key injection into the document
    const ALLOWED_FIELDS = ['displayName', 'profilePhotoCID', 'displayPreferences', 'lastLoginAt'];
    const sanitized = {};
    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        sanitized[field] = req.body[field];
      }
    }
    const update = { ...sanitized, walletAddress: address, updatedAt: new Date() };
    const profile = await UserProfile.findOneAndUpdate(
      { walletAddress: address },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
