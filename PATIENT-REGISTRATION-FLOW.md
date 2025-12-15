# Patient Registration Flow (Without Appointment)

## Feature Request
User wants patients to be registered in database when chatbot collects their details, even if they don't book an appointment.

## Current Behavior
- Patient is created ONLY when appointment booking is completed
- If user just provides details but doesn't book appointment → No patient record

## Desired Behavior
- When chatbot collects patient details (name, phone, email, DOB)
- Patient should be created in database immediately
- Patient should appear in admin patients page
- Works with or without appointment booking

## Implementation Plan

### 1. Add Patient Registration Intent
Detect when user wants to:
- "Register as a patient"
- "Add my details"
- "I'm a new patient"
- "Update my information"

### 2. Collect Patient Information
Required:
- First name
- Last name
- Phone number

Optional:
- Email
- Date of birth
- Preferred language
- Address

### 3. Create Patient Record
- Store in `sanmiguel_patients` table
- Return success message
- Show in admin patients page

### 4. Use Cases

**Use Case 1: Registration Only**
```
User: I want to register as a patient
Bot: Great! What's your name?
User: John Doe
Bot: Phone number?
User: +1234567890
Bot: Email? (optional)
User: john@example.com
Bot: Date of birth? (optional)
User: 01/15/1990
Bot: ✅ Registration complete! You're now in our system.
```

**Use Case 2: Appointment Booking (Already Works)**
```
User: I need an appointment
Bot: [Collects details]
Bot: [Creates patient + appointment]
Bot: ✅ Appointment confirmed!
```

## Technical Implementation

### Option 1: Separate Registration Intent
Add new intent detection for patient registration separate from appointment booking.

### Option 2: Auto-Create Patient During Conversation
Whenever chatbot collects name + phone, automatically create/update patient record.

### Option 3: Explicit Registration Command
Add specific command like "register patient" that triggers registration flow.

## Recommendation

**Use Option 2: Auto-Create Patient**
- Most user-friendly
- No extra commands needed
- Works seamlessly with existing flow
- Patient created as soon as basic info collected

## Implementation Steps

1. Modify OpenAI route to detect when patient info is complete
2. Create/update patient immediately after collecting name + phone
3. Continue with appointment booking if requested
4. If no appointment, just confirm registration

This way:
- ✅ Patient always created when details provided
- ✅ Works with appointment booking
- ✅ Works without appointment booking
- ✅ Visible in admin patients page immediately
