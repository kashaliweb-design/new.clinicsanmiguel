-- Add Test Data to See in Admin Dashboard
-- Run this AFTER running fix-patients-table.sql

-- Add test patients (basic version - works with minimal columns)
INSERT INTO patients (first_name, last_name, phone, email) VALUES
  ('John', 'Doe', '+14155551234', 'john.doe@example.com'),
  ('Maria', 'Garcia', '+14155555678', 'maria.garcia@example.com'),
  ('Sarah', 'Johnson', '+14155559012', 'sarah.johnson@example.com'),
  ('Carlos', 'Rodriguez', '+14155553456', 'carlos.r@example.com'),
  ('Emily', 'Chen', '+14155557890', 'emily.chen@example.com')
ON CONFLICT (phone) DO NOTHING;

-- Update with additional fields if columns exist
UPDATE patients SET 
  date_of_birth = '1985-01-15',
  preferred_language = 'en',
  consent_sms = true,
  consent_voice = true
WHERE phone = '+14155551234';

UPDATE patients SET 
  date_of_birth = '1990-03-20',
  preferred_language = 'es',
  consent_sms = true,
  consent_voice = true
WHERE phone = '+14155555678';

UPDATE patients SET 
  date_of_birth = '1988-07-10',
  preferred_language = 'en',
  consent_sms = true,
  consent_voice = false
WHERE phone = '+14155559012';

UPDATE patients SET 
  date_of_birth = '1992-11-25',
  preferred_language = 'es',
  consent_sms = true,
  consent_voice = true
WHERE phone = '+14155553456';

UPDATE patients SET 
  date_of_birth = '1995-05-30',
  preferred_language = 'en',
  consent_sms = false,
  consent_voice = true
WHERE phone = '+14155557890';

-- Add test appointments
INSERT INTO appointments (patient_id, clinic_id, appointment_date, duration_minutes, service_type, status, confirmation_code)
SELECT 
  p.id,
  c.id,
  NOW() + INTERVAL '3 days',
  30,
  'General Checkup',
  'scheduled',
  'ABC' || FLOOR(RANDOM() * 1000)::TEXT
FROM patients p
CROSS JOIN clinics c
WHERE p.phone = '+14155551234'
LIMIT 1;

INSERT INTO appointments (patient_id, clinic_id, appointment_date, duration_minutes, service_type, status, confirmation_code)
SELECT 
  p.id,
  c.id,
  NOW() + INTERVAL '5 days',
  45,
  'Lab Services',
  'confirmed',
  'XYZ' || FLOOR(RANDOM() * 1000)::TEXT
FROM patients p
CROSS JOIN clinics c
WHERE p.phone = '+14155555678'
LIMIT 1;

-- Add test interactions
INSERT INTO interactions (session_id, patient_id, channel, direction, from_number, to_number, message_body, intent)
SELECT 
  'session_' || gen_random_uuid()::TEXT,
  p.id,
  'sms',
  'inbound',
  p.phone,
  '+14155551000',
  'What time are you open today?',
  'clinic_hours'
FROM patients p
WHERE p.phone = '+14155551234';

INSERT INTO interactions (session_id, patient_id, channel, direction, from_number, to_number, message_body, intent)
SELECT 
  'session_' || gen_random_uuid()::TEXT,
  p.id,
  'voice',
  'inbound',
  p.phone,
  '+14155551000',
  'Voice call - appointment inquiry',
  'appointment_booking'
FROM patients p
WHERE p.phone = '+14155555678';

-- Verify the data
SELECT 'Patients Added' as info, COUNT(*) as count FROM patients
UNION ALL
SELECT 'Appointments Added', COUNT(*) FROM appointments
UNION ALL
SELECT 'Interactions Added', COUNT(*) FROM interactions;

-- Show sample data
SELECT 
  'Sample Patient' as type,
  first_name || ' ' || last_name as name,
  phone,
  preferred_language as language
FROM patients
LIMIT 3;
