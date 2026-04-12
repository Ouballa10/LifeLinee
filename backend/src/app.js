require('./config/env');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('LifeLine API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/qr', qrRoutes);

module.exports = app;
