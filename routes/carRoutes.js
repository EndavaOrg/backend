const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const authenticateFirebaseToken = require('../middleware/authMiddleware');

// All routes here are protected
router.use(authenticateFirebaseToken);

router.post("/", carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

module.exports = router;
