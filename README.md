# SanMiguel Connect AI

A comprehensive healthcare assistant platform built with Next.js, Vapi AI, Telnyx, and Supabase. Provides 24/7 patient support through web chat, SMS, and voice channels.

## Features

- **Multi-Channel Support**: Web chat, SMS, and voice (coming soon)
- **AI-Powered Conversations**: Intelligent responses using Vapi AI
- **Appointment Management**: Find, confirm, reschedule appointments
- **HIPAA Compliant**: Secure, privacy-protected communications
- **Bilingual**: English and Spanish support
- **Real-time Interactions**: Instant responses and notifications

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Vapi AI
- **Communications**: Telnyx (SMS & Voice)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vapi account
- Telnyx account (for SMS/Voice)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `VAPI_PRIVATE_KEY` - Vapi private API key
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` - Vapi public key
- `TELNYX_API_KEY` - Telnyx API key
- `TELNYX_PHONE_NUMBER` - Your Telnyx phone number

3. **Set up the database**:

Run the schema migration in your Supabase SQL editor:
```bash
# Copy contents of supabase/schema.sql and run in Supabase SQL Editor
```

4. **Seed the database**:
```bash
# Copy contents of supabase/seed.sql and run in Supabase SQL Editor
```

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/              # Chat API endpoint
│   │   ├── clinics/           # Clinics API
│   │   ├── faqs/              # FAQs API
│   │   ├── appointments/      # Appointment management
│   │   └── webhooks/
│   │       └── telnyx/        # Telnyx webhooks
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   └── ChatWidget.tsx         # Embeddable chat widget
├── lib/
│   ├── supabase.ts            # Supabase client & types
│   ├── vapi.ts                # Vapi AI integration
│   ├── telnyx.ts              # Telnyx SMS/Voice
│   └── utils.ts               # Utility functions
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Seed data
└── public/                    # Static assets
```

## API Endpoints

### Chat
- `POST /api/chat` - Send chat message and get AI response

### Clinics
- `GET /api/clinics` - Get all active clinics

### FAQs
- `GET /api/faqs?q=query&lang=en` - Search FAQs

### Appointments
- `POST /api/appointments/find` - Find appointments by phone or code
- `POST /api/appointments/confirm` - Confirm an appointment

### Webhooks
- `POST /api/webhooks/telnyx/sms` - Telnyx SMS webhook

## Configuration

### Telnyx Setup

1. Purchase a phone number in Telnyx
2. Configure messaging profile
3. Set webhook URL to: `https://yourdomain.com/api/webhooks/telnyx/sms`
4. Add API key to `.env.local`

### Vapi Setup

1. Create a Vapi account
2. Get your API keys from dashboard
3. Configure assistant settings
4. Add keys to `.env.local`

### Supabase Setup

1. Create a new Supabase project
2. Run `schema.sql` in SQL Editor
3. Run `seed.sql` for test data
4. Get API keys from Settings > API
5. Add to `.env.local`

## Development Phases

This project follows a phased rollout plan:

- **Phase 0**: ✅ Discovery & Setup (Complete)
- **Phase 1**: ✅ MVP Chat & SMS (Complete)
- **Phase 2**: 🚧 Appointment Read/Confirm (In Progress)
- **Phase 3**: 📋 Voice Basic (Planned)
- **Phase 4**: 📋 Full CRUD (Planned)
- **Phase 5**: 📋 Human Handoff (Planned)
- **Phase 6**: 📋 RAG & Knowledge Base (Planned)
- **Phase 7**: 📋 Production Hardening (Planned)

## Testing

### Test the Chat Widget
1. Open the app in your browser
2. Click the chat button in the bottom right
3. Send a test message like "What are your hours?"

### Test SMS (requires ngrok or deployed URL)
1. Set up ngrok: `ngrok http 3000`
2. Update Telnyx webhook URL with ngrok URL
3. Send SMS to your Telnyx number
4. Check logs for webhook processing

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean App Platform

## Security & Compliance

- ✅ HIPAA-compliant infrastructure (Supabase Enterprise)
- ✅ Row-level security (RLS) enabled
- ✅ Rate limiting on API endpoints
- ✅ Input sanitization
- ✅ Audit logging
- ✅ Consent management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@sanmiguel.health

## License

Proprietary - SanMiguel Health Systems

## Acknowledgments

- Vapi AI for conversational AI
- Telnyx for communications infrastructure
- Supabase for backend services
