-- Seed data for SanMiguel Connect AI
-- Phase 0 & 1: Development and testing data

-- Insert clinics
INSERT INTO clinics (id, name, address, phone, email, hours, services, timezone) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'SanMiguel Downtown Clinic',
    '123 Main Street, San Miguel, CA 94000',
    '+14155551000',
    'downtown@sanmiguel.health',
    '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-17:00", "saturday": "9:00-13:00", "sunday": "closed"}',
    ARRAY['General Practice', 'Pediatrics', 'Lab Services', 'Vaccinations'],
    'America/Los_Angeles'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'SanMiguel North Clinic',
    '456 Oak Avenue, San Miguel, CA 94001',
    '+14155551001',
    'north@sanmiguel.health',
    '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-16:00", "saturday": "closed", "sunday": "closed"}',
    ARRAY['Family Medicine', 'Women''s Health', 'Mental Health'],
    'America/Los_Angeles'
  );

-- Insert patients
INSERT INTO patients (id, first_name, last_name, phone, email, date_of_birth, preferred_language, consent_sms, consent_voice) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Maria',
    'Garcia',
    '+14155552001',
    'maria.garcia@example.com',
    '1985-03-15',
    'es',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'John',
    'Smith',
    '+14155552002',
    'john.smith@example.com',
    '1990-07-22',
    'en',
    true,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Lisa',
    'Chen',
    '+14155552003',
    'lisa.chen@example.com',
    '1978-11-08',
    'en',
    true,
    false
  );

-- Insert appointments
INSERT INTO appointments (id, patient_id, clinic_id, appointment_date, duration_minutes, service_type, status, confirmation_code) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '3 days',
    30,
    'General Checkup',
    'scheduled',
    'ABC123'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '5 days',
    45,
    'Lab Services',
    'confirmed',
    'XYZ789'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    NOW() + INTERVAL '7 days',
    60,
    'Mental Health Consultation',
    'scheduled',
    'MNO456'
  );

-- Insert FAQs
INSERT INTO faqs (question, answer, category, language, keywords) VALUES
  (
    'What are your clinic hours?',
    'Our Downtown clinic is open Monday-Friday 8am-6pm, Saturday 9am-1pm. Our North clinic is open Monday-Friday 9am-5pm. We are closed on Sundays.',
    'Hours',
    'en',
    ARRAY['hours', 'open', 'schedule', 'time']
  ),
  (
    '¿Cuáles son los horarios de la clínica?',
    'Nuestra clínica del centro está abierta de lunes a viernes de 8am a 6pm, sábados de 9am a 1pm. Nuestra clínica del norte está abierta de lunes a viernes de 9am a 5pm. Estamos cerrados los domingos.',
    'Hours',
    'es',
    ARRAY['horarios', 'abierto', 'horario']
  ),
  (
    'How do I schedule an appointment?',
    'You can schedule an appointment by calling us, texting us, or using our online chat. We''ll help you find a convenient time.',
    'Appointments',
    'en',
    ARRAY['schedule', 'appointment', 'book', 'make appointment']
  ),
  (
    'Do you accept walk-ins?',
    'We accept walk-ins based on availability, but we recommend scheduling an appointment to minimize wait times.',
    'Appointments',
    'en',
    ARRAY['walk-in', 'walk in', 'without appointment']
  ),
  (
    'What services do you offer?',
    'We offer General Practice, Pediatrics, Family Medicine, Women''s Health, Mental Health, Lab Services, and Vaccinations. Contact us for specific service availability at each location.',
    'Services',
    'en',
    ARRAY['services', 'treatment', 'care', 'what do you do']
  ),
  (
    'Where are you located?',
    'We have two locations: Downtown Clinic at 123 Main Street, and North Clinic at 456 Oak Avenue, both in San Miguel, CA.',
    'Location',
    'en',
    ARRAY['location', 'address', 'where', 'directions']
  ),
  (
    'How can I cancel or reschedule my appointment?',
    'You can cancel or reschedule by calling us, texting us, or through our chat. Please provide at least 24 hours notice when possible.',
    'Appointments',
    'en',
    ARRAY['cancel', 'reschedule', 'change appointment']
  );

-- Insert canned responses
INSERT INTO canned_responses (title, content, category, language) VALUES
  (
    'Greeting',
    'Hello! I''m the SanMiguel Connect AI assistant. How can I help you today?',
    'Greeting',
    'en'
  ),
  (
    'Greeting Spanish',
    '¡Hola! Soy el asistente de IA de SanMiguel Connect. ¿Cómo puedo ayudarte hoy?',
    'Greeting',
    'es'
  ),
  (
    'Appointment Confirmed',
    'Your appointment has been confirmed! You''ll receive a reminder 24 hours before your visit.',
    'Appointment',
    'en'
  ),
  (
    'Transfer to Human',
    'Let me connect you with one of our staff members who can better assist you. Please hold for a moment.',
    'Escalation',
    'en'
  ),
  (
    'Hours Info',
    'Our clinic hours vary by location. Downtown: Mon-Fri 8am-6pm, Sat 9am-1pm. North: Mon-Fri 9am-5pm. How else can I help?',
    'Information',
    'en'
  );

-- Insert sample interactions
INSERT INTO interactions (session_id, patient_id, channel, direction, from_number, to_number, message_body, intent) VALUES
  (
    'session_001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'sms',
    'inbound',
    '+14155552001',
    '+14155551000',
    'What time are you open?',
    'hours_inquiry'
  ),
  (
    'session_001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'sms',
    'outbound',
    '+14155551000',
    '+14155552001',
    'Our Downtown clinic is open Monday-Friday 8am-6pm, Saturday 9am-1pm. Our North clinic is open Monday-Friday 9am-5pm. We are closed on Sundays.',
    'hours_response'
  );
