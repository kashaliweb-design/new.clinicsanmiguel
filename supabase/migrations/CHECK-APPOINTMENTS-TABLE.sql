-- Check Appointments Table Structure
-- Run this to see what columns exist

-- Method 1: Check table columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Method 2: Show sample data
SELECT * FROM appointments LIMIT 1;

-- Method 3: Check table definition
\d appointments
