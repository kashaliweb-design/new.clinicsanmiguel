# Fix: Chatbot Interactions Not Appearing in Admin Dashboard

## Problem
Chatbot interactions are not showing up in the admin dashboard even though the code is logging them.

## Root Cause
The issue is with **Row Level Security (RLS) policies** in Supabase. The interactions table has RLS enabled but the policies are not allowing proper read/write access.

## Solution

### Step 1: Apply the RLS Fix in Supabase

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the Fix SQL**
   - Copy the contents of `supabase/migrations/FIX-INTERACTIONS-RLS.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify the Fix**
   The SQL will automatically verify that:
   - Policies are created correctly
   - Interactions can be read
   - Recent interactions are displayed

### Step 2: Test the Chatbot

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Open the Website**
   - Go to `http://localhost:3000`
   - Click the chatbot icon (bottom right)

3. **Test a Conversation**
   - Say: "Hi, I want to book an appointment"
   - Provide: Your name, phone number, date, and time
   - Complete the booking flow

### Step 3: Verify in Admin Dashboard

1. **Open Admin Dashboard**
   - Go to `http://localhost:3000/admin/interactions`

2. **Check for Interactions**
   - You should see your chatbot messages appearing in real-time
   - Filter by "Chatbot" to see only web chat interactions
   - Each message should show:
     - Patient name (if provided)
     - Message content
     - Direction (inbound/outbound)
     - Timestamp
     - Intent (if detected)

### Step 4: Verify in Supabase Database

1. **Open Supabase Dashboard**
   - Go to **Table Editor**
   - Select **interactions** table

2. **Check the Data**
   - You should see rows with:
     - `channel` = 'web_chat'
     - `session_id` = unique ID for each conversation
     - `message_body` = the actual messages
     - `direction` = 'inbound' or 'outbound'
     - `patient_id` = linked to patient (if available)

## What the Fix Does

### RLS Policies Created
The fix creates 4 comprehensive policies for the `interactions` table:

1. **Allow all to read interactions** - Enables SELECT queries
2. **Allow all to insert interactions** - Enables INSERT operations (chatbot logging)
3. **Allow all to update interactions** - Enables UPDATE operations
4. **Allow all to delete interactions** - Enables DELETE operations (admin)

### Why This Works
- **Before**: RLS was enabled but policies were too restrictive or missing
- **After**: All operations are allowed, making the table fully accessible
- The service role key is used in API routes for secure access
- The admin dashboard can now read all interactions

## Troubleshooting

### If Interactions Still Don't Appear

1. **Check Environment Variables**
   Ensure `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed API calls

3. **Check Server Logs**
   - Look for "✅ Inbound interaction logged" messages
   - Look for "✅ Outbound interaction logged" messages
   - Check for any Supabase errors

4. **Verify Supabase Connection**
   - Test that you can access other tables (patients, appointments)
   - Ensure service role key has proper permissions

### If You See "0 interactions"

1. **Disable RLS Temporarily** (for testing only)
   ```sql
   ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
   ```

2. **Check if data exists**
   ```sql
   SELECT COUNT(*) FROM interactions;
   ```

3. **Re-enable RLS and apply policies**
   ```sql
   ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
   -- Then run FIX-INTERACTIONS-RLS.sql again
   ```

## Expected Behavior After Fix

### When User Sends Message:
1. Message appears in chatbot window
2. Console logs: "✅ Inbound interaction logged"
3. OpenAI processes the message
4. Response appears in chatbot window
5. Console logs: "✅ Outbound interaction logged"
6. Admin dashboard updates in real-time (if open)
7. Supabase table shows new rows immediately

### In Admin Dashboard:
- **Total count** increases with each message
- **Chatbot count** shows web_chat interactions
- **Real-time updates** every 10 seconds
- **Live indicator** shows green dot when auto-refresh is on
- **Filter buttons** work to show specific channels

## Files Modified

1. **Created**: `supabase/migrations/FIX-INTERACTIONS-RLS.sql`
   - Fixes RLS policies for interactions table

2. **Existing (Already Working)**:
   - `app/api/chat/openai/route.ts` - Logs interactions
   - `components/WebChat.tsx` - Sends messages to API
   - `app/admin/interactions/page.tsx` - Displays interactions

## Next Steps After Fix

1. ✅ Apply the SQL fix in Supabase
2. ✅ Test the chatbot
3. ✅ Verify interactions appear in admin dashboard
4. ✅ Check Supabase database for data
5. ✅ Monitor for any errors

## Important Notes

- The fix uses permissive RLS policies (`USING (true)`)
- This is appropriate for an internal admin system
- For production, consider more restrictive policies based on user roles
- All API routes use the service role key for secure access
- The admin dashboard uses the anon key but RLS allows read access

## Success Criteria

✅ Chatbot messages are logged to Supabase
✅ Admin dashboard shows all interactions
✅ Real-time updates work
✅ Filtering by channel works
✅ Patient information is linked correctly
✅ Session IDs track conversations
✅ Intent detection works
✅ Metadata is saved with each interaction

---

**Last Updated**: December 2024
**Status**: Ready to Apply
