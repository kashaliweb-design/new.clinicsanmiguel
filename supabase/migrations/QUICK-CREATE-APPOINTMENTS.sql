-- QUICK: Create Appointments from appointment_booking Interactions
-- Run this in Supabase SQL Editor

-- Step 1: See what we have
SELECT 
  id,
  patient_id,
  message_body,
  created_at
FROM interactions
WHERE intent = 'appointment_booking'
  AND patient_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Create appointments (RUN THIS!)
INSERT INTO appointments (
  patient_id,
  clinic_id,
  appointment_date,
  appointment_time,
  reason,
  status,
  notes
)
SELECT 
  i.patient_id,
  (SELECT id FROM clinics LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day', -- Tomorrow
  CASE 
    WHEN i.message_body ILIKE '%2 PM%' THEN '14:00:00'
    WHEN i.message_body ILIKE '%3 PM%' THEN '15:00:00'
    WHEN i.message_body ILIKE '%10 AM%' THEN '10:00:00'
    ELSE '10:00:00'
  END,
  'General Consultation',
  'scheduled',
  'Created from VAPI call: ' || SUBSTRING(i.message_body, 1, 100)
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  AND i.created_at > NOW() - INTERVAL '1 hour'
  -- Don't create duplicates
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.patient_id = i.patient_id 
    AND a.created_at > NOW() - INTERVAL '1 hour'
  );

-- Step 3: Check results
SELECT COUNT(*) as total_appointments FROM appointments;

SELECT 
  a.*,
  p.first_name || ' ' || p.last_name as patient_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
ORDER BY a.created_at DESC
LIMIT 5;
