const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS हेडर
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { login_id, password } = req.body || {};

  if (!login_id || !password) {
    return res.status(400).json({ error: 'Login ID र Password दुवै आवश्यक छन्।' });
  }

  // सुपरएडमिन प्रत्यक्ष प्रमाणीकरण (Direct Fallback)
  if (login_id === 'superadmin' && password === 'Admin@2083') {
    return res.status(200).json({
      success: true,
      user: {
        id: 'superadmin',
        full_name: 'सुपर एडमिन',
        login_id: 'superadmin',
        role: 'superadmin'
      }
    });
  }

  // Supabase बाट जाँच
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`login_id.eq.${login_id},username.eq.${login_id}`)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Login ID वा Password मिलेन।' });
      }

      if (user.plain_password === password || user.password === password) {
        return res.status(200).json({ success: true, user });
      } else {
        return res.status(401).json({ error: 'Login ID वा Password मिलेन।' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'डेटाबेस त्रुटि: ' + err.message });
    }
  }

  return res.status(401).json({ error: 'प्रयोगकर्ता फेला परेन।' });
};