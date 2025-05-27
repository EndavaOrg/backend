const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const axios = require("axios");

// Your existing routes
router.post("/", carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

router.get("/carquery/makes", async (req, res) => {
  try {
    const response = await axios.get("https://www.carqueryapi.com/api/0.3/?cmd=getMakes");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car makes", error: error.message });
  }
});

router.get("/carquery/models", async (req, res) => {
  const make = req.query.make;
  if (!make) return res.status(400).json({ message: "Missing make query parameter" });

  try {
    const response = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make.toLowerCase()}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car models", error: error.message });
  }
});

module.exports = router;
