# Fix Appointments Not Showing Issue

## Problem
Appointments confirmed kiye but admin dashboard mein nahi dikh rahe.

## Solution Steps

### Step 1: Delete Dummy Data

1. **Supabase Dashboard** open karo: https://supabase.com/dashboard
2. Apna project select karo
3. **SQL Editor** pe jao
4. `DELETE-DUMMY-DATA.sql` file ka code run karo

Ya ye simple query run karo:
```sql
-- Delete all appointments
DELETE FROM appointments;

-- Reset ID counter
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;

-- Verify
SELECT COUNT(*) FROM appointments;
```

### Step 2: Check Appointments Table Structure

Run this to verify table exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';
```

Expected columns:
- `id` (integer)
- `patient_id` (integer)
- `appointment_type` (text)
- `appointment_date` (timestamp)
- `status` (text)
- `notes` (text)
- `created_at` (timestamp)
- `confirmation_code` (text)

### Step 3: Enable Patient Interactions

**Patient Interactions already enabled!** ✅

Check at: `https://your-domain.vercel.app/admin/interactions`

### Step 4: Test Appointment Creation Manually

Run this in Supabase SQL Editor to create a test appointment:

```sql
-- First, create a test patient if needed
INSERT INTO patients (name, phone, email, status, created_at)
VALUES ('Test Patient', '+1234567890', 'test@example.com', 'active', NOW())
RETURNING id;

-- Use the patient ID from above (let's say it's 1)
-- Create a test appointment
INSERT INTO appointments (
  patient_id,
  appointment_type,
  appointment_date,
  status,
  notes,
  created_at
) VALUES (
  1,  -- Replace with actual patient_id
  'consultation',
  '2024-12-05 14:00:00',
  'scheduled',
  'Test appointment',
  NOW()
) RETURNING *;
```

### Step 5: Check Admin Dashboard

1. Go to: `https://your-domain.vercel.app/admin/appointments`
2. Click **"Scheduled"** tab
3. Test appointment should appear

### Step 6: Debug Real-Time Updates

If appointments still not showing:

1. Open browser console (F12)
2. Go to admin dashboard
3. Check for errors
4. Look for real-time subscription messages

### Step 7: Check RLS Policies

Run this to check Row Level Security:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'appointments';

-- If RLS is ON, check policies
SELECT * FROM pg_policies 
WHERE tablename = 'appointments';
```

If RLS is blocking, temporarily disable for testing:
```sql
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

### Step 8: Verify Vapi Function Tool

Check if Vapi function tool is working:

1. Check Vercel logs for API calls
2. Look for `/api/vapi/book-appointment` requests
3. Check for errors in logs

Test the endpoint directly:
```bash
curl -X POST https://your-domain.vercel.app/api/vapi/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "functionCall": {
        "parameters": {
          "patientName": "John Doe",
          "phoneNumber": "+1234567890",
          "appointmentDate": "2024-12-05",
          "appointmentTime": "14:00",
          "appointmentType": "consultation",
          "isNewPatient": true
        }
      }
    }
  }'
```

## Common Issues & Solutions

### Issue 1: Appointments table doesn't exist
**Solution**: Run the Supabase setup SQL from `SUPABASE-COMPLETE-SETUP.sql`

### Issue 2: RLS blocking inserts
**Solution**: Disable RLS or add proper policies

### Issue 3: patient_id foreign key constraint
**Solution**: Make sure patient exists before creating appointment

### Issue 4: Real-time not working
**Solution**: 
- Check Supabase Realtime is enabled
- Verify subscription in browser console
- Refresh the page

### Issue 5: Vercel environment variables missing
**Solution**: Add all required env vars in Vercel dashboard

## Quick Test Checklist

- [ ] Dummy data deleted
- [ ] Test appointment created manually
- [ ] Appointment shows in admin dashboard
- [ ] Patient Interactions tab accessible
- [ ] Real-time updates working
- [ ] Vapi function tool configured
- [ ] API endpoint accessible

## Next Steps After Fix

1. ✅ Dummy data cleaned
2. ✅ Patient Interactions enabled
3. ⏳ Test voice call appointment booking
4. ⏳ Verify appointment appears in dashboard
5. ⏳ Test confirmation workflow

---

**Need more help?** Check:
- Browser console for errors
- Vercel deployment logs
- Supabase logs
- Network tab for failed requests
