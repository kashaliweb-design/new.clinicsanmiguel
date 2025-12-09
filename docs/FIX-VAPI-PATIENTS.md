# 🔧 Fix VAPI Patient Creation Issue

## Problem
- Dummy test patients showing in dashboard
- VAPI calls not creating real patient data
- Need to clear test data and verify webhook

## Solution Steps

### Step 1: Clear Dummy Patient Data

**Option A: Using Supabase Dashboard**
1. Go to: https://supabase.com
2. Open your project
3. Click "SQL Editor" in left menu
4. Copy and paste from `CLEAR-DUMMY-PATIENTS.sql`
5. Click "Run"

**Option B: Quick Delete Query**
```sql
-- Delete test patients
DELETE FROM patients 
WHERE phone IN (
  '+14155551234',
  '+14155555678',
  '+14155559012',
  '+14155553456',
  '+14155557890'
);

-- Verify
SELECT * FROM patients;
```

### Step 2: Verify VAPI Webhook Configuration

**Check VAPI Dashboard:**
1. Go to: https://vapi.ai
2. Open your assistant
3. Click "Server Settings"
4. Verify Server URL is: 
   ```
   https://newclinicsanmiguel.vercel.app/api/webhooks/vapi
   ```

**Important:** Make sure it's your **production URL**, not localhost!

### Step 3: Test VAPI Call

**Make a Test Call:**
1. Go to your website
2. Click "Talk to AI Assistant"
3. Say clearly:
   ```
   "Hi, I'd like to schedule an appointment"
   "My name is [Your Full Name]"
   "My date of birth is [Month Day, Year]"
   "My email is [your@email.com]"
   ```
4. End the call

### Step 4: Check Server Logs

**In Terminal (where npm run dev is running):**
Look for these logs:
```
=== VAPI CALL ENDED ===
Call ID: xxx
Phone Number: xxx
Transcript: [...]
=== EXTRACTED PATIENT INFO ===
{
  "first_name": "Your Name",
  "last_name": "Your Last Name",
  ...
}
```

### Step 5: Check Database

**In Supabase SQL Editor:**
```sql
-- Check latest patients
SELECT 
  first_name,
  last_name,
  phone,
  email,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 5;
```

## Common Issues & Fixes

### Issue 1: Webhook Not Receiving Calls

**Symptom:** No logs in terminal when call ends

**Fix:**
1. Check VAPI webhook URL is correct
2. Verify production URL (not localhost)
3. Check Vercel deployment is live
4. Test webhook manually:
   ```bash
   curl -X POST https://newclinicsanmiguel.vercel.app/api/webhooks/vapi \
     -H "Content-Type: application/json" \
     -d '{"type":"end-of-call-report","message":{"call":{"id":"test"}}}'
   ```

### Issue 2: Patient Info Not Extracted

**Symptom:** Logs show empty patient info

**Fix:**
1. Speak clearly during call
2. Provide information in this format:
   - "My name is John Smith"
   - "My date of birth is January 15, 1990"
   - "My email is john@example.com"
3. Check transcript in logs
4. Verify extraction patterns are matching

### Issue 3: Duplicate Patients

**Symptom:** Multiple patients with same phone

**Fix:**
```sql
-- Find duplicates
SELECT phone, COUNT(*) 
FROM patients 
GROUP BY phone 
HAVING COUNT(*) > 1;

-- Keep only latest, delete older ones
DELETE FROM patients a
USING patients b
WHERE a.id < b.id 
AND a.phone = b.phone;
```

### Issue 4: Phone Number Format

**Symptom:** Patient created but phone doesn't match

**Fix:**
- VAPI sends phone in format: `+1XXXXXXXXXX`
- Ensure database stores same format
- Check webhook logs for actual phone format

## Verification Checklist

After fixing, verify:
- [ ] Dummy patients deleted from database
- [ ] VAPI webhook URL is production URL
- [ ] Test call creates new patient
- [ ] Patient info extracted correctly
- [ ] Patient appears in dashboard
- [ ] Real-time update works
- [ ] No duplicate patients

## Testing Script

### Complete Test Flow:
```
1. Clear Database:
   - Run CLEAR-DUMMY-PATIENTS.sql
   - Verify: SELECT COUNT(*) FROM patients; (should be 0)

2. Make VAPI Call:
   - Open website
   - Click "Talk to AI Assistant"
   - Provide: Name, DOB, Email
   - End call

3. Check Logs:
   - Terminal should show extraction logs
   - Look for "EXTRACTED PATIENT INFO"

4. Check Dashboard:
   - Open /admin/patients
   - Should see new patient with your details
   - NOT "Voice Caller"

5. Verify Real-Time:
   - Open /admin/patients in 2 tabs
   - Make another call
   - Watch patient appear in both tabs
```

## Debug Commands

### Check Current Patients:
```sql
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  created_at
FROM patients
ORDER BY created_at DESC;
```

### Check Recent Interactions:
```sql
SELECT 
  id,
  patient_id,
  channel,
  message_body,
  created_at
FROM interactions
WHERE channel = 'voice'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Webhook Logs:
```bash
# In terminal where dev server is running
# Look for:
"=== VAPI CALL ENDED ==="
"=== EXTRACTED PATIENT INFO ==="
"Created new patient from call end with details:"
```

## Expected Behavior

### Before Fix:
```
Patients List:
- John Doe (dummy)
- Maria Garcia (dummy)
- Sarah Johnson (dummy)
- Carlos Rodriguez (dummy)
- Emily Chen (dummy)
```

### After Fix:
```
Patients List:
(empty or only real patients from VAPI calls)
```

### After Test Call:
```
Patients List:
- [Your Name] (from VAPI call)
  Phone: [Your Phone]
  Email: [Your Email]
  DOB: [Your DOB]
  Created: Just now
```

## Production Deployment

### If Using Vercel:
```bash
# Push changes to GitHub
git add .
git commit -m "fix: Enhanced VAPI webhook logging"
git push origin main

# Vercel will auto-deploy
# Wait 1-2 minutes
# Test with new deployment
```

### Update VAPI Webhook:
```
Old: https://newclinicsanmiguel.vercel.app/api/webhooks/vapi
New: (same, but ensure it's updated after deployment)
```

## Success Indicators

✅ Dummy patients deleted
✅ VAPI webhook receiving calls
✅ Logs show patient extraction
✅ Real patient data in database
✅ Dashboard shows real patients
✅ Real-time updates working
✅ No "Voice Caller" placeholders

## Still Not Working?

### Check These:
1. **Supabase Connection:**
   ```bash
   # In .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

2. **VAPI Configuration:**
   - Webhook URL correct
   - Assistant prompt includes data collection
   - Timeout set to 20 seconds

3. **Server Running:**
   ```bash
   npm run dev
   # Should see: Ready on http://localhost:3000
   ```

4. **Database Permissions:**
   - Check RLS policies allow inserts
   - Verify anon key has permissions

## Contact Support

If still having issues:
1. Check terminal logs
2. Check Supabase logs
3. Check VAPI logs
4. Share error messages

---

## Quick Fix Commands

```bash
# 1. Clear dummy data (in Supabase SQL Editor)
DELETE FROM patients WHERE phone LIKE '+1415555%';

# 2. Restart dev server
# Ctrl+C to stop
npm run dev

# 3. Make test call
# Speak clearly: name, DOB, email

# 4. Check result
# Open /admin/patients
# Should see real patient data
```

**Good luck! Your VAPI patient creation should work now!** 🚀
