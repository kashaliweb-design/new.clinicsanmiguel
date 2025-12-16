-- ========================================
-- FIXED MIGRATION FOR EXISTING DATABASE
-- ========================================
-- Use this if you already ran the setup and got policy errors
-- This will drop existing policies and recreate everything

-- ========================================
-- STEP 1: DROP EXISTING POLICIES (if they exist)
-- ========================================

-- Drop existing policies for clinics
DROP POLICY IF EXISTS "Allow authenticated all access" ON clinics;
DROP POLICY IF EXISTS "Allow anon read active clinics" ON clinics;
DROP POLICY IF EXISTS "Public read clinics" ON clinics;
DROP POLICY IF EXISTS "Service role full access clinics" ON clinics;

-- Drop existing policies for patients
DROP POLICY IF EXISTS "Allow authenticated all access" ON patients;
DROP POLICY IF EXISTS "Service role full access patients" ON patients;

-- Drop existing policies for appointments
DROP POLICY IF EXISTS "Allow authenticated all access" ON appointments;
DROP POLICY IF EXISTS "Service role full access appointments" ON appointments;

-- Drop existing policies for interactions
DROP POLICY IF EXISTS "Allow authenticated all access" ON interactions;
DROP POLICY IF EXISTS "Service role full access interactions" ON interactions;

-- Drop existing policies for faqs
DROP POLICY IF EXISTS "Allow authenticated all access" ON faqs;
DROP POLICY IF EXISTS "Allow anon read active faqs" ON faqs;
DROP POLICY IF EXISTS "Public read faqs" ON faqs;
DROP POLICY IF EXISTS "Service role full access faqs" ON faqs;

-- Drop existing policies for canned_responses
DROP POLICY IF EXISTS "Allow authenticated all access" ON canned_responses;
DROP POLICY IF EXISTS "Service role full access canned_responses" ON canned_responses;

-- Drop existing policies for call_logs
DROP POLICY IF EXISTS "Allow authenticated all access" ON call_logs;
DROP POLICY IF EXISTS "Service role full access call_logs" ON call_logs;

-- Drop existing policies for audit_logs
DROP POLICY IF EXISTS "Allow authenticated all access" ON audit_logs;
DROP POLICY IF EXISTS "Service role full access audit_logs" ON audit_logs;

-- ========================================
-- STEP 2: CREATE FRESH RLS POLICIES
-- ========================================

-- Clinics policies
CREATE POLICY "Allow authenticated all access" ON clinics
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read active clinics" ON clinics
  FOR SELECT TO anon USING (active = true);

-- Patients policies
CREATE POLICY "Allow authenticated all access" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Allow authenticated all access" ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Interactions policies
CREATE POLICY "Allow authenticated all access" ON interactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- FAQs policies
CREATE POLICY "Allow authenticated all access" ON faqs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read active faqs" ON faqs
  FOR SELECT TO anon USING (active = true);

-- Canned responses policies
CREATE POLICY "Allow authenticated all access" ON canned_responses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Call logs policies
CREATE POLICY "Allow authenticated all access" ON call_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Allow authenticated all access" ON audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- STEP 3: VERIFY POLICIES
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'Policies fixed successfully!' as status;
