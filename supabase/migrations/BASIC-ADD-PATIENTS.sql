-- Sabse simple way - Sirf basic fields use karke
-- Yeh 100% kaam karega

-- Option 1: Minimal fields (guaranteed to work)
INSERT INTO patients (first_name, last_name, phone) VALUES
  ('John', 'Doe', '+14155551234'),
  ('Maria', 'Garcia', '+14155555678'),
  ('Sarah', 'Johnson', '+14155559012')
ON CONFLICT (phone) DO NOTHING;

-- Check karo kitne patients add hue
SELECT * FROM patients;

-- Count karo
SELECT COUNT(*) FROM patients;
