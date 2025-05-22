const mongoose = require('mongoose');

const carPreferencesSchema = new mongoose.Schema({
  make: String,
  model: String,
  maxPrice: Number,
  minYear: Number,
  maxMileage: Number,
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', ''],
    default: '',
  },
  gearbox: {
    type: String,
    enum: ['manual', 'automatic', ''],
    default: '',
  },
  minEngineCCM: Number,
  minEngineKW: Number,
  batteryCapacity: Number,
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  ime: String,
  priimek: String,
  telefon: String,
  preferences: carPreferencesSchema,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
