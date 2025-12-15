# Environment Variables Update Guide
## Admin Panel Data Not Showing - FIX

---

## Problem
Your admin pages are showing **NO DATA** because:
- ❌ Supabase URL is invalid: `https://fuctflfnzdjhdwwittmn.supabase.co`
- ❌ Error: `ERR_NAME_NOT_RESOLVED`
- ❌ Service Role Key is placeholder: `your_service_role_key_here`

---

## Solution: Update .env.local File

### Step 1: Get Your NEW Supabase Credentials

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your **ACTIVE/NEW** project (not the old one)

2. **Get Project URL**
   - Go to **Settings** → **API**
   - Copy the **Project URL**
   - Example: `https://abcdefgh.supabase.co`

3. **Get Anon Key**
   - In same page, copy **anon/public key**
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Get Service Role Key** ⚠️ IMPORTANT
   - In same page, copy **service_role key** (NOT anon key)
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This is DIFFERENT from anon key!

---

### Step 2: Update .env.local File

Open `.env.local` and replace with your NEW credentials:

```env
# Supabase - NEW DATABASE
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY_HERE

# Other environment variables (keep as is)
OPENAI_API_KEY=your_openai_key
TELNYX_API_KEY=your_telnyx_key
# ... etc
```

---

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl + C in terminal)
# Then restart:
npm run dev
```

---

### Step 4: Verify Connection

After restarting, check:

1. **Open Admin Dashboard**: http://localhost:3000/admin
2. **Check Console** - Should see:
   - ✅ No `ERR_NAME_NOT_RESOLVED` errors
   - ✅ No `fetch failed` errors
   - ✅ Data loading successfully

3. **Check Admin Pages**:
   - ✅ `/admin/appointments` - Shows appointments
   - ✅ `/admin/interactions` - Shows chatbot conversations
   - ✅ `/admin/patients` - Shows patient list

---

## Quick Test Command

Run this to verify database connection:

```bash
node scripts/check-database.js
```

Should show:
```
✅ Found X patients
✅ Found X appointments
✅ Found X interactions
```

---

## If You Don't Have a New Database Yet

### Option 1: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Fill in details:
   - Name: `Clinica San Miguel`
   - Database Password: (create strong password)
   - Region: (closest to you)
4. Wait for project to be created
5. Run migration SQL:
   - Open SQL Editor
   - Copy contents of `supabase/migrations/MIGRATE-TO-NEW-DATABASE.sql`
   - Paste and run
6. Get new credentials from Settings → API
7. Update `.env.local`

### Option 2: Use Existing Project

If you already have a working Supabase project:
1. Find it in your dashboard
2. Get credentials from Settings → API
3. Update `.env.local`

---

## Common Mistakes

❌ **Using anon key instead of service_role key**
- Service role key is needed for admin APIs
- Anon key has limited permissions

❌ **Using old/deleted project URL**
- Check if project exists in dashboard
- Use active project URL

❌ **Not restarting server after changes**
- Always restart `npm run dev` after .env changes

❌ **Typos in environment variable names**
- Must be exact: `NEXT_PUBLIC_SUPABASE_URL`
- Must be exact: `SUPABASE_SERVICE_ROLE_KEY`

---

## Success Indicators

✅ No console errors
✅ Admin pages load data
✅ Chatbot saves interactions
✅ Appointments show in admin panel
✅ Patient details visible

---

## Need Help?

1. Verify Supabase project exists and is active
2. Double-check all three credentials are correct
3. Ensure service_role key is different from anon key
4. Restart development server
5. Clear browser cache if needed

---

**After updating .env.local, everything should work! 🎉**
