-- Automatic Patient Creation Trigger
-- This will automatically create patients when interactions with new phone numbers are logged

-- Step 1: Create function to auto-create patients
CREATE OR REPLACE FUNCTION auto_create_patient_from_interaction()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  -- Only process if phone number exists and is not 'unknown'
  IF NEW.from_number IS NOT NULL 
     AND NEW.from_number != 'unknown'
     AND NEW.from_number != 'Test User'
     AND NEW.from_number != '' THEN
    
    -- Check if patient already exists with this phone
    SELECT id INTO v_patient_id
    FROM patients
    WHERE phone = NEW.from_number
    LIMIT 1;
    
    -- If patient doesn't exist, create one
    IF v_patient_id IS NULL THEN
      INSERT INTO patients (
        first_name,
        last_name,
        phone,
        created_at
      )
      VALUES (
        'Patient',
        CASE 
          WHEN NEW.from_number ~ '^[0-9]+$' THEN SUBSTRING(NEW.from_number, -4)
          ELSE SUBSTRING(NEW.from_number, 1, 10)
        END,
        NEW.from_number,
        NOW()
      )
      RETURNING id INTO v_patient_id;
    END IF;
    
    -- Update the interaction with patient_id
    NEW.patient_id := v_patient_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger on interactions table (BEFORE INSERT)
DROP TRIGGER IF EXISTS trigger_auto_create_patient ON interactions;

CREATE TRIGGER trigger_auto_create_patient
  BEFORE INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_patient_from_interaction();

-- Step 3: Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_patient';

-- Step 4: Test the trigger
-- Make a VAPI call and it should:
-- 1. Create patient automatically (if new phone number)
-- 2. Link interaction to patient
-- 3. Create appointment (from previous trigger)

-- Step 5: Verify complete flow
SELECT 
  i.id as interaction_id,
  i.phone_number,
  i.intent,
  p.first_name || ' ' || p.last_name as patient_name,
  p.id as patient_id,
  a.id as appointment_id,
  a.appointment_date
FROM interactions i
LEFT JOIN patients p ON i.patient_id = p.id
LEFT JOIN appointments a ON a.notes ILIKE '%interaction%'
ORDER BY i.created_at DESC
LIMIT 5;
