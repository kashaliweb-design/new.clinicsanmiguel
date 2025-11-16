# 🚀 Vercel Deployment Fix

## Error
```
Error: supabaseUrl is required.
Build error occurred
```

## Root Cause
Environment variables from `.env.local` are not available in Vercel. You must configure them in Vercel's dashboard.

## Solution

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/kashaliweb-design/new-clinicsanmiguel
   - Or: https://vercel.com/dashboard

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Required Variables**

#### Required (Must Add):
```bash
NEXT_PUBLIC_SUPABASE_URL
Value: https://fuctflfnzdjhdwwittmn.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y3RmbGZuemRqaGR3d2l0dG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzIyMTUsImV4cCI6MjA3ODgwODIxNX0.oFnemV18TKxFpDWKeqosQ_dzt4UYqS45zcaxmjOYhE0

SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase Dashboard > Settings > API]

OPENAI_API_KEY
Value: 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
```

#### Optional (Add if you have them):
```bash
VAPI_PRIVATE_KEY
Value: e883dac2-736b-4297-bb9f-d1466e50b98c

NEXT_PUBLIC_VAPI_PUBLIC_KEY
Value: b9bf6320-e983-432c-9375-0ac605cdbb70

TELNYX_API_KEY
Value: [Your Telnyx API key]

TELNYX_PHONE_NUMBER
Value: [Your Telnyx phone number]
```

#### App Configuration:
```bash
NEXT_PUBLIC_APP_URL
Value: https://your-app-name.vercel.app

NODE_ENV
Value: production

JWT_SECRET
Value: [Generate a secure random string, min 32 chars]

WEBHOOK_SECRET
Value: [Generate a secure random string]
```

4. **Important**: For each variable, select:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save** after adding each variable

### Step 2: Get Missing Supabase Service Role Key

If you don't have the `SUPABASE_SERVICE_ROLE_KEY`:

1. Go to: https://supabase.com/dashboard/project/fuctflfnzdjhdwwittmn
2. Click **Settings** (gear icon)
3. Click **API** in the left sidebar
4. Find **service_role** key under "Project API keys"
5. Copy the key and add it to Vercel

### Step 3: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete

### Step 4: Verify Deployment

Once deployed successfully:
1. Visit your app URL
2. Test the chatbot
3. Try questions like:
   - "How much does a visit cost?"
   - "Where are you located?"
   - "Do I need an appointment?"

## Alternative: Use Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production

# Redeploy
vercel --prod
```

## Security Best Practices

### ⚠️ Important Security Notes:

1. **Never commit `.env.local` to Git** (already protected by `.gitignore` ✅)
2. **Rotate API keys** if they were accidentally exposed
3. **Use different keys** for development and production
4. **Enable Supabase RLS** (Row Level Security) for database protection
5. **Set up Vercel password protection** for preview deployments if needed

### Recommended: Rotate OpenAI Key

Since your OpenAI key was in the example file, consider rotating it:
1. Go to: https://platform.openai.com/api-keys
2. Create a new key
3. Delete the old key
4. Update Vercel environment variables

## Checklist

- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Add `OPENAI_API_KEY` to Vercel
- [ ] Add optional variables (Vapi, Telnyx)
- [ ] Select Production, Preview, Development for each
- [ ] Save all variables
- [ ] Redeploy from Vercel dashboard
- [ ] Test deployed app
- [ ] Verify chatbot works
- [ ] Consider rotating exposed API keys

## Expected Result

After adding environment variables and redeploying:

✅ Build completes successfully
✅ App deploys to Vercel
✅ Chatbot responds to questions
✅ Database connections work
✅ All 200,000 Q&A available

## Troubleshooting

### If build still fails:
1. Check all required variables are added
2. Verify no typos in variable names
3. Check Supabase service role key is correct
4. Review build logs for specific errors

### If chatbot doesn't work after deployment:
1. Check browser console for errors
2. Verify OpenAI API key is valid
3. Test API endpoints directly
4. Check Vercel function logs

## Support

- Vercel Docs: https://vercel.com/docs/environment-variables
- Supabase Docs: https://supabase.com/docs/guides/api
- OpenAI Docs: https://platform.openai.com/docs

---

**Status**: Ready to configure environment variables in Vercel ✅
