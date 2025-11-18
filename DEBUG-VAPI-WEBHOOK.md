# Vapi Webhook Debugging Guide

## ✅ Problem Fixed!

Maine webhook code fix kar diya hai. Ab yeh properly handle karega:
- ✅ All Vapi event types
- ✅ Patient creation from phone number
- ✅ Better error logging
- ✅ Multiple event structures

## 🚀 Ab Kya Karo:

### Step 1: Deploy to Vercel
```bash
git add .
git commit -m "Fix Vapi webhook event handling"
git push
```

### Step 2: Test Call Karo
1. Apne Vapi number par call karo
2. Bot se baat karo
3. Call end karo

### Step 3: Check Logs

#### Vercel Logs Mein Dekhna:
```
✅ "Event type: end-of-call-report"
✅ "Vapi call ended: { callId: '...', phoneNumber: '+1234567890' }"
✅ "Created new patient from call end: abc-123-def"
```

#### Supabase Mein Check Karo:
```sql
-- Check patients
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;

-- Check interactions
SELECT * FROM interactions ORDER BY created_at DESC LIMIT 10;
```

## 🔍 What Was Wrong:

### Before:
```javascript
const { type, message } = body;
// type was undefined in some Vapi events
```

### After:
```javascript
const eventType = body.type || body.message?.type;
const messageType = body.message?.type;
// Now checks multiple locations for event type
```

## 📊 Vapi Event Types:

Vapi sends these events:
1. **Status Update** - Call started/ended
2. **Conversation Update** - Full conversation log
3. **End of Call Report** - Final summary with duration
4. **Speech Update** - Real-time transcription
5. **Function Call** - If you use function calling

## 🎯 What Happens Now:

### When Call Ends:
```
1. Vapi sends "end-of-call-report"
   ↓
2. Webhook extracts phone number from:
   - call.customer.number
   - call.phoneNumber
   - call.phoneNumberId
   ↓
3. Checks if patient exists
   ↓
4. If NO → Creates new patient
   ↓
5. Logs interaction with patient_id
   ↓
6. Dashboard shows new patient!
```

## 🧪 Testing:

### Test 1: Check Webhook URL
Vapi Dashboard → Assistant → Server URL:
```
https://yourdomain.vercel.app/api/webhooks/vapi
```

### Test 2: Make Test Call
```
Call → Talk → End Call → Check Dashboard
```

### Test 3: Verify Database
```sql
-- Should show new patient
SELECT 
  first_name,
  last_name,
  phone,
  created_at
FROM patients
WHERE first_name = 'Voice'
ORDER BY created_at DESC;

-- Should show call interaction
SELECT 
  channel,
  from_number,
  message_body,
  created_at
FROM interactions
WHERE channel = 'voice'
ORDER BY created_at DESC;
```

## 🐛 If Still Not Working:

### Check 1: Vercel Logs
Look for:
- "Vapi webhook received:"
- "Event type:"
- "Created new patient"

### Check 2: Vapi Logs
Vapi Dashboard → Logs:
- Check if webhook is being called
- Check response status (should be 200)

### Check 3: Supabase Connection
```javascript
// In webhook, check if supabase is working
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## 📝 Next Call Will:

1. ✅ Create patient automatically
2. ✅ Log all interactions
3. ✅ Show in dashboard
4. ✅ Link to patient record
5. ✅ Update stats

---

**Deploy karo aur test call karo! Ab kaam karega! 🎉**
