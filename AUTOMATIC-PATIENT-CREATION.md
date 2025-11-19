# Automatic Patient Creation via VAPI

## Overview
The system automatically creates and updates patient records when users interact with the voice AI through VAPI. This happens in real-time during and after voice calls.

## How It Works

### 1. Call Start (Placeholder Creation)
When a voice call starts:
- System checks if patient exists by phone number
- If **existing patient**: Links the call to their record
- If **new patient**: Creates a placeholder record with:
  - First Name: "Voice"
  - Last Name: "Caller"
  - Phone: Caller's phone number
  - Preferred Language: "en"
  - Voice Consent: true

### 2. During Call (Information Collection)
The VAPI AI assistant (Riley) collects patient information:
- Full Name (first_name, last_name)
- Date of Birth (date_of_birth)
- Phone Number (already captured)
- Email Address (optional)
- Preferred Language (en or es)
- Address (for records)

### 3. Call End (Automatic Update)
When the call ends, the system:
1. **Extracts patient information** from the conversation transcript
2. **Updates the patient record** with real details:
   - Replaces "Voice Caller" with actual name
   - Adds date of birth if provided
   - Adds email if provided
   - Updates language preference if Spanish was detected

## Information Extraction

The system uses pattern matching to extract:

### Name Patterns
- "My name is [First] [Last]"
- "I'm [First] [Last]"
- "This is [First] [Last]"

### Date of Birth Patterns
- "Born on YYYY-MM-DD"
- "Date of birth: MM/DD/YYYY"
- Any date format in the conversation

### Email Patterns
- Standard email format: name@domain.com

### Language Detection
- Detects "Spanish", "Español", or "Espanol" in conversation
- Sets preferred_language to 'es'

## Example Flow

### Scenario: New Patient Call

1. **Call Starts**
   ```
   Phone: +14155551234
   Patient Created: 
   - Name: "Voice Caller"
   - Phone: +14155551234
   - Status: Placeholder
   ```

2. **During Call**
   ```
   AI: "Could I have your full name?"
   User: "My name is John Doe"
   
   AI: "And your date of birth?"
   User: "January 15, 1985"
   
   AI: "Email address?"
   User: "john.doe@example.com"
   ```

3. **Call Ends**
   ```
   Patient Updated:
   - First Name: "John"
   - Last Name: "Doe"
   - Phone: +14155551234
   - Email: john.doe@example.com
   - DOB: 1985-01-15
   - Language: en
   ```

## Benefits

✅ **Zero Manual Entry**: Patients are automatically added to the system
✅ **Real-Time Updates**: Information captured during conversation
✅ **Smart Extraction**: AI extracts structured data from natural conversation
✅ **Duplicate Prevention**: Checks phone number to avoid duplicate records
✅ **Progressive Enhancement**: Starts with basic info, updates with details

## Admin Dashboard Integration

Patients created via VAPI automatically appear in:
- **Patients Page** (`/admin/patients`)
- **Interactions Page** (`/admin/interactions`)
- **Dashboard Stats** (`/admin`)

You can:
- View all auto-created patients
- Filter by language preference
- See call history and interactions
- Manually edit patient details if needed
- Add additional information

## Testing

### Test the Feature:
1. Go to the main website: `http://localhost:3000`
2. Click "Talk to AI Assistant" button
3. Have a conversation with Riley
4. Provide your name, DOB, and email during the call
5. End the call
6. Check `/admin/patients` - your record should appear with all details

### What to Say During Test:
```
"Hi, I'd like to schedule an appointment"
"My name is [Your Name]"
"My date of birth is [Your DOB]"
"My email is [Your Email]"
```

## Database Schema

The patients table includes:
```sql
- id (uuid, primary key)
- first_name (text)
- last_name (text)
- phone (text, unique)
- email (text, nullable)
- date_of_birth (date, nullable)
- preferred_language (text, default 'en')
- consent_sms (boolean, default false)
- consent_voice (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### VAPI Webhook
- **Endpoint**: `/api/webhooks/vapi`
- **Method**: POST
- **Events Handled**:
  - `status-update` (call start)
  - `end-of-call-report` (call end with extraction)
  - `conversation-update`
  - `transcript`

### Patients API
- **Endpoint**: `/api/patients`
- **Methods**: 
  - GET (list all patients)
  - POST (manually add patient)

## Troubleshooting

### Patient Not Created?
- Check if phone number is valid
- Verify VAPI webhook is configured
- Check server logs for errors

### Information Not Extracted?
- Ensure patient provides info clearly
- Check transcript format in webhook
- Review extraction patterns in code

### Duplicate Patients?
- System prevents duplicates by phone number
- If duplicate exists, it updates existing record

## Code Location

- **Webhook Handler**: `/app/api/webhooks/vapi/route.ts`
- **Patient Extraction**: `extractPatientInfo()` function
- **Patients API**: `/app/api/patients/route.ts`
- **Admin UI**: `/app/admin/patients/page.tsx`

## Future Enhancements

- [ ] Extract address from conversation
- [ ] Capture insurance information
- [ ] Support for middle names
- [ ] Better date parsing (natural language)
- [ ] Appointment auto-booking from call
- [ ] SMS confirmation after patient creation
