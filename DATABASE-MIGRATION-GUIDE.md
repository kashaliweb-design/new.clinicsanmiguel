# Database Migration Guide
## ایک Database سے دوسرے Database میں Tables Transfer کریں

---

## طریقہ 1: Supabase Dashboard استعمال کر کے (آسان ترین)

### Step 1: نیا Database Setup کریں

1. **نئے Supabase Project میں جائیں**
   - Supabase Dashboard کھولیں
   - نیا project select کریں
   - SQL Editor میں جائیں

2. **Schema بنائیں**
   - `supabase/migrations/MIGRATE-TO-NEW-DATABASE.sql` کھولیں
   - سارا SQL copy کریں
   - نئے database کے SQL Editor میں paste کریں
   - **Run** پر کلک کریں
   - یہ سارے tables بنا دے گا

### Step 2: Data Export کریں (پرانے Database سے)

1. **پرانے Supabase Project میں جائیں**
   - Table Editor کھولیں

2. **ہر Table کا Data Export کریں:**

   **Clinics Table:**
   - `clinics` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **Patients Table:**
   - `patients` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **Appointments Table:**
   - `appointments` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **Interactions Table:**
   - `interactions` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **FAQs Table:**
   - `faqs` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **Canned Responses Table:**
   - `canned_responses` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

   **Call Logs Table:**
   - `call_logs` table کھولیں
   - تمام rows select کریں
   - Copy کریں یا CSV export کریں

### Step 3: Data Import کریں (نئے Database میں)

1. **نئے Supabase Project میں جائیں**
   - Table Editor کھولیں

2. **ہر Table میں Data Import کریں:**
   - Table کھولیں
   - "Insert" یا "Import CSV" button استعمال کریں
   - پرانے database سے copy کیا ہوا data paste کریں

**⚠️ اہم ترتیب:**
1. پہلے `clinics` import کریں
2. پھر `patients` import کریں
3. پھر `appointments` import کریں
4. پھر `interactions` import کریں
5. آخر میں `faqs`, `canned_responses`, `call_logs` import کریں

---

## طریقہ 2: SQL استعمال کر کے (Advanced)

### Step 1: پرانے Database سے Data Export

```sql
-- پرانے database میں یہ run کریں
COPY (SELECT * FROM clinics) TO '/tmp/clinics.csv' WITH CSV HEADER;
COPY (SELECT * FROM patients) TO '/tmp/patients.csv' WITH CSV HEADER;
COPY (SELECT * FROM appointments) TO '/tmp/appointments.csv' WITH CSV HEADER;
COPY (SELECT * FROM interactions) TO '/tmp/interactions.csv' WITH CSV HEADER;
COPY (SELECT * FROM faqs) TO '/tmp/faqs.csv' WITH CSV HEADER;
COPY (SELECT * FROM canned_responses) TO '/tmp/canned_responses.csv' WITH CSV HEADER;
COPY (SELECT * FROM call_logs) TO '/tmp/call_logs.csv' WITH CSV HEADER;
```

### Step 2: نئے Database میں Schema بنائیں

```bash
# نئے database میں schema بنائیں
psql -h [NEW_DB_HOST] -U postgres -d postgres -f supabase/migrations/MIGRATE-TO-NEW-DATABASE.sql
```

### Step 3: CSV Files Import کریں

```sql
-- نئے database میں یہ run کریں
COPY clinics FROM '/tmp/clinics.csv' WITH CSV HEADER;
COPY patients FROM '/tmp/patients.csv' WITH CSV HEADER;
COPY appointments FROM '/tmp/appointments.csv' WITH CSV HEADER;
COPY interactions FROM '/tmp/interactions.csv' WITH CSV HEADER;
COPY faqs FROM '/tmp/faqs.csv' WITH CSV HEADER;
COPY canned_responses FROM '/tmp/canned_responses.csv' WITH CSV HEADER;
COPY call_logs FROM '/tmp/call_logs.csv' WITH CSV HEADER;
```

---

## طریقہ 3: pg_dump استعمال کر کے (مکمل Database)

### پورا Database Export کریں

```bash
# پرانے database سے export
pg_dump -h [OLD_DB_HOST] -U postgres -d postgres --clean --if-exists > backup.sql
```

### نئے Database میں Import کریں

```bash
# نئے database میں import
psql -h [NEW_DB_HOST] -U postgres -d postgres < backup.sql
```

---

## طریقہ 4: Supabase CLI استعمال کر کے

### Install Supabase CLI

```bash
npm install -g supabase
```

### Database Dump لیں

```bash
# پرانے project سے
supabase db dump -f backup.sql --project-ref [OLD_PROJECT_REF]
```

### نئے Database میں Restore کریں

```bash
# نئے project میں
supabase db reset --project-ref [NEW_PROJECT_REF]
psql -h [NEW_DB_HOST] -U postgres -d postgres < backup.sql
```

---

## Verification (تصدیق)

Migration کے بعد یہ queries چلائیں:

```sql
-- تمام tables کی count check کریں
SELECT 
  'clinics' as table_name, COUNT(*) as total FROM clinics
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
SELECT 'call_logs', COUNT(*) FROM call_logs;
```

### پرانے اور نئے Database میں counts match ہونی چاہیے!

---

## Environment Variables Update کریں

Migration کے بعد `.env.local` update کریں:

```env
# نئے database کی details
NEXT_PUBLIC_SUPABASE_URL=https://[NEW_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
```

---

## Troubleshooting

### اگر Foreign Key Errors آئیں:

```sql
-- Foreign key constraints temporarily disable کریں
ALTER TABLE appointments DISABLE TRIGGER ALL;
ALTER TABLE interactions DISABLE TRIGGER ALL;

-- Data import کریں

-- Constraints واپس enable کریں
ALTER TABLE appointments ENABLE TRIGGER ALL;
ALTER TABLE interactions ENABLE TRIGGER ALL;
```

### اگر Duplicate Key Errors آئیں:

```sql
-- پہلے existing data delete کریں
TRUNCATE TABLE call_logs CASCADE;
TRUNCATE TABLE interactions CASCADE;
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE clinics CASCADE;
TRUNCATE TABLE faqs CASCADE;
TRUNCATE TABLE canned_responses CASCADE;

-- پھر دوبارہ import کریں
```

---

## میری سفارش (Recommendation)

**سب سے آسان طریقہ:**

1. ✅ نئے database میں `MIGRATE-TO-NEW-DATABASE.sql` run کریں
2. ✅ Supabase Dashboard استعمال کر کے table by table data copy کریں
3. ✅ Counts verify کریں
4. ✅ `.env.local` update کریں
5. ✅ Application test کریں

یہ طریقہ سب سے محفوظ اور آسان ہے!

---

**کامیابی کی علامات:**
- ✅ تمام tables نئے database میں بن گئے
- ✅ تمام data copy ہو گیا
- ✅ Counts match ہو رہے ہیں
- ✅ Application نئے database سے connect ہو گئی
- ✅ Chatbot اور Admin Dashboard کام کر رہے ہیں
