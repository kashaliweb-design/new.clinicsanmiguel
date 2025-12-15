-- Test if database has any data and if tables exist
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if prefixed tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'sanmiguel_%'
ORDER BY table_name;

-- 2. Check record counts in prefixed tables
SELECT 'sanmiguel_clinics' as table_name, COUNT(*) as count FROM sanmiguel_clinics
UNION ALL
SELECT 'sanmiguel_patients', COUNT(*) FROM sanmiguel_patients
UNION ALL
SELECT 'sanmiguel_appointments', COUNT(*) FROM sanmiguel_appointments
UNION ALL
SELECT 'sanmiguel_interactions', COUNT(*) FROM sanmiguel_interactions;

-- 3. Check if clinic exists (REQUIRED for appointments)
SELECT id, name, active FROM sanmiguel_clinics WHERE active = true;

-- 4. Check RLS policies on prefixed tables
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies
WHERE tablename LIKE 'sanmiguel_%'
ORDER BY tablename, policyname;

-- 5. Test insert into patients (this should work)
-- Uncomment to test:
-- INSERT INTO sanmiguel_patients (first_name, last_name, phone, consent_sms)
-- VALUES ('Test', 'Patient', '+1234567890', true)
-- RETURNING *;
