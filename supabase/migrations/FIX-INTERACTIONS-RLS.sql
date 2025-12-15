-- Fix Interactions Table RLS Policies
-- This ensures chatbot interactions appear in the admin dashboard

-- Step 1: Drop all existing policies on interactions table
DROP POLICY IF EXISTS "Public read interactions" ON interactions;
DROP POLICY IF EXISTS "Service role full access interactions" ON interactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON interactions;

-- Step 2: Ensure RLS is enabled
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive policies for all operations
-- Allow SELECT (read) for all users
CREATE POLICY "Allow all to read interactions"
ON interactions FOR SELECT
USING (true);

-- Allow INSERT for all users (needed for chatbot logging)
CREATE POLICY "Allow all to insert interactions"
ON interactions FOR INSERT
WITH CHECK (true);

-- Allow UPDATE for all users
CREATE POLICY "Allow all to update interactions"
ON interactions FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow DELETE for all users (admin operations)
CREATE POLICY "Allow all to delete interactions"
ON interactions FOR DELETE
USING (true);

-- Step 4: Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'interactions'
ORDER BY policyname;

-- Step 5: Test that interactions can be read
SELECT 
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT patient_id) as unique_patients
FROM interactions;

-- Step 6: Show recent interactions
SELECT 
  id,
  session_id,
  channel,
  direction,
  message_body,
  intent,
  created_at
FROM interactions
ORDER BY created_at DESC
LIMIT 10;
