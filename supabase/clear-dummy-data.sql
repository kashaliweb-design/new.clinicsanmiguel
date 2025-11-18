-- Clear dummy/test data from database
-- Run this in Supabase SQL Editor to remove all test data

-- Clear interactions (sample conversations)
DELETE FROM interactions;

-- Clear appointments (sample appointments)  
DELETE FROM appointments;

-- Clear patients (sample patients)
DELETE FROM patients;

-- Note: Clinics, FAQs, and canned_responses are kept as they contain real information
-- If you want to clear those too, uncomment the lines below:

-- DELETE FROM clinics;
-- DELETE FROM faqs;
-- DELETE FROM canned_responses;

-- Reset sequences (optional)
-- This ensures new records start from ID 1
-- ALTER SEQUENCE interactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE patients_id_seq RESTART WITH 1;

SELECT 'Dummy data cleared successfully!' as message;
