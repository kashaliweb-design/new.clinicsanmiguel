-- Check actual data in database tables
-- Run this in Supabase SQL Editor to see what data exists

-- 1. Check if tables have data
SELECT 'patients' as table_name, COUNT(*) as total_records FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'clinics', COUNT(*) FROM clinics;

-- 2. Check RLS status on tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'interactions', 'clinics')
ORDER BY tablename;

-- 3. Check existing RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('patients', 'appointments', 'interactions', 'clinics')
ORDER BY tablename, policyname;

-- 4. Sample data from each table (last 5 records)
SELECT 'PATIENTS - Last 5 records:' as info;
SELECT id, first_name, last_name, phone, created_at 
FROM patients 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'APPOINTMENTS - Last 5 records:' as info;
SELECT id, patient_id, appointment_date, status, confirmation_code, created_at 
FROM appointments 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'INTERACTIONS - Last 5 records:' as info;
SELECT id, channel, direction, message_body, created_at 
FROM interactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check if there are any foreign key constraint issues
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'
AND conrelid::regclass::text IN ('appointments', 'interactions')
ORDER BY table_name;
