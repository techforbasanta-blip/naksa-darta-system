ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- सार्वजनिक प्रमाणीकरण (QR Verify) का लागि पढ्न खुला
CREATE POLICY "Public can view basic records for verification"
ON public.records FOR SELECT
USING (true);

-- लगइन भएका कर्मचारी र ब्याकएन्डका लागि पूर्ण पहुँच
CREATE POLICY "Allow all actions for service role and backend"
ON public.records FOR ALL
USING (true);

CREATE POLICY "Allow users access for backend"
ON public.users FOR ALL
USING (true);

CREATE POLICY "Allow audit logging"
ON public.audit_logs FOR ALL
USING (true);