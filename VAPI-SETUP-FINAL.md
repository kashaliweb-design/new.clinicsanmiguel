# 🎙️ Vapi Voice Bot - Final Setup Guide

## ✅ What's Ready

Your voice bot system is now complete with:
- ✅ Vapi webhook handler created (`/api/webhooks/vapi`)
- ✅ All voice conversations logged to admin dashboard
- ✅ Automatic intent detection (appointments, hours, location, etc.)
- ✅ Real-time conversation tracking

## 🚀 Setup Steps (5 Minutes)

### Step 1: Get Your Vapi Keys

1. Go to: https://dashboard.vapi.ai
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Copy your:
   - Private Key
   - Public Key

### Step 2: Add Keys to `.env.local`

Open your `.env.local` file and add:

```env
# Vapi Keys
VAPI_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key_here

# Your Telnyx number (if you have one)
TELNYX_PHONE_NUMBER=+1234567890
```

### Step 3: Create Vapi Assistant

1. In Vapi Dashboard, click **"Create Assistant"**
2. Configure:

**Basic Info:**
- Name: `SanMiguel Clinic AI`
- Description: `Medical clinic voice assistant`

**Voice Settings:**
- Provider: `ElevenLabs` (best quality)
- Voice: `Rachel` or `Matilda` (natural, professional)
- Language: `English` (with Spanish support)

**Model Settings:**
- Model: `GPT-4` or `GPT-3.5-turbo`
- Temperature: `0.7`
- Max Tokens: `500`

**System Prompt:**
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

When someone asks about appointments, collect:
1. Patient name
2. Preferred date and time
3. Reason for visit
4. Contact number

Always confirm details before ending the call.
```

3. **Save** the assistant and copy the **Assistant ID**

### Step 4: Configure Webhook

1. In Vapi Dashboard, go to your assistant settings
2. Scroll to **"Webhooks"**
3. Add webhook URL:
   ```
   https://yourdomain.com/api/webhooks/vapi
   ```
   (Replace `yourdomain.com` with your actual domain)

4. Enable these events:
   - ✅ `call-start`
   - ✅ `transcript`
   - ✅ `message`
   - ✅ `call-end`

### Step 5: Get a Phone Number

**Option A: Use Vapi's Phone Numbers (Easiest)**
1. In Vapi Dashboard, go to **"Phone Numbers"**
2. Click **"Buy Number"**
3. Select country and area code
4. Link to your assistant
5. Done! ✅

**Option B: Use Your Own Telnyx Number**
1. In Vapi Dashboard, go to **"Phone Numbers"**
2. Click **"Import Phone Number"**
3. Select **"Telnyx"**
4. Enter your Telnyx API key
5. Select your number
6. Link to your assistant

## 🧪 Test Your Voice Bot

### Test Call:
1. Call your Vapi number
2. The bot should answer: *"Hello! I'm the SanMiguel Connect AI assistant. How can I help you today?"*

### Try These Phrases:
- "What are your clinic hours?"
- "I need to schedule an appointment"
- "Where are you located?"
- "Do you accept insurance?"
- "¿Hablas español?"

## 📊 Monitor Calls in Admin Dashboard

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: `http://localhost:3000/admin/interactions`

3. Filter by **"Voice"** channel

4. You'll see:
   - ✅ All phone calls
   - ✅ Complete conversation transcripts
   - ✅ Detected intents (appointment, hours, location, etc.)
   - ✅ Call duration
   - ✅ Caller phone number
   - ✅ Timestamps

## 🎯 What Gets Logged

Every voice interaction is automatically logged:

| Event | What's Logged |
|-------|--------------|
| **Call Start** | Caller number, timestamp |
| **User Message** | What the caller said + detected intent |
| **Bot Response** | What the bot replied |
| **Call End** | Duration, end reason |

**Detected Intents:**
- `appointment_booking` - Scheduling appointments
- `appointment_modification` - Cancel/reschedule
- `clinic_hours` - Hours of operation
- `clinic_location` - Address/directions
- `services_inquiry` - Available services
- `billing_inquiry` - Insurance/payment
- `general_inquiry` - Other questions

## 🔒 Security Features

- ✅ HIPAA-compliant logging
- ✅ No medical diagnoses given
- ✅ Patient verification required
- ✅ Secure webhook authentication
- ✅ Encrypted data storage

## 🆘 Troubleshooting

### Bot doesn't answer calls:
- Check webhook URL is correct in Vapi dashboard
- Verify your app is deployed (webhooks need public URL)
- Check Vapi API keys in `.env.local`

### Calls not showing in admin dashboard:
- Check webhook events are enabled in Vapi
- Verify Supabase connection
- Check browser console for errors

### Bot sounds robotic:
- Use ElevenLabs voices (best quality)
- Try different voices (Rachel, Matilda, etc.)
- Adjust speaking rate in Vapi settings

### Bot doesn't understand:
- Improve system prompt with more context
- Use GPT-4 for better comprehension
- Add more clinic-specific information

## 📱 Next Steps

### Enhance Your Bot:
1. **Add appointment booking logic**
   - Connect to your calendar API
   - Automatically create appointments
   - Send SMS confirmations

2. **Add more languages**
   - Spanish full support
   - Automatic language detection

3. **Improve responses**
   - Train with real conversation data
   - Add FAQ knowledge base
   - Customize for your clinic

4. **Analytics**
   - Track common questions
   - Monitor call quality
   - Identify improvement areas

## 🎉 You're Done!

Your voice bot is now:
- ✅ Answering calls 24/7
- ✅ Logging all conversations
- ✅ Detecting intents automatically
- ✅ Visible in admin dashboard

**Webhook URL for Vapi:**
```
https://yourdomain.com/api/webhooks/vapi
```

**Admin Dashboard:**
```
http://localhost:3000/admin/interactions
```

---

Need help? Check Vapi docs: https://docs.vapi.ai
