# 🔍 Project Code Flow Analysis - SanMiguel Connect AI

## 📋 Overview

**Project:** Healthcare clinic AI communication system  
**Tech Stack:** Next.js 14, Supabase, Vapi (Voice), Telnyx (SMS)

---

## 🏗️ Project Structure

```
app/
├── page.tsx              # Homepage
├── layout.tsx            # Root layout
├── admin/                # Admin dashboard
│   ├── page.tsx         # Dashboard home
│   ├── patients/        # Patient management
│   ├── appointments/    # Appointments
│   └── interactions/    # Interaction logs
└── api/                  # API endpoints
    ├── appointments/    # Appointment APIs
    ├── clinics/         # Clinic info
    ├── faqs/            # FAQ search
    └── webhooks/        # External webhooks
        ├── vapi/        # Voice webhooks
        └── telnyx/      # SMS/Voice webhooks

components/
└── VapiVoiceCall.tsx    # Voice call button

lib/
├── supabase.ts          # Database client
├── openai.ts            # AI chat
├── telnyx.ts            # SMS/Voice
└── utils.ts             # Helpers

supabase/
└── schema.sql           # Database schema
```

---

## 🚀 Application Start Flow

### 1. User Opens Website

```
Browser → http://localhost:3000
  ↓
app/layout.tsx loads (Root layout)
  ↓
app/page.tsx renders (Homepage)
  ↓
Page shows:
- Hero section with "SanMiguel Connect AI"
- "Start Chat" button
- "Call Us" button (VapiVoiceCall component)
- Features cards
- Clinic locations
- Footer
```

**Code:**
```typescript
// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>SanMiguel Connect AI</h1>
      <VapiVoiceCall publicKey={vapiKey} assistantId={assistantId} />
      {/* Features, Clinics, Footer */}
    </main>
  );
}
```

---

## 📞 Voice Call Flow

### Step-by-Step Process

```
1. User clicks "Call Us" button
   ↓
2. VapiVoiceCall component starts call
   vapi.start(assistantId)
   ↓
3. Browser asks microphone permission
   ↓
4. Call connects to Vapi server
   ↓
5. AI assistant speaks
   "Hello! How can I help you?"
   ↓
6. User speaks
   "What are your hours?"
   ↓
7. Vapi processes & responds
   ↓
8. Vapi sends webhook to our server
   POST /api/webhooks/vapi
   ↓
9. Server logs call in database
   INSERT INTO call_logs (...)
   INSERT INTO interactions (...)
   ↓
10. Call ends
    ↓
11. Final webhook updates database
```

**Code:**
```typescript
// components/VapiVoiceCall.tsx
const startCall = async () => {
  await vapi.start(assistantId);  // Start call
};

// app/api/webhooks/vapi/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Log call
  await supabase.from('call_logs').insert({
    call_id: body.call.id,
    status: body.type,
    transcript: body.transcript
  });
  
  // Log interaction
  await supabase.from('interactions').insert({
    channel: 'voice',
    direction: 'inbound',
    message_body: body.transcript
  });
}
```

---

## 💬 SMS Flow

### Complete SMS Journey

```
1. User sends SMS: "What are your hours?"
   ↓
2. Telnyx receives SMS
   ↓
3. Telnyx sends webhook
   POST /api/webhooks/telnyx/sms
   ↓
4. Find/create patient by phone
   SELECT * FROM patients WHERE phone = '+1234567890'
   ↓
5. Log incoming message
   INSERT INTO interactions (channel='sms', direction='inbound')
   ↓
6. Process with AI
   "User asking about hours"
   ↓
7. Generate response
   "We're open Mon-Fri 9AM-5PM"
   ↓
8. Send SMS via Telnyx
   POST to Telnyx API
   ↓
9. Log outgoing message
   INSERT INTO interactions (direction='outbound')
   ↓
10. User receives response
```

**Code:**
```typescript
// app/api/webhooks/telnyx/sms/route.ts
export async function POST(request: NextRequest) {
  const { from, to, text } = body.data.payload;
  
  // 1. Find patient
  const patient = await findPatientByPhone(from);
  
  // 2. Log incoming
  await supabase.from('interactions').insert({
    channel: 'sms',
    direction: 'inbound',
    from_number: from,
    message_body: text
  });
  
  // 3. Generate response
  const response = await processMessage(text);
  
  // 4. Send SMS
  await sendSMS(to, from, response);
  
  // 5. Log outgoing
  await supabase.from('interactions').insert({
    channel: 'sms',
    direction: 'outbound',
    message_body: response
  });
}
```

---

## 📊 Admin Dashboard Flow

### Loading Dashboard

```
1. Admin opens /admin
   ↓
2. app/admin/page.tsx loads
   ↓
3. useEffect() triggers
   loadDashboardData()
   ↓
4. Parallel database queries
   - Count interactions
   - Count appointments
   - Count patients
   - Count today's interactions
   ↓
5. Get recent interactions (last 10)
   ↓
6. Update state
   setStats({ totalInteractions: 150, ... })
   ↓
7. React re-renders
   ↓
8. Dashboard shows:
   - 4 stat cards
   - Recent interactions table
```

