-- Create Patients from Interactions
-- Extract patient details from interaction messages and create patient records

-- Step 1: Check current patients count
SELECT COUNT(*) as total_patients FROM patients;

-- Step 2: See interactions that could become patients
SELECT 
  id,
  phone_number,
  message_body,
  metadata,
  created_at
FROM interactions
WHERE phone_number IS NOT NULL
  AND phone_number != 'unknown'
  AND phone_number != ''
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Create patients from interactions with phone numbers
INSERT INTO patients (
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  created_at
)
SELECT DISTINCT ON (i.phone_number)
  -- Extract first name from message or use 'Patient'
  CASE 
    WHEN i.message_body ILIKE '%my name is%' THEN 
      SPLIT_PART(SUBSTRING(i.message_body FROM 'my name is ([A-Za-z]+)'), ' ', 1)
    WHEN i.metadata->>'caller_name' IS NOT NULL THEN 
      SPLIT_PART(i.metadata->>'caller_name', ' ', 1)
    ELSE 'Patient'
  END as first_name,
  
  -- Extract last name or use phone number
  CASE 
    WHEN i.message_body ILIKE '%my name is%' THEN 
      SPLIT_PART(SUBSTRING(i.message_body FROM 'my name is ([A-Za-z ]+)'), ' ', 2)
    WHEN i.metadata->>'caller_name' IS NOT NULL THEN 
      SPLIT_PART(i.metadata->>'caller_name', ' ', 2)
    ELSE SUBSTRING(i.phone_number, -4)
  END as last_name,
  
  i.phone_number as phone,
  
  -- Extract email if mentioned
  CASE 
    WHEN i.message_body ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' THEN
      (regexp_matches(i.message_body, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'))[1]
    ELSE NULL
  END as email,
  
  NULL as date_of_birth,
  i.created_at
FROM interactions i
WHERE i.phone_number IS NOT NULL
  AND i.phone_number != 'unknown'
  AND i.phone_number != ''
  -- Don't create duplicate patients
  AND NOT EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.phone = i.phone_number
  )
ORDER BY i.phone_number, i.created_at DESC
LIMIT 20;

-- Step 4: Verify patients created
SELECT COUNT(*) as total_patients FROM patients;

-- Step 5: See new patients
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 10;

-- Step 6: Update existing interactions with patient_id
UPDATE interactions i
SET patient_id = p.id
FROM patients p
WHERE i.phone_number = p.phone
  AND i.patient_id IS NULL;

-- Step 7: Verify update
SELECT 
  COUNT(*) as interactions_with_patient_id
FROM interactions
WHERE patient_id IS NOT NULL;
