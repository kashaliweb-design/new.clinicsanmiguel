-- STEP 1: First check what columns exist in your patients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- STEP 2: Add missing columns (if they don't exist)
-- Run these one by one and ignore errors if column already exists

ALTER TABLE patients ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE patients ADD COLUMN consent_sms BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN consent_voice BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN date_of_birth DATE;

-- STEP 3: Now add simple test patients (only required fields)
INSERT INTO patients (first_name, last_name, phone) VALUES
  ('John', 'Doe', '+14155551234'),
  ('Maria', 'Garcia', '+14155555678'),
  ('Sarah', 'Johnson', '+14155559012'),
  ('Carlos', 'Rodriguez', '+14155553456'),
  ('Emily', 'Chen', '+14155557890')
ON CONFLICT (phone) DO NOTHING;

-- STEP 4: Update with extra info (if columns exist)
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

-- STEP 5: Check if data was added
SELECT 
  first_name,
  last_name,
  phone,
  CASE WHEN date_of_birth IS NOT NULL THEN 'Yes' ELSE 'No' END as has_dob,
  created_at
FROM patients
ORDER BY created_at DESC;

-- STEP 6: Count total patients
SELECT COUNT(*) as total_patients FROM patients;
