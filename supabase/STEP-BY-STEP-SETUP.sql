-- ========================================
-- STEP BY STEP DATABASE SETUP
-- ========================================
-- Ek ek step run karo aur result dekho

-- ========================================
-- STEP 1: Check Extensions
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extensions
SELECT 'Extensions installed!' as status;


-- ========================================
-- STEP 2: Create Clinics Table
-- ========================================
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

-- Verify
SELECT 'Clinics table created!' as status;
SELECT * FROM clinics;


-- ========================================
-- STEP 3: Create Patients Table
-- ========================================
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

-- Verify
SELECT 'Patients table created!' as status;
SELECT * FROM patients;


-- ========================================
-- STEP 4: Create Appointments Table
-- ========================================
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

-- Verify
SELECT 'Appointments table created!' as status;
SELECT * FROM appointments;


-- ========================================
-- STEP 5: Create Interactions Table
-- ========================================
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

-- Verify
SELECT 'Interactions table created!' as status;
SELECT * FROM interactions;


-- ========================================
-- STEP 6: Create FAQs Table
-- ========================================
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

-- Verify
SELECT 'FAQs table created!' as status;
SELECT * FROM faqs;


-- ========================================
-- STEP 7: Create Canned Responses Table
-- ========================================
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

-- Verify
SELECT 'Canned responses table created!' as status;
SELECT * FROM canned_responses;


-- ========================================
-- STEP 8: Create Call Logs Table
-- ========================================
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

-- Verify
SELECT 'Call logs table created!' as status;
SELECT * FROM call_logs;


-- ========================================
-- STEP 9: Create Audit Logs Table
-- ========================================
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

-- Verify
SELECT 'Audit logs table created!' as status;
SELECT * FROM audit_logs;


-- ========================================
-- STEP 10: Create All Indexes
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
-- STEP 11: Check All Tables
-- ========================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('clinics', 'patients', 'appointments', 'interactions', 'faqs', 'canned_responses', 'call_logs', 'audit_logs')
ORDER BY table_name;

SELECT 'All tables created successfully!' as final_status;
