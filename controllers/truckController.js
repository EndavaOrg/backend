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
      yearFrom,
      mileageFrom,
      mileageTo,
      priceFrom,
      priceTo,
      engineKwFrom,
      engineKwTo,
      fuel_type,
      gearbox
    } = req.query;

    const filter = {};

    if (make) filter.make = new RegExp(make, 'i');

    if (model) filter.model = new RegExp(model, 'i');

    if (yearFrom && !isNaN(yearFrom)) {
      // Match Year field if present
      filter.$or = [
        { first_registration: { $gte: parseInt(yearFrom) } },
        { Year: { $gte: parseInt(yearFrom) } }
      ];
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

    if (fuel_type) {
      filter.fuel_type = new RegExp(fuel_type, 'i');
    }

    if (gearbox) {
      const type = gearbox.toLowerCase();
      if (type === 'avtomatski') filter.gearbox = { $regex: /avtomatski/i };
      else if (type === 'ročni') filter.gearbox = { $regex: /ročni/i };
      else filter.gearbox = new RegExp(gearbox, 'i');
    }

    const trucks = await Truck.find(filter);

    // Normalize year:
    const trucksWithCorrectYear = trucks.map(truck => {
      const truckObj = truck.toObject();
      truckObj.first_registration = truckObj.first_registration ?? truckObj.Year ?? null;
      return truckObj;
    });

    res.json(trucksWithCorrectYear);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

