-- १. प्रयोगकर्ता (Staff / Superadmin) टेबल
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    designation TEXT DEFAULT 'प्राविधिक',
    phone TEXT,
    email TEXT,
    login_id TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'STAFF' CHECK (role IN ('SUPERADMIN', 'STAFF')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- २. नक्सा दर्ता अभिलेख (Records) टेबल
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year TEXT NOT NULL,
    patra_no TEXT,
    darta_no TEXT NOT NULL,
    cert_no TEXT,
    darta_date TEXT NOT NULL,
    landowner_name TEXT NOT NULL,
    landowner_cit TEXT,
    homeowner_name TEXT NOT NULL,
    homeowner_cit TEXT,
    sabik_address TEXT,
    ward TEXT NOT NULL,
    kitta TEXT NOT NULL,
    land_area TEXT,
    approved_area TEXT,
    land_use TEXT,
    east TEXT,
    west TEXT,
    north TEXT,
    south TEXT,
    building_class TEXT,
    struct_system TEXT,
    completion_date TEXT,
    height_floor TEXT,
    plinth_area TEXT,
    total_area TEXT,
    floor_details JSONB DEFAULT '{}'::jsonb,
    road_distance TEXT,
    electric_distance TEXT,
    river_distance TEXT,
    septic_tank TEXT,
    decision_date TEXT,
    eng1_name TEXT,
    eng1_role TEXT,
    eng2_name TEXT,
    eng2_role TEXT,
    officer_name TEXT,
    relation TEXT,
    phone TEXT,
    photo_url TEXT,
    is_temporary BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_by_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ३. अडिट लग (Audit Logs) टेबल
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    performed_by TEXT NOT NULL,
    role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    target_user TEXT
);

-- प्रारम्भिक Superadmin खाता (पासवर्ड: Admin@2083)
INSERT INTO public.users (full_name, designation, phone, email, login_id, password_hash, role, status)
VALUES (
    'सुपर एडमिन (कार्यालय प्रमुख)',
    'प्रमुख प्रशासकीय अधिकृत',
    '९८५७०१६९३९',
    'admin@mayadevimunrupandehi.gov.np',
    'superadmin',
    'Admin@2083',
    'SUPERADMIN',
    'ACTIVE'
) ON CONFLICT (login_id) DO NOTHING;