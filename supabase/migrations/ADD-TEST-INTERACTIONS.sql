-- ============================================
-- ADD TEST INTERACTIONS TO DATABASE
-- Run this in Supabase SQL Editor
-- ============================================

-- First, make sure you have patients (run ADD-PATIENTS-NOW.sql first if not)

-- Add some test interactions
INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'inbound',
  'What are your clinic hours?',
  'hours_inquiry',
  p.phone,
  '+14155550000',
  NOW() - INTERVAL '2 hours'
FROM patients p
WHERE p.first_name = 'John' AND p.last_name = 'Doe'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'outbound',
  'We are open Monday-Friday 9AM-5PM, Saturday 9AM-12PM. How can we help you?',
  'hours_inquiry',
  '+14155550000',
  p.phone,
  NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'
FROM patients p
WHERE p.first_name = 'John' AND p.last_name = 'Doe'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'inbound',
  'I need to schedule an appointment',
  'appointment_booking',
  p.phone,
  '+14155550000',
  NOW() - INTERVAL '1 hour'
FROM patients p
WHERE p.first_name = 'Maria' AND p.last_name = 'Garcia'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'outbound',
  'I would be happy to help you schedule an appointment. What type of service do you need?',
  'appointment_booking',
  '+14155550000',
  p.phone,
  NOW() - INTERVAL '1 hour' + INTERVAL '1 minute'
FROM patients p
WHERE p.first_name = 'Maria' AND p.last_name = 'Garcia'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'voice',
  'inbound',
  'Called to ask about insurance coverage',
  'insurance_inquiry',
  p.phone,
  '+14155550000',
  NOW() - INTERVAL '30 minutes'
FROM patients p
WHERE p.first_name = 'Sarah' AND p.last_name = 'Johnson'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'inbound',
  '¿Hablan español?',
  'language_inquiry',
  p.phone,
  '+14155550000',
  NOW() - INTERVAL '15 minutes'
FROM patients p
WHERE p.first_name = 'Carlos' AND p.last_name = 'Rodriguez'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'sms',
  'outbound',
  '¡Sí! Tenemos personal que habla español. ¿Cómo podemos ayudarle?',
  'language_inquiry',
  '+14155550000',
  p.phone,
  NOW() - INTERVAL '15 minutes' + INTERVAL '30 seconds'
FROM patients p
WHERE p.first_name = 'Carlos' AND p.last_name = 'Rodriguez'
LIMIT 1;

INSERT INTO interactions (
  patient_id,
  channel,
  direction,
  message_body,
  intent,
  from_number,
  to_number,
  created_at
) 
SELECT 
  p.id,
  'web_chat',
  'inbound',
  'Do you accept walk-ins?',
  'general_inquiry',
  NULL,
  NULL,
  NOW() - INTERVAL '5 minutes'
FROM patients p
WHERE p.first_name = 'Emily' AND p.last_name = 'Chen'
LIMIT 1;

-- Verify the interactions were added
SELECT 
  i.id,
  i.created_at,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone,
  EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
  i.channel,
  i.direction,
  i.message_body,
  i.intent
FROM interactions i
LEFT JOIN patients p ON i.patient_id = p.id
ORDER BY i.created_at DESC
LIMIT 20;

-- Check total counts
SELECT 
  'Total Interactions' as metric,
  COUNT(*) as count
FROM interactions
UNION ALL
SELECT 
  'Total Patients',
  COUNT(*)
FROM patients
UNION ALL
SELECT 
  'Total Appointments',
  COUNT(*)
FROM appointments;
