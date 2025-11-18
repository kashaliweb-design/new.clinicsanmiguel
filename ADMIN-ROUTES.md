# 📊 Admin Dashboard - All Routes

## 🎯 Main Admin Routes

| Route | Description | What You Can Do |
|-------|-------------|-----------------|
| `/admin` | Main Dashboard | View stats, recent activity, system overview |
| `/admin/interactions` | **Voice Calls Here!** | View all patient interactions (web, SMS, **voice**) |
| `/admin/patients` | Patient Management | View and manage patient records |
| `/admin/appointments` | Appointments | View and manage all appointments |
| `/admin/settings` | Settings | Configure system settings |

## 🎙️ View Voice Calls

### Step-by-Step:

1. **Go to**: `http://localhost:3000/admin/interactions`

2. **Click "Voice" filter button** (purple button)

3. **See all voice calls** with:
   - Complete conversation transcripts
   - Caller phone numbers
   - Call duration
   - Detected intents
   - Timestamps
   - Real-time updates

### Filter Options:
- **All** - See everything (web, SMS, voice)
- **Web** - Web chat only
- **SMS** - Text messages only
- **Voice** - Phone calls only ← **Your voice calls!**

## 📊 Admin Dashboard Features

### Main Dashboard (`/admin`)
- Total interactions count
- Recent activity feed
- Channel breakdown (web, SMS, voice)
- Quick stats

### Interactions Page (`/admin/interactions`)
- **Filter by channel** (All, Web, SMS, Voice)
- **Real-time updates** (auto-refresh every 10 seconds)
- **Complete transcripts** for each conversation
- **Intent detection** (appointments, hours, location, etc.)
- **Search and filter** capabilities
- **Export data** (coming soon)

### What You See for Each Voice Call:
```
┌─────────────────────────────────────────┐
│ 🟣 VOICE                                │
│ 📞 From: +1234567890                    │
│ 📞 To: clinic                           │
│ 🏷️ Intent: appointment_booking         │
│                                         │
│ Patient: "I need an appointment"        │
│ Assistant: "I'd be happy to help..."    │
│                                         │
│ 🕐 2 minutes ago                        │
└─────────────────────────────────────────┘
```

## 🚀 Quick Access

### Local Development:
```
Main Dashboard:    http://localhost:3000/admin
Voice Calls:       http://localhost:3000/admin/interactions (filter: Voice)
Patients:          http://localhost:3000/admin/patients
Appointments:      http://localhost:3000/admin/appointments
Settings:          http://localhost:3000/admin/settings
```

### Production:
```
Main Dashboard:    https://yourdomain.com/admin
Voice Calls:       https://yourdomain.com/admin/interactions (filter: Voice)
Patients:          https://yourdomain.com/admin/patients
Appointments:      https://yourdomain.com/admin/appointments
Settings:          https://yourdomain.com/admin/settings
```

## 🎯 How to Monitor Voice Calls

### Real-Time Monitoring:
1. Open: `http://localhost:3000/admin/interactions`
2. Click **"Voice"** filter
3. Enable **"Auto-refresh"** toggle
4. Watch calls appear in real-time!

### View Call Details:
Each voice call shows:
- **Caller Info**: Phone number, patient name (if registered)
- **Conversation**: Complete transcript of what was said
- **Intent**: What the caller wanted (appointment, hours, etc.)
- **Duration**: How long the call lasted (in metadata)
- **Timestamp**: When the call happened

### Search & Filter:
- Filter by channel (Voice)
- Search by phone number
- Search by intent
- Sort by date/time

## 📱 Mobile Access

Admin dashboard works on mobile:
- Responsive design
- Touch-friendly interface
- All features available
- Real-time updates

## 🔒 Security

### Admin Access:
- Protected routes (authentication required)
- Role-based access control
- Secure session management

### Data Privacy:
- HIPAA-compliant logging
- Encrypted data storage
- Secure API endpoints
- Audit trail for all actions

## 🎨 Dashboard Stats

### Main Dashboard Shows:
- **Total Interactions**: All channels combined
- **Web Chat**: Count of web conversations
- **SMS**: Count of text messages
- **Voice**: Count of phone calls ← **Your voice calls!**
- **Recent Activity**: Latest interactions across all channels

### Interactions Page Shows:
- **Live count** for each channel
- **Filter buttons** with counts
- **Real-time updates** indicator
- **Auto-refresh** toggle

## 🆘 Troubleshooting

### Can't access admin dashboard?
- Check URL: `http://localhost:3000/admin`
- Make sure dev server is running
- Clear browser cache

### Voice calls not showing?
1. Click the **"Voice"** filter button
2. Check if auto-refresh is enabled
3. Verify webhook is configured in Vapi
4. Check browser console for errors

### No data in dashboard?
- Make some test calls first
- Check database connection
- Verify Supabase credentials in `.env.local`

## 📊 Data Export

### Coming Soon:
- Export interactions to CSV
- Generate reports
- Analytics dashboard
- Call recordings (if enabled)

## 🎓 Tips

### Best Practices:
1. **Use filters** to focus on specific channels
2. **Enable auto-refresh** for real-time monitoring
3. **Check intents** to understand common questions
4. **Review transcripts** to improve AI responses

### Monitoring Voice Calls:
1. Keep `/admin/interactions` open with Voice filter
2. Enable auto-refresh
3. Watch calls come in real-time
4. Review transcripts to improve service

### Improving Service:
1. Look for common questions in transcripts
2. Update AI system prompt based on patterns
3. Add FAQs for frequently asked questions
4. Train staff on escalation procedures

## ✅ Quick Reference

### To View Voice Calls:
```
1. Go to: http://localhost:3000/admin/interactions
2. Click: "Voice" filter button (purple)
3. Enable: "Auto-refresh" toggle
4. Done! Watch calls appear in real-time
```

### Each Voice Call Shows:
- ✅ Complete transcript
- ✅ Caller phone number
- ✅ Detected intent
- ✅ Call duration
- ✅ Timestamp
- ✅ Patient info (if registered)

---

## 🎉 You're All Set!

Your admin dashboard is ready to monitor all voice calls!

**Main Route**: `http://localhost:3000/admin/interactions`

**Filter**: Click "Voice" to see only phone calls

**Auto-refresh**: Enable to see calls in real-time
