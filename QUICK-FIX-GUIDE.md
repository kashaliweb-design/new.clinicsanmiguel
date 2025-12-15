# Quick Fix for Foreign Key Errors

## Problem
When using prefixed table names (`sanmiguel_*`), SELECT queries with joins need to explicitly reference the prefixed table names.

## Solution

In ALL files that have SELECT queries with joins, you need to change:

### ❌ Wrong (Old):
```typescript
.select('*, patients(*), clinics(*)')
```

### ✅ Correct (New):
```typescript
.select('*, sanmiguel_patients(*), sanmiguel_clinics(*)')
```

## Files That Still Need Manual Updates

### 1. `app/api/chat/openai/route.ts`
This file has MANY occurrences. You need to:

1. Add import at top:
```typescript
import { getServiceSupabase, TABLES } from '@/lib/supabase';
```

2. Find & Replace ALL of these:
- `.from('patients')` → `.from(TABLES.PATIENTS)`
- `.from('appointments')` → `.from(TABLES.APPOINTMENTS)`
- `.from('interactions')` → `.from(TABLES.INTERACTIONS)`
- `.from('clinics')` → `.from(TABLES.CLINICS)`
- `.from('faqs')` → `.from(TABLES.FAQS)`
- `.select('*, patients(*)` → `.select('*, sanmiguel_patients(*)`
- `.select('*, clinics(*)` → `.select('*, sanmiguel_clinics(*)`
- `patients(*)` → `sanmiguel_patients(*)`
- `clinics(*)` → `sanmiguel_clinics(*)`

### 2. `app/api/webhooks/telnyx/sms/route.ts`
Same as above - add import and do Find & Replace.

### 3. `app/api/webhooks/vapi/route.ts`
Same as above - add import and do Find & Replace.

## How to Do It in VS Code

1. Open file
2. Press `Ctrl+H` (Find & Replace)
3. Make sure "Match Case" is ON
4. Do each replacement one by one
5. Click "Replace All" for each

## After Fixing

1. Save all files
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Test admin dashboard
4. Check if errors are gone

## Current Status

✅ Fixed:
- app/api/admin/interactions/route.ts
- app/api/admin/appointments/route.ts
- app/api/appointments/find/route.ts
- app/api/appointments/confirm/route.ts
- app/admin/page.tsx

⏳ Need Manual Fix:
- app/api/chat/openai/route.ts (complex, 19+ occurrences)
- app/api/webhooks/telnyx/sms/route.ts (7 occurrences)
- app/api/webhooks/vapi/route.ts (13 occurrences)
