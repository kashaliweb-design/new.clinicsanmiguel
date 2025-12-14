# Testing Chatbot Interactions

## Step 1: Test Chatbot Locally

1. **Start dev server:**
   ```
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Open browser console** (Press F12)

4. **Click chatbot icon** (bottom right)

5. **Send a test message:** "Hi, I want to book an appointment"

6. **Check console logs for:**
   - ✅ "Inbound interaction logged"
   - ✅ "Outbound interaction logged"

## Step 2: Check Admin Dashboard

1. **Open:** http://localhost:3000/admin/interactions

2. **Click "Chatbot" filter button** (blue button)

3. **You should see:**
   - Your test message (Inbound)
   - Bot's response (Outbound)
   - Channel: CHATBOT

## Step 3: Check Console Logs

In the admin dashboard console, you should see:
- ✅ "Loaded X interactions from Supabase"
- Filter: web_chat
- Sample data showing your chatbot messages

## If No Data Shows:

### Check Supabase Directly:

1. Go to Supabase dashboard
2. Open SQL Editor
3. Run this query:
   ```sql
   SELECT * FROM interactions 
   WHERE channel = 'web_chat' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

4. If data exists in Supabase but not showing in dashboard:
   - **RLS Policy Issue** - Client-side Supabase can't read data
   - Solution: Need to disable RLS or add proper policies

5. If no data in Supabase:
   - **Server-side Supabase failing** - Check environment variables
   - Check server logs for errors

## Environment Variables Required:

### Local (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### Vercel (Production):
Same variables must be added in Vercel dashboard:
Settings → Environment Variables

## Common Issues:

1. **500 Error on Vercel:**
   - Missing SUPABASE_SERVICE_ROLE_KEY on Vercel
   - Solution: Add it in Vercel environment variables

2. **Interactions not showing in dashboard:**
   - Click "Chatbot" filter (not "All")
   - Check if data exists in Supabase directly
   - Check RLS policies

3. **Dashboard shows "voice" instead of "web_chat":**
   - Those are VAPI voice call interactions
   - Chatbot interactions are separate
   - Use "Chatbot" filter to see only chatbot messages

## Success Criteria:

✅ Chatbot responds to messages
✅ Console shows "Inbound interaction logged"
✅ Console shows "Outbound interaction logged"
✅ Dashboard "Chatbot" filter shows messages
✅ Data visible in Supabase interactions table
