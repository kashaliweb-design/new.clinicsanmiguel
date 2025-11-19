-- Clear Dummy Patient Data
-- Run this in Supabase SQL Editor

-- Step 1: Check current patients
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM patients
ORDER BY created_at DESC;

-- Step 2: Delete dummy patients (the test data)
-- These are the patients with specific test phone numbers
DELETE FROM patients 
WHERE phone IN (
  '+14155551234',  -- John Doe
  '+14155555678',  -- Maria Garcia
  '+14155559012',  -- Sarah Johnson
  '+14155553456',  -- Carlos Rodriguez
  '+14155557890'   -- Emily Chen
);

-- Step 3: Verify deletion
SELECT COUNT(*) as remaining_patients FROM patients;

-- Step 4: Show remaining patients
SELECT 
  first_name,
  last_name,
  phone,
  created_at
FROM patients
ORDER BY created_at DESC;

-- Note: This will also delete any interactions and appointments 
-- associated with these patients due to foreign key constraints
