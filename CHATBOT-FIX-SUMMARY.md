# Chatbot Appointment System - Fix Summary

## Issues Fixed

### 1. **Appointment Confirmation Not Saving to Supabase**
- **Problem**: Chatbot was responding with confirmation messages but not actually calling the appointment APIs
- **Solution**: Updated OpenAI chat route to detect appointment intents and call appropriate APIs

### 2. **Patient Data Not Being Saved**
- **Problem**: Patient information was not being extracted and saved to the database
- **Solution**: 
  - Added automatic data extraction from conversations (name, phone, email, DOB, dates, times)
  - Fixed all appointment APIs to use server-side Supabase client (`getServiceSupabase()`)
  - Added patient creation/update logic in booking flow

### 3. **Interactions Not Being Logged**
- **Problem**: Chat interactions were not being saved to the `interactions` table
- **Solution**: 
  - Added session ID generation for tracking conversations
  - Implemented real-time interaction logging for both inbound and outbound messages
  - Added patient_id linking when available
  - Included metadata with appointment details and intent

### 4. **Real-Time Data Not Appearing in Supabase**
- **Problem**: Data was not being saved in real-time to Supabase tables
- **Solution**: All operations now use proper Supabase service role client with immediate inserts/updates

## Files Modified

### 1. `app/api/chat/openai/route.ts`
**Changes:**
- Added intent detection (book, confirm, cancel, reschedule)
- Integrated with appointment APIs based on detected intent
- Added interaction logging with session tracking
- Passes patient data and session ID to APIs

### 2. `components/WebChat.tsx`
**Changes:**
- Added session ID generation and tracking
- Added patient ID state management
- Implemented `extractAppointmentData()` function to parse:
  - Patient name
  - Phone number
  - Email
  - Date of birth
  - Appointment date and time
  - Confirmation codes
  - Service types
- Enhanced interaction logging with metadata
- Real-time data extraction from conversation

### 3. `app/api/chat/book-appointment/route.ts`
**Changes:**
- Fixed to use `getServiceSupabase()` instead of client-side `supabase`
- Properly saves patient data to `patients` table
- Creates appointments in `appointments` table
- Logs interactions to `interactions` table

### 4. `app/api/chat/cancel-appointment/route.ts`
**Changes:**
- Fixed to use `getServiceSupabase()` for proper database access
- Updates appointment status to 'cancelled'
- Logs cancellation interactions

### 5. `app/api/chat/reschedule-appointment/route.ts`
**Changes:**
- Fixed to use `getServiceSupabase()` for proper database access
- Updates appointment date/time
- Logs reschedule interactions

## How It Works Now

### Booking Flow
1. User starts conversation with chatbot
2. WebChat generates unique session ID
3. User provides information (name, phone, date, time, etc.)
4. WebChat extracts data automatically using regex patterns
5. OpenAI detects "book" intent
6. Calls `/api/chat/book-appointment` with extracted data
7. API creates/updates patient in `patients` table
8. API creates appointment in `appointments` table
9. API logs interaction in `interactions` table
10. Returns confirmation code to user

### Confirmation Flow
1. User provides confirmation code or phone number
2. OpenAI detects "confirm" intent
3. Calls `/api/appointments/confirm`
4. Updates appointment status to 'confirmed'
5. Logs interaction with appointment details

### Cancellation Flow
1. User provides confirmation code/phone and reason
2. OpenAI detects "cancel" intent
3. Calls `/api/chat/cancel-appointment`
4. Updates appointment status to 'cancelled'
5. Logs interaction with cancellation details

### Reschedule Flow
1. User provides confirmation code/phone, new date, new time
2. OpenAI detects "reschedule" intent
3. Calls `/api/chat/reschedule-appointment`
4. Updates appointment with new date/time
5. Logs interaction with old and new dates

## Data Saved to Supabase

### `patients` Table
- `id` (UUID)
- `first_name`
- `last_name`
- `phone`
- `email`
- `date_of_birth`
- `consent_sms`
- `created_at`
- `updated_at`

### `appointments` Table
- `id` (UUID)
- `patient_id` (links to patients)
- `clinic_id`
- `appointment_date`
- `service_type`
- `status` (scheduled/confirmed/cancelled/completed)
- `confirmation_code`
- `notes`
- `duration_minutes`
- `created_at`
- `updated_at`

### `interactions` Table
- `id` (UUID)
- `session_id` (unique per conversation)
- `patient_id` (links to patients when available)
- `channel` ('web_chat')
- `direction` ('inbound' or 'outbound')
- `from_number` / `to_number`
- `message_body`
- `intent` (appointment_booking, appointment_confirmation, etc.)
- `metadata` (JSON with appointment details, action, confirmation codes)
- `created_at`

## Testing Instructions

### Test 1: Book Appointment
1. Open chatbot
2. Say: "I want to book an appointment"
3. Provide: Name, phone, date, time
4. **Verify in Supabase:**
   - New record in `patients` table
   - New record in `appointments` table with status='confirmed'
   - Multiple records in `interactions` table with session_id

### Test 2: Confirm Appointment
1. Say: "I want to confirm my appointment"
2. Provide confirmation code (e.g., CHAT-12345)
3. **Verify in Supabase:**
   - Appointment status updated to 'confirmed'
   - New interaction logged with intent='appointment_confirmation'

### Test 3: Cancel Appointment
1. Say: "I need to cancel my appointment"
2. Provide phone number and confirmation code
3. **Verify in Supabase:**
   - Appointment status updated to 'cancelled'
   - New interaction logged with intent='appointment_cancellation'

### Test 4: Reschedule Appointment
1. Say: "I want to reschedule my appointment"
2. Provide confirmation code, new date, new time
3. **Verify in Supabase:**
   - Appointment date updated
   - New interaction logged with intent='appointment_reschedule'

## Environment Variables Required

Make sure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or your production URL)
```

## Real-Time Monitoring

To see data in real-time:
1. Open Supabase Dashboard
2. Go to Table Editor
3. Open these tables in separate tabs:
   - `patients`
   - `appointments`
   - `interactions`
4. Start chatbot conversation
5. Refresh tables to see new records appear

## Key Features

✅ **Real-time data saving** - All operations save immediately to Supabase
✅ **Patient tracking** - Creates/updates patient records automatically
✅ **Session tracking** - Each conversation has unique session_id
✅ **Intent detection** - Automatically detects what user wants to do
✅ **Data extraction** - Parses appointment details from natural conversation
✅ **Interaction logging** - All messages saved with metadata
✅ **Confirmation codes** - Generates unique codes for each appointment
✅ **Status management** - Tracks appointment lifecycle (scheduled → confirmed → cancelled/completed)

## Notes

- All APIs now use server-side Supabase client for proper permissions
- Session IDs are unique per chat window opening
- Patient data is linked across all interactions
- Metadata includes full context for debugging and analytics
- Confirmation codes follow format: CHAT-{timestamp}
