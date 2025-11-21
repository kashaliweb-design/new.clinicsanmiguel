-- Check if webhook is creating interactions with end-of-call-report

-- Check recent interactions
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  metadata->>'event' as event_type,
  metadata->>'call_id' as call_id,
  created_at
FROM interactions
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 10;

-- Check if any end-of-call-report events exist
SELECT 
  COUNT(*) as total_end_of_call_reports,
  COUNT(CASE WHEN intent = 'appointment_booking' THEN 1 END) as appointment_booking_intents
FROM interactions
WHERE metadata->>'event' = 'end-of-call-report'
AND created_at > NOW() - INTERVAL '1 hour';

-- Check if patients are being created
SELECT 
  COUNT(*) as total_patients,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '10 minutes' THEN 1 END) as recent_patients
FROM patients;

-- Check the latest interaction details
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  metadata
FROM interactions
ORDER BY created_at DESC
LIMIT 1;
