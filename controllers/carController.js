const Car = require("../models/Car");

// GET /api/cars - Get all cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch cars" });
    }
};

// GET /api/cars/:id - Get a car by ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }
        res.status(200).json(car);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch car" });
    }
};

// POST /api/cars - Create a new car
exports.createCar = async (req, res) => {
    try {
        const newCar = new Car(req.body);
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (err) {
        res.status(500).json({ error: "Failed to create car" });
    }
};

// PUT /api/cars/:id - Update a car by ID
exports.updateCar = async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedCar) {
            return res.status(404).json({ error: "Car not found" });
        }
        res.status(200).json(updatedCar);
    } catch (err) {
        res.status(500).json({ error: "Failed to update car" });
    }
};

// DELETE /api/cars/:id - Delete a car by ID
exports.deleteCar = async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ error: "Car not found" });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete car" });
    }
};
