-- Check if appointments are being created
-- Run this in Supabase SQL Editor

-- 1. Check total appointments
SELECT COUNT(*) as total_appointments FROM sanmiguel_appointments;

-- 2. Check recent appointments (if any)
SELECT 
  a.id,
  a.patient_id,
  a.clinic_id,
  a.appointment_date,
  a.service_type,
  a.status,
  a.confirmation_code,
  a.created_at,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  c.name as clinic_name
FROM sanmiguel_appointments a
LEFT JOIN sanmiguel_patients p ON a.patient_id = p.id
LEFT JOIN sanmiguel_clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;

-- 3. Check recent patients (to see if patient was created)
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM sanmiguel_patients
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check recent interactions (to see booking intent)
SELECT 
  id,
  session_id,
  patient_id,
  channel,
  direction,
  intent,
  message_body,
  metadata,
  created_at
FROM sanmiguel_interactions
WHERE intent LIKE '%book%' OR message_body LIKE '%book%'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check all interactions from last 10 minutes
SELECT 
  id,
  session_id,
  patient_id,
  intent,
  LEFT(message_body, 100) as message_preview,
  created_at
FROM sanmiguel_interactions
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
