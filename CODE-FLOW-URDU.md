# 🔍 Code Flow - آسان Urdu Guide

## 📱 Project Kya Hai?

**SanMiguel Connect AI** - Ek healthcare clinic ke liye AI system jo:
- 🌐 Website par chat karta hai
- 📱 SMS messages handle karta hai
- 📞 Voice calls leta hai
- 📊 Admin dashboard dikhata hai

---

## 🏗️ Project Ki Files

```
app/
├── page.tsx           → Homepage (jab user website kholta hai)
├── admin/             → Admin dashboard
│   └── page.tsx       → Stats aur data
└── api/               → Backend APIs
    ├── webhooks/      → SMS aur Voice ke liye
    ├── appointments/  → Appointment APIs
    └── clinics/       → Clinic info

components/
└── VapiVoiceCall.tsx  → "Call Us" button

lib/
├── supabase.ts        → Database connection
└── telnyx.ts          → SMS bhejne ke liye
```

---

## 🚀 Kaise Shuru Hota Hai?

### Step 1: User Website Kholta Hai

```
User browser mein type karta hai:
http://localhost:3000
    ↓
Next.js app start hoti hai
    ↓
app/layout.tsx load hota hai (wrapper)
    ↓
app/page.tsx load hota hai (homepage)
    ↓
User ko dikhta hai:
- "SanMiguel Connect AI" heading
- "Start Chat" button
- "Call Us" button
- Clinic information
- Footer
```

---

## 📞 Voice Call Kaise Kaam Karta Hai?

### Pura Process:

```
1. User "Call Us" button click karta hai
   ↓
2. VapiVoiceCall component activate hota hai
   Code: vapi.start(assistantId)
   ↓
3. Browser microphone permission maangta hai
   "Allow microphone access?"
   ↓
4. User "Allow" click karta hai
   ↓
5. Call Vapi server se connect hoti hai
   ↓
6. AI assistant baat karna shuru karta hai
   "Hello! How can I help you?"
   ↓
7. User bolta hai
   "What are your hours?"
   ↓
8. Vapi AI samajhta hai aur jawab deta hai
   "We're open Monday-Friday, 9 AM to 5 PM"
   ↓
9. Vapi hamare server ko webhook bhejta hai
   POST /api/webhooks/vapi
   ↓
10. Hamara server database mein save karta hai
    - call_logs table mein call details
    - interactions table mein conversation
   ↓
11. User "End Call" button dabata hai
   ↓
12. Call khatam hoti hai
   ↓
13. Final webhook aata hai
    Database update hota hai: call ended, duration saved
```

### Code Example:

```typescript
// components/VapiVoiceCall.tsx
const startCall = async () => {
  // Call start karo
  await vapi.start(assistantId);
};

const endCall = () => {
  // Call band karo
  vapi.stop();
};
```

---

## 💬 SMS Kaise Kaam Karta Hai?

### Complete SMS Flow:

```
1. User apne phone se SMS bhejta hai
   "What are your hours?"
   ↓
2. SMS Telnyx ko milta hai
   (Telnyx = SMS service provider)
   ↓
3. Telnyx hamare server ko webhook bhejta hai
   POST /api/webhooks/telnyx/sms
   ↓
4. Hamara server check karta hai:
   "Ye phone number database mein hai?"
   
   SELECT * FROM patients WHERE phone = '+1234567890'
   ↓
5a. Agar patient nahi mila:
    Naya patient create karo
    INSERT INTO patients (phone, first_name, ...)
   ↓
5b. Agar patient mil gaya:
    Use patient ki ID
   ↓
6. Incoming message log karo
   INSERT INTO interactions (
     channel = 'sms',
     direction = 'inbound',
     message_body = 'What are your hours?'
   )
   ↓
7. AI se message process karo
   "User clinic ke hours puch raha hai"
   ↓
8. Response generate karo
   "We're open Monday-Friday 9AM-5PM, Saturday 9AM-1PM"
   ↓
9. Telnyx ke through SMS bhejo
   POST to Telnyx API
   ↓
10. Outgoing message log karo
    INSERT INTO interactions (
      direction = 'outbound',
      message_body = 'We're open...'
    )
   ↓
11. User ko SMS milta hai
    "We're open Monday-Friday 9AM-5PM..."
```

