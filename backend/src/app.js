require('./config/env');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const qrRoutes = require('./routes/qrRoutes');
const requireDatabase = require('./middlewares/databaseMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('LifeLine API is running');
});

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/emergency', requireDatabase, emergencyRoutes);
app.use('/api/qr', requireDatabase, qrRoutes);
app.use(errorMiddleware);

module.exports = app;
