-- SIMPLE: Sirf patients add karo (columns already exist)

-- Test patients add karo
INSERT INTO patients (first_name, last_name, phone, email, date_of_birth, preferred_language, consent_sms, consent_voice) VALUES
  ('John', 'Doe', '+14155551234', 'john.doe@example.com', '1985-01-15', 'en', true, true),
  ('Maria', 'Garcia', '+14155555678', 'maria.garcia@example.com', '1990-03-20', 'es', true, true),
  ('Sarah', 'Johnson', '+14155559012', 'sarah.johnson@example.com', '1988-07-10', 'en', true, false),
  ('Carlos', 'Rodriguez', '+14155553456', 'carlos.r@example.com', '1992-11-25', 'es', true, true),
  ('Emily', 'Chen', '+14155557890', 'emily.chen@example.com', '1995-05-30', 'en', false, true)
ON CONFLICT (phone) DO NOTHING;

-- Verify: Check kitne patients add hue
SELECT COUNT(*) as total_patients FROM patients;

-- Show all patients
SELECT 
  first_name,
  last_name,
  phone,
  preferred_language,
  consent_sms,
  consent_voice,
  created_at
FROM patients
ORDER BY created_at DESC;