### Code Example:

```typescript
// app/api/webhooks/telnyx/sms/route.ts
export async function POST(request) {
  // 1. SMS ka data nikalo
  const { from, to, text } = body.data.payload;
  
  // 2. Patient dhundo
  const patient = await findPatientByPhone(from);
  
  // 3. Message log karo (incoming)
  await supabase.from('interactions').insert({
    channel: 'sms',
    direction: 'inbound',
    message_body: text
  });
  
  // 4. AI se response lo
  const response = await processMessage(text);
  
  // 5. SMS bhejo
  await sendSMS(to, from, response);
  
  // 6. Response log karo (outgoing)
  await supabase.from('interactions').insert({
    direction: 'outbound',
    message_body: response
  });
}
```

---

## 📊 Admin Dashboard Kaise Kaam Karta Hai?

### Dashboard Loading Process:

```
1. Admin browser mein type karta hai
   http://localhost:3000/admin
   ↓
2. app/admin/page.tsx load hota hai
   ↓
3. Page load hote hi useEffect() chalta hai
   ↓
4. loadDashboardData() function call hota hai
   ↓
5. Database se data fetch hota hai (parallel queries):
   
   Query 1: Total interactions count
   SELECT COUNT(*) FROM interactions
   
   Query 2: Total appointments count
   SELECT COUNT(*) FROM appointments
   
   Query 3: Total patients count
   SELECT COUNT(*) FROM patients
   
   Query 4: Today's interactions count
   SELECT COUNT(*) FROM interactions 
   WHERE created_at >= today
   ↓
6. Recent interactions fetch karo (last 10)
   SELECT * FROM interactions 
   ORDER BY created_at DESC 
   LIMIT 10
   ↓
7. State update karo
   setStats({ totalInteractions: 150, ... })
   setRecentInteractions([...])
   ↓
8. React page ko re-render karta hai
   ↓
9. Dashboard dikhta hai:
   - 4 stat cards (numbers ke saath)
   - Recent interactions table
   - Patient names
   - Message content
   - Timestamps
```

### Code Example:

```typescript
// app/admin/page.tsx
const loadDashboardData = async () => {
  // Sab data ek saath fetch karo
  const [interactions, appointments, patients, today] = 
    await Promise.all([
      supabase.from('interactions').select('id', { count: 'exact' }),
      supabase.from('appointments').select('id', { count: 'exact' }),
      supabase.from('patients').select('id', { count: 'exact' }),
      supabase.from('interactions')
        .select('id', { count: 'exact' })
        .gte('created_at', todayDate)
    ]);
  
  // Stats update karo
  setStats({
    totalInteractions: interactions.count,
    totalAppointments: appointments.count,
    totalPatients: patients.count,
    todayInteractions: today.count
  });
};
```

---

## 🗄️ Database Kaise Kaam Karta Hai?

### 8 Tables Hain:

```
1. clinics          → Clinic ki information
2. patients         → Patient records
3. appointments     → Appointment bookings
4. interactions     → Sab messages/calls ka log
5. faqs             → Common questions & answers
6. canned_responses → Ready-made responses
7. call_logs        → Voice call details
8. audit_logs       → System changes ka record
```

### Relationships:

```
patients (1 patient)
    ↓
    ├─→ appointments (multiple bookings)
    └─→ interactions (multiple messages/calls)

clinics (1 clinic)
    ↓
    └─→ appointments (multiple bookings)
```

---

## 🎯 Complete Example: Patient Appointment Book Karta Hai

### Puri Journey:

