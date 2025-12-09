-- Check Interactions Table Structure
-- Find correct column names

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'interactions'
ORDER BY ordinal_position;

-- Also check sample data
SELECT * FROM interactions LIMIT 1;
