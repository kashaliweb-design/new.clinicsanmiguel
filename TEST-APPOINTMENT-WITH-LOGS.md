# Test Appointment Creation with Debug Logs

## What I Added

Added detailed logging to track appointment creation:
- ✅ Clinic fetch success/failure
- ✅ Patient ID validation
- ✅ Appointment data being sent
- ✅ Appointment insert success/failure
- ❌ Detailed error messages if anything fails

## How to Test

### Step 1: Restart Dev Server (CRITICAL)

```bash
Ctrl+C
npm run dev
```

### Step 2: Book Appointment via Chat

1. Open: http://localhost:3000
2. Say: "I want to book an appointment"
3. Provide details:
   - Name: "Test Patient"
   - Phone: "+1234567890"
   - Date: "2024-12-20"
   - Time: "2:00 PM"
   - Service: "General Consultation"

### Step 3: Watch Terminal Logs

You should see logs like:

**If Working:**
```
✅ Clinic found: abc-123-def
✅ Patient ID: xyz-456-ghi
📅 Creating appointment: { patient_id: '...', clinic_id: '...', ... }
✅ Appointment created successfully: appointment-id-here
```

**If Failing:**
```
❌ Error fetching clinic: { code: '...', message: '...' }
OR
❌ No active clinic found in database
OR
❌ Patient ID is missing
OR
❌ APPOINTMENT INSERT ERROR: { code: '...', message: '...' }
```

### Step 4: Check Database

After booking, run in Supabase SQL Editor:

```sql
-- Check if appointment was created
SELECT * FROM sanmiguel_appointments 
ORDER BY created_at DESC 
LIMIT 1;

-- Check patient
SELECT * FROM sanmiguel_patients 
ORDER BY created_at DESC 
LIMIT 1;
```

## What to Look For

### Terminal Logs Will Show:

1. **Clinic Issue**: If "❌ Error fetching clinic" or "❌ No active clinic found"
   - Problem: Clinic query failing
   - Fix: Check clinic table and RLS policies

2. **Patient Issue**: If "❌ Patient ID is missing"
   - Problem: Patient creation failed
   - Fix: Check patient creation code

3. **Appointment Insert Error**: If "❌ APPOINTMENT INSERT ERROR"
   - Problem: Database constraint or RLS policy
   - Error details will show exact issue
   - Common: Foreign key constraint, date format, RLS policy

4. **No Data Returned**: If "❌ Appointment was not created (no data returned)"
   - Problem: Insert succeeded but `.single()` failed
   - Fix: Remove `.single()` or check return

## Expected Flow

```
User books appointment
    ↓
✅ Fetch clinic (should find one of 4 clinics)
    ↓
✅ Create/fetch patient
    ↓
✅ Patient ID obtained
    ↓
📅 Prepare appointment data
    ↓
✅ Insert into sanmiguel_appointments
    ↓
✅ Return confirmation to user
```

## Next Steps

1. **Restart server**
2. **Book appointment**
3. **Copy terminal logs** (especially any ❌ errors)
4. **Share logs** so I can fix the exact issue
5. **Check database** to confirm

The logs will tell us exactly what's failing!
