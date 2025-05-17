const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

// Create a new car
router.post("/", carController.createCar); // POST /api/cars

// Get all cars
router.get("/", carController.getAllCars); // GET /api/cars

// Get a car by ID
router.get("/:id", carController.getCarById); // GET /api/cars/:id

// Update a car by ID
router.put("/:id", carController.updateCar); // PUT /api/cars/:id

// Delete a car by ID
router.delete("/:id", carController.deleteCar); // DELETE /api/cars/:id

module.exports = router;
