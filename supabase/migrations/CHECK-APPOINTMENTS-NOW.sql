-- Check if appointments are being saved to database
-- Run this in Supabase SQL Editor

-- 1. Check total appointments count
SELECT COUNT(*) as total_appointments FROM appointments;

-- 2. Check recent appointments with patient details
SELECT 
  a.id,
  a.appointment_date,
  a.service_type,
  a.status,
  a.notes,
  a.created_at,
  p.first_name,
  p.last_name,
  p.phone,
  p.email,
  c.name as clinic_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;

-- 3. Check if there are any appointments from today
SELECT 
  a.id,
  a.appointment_date,
  a.service_type,
  a.status,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone,
  a.created_at
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
WHERE DATE(a.created_at) = CURRENT_DATE
ORDER BY a.created_at DESC;

-- 4. Check appointments by status
SELECT 
  status,
  COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 5. Check if there are any NULL values causing issues
SELECT 
  COUNT(*) as total,
  COUNT(patient_id) as has_patient,
  COUNT(clinic_id) as has_clinic,
  COUNT(appointment_date) as has_date,
  COUNT(service_type) as has_service
FROM appointments;

-- 6. Check for any appointments with missing patient or clinic
SELECT 
  a.id,
  a.patient_id,
  a.clinic_id,
  a.appointment_date,
  a.status,
  CASE WHEN p.id IS NULL THEN 'MISSING PATIENT' ELSE 'OK' END as patient_status,
  CASE WHEN c.id IS NULL THEN 'MISSING CLINIC' ELSE 'OK' END as clinic_status
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;
