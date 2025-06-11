const mongoose = require('mongoose');
const {
  carPreferenceSchema,
  motorcyclePreferenceSchema,
  truckPreferenceSchema,
} = require('./Preferences');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  ime: String,
  priimek: String,
  telefon: String,
  preferences: {
    car: [carPreferenceSchema],
    motorcycle: [motorcyclePreferenceSchema],
    truck: [truckPreferenceSchema],
    selectedVehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'truck'],
      default: 'car',
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);