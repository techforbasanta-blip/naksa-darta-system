const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// १. लगइन API
app.post('/api/auth/login', async (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ error: 'Login ID र Password दुवै आवश्यक छन्।' });
  }

  // सुपरएडमिनको लागि प्रत्यक्ष प्रमाणीकरण (Fail-safe)
  if (login_id === 'superadmin' && password === 'Admin@2083') {
    return res.json({
      success: true,
      user: { id: 'superadmin', full_name: 'सुपर एडमिन', login_id: 'superadmin', role: 'superadmin' }
    });
  }

  // Supabase बाट जाँच
  if (supabase) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`login_id.eq.${login_id},username.eq.${login_id}`)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Login ID वा Password मिलेन।' });
      }

      if (user.plain_password === password || user.password === password) {
        return res.json({ success: true, user });
      } else {
        return res.status(401).json({ error: 'Login ID वा Password मिलेन।' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'डेटाबेस प्रमाणीकरण त्रुटि: ' + err.message });
    }
  }

  return res.status(401).json({ error: 'प्रयोगकर्ता फेला परेन।' });
});

// २. स्वास्थ्य जाँच
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayadevi Server Running' });
});

module.exports = app;
