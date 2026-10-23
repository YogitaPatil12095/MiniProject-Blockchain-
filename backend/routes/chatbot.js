const express = require('express');
const router = express.Router();
const ChatbotLog = require('../models/ChatbotLog');
const authMiddleware = require('../middleware/auth');

// POST /api/chatbot/log — upsert ChatbotLog by sessionId + walletAddress, push messages
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { sessionId, role, messages } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const messagesToPush = Array.isArray(messages) ? messages : [];

    const log = await ChatbotLog.findOneAndUpdate(
      { sessionId, walletAddress: req.walletAddress },
      {
        $set: { role: role || 'patient', updatedAt: new Date() },
        $push: { messages: { $each: messagesToPush } },
        $setOnInsert: { walletAddress: req.walletAddress, sessionId, createdAt: new Date() },
      },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/logs/:address — requires auth, address must match header
router.get('/logs/:address', authMiddleware, async (req, res) => {
  try {
    const address = req.params.address.toLowerCase().trim();
    if (req.walletAddress !== address) {
      return res.status(403).json({ error: 'You can only view your own chatbot logs' });
    }

    const logs = await ChatbotLog.find({ walletAddress: address }).sort({ updatedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
