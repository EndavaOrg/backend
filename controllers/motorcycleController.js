const Motorcycle = require('../models/Motorcycle');

exports.createMotorcycle = async (req, res) => {
  try {
    const motorcycle = new Motorcycle(req.body);
    const saved = await motorcycle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri shranjevanju motorja.", error: err.message });
  }
};

exports.getAllMotorcycles = async (req, res) => {
  try {
    const {
      make,
      model,
      first_registration,
      mileageFrom,
      mileageTo,
      priceFrom,
      priceTo,
      engineKwFrom,
      engineKwTo
    } = req.query;

    const filter = {};

    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    
    if (first_registration && !isNaN(first_registration)) {
      filter.first_registration = { $gte: parseInt(first_registration) };
    }

    if (mileageFrom || mileageTo) {
      filter.mileage_km = {};
      if (!isNaN(mileageFrom)) filter.mileage_km.$gte = Number(mileageFrom);
      if (!isNaN(mileageTo)) filter.mileage_km.$lte = Number(mileageTo);
    }

    if (priceFrom || priceTo) {
      filter.price_eur = {};
      if (!isNaN(priceFrom)) filter.price_eur.$gte = Number(priceFrom);
      if (!isNaN(priceTo)) filter.price_eur.$lte = Number(priceTo);
    }

    if (engineKwFrom || engineKwTo) {
      filter.engine_kw = {};
      if (!isNaN(engineKwFrom)) filter.engine_kw.$gte = Number(engineKwFrom);
      if (!isNaN(engineKwTo)) filter.engine_kw.$lte = Number(engineKwTo);
    }

    const motorcycles = await Motorcycle.find(filter);
    res.json(motorcycles);
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
