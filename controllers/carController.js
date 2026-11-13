const Car = require('../models/Car');

// 1 kW = 1.36 HP (metric horsepower)
const HP_PER_KW = 1.36;

// Query values (EN) mapped to the values stored in the DB (SLO, from avto.net)
const FUEL_TYPE_PATTERNS = {
  diesel: /diesel/i,
  petrol: /bencin/i,
  hybrid: /hibrid/i,
  electric: /elektro|electric/i,
};

const GEARBOX_PATTERNS = {
  automatic: /avtomatski/i,
  manual: /ročni/i,
  avtomatski: /avtomatski/i,
  'ročni': /ročni/i,
};

const {
  containsRegex, toNumber, addRange, applyPreferenceRanges, applyListOptions,
} = require('../utils/queryHelpers');

const hpToKw = (hp) => (hp === undefined ? undefined : Math.round(hp / HP_PER_KW));

/**
 * Builds a MongoDB filter for cars from request query parameters.
 */
const buildCarFilter = (query) => {
  const filter = {};

  if (query.make) filter.make = containsRegex(query.make);
  if (query.model) filter.model = containsRegex(query.model);

  const fuelPattern = FUEL_TYPE_PATTERNS[query.fuel_type?.toLowerCase()];
  if (fuelPattern) filter.fuel_type = fuelPattern;

  // Search form sends shifter_type, saved preferences send gearbox
  const gearboxValue = (query.shifter_type || query.gearbox)?.toLowerCase();
  const gearboxPattern = GEARBOX_PATTERNS[gearboxValue];
  if (gearboxPattern) filter.gearbox = gearboxPattern;

  // yearFrom from the search form; first_registration is the same value copied by the frontend
  const yearFrom = toNumber(query.yearFrom) ?? toNumber(query.first_registration);
  if (yearFrom !== undefined) filter.first_registration = { $gte: yearFrom };

  // The frontend converts power to kW and sends engineKwFrom/engineKwTo.
  // powerFrom/powerTo (+ powerUnit) are still accepted for older clients.
  const isHp = query.powerUnit === 'HP';
  const legacyFrom = isHp ? hpToKw(toNumber(query.powerFrom)) : toNumber(query.powerFrom);
  const legacyTo = isHp ? hpToKw(toNumber(query.powerTo)) : toNumber(query.powerTo);
  const powerFrom = toNumber(query.engineKwFrom) ?? legacyFrom;
  const powerTo = toNumber(query.engineKwTo) ?? legacyTo;

  addRange(filter, 'mileage_km', toNumber(query.mileageFrom), toNumber(query.mileageTo));
  addRange(filter, 'engine_kw', powerFrom, powerTo);
  addRange(filter, 'price_eur', toNumber(query.priceFrom), toNumber(query.priceTo));
  addRange(filter, 'engine_ccm', toNumber(query.engineCcmFrom), toNumber(query.engineCcmTo));

  // Recommendation filters: first_registration_gte, mileage_km_lte, price_eur_lte
  applyPreferenceRanges(filter, query, ['first_registration', 'mileage_km', 'price_eur', 'engine_kw', 'engine_ccm']);

  return filter;
};

const sendError = (res, status, message, error) => {
  res.status(status).json({ message, error: error?.message });
};

exports.getAllCars = async (req, res) => {
  try {
    const cars = await applyListOptions(Car.find(buildCarFilter(req.query)), req.query);
    res.status(200).json(cars);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch cars.', error);
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return sendError(res, 404, 'Car not found.');
    res.status(200).json(car);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch car.', error);
  }
};

exports.createCar = async (req, res) => {
  try {
    const savedCar = await new Car(req.body).save();
    res.status(201).json(savedCar);
  } catch (error) {
    sendError(res, 500, 'Failed to save car.', error);
  }
};

exports.updateCar = async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedCar) return sendError(res, 404, 'Car not found.');
    res.status(200).json(updatedCar);
  } catch (error) {
    sendError(res, 500, 'Failed to update car.', error);
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return sendError(res, 404, 'Car not found.');
    res.status(204).send();
  } catch (error) {
    sendError(res, 500, 'Failed to delete car.', error);
  }
};