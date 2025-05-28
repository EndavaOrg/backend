const Truck = require('../models/Truck');

exports.createTruck = async (req, res) => {
  try {
    const truck = new Truck(req.body);
    const saved = await truck.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Napaka pri shranjevanju tovornjaka.", error: err.message });
  }
};

exports.getAllTrucks = async (req, res) => {
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

    const trucks = await Truck.find(filter);
    res.json(trucks);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
