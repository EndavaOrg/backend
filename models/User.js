const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  make: String,
  model: String,
  minYear: Number,
  maxPrice: Number,
  maxMileage: Number,
  fuelType: String,
  gearbox: String,
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
  preferences: {
    car: preferencesSchema,
    motorcycle: preferencesSchema,
    truck: preferencesSchema,
    selectedVehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'truck'],
      default: 'car',
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
