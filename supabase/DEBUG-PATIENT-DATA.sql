-- Debug: Check if patient data exists in database
-- Run this in Supabase SQL Editor

-- 1. Check if ANY patients exist in database
SELECT COUNT(*) as total_patients FROM sanmiguel_patients;

-- 2. Check recent patients (last 30 minutes)
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM sanmiguel_patients
WHERE created_at > NOW() - INTERVAL '30 minutes'
ORDER BY created_at DESC;

-- 3. Check if Kashif patient exists
SELECT * FROM sanmiguel_patients 
WHERE first_name ILIKE '%kashif%' 
OR last_name ILIKE '%kashif%'
OR phone LIKE '%kashif%'
ORDER BY created_at DESC;

-- 4. Check all patients (limit 10)
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM sanmiguel_patients
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check recent interactions to see if booking happened
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  created_at
FROM sanmiguel_interactions
WHERE created_at > NOW() - INTERVAL '30 minutes'
AND (intent LIKE '%book%' OR message_body LIKE '%appointment%')
ORDER BY created_at DESC;
