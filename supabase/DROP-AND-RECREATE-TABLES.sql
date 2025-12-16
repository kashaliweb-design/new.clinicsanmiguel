-- ========================================
-- DROP EXISTING TABLES AND RECREATE
-- ========================================
-- ⚠️ WARNING: Yeh script SAARA DATA DELETE KAR DEGA!
-- Sirf tab use karo jab fresh start chahiye

-- ========================================
-- STEP 1: Drop All Existing Tables
-- ========================================

-- Drop tables in reverse order (child tables first, then parent tables)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS canned_responses CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

SELECT 'All existing tables dropped!' as status;


-- ========================================
-- STEP 2: Enable Extensions
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SELECT 'Extensions enabled!' as status;


-- ========================================
-- STEP 3: Create All Tables (Fresh)
-- ========================================

-- Clinics Table
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  hours JSONB,
  services TEXT[],
  timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  date_of_birth DATE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  consent_sms BOOLEAN DEFAULT false,
  consent_voice BOOLEAN DEFAULT false,
  consent_recorded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  service_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmation_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions Table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  message_body TEXT,
  intent VARCHAR(100),
  sentiment VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  keywords TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canned Responses Table
CREATE TABLE canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call Logs Table
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id VARCHAR(255) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  direction VARCHAR(10),
  status VARCHAR(50),
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'All tables created!' as status;


-- ========================================
-- STEP 4: Create Indexes
-- ========================================
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_interactions_session_id ON interactions(session_id);
CREATE INDEX idx_interactions_patient_id ON interactions(patient_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
CREATE INDEX idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX idx_call_logs_patient_id ON call_logs(patient_id);
CREATE INDEX idx_faqs_active ON faqs(active);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

SELECT 'All indexes created!' as status;


-- ========================================
-- STEP 5: Enable RLS
-- ========================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

SELECT 'RLS enabled!' as status;


-- ========================================
-- STEP 6: Create RLS Policies
-- ========================================

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Allow authenticated all access" ON clinics;
DROP POLICY IF EXISTS "Allow anon read active clinics" ON clinics;
DROP POLICY IF EXISTS "Allow authenticated all access" ON patients;
DROP POLICY IF EXISTS "Allow authenticated all access" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated all access" ON interactions;
DROP POLICY IF EXISTS "Allow authenticated all access" ON faqs;
DROP POLICY IF EXISTS "Allow anon read active faqs" ON faqs;
DROP POLICY IF EXISTS "Allow authenticated all access" ON canned_responses;
DROP POLICY IF EXISTS "Allow authenticated all access" ON call_logs;
DROP POLICY IF EXISTS "Allow authenticated all access" ON audit_logs;

-- Create fresh policies
CREATE POLICY "Allow authenticated all access" ON clinics
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read active clinics" ON clinics
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "Allow authenticated all access" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all access" ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all access" ON interactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all access" ON faqs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read active faqs" ON faqs
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "Allow authenticated all access" ON canned_responses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all access" ON call_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all access" ON audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

SELECT 'All RLS policies created!' as status;


-- ========================================
-- STEP 7: Create Triggers
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clinics_updated_at ON clinics;
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_canned_responses_updated_at ON canned_responses;
CREATE TRIGGER update_canned_responses_updated_at BEFORE UPDATE ON canned_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'All triggers created!' as status;


-- ========================================
-- STEP 8: Insert Default Data
-- ========================================

-- Insert default clinic
INSERT INTO clinics (name, address, phone, email, timezone, active, services)
VALUES (
  'SanMiguel Clinic',
  '123 Main Street, San Miguel',
  '+1-555-0100',
  'contact@sanmiguelclinic.com',
  'America/Los_Angeles',
  true,
  ARRAY['General Consultation', 'Dental', 'Pediatrics', 'Vaccination']
);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, language, active) VALUES
('What are your clinic hours?', 'We are open Monday to Friday, 9:00 AM to 5:00 PM.', 'Hours', 'en', true),
('How do I book an appointment?', 'You can book an appointment through our chat system or by calling us.', 'Appointments', 'en', true),
('Do you accept insurance?', 'Yes, we accept most major insurance plans. Please contact us for details.', 'Insurance', 'en', true),
('What services do you offer?', 'We offer general consultations, dental care, pediatrics, and vaccinations.', 'Services', 'en', true),
('Where is the clinic located?', 'We are located at 123 Main Street, San Miguel.', 'Location', 'en', true);

SELECT 'Default data inserted!' as status;


-- ========================================
-- STEP 9: Verify Setup
-- ========================================
SELECT '✅ Fresh database setup complete!' as final_status;

-- Show table counts
SELECT 
  'clinics' as table_name, 
  COUNT(*) as records 
FROM clinics
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
