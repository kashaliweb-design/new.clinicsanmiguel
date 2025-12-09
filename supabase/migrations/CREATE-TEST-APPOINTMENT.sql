-- Create Test Appointment
-- Run this in Supabase SQL Editor to test if dashboard shows appointments

-- Step 1: Check if patients and clinics exist
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_clinics FROM clinics;

-- Step 2: Show available patients
SELECT id, first_name, last_name, phone FROM patients ORDER BY created_at DESC LIMIT 5;

-- Step 3: Show available clinics
SELECT id, name FROM clinics LIMIT 5;

-- Step 4: Create a test appointment
-- Replace patient_id and clinic_id with actual IDs from above queries
INSERT INTO appointments (
  patient_id,
  clinic_id,
  appointment_date,
  appointment_time,
  reason,
  status,
  notes,
  created_at
) VALUES (
  (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1), -- Latest patient
  (SELECT id FROM clinics LIMIT 1), -- First clinic
  CURRENT_DATE + INTERVAL '1 day', -- Tomorrow
  '10:00:00', -- 10 AM
  'General Consultation',
  'scheduled',
  'Test appointment created via SQL',
  NOW()
);

-- Step 5: Verify appointment created
SELECT 
  a.id,
  p.first_name || ' ' || p.last_name as patient_name,
  c.name as clinic_name,
  a.appointment_date,
  a.appointment_time,
  a.reason,
  a.status,
  a.created_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 5;

-- Step 6: Check total count
SELECT COUNT(*) as total_appointments FROM appointments;

-- Step 7: Create multiple test appointments if needed
INSERT INTO appointments (patient_id, clinic_id, appointment_date, appointment_time, reason, status)
SELECT 
  (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM clinics LIMIT 1),
  CURRENT_DATE + (n || ' days')::interval,
  '10:00:00',
  'Test Appointment ' || n,
  'scheduled'
FROM generate_series(1, 5) as n;

-- Step 8: Final verification
SELECT 
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM appointments;
