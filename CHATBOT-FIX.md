# 🔧 Chatbot Error Fix

## Problem
Your chatbot is showing "Sorry, I encountered an error. Please try again." for all queries.

## Root Cause
The OpenAI API key is not being loaded from your `.env.local` file, or the development server needs to be restarted to pick up the environment variables.

## Solution

### Step 1: Verify `.env.local` exists and has the OpenAI key

Check that your `.env.local` file contains:
```bash
OPENAI_API_KEY=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
```

### Step 2: Restart the Development Server

**Stop the current server** (Ctrl+C in the terminal) and restart:

```bash
npm run dev
```

### Step 3: Test the Chatbot

After restarting, try these questions:
- "How much does a visit cost?"
- "Where are you located?"
- "Do I need an appointment?"

## Why This Happens

Next.js loads environment variables when the server starts. If you:
1. Added the API key after starting the server
2. Modified `.env.local` while the server was running

You need to restart the server to pick up the changes.

## Verification

After restarting, you should see the chatbot respond properly. If you still get errors, check the terminal console for specific error messages.

## Alternative: Check if OpenAI API Key is Valid

If the error persists after restart, the API key might be invalid or expired. You can test it with:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If you get a 401 error, you need a new API key from https://platform.openai.com/api-keys

## Quick Test Commands

```bash
# Stop server (if running)
# Press Ctrl+C in terminal

# Restart server
npm run dev

# Server should start on http://localhost:3000
```

## Expected Behavior After Fix

**User:** "Where are you located?"  
**Bot:** "We have 17 clinics across Texas, including locations in Dallas, Houston, and San Antonio. Visit our website to find the clinic nearest to you."

**User:** "How much does a visit cost?"  
**Bot:** "Our visits start at just $19. This affordable price includes a general health check-up where our caring team checks your vitals, answers your questions, and helps you feel your best."

---

**Status**: Ready to test after server restart ✅
