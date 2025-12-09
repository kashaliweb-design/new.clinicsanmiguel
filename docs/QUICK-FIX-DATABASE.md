# Quick Fix - Database Schema Issue

## Problem
Your `patients` table is missing some columns that the code expects.

## Solution (2 Steps)

### Step 1: Fix the Table Structure

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS consent_sms BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS consent_voice BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Verify columns were added
SELECT column_name FROM information_schema.columns WHERE table_name = 'patients';
```

### Step 2: Add Test Data

After Step 1 succeeds, run this:

```sql
-- Add 5 test patients
INSERT INTO patients (first_name, last_name, phone, email, date_of_birth, preferred_language, consent_sms, consent_voice) VALUES
  ('John', 'Doe', '+14155551234', 'john.doe@example.com', '1985-01-15', 'en', true, true),
  ('Maria', 'Garcia', '+14155555678', 'maria.garcia@example.com', '1990-03-20', 'es', true, true),
  ('Sarah', 'Johnson', '+14155559012', 'sarah.johnson@example.com', '1988-07-10', 'en', true, false),
  ('Carlos', 'Rodriguez', '+14155553456', 'carlos.r@example.com', '1992-11-25', 'es', true, true),
  ('Emily', 'Chen', '+14155557890', 'emily.chen@example.com', '1995-05-30', 'en', false, true)
ON CONFLICT (phone) DO NOTHING;

-- Check the data
SELECT first_name, last_name, phone, preferred_language FROM patients;
```

## Done! ✅

Now refresh your admin dashboard:
- `/admin` - Will show 5 patients
- `/admin/patients` - Will show patient list

---

## Alternative: If You Have Different Table Structure

If your table has different columns, just add patients with basic info:

```sql
-- Minimal version (only required fields)
INSERT INTO patients (first_name, last_name, phone) VALUES
  ('John', 'Doe', '+14155551234'),
  ('Maria', 'Garcia', '+14155555678'),
  ('Sarah', 'Johnson', '+14155559012')
ON CONFLICT (phone) DO NOTHING;

SELECT * FROM patients;
```

This will work with any table structure!
