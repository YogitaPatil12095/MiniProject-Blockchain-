const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/auth');

/** Returns true when Mongoose has an active connection. */
function isDbReady() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// POST /api/audit/log — requires auth, save AuditLog
router.post('/log', authMiddleware, async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database unavailable', demoMode: true });
  }
  try {
    const { event, role, details } = req.body;
    if (!event) {
      return res.status(400).json({ error: 'event is required' });
    }

    const entry = new AuditLog({
      event,
      walletAddress: req.walletAddress,
      role: role || 'patient',
      details: details || {},
      timestamp: new Date(),
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit/logs — requires auth + admin check
router.get('/logs', authMiddleware, async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database unavailable', demoMode: true });
  }
  try {
    const adminAddress = process.env.ADMIN_ADDRESS;
    if (!adminAddress) {
      // No ADMIN_ADDRESS configured — return 403 to prevent uncontrolled access
      return res.status(403).json({ error: 'Admin address not configured on server. Set ADMIN_ADDRESS env var.' });
    }
    if (req.walletAddress !== adminAddress.toLowerCase().trim()) {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
