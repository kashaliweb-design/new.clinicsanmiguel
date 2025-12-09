# 🚀 START HERE - Supabase Database Setup

## 📌 Quick Overview

Aapka Supabase database setup karne ke liye **sirf 10 minutes** chahiye!

**Your Credentials:**
- **URL:** `https://rzfljblxsndyzxkrvmha.supabase.co`
- **Anon Key:** Already provided below ⬇️

---

## ⚡ Super Quick Setup (3 Steps)

### 1️⃣ Update `.env.local` (2 minutes)

Open `.env.local` file and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rzfljblxsndyzxkrvmha.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZmxqYmx4c25keXp4a3J2bWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODgwMjMsImV4cCI6MjA3OTA2NDAyM30.td-NWFsnyy2vTcoGktrMDvTr8QQ9PE7sqv2m0PapH_M
```

**⚠️ Also need Service Role Key:**
- Go to: https://supabase.com/dashboard
- Settings → API → Copy `service_role` key
- Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

---

### 2️⃣ Run SQL (5 minutes)

1. Open: https://supabase.com/dashboard
2. Select: Your project (`rzfljblxsndyzxkrvmha`)
3. Go to: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Open file: `SUPABASE-COMPLETE-SETUP.sql`
6. Copy ALL content
7. Paste in SQL Editor
8. Click: **Run** (or Ctrl+Enter)

✅ Done! Database created with test data.

---

### 3️⃣ Start App (1 minute)

```bash
npm run dev
```

Open: http://localhost:3000

**🎉 Done! Your app is running!**

---

## 📚 Detailed Guides Available

Choose your language:

### English 🇺🇸
- **Complete Guide:** `SUPABASE-SETUP-COMPLETE.md`
- **Quick Reference:** `QUICK-SUPABASE-SETUP.txt`
- **Checklist:** `SETUP-CHECKLIST-SUPABASE.md`

### Urdu/Hindi 🇵🇰
- **آسان گائیڈ:** `SUPABASE-SETUP-URDU.md`

### SQL File
- **Complete Schema:** `SUPABASE-COMPLETE-SETUP.sql`

---

## 🎯 What Gets Created

### Database Tables (8)
1. **clinics** - Clinic information
2. **patients** - Patient records (5 test patients)
3. **appointments** - Appointment scheduling
4. **interactions** - Chat/SMS/Voice logs
5. **faqs** - FAQs (4+ entries)
6. **canned_responses** - Pre-written responses
7. **call_logs** - Voice call records
8. **audit_logs** - System audit trail

### Test Data
- ✅ 1 Clinic (Clínica San Miguel)
- ✅ 5 Test Patients
- ✅ 4+ FAQs (English & Spanish)

---

## ✅ Verification

After running SQL, verify with:

```sql
SELECT 
  (SELECT COUNT(*) FROM clinics) as clinics,
  (SELECT COUNT(*) FROM patients) as patients,
  (SELECT COUNT(*) FROM faqs) as faqs;
```

**Expected:**
- clinics: 1
- patients: 5
- faqs: 4+

---

## 🔧 Common Issues

### "relation does not exist"
→ Run SQL file again completely

### "permission denied"
→ Check Service Role Key in `.env.local`

### App won't start
→ Run: `npm install` then `npm run dev`

---

## 🎨 Features Ready

After setup, you can:

✅ **Manage Patients**
- Add/edit/delete patients
- View patient history
- Search patients

✅ **Schedule Appointments**
- Book appointments
- Confirm/cancel
- View calendar

✅ **Chat System**
- Web chat
- SMS integration
- Voice calls

✅ **Admin Dashboard**
- View analytics
- Manage data
- System settings

---

## 📞 Support

Need help? Check these files:

1. **Detailed Setup:** `SUPABASE-SETUP-COMPLETE.md`
2. **Urdu Guide:** `SUPABASE-SETUP-URDU.md`
3. **Quick Ref:** `QUICK-SUPABASE-SETUP.txt`
4. **Checklist:** `SETUP-CHECKLIST-SUPABASE.md`

---

## 🚀 Ready to Start?

Follow the 3 steps above:

1. ✅ Update `.env.local`
2. ✅ Run SQL in Supabase
3. ✅ Start app with `npm run dev`

**Time needed:** ~10 minutes

**Let's go! 🎉**

---

## 📋 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Your Project:** https://rzfljblxsndyzxkrvmha.supabase.co
- **Local App:** http://localhost:3000 (after `npm run dev`)

---

## 🎯 Next Steps After Setup

1. **Test the app** - Try chat, add patients
2. **Configure Vapi** - For voice features (see `VAPI-SETUP-FINAL.md`)
3. **Deploy** - Deploy to Vercel (see `DEPLOYMENT.md`)
4. **Customize** - Add your clinic's data

---

**Happy Coding! 💻✨**
