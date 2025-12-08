-- Fix: Ensure at least one active clinic exists for appointments
-- Run this in Supabase SQL Editor

-- Check if any clinics exist
SELECT COUNT(*) as clinic_count FROM clinics WHERE active = true;

-- If no active clinics, insert a default one
INSERT INTO clinics (
  name,
  address,
  phone,
  email,
  hours,
  services,
  active,
  created_at
)
SELECT 
  'Clinica San Miguel - Main',
  '428 E Jefferson Blvd, Suite 123, Dallas, TX 75203',
  '+14155551000',
  'info@clinicasanmiguel.com',
  '{"monday": "8:00 AM - 5:00 PM", "tuesday": "8:00 AM - 5:00 PM", "wednesday": "8:00 AM - 5:00 PM", "thursday": "8:00 AM - 5:00 PM", "friday": "8:00 AM - 5:00 PM", "saturday": "9:00 AM - 12:00 PM", "sunday": "Closed"}'::jsonb,
  ARRAY['consultation', 'immigration_exam', 'primary_care', 'specialist', 'urgent_care'],
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clinics WHERE active = true
);

-- Verify clinic was created
SELECT 
  id,
  name,
  address,
  phone,
  active,
  created_at
FROM clinics
WHERE active = true
ORDER BY created_at DESC
LIMIT 5;

-- Also check appointments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Check if there are any appointments
SELECT COUNT(*) as appointment_count FROM appointments;

-- Show recent appointments if any
SELECT 
  a.id,
  a.patient_id,
  a.clinic_id,
  a.appointment_date,
  a.service_type,
  a.status,
  a.created_at,
  p.first_name,
  p.last_name,
  p.phone
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
ORDER BY a.created_at DESC
LIMIT 10;
