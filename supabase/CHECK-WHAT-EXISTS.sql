-- ========================================
-- CHECK WHAT ALREADY EXISTS IN DATABASE
-- ========================================
-- Yeh query run karo to dekho kya kya already hai

-- Check all tables
SELECT 
  'Existing Tables' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if our specific tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinics') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as clinics_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as patients_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as appointments_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interactions') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as interactions_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as faqs_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'canned_responses') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as canned_responses_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_logs') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as call_logs_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') 
    THEN '✓ EXISTS' 
    ELSE '✗ NOT FOUND' 
  END as audit_logs_status;

-- Check extensions
SELECT 
  'Installed Extensions' as info,
  extname as extension_name
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- Check policies
SELECT 
  'Existing Policies' as info,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count records in each table (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinics') THEN
    RAISE NOTICE 'clinics: % records', (SELECT COUNT(*) FROM clinics);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    RAISE NOTICE 'patients: % records', (SELECT COUNT(*) FROM patients);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE NOTICE 'appointments: % records', (SELECT COUNT(*) FROM appointments);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interactions') THEN
    RAISE NOTICE 'interactions: % records', (SELECT COUNT(*) FROM interactions);
  END IF;
END $$;
