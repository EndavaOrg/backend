const Car = require('../models/Car');

exports.getAllCars = async (req, res) => {
  try {
    const filter = {};

    if (req.query.make) filter.make = { $regex: new RegExp(req.query.make, 'i') };
    if (req.query.model) filter.model = { $regex: new RegExp(req.query.model, 'i') };

    if (req.query.fuel_type) {
      const type = req.query.fuel_type.toLowerCase();
      if (type === 'diesel') filter.fuel_type = { $regex: /diesel/i };
      else if (type === 'petrol') filter.fuel_type = { $regex: /bencin/i };
      else if (type === 'hybrid') filter.fuel_type = { $regex: /hibrid/i };
      else if (type === 'electric') filter.fuel_type = { $regex: /elektro|electric/i };
    }

    if (req.query.shifter_type) {
      const type = req.query.shifter_type.toLowerCase();
      if (type === 'automatic') filter.gearbox = { $regex: /avtomatski/i };
      else if (type === 'manual') filter.gearbox = { $regex: /ročni/i };
    }

    if (req.query.yearFrom && !isNaN(Number(req.query.yearFrom))) {
      filter.first_registration = { $gte: Number(req.query.yearFrom) };
    }

    const mileageFrom = Number(req.query.mileageFrom);
    const mileageTo = Number(req.query.mileageTo);
    if (!isNaN(mileageFrom) || !isNaN(mileageTo)) {
      filter.mileage_km = {};
      if (!isNaN(mileageFrom)) filter.mileage_km.$gte = mileageFrom;
      if (!isNaN(mileageTo)) filter.mileage_km.$lte = mileageTo;
    }

    let powerFrom = Number(req.query.powerFrom);
    let powerTo = Number(req.query.powerTo);
    const powerUnit = req.query.powerUnit;

    if (!isNaN(powerFrom) || !isNaN(powerTo)) {
      if (powerUnit === 'HP') {
        if (!isNaN(powerFrom)) powerFrom = Math.round(powerFrom / 1.36);
        if (!isNaN(powerTo)) powerTo = Math.round(powerTo / 1.36);
      }
      filter.engine_kw = {};
      if (!isNaN(powerFrom)) filter.engine_kw.$gte = powerFrom;
      if (!isNaN(powerTo)) filter.engine_kw.$lte = powerTo;
    }

    const priceFrom = Number(req.query.priceFrom);
    const priceTo = Number(req.query.priceTo);
    if (!isNaN(priceFrom) || !isNaN(priceTo)) {
      filter.price_eur = {};
      if (!isNaN(priceFrom)) filter.price_eur.$gte = priceFrom;
      if (!isNaN(priceTo)) filter.price_eur.$lte = priceTo;
    }

    const ccmFrom = Number(req.query.engineCcmFrom);
    const ccmTo = Number(req.query.engineCcmTo);
    if (!isNaN(ccmFrom) || !isNaN(ccmTo)) {
      filter.engine_ccm = {};
      if (!isNaN(ccmFrom)) filter.engine_ccm.$gte = ccmFrom;
      if (!isNaN(ccmTo)) filter.engine_ccm.$lte = ccmTo;
    }

    const cars = await Car.find(filter);
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({
      message: 'Napaka pri pridobivanju vozil.',
      error: error.message,
    });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Vozilo ni bilo najdeno.' });
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: 'Napaka pri pridobivanju vozila.', error: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(500).json({ message: 'Napaka pri shranjevanju vozila.', error: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedCar) return res.status(404).json({ message: 'Vozilo ni bilo najdeno za posodobitev.' });
    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: 'Napaka pri posodabljanju vozila.', error: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ message: 'Vozilo ni bilo najdeno za brisanje.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Napaka pri brisanju vozila.', error: error.message });
  }
};
