const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const Car = require("../models/Car");
const { exactRegex } = require("../utils/queryHelpers");

// Makes and models now come from our own listings instead of the external CarQuery API
// (carqueryapi.com returned 500, so the make dropdown stayed empty). This also means the
// dropdown only offers makes that actually have listings.
//
// The response keeps the CarQuery shape ({ Makes: [{ make_display }] },
// { Models: [{ model_name }] }) so the frontend works without changes.
// These routes are registered before "/:id" so they are never treated as an id.

router.get("/carquery/makes", async (req, res) => {
  try {
    const makes = (await Car.distinct("make")).filter(Boolean).sort((a, b) => a.localeCompare(b));
    res.json({ Makes: makes.map((make) => ({ make_display: make })) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car makes", error: error.message });
  }
});

router.get("/carquery/models", async (req, res) => {
  const { make } = req.query;
  if (!make) return res.status(400).json({ message: "Missing make query parameter" });

  try {
    // The frontend sends the make in lowercase, so match case-insensitively
    const models = (await Car.distinct("model", { make: exactRegex(make) }))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    res.json({ Models: models.map((model) => ({ model_name: model })) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car models", error: error.message });
  }
});

router.post("/", carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

module.exports = router;