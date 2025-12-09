-- Fix RLS Error: Policy Already Exists
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;

DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON appointments;

-- Step 2: Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies for PATIENTS
CREATE POLICY "Enable read access for all users" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patients
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON patients
  FOR DELETE USING (true);

-- Step 4: Create new policies for APPOINTMENTS
CREATE POLICY "Enable read access for all users" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON appointments
  FOR DELETE USING (true);

-- Step 5: Verify policies created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('patients', 'appointments')
ORDER BY tablename, policyname;

-- Step 6: Test data access
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_appointments FROM appointments;
