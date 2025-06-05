require('dotenv').config(); 
console.log('MONGO_URI:', process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const admin = require('./config/firebaseAdmin'); // firebase init

const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const motorcycleRoutes = require('./routes/motorcycleRoutes');
const trucksRoutes = require('./routes/truckRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();



app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get('/', (req, res) => {
  res.send('🚀 API is running');
});
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes); 
app.use('/api/motorcycles', motorcycleRoutes);
app.use('/api/trucks', trucksRoutes);
app.use('/api/ai', aiRoutes);

// mongodb connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong',
  });
});

module.exports = app;
