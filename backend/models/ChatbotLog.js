const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const ChatbotLogSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, lowercase: true, trim: true },
  sessionId: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatbotLog', ChatbotLogSchema);
