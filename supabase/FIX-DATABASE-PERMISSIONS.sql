-- FIX DATABASE PERMISSIONS FOR DATA INSERTION
-- Run this in your Supabase SQL Editor to fix RLS policies

-- Step 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'interactions', 'clinics');

-- Step 2: Drop all existing conflicting policies
DROP POLICY IF EXISTS "Public read clinics" ON clinics;
DROP POLICY IF EXISTS "Public read faqs" ON faqs;
DROP POLICY IF EXISTS "Service role full access clinics" ON clinics;
DROP POLICY IF EXISTS "Service role full access patients" ON patients;
DROP POLICY IF EXISTS "Service role full access appointments" ON appointments;
DROP POLICY IF EXISTS "Service role full access interactions" ON interactions;
DROP POLICY IF EXISTS "Service role full access faqs" ON faqs;
DROP POLICY IF EXISTS "Service role full access canned_responses" ON canned_responses;
DROP POLICY IF EXISTS "Service role full access call_logs" ON call_logs;
DROP POLICY IF EXISTS "Service role full access audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON interactions;

-- Step 3: Create proper policies that work with service role key
-- These policies allow authenticated service role to do everything

-- CLINICS table policies
CREATE POLICY "Allow service role all access" ON clinics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon read clinics" ON clinics
  FOR SELECT
  TO anon
  USING (active = true);

-- PATIENTS table policies
CREATE POLICY "Allow service role all access" ON patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- APPOINTMENTS table policies
CREATE POLICY "Allow service role all access" ON appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- INTERACTIONS table policies
CREATE POLICY "Allow service role all access" ON interactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FAQS table policies
CREATE POLICY "Allow service role all access" ON faqs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon read faqs" ON faqs
  FOR SELECT
  TO anon
  USING (active = true);

-- CANNED_RESPONSES table policies
CREATE POLICY "Allow service role all access" ON canned_responses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CALL_LOGS table policies
CREATE POLICY "Allow service role all access" ON call_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AUDIT_LOGS table policies
CREATE POLICY "Allow service role all access" ON audit_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 4: Verify policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('patients', 'appointments', 'interactions', 'clinics', 'faqs')
ORDER BY tablename, policyname;

-- Step 5: Test data insertion (this should work now)
-- Uncomment to test:
-- INSERT INTO patients (first_name, last_name, phone, consent_sms) 
-- VALUES ('Test', 'Patient', '+1234567890', true);

-- Step 6: Check if data exists
SELECT 'patients' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'clinics', COUNT(*) FROM clinics;
