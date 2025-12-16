-- ========================================
-- CHECK APPOINTMENTS IN DATABASE
-- ========================================
-- Run this in Supabase SQL Editor to see appointments

-- Check all appointments
SELECT 
  id,
  patient_id,
  clinic_id,
  appointment_date,
  service_type,
  status,
  confirmation_code,
  notes,
  created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 20;

-- Check with patient details
SELECT 
  a.id,
  a.appointment_date,
  a.service_type,
  a.status,
  a.confirmation_code,
  p.first_name,
  p.last_name,
  p.phone,
  c.name as clinic_name,
  a.created_at
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 20;

-- Count appointments
SELECT 
  status,
  COUNT(*) as count
FROM appointments
GROUP BY status;

-- Check recent patients
SELECT 
  id,
  first_name,
  last_name,
  phone,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 10;

-- Check if clinic exists
SELECT 
  id,
  name,
  active
FROM clinics
WHERE active = true;
