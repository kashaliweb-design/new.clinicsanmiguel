# Setup Checklist - SanMiguel Connect AI

## ✅ Pre-Setup (Already Done)

- [x] Project structure created
- [x] All code files generated
- [x] Environment variables configured (partial)
- [x] Dependencies defined in package.json
- [x] Database schema created
- [x] Seed data prepared
- [x] Documentation written

## 📋 Your Setup Tasks (Do These Now)

### 1. Complete Installation
```bash
# If npm install is still running, wait for it to complete
# Check terminal for completion message
```

### 2. Add Missing Environment Variables

Open `.env.local` and add:

```bash
# Get this from: https://supabase.com/dashboard/project/fuctflfnzdjhdwwittmn/settings/api
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: For SMS functionality
TELNYX_API_KEY=your_telnyx_api_key_here
TELNYX_PHONE_NUMBER=+1234567890
```

### 3. Set Up Supabase Database

- [ ] Go to https://supabase.com/dashboard/project/fuctflfnzdjhdwwittmn
- [ ] Click "SQL Editor" in sidebar
- [ ] Create new query
- [ ] Copy contents of `supabase/schema.sql`
- [ ] Paste and click "Run"
- [ ] Wait for success message
- [ ] Create another new query
- [ ] Copy contents of `supabase/seed.sql`
- [ ] Paste and click "Run"
- [ ] Verify data in "Table Editor"

### 4. Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 5. Test the Application

- [ ] Open http://localhost:3000 in browser
- [ ] Verify landing page loads
- [ ] Click chat widget (bottom right)
- [ ] Send test message: "What are your hours?"
- [ ] Verify AI responds
- [ ] Open http://localhost:3000/admin
- [ ] Verify dashboard shows stats
- [ ] Click "Appointments" tab
- [ ] Verify test appointments appear

### 6. Test API Endpoints

Open new terminal and test:

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test clinics endpoint
curl http://localhost:3000/api/clinics

# Test FAQs endpoint
curl http://localhost:3000/api/faqs?q=hours
```

## 🔧 Optional Setup (For SMS Testing)

### 7. Configure Telnyx (Optional)

Only if you want to test SMS:

- [ ] Sign up at https://telnyx.com
- [ ] Purchase a phone number
- [ ] Get API key from dashboard
- [ ] Add to `.env.local`
- [ ] Install ngrok: `npm install -g ngrok`
- [ ] Run: `ngrok http 3000`
- [ ] Copy HTTPS URL
- [ ] Set Telnyx webhook to: `https://your-ngrok-url.ngrok.io/api/webhooks/telnyx/sms`
- [ ] Send test SMS to your Telnyx number

### 8. Configure Vapi (Optional)

To customize AI behavior:

- [ ] Go to https://dashboard.vapi.ai
- [ ] Create/configure assistant
- [ ] Update system prompts in `lib/vapi.ts`
- [ ] Test responses

## 🎯 Verification Checklist

### Must Pass
- [ ] No errors in terminal
- [ ] Landing page loads without errors
- [ ] Chat widget opens and closes
- [ ] Chat sends and receives messages
- [ ] Admin dashboard loads
- [ ] Appointments page shows data
- [ ] Browser console has no critical errors

### Should Pass
- [ ] Chat responses are relevant
- [ ] Admin stats show correct numbers
- [ ] Appointments display correctly
- [ ] Navigation works smoothly
- [ ] Mobile responsive (test on phone)

### Nice to Have
- [ ] SMS webhook receives messages
- [ ] SMS responses are sent
- [ ] All API endpoints return valid JSON
- [ ] TypeScript has no errors

## 🐛 Troubleshooting

### Issue: npm install fails
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: "Cannot find module" errors
**Solution:** Wait for npm install to complete, then restart dev server

### Issue: Database connection error
**Solution:** 
- Verify Supabase URL and keys in `.env.local`
- Check project isn't paused in Supabase dashboard
- Run schema.sql again

### Issue: Chat not responding
**Solution:**
- Check browser console for errors
- Verify Vapi keys are correct
- Check terminal for API errors
- Verify Supabase has data (run seed.sql)

### Issue: Admin dashboard empty
**Solution:**
- Run seed.sql in Supabase
- Refresh the page
- Check browser console for errors

## 📊 Success Metrics

You're ready to develop when:

1. ✅ Server starts without errors
2. ✅ All pages load successfully
3. ✅ Chat widget responds to messages
4. ✅ Admin dashboard shows test data
5. ✅ No critical console errors

## 🎉 Next Steps After Setup

1. **Customize Branding**
   - Update colors in `tailwind.config.ts`
   - Add your logo
   - Update clinic information

2. **Add More Content**
   - Insert more FAQs in Supabase
   - Add real clinic data
   - Create patient accounts

3. **Configure Vapi**
   - Customize system prompts
   - Add more intents
   - Train on your data

4. **Deploy to Production**
   - Follow `DEPLOYMENT.md`
   - Set up custom domain
   - Configure monitoring

5. **Implement Phase 2**
   - Email notifications
   - Appointment confirmation flow
   - Enhanced admin features

## 📞 Need Help?

- **Quick Start**: See `QUICKSTART.md`
- **Full Docs**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Project Info**: See `PROJECT_SUMMARY.md`

## ✨ You're All Set!

Once all checkboxes are marked, you're ready to start developing!

**Time to build something amazing! 🚀**
