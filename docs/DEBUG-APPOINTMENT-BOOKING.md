# Debug: Appointment Booking Not Saving to Supabase

## 🔍 Problem
Appointment book ho raha hai aur confirmation mil raha hai, lekin:
- ❌ Supabase database mein store nahi ho raha
- ❌ Dashboard mein show nahi ho raha

## 🛠️ Solution Steps

### Step 1: Check if Clinic Exists in Database

**Problem:** Appointment create karne ke liye `clinic_id` required hai, lekin database mein koi active clinic nahi hai.

**Fix:** Supabase SQL Editor mein yeh query run karein:

```sql
-- Check if any active clinics exist
SELECT COUNT(*) as clinic_count FROM clinics WHERE active = true;
```

Agar result `0` hai, toh clinic add karein:

```sql
-- Add default clinic
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
VALUES (
  'Clinica San Miguel - Main',
  '428 E Jefferson Blvd, Suite 123, Dallas, TX 75203',
  '+14155551000',
  'info@clinicasanmiguel.com',
  'Monday-Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 12:00 PM',
  ARRAY['consultation', 'immigration_exam', 'primary_care', 'specialist', 'urgent_care'],
  true,
  NOW()
);
```

**Ya phir:** `FIX-CLINIC-ISSUE.sql` file run karein Supabase mein.

### Step 2: Check Browser Console for Errors

1. Browser mein chatbot kholen
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to book an appointment
5. Check for any error messages

**Common Errors:**
- `No active clinic found` - Clinic nahi hai database mein
- `Failed to create patient` - Patient table issue
- `Failed to create appointment` - Appointment table issue

### Step 3: Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try to book appointment
4. Look for `/api/chat/book-appointment` request
5. Click on it and check:
   - **Request Payload** - Data jo send ho raha hai
   - **Response** - Server ka response

### Step 4: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Logs** section
4. Look for errors related to:
   - `patients` table
   - `appointments` table
   - `clinics` table

### Step 5: Verify Database Tables

Run these queries in Supabase SQL Editor:

```sql
-- Check patients table
SELECT COUNT(*) FROM patients;
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;

-- Check appointments table
SELECT COUNT(*) FROM appointments;
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5;

-- Check clinics table
SELECT COUNT(*) FROM clinics WHERE active = true;
SELECT * FROM clinics WHERE active = true;
```

### Step 6: Check RLS (Row Level Security) Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('patients', 'appointments', 'clinics');

-- Check policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('patients', 'appointments', 'clinics');
```

### Step 7: Test API Directly

Use this curl command to test the API:

```bash
curl -X POST http://localhost:3000/api/chat/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test User",
    "phoneNumber": "5551234567",
    "email": "test@example.com",
    "dateOfBirth": "01/15/1990",
    "address": "123 Test St, Dallas, TX",
    "appointmentType": "consultation",
    "appointmentDate": "2025-01-15",
    "appointmentTime": "2:30 PM",
    "isNewPatient": true
  }'
```

## 🔧 Updated Code Changes

### File: `app/api/chat/book-appointment/route.ts`

**Added:**
- ✅ Better error logging
- ✅ Detailed error messages
- ✅ Console logs for debugging

**Now shows:**
- Patient creation details
- Clinic ID being used
- Appointment data being inserted
- Detailed error messages if something fails

## 📊 What to Check in Dashboard

### Patients Table
```sql
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 10;
```

### Appointments Table
```sql
SELECT 
  a.id,
  a.appointment_date,
  a.service_type,
  a.status,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone,
  c.name as clinic_name,
  a.created_at
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN clinics c ON a.clinic_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;
```

## 🎯 Most Common Issues & Fixes

### Issue 1: No Active Clinic
**Error:** "No active clinic found"
**Fix:** Run `FIX-CLINIC-ISSUE.sql`

### Issue 2: RLS Policy Blocking Inserts
**Error:** "new row violates row-level security policy"
**Fix:**
```sql
-- Add service role policy if missing
CREATE POLICY "Service role full access patients" 
ON patients FOR ALL 
USING (true);

CREATE POLICY "Service role full access appointments" 
ON appointments FOR ALL 
USING (true);
```

### Issue 3: Missing Columns
**Error:** "column does not exist"
**Fix:** Check schema and add missing columns

### Issue 4: Invalid Date Format
**Error:** "invalid input syntax for type timestamp"
**Fix:** Ensure date is in format `YYYY-MM-DD` and time in `HH:MM`

## 🧪 Test Checklist

- [ ] At least one active clinic exists in database
- [ ] RLS policies allow service role to insert
- [ ] Patient table has required columns (first_name, last_name, phone)
- [ ] Appointment table has required columns (patient_id, clinic_id, appointment_date)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API response
- [ ] Supabase logs show no errors
- [ ] Data appears in Supabase table editor

## 📝 Quick Fix Command

Run this in your terminal:

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Open Developer Tools (F12)
# Try booking appointment
# Check Console for errors
```

## 🔍 Debugging Output

After the code update, you'll see these console logs:

```
Chat Appointment Booking Request: { patientName: "...", ... }
Existing patient found: <patient-id>
  OR
New patient created: <patient-id>
Using clinic: <clinic-id>
Creating appointment with data: { patient_id: "...", clinic_id: "...", ... }
Appointment created successfully: { id: "...", ... }
```

If there's an error, you'll see:
```
Error creating patient: { message: "...", ... }
  OR
Error fetching clinic: { message: "...", ... }
  OR
Error creating appointment: { message: "...", ... }
```

## ✅ Success Indicators

Appointment successfully save ho gaya agar:
1. ✅ Console mein "Appointment created successfully" dikhe
2. ✅ Confirmation code mile (CHT-XXXXXXXX)
3. ✅ Supabase mein appointment table mein entry dikhe
4. ✅ Dashboard mein appointment show ho

## 🚀 Next Steps

1. Run `FIX-CLINIC-ISSUE.sql` in Supabase
2. Test appointment booking again
3. Check browser console for logs
4. Verify data in Supabase tables
5. Check dashboard for appointments

---

**Agar abhi bhi issue ho, toh:**
- Browser console ka screenshot bhejein
- Network tab ka response bhejein
- Supabase logs check karein
