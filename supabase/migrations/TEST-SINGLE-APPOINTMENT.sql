-- TEST: Create ONE Simple Appointment
-- Run this step by step

-- Step 1: Check if clinics exist
SELECT id, name FROM clinics LIMIT 1;

-- Step 2: Create ONE test appointment (RUN THIS!)
INSERT INTO appointments (
  clinic_id,
  appointment_date,
  status,
  notes
)
VALUES (
  (SELECT id FROM clinics LIMIT 1),
  CURRENT_TIMESTAMP + INTERVAL '1 day',
  'scheduled',
  'Test appointment'
);

-- Step 3: Check if it was created
SELECT COUNT(*) as total FROM appointments;

-- Step 4: See the appointment
SELECT 
  id,
  clinic_id,
  appointment_date,
  status,
  notes
FROM appointments
ORDER BY appointment_date DESC
LIMIT 5;
