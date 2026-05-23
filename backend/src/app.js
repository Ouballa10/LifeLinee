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

// Basic bot/abuse protection: block common scanner paths
app.use((req, res, next) => {
  const blockedPaths = ['/_svc/', '/wp-admin', '/wp-login', '/.env', '/phpinfo', '/actuator', '/debug'];
  const path = req.path.toLowerCase();
  if (blockedPaths.some(blocked => path.startsWith(blocked))) {
    return res.status(404).end();
  }
  next();
});

// Simple in-memory rate limiter (per IP, resets every minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // max 100 requests per minute per IP

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  }

  return next();
});

// Clean up rate limit map periodically (prevent memory leak in long-running dev server)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW * 2);

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