**Code:**
```typescript
// app/admin/page.tsx
const loadDashboardData = async () => {
  // Get counts
  const [interactions, appointments, patients, today] = 
    await Promise.all([
      supabase.from('interactions').select('id', { count: 'exact' }),
      supabase.from('appointments').select('id', { count: 'exact' }),
      supabase.from('patients').select('id', { count: 'exact' }),
      supabase.from('interactions')
        .select('id', { count: 'exact' })
        .gte('created_at', todayDate)
    ]);
  
  // Get recent
  const { data: recent } = await supabase
    .from('interactions')
    .select('*, patients(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(10);
  
  setStats({ ... });
  setRecentInteractions(recent);
};
```

---

## 🗄️ Database Structure

### 8 Main Tables

```sql
1. clinics           -- Clinic info
2. patients          -- Patient records
3. appointments      -- Bookings
4. interactions      -- All communications
5. faqs              -- Questions & answers
6. canned_responses  -- Pre-written responses
7. call_logs         -- Voice call details
8. audit_logs        -- System audit trail
```

### Key Relationships

```
patients (1) ←→ (many) appointments
patients (1) ←→ (many) interactions
clinics (1) ←→ (many) appointments
call_logs (1) ←→ (1) interactions
```

---

## 🔌 API Endpoints

### Public APIs

```
GET  /api/clinics              # Get clinic info
GET  /api/faqs?q=hours         # Search FAQs
POST /api/appointments/find    # Find appointment
POST /api/appointments/confirm # Confirm appointment
```

### Webhook APIs

```
POST /api/webhooks/vapi              # Voice call events
POST /api/webhooks/telnyx/sms        # SMS messages
POST /api/webhooks/telnyx/voice      # Voice call events
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│         USER INTERFACES                  │
│  Website | SMS | Voice | Admin          │
└────┬─────────┬────────┬────────┬────────┘
     │         │        │        │
     ▼         ▼        ▼        ▼
┌─────────────────────────────────────────┐
│         NEXT.JS API ROUTES               │
│  /api/webhooks | /api/appointments      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         BUSINESS LOGIC                   │
│  Patient Mgmt | Appointments | Logging  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         SUPABASE DATABASE                │
│  8 Tables with relationships             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         EXTERNAL SERVICES                │
│  Vapi | Telnyx | OpenAI | Vercel        │
└─────────────────────────────────────────┘
```

---

## 🔑 Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Voice AI
VAPI_PRIVATE_KEY=xxx
NEXT_PUBLIC_VAPI_PUBLIC_KEY=xxx

# SMS/Voice
TELNYX_API_KEY=xxx
TELNYX_PHONE_NUMBER=+1234567890

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Complete User Journey Example

### Scenario: Patient Books Appointment via SMS

```
1. User: "I need an appointment"
   → SMS sent to Telnyx number
   
2. Telnyx → Webhook → /api/webhooks/telnyx/sms
   
3. System checks: Patient exists?
   → No → Create new patient
   
4. Log: INSERT INTO interactions (inbound SMS)
   
5. AI: "User wants appointment"
   
6. Response: "Sure! What date works?"
   
7. Send SMS via Telnyx
   
8. Log: INSERT INTO interactions (outbound SMS)
   
9. User receives: "Sure! What date works?"
   
10. User: "Tomorrow at 2pm"
    
11. System creates appointment
    → INSERT INTO appointments
    
12. Response: "Booked! Confirmation: ABC123"
    
13. Admin sees:
    - New patient in dashboard
    - New appointment
    - 2 interactions logged
```

---

## 🔒 Security Features

### Row Level Security (RLS)
```sql
-- Service role has full access
CREATE POLICY "Service role full access" 
ON patients FOR ALL USING (true);

-- Public can only read active clinics
CREATE POLICY "Public read clinics" 
ON clinics FOR SELECT USING (active = true);
```

### Data Protection
- Environment variables in `.env.local`
- `.env.local` in `.gitignore`
- Phone number validation
- Input sanitization

---

## ⚡ Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
```

### Parallel Queries
```typescript
// Load multiple stats at once
const [stat1, stat2, stat3] = await Promise.all([
  query1, query2, query3
]);
```

---

## 🎓 Summary - Kaise Kaam Karta Hai

### Simple Flow:
```
User Action → API Route → Business Logic → Database → Response
```

### Detailed Flow:
1. **User Interaction** - Website, SMS, ya Voice
2. **Request Processing** - Next.js API routes
3. **Business Logic** - Patient mgmt, AI processing
4. **Database** - Supabase mein save
5. **External Services** - Vapi, Telnyx
6. **Response** - User ko reply
7. **Logging** - Sab kuch log ho jata hai
8. **Admin View** - Dashboard mein dikhta hai

---

## 📝 Key Takeaways

✅ **Multi-Channel** - Web, SMS, Voice - sab ek system  
✅ **Real-time** - Instant responses via webhooks  
✅ **Logged** - Har interaction database mein  
✅ **Scalable** - Supabase + Next.js = Fast & reliable  
✅ **Secure** - RLS policies + environment variables  
✅ **Admin Friendly** - Dashboard for monitoring  

---

**Project is ready to handle:**
- Patient registration
- Appointment booking
- Multi-language support (EN/ES)
- Voice & SMS interactions
- Real-time logging
- Admin monitoring
