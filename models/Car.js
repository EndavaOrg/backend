const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    brand: String,
    model: String,
    year: Number,
    engineSize: Number,
    mileage: Number,
    price: Number,
    sourcePage: String,
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);
