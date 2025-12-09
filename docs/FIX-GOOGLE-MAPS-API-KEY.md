# Fix Google Maps API Key Error ⚠️

## Error Message
"This page can't load Google Maps correctly"

## Root Cause
The Google Maps API key needs to be properly configured with:
1. **Places API enabled**
2. **Billing enabled** (Google requires a credit card, but offers $200 free credit per month)
3. **Proper restrictions** (or no restrictions for localhost)

---

## Solution 1: Fix Your Current API Key (Recommended)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Enable Places API
1. Go to **APIs & Services** → **Library**
2. Search for **"Places API"**
3. Click on it and click **"ENABLE"**
4. Also enable **"Maps JavaScript API"** if not already enabled

### Step 3: Enable Billing
1. Go to **Billing** in the left menu
2. Click **"Link a billing account"**
3. Add your credit card (Google gives $200 free credit per month)
4. **Note**: You won't be charged unless you exceed $200/month

### Step 4: Check API Key Restrictions
1. Go to **APIs & Services** → **Credentials**
2. Click on your API key: `AIzaSyDa7Hg-MWf6WGamY_gEgRMZ2L0ZxHCDRns`
3. Under **Application restrictions**:
   - Select **"None"** (for testing)
   - OR add **"HTTP referrers"** and add:
     - `http://localhost:3000/*`
     - `http://127.0.0.1:3000/*`
4. Under **API restrictions**:
   - Select **"Restrict key"**
   - Check these APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
5. Click **"SAVE"**

### Step 5: Wait 5 Minutes
- API key changes take 2-5 minutes to propagate
- Wait a bit before testing

---

## Solution 2: Create a New API Key

If the current key has issues, create a new one:

### Step 1: Create New Key
1. Go to https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the new key

### Step 2: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### Step 3: Update Your .env.local File
1. Open `.env.local` file (create if doesn't exist)
2. Add this line:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Solution 3: Use Alternative (No Billing Required)

If you can't enable billing, use a simpler address input without autocomplete:

### Option A: Manual Address Entry
Remove autocomplete and use regular text inputs (no Google Maps needed)

### Option B: Use OpenStreetMap (Free)
Use Nominatim API for address autocomplete (completely free, no billing)

---

## Quick Fix for Testing (Temporary)

Add this to your `.env.local` file:

```bash
# Add Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDa7Hg-MWf6WGamY_gEgRMZ2L0ZxHCDRns
```

Then restart your dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## Verify API Key is Working

### Test in Browser Console:
1. Open browser console (F12)
2. Paste this:
```javascript
fetch('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=123&key=AIzaSyDa7Hg-MWf6WGamY_gEgRMZ2L0ZxHCDRns')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected Response:
- ✅ If working: You'll see predictions array
- ❌ If not working: You'll see error message about billing or API not enabled

---

## Common Error Messages

### "This API project is not authorized to use this API"
**Fix**: Enable Places API in Google Cloud Console

### "You must enable Billing on the Google Cloud Project"
**Fix**: Add billing account (credit card) - you get $200 free per month

### "API key not valid"
**Fix**: Check if key is correct and wait 5 minutes after creating

### "RefererNotAllowedMapError"
**Fix**: Remove HTTP referrer restrictions or add localhost

---

## What I've Already Done

1. ✅ Added error handling to the code
2. ✅ Added environment variable support
3. ✅ Added console logging for debugging
4. ✅ Updated .env.local.example

## What You Need to Do

**Choose ONE option:**

### Option 1: Fix Current Key (5 minutes)
1. Go to Google Cloud Console
2. Enable Places API
3. Enable Billing (add credit card)
4. Remove restrictions or add localhost
5. Wait 5 minutes
6. Refresh page

### Option 2: Create New Key (10 minutes)
1. Create new API key
2. Enable APIs
3. Enable billing
4. Add to .env.local
5. Restart server

### Option 3: Remove Autocomplete (2 minutes)
1. Let me know
2. I'll remove Google Maps
3. Use simple text inputs instead

---

## Need Help?

Share screenshot of:
1. Google Cloud Console → APIs & Services → Credentials
2. Your API key settings
3. Browser console errors (F12)

I can help you fix the specific issue!

---

**Current Status**: ⚠️ API Key needs billing enabled
**Recommended Action**: Enable billing in Google Cloud Console (free $200/month credit)
