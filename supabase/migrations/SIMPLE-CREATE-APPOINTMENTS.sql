-- SIMPLEST: Create Appointments from Interactions
-- Using only the columns that exist in appointments table

-- Check table structure first
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Create appointments (SIMPLE VERSION)
INSERT INTO appointments (
  clinic_id,
  appointment_date,
  status,
  notes
)
SELECT 
  (SELECT id FROM clinics LIMIT 1),
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '14 hours', -- Tomorrow 2 PM
  'scheduled',
  'Test appointment from interaction'
FROM interactions
WHERE intent = 'appointment_booking'
  AND patient_id IS NOT NULL
LIMIT 1;

-- Check result
SELECT * FROM appointments ORDER BY appointment_date DESC LIMIT 5;
SELECT COUNT(*) as total FROM appointments;
