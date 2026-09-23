const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Auth & Other Routes
try {
  const authRoutes = require('../authRoutes');
  const recordRoutes = require('../recordRoutes');
  const staffRoutes = require('../staffRoutes');
  const verifyRoutes = require('../verifyRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/verify', verifyRoutes);
} catch (err) {
  console.log("Routes loading fallback:", err.message);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayadevi Naksa API Running' });
});

module.exports = app;
