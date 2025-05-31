const axios = require('axios');
const mongoose = require('mongoose');
const Car = require('../models/Car'); 
require('dotenv').config();

const API_URL = 'https://m.autolina.ch/api/v2/searchcars?offset=20&limit=20';

const MONGO_URI = process.env.MONGO_URI;

const fuelTypes = {
  1501: 'Petrol',
  1502: 'Diesel',
  1503: 'Electric',
  1504: 'Hybrid'
};

const gearboxes = {
  1201: 'Automatic',
  1202: 'Manual'
};

async function importCars() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const res = await axios.get(API_URL);
    const cars = res.data?.data?.cars || [];

    const transformed = cars.map(car => ({
      make: car.makeName,
      model: car.modelName,
      first_registration: parseInt(car.constructionYear) || null,
      mileage_km: car.mileage || null,
      fuel_type: fuelTypes[car.fuelType] || 'Unknown',
      gearbox: gearboxes[car.gearboxType] || 'Unknown',
      engine_kw: car.powerOutput || null,
      engine_hp: car.powerOutput ? Math.round(car.powerOutput * 1.36) : null,
      engine_ccm: null, // not provided
      battery_kwh: null, // not provided
      state: car.isNew ? 'NOVO' : 'RABLJENO',
      price_eur: car.price || null,
      image_url: Array.isArray(car.pics) && car.pics.length > 0 ? car.pics[0] : null,
      link: `https://www.autolina.ch/auto/${car.slug}/${car.carId}`
    }));

    const inserted = await Car.insertMany(transformed, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} cars`);
  } catch (err) {
    console.error('❌ Error importing cars:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

importCars();