```
Step 1: User SMS bhejta hai
"I need an appointment"
    ↓
Step 2: Telnyx webhook bhejta hai
POST /api/webhooks/telnyx/sms
    ↓
Step 3: System check karta hai
"Ye patient pehle se hai?"
SELECT * FROM patients WHERE phone = '+1234567890'
    ↓
Step 4: Patient nahi mila, naya banao
INSERT INTO patients (
  first_name = 'Unknown',
  phone = '+1234567890',
  preferred_language = 'en'
)
    ↓
Step 5: Incoming message log karo
INSERT INTO interactions (
  channel = 'sms',
  direction = 'inbound',
  message_body = 'I need an appointment',
  patient_id = new_patient_id
)
    ↓
Step 6: AI message samajhta hai
"User appointment chahta hai"
    ↓
Step 7: Response generate karo
"Sure! What date works for you? We're available Mon-Fri 9AM-5PM"
    ↓
Step 8: SMS bhejo
Telnyx API call
    ↓
Step 9: Outgoing message log karo
INSERT INTO interactions (
  direction = 'outbound',
  message_body = 'Sure! What date works...'
)
    ↓
Step 10: User ko SMS milta hai
"Sure! What date works for you?"
    ↓
Step 11: User reply karta hai
"Tomorrow at 2pm"
    ↓
Step 12: System appointment create karta hai
INSERT INTO appointments (
  patient_id = patient_id,
  appointment_date = 'tomorrow 2pm',
  status = 'scheduled',
  confirmation_code = 'ABC123'
)
    ↓
Step 13: Confirmation SMS bhejo
"Appointment booked! Your code: ABC123"
    ↓
Step 14: Admin dashboard mein dikhta hai
- New patient added
- New appointment created
- 4 interactions logged (2 in, 2 out)
```

---

## 🔌 API Endpoints

### Public APIs (Koi bhi use kar sakta hai):

```
GET /api/clinics
→ Clinic ki information

GET /api/faqs?q=hours
→ FAQs search karo

POST /api/appointments/find
→ Appointment dhundo

POST /api/appointments/confirm
→ Appointment confirm karo
```

### Webhook APIs (External services ke liye):

```
POST /api/webhooks/vapi
→ Voice call events

POST /api/webhooks/telnyx/sms
→ SMS messages

POST /api/webhooks/telnyx/voice
→ Voice call events
```

---

## 📊 Data Flow Diagram (Simple)

```
┌─────────────────────────────────────┐
│           USER                       │
│  Website | SMS | Voice | Admin      │
└────┬─────────┬────────┬────────┬────┘
     │         │        │        │
     ▼         ▼        ▼        ▼
┌─────────────────────────────────────┐
│        NEXT.JS APIs                  │
│  Webhooks | Appointments | Clinics  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        BUSINESS LOGIC                │
│  Find Patient | Log Message | AI    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        SUPABASE DATABASE             │
│  8 Tables: patients, appointments... │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        EXTERNAL SERVICES             │
│  Vapi (Voice) | Telnyx (SMS)        │
└─────────────────────────────────────┘
```

---

## 🔑 Important Files

| File | Kya Karta Hai |
|------|---------------|
| `app/page.tsx` | Homepage dikhata hai |
| `app/admin/page.tsx` | Admin dashboard |
| `components/VapiVoiceCall.tsx` | Call button |
| `lib/supabase.ts` | Database connection |
| `app/api/webhooks/vapi/route.ts` | Voice webhooks |
| `app/api/webhooks/telnyx/sms/route.ts` | SMS webhooks |

---

## 🎓 Summary - Ek Line Mein

```
User Action → API → Business Logic → Database → Response → User
```

### Detailed:
1. User kuch karta hai (SMS/Call/Website)
2. Request API ko jati hai
3. Business logic process karta hai
4. Database mein save hota hai
5. Response generate hota hai
6. User ko reply milta hai
7. Sab kuch log ho jata hai
8. Admin dashboard mein dikhta hai

---

## ✅ Project Ready For:

✅ Patient registration (SMS/Voice/Web)  
✅ Appointment booking  
✅ Multi-language (English/Spanish)  
✅ Real-time responses  
✅ Complete logging  
✅ Admin monitoring  
✅ Voice AI calls  
✅ SMS messaging  

---

**Sab kuch automated hai! 🎉**
