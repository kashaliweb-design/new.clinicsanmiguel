# Deployment Guide - SanMiguel Connect AI

## Quick Start Checklist

Before deploying, ensure you have:

- [ ] Supabase project created and configured
- [ ] Database schema migrated (`schema.sql`)
- [ ] Database seeded with initial data (`seed.sql`)
- [ ] Vapi account with API keys
- [ ] Telnyx account with phone number
- [ ] All environment variables configured
- [ ] Domain name (for production)

## Environment Variables

### Required for All Environments

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vapi
VAPI_PRIVATE_KEY=your_vapi_private_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Telnyx
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_PHONE_NUMBER=+1234567890

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Security
JWT_SECRET=your_secure_random_string_min_32_chars
WEBHOOK_SECRET=your_webhook_secret
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero-config, automatic SSL, edge functions, great DX
**Best for**: Production deployments

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/sanmiguel-connect-ai.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure project settings

3. **Add Environment Variables**:
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all required variables from above
   - Deploy

4. **Configure Webhooks**:
   - Update Telnyx webhook URL to: `https://yourdomain.vercel.app/api/webhooks/telnyx/sms`

5. **Custom Domain** (Optional):
   - Go to Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Railway

**Pros**: Simple, affordable, good for MVPs
**Best for**: Development and staging

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**:
```bash
railway login
railway init
```

3. **Add Environment Variables**:
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_value
# ... add all other variables
```

4. **Deploy**:
```bash
railway up
```

### Option 3: AWS Amplify

**Pros**: AWS ecosystem integration, scalable
**Best for**: Enterprise deployments

1. **Install Amplify CLI**:
```bash
npm install -g @aws-amplify/cli
```

2. **Initialize Amplify**:
```bash
amplify init
```

3. **Add Hosting**:
```bash
amplify add hosting
```

4. **Deploy**:
```bash
amplify publish
```

### Option 4: DigitalOcean App Platform

**Pros**: Simple pricing, good performance
**Best for**: Mid-size deployments

1. **Create App**:
   - Go to DigitalOcean dashboard
   - Click "Create" > "Apps"
   - Connect your GitHub repository

2. **Configure Build**:
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Add Environment Variables**:
   - Add all required variables in the dashboard

4. **Deploy**

## Post-Deployment Configuration

### 1. Configure Telnyx Webhooks

Update your Telnyx messaging profile:

- **SMS Webhook URL**: `https://yourdomain.com/api/webhooks/telnyx/sms`
- **Method**: POST
- **Failover URL**: (optional) backup webhook endpoint

### 2. Test the Deployment

```bash
# Test chat endpoint
curl -X POST https://yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your hours?"}'

# Test clinics endpoint
curl https://yourdomain.com/api/clinics

# Test FAQs endpoint
curl https://yourdomain.com/api/faqs?q=hours
```

### 3. Send Test SMS

Send an SMS to your Telnyx number and verify:
- Webhook receives the message
- AI processes the request
- Response is sent back

### 4. Monitor Logs

Check your deployment platform's logs for any errors:

**Vercel**:
```bash
vercel logs
```

**Railway**:
```bash
railway logs
```

## Database Migrations

### Initial Setup

1. Go to Supabase SQL Editor
2. Run `supabase/schema.sql`
3. Run `supabase/seed.sql`

### Future Migrations

Create migration files in `supabase/migrations/`:

```sql
-- supabase/migrations/001_add_new_field.sql
ALTER TABLE patients ADD COLUMN preferred_contact VARCHAR(20);
```

## Monitoring & Observability

### Recommended Tools

1. **Sentry** (Error Tracking):
```bash
npm install @sentry/nextjs
```

2. **Vercel Analytics** (Performance):
   - Enable in Vercel dashboard

3. **Supabase Logs**:
   - Monitor in Supabase dashboard

4. **Custom Logging**:
   - Use `console.log` for development
   - Use structured logging for production

### Health Check Endpoint

Create `/api/health`:

```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
```

## Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Webhook signatures are validated
- [ ] SQL injection protection (using Supabase client)
- [ ] XSS protection (React default)
- [ ] CSRF protection for mutations

## Scaling Considerations

### Database

- **Connection Pooling**: Supabase handles this automatically
- **Read Replicas**: Available on Supabase Pro plan
- **Indexes**: Already created in schema.sql

### API

- **Edge Functions**: Vercel automatically deploys to edge
- **Caching**: Implement for FAQs and clinic data
- **Rate Limiting**: Already implemented in chat endpoint

### Monitoring

Set up alerts for:
- High error rates (> 1%)
- Slow response times (> 2s p95)
- High webhook failure rates
- Database connection issues

## Rollback Procedure

If deployment fails:

1. **Vercel**: Instant rollback in dashboard
2. **Railway**: `railway rollback`
3. **Manual**: Revert Git commit and redeploy

## Cost Estimates

### Development (MVP)

- Vercel: Free (Hobby plan)
- Supabase: Free (up to 500MB)
- Vapi: ~$50/month (usage-based)
- Telnyx: ~$1/number + usage
- **Total**: ~$50-100/month

### Production (1000 users)

- Vercel: $20/month (Pro plan)
- Supabase: $25/month (Pro plan)
- Vapi: ~$200/month
- Telnyx: ~$50/month
- **Total**: ~$300-400/month

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Test endpoints individually
- Contact support if needed

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure custom domain
3. Enable analytics
4. Set up staging environment
5. Plan Phase 2 features
