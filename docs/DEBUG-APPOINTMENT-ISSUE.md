# 🔍 Debug: Appointment Not Being Created

## Current Status

### What's Working:
- ✅ VAPI calls working
- ✅ Intent detected: `appointment_booking`
- ✅ Interaction logged
- ✅ Message captured: "schedule appointment for following day at 2 PM"

### What's NOT Working:
- ❌ Appointment not created in database
- ❌ Dashboard shows: Total Appointments = 0

---

## Possible Issues

### Issue 1: Webhook Not Receiving end-of-call-report

**Check:** Is the webhook receiving the `end-of-call-report` event?

The appointment creation code runs in `handleCallEnd()` which is triggered by `end-of-call-report`.

**Solution:** Check Vercel function logs for:
```
=== VAPI CALL ENDED ===
=== CREATING APPOINTMENT ===
```

### Issue 2: Patient ID Not Found

**Check:** Is patient being created/found?

Code requires `patientId` to create appointment:
```javascript
if (intent === 'appointment_booking' && patientId) {
  // Create appointment
}
```

**Solution:** Check logs for:
```
Created new patient from call end with details
```

### Issue 3: Clinic Not Found

**Check:** Does clinic exist in database?

We already verified clinics exist, so this shouldn't be the issue.

### Issue 4: Appointment Insert Failing

**Check:** Is there a database error?

**Solution:** Check logs for:
```
Error creating appointment: [error message]
```

---

## How to Debug

### Step 1: Check Vercel Function Logs

1. Go to: https://vercel.com/kashaliweb-design/new-clinicsanmiguel
2. Click "Deployments"
3. Click latest deployment (c9aa88c)
4. Click "Functions" tab
5. Find `/api/webhooks/vapi`
6. Look for recent logs

### Step 2: Look for These Log Messages

**Expected logs for successful appointment creation:**
```
=== VAPI CALL ENDED ===
Call ID: [id]
Phone Number: [number]
=== EXTRACTED PATIENT INFO ===
{
  first_name: "...",
  last_name: "..."
}
=== CREATING APPOINTMENT ===
Extracted appointment info: {
  date: "2025-11-21",
  time: "14:00:00",
  reason: "General Consultation"
}
=== APPOINTMENT CREATED ===
Appointment ID: [id]
```

**If appointment not created, look for:**
```
No clinic found, skipping appointment creation
```
OR
```
Error creating appointment: [error]
```

### Step 3: Check Database Directly

Run in Supabase SQL Editor:
```sql
-- Check if any appointments exist
SELECT COUNT(*) FROM appointments;

-- Check recent appointments
SELECT * FROM appointments 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if patients are being created
SELECT * FROM patients 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Quick Test: Manual Appointment Creation

### Test if RLS is blocking inserts:

```sql
-- Try to insert appointment manually
INSERT INTO appointments (
  patient_id,
  clinic_id,
  appointment_date,
  appointment_time,
  reason,
  status,
  notes
) VALUES (
  (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM clinics LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  'Test Appointment',
  'scheduled',
  'Manual test'
);

-- Check if it worked
SELECT COUNT(*) FROM appointments;
```

**If this works:** RLS is fine, issue is in webhook code
**If this fails:** RLS policy missing for INSERT

---

## Most Likely Issue

Based on the symptoms, most likely:

1. **Webhook not receiving `end-of-call-report` event**
   - Only receiving `status-update` and `conversation-update`
   - Appointment creation code only runs on `end-of-call-report`

2. **Patient ID is null**
   - If phone number is "unknown" or "Web Caller"
   - Code skips appointment creation

---

## Immediate Actions

### Action 1: Check Vercel Logs
Look for webhook events and errors

### Action 2: Add More Logging
We can add more console.log statements to track the issue

### Action 3: Test with Real Phone Number
Try calling from actual phone (not web caller) to get proper phone number

---

## Next Steps

1. Check Vercel function logs
2. Report what you see
3. We'll add more debugging if needed
