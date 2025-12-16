-- ========================================
-- STEP 1: EXPORT DATA FROM OLD DATABASE
-- ========================================
-- Run these queries in your OLD Supabase database SQL Editor
-- Copy the results to use in the import script

-- Export Clinics Data
SELECT 
  'INSERT INTO clinics (id, name, address, phone, email, hours, services, timezone, active, created_at, updated_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || REPLACE(name, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(address, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || phone || '''', 'NULL') || ', ' ||
  COALESCE('''' || email || '''', 'NULL') || ', ' ||
  COALESCE('''' || hours::text || '''::jsonb', 'NULL') || ', ' ||
  COALESCE('ARRAY[' || array_to_string(ARRAY(SELECT '''' || unnest(services) || ''''), ',') || ']', 'NULL') || ', ' ||
  '''' || timezone || ''', ' ||
  active::text || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  '''' || updated_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM clinics
ORDER BY created_at;

-- Export Patients Data
SELECT 
  'INSERT INTO patients (id, first_name, last_name, phone, email, date_of_birth, preferred_language, consent_sms, consent_voice, consent_recorded_at, created_at, updated_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || REPLACE(first_name, '''', '''''') || ''', ' ||
  '''' || REPLACE(last_name, '''', '''''') || ''', ' ||
  '''' || phone || ''', ' ||
  COALESCE('''' || email || '''', 'NULL') || ', ' ||
  COALESCE('''' || date_of_birth::text || '''::date', 'NULL') || ', ' ||
  '''' || preferred_language || ''', ' ||
  consent_sms::text || ', ' ||
  consent_voice::text || ', ' ||
  COALESCE('''' || consent_recorded_at::text || '''::timestamptz', 'NULL') || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  '''' || updated_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM patients
ORDER BY created_at;

-- Export Appointments Data
SELECT 
  'INSERT INTO appointments (id, patient_id, clinic_id, appointment_date, duration_minutes, service_type, status, notes, confirmed_at, confirmation_code, created_at, updated_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  COALESCE('''' || patient_id::text || '''::uuid', 'NULL') || ', ' ||
  COALESCE('''' || clinic_id::text || '''::uuid', 'NULL') || ', ' ||
  '''' || appointment_date::text || '''::timestamptz, ' ||
  duration_minutes::text || ', ' ||
  COALESCE('''' || REPLACE(service_type, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || status || ''', ' ||
  COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || confirmed_at::text || '''::timestamptz', 'NULL') || ', ' ||
  COALESCE('''' || confirmation_code || '''', 'NULL') || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  '''' || updated_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM appointments
ORDER BY created_at;

-- Export Interactions Data
SELECT 
  'INSERT INTO interactions (id, session_id, patient_id, channel, direction, from_number, to_number, message_body, intent, sentiment, metadata, created_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || session_id || ''', ' ||
  COALESCE('''' || patient_id::text || '''::uuid', 'NULL') || ', ' ||
  '''' || channel || ''', ' ||
  '''' || direction || ''', ' ||
  COALESCE('''' || from_number || '''', 'NULL') || ', ' ||
  COALESCE('''' || to_number || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(message_body, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || intent || '''', 'NULL') || ', ' ||
  COALESCE('''' || sentiment || '''', 'NULL') || ', ' ||
  COALESCE('''' || metadata::text || '''::jsonb', 'NULL') || ', ' ||
  '''' || created_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM interactions
ORDER BY created_at;

-- Export FAQs Data
SELECT 
  'INSERT INTO faqs (id, question, answer, category, language, keywords, active, created_at, updated_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || REPLACE(question, '''', '''''') || ''', ' ||
  '''' || REPLACE(answer, '''', '''''') || ''', ' ||
  COALESCE('''' || category || '''', 'NULL') || ', ' ||
  '''' || language || ''', ' ||
  COALESCE('ARRAY[' || array_to_string(ARRAY(SELECT '''' || unnest(keywords) || ''''), ',') || ']', 'NULL') || ', ' ||
  active::text || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  '''' || updated_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM faqs
ORDER BY created_at;

-- Export Canned Responses Data
SELECT 
  'INSERT INTO canned_responses (id, title, content, category, language, active, created_at, updated_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || REPLACE(title, '''', '''''') || ''', ' ||
  '''' || REPLACE(content, '''', '''''') || ''', ' ||
  COALESCE('''' || category || '''', 'NULL') || ', ' ||
  '''' || language || ''', ' ||
  active::text || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  '''' || updated_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM canned_responses
ORDER BY created_at;

-- Export Call Logs Data
SELECT 
  'INSERT INTO call_logs (id, call_id, patient_id, from_number, to_number, direction, status, duration_seconds, recording_url, transcript, metadata, created_at, ended_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || call_id || ''', ' ||
  COALESCE('''' || patient_id::text || '''::uuid', 'NULL') || ', ' ||
  COALESCE('''' || from_number || '''', 'NULL') || ', ' ||
  COALESCE('''' || to_number || '''', 'NULL') || ', ' ||
  COALESCE('''' || direction || '''', 'NULL') || ', ' ||
  COALESCE('''' || status || '''', 'NULL') || ', ' ||
  COALESCE(duration_seconds::text, 'NULL') || ', ' ||
  COALESCE('''' || recording_url || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(transcript, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || metadata::text || '''::jsonb', 'NULL') || ', ' ||
  '''' || created_at::text || '''::timestamptz, ' ||
  COALESCE('''' || ended_at::text || '''::timestamptz', 'NULL') ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM call_logs
ORDER BY created_at;

-- Export Audit Logs Data
SELECT 
  'INSERT INTO audit_logs (id, entity_type, entity_id, action, user_id, changes, ip_address, user_agent, created_at) VALUES' as sql_start
UNION ALL
SELECT 
  '(' || 
  '''' || id::text || '''::uuid, ' ||
  '''' || entity_type || ''', ' ||
  '''' || entity_id::text || '''::uuid, ' ||
  '''' || action || ''', ' ||
  COALESCE('''' || user_id::text || '''::uuid', 'NULL') || ', ' ||
  COALESCE('''' || changes::text || '''::jsonb', 'NULL') || ', ' ||
  COALESCE('''' || ip_address::text || '''::inet', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(user_agent, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || created_at::text || '''::timestamptz' ||
  ')' ||
  CASE WHEN row_number() OVER () < COUNT(*) OVER () THEN ',' ELSE ';' END as insert_statement
FROM audit_logs
ORDER BY created_at;

-- Check data counts
SELECT 'Data Export Summary' as info;
SELECT 'clinics' as table_name, COUNT(*) as record_count FROM clinics
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL
SELECT 'canned_responses', COUNT(*) FROM canned_responses
UNION ALL
SELECT 'call_logs', COUNT(*) FROM call_logs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
