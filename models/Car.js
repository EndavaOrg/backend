const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  first_registration: { type: Number, required: true }, // Only the year, e.g., 2019
  mileage: { type: Number, required: true },
  fuel_type: { type: String, required: true },
  shifter_type: { type: String, required: true },
  engine_kw: { type: Number, required: true },
  price: { type: Number, required: true },
  link: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);
