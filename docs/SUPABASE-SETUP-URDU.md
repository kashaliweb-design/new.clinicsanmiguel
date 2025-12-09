# 🚀 Supabase Database Setup - آسان گائیڈ

## ✅ Step 1: .env.local File Update Karo

Apne project folder mein `.env.local` file kholo aur ye lines add/update karo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rzfljblxsndyzxkrvmha.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZmxqYmx4c25keXp4a3J2bWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODgwMjMsImV4cCI6MjA3OTA2NDAyM30.td-NWFsnyy2vTcoGktrMDvTr8QQ9PE7sqv2m0PapH_M
```

**⚠️ Important:** Service Role Key bhi chahiye! Ye kaise milega:

1. Browser mein jao: https://supabase.com/dashboard
2. Apna project kholo: `rzfljblxsndyzxkrvmha`
3. Left sidebar mein **Settings** click karo
4. **API** section mein jao
5. **service_role** key copy karo (secret wali)
6. `.env.local` mein add karo:

```env
SUPABASE_SERVICE_ROLE_KEY=apni_service_role_key_yahan_paste_karo
```

---

## ✅ Step 2: Supabase SQL Editor Mein Database Setup Karo

### Kaise karein:

1. **Browser mein Supabase kholo:** https://supabase.com/dashboard
2. **Apna project select karo:** `rzfljblxsndyzxkrvmha`
3. **Left sidebar mein "SQL Editor" click karo**
4. **"New Query" button click karo**
5. **Niche diya hua SQL code copy karo**
6. **SQL Editor mein paste karo**
7. **"Run" button press karo (ya Ctrl+Enter)**

### SQL Code (Ye copy karo):

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Tables
CREATE TABLE IF NOT EXISTS clinics (
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

CREATE TABLE IF NOT EXISTS patients (
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

CREATE TABLE IF NOT EXISTS appointments (
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

CREATE TABLE IF NOT EXISTS interactions (
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

CREATE TABLE IF NOT EXISTS faqs (
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

CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_logs (
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

CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_patient_id ON interactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_patient_id ON call_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Public read clinics" ON clinics FOR SELECT USING (active = true);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (active = true);
CREATE POLICY "Service role full access clinics" ON clinics FOR ALL USING (true);
CREATE POLICY "Service role full access patients" ON patients FOR ALL USING (true);
CREATE POLICY "Service role full access appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Service role full access interactions" ON interactions FOR ALL USING (true);
CREATE POLICY "Service role full access faqs" ON faqs FOR ALL USING (true);
CREATE POLICY "Service role full access canned_responses" ON canned_responses FOR ALL USING (true);
CREATE POLICY "Service role full access call_logs" ON call_logs FOR ALL USING (true);
CREATE POLICY "Service role full access audit_logs" ON audit_logs FOR ALL USING (true);

-- Create Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canned_responses_updated_at BEFORE UPDATE ON canned_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add Clinic Data
INSERT INTO clinics (name, address, phone, email, hours, services, timezone, active) VALUES
  (
    'Clínica San Miguel',
    '123 Main Street, Los Angeles, CA 90001',
    '+1-323-555-0100',
    'info@clinicasanmiguel.com',
    '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "9:00-13:00", "sunday": "closed"}'::jsonb,
    ARRAY['General Consultation', 'Pediatrics', 'Vaccinations', 'Lab Tests', 'X-Ray'],
    'America/Los_Angeles',
    true
  )
ON CONFLICT DO NOTHING;

-- Add Test Patients
INSERT INTO patients (first_name, last_name, phone, email, date_of_birth, preferred_language, consent_sms, consent_voice) VALUES
  ('John', 'Doe', '+14155551234', 'john.doe@example.com', '1985-01-15', 'en', true, true),
  ('Maria', 'Garcia', '+14155555678', 'maria.garcia@example.com', '1990-03-20', 'es', true, true),
  ('Sarah', 'Johnson', '+14155559012', 'sarah.johnson@example.com', '1988-07-10', 'en', true, false),
  ('Carlos', 'Rodriguez', '+14155553456', 'carlos.r@example.com', '1992-11-25', 'es', true, true),
  ('Emily', 'Chen', '+14155557890', 'emily.chen@example.com', '1995-05-30', 'en', false, true)
ON CONFLICT (phone) DO NOTHING;

-- Add FAQs
INSERT INTO faqs (question, answer, category, language, keywords, active) VALUES
  ('What are your hours?', 'We are open Monday-Friday 9AM-5PM, Saturday 9AM-1PM. Closed on Sundays.', 'Hours', 'en', ARRAY['hours', 'timing', 'schedule'], true),
  ('¿Cuáles son sus horarios?', 'Estamos abiertos de lunes a viernes de 9AM-5PM, sábados de 9AM-1PM. Cerrado los domingos.', 'Hours', 'es', ARRAY['horarios', 'horario'], true),
  ('Do you accept walk-ins?', 'Yes, we accept walk-ins but appointments are recommended to minimize wait time.', 'Appointments', 'en', ARRAY['walk-in', 'appointment'], true),
  ('¿Aceptan pacientes sin cita?', 'Sí, aceptamos pacientes sin cita, pero recomendamos hacer una cita para minimizar el tiempo de espera.', 'Appointments', 'es', ARRAY['sin cita', 'cita'], true)
ON CONFLICT DO NOTHING;
```

---

## ✅ Step 3: Verify Karo (Check Karo Sab Theek Hai)

SQL Editor mein ye query run karo:

```sql
-- Tables check karo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Data check karo
SELECT 
  (SELECT COUNT(*) FROM clinics) as clinics,
  (SELECT COUNT(*) FROM patients) as patients,
  (SELECT COUNT(*) FROM faqs) as faqs;

-- Patients dekhao
SELECT * FROM patients;
```

Agar sab kuch theek hai to aapko:
- **8 tables** dikhenge
- **1 clinic** hoga
- **5 patients** honge
- **4+ FAQs** honge

---

## ✅ Step 4: Application Start Karo

Ab terminal/PowerShell mein ye command run karo:

```bash
npm run dev
```

Application http://localhost:3000 par chal jayegi! 🎉

---

## 🔍 Agar Koi Problem Aaye

### Problem: "relation does not exist"
**Solution:** SQL code dobara run karo, pura copy karke

### Problem: "permission denied"
**Solution:** Service Role Key check karo `.env.local` mein

### Problem: Application start nahi ho rahi
**Solution:** 
1. `.env.local` file check karo
2. `npm install` run karo
3. Phir `npm run dev` run karo

---

## 📝 Quick Checklist

- [ ] `.env.local` file update ki
- [ ] Service Role Key add kiya
- [ ] Supabase SQL Editor mein SQL run kiya
- [ ] Tables create ho gaye (verify kiya)
- [ ] Test data add ho gaya
- [ ] `npm run dev` run kiya
- [ ] http://localhost:3000 khola

---

## 🎯 Files Banaye Gaye

1. **SUPABASE-SETUP-COMPLETE.md** - Detailed English guide
2. **SUPABASE-COMPLETE-SETUP.sql** - Complete SQL file (ek hi baar run karo)
3. **SUPABASE-SETUP-URDU.md** - Ye file (آسان گائیڈ)

---

**Setup Complete! Ab kaam karo! 🚀**
