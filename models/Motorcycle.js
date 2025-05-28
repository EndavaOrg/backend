const mongoose = require('mongoose');

const motorcycleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  first_registration: { type: Number },
  mileage_km: { type: Number },
  engine_kw: { type: Number },
  engine_hp: { type: Number },
  state: { type: String, default: "RABLJENO" },
  price_eur: { type: Number, required: true },
  image_url: { type: String },
  link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Motorcycle', motorcycleSchema);
