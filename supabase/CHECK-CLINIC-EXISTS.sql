-- Check if clinic exists (REQUIRED for appointments to work)
-- Run this in Supabase SQL Editor

-- 1. Check if any clinic exists
SELECT * FROM sanmiguel_clinics WHERE active = true;

-- 2. If no clinic exists, insert one
INSERT INTO sanmiguel_clinics (name, address, phone, email, timezone, active, services)
VALUES (
  'SanMiguel Clinic',
  '123 Main Street, San Miguel',
  '+1-555-0100',
  'contact@sanmiguelclinic.com',
  'America/Los_Angeles',
  true,
  ARRAY['General Consultation', 'Dental', 'Pediatrics', 'Vaccination']
)
ON CONFLICT DO NOTHING
RETURNING *;

-- 3. Verify clinic exists
SELECT id, name, active FROM sanmiguel_clinics;

-- 4. Check if any appointments exist
SELECT COUNT(*) as appointment_count FROM sanmiguel_appointments;

-- 5. Check recent interactions (to see if booking was attempted)
SELECT 
  id,
  session_id,
  patient_id,
  intent,
  message_body,
  created_at
FROM sanmiguel_interactions
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check if patient was created
SELECT * FROM sanmiguel_patients
ORDER BY created_at DESC
LIMIT 3;
