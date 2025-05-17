const express = require("express");
const router = express.Router();
const { getAllCars } = require("../controllers/carController");

// GET all cars
router.get("/", getAllCars);

module.exports = router;