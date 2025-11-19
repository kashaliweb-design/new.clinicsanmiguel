# 🔧 Fix Dashboard Stats (Patients & Appointments showing 0)

## Problem
Dashboard shows:
- ✅ Total Interactions: 382 (working)
- ❌ Total Appointments: 0 (not working)
- ❌ Total Patients: 0 (not working)
- ✅ Today's Activity: 195 (working)

## Root Cause
**Row Level Security (RLS)** policies are blocking the count queries for patients and appointments tables.

## Solution

### Step 1: Check Database (Supabase SQL Editor)

**Run this query:**
```sql
-- Check if data exists
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as total_interactions FROM interactions;
```

**Expected Result:**
- If you see numbers > 0, RLS is the issue
- If you see 0, tables are actually empty

### Step 2: Fix RLS Policies

**Go to Supabase SQL Editor and run:**

```sql
-- Enable RLS with proper policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for PATIENTS
CREATE POLICY "Enable read access for all users" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patients
  FOR UPDATE USING (true);

-- Create policies for APPOINTMENTS
CREATE POLICY "Enable read access for all users" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointments
  FOR UPDATE USING (true);
```

### Step 3: Verify Fix

**Refresh your dashboard:**
```
https://newclinicsanmiguel.vercel.app/admin
```

**Should now show:**
- ✅ Total Patients: [actual count]
- ✅ Total Appointments: [actual count]

## Alternative: Quick Fix (Disable RLS Temporarily)

**If you want to test quickly:**

```sql
-- Disable RLS (NOT recommended for production)
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

**Then refresh dashboard.**

## Why Interactions Works But Patients/Appointments Don't?

**Reason:** 
- `interactions` table already has proper RLS policies
- `patients` and `appointments` tables have restrictive policies or no policies

## Detailed Steps

### Option 1: Using Supabase Dashboard (GUI)

1. **Go to:** https://supabase.com
2. **Select:** Your project
3. **Click:** Authentication → Policies
4. **Find:** `patients` table
5. **Click:** "New Policy"
6. **Select:** "Enable read access for all users"
7. **Click:** "Review" → "Save policy"
8. **Repeat** for `appointments` table

### Option 2: Using SQL (Recommended)

**Use the file:** `FIX-RLS-POLICIES.sql`

1. Open Supabase SQL Editor
2. Copy entire content from `FIX-RLS-POLICIES.sql`
3. Click "Run"
4. Verify policies created

## Verification Commands

### Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'interactions');
```

### Check existing policies:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('patients', 'appointments', 'interactions');
```

### Test data access:
```sql
-- Should return actual counts
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM appointments;
SELECT COUNT(*) FROM interactions;
```

## Expected Results After Fix

### Dashboard Stats:
```
Total Interactions: 382 ✅
Total Appointments: [your count] ✅
Total Patients: [your count] ✅
Today's Activity: 195 ✅
```

### Console Logs:
```javascript
Stats loaded: {
  interactions: 382,
  appointments: [your count],  // Not 0 anymore!
  patients: [your count],      // Not 0 anymore!
  today: 195
}
```

## Common Issues

### Issue 1: Still showing 0 after RLS fix

**Solution:**
```sql
-- Check if data actually exists
SELECT * FROM patients LIMIT 5;
SELECT * FROM appointments LIMIT 5;
```

If empty, you need to add data.

### Issue 2: RLS policies not applying

**Solution:**
```sql
-- Drop all policies and recreate
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;

-- Then recreate (see Step 2 above)
```

### Issue 3: Permission denied error

**Solution:**
Check if you're using the correct Supabase keys in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing After Fix

### Test 1: Dashboard Stats
1. Open: `/admin`
2. Check all 4 stat cards
3. All should show numbers

### Test 2: Patients Page
1. Open: `/admin/patients`
2. Should see patient list
3. Add new patient
4. Should appear in list

### Test 3: Appointments Page
1. Open: `/admin/appointments`
2. Should see appointments
3. Create via VAPI
4. Should appear automatically

### Test 4: Real-Time Updates
1. Open dashboard in 2 tabs
2. Add patient in tab 1
3. Stats update in tab 2 automatically

## Files Created

1. ✅ `CHECK-DATABASE.sql` - Check what's in database
2. ✅ `FIX-RLS-POLICIES.sql` - Fix RLS policies
3. ✅ `FIX-DASHBOARD-STATS.md` - This guide

## Quick Commands

### Check Data:
```sql
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM appointments;
```

### Fix RLS:
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON patients FOR SELECT USING (true);
```

### Disable RLS (Quick Test):
```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

## Important Notes

⚠️ **Security Warning:**
- Disabling RLS completely is NOT recommended for production
- Always use proper policies
- Test with RLS enabled

✅ **Best Practice:**
- Keep RLS enabled
- Create specific policies for each operation
- Use `USING (true)` for public access
- Or create user-specific policies for better security

## Summary

**Problem:** RLS blocking patient/appointment counts
**Solution:** Create proper RLS policies
**Time:** 2-3 minutes to fix
**Result:** All dashboard stats working

---

**After fixing, your dashboard will show correct counts!** ✅
