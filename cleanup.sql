-- ७ दिन नाघेका अस्थायी ड्राफ्ट रेकर्डहरू स्वतः मेटाउने प्रक्रिया
CREATE OR REPLACE FUNCTION delete_expired_temporary_records()
RETURNS void AS $$
BEGIN
    DELETE FROM public.records
    WHERE is_temporary = TRUE
      AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Supabase pg_cron एक्सटेन्सन सक्रिय गर्ने र प्रत्येक राति २ बजे चलाउने
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'nightly-7-day-cleanup',
    '0 2 * * *',
    $$ SELECT delete_expired_temporary_records(); $$
);