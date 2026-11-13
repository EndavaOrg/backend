const Motorcycle = require('../models/Motorcycle');
const {
  containsRegex, toNumber, addRange, applyPreferenceRanges, applyListOptions,
} = require('../utils/queryHelpers');

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
    const q = req.query;
    const filter = {};

    if (q.make) filter.make = containsRegex(q.make);
    if (q.model) filter.model = containsRegex(q.model);

    const yearFrom = toNumber(q.first_registration) ?? toNumber(q.yearFrom);
    if (yearFrom !== undefined) filter.first_registration = { $gte: yearFrom };

    addRange(filter, 'mileage_km', toNumber(q.mileageFrom), toNumber(q.mileageTo));
    addRange(filter, 'price_eur', toNumber(q.priceFrom), toNumber(q.priceTo));
    addRange(filter, 'engine_kw', toNumber(q.engineKwFrom), toNumber(q.engineKwTo));

    // Recommendation filters: first_registration_gte, mileage_km_lte, price_eur_lte
    applyPreferenceRanges(filter, q, ['first_registration', 'mileage_km', 'price_eur', 'engine_kw']);

    const motorcycles = await applyListOptions(Motorcycle.find(filter), q);
    res.json(motorcycles);
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};