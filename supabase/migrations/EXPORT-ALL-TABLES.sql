-- Export All Tables Data from Current Database
-- Run this in your SOURCE database (old database)

-- This will show you all the data that will be exported

-- 1. Export Clinics
SELECT 'CLINICS DATA:' as export_section;
SELECT * FROM clinics ORDER BY created_at;

-- 2. Export Patients
SELECT 'PATIENTS DATA:' as export_section;
SELECT * FROM patients ORDER BY created_at;

-- 3. Export Appointments
SELECT 'APPOINTMENTS DATA:' as export_section;
SELECT * FROM appointments ORDER BY created_at;

-- 4. Export Interactions
SELECT 'INTERACTIONS DATA:' as export_section;
SELECT * FROM interactions ORDER BY created_at;

-- 5. Export FAQs
SELECT 'FAQS DATA:' as export_section;
SELECT * FROM faqs ORDER BY created_at;

-- 6. Export Canned Responses
SELECT 'CANNED RESPONSES DATA:' as export_section;
SELECT * FROM canned_responses ORDER BY created_at;

-- 7. Export Call Logs
SELECT 'CALL LOGS DATA:' as export_section;
SELECT * FROM call_logs ORDER BY created_at;

-- Get counts
SELECT 
  'SUMMARY' as section,
  (SELECT COUNT(*) FROM clinics) as total_clinics,
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM appointments) as total_appointments,
  (SELECT COUNT(*) FROM interactions) as total_interactions,
  (SELECT COUNT(*) FROM faqs) as total_faqs,
  (SELECT COUNT(*) FROM canned_responses) as total_canned_responses,
  (SELECT COUNT(*) FROM call_logs) as total_call_logs;
