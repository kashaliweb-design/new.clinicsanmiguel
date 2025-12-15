-- Quick check: Do we have actual data in tables?
-- Run this first to see if data exists

-- Check record counts
SELECT 'patients' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments  
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'clinics', COUNT(*) FROM clinics;

-- Check if we have an active clinic (required for appointments)
SELECT id, name, active FROM clinics WHERE active = true LIMIT 1;

-- Check last 3 patients
SELECT id, first_name, last_name, phone, created_at 
FROM patients 
ORDER BY created_at DESC 
LIMIT 3;

-- Check last 3 appointments
SELECT id, patient_id, appointment_date, status, created_at 
FROM appointments 
ORDER BY created_at DESC 
LIMIT 3;
