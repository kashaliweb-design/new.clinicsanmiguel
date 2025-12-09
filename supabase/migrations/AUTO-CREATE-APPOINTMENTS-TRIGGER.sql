-- Automatic Appointment Creation Trigger
-- This will automatically create appointments when interactions are logged

-- Step 1: Create function to auto-create appointments
CREATE OR REPLACE FUNCTION auto_create_appointment_from_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create appointment if intent is appointment_booking
  IF NEW.intent = 'appointment_booking' THEN
    INSERT INTO appointments (
      clinic_id,
      appointment_date,
      service_type,
      status,
      notes
    )
    VALUES (
      (SELECT id FROM clinics LIMIT 1),
      (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '14 hours',
      'General Consultation',
      'scheduled',
      'Auto-created from interaction: ' || SUBSTRING(NEW.message_body, 1, 100)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger on interactions table
DROP TRIGGER IF EXISTS trigger_auto_create_appointment ON interactions;

CREATE TRIGGER trigger_auto_create_appointment
  AFTER INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_appointment_from_interaction();

-- Step 3: Test the trigger
-- Make a VAPI call and it should automatically create appointment!

-- Step 4: Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_appointment';

-- Step 5: To disable trigger (if needed)
-- DROP TRIGGER trigger_auto_create_appointment ON interactions;

-- Step 6: To re-enable trigger (if disabled)
-- CREATE TRIGGER trigger_auto_create_appointment
--   AFTER INSERT ON interactions
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_create_appointment_from_interaction();
