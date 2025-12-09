# Project Structure - Clinica San Miguel AI Assistant

## 📁 Organized Folder Structure

```
pdate-agent/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── appointments/         # Appointment management APIs
│   │   ├── chat/                 # Chat APIs (book, reschedule, cancel)
│   │   └── vapi/                 # VAPI voice assistant APIs
│   ├── admin/                    # Admin dashboard pages
│   │   └── appointments/         # Appointments management page
│   └── page.tsx                  # Main homepage
│
├── components/                   # React Components
│   ├── VapiVoiceCall.tsx        # Voice call button component
│   └── WebChat.tsx              # Web chat widget component
│
├── lib/                         # Utility libraries
│   ├── supabase.ts              # Supabase client configuration
│   └── vapi.ts                  # VAPI client configuration
│
├── data/                        # Static data files
│   └── us-locations.json        # Texas clinic locations
│
├── supabase/                    # Database files
│   ├── schema.sql               # Main database schema
│   ├── seed.sql                 # Seed data
│   ├── migrations/              # SQL migration files
│   │   ├── SUPABASE-COMPLETE-SETUP.sql
│   │   ├── AUTO-CREATE-PATIENTS-TRIGGER.sql
│   │   └── ... (other migration files)
│   └── *.sql                    # Utility SQL scripts
│
├── config/                      # Configuration files
│   └── vapi-function-tool-config.json
│
├── docs/                        # Documentation (88 files)
│   ├── VOICE-AGENT-APPOINTMENT-GUIDE.md
│   ├── APPOINTMENT-SYSTEM-SUMMARY.md
│   ├── CHATBOT-URDU-GUIDE.md
│   └── ... (all other documentation)
│
├── scripts/                     # Utility scripts
│
├── types/                       # TypeScript type definitions
│
├── .env.local                   # Environment variables (not in git)
├── package.json                 # Dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── README.md                    # Main project README
```

---

## 🗂️ Key Directories Explained

### `/app` - Application Code
- **Main Pages:** Homepage, admin dashboard
- **API Routes:** All backend endpoints for appointments, chat, voice
- **Server Components:** Next.js 13+ App Router structure

### `/components` - Reusable UI Components
- `VapiVoiceCall.tsx` - Voice call button with VAPI integration
- `WebChat.tsx` - Chat widget with appointment booking flow

### `/supabase` - Database Management
- **schema.sql** - Complete database structure (tables, indexes, RLS)
- **seed.sql** - Initial data (clinics, test patients)
- **migrations/** - All SQL migration files organized in one place

### `/docs` - Documentation Archive
All documentation files moved here for clean root directory:
- Setup guides
- Feature documentation
- Troubleshooting guides
- Urdu/English guides

### `/config` - Configuration Files
- VAPI function tool configurations
- Other service configurations

---

## 🚀 Important Files

### Root Level
- **README.md** - Main project documentation
- **package.json** - Project dependencies
- **.env.local** - Environment variables (Supabase, VAPI keys)

### Database
- `supabase/schema.sql` - Start here for database structure
- `supabase/seed.sql` - Initial data setup
- `supabase/migrations/SUPABASE-COMPLETE-SETUP.sql` - Complete setup script

### API Endpoints
- `app/api/chat/book-appointment/route.ts` - Chat booking
- `app/api/vapi/book-appointment/route.ts` - Voice booking
- `app/api/appointments/route.ts` - Appointment management

### Admin Dashboard
- `app/admin/appointments/page.tsx` - View all appointments

---

## 📝 Quick Navigation

### For Development:
- **Frontend:** `/app/page.tsx`, `/components/`
- **Backend:** `/app/api/`
- **Database:** `/supabase/schema.sql`
- **Docs:** `/docs/` (88 documentation files)

### For Deployment:
- Check `.env.local` for environment variables
- Run migrations from `/supabase/migrations/`
- Review `/docs/DEPLOYMENT.md`

---

## 🧹 Cleanup Summary

### What Was Organized:
✅ **29 SQL files** moved to `supabase/migrations/`  
✅ **88 documentation files** moved to `docs/`  
✅ **Config files** moved to `config/`  
✅ **Root directory cleaned** - only essential files remain

### Clean Root Directory Now Contains:
- Configuration files (.env, package.json, etc.)
- README.md
- Core folders (app, components, lib, etc.)

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Project Structure Organized & Clean
