-- DEBUG: Check why INSERT not working

-- Step 1: Check if interactions with appointment_booking exist
SELECT 
  COUNT(*) as total_booking_interactions
FROM interactions
WHERE intent = 'appointment_booking'
  AND patient_id IS NOT NULL
  AND created_at > NOW() - INTERVAL '1 hour';

-- Step 2: See the actual interactions
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  created_at
FROM interactions
WHERE intent = 'appointment_booking'
  AND patient_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Check if clinic exists
SELECT COUNT(*) as total_clinics FROM clinics;
SELECT id, name FROM clinics LIMIT 1;

-- Step 4: Test the SELECT part of INSERT (without INSERT)
SELECT 
  (SELECT id FROM clinics LIMIT 1) as clinic_id,
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '14 hours' as appointment_date,
  30 as duration_minutes,
  'General Consultation' as service_type,
  'scheduled' as status,
  'Test' as notes
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  AND i.created_at > NOW() - INTERVAL '1 hour'
LIMIT 1;

-- Step 5: If above works, try actual INSERT
-- Uncomment and run:
/*
INSERT INTO appointments (
  clinic_id,
  appointment_date,
  duration_minutes,
  service_type,
  status,
  notes
)
SELECT 
  (SELECT id FROM clinics LIMIT 1),
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '14 hours',
  30,
  'General Consultation',
  'scheduled',
  'Test from interaction'
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  AND i.created_at > NOW() - INTERVAL '1 hour'
LIMIT 1;
*/

-- Step 6: Verify
SELECT COUNT(*) FROM appointments;
