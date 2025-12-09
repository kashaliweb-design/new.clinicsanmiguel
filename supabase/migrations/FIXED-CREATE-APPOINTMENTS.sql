-- FIXED: Create Appointments from Interactions
-- Using correct column names from appointments table

-- Step 1: Check what interactions we have
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

-- Step 2: Create appointments with CORRECT columns
INSERT INTO appointments (
  clinic_id,
  appointment_date,  -- This is timestamp (date + time combined)
  duration_minutes,
  service_type,
  status,
  notes
)
SELECT 
  (SELECT id FROM clinics LIMIT 1) as clinic_id,
  -- Combine date and time into timestamp
  CASE 
    WHEN i.message_body ILIKE '%2 PM%' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '14 hours'
    WHEN i.message_body ILIKE '%3 PM%' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '15 hours'
    WHEN i.message_body ILIKE '%10 AM%' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '10 hours'
    WHEN i.message_body ILIKE '%11 AM%' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '11 hours'
    WHEN i.message_body ILIKE '%1 PM%' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '13 hours'
    ELSE 
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '10 hours'
  END as appointment_date,
  30 as duration_minutes,  -- Default 30 minutes
  CASE 
    WHEN i.message_body ILIKE '%checkup%' THEN 'General Checkup'
    WHEN i.message_body ILIKE '%consultation%' THEN 'Consultation'
    WHEN i.message_body ILIKE '%emergency%' THEN 'Emergency'
    ELSE 'General Consultation'
  END as service_type,
  'scheduled' as status,
  'Created from VAPI call: ' || SUBSTRING(i.message_body, 1, 200) as notes
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  AND i.created_at > NOW() - INTERVAL '1 hour'
  -- Avoid duplicates
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.notes ILIKE '%VAPI call%'
    AND a.appointment_date::date = (CURRENT_DATE + INTERVAL '1 day')::date
  );

-- Step 3: Verify appointments created
SELECT 
  a.id,
  a.clinic_id,
  a.appointment_date,
  a.duration_minutes,
  a.service_type,
  a.status,
  LEFT(a.notes, 50) as notes_preview
FROM appointments a
ORDER BY a.appointment_date DESC
LIMIT 10;

-- Step 4: Count total
SELECT COUNT(*) as total_appointments FROM appointments;

-- Step 5: Check with clinic and patient names
SELECT 
  a.id,
  c.name as clinic_name,
  a.appointment_date,
  a.service_type,
  a.status
FROM appointments a
LEFT JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.appointment_date DESC
LIMIT 10;
