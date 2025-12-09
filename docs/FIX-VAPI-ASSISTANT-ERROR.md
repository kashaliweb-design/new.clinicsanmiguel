# Fix Vapi Assistant 400 Error

## Problem
Getting `400 Bad Request` error when starting a call with assistant ID: `7ad8178f-2414-41b5-aaf7-064cc9186c09`

```
POST https://api.vapi.ai/call/web 400 (Bad Request)
Vapi error: {type: 'start-method-error', stage: 'unknown', error: Response}
```

## Root Cause
The assistant ID in your `.env.local` file doesn't exist in your Vapi account, or the public key doesn't have access to it.

## Solution Steps

### 1. Check Your Vapi Dashboard
1. Go to https://dashboard.vapi.ai
2. Log in with your account
3. Navigate to **Assistants** section
4. Check if assistant `7ad8178f-2414-41b5-aaf7-064cc9186c09` exists

### 2. Create a New Assistant (If Needed)

If the assistant doesn't exist, create one:

1. Click **"Create Assistant"** in Vapi Dashboard
2. Configure the assistant with these settings:

**Basic Settings:**
- **Name**: Riley - Scheduling Assistant
- **Model**: GPT-4 or GPT-3.5-turbo
- **Voice**: Choose a professional female voice (e.g., "nova" or "alloy")

**System Prompt:**
```
You are Riley, a professional scheduling assistant for Clinica San Miguel. Your role is to:

1. Greet callers warmly and professionally
2. Help schedule appointments ($19 consultations, $220 immigration exams)
3. Collect patient information (name, DOB, phone, address)
4. Determine if patient is new or returning
5. Offer available appointment times
6. Provide clinic location information for 17 Texas locations
7. Answer general questions about services

Be friendly, concise, and efficient. Always confirm important details.
```

**First Message:**
```
Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?
```

3. **Save the assistant** and copy the new Assistant ID

### 3. Update Your Environment Variables

Update `.env.local` with the correct assistant ID:

```env
# Vapi
VAPI_PRIVATE_KEY=e883dac2-736b-4297-bb9f-d1466e50b98c
NEXT_PUBLIC_VAPI_PUBLIC_KEY=b9bf6320-e983-432c-9375-0ac605cdbb70
NEXT_PUBLIC_VAPI_ASSISTANT_ID=YOUR_NEW_ASSISTANT_ID_HERE
```

### 4. Verify Your Public Key

Make sure your public key is correct:
1. In Vapi Dashboard, go to **Settings** → **API Keys**
2. Copy your **Public Key**
3. Update `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env.local`

### 5. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Alternative: Use Inline Assistant Configuration

If you don't want to create an assistant in the dashboard, you can pass the configuration directly in the code:

Update `VapiVoiceCall.tsx` line 158:

```typescript
// Instead of:
await vapi.start(assistantId);

// Use inline configuration:
await vapi.start({
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are Riley, a professional scheduling assistant for Clinica San Miguel..."
      }
    ]
  },
  voice: {
    provider: "11labs",
    voiceId: "rachel" // or any other voice
  },
  firstMessage: "Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?"
});
```

## Testing

After making changes:

1. Clear browser cache
2. Refresh the page
3. Click "Call Us" button
4. Check browser console for any new errors

## Common Issues

### Issue: Still getting 400 error
**Solution**: Double-check that the assistant ID is copied correctly without extra spaces

### Issue: Assistant starts but doesn't respond
**Solution**: Check that your Vapi account has sufficient credits

### Issue: "Voice system is loading" message
**Solution**: Wait a few seconds for Vapi to initialize, then try again

## Verification Checklist

- [ ] Assistant exists in Vapi Dashboard
- [ ] Public key is correct in `.env.local`
- [ ] Assistant ID is correct in `.env.local`
- [ ] Development server restarted
- [ ] Browser cache cleared
- [ ] Vapi account has credits

## Current Configuration

**File**: `app/page.tsx` (Line 11)
```typescript
const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '7ad8178f-2414-41b5-aaf7-064cc9186c09';
```

**File**: `components/VapiVoiceCall.tsx` (Line 158)
```typescript
await vapi.start(assistantId);
```

## Need Help?

If the issue persists:
1. Check Vapi status: https://status.vapi.ai
2. Review Vapi docs: https://docs.vapi.ai
3. Check browser console for detailed error messages
4. Verify your Vapi account is active and has credits
