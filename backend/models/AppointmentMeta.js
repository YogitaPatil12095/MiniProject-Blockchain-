const mongoose = require('mongoose');

const AppointmentMetaSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientAddress: { type: String, lowercase: true, trim: true },
  doctorAddress: { type: String, lowercase: true, trim: true },
  notes: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AppointmentMeta', AppointmentMetaSchema);
