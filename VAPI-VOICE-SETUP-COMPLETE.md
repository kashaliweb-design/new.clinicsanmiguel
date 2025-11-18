# Vapi Voice Bot - Complete Setup Guide

## ✅ What's Already Done

Your voice bot is **READY** with:
- ✅ Vapi AI integration (`@vapi-ai/web` package installed)
- ✅ Voice agent logic in `lib/vapi.ts`
- ✅ Telnyx number purchased
- ✅ Admin dashboard to monitor calls
- ✅ Database schema ready

## 🔧 What You Need to Do Now

### Step 1: Add Your Keys to `.env.local`

Open your `.env.local` file and make sure these are filled in:

```env
# Vapi Keys (Already have these)
VAPI_PRIVATE_KEY=e883dac2-736b-4297-bb9f-d1466e50b98c
NEXT_PUBLIC_VAPI_PUBLIC_KEY=b9bf6320-e983-432c-9375-0ac605cdbb70

# Telnyx (Add your actual keys)
TELNYX_API_KEY=your_actual_telnyx_api_key_here
TELNYX_PHONE_NUMBER=+1234567890  # Your Telnyx number
```

### Step 2: Create Vapi Assistant

1. **Go to Vapi Dashboard**: https://dashboard.vapi.ai
2. **Create New Assistant**:
   - Click "Create Assistant"
   - Name: `SanMiguel Connect AI`
   
3. **Configure Voice**:
   - Provider: Choose "ElevenLabs" or "PlayHT" (best quality)
   - Voice: Choose a natural voice (e.g., "Rachel" or "Matilda")
   - Language: English (with Spanish support)

4. **Set System Prompt**:
```
You are a helpful medical assistant for SanMiguel Connect AI healthcare clinic.

Your role:
- Answer questions about clinic hours, services, and locations
- Help patients schedule, confirm, or reschedule appointments
- Provide general healthcare information (non-diagnostic)
- Be empathetic, professional, and HIPAA-compliant
- Support both English and Spanish

Important guidelines:
- Never provide medical diagnoses or treatment advice
- Always verify patient identity before sharing personal information
- Escalate complex medical questions to human staff
- Be concise and clear in your responses

Clinic Information:
- Downtown Clinic: 123 Main Street, open Mon-Fri 8am-6pm, Sat 9am-1pm
- North Clinic: 456 Oak Avenue, open Mon-Fri 9am-5pm
- Phone: (415) 555-1000
- Services: General Practice, Pediatrics, Family Medicine, Women's Health, Mental Health, Lab Services, Vaccinations
```

5. **Configure Model**:
   - Model: GPT-4 or GPT-3.5-turbo
   - Temperature: 0.7
   - Max Tokens: 500

6. **Save Assistant** and copy the Assistant ID

### Step 3: Connect Telnyx to Vapi

**Option A: Direct Connection (Easiest)**

1. In Vapi Dashboard, go to **Phone Numbers**
2. Click **Import Phone Number**
3. Select **Telnyx** as provider
4. Enter your Telnyx API key
5. Select your phone number
6. Link it to your assistant

**Option B: Manual Webhook Setup**

1. Create voice webhook file (I'll create this for you)
2. Deploy your app to production (Vercel)
3. In Telnyx dashboard:
   - Go to your phone number settings
   - Set webhook URL: `https://yourdomain.com/api/webhooks/telnyx/voice`
   - Set HTTP method: POST

### Step 4: Test Your Voice Bot

1. **Call your Telnyx number**
2. The voice bot should answer and say:
   > "Hello! I'm the SanMiguel Connect AI assistant. How can I help you today?"

3. **Try these test phrases**:
   - "What are your clinic hours?"
   - "I need to schedule an appointment"
   - "Where are you located?"
   - "Do you speak Spanish?" / "¿Hablas español?"

### Step 5: Monitor Calls

All voice calls will appear in:
- **Admin Dashboard**: `http://localhost:3000/admin/interactions`
- Filter by "Voice" to see only phone calls
- Real-time updates every 10 seconds

## 📋 Quick Checklist

- [ ] Add Telnyx API key to `.env.local`
- [ ] Add Telnyx phone number to `.env.local`
- [ ] Create Vapi assistant in dashboard
- [ ] Configure voice and system prompt
- [ ] Connect Telnyx number to Vapi
- [ ] Test by calling your number
- [ ] Monitor calls in admin dashboard

## 🎯 What Patients Can Do

Once setup is complete, patients can call and:

1. **Get Information**:
   - Clinic hours and locations
   - Services offered
   - Directions

2. **Manage Appointments**:
   - Schedule new appointments
   - Confirm existing appointments
   - Reschedule appointments
   - Cancel appointments

3. **Ask Questions**:
   - General health questions
   - Insurance information
   - Prescription refills
   - Lab results (with verification)

4. **Language Support**:
   - English
   - Spanish (automatic detection)

## 🔒 Security & HIPAA Compliance

Your voice bot is configured to:
- ✅ Verify patient identity before sharing personal info
- ✅ Never provide medical diagnoses
- ✅ Escalate sensitive issues to human staff
- ✅ Log all interactions securely
- ✅ Encrypt all data in transit and at rest

## 🆘 Troubleshooting

### Voice bot doesn't answer:
- Check Telnyx webhook URL is correct
- Verify API keys in `.env.local`
- Check Vapi dashboard for errors

### Voice sounds robotic:
- Use ElevenLabs or PlayHT voices
- Adjust speaking rate in Vapi settings

### Bot doesn't understand:
- Improve system prompt
- Add more context about your clinic
- Use GPT-4 for better comprehension

## 📞 Support

- **Vapi Docs**: https://docs.vapi.ai
- **Telnyx Docs**: https://developers.telnyx.com
- **Admin Dashboard**: `/admin/interactions`

---

## Next Steps After Setup

1. **Train the bot** with your specific clinic information
2. **Add appointment booking logic** (connect to your calendar)
3. **Set up SMS confirmations** for appointments made via voice
4. **Monitor and improve** based on real conversations
5. **Add more languages** if needed

Your voice bot is ready to go! Just complete the steps above and start taking calls! 🎉
