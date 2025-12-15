# Database Migration Guide

## Current Situation
- Old database has table names: `patients`, `appointments`, `interactions`, etc.
- RLS policies are causing issues with data visibility

## Two Options Available

### Option 1: Fix Current Database (RECOMMENDED) ✅

**Pros:**
- No code changes needed
- Quick fix (5 minutes)
- No data migration needed

**Steps:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to SQL Editor
3. Run this script: `supabase/FIX-DATABASE-PERMISSIONS.sql`
4. Restart dev server
5. Done!

---

### Option 2: New Database with Prefixed Tables ⚠️

**Pros:**
- Clean separation if same project has multiple apps
- Better organization

**Cons:**
- Need to update 21+ files in codebase
- More time consuming (30-60 minutes)
- Risk of missing some references

**Steps:**

#### 1. Create New Supabase Project
- Go to https://supabase.com/dashboard
- Click "New Project"
- Name: `SanMiguel-Connect-New`
- Save database password

#### 2. Setup Database with Prefixed Tables
- Open SQL Editor in new project
- Run script: `supabase/SETUP-WITH-PREFIX.sql`
- This creates tables: `sanmiguel_patients`, `sanmiguel_appointments`, etc.

#### 3. Get New API Keys
- Settings → API
- Copy:
  - Project URL
  - anon public key
  - service_role secret key

#### 4. Update .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

#### 5. Update Application Code (Manual)

You need to update these files to use new table names:

**Core Files (21 files need changes):**
- app/api/chat/openai/route.ts (19 occurrences)
- app/api/webhooks/vapi/route.ts (13 occurrences)
- app/api/webhooks/telnyx/sms/route.ts (7 occurrences)
- app/api/chat/book-appointment/route.ts (6 occurrences)
- app/api/chat/delete-appointment/route.ts (6 occurrences)
- app/api/vapi/book-appointment/route.ts (6 occurrences)
- app/admin/page.tsx (5 occurrences)
- app/api/chat/cancel-appointment/route.ts (5 occurrences)
- app/api/chat/reschedule-appointment/route.ts (5 occurrences)
- And 12 more files...

**Find and Replace:**
- `.from('patients')` → `.from('sanmiguel_patients')`
- `.from('appointments')` → `.from('sanmiguel_appointments')`
- `.from('interactions')` → `.from('sanmiguel_interactions')`
- `.from('clinics')` → `.from('sanmiguel_clinics')`
- `.from('faqs')` → `.from('sanmiguel_faqs')`
- `.from('canned_responses')` → `.from('sanmiguel_canned_responses')`
- `.from('call_logs')` → `.from('sanmiguel_call_logs')`
- `.from('audit_logs')` → `.from('sanmiguel_audit_logs')`

#### 6. Test Everything
- Restart dev server
- Test chat booking
- Test admin dashboard
- Verify data is being stored

---

## My Recommendation

**Use Option 1** unless you have a specific reason to use prefixed tables.

The RLS policy fix is simple and works perfectly. Prefixed tables add unnecessary complexity for a single application.

If you still want prefixed tables, I can help update all the code files, but it will take time and has risk of errors.

**What do you want to do?**
1. Fix current database (5 minutes) ✅
2. Create new database with prefixed tables (30-60 minutes) ⚠️
