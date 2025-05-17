const Car = require("../models/Car");

// GET /api/cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch cars" });
    }
};