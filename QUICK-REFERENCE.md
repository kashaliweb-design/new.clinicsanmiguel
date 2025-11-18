# 🚀 Quick Reference - Voice Bot

## ✅ Setup (3 Steps)

### 1. Add Keys to `.env.local`
```env
VAPI_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key
```
Get from: https://dashboard.vapi.ai → Settings → API Keys

### 2. Create Assistant
- Go to: https://dashboard.vapi.ai
- Create assistant
- Voice: Rachel (ElevenLabs)
- Model: GPT-3.5-turbo

### 3. Test
```bash
npm run dev
# Go to: http://localhost:3000
# Click: "Call Us" button
```

## 📊 Admin Dashboard

### View Voice Calls:
```
URL: http://localhost:3000/admin/interactions
Filter: Click "Voice" button (purple)
```

### All Admin Routes:
- `/admin` - Main dashboard
- `/admin/interactions` - **Voice calls here!**
- `/admin/patients` - Patients
- `/admin/appointments` - Appointments
- `/admin/settings` - Settings

## 🎯 How It Works

```
User clicks "Call Us"
    ↓
Voice call starts in browser
    ↓
User talks to AI assistant
    ↓
Conversation logged to database
    ↓
Admin sees call in dashboard
```

## 📁 Files Created

- `/components/VapiVoiceCall.tsx` - Voice call button
- `/app/api/webhooks/vapi/route.ts` - Webhook handler
- `/app/page.tsx` - Updated homepage

## 🧪 Test Phrases

- "What are your clinic hours?"
- "I need an appointment"
- "Where are you located?"
- "Do you accept insurance?"

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Button doesn't work | Check `.env.local`, restart server |
| No microphone | Click "Allow" in browser |
| Calls not in dashboard | Configure webhook (needs deployment) |

## 📖 Full Guides

- `SETUP-COMPLETE.md` - Complete overview
- `VOICE-CALL-BUTTON-SETUP.md` - Detailed setup
- `ADMIN-ROUTES.md` - All admin routes
- `VAPI-SETUP-FINAL.md` - Vapi configuration

## ✅ Checklist

- [ ] Vapi keys in `.env.local`
- [ ] Assistant created
- [ ] Server running
- [ ] Button works
- [ ] Calls logged

---

**Ready to go! 🎉**
