const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  walletAddress: { type: String, lowercase: true, trim: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'system'] },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
