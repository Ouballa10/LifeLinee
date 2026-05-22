require('./config/env');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const qrRoutes = require('./routes/qrRoutes');
const documentsRoutes = require('./routes/documentsRoutes');
const requireDatabase = require('./middlewares/databaseMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/', (req, res) => {
  res.send('LifeLine API is running');
});

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/emergency', requireDatabase, emergencyRoutes);
app.use('/api/qr', requireDatabase, qrRoutes);
app.use('/api/documents', requireDatabase, documentsRoutes);
app.use('/auth', requireDatabase, authRoutes);
app.use('/users', requireDatabase, userRoutes);
app.use('/emergency', requireDatabase, emergencyRoutes);
app.use('/qr', requireDatabase, qrRoutes);
app.use('/documents', requireDatabase, documentsRoutes);
app.use(errorMiddleware);

module.exports = app;
