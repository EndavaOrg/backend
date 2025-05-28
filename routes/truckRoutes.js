const express = require('express');
const router = express.Router();
const controller = require('../controllers/truckController');
const Truck = require('../models/Truck');

router.post('/', controller.createTruck);

router.get('/', controller.getAllTrucks);

router.get('/makes', async (req, res) => {
  try {
    const makes = await Truck.distinct("make");
    res.json(makes.sort());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch truck makes", error: error.message });
  }
});

router.get('/models', async (req, res) => {
  const { make } = req.query;
  if (!make) return res.status(400).json({ message: "Missing make query parameter" });

  try {
    const models = await Truck.find({ make }).distinct("model");
    res.json(models.sort());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch truck models", error: error.message });
  }
});

module.exports = router;
