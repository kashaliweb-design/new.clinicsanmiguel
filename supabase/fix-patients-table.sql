-- Fix patients table - Add missing columns if they don't exist
-- Run this first in Supabase SQL Editor

-- Add preferred_language column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE patients ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
    END IF;
END $$;

-- Add consent_sms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'consent_sms'
    ) THEN
        ALTER TABLE patients ADD COLUMN consent_sms BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add consent_voice column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'consent_voice'
    ) THEN
        ALTER TABLE patients ADD COLUMN consent_voice BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add date_of_birth column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE patients ADD COLUMN date_of_birth DATE;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;
