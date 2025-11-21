-- FIXED: Create Patients from Interactions
-- Using correct column name: from_number

-- Step 1: Check what phone numbers we have
SELECT DISTINCT
  from_number,
  COUNT(*) as call_count
FROM interactions
WHERE from_number IS NOT NULL
  AND from_number != 'unknown'
  AND from_number != 'Test User'
  AND from_number != ''
GROUP BY from_number
ORDER BY call_count DESC;

-- Step 2: Create patients from unique phone numbers
INSERT INTO patients (
  first_name,
  last_name,
  phone,
  created_at
)
SELECT DISTINCT ON (from_number)
  'Patient' as first_name,
  CASE 
    WHEN from_number ~ '^[0-9]+$' THEN SUBSTRING(from_number, -4)
    ELSE SUBSTRING(from_number, 1, 10)
  END as last_name,
  from_number as phone,
  MIN(created_at) as created_at
FROM interactions
WHERE from_number IS NOT NULL
  AND from_number != 'unknown'
  AND from_number != 'Test User'
  AND from_number != ''
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.phone = interactions.from_number
  )
GROUP BY from_number
LIMIT 20;

-- Step 3: Check patients count
SELECT COUNT(*) FROM patients;

-- Step 4: See new patients
SELECT * FROM patients ORDER BY created_at DESC LIMIT 10;

-- Step 5: Link interactions to patients
UPDATE interactions i
SET patient_id = p.id
FROM patients p
WHERE i.from_number = p.phone
  AND i.patient_id IS NULL;

-- Step 6: Verify
SELECT 
  COUNT(*) as total_interactions,
  COUNT(patient_id) as with_patient_id,
  COUNT(*) - COUNT(patient_id) as without_patient_id
FROM interactions;
