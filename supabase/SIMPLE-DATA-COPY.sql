-- ========================================
-- SIMPLE METHOD: Copy data using pg_dump (Recommended)
-- ========================================
-- This is the easiest way to migrate your Supabase database

-- ========================================
-- METHOD 1: Using Supabase Dashboard (EASIEST)
-- ========================================
-- 1. Go to your OLD Supabase project
-- 2. Click on "Database" in the left sidebar
-- 3. Click on "Backups" tab
-- 4. Click "Create Backup" to create a manual backup
-- 5. Download the backup file
-- 6. Go to your NEW Supabase project
-- 7. Click on "Database" > "Backups"
-- 8. Click "Restore" and upload your backup file


-- ========================================
-- METHOD 2: Using SQL (If you have data access)
-- ========================================
-- Run this in your OLD database to get all data as INSERT statements

-- First, temporarily disable RLS to allow data export
ALTER TABLE clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Export Clinics
COPY (
  SELECT * FROM clinics ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Patients
COPY (
  SELECT * FROM patients ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Appointments
COPY (
  SELECT * FROM appointments ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Interactions
COPY (
  SELECT * FROM interactions ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export FAQs
COPY (
  SELECT * FROM faqs ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Canned Responses
COPY (
  SELECT * FROM canned_responses ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Call Logs
COPY (
  SELECT * FROM call_logs ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export Audit Logs
COPY (
  SELECT * FROM audit_logs ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Re-enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ========================================
-- METHOD 3: Direct Database Connection (Advanced)
-- ========================================
-- If you have direct database access, use these commands in terminal:

-- Export from OLD database:
-- pg_dump -h OLD_HOST -U postgres -d postgres -t clinics -t patients -t appointments -t interactions -t faqs -t canned_responses -t call_logs -t audit_logs --data-only --column-inserts > data_export.sql

-- Import to NEW database:
-- psql -h NEW_HOST -U postgres -d postgres -f data_export.sql


-- ========================================
-- METHOD 4: Manual Copy (For small datasets)
-- ========================================
-- If you have small amount of data, you can manually copy:

-- Step 1: Run in OLD database to see data
SELECT * FROM clinics;
SELECT * FROM patients;
SELECT * FROM appointments;
SELECT * FROM interactions;
SELECT * FROM faqs;
SELECT * FROM canned_responses;
SELECT * FROM call_logs;
SELECT * FROM audit_logs;

-- Step 2: Copy the data and create INSERT statements manually
-- Step 3: Run INSERT statements in NEW database
