-- Fix: Insert clinic record first
-- Run this in Supabase SQL Editor

-- Step 1: Check if clinic exists
SELECT * FROM sanmiguel_clinics;

-- Step 2: If no clinic exists, insert one
INSERT INTO sanmiguel_clinics (name, address, phone, email, timezone, active, services)
VALUES (
  'SanMiguel Clinic',
  '123 Main Street, San Miguel',
  '+1-555-0100',
  'contact@sanmiguelclinic.com',
  'America/Los_Angeles',
  true,
  ARRAY['General Consultation', 'Dental', 'Pediatrics', 'Vaccination']
)
ON CONFLICT DO NOTHING;

-- Step 3: Verify clinic was inserted
SELECT id, name, active FROM sanmiguel_clinics;

-- Step 4: Now you can insert appointments
-- The clinic_id from above query should be used in appointments
