const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, default: '' },
  profilePhotoCID: { type: String, default: '' },
  displayPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
