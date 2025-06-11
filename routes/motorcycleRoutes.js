const express = require('express');
const router = express.Router();
const controller = require('../controllers/motorcycleController');
const Motorcycle = require('../models/Motorcycle');

router.post('/', controller.createMotorcycle);
router.get('/', controller.getAllMotorcycles);

router.get('/makes', async (req, res) => {
  try {
    const makes = await Motorcycle.distinct("make");
    res.json(makes.sort());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch motorcycle makes", error: error.message });
  }
});

router.get('/models', async (req, res) => {
  const { make } = req.query;
  if (!make) return res.status(400).json({ message: "Missing make query parameter" });

  try {
    const models = await Motorcycle.find({ make }).distinct("model");
    res.json(models.sort());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch motorcycle models", error: error.message });
  }
});

module.exports = router;
