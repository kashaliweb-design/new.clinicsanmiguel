# 🚀 LIVE DEPLOYMENT GUIDE - Clinica San Miguel

## ⚠️ IMPORTANT: API KEY SECURITY
**NEVER commit API keys to GitHub!** The OpenAI key you shared should be kept secret.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Variables Needed:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Database Setup:
- ✅ Supabase database should be live
- ✅ All tables created
- ✅ RLS policies enabled
- ✅ Default clinic data inserted

---

## 🎯 DEPLOYMENT OPTIONS

### Option 1: VERCEL (Recommended for Next.js)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd "c:\Users\DELL\Desktop\pdate agent"
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **clinica-sanmiguel** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **N**

#### Step 4: Add Environment Variables
```bash
# Add each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
```

Or via Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all 4 variables

#### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

### Option 2: NETLIFY

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```

#### Step 3: Initialize
```bash
cd "c:\Users\DELL\Desktop\pdate agent"
netlify init
```

#### Step 4: Build Settings
- Build command: `npm run build`
- Publish directory: `.next`

#### Step 5: Add Environment Variables
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_value"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_value"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_value"
netlify env:set OPENAI_API_KEY "your_key"
```

#### Step 6: Deploy
```bash
netlify deploy --prod
```

---

## 🔧 COMMON DEPLOYMENT ISSUES

### Issue 1: Build Fails
**Error:** `Module not found` or `Cannot find module`

**Solution:**
```bash
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
npm run build
```

### Issue 2: Environment Variables Not Working
**Error:** `undefined` or `null` values

**Solution:**
- Verify variables are set in deployment platform
- Variables starting with `NEXT_PUBLIC_` are exposed to browser
- Other variables are server-side only
- Redeploy after adding variables

### Issue 3: Supabase Connection Fails
**Error:** `Failed to connect to Supabase`

**Solution:**
- Check Supabase URL is correct
- Verify API keys are valid
- Check RLS policies allow access
- Test connection locally first

### Issue 4: OpenAI Rate Limit
**Error:** `429 Rate limit exceeded`

**Solution:**
- Add payment method to OpenAI account
- Increase rate limits
- Implement request throttling

---

## ✅ POST-DEPLOYMENT CHECKLIST

### 1. Test Web Chat:
- [ ] Open deployed URL
- [ ] Click chat icon
- [ ] Book test appointment
- [ ] Verify confirmation code shows
- [ ] Check appointment in admin dashboard

### 2. Test Admin Dashboard:
- [ ] Go to `/admin`
- [ ] Login (if auth enabled)
- [ ] View appointments
- [ ] View patients
- [ ] Check stats

### 3. Test Voice Agent:
- [ ] Update VAPI webhook URL to deployed URL
- [ ] Test voice call
- [ ] Verify appointment created
- [ ] Check database

### 4. Verify Database:
- [ ] Appointments table has data
- [ ] Patients table has data
- [ ] Interactions logged
- [ ] Confirmation codes generated

---

## 🌐 CUSTOM DOMAIN (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait for SSL certificate

### Netlify:
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

---

## 📱 VAPI WEBHOOK CONFIGURATION

After deployment, update VAPI webhook:

1. Go to: https://vapi.ai/dashboard
2. Select your assistant
3. Update webhook URL:
   ```
   https://your-deployed-url.vercel.app/api/webhooks/vapi
   ```
4. Enable events:
   - ✅ end-of-call-report
   - ✅ status-update
   - ✅ transcript

---

## 🔒 SECURITY BEST PRACTICES

### 1. Never Commit Secrets:
```bash
# Add to .gitignore (already done)
.env.local
.env*.local
```

### 2. Rotate Keys Regularly:
- OpenAI API key
- Supabase service role key

### 3. Enable RLS:
- All Supabase tables should have RLS enabled
- Only authenticated users can access data

### 4. Rate Limiting:
- Implement rate limiting on API routes
- Use Vercel's built-in protection

---

## 📊 MONITORING

### Vercel Analytics:
1. Enable in Project Settings
2. Monitor:
   - Page views
   - API calls
   - Error rates
   - Response times

### Supabase Logs:
1. Go to Supabase Dashboard
2. Check:
   - Database logs
   - API logs
   - Auth logs

### OpenAI Usage:
1. Go to: https://platform.openai.com/usage
2. Monitor:
   - API calls
   - Token usage
   - Costs

---

## 🆘 TROUBLESHOOTING

### Deployment Fails:
```bash
# Check build locally
npm run build

# If successful, deploy again
vercel --prod
```

### 500 Internal Server Error:
- Check Vercel logs: `vercel logs`
- Verify environment variables
- Check Supabase connection

### Appointment Not Creating:
- Check browser console (F12)
- Check Vercel function logs
- Verify database permissions
- Test API endpoint directly

---

## 📞 SUPPORT

If deployment issues persist:

1. **Vercel Support:**
   - https://vercel.com/support

2. **Supabase Support:**
   - https://supabase.com/support

3. **Check Logs:**
   ```bash
   vercel logs
   ```

---

## 🎉 SUCCESS!

Once deployed:
- ✅ Web chat works
- ✅ Appointments created
- ✅ Admin dashboard accessible
- ✅ Voice agent connected
- ✅ Database syncing

Your URL: `https://your-project.vercel.app`

Share this URL with users to access the chatbot!
