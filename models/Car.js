const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  first_registration: { type: Number, required: true },
  mileage: { type: Number, required: true },
  fuel_type: { type: String, required: true },
  gearbox: { type: String, required: true }, // raw scraped value
  shifter_type: { type: String }, // optional derived display value
  engine_kw: { type: Number, required: true },
  engine_ccm: { type: Number },
  battery: { type: Number },
  price: { type: Number, required: true },
  link: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);
