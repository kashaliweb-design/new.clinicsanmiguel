# Debug: Appointment Not Storing Issue

## Current Situation
- ✅ Chat shows: "Your appointment has been confirmed"
- ✅ Confirmation code provided
- ✅ 4 active clinics exist in database
- ❌ Appointment NOT appearing in `sanmiguel_appointments` table

## Possible Causes

### 1. Silent Error in Appointment Insert
The insert might be failing but error not being caught/logged.

### 2. Patient ID Issue
If patient creation fails, `patientId` will be null/undefined, causing appointment insert to fail.

### 3. Date Format Issue
The date format might not match PostgreSQL expectations.

### 4. RLS Policy Blocking Insert
Even with service role key, there might be a policy issue.

## Immediate Actions

### Step 1: Run This SQL to Check Current Data

```sql
-- Check if ANY appointments exist
SELECT COUNT(*) FROM sanmiguel_appointments;

-- Check recent patients
SELECT * FROM sanmiguel_patients 
ORDER BY created_at DESC 
LIMIT 3;

-- Check recent interactions with booking intent
SELECT 
  id,
  patient_id,
  intent,
  message_body,
  metadata,
  created_at
FROM sanmiguel_interactions
WHERE created_at > NOW() - INTERVAL '15 minutes'
ORDER BY created_at DESC;
```

### Step 2: Check Server Terminal Logs

Look for:
- ❌ Any error messages
- ⚠️ "Error booking appointment"
- ⚠️ "Failed to create appointment"
- ⚠️ PostgreSQL errors

### Step 3: Test Manual Insert

Try inserting appointment manually to verify table works:

```sql
-- Get a clinic ID
SELECT id FROM sanmiguel_clinics LIMIT 1;

-- Get a patient ID (or create test patient)
SELECT id FROM sanmiguel_patients LIMIT 1;

-- Try manual insert (replace IDs with actual values)
INSERT INTO sanmiguel_appointments (
  patient_id,
  clinic_id,
  appointment_date,
  service_type,
  status,
  confirmation_code,
  duration_minutes
) VALUES (
  'PATIENT_ID_HERE',
  'CLINIC_ID_HERE',
  '2024-12-20 14:00:00',
  'consultation',
  'confirmed',
  'TEST-12345',
  30
) RETURNING *;
```

If this works, the table is fine and issue is in the code.

## Code Issues to Check

### Issue 1: Error Not Being Logged

The code doesn't check for `error` from the insert:

```typescript
const { data: appointment } = await supabase
  .from(TABLES.APPOINTMENTS)
  .insert({...})
  .select()
  .single();
```

Should be:

```typescript
const { data: appointment, error: appointmentError } = await supabase
  .from(TABLES.APPOINTMENTS)
  .insert({...})
  .select()
  .single();

if (appointmentError) {
  console.error('Appointment insert error:', appointmentError);
  throw appointmentError;
}
```

### Issue 2: Patient Creation Might Be Failing

If patient insert fails silently, `patientId` will be undefined.

### Issue 3: Clinic Fetch Might Be Failing

If clinic fetch fails, `clinic` will be null/undefined.

## Next Steps

1. **Run SQL queries** to check current data
2. **Check terminal logs** for errors
3. **Add error logging** to appointment insert
4. **Test again** with better logging
5. **Share terminal output** if errors appear

## Quick Fix: Add Error Logging

I'll add proper error logging to the appointment creation code so we can see what's failing.
