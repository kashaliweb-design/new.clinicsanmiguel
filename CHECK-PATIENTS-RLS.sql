-- Check Patients and RLS Policies

-- Step 1: Count total patients in database
SELECT COUNT(*) as total_patients FROM patients;

-- Step 2: See all patients
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  preferred_language,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 20;

-- Step 3: Check RLS policies on patients table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'patients';

-- Step 4: Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'patients';

-- Step 5: Test query as anon user (same as frontend)
SET ROLE anon;
SELECT COUNT(*) FROM patients;
SELECT * FROM patients LIMIT 5;
RESET ROLE;
