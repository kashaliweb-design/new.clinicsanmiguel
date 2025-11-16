# Quick Start Guide - SanMiguel Connect AI

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Your `.env.local` file is already created with your credentials. Just add the missing keys:

1. **Get Supabase Service Role Key**:
   - Go to https://supabase.com/dashboard/project/fuctflfnzdjhdwwittmn/settings/api
   - Copy the `service_role` key
   - Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

2. **Get Telnyx API Key** (if using SMS):
   - Go to https://portal.telnyx.com
   - Navigate to API Keys
   - Create a new key
   - Add to `.env.local`: `TELNYX_API_KEY=your_key_here`
   - Add your phone number: `TELNYX_PHONE_NUMBER=+1234567890`

### Step 3: Set Up Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/fuctflfnzdjhdwwittmn

2. Click "SQL Editor" in the left sidebar

3. Create a new query and paste the contents of `supabase/schema.sql`

4. Click "Run" to create all tables

5. Create another query and paste the contents of `supabase/seed.sql`

6. Click "Run" to add test data

### Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 - you should see the landing page!

### Step 5: Test the Chat Widget

1. Click the chat button in the bottom right corner
2. Try asking: "What are your hours?"
3. The AI should respond with clinic hours

## 📱 Testing SMS (Optional)

To test SMS functionality:

1. Install ngrok: https://ngrok.com/download

2. Start ngrok:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Telnyx portal, set your SMS webhook to:
   `https://abc123.ngrok.io/api/webhooks/telnyx/sms`

5. Send an SMS to your Telnyx number

6. Check your terminal for webhook logs

## 🎯 What's Included

### ✅ Phase 0 & 1 Complete
- **Web Chat Widget**: Embeddable, responsive chat interface
- **SMS Integration**: Telnyx webhook handler
- **API Endpoints**: Chat, FAQs, Clinics, Appointments
- **Database**: Full schema with test data
- **Admin Dashboard**: View interactions and appointments

### 📋 Coming Soon (Phases 2-7)
- Voice calls via Telnyx
- Full appointment CRUD
- Human handoff & agent UI
- RAG & knowledge base
- Production hardening

## 🔗 Important URLs

- **Main Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Appointments**: http://localhost:3000/admin/appointments
- **API Health**: http://localhost:3000/api/chat (GET)

## 🧪 Test Data

The seed file includes:

- **2 Clinics**: Downtown & North
- **3 Patients**: Maria Garcia, John Smith, Lisa Chen
- **3 Appointments**: Various statuses
- **7 FAQs**: English & Spanish
- **Phone Numbers**: +14155552001, +14155552002, +14155552003

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
- Check your Supabase URL and keys in `.env.local`
- Verify the project is not paused in Supabase dashboard

### Chat not responding
- Check browser console for errors
- Verify Vapi keys are correct
- Check terminal for API errors

### SMS not working
- Verify Telnyx webhook URL is correct
- Check Telnyx dashboard for delivery status
- Ensure ngrok is running (for local development)

## 📚 Next Steps

1. **Customize the UI**: Edit `app/page.tsx` and `components/ChatWidget.tsx`

2. **Add More FAQs**: Insert into `faqs` table in Supabase

3. **Configure Vapi**: Set up custom prompts and intents

4. **Deploy**: Follow `DEPLOYMENT.md` for production deployment

5. **Add Features**: Implement Phase 2 (appointment confirmation)

## 💡 Pro Tips

- Use the admin dashboard to monitor interactions
- Test with different intents: hours, appointments, services
- Check Supabase logs for database queries
- Use browser DevTools Network tab to debug API calls

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for deployment guides
- Check API routes in `app/api/` for endpoint details
- Review database schema in `supabase/schema.sql`

## 🎉 You're Ready!

Your SanMiguel Connect AI is now running. Start chatting and exploring the features!
