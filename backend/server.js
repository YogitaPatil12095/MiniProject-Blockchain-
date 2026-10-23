require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
}));

// Body parser
app.use(express.json({ limit: '50kb' }));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/audit', require('./routes/audit'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection — graceful degradation if not configured
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
      console.warn('⚠️  MongoDB connection failed — running without database (demo mode):', err.message);
    });
} else {
  console.warn('⚠️  No MONGODB_URI set — running without database (demo mode)');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Intellihealth API server running on port ${PORT}`);
});
