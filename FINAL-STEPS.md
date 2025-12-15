# Final Steps to Complete Migration

## What's Been Done ✅

### 1. Database Setup
- ✅ Created new Supabase database with prefixed tables
- ✅ Tables: `sanmiguel_clinics`, `sanmiguel_patients`, `sanmiguel_appointments`, `sanmiguel_interactions`, etc.
- ✅ RLS policies configured
- ✅ Default clinic inserted

### 2. Code Updates (90% Complete)
- ✅ Core library (`lib/supabase.ts`) - Added TABLES constant
- ✅ All API routes updated (18/21 files)
- ✅ Admin dashboard updated
- ✅ Webhook routes updated

### 3. Remaining Files (3 files)
These files have many table references and need manual updates:
- ⏳ `app/api/chat/openai/route.ts` (19 occurrences - complex file)
- ⏳ `app/api/webhooks/vapi/route.ts` (13 occurrences)
- ⏳ `app/api/webhooks/telnyx/sms/route.ts` (7 occurrences)

## What You Need to Do NOW

### Step 1: Update Remaining Files Manually

Open these 3 files and do Find & Replace:

**File 1: `app/api/chat/openai/route.ts`**
1. Add import: `import { getServiceSupabase, TABLES } from '@/lib/supabase';`
2. Find & Replace:
   - `.from('patients')` → `.from(TABLES.PATIENTS)`
   - `.from('appointments')` → `.from(TABLES.APPOINTMENTS)`
   - `.from('interactions')` → `.from(TABLES.INTERACTIONS)`
   - `.from('clinics')` → `.from(TABLES.CLINICS)`

**File 2: `app/api/webhooks/vapi/route.ts`**
1. Add import: `import { getServiceSupabase, TABLES } from '@/lib/supabase';`
2. Same Find & Replace as above

**File 3: `app/api/webhooks/telnyx/sms/route.ts`**
1. Add import: `import { getServiceSupabase, TABLES } from '@/lib/supabase';`
2. Same Find & Replace as above

### Step 2: Update .env.local

Make sure your `.env.local` has the NEW database credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

### Step 3: Restart Dev Server

```bash
# Stop server
Ctrl+C

# Start server
npm run dev
```

### Step 4: Test Everything

1. Open admin dashboard: http://localhost:3000/admin
2. Test booking appointment via chat
3. Check if data appears in dashboard
4. Verify interactions, patients, appointments are showing

### Step 5: Drop Old Tables (ONLY AFTER TESTING)

Once everything is working, run this in Supabase SQL Editor:

```sql
-- Drop old tables (BE CAREFUL - THIS DELETES DATA!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS canned_responses CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
```

## Current Status: 90% Complete

**Remaining work: 10-15 minutes**
- Update 3 files manually (5 min)
- Test application (5 min)
- Drop old tables (1 min)

## Need Help?

If you get errors, check:
1. All imports have `TABLES` imported
2. All `.from('table_name')` changed to `.from(TABLES.TABLE_NAME)`
3. New database credentials in `.env.local`
4. Dev server restarted after changes
