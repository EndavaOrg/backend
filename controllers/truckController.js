const Truck = require('../models/Truck');
const {
  containsRegex, toNumber, addRange, applyPreferenceRanges, applyListOptions,
} = require('../utils/queryHelpers');

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
    const q = req.query;
    const filter = {};

    if (q.make) filter.make = containsRegex(q.make);
    if (q.model) filter.model = containsRegex(q.model);

    // Older truck documents store the year in "Year" instead of "first_registration"
    const yearFrom = toNumber(q.yearFrom) ?? toNumber(q.first_registration) ?? toNumber(q.first_registration_gte);
    if (yearFrom !== undefined) {
      filter.$or = [
        { first_registration: { $gte: yearFrom } },
        { Year: { $gte: yearFrom } },
      ];
    }

    addRange(filter, 'mileage_km', toNumber(q.mileageFrom), toNumber(q.mileageTo));
    addRange(filter, 'price_eur', toNumber(q.priceFrom), toNumber(q.priceTo));
    addRange(filter, 'engine_kw', toNumber(q.engineKwFrom), toNumber(q.engineKwTo));

    // Recommendation filters (year is handled above because of the Year field)
    applyPreferenceRanges(filter, q, ['mileage_km', 'price_eur', 'engine_kw']);

    if (q.fuel_type) filter.fuel_type = containsRegex(q.fuel_type);

    if (q.gearbox) {
      const type = String(q.gearbox).toLowerCase();
      if (type === 'avtomatski' || type === 'automatic') filter.gearbox = /avtomatski/i;
      else if (type === 'ročni' || type === 'manual') filter.gearbox = /ročni/i;
      else filter.gearbox = containsRegex(q.gearbox);
    }

    const trucks = await applyListOptions(Truck.find(filter), q);

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