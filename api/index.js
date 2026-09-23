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

// कर्मचारीको नाम, लगइन आइडी र पासवर्ड अपडेट गर्ने API
app.post('/api/admin/update-user', async (req, res) => {
  const { id, full_name, login_id } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'प्रयोगकर्ता आईडी आवश्यक छ' });
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('users')
      .update({ full_name, login_id })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'विवरण सफलतापूर्वक अद्यावधिक भयो!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// सबै प्रयोगकर्ताहरूको विवरण ल्याउने API
app.get('/api/admin/users', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, login_id, role, plain_password');

    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = app;
