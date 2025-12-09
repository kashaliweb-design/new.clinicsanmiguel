# Vapi Function Tool Setup - Appointment Booking

## Overview
Ye guide aapko batayega ki Vapi mein function tool kaise setup karein taake voice calls se directly appointments admin dashboard mein create ho jayein.

## Step 1: API Endpoint (✅ Already Created)

**File**: `app/api/vapi/book-appointment/route.ts`

Ye endpoint:
- Patient information receive karta hai
- Database mein patient create/update karta hai
- Appointment book karta hai
- Admin dashboard mein automatically dikha deta hai

## Step 2: Vapi Dashboard Setup

### A. Function Tool Create Karein

1. **Vapi Dashboard** open karein: https://dashboard.vapi.ai
2. Left sidebar mein **"Tools"** pe click karein
3. **"Create Tool"** button click karein
4. **"Function"** select karein

### B. Function Configuration

**Tool Name**: `bookAppointment`

**Description**:
```
Books a medical appointment for a patient. Use this when the patient wants to schedule a consultation, exam, or any medical service.
```

**Server URL**:
```
https://your-domain.vercel.app/api/vapi/book-appointment
```
*Note: Replace `your-domain` with your actual Vercel domain*

**For localhost testing**:
```
https://your-ngrok-url/api/vapi/book-appointment
```

### C. Function Parameters (JSON Schema)

```json
{
  "type": "object",
  "properties": {
    "patientName": {
      "type": "string",
      "description": "Full name of the patient"
    },
    "phoneNumber": {
      "type": "string",
      "description": "Patient's phone number with country code (e.g., +1234567890)"
    },
    "dateOfBirth": {
      "type": "string",
      "description": "Patient's date of birth in YYYY-MM-DD format"
    },
    "appointmentType": {
      "type": "string",
      "description": "Type of appointment",
      "enum": ["consultation", "immigration_exam", "primary_care", "specialist", "urgent_care"]
    },
    "appointmentDate": {
      "type": "string",
      "description": "Appointment date in YYYY-MM-DD format"
    },
    "appointmentTime": {
      "type": "string",
      "description": "Appointment time in HH:MM format (24-hour)"
    },
    "isNewPatient": {
      "type": "boolean",
      "description": "Whether this is a new patient or returning patient"
    },
    "address": {
      "type": "string",
      "description": "Patient's full address (optional)"
    },
    "email": {
      "type": "string",
      "description": "Patient's email address (optional)"
    }
  },
  "required": ["patientName", "phoneNumber", "appointmentDate", "appointmentTime"]
}
```

### D. Options

- **Async**: ✅ ON (Tool executes asynchronously)
- **Strict**: ✅ ON (Enforces strict parameter validation)

## Step 3: Assistant Configuration

### A. Add Tool to Assistant

1. Vapi Dashboard mein **"Assistants"** pe jayein
2. Apni assistant select karein (ID: `34c63f21-7844-47b6-ba91-bca6b9512a21`)
3. **"Tools"** section mein scroll karein
4. **"Add Tool"** click karein
5. `bookAppointment` tool select karein
6. **Save** karein

### B. Update System Prompt

Assistant ki system prompt mein ye add karein:

```
When a patient wants to schedule an appointment:

1. Greet them warmly
2. Ask if they are a new or returning patient
3. Collect required information:
   - Full name
   - Phone number
   - Date of birth
   - Preferred appointment date and time
   - Type of appointment (consultation, immigration exam, etc.)
4. For new patients, also collect:
   - Email address
   - Full address
5. Use the bookAppointment function to create the appointment
6. Confirm the appointment with the patient and provide the confirmation code
7. Ask if they need anything else

Always be friendly, professional, and efficient.
```

## Step 4: Testing

### Local Testing (Using ngrok)

1. **Start your dev server**:
```bash
npm run dev
```

2. **Start ngrok** (in another terminal):
```bash
ngrok http 3000
```

3. **Copy ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update Vapi Function Tool**:
   - Server URL: `https://abc123.ngrok.io/api/vapi/book-appointment`

5. **Test the call**:
   - Call your Vapi assistant
   - Say: "I want to book an appointment"
   - Provide the information
   - Check admin dashboard for the new appointment

### Production Testing (Vercel)

1. **Deploy to Vercel**:
```bash
git add .
git commit -m "Add Vapi function tool for appointment booking"
git push
```

2. **Update Vapi Function Tool**:
   - Server URL: `https://your-app.vercel.app/api/vapi/book-appointment`

3. **Test the call**

## Step 5: Verify in Admin Dashboard

1. Open admin dashboard: `https://your-domain.vercel.app/admin/appointments`
2. Check **"Scheduled"** tab
3. New appointment should appear automatically
4. Status: **scheduled** (yellow badge)

## Example Conversation Flow

**User**: "I want to book an appointment"

**Riley**: "I'd be happy to help you schedule an appointment. Have you visited our clinic before, or is this your first time?"

**User**: "First time"

**Riley**: "Great! I'll need some information. What's your full name?"

**User**: "John Smith"

**Riley**: "Thank you, John. What's your phone number?"

**User**: "+1234567890"

**Riley**: "And your date of birth?"

**User**: "January 15, 1990"

**Riley**: "What type of appointment do you need? We offer consultations, immigration medical exams, primary care, and more."

**User**: "Consultation"

**Riley**: "Perfect. What date works best for you?"

**User**: "Next Monday"

**Riley**: "And what time?"

**User**: "2 PM"

**Riley**: *[Calls bookAppointment function]* "Perfect! Your appointment has been confirmed. Your confirmation code is APT-000123. You're scheduled for consultation on 2024-12-02 at 14:00. We'll send you a reminder before your appointment. Is there anything else I can help you with?"

## Troubleshooting

### Issue: Function not being called

**Solution**: 
- Check system prompt mentions the function
- Verify function is added to assistant
- Check server URL is correct

### Issue: 400 Bad Request

**Solution**:
- Check API endpoint is accessible
- Verify ngrok/Vercel URL is correct
- Check request body format

### Issue: Appointment not showing in dashboard

**Solution**:
- Check Supabase connection
- Verify patient_id is being created
- Check appointments table for errors
- Refresh admin dashboard

## Environment Variables Required

Make sure these are set in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
VAPI_PRIVATE_KEY=be1852e0-396c-46bd-a28f-8df4cb870002
NEXT_PUBLIC_VAPI_PUBLIC_KEY=8ae1c1a3-57a8-459e-98fa-421403422a95
NEXT_PUBLIC_VAPI_ASSISTANT_ID=34c63f21-7844-47b6-ba91-bca6b9512a21
```

## Benefits

✅ **Automatic Patient Creation**: New patients automatically added to database
✅ **Real-time Dashboard Update**: Appointments appear instantly in admin panel
✅ **No Manual Entry**: Staff doesn't need to manually enter appointment details
✅ **Confirmation Codes**: Automatic generation and communication
✅ **Interaction Logging**: All calls logged for tracking
✅ **24/7 Booking**: Patients can book anytime, even after hours

## Next Steps

1. ✅ API endpoint created
2. ⏳ Setup function tool in Vapi dashboard (follow Step 2)
3. ⏳ Add tool to assistant (follow Step 3)
4. ⏳ Test with ngrok locally
5. ⏳ Deploy to Vercel
6. ⏳ Update production URL in Vapi
7. ✅ Start receiving appointments!

---

**Need Help?** Check console logs in:
- Browser console (for frontend errors)
- Vercel logs (for API errors)
- Vapi dashboard logs (for function call errors)
