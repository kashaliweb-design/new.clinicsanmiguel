-- Create Appointments from Existing Interactions
-- This will analyze interactions with appointment_booking intent and create appointments

-- Step 1: Check interactions with appointment_booking intent
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  metadata->>'call_id' as call_id,
  created_at
FROM interactions
WHERE intent = 'appointment_booking'
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Create appointments from recent appointment_booking interactions
-- This will create appointments for all appointment_booking interactions that don't have appointments yet

INSERT INTO appointments (
  patient_id,
  clinic_id,
  appointment_date,
  appointment_time,
  reason,
  status,
  notes,
  created_at
)
SELECT 
  i.patient_id,
  (SELECT id FROM clinics LIMIT 1) as clinic_id,
  -- Default to tomorrow if no specific date mentioned
  CURRENT_DATE + INTERVAL '1 day' as appointment_date,
  -- Extract time from message or default to 10 AM
  CASE 
    WHEN i.message_body ILIKE '%2 PM%' OR i.message_body ILIKE '%2PM%' THEN '14:00:00'
    WHEN i.message_body ILIKE '%3 PM%' OR i.message_body ILIKE '%3PM%' THEN '15:00:00'
    WHEN i.message_body ILIKE '%10 AM%' OR i.message_body ILIKE '%10AM%' THEN '10:00:00'
    WHEN i.message_body ILIKE '%11 AM%' OR i.message_body ILIKE '%11AM%' THEN '11:00:00'
    WHEN i.message_body ILIKE '%1 PM%' OR i.message_body ILIKE '%1PM%' THEN '13:00:00'
    WHEN i.message_body ILIKE '%4 PM%' OR i.message_body ILIKE '%4PM%' THEN '16:00:00'
    ELSE '10:00:00'
  END as appointment_time,
  -- Extract reason or default
  CASE 
    WHEN i.message_body ILIKE '%checkup%' THEN 'General Checkup'
    WHEN i.message_body ILIKE '%consultation%' THEN 'Consultation'
    WHEN i.message_body ILIKE '%emergency%' THEN 'Emergency'
    ELSE 'General Consultation'
  END as reason,
  'scheduled' as status,
  'Created from interaction: ' || i.message_body as notes,
  i.created_at
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  -- Only create if appointment doesn't already exist for this interaction
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.patient_id = i.patient_id 
    AND a.notes ILIKE '%' || (i.metadata->>'call_id') || '%'
  )
ORDER BY i.created_at DESC
LIMIT 20;

-- Step 3: Verify appointments created
SELECT 
  a.id,
  p.first_name || ' ' || p.last_name as patient_name,
  c.name as clinic_name,
  a.appointment_date,
  a.appointment_time,
  a.reason,
  a.status,
  a.notes,
  a.created_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Step 4: Count total appointments
SELECT COUNT(*) as total_appointments FROM appointments;

-- Step 5: Show appointment_booking interactions without appointments
SELECT 
  i.id as interaction_id,
  i.patient_id,
  i.message_body,
  i.created_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = i.patient_id 
      AND a.created_at::date = i.created_at::date
    ) THEN 'Has Appointment'
    ELSE 'No Appointment'
  END as appointment_status
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
ORDER BY i.created_at DESC
LIMIT 10;
