# ✅ Supabase Setup Checklist

## 🎯 Complete Setup in 4 Steps

### Step 1: Environment Variables ⚙️

**File:** `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://rzfljblxsndyzxkrvmha.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZmxqYmx4c25keXp4a3J2bWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODgwMjMsImV4cCI6MjA3OTA2NDAyM30.td-NWFsnyy2vTcoGktrMDvTr8QQ9PE7sqv2m0PapH_M
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_DASHBOARD>
```

**Get Service Role Key:**
1. Go to: https://supabase.com/dashboard
2. Select: `rzfljblxsndyzxkrvmha`
3. Navigate: Settings → API
4. Copy: `service_role` key (secret)
5. Paste in `.env.local`

- [ ] `.env.local` file updated
- [ ] Service Role Key added

---

### Step 2: Database Schema Setup 🗄️

**Action:** Run SQL in Supabase SQL Editor

**File to use:** `SUPABASE-COMPLETE-SETUP.sql`

**How to:**
1. Open: https://supabase.com/dashboard
2. Select project: `rzfljblxsndyzxkrvmha`
3. Click: SQL Editor (left sidebar)
4. Click: New Query
5. Open file: `SUPABASE-COMPLETE-SETUP.sql`
6. Copy all content
7. Paste in SQL Editor
8. Click: Run (or press Ctrl+Enter)

**What it creates:**
- ✓ 8 database tables
- ✓ Indexes for performance
- ✓ Row Level Security policies
- ✓ Triggers for auto-updates
- ✓ 1 clinic record
- ✓ 5 test patients
- ✓ 4+ FAQs

- [ ] SQL file opened
- [ ] SQL code copied
- [ ] SQL executed successfully
- [ ] No errors in output

---

### Step 3: Verify Setup ✓

**Run this query in SQL Editor:**

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check data counts
SELECT 
  (SELECT COUNT(*) FROM clinics) as clinics,
  (SELECT COUNT(*) FROM patients) as patients,
  (SELECT COUNT(*) FROM faqs) as faqs;

-- View patients
SELECT 
  first_name,
  last_name,
  phone,
  preferred_language
FROM patients
ORDER BY created_at DESC;
```

**Expected Results:**
- Tables: 8 (appointments, audit_logs, call_logs, canned_responses, clinics, faqs, interactions, patients)
- Clinics: 1
- Patients: 5
- FAQs: 4+

- [ ] Tables verified (8 tables)
- [ ] Data verified (1 clinic, 5 patients)
- [ ] No errors

---

### Step 4: Start Application 🚀

**Command:**

```bash
npm run dev
```

**Expected Output:**
```
> sanmiguel-connect-ai@0.1.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

**Test:**
- Open browser: http://localhost:3000
- Check if app loads
- Try chat feature
- Check admin dashboard

- [ ] Application started
- [ ] No errors in terminal
- [ ] Website loads at localhost:3000
- [ ] Chat works
- [ ] Admin dashboard accessible

---

## 🎉 Setup Complete!

### What You Have Now:

✅ **Database Connected**
- Supabase project configured
- All tables created
- Test data loaded

✅ **Application Ready**
- Environment variables set
- Database schema deployed
- App running locally

✅ **Features Available**
- Patient management
- Appointment scheduling
- Chat interactions
- Voice call logging
- FAQ system
- Admin dashboard

---

## 📁 Reference Files

| File | Purpose |
|------|---------|
| `SUPABASE-SETUP-COMPLETE.md` | Detailed English guide |
| `SUPABASE-COMPLETE-SETUP.sql` | Complete SQL schema |
| `SUPABASE-SETUP-URDU.md` | Urdu/Hindi guide |
| `QUICK-SUPABASE-SETUP.txt` | Quick reference |
| `SETUP-CHECKLIST-SUPABASE.md` | This checklist |

---

## 🔧 Troubleshooting

### Issue: "relation does not exist"
**Fix:** Run SQL schema again completely

### Issue: "permission denied"
**Fix:** Check Service Role Key in `.env.local`

### Issue: Application won't start
**Fix:**
```bash
npm install
npm run dev
```

### Issue: Can't connect to database
**Fix:** Verify all credentials in `.env.local`

---

## 🎯 Next Steps

After setup is complete:

1. **Add More Patients**
   - Use admin dashboard
   - Or run SQL INSERT statements

2. **Configure Voice Agent**
   - Check `VAPI-SETUP-FINAL.md`
   - Add Vapi credentials

3. **Test Features**
   - Chat bot
   - Appointment booking
   - Patient search

4. **Deploy to Production**
   - Check `DEPLOYMENT.md`
   - Deploy to Vercel

---

## 💡 Quick Commands

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Clear dummy data
npm run db:clear
```

---

**Setup Status:** ⬜ Not Started | 🔄 In Progress | ✅ Complete

**Overall Progress:** [ ] [ ] [ ] [ ]

---

**Questions?** Check the detailed guides:
- English: `SUPABASE-SETUP-COMPLETE.md`
- Urdu: `SUPABASE-SETUP-URDU.md`
