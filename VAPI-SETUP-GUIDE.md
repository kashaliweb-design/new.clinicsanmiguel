# 🎙️ Vapi Voice Call Setup Guide

## Error: "Call failed. Please try again" (400 Bad Request)

This error means the Vapi Assistant ID is invalid or not configured properly.

## Solution Steps:

### 1. Go to Vapi Dashboard
Visit: https://dashboard.vapi.ai/

### 2. Create or Find Your Assistant
- Click on "Assistants" in the sidebar
- Either create a new assistant OR find your existing one
- Copy the **Assistant ID** (looks like: `365fca0e-ff6a-42a0-a944-01f1dbb552fa`)

### 3. Update Environment Variable

**On Vercel:**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add or update:
   ```
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-actual-assistant-id-here
   ```
4. Redeploy the project

**Locally (.env.local):**
```bash
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-actual-assistant-id-here
```

### 4. Verify Your Assistant Configuration

Your assistant should have:
- ✅ **Model**: GPT-4 or GPT-3.5-turbo
- ✅ **Voice**: ElevenLabs or similar
- ✅ **Transcriber**: Deepgram (recommended)
- ✅ **First Message**: "Thank you for calling Wellness Partners..."

### 5. Test the Call

After updating:
1. Wait 2-3 minutes for Vercel to redeploy
2. Refresh your website
3. Click "Call Us"
4. Should connect successfully!

## Current Configuration

**Public Key**: `b9bf6320-e983-432c-9375-0ac605cdbb70`
**Assistant ID**: `365fca0e-ff6a-42a0-a944-01f1dbb552fa` (Update this!)

## Troubleshooting

### Error: 400 Bad Request
- ❌ Assistant ID is wrong or deleted
- ✅ Create new assistant in Vapi Dashboard
- ✅ Update environment variable

### Error: 401 Unauthorized
- ❌ Public key is wrong
- ✅ Check `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in Vercel

### Error: Call connects but no audio
- ❌ Assistant voice not configured
- ✅ Add voice provider in Vapi Dashboard

## Quick Fix Command

```bash
# Update .env.local
echo "NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-new-id" >> .env.local

# Restart dev server
npm run dev
```

## Vapi Dashboard Links

- **Dashboard**: https://dashboard.vapi.ai/
- **Assistants**: https://dashboard.vapi.ai/assistants
- **API Keys**: https://dashboard.vapi.ai/api-keys
- **Docs**: https://docs.vapi.ai/

---

**Need Help?**
Check Vapi documentation or create a new assistant with proper configuration.
