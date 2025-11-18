# 🎙️ Vapi Voice Assistant Setup Instructions

## 📋 Quick Setup Guide

### Step 1: Copy the Prompt

1. Open file: `VAPI-APPOINTMENT-PROMPT.md`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)

---

### Step 2: Configure Vapi Assistant

1. **Go to Vapi Dashboard**
   ```
   https://dashboard.vapi.ai
   ```

2. **Login** with your account

3. **Navigate to Assistants**
   - Click "Assistants" in left sidebar
   - Click "Create Assistant" or edit existing

4. **Configure Assistant Settings**

   **Basic Info:**
   - Name: `Riley - Appointment Scheduler`
   - Description: `Appointment scheduling assistant for Wellness Partners`

   **System Prompt:**
   - Paste the entire content from `VAPI-APPOINTMENT-PROMPT.md`
   - This is the most important part!

   **Voice Settings:**
   - Provider: Choose your preferred voice provider
   - Voice: Select a friendly, professional voice
   - Speed: 1.0 (normal)
   - Language: English (en-US)

   **Model Settings:**
   - Model: GPT-4 or GPT-3.5-turbo
   - Temperature: 0.7 (balanced creativity)
   - Max Tokens: 500

5. **Save Assistant**
   - Click "Save" or "Create"
   - Copy the Assistant ID (you'll need this)

---

### Step 3: Update Your Project

1. **Open `.env.local`**

2. **Add/Update these variables:**
   ```env
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
   VAPI_PRIVATE_KEY=your_vapi_private_key
   ```

3. **Update Assistant ID in code**

   Open: `app/page.tsx`
   
   Find this line:
   ```typescript
   const vapiAssistantId = '365fca0e-ff6a-42a0-a944-01f1dbb552fa';
   ```
   
   Replace with your new Assistant ID:
   ```typescript
   const vapiAssistantId = 'your_new_assistant_id_here';
   ```

4. **Save all files**

---

### Step 4: Test the Voice Assistant

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   ```
   http://localhost:3000
   ```

3. **Click "Call Us" button**

4. **Allow microphone access**

5. **Test conversation:**
   - Say: "Hi, I need an appointment"
   - Riley should respond professionally
   - Follow the conversation flow

---

## 🎯 What Riley Can Do

### Appointment Scheduling
- ✅ Schedule new appointments
- ✅ Reschedule existing appointments
- ✅ Cancel appointments
- ✅ Provide available time slots

### Patient Management
- ✅ Register new patients
- ✅ Verify returning patients
- ✅ Collect required information:
  - Full name
  - Date of birth
  - Age
  - Phone number
  - Address
  - Email
  - Preferred language

### Information Providing
- ✅ Clinic hours
- ✅ Services offered
- ✅ Provider information
- ✅ Preparation instructions
- ✅ Insurance information

### Special Handling
- ✅ Urgent appointment requests
- ✅ Emergency triage
- ✅ Multilingual support (EN/ES)
- ✅ Complex scheduling needs

---

## 📝 Sample Conversations

### Example 1: New Patient Appointment

**User:** "Hi, I need to schedule an appointment"

**Riley:** "Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. I'd be happy to help you with scheduling. Have you visited our clinic before, or will this be your first appointment with us?"

**User:** "This is my first time"

**Riley:** "Great! Since this is your first visit, I'll need to collect some basic information. Could I have your full name, date of birth, age, address, and a phone number where we can reach you?"

**User:** "My name is John Smith, born January 15, 1985, I'm 39 years old, I live at 123 Main St, and my number is 415-555-1234"

**Riley:** "Thank you, John. What type of appointment are you looking to schedule today?"

**User:** "Just a general checkup"

**Riley:** "Perfect. For a general checkup, I have availability on Wednesday, November 20th at 2:30 PM, or Thursday, November 21st at 10:00 AM. Would either of those times work for you?"

---

### Example 2: Returning Patient Reschedule

**User:** "I need to reschedule my appointment"

**Riley:** "I'd be happy to help you reschedule. To access your record, may I have your full name and date of birth?"

**User:** "Maria Garcia, March 20, 1990"

**Riley:** "Thank you, Maria. I see you're currently scheduled for a consultation on November 18th at 3:00 PM. Is this the appointment you'd like to reschedule?"

**User:** "Yes"

**Riley:** "I can offer you these alternative times: November 22nd at 2:00 PM, or November 25th at 10:30 AM. Would either of those work better for you?"

---

### Example 3: Urgent Appointment

**User:** "I need to see someone today, I'm not feeling well"

**Riley:** "I understand you need to be seen today. Could you briefly describe your symptoms so I can determine the appropriate scheduling priority?"

**User:** "I have a high fever and bad cough"

**Riley:** "Let me check for any same-day appointments. We keep several slots open for urgent care needs. I have an urgent care slot available today at 4:30 PM. Would that work for you?"

---

## 🔧 Customization Options

### Adjust Voice Settings

**For a warmer tone:**
- Temperature: 0.8
- Voice: Choose a softer voice

**For more professional:**
- Temperature: 0.6
- Voice: Choose a clear, articulate voice

**For faster responses:**
- Speed: 1.1 or 1.2
- Max Tokens: 300

---

### Modify Prompt for Your Clinic

**Change clinic name:**
Find: "Wellness Partners"
Replace with: "Your Clinic Name"

**Update hours:**
Find: "Monday-Friday 8am-5pm, Saturday 9am-12pm"
Replace with: Your actual hours

**Update services:**
Find the "Appointment Types" section
Add/remove your specific services

**Update policies:**
Find the "Policies" section
Update with your clinic's policies

---

## 📊 Monitoring & Analytics

### Vapi Dashboard
- View call logs
- Check call duration
- Review transcripts
- Monitor success rate

### Your Admin Dashboard
```
http://localhost:3000/admin
```
- See all voice interactions
- View patient data collected
- Check appointment bookings

---

## 🐛 Troubleshooting

### Issue: "Voice system is loading"
**Solution:** 
- Check VAPI_PUBLIC_KEY in .env.local
- Restart dev server: `npm run dev`

### Issue: "Please create an assistant"
**Solution:**
- Update Assistant ID in app/page.tsx
- Make sure ID is correct from Vapi dashboard

### Issue: Call connects but no response
**Solution:**
- Check system prompt is pasted correctly
- Verify model is set (GPT-4 or GPT-3.5)
- Check Vapi account has credits

### Issue: Microphone not working
**Solution:**
- Allow microphone permission in browser
- Check browser settings
- Try different browser (Chrome recommended)

---

## ✅ Checklist

Before going live:

- [ ] Vapi account created
- [ ] Assistant created with prompt
- [ ] Assistant ID copied
- [ ] Environment variables set
- [ ] Assistant ID updated in code
- [ ] Test call successful
- [ ] Microphone permission granted
- [ ] Conversation flows tested
- [ ] Database logging verified
- [ ] Admin dashboard shows calls

---

## 🎉 You're Ready!

Your voice assistant is now configured to:
- ✅ Handle appointment scheduling
- ✅ Collect patient information
- ✅ Provide clinic information
- ✅ Log all interactions
- ✅ Support multiple languages

**Test it thoroughly before going live!**

---

## 📞 Support

**Vapi Documentation:** https://docs.vapi.ai
**Vapi Dashboard:** https://dashboard.vapi.ai
**Project Documentation:** See other .md files in project

---

**Happy Scheduling! 🎙️✨**
