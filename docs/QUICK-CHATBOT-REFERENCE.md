# Quick Chatbot Reference Card

## 🎯 Main Rule
**ALWAYS ASK FOR NAME FIRST, THEN ONE QUESTION AT A TIME**

## 📋 Question Order (MUST FOLLOW)

```
1. NAME       → "May I have your full name please?"
2. PHONE      → "What's the best phone number to reach you?"
3. DOB        → "What is your date of birth?"
4. AGE        → "How old are you?"
5. ADDRESS    → "What is your current address?"
6. EMAIL      → "Email for reminders?" (optional)
7. TYPE       → "What type of appointment?"
8. DATE/TIME  → "When would you prefer to come in?"
9. CONFIRM    → Create appointment & give confirmation code
```

## ✅ DO
- Ask for NAME FIRST
- One question at a time
- Wait for response
- Use patient's name
- Confirm details

## ❌ DON'T
- Ask multiple questions together
- Skip asking for name
- Rush through questions
- Assume information

## 💬 Example Flow

```
User: "I want to book appointment"
Bot:  "May I have your full name please?"
User: "John Smith"
Bot:  "Thank you John. What's your phone number?"
User: "555-1234"
Bot:  "What is your date of birth?"
...
```

## 💰 Services
- **Consultation**: $19
- **Immigration Exam**: $220
- **Primary Care**: Varies
- **Specialist**: Varies
- **Urgent Care**: Varies

## 📁 Files to Use
1. `VAPI-APPOINTMENT-PROMPT.md` - Full prompt
2. `vapi-function-tool-config.json` - Function config
3. `CHATBOT-PATIENT-DETAILS-GUIDE.md` - Detailed guide
4. `CHATBOT-URDU-GUIDE.md` - Urdu guide

## 🔗 API Endpoint
```
POST /api/vapi/book-appointment
```

## 📝 Required Data
- patientName ✓
- phoneNumber ✓
- appointmentDate ✓
- appointmentTime ✓
- dateOfBirth (optional)
- address (optional)
- email (optional)
- appointmentType (optional)

## 🎫 Confirmation Code Format
```
APT-XXXXXX
```

---

**Remember: NAME FIRST, ONE AT A TIME!**
