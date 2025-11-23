-- Delete All Dummy Appointment Data
-- Run this in Supabase SQL Editor to clean up test data

-- Step 1: Check how many appointments will be deleted
SELECT COUNT(*) as total_appointments FROM appointments;

-- Step 2: Delete all appointments (CAREFUL - this deletes everything!)
DELETE FROM appointments;

-- Step 3: Verify deletion
SELECT COUNT(*) as remaining_appointments FROM appointments;

-- Optional: Reset the auto-increment ID counter
-- First, find the sequence name
SELECT pg_get_serial_sequence('appointments', 'id');

-- Then reset it (replace sequence_name with the actual name from above)
-- ALTER SEQUENCE sequence_name RESTART WITH 1;

-- OR use this universal approach:
SELECT setval(pg_get_serial_sequence('appointments', 'id'), 1, false);

-- Step 4: Check patients (optional - only delete if you want to remove test patients too)
SELECT COUNT(*) as total_patients FROM patients;

-- Optional: Delete all patients (CAREFUL!)
-- DELETE FROM patients;

-- Optional: Reset patients ID counter
-- ALTER SEQUENCE patients_id_seq RESTART WITH 1;

-- Step 5: Verify final state
SELECT 
  (SELECT COUNT(*) FROM appointments) as appointments_count,
  (SELECT COUNT(*) FROM patients) as patients_count,
  (SELECT COUNT(*) FROM interactions) as interactions_count;
