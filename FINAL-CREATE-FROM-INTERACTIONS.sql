-- FINAL: Create appointments from interactions
-- Complete query ready to run

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
  'Created from VAPI: ' || SUBSTRING(i.message_body, 1, 100)
FROM interactions i
WHERE i.intent = 'appointment_booking'
  AND i.patient_id IS NOT NULL
  AND i.created_at > NOW() - INTERVAL '24 hours'
LIMIT 5;

-- Check total count
SELECT COUNT(*) as total_appointments FROM appointments;

-- See all appointments
SELECT 
  id,
  clinic_id,
  appointment_date,
  service_type,
  status,
  LEFT(notes, 50) as notes_preview
FROM appointments
ORDER BY appointment_date DESC;
