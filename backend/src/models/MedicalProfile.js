const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    bloodType: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: {
        type: String,
        default: '',
        trim: true,
      },
      phone: {
        type: String,
        default: '',
        trim: true,
      },
      relationship: {
        type: String,
        default: '',
        trim: true,
      },
    },
    criticalInstructions: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalProfile', medicalProfileSchema);
