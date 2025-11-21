-- SIMPLE: Create Patients from Interactions
-- Quick way to add patients from phone numbers in interactions

-- Step 1: Check what phone numbers we have
-- First check the column name
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'interactions' AND column_name ILIKE '%phone%';

-- Check interactions data
SELECT 
  id,
  metadata,
  created_at
FROM interactions
LIMIT 5;

-- Step 2: Create patients from unique phone numbers
INSERT INTO patients (
  first_name,
  last_name,
  phone,
  created_at
)
SELECT DISTINCT ON (phone_number)
  'Patient' as first_name,
  SUBSTRING(phone_number, -4) as last_name,  -- Last 4 digits as last name
  phone_number as phone,
  MIN(created_at) as created_at
FROM interactions
WHERE phone_number IS NOT NULL
  AND phone_number != 'unknown'
  AND phone_number != ''
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.phone = interactions.phone_number
  )
GROUP BY phone_number
LIMIT 20;

-- Step 3: Check patients count
SELECT COUNT(*) FROM patients;

-- Step 4: See new patients
SELECT * FROM patients ORDER BY created_at DESC LIMIT 10;

-- Step 5: Link interactions to patients
UPDATE interactions i
SET patient_id = p.id
FROM patients p
WHERE i.phone_number = p.phone
  AND i.patient_id IS NULL;

-- Step 6: Verify
SELECT 
  COUNT(*) as total_interactions,
  COUNT(patient_id) as with_patient_id,
  COUNT(*) - COUNT(patient_id) as without_patient_id
FROM interactions;
