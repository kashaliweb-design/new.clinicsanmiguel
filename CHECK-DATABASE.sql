-- Check Database Tables for Data
-- Run this in Supabase SQL Editor to see what's in your database

-- 1. Check Patients Table
SELECT 
  COUNT(*) as total_patients,
  COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as today_patients
FROM patients;

-- 2. Show All Patients
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check Appointments Table
SELECT 
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as today_appointments
FROM appointments;

-- 4. Show All Appointments
SELECT 
  id,
  patient_id,
  clinic_id,
  appointment_date,
  status,
  created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check Interactions Table
SELECT 
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as today_interactions
FROM interactions;

-- 6. Show Recent Interactions
SELECT 
  id,
  patient_id,
  channel,
  direction,
  message_body,
  created_at
FROM interactions
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check if tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('patients', 'appointments', 'interactions')
ORDER BY table_name;

-- 8. Check RLS Policies (Row Level Security)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('patients', 'appointments', 'interactions')
ORDER BY tablename, policyname;
