const mongoose = require('mongoose');

const emergencyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodGroup: String,
  allergies: [String],
  chronicDiseases: [String],
  medications: [String],
  emergencyContact: String,
  medicalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('EmergencyProfile', emergencyProfileSchema);
