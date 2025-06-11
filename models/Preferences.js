const mongoose = require('mongoose');

const carPreferenceSchema = new mongoose.Schema({
  make: String,
  model: String,
  first_registration: Number,
  mileage_km: Number,
  fuel_type: String,
  gearbox: String,
  engine_ccm: Number,
  engine_kw: Number,
  engine_hp: Number,
  battery_kwh: Number,
  price_eur: Number,
}, { _id: false });

const motorcyclePreferenceSchema = new mongoose.Schema({
  make: String,
  model: String,
  first_registration: Number,
  mileage_km: Number,
  engine_kw: Number,
  engine_hp: Number,
  price_eur: Number,
}, { _id: false });

const truckPreferenceSchema = new mongoose.Schema({
  make: String,
  model: String,
  first_registration: Number,
  mileage_km: Number,
  fuel_type: String,
  gearbox: String,
  engine_ccm: Number,
  engine_kw: Number,
  engine_hp: Number,
  price_eur: Number,
}, { _id: false });

module.exports = {
  carPreferenceSchema,
  motorcyclePreferenceSchema,
  truckPreferenceSchema
};