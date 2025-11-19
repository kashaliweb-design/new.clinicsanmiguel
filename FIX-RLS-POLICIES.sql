-- Fix Row Level Security (RLS) Policies
-- This is likely why patients and appointments show 0

-- IMPORTANT: Run these commands in Supabase SQL Editor

-- 1. Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'interactions');

-- 2. DISABLE RLS temporarily to test (OPTION 1 - Quick Test)
-- Uncomment these lines to disable RLS:
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;

-- 3. OR Enable RLS with proper policies (OPTION 2 - Recommended)

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
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

-- Create new policies for PATIENTS table
CREATE POLICY "Enable read access for all users" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patients
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON patients
  FOR DELETE USING (true);

-- Create new policies for APPOINTMENTS table
CREATE POLICY "Enable read access for all users" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON appointments
  FOR DELETE USING (true);

-- Create new policies for INTERACTIONS table
CREATE POLICY "Enable read access for all users" ON interactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON interactions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON interactions
  FOR DELETE USING (true);

-- 4. Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('patients', 'appointments', 'interactions')
ORDER BY tablename, policyname;

-- 5. Test queries after fixing RLS
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as total_interactions FROM interactions;

-- 6. If you want to completely disable RLS (NOT RECOMMENDED for production)
-- Uncomment these lines:
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
