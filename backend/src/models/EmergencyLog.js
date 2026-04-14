const mongoose = require('mongoose');

const emergencyLogSchema = new mongoose.Schema(
  {
    qrToken: {
      type: String,
      required: true,
      trim: true,
    },
    responder: {
      type: String,
      default: 'unknown',
    },
    location: {
      type: String,
      default: '',
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyLog', emergencyLogSchema);
