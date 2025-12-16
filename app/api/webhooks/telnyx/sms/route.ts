import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';
import { sendSMS, parseTelnyxWebhook } from '@/lib/telnyx';
import { sendOpenAIChat, createOpenAISystemPrompt, ChatMessage } from '@/lib/openai';
import { generateSessionId, sanitizeInput } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse Telnyx webhook
    const parsed = parseTelnyxWebhook(body);
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const { eventType, from, to, text, messageId } = parsed;

    // Only process inbound messages
    if (eventType !== 'message.received') {
      return NextResponse.json({ status: 'ignored', eventType });
    }

    if (!text) {
      return NextResponse.json({ status: 'ignored', reason: 'no text' });
    }

    const supabase = getServiceSupabase();
    const sanitizedMessage = sanitizeInput(text);
    const sessionId = generateSessionId();

    // Find or create patient by phone
    let { data: patient } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .eq('phone', from)
      .single();

    // If patient doesn't exist, create new patient
    if (!patient) {
      console.log('Creating new patient from SMS:', from);
      const { data: newPatient } = await supabase
        .from(TABLES.PATIENTS)
        .insert({
          first_name: 'SMS',
          last_name: 'Patient',
          phone: from,
          preferred_language: 'en',
          consent_sms: true, // Auto-consent since they're texting us
        })
        .select()
        .single();
      
      patient = newPatient;
      console.log('New patient created:', patient?.id);
    }

    // Check SMS consent
    if (patient && !patient.consent_sms) {
      await sendSMS({
        to: from,
        text: 'To receive SMS from SanMiguel Connect AI, please reply YES to consent.',
      });
      return NextResponse.json({ status: 'consent_required' });
    }

    // Get clinic info
    const { data: clinics } = await supabase
      .from(TABLES.CLINICS)
      .select('*')
      .eq('active', true);

    // Get patient appointments if patient exists
    let appointments = null;
    if (patient) {
      const { data } = await supabase
        .from(TABLES.APPOINTMENTS)
        .select('*, clinics(*)')
        .eq('patient_id', patient.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(3);
      appointments = data;
    }

    // Get relevant FAQs
    const language = patient?.preferred_language || 'en';
    const { data: faqs } = await supabase
      .from(TABLES.FAQS)
      .select('*')
      .eq('active', true)
      .eq('language', language)
      .limit(10);

    // Build context
    const context = {
      clinicInfo: clinics,
      patientInfo: patient,
      appointmentInfo: appointments,
    };

    // Create messages for OpenAI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: createOpenAISystemPrompt(context),
      },
      {
        role: 'user',
        content: sanitizedMessage,
      },
    ];

    // Add FAQ context
    if (faqs && faqs.length > 0) {
      const faqContext = faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
      messages.splice(1, 0, {
        role: 'system',
        content: `Available FAQs:\n${faqContext}`,
      });
    }

    // Get response from OpenAI
    const vapiResponse = await sendOpenAIChat(messages);

    // Log inbound interaction
    await supabase.from(TABLES.INTERACTIONS).insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'sms',
      direction: 'inbound',
      from_number: from,
      to_number: to,
      message_body: sanitizedMessage,
      intent: vapiResponse.intent,
      metadata: { telnyx_message_id: messageId },
    });

    // Send SMS response
    await sendSMS({
      to: from,
      text: vapiResponse.message,
    });

    // Log outbound interaction
    await supabase.from(TABLES.INTERACTIONS).insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'sms',
      direction: 'outbound',
      from_number: to,
      to_number: from,
      message_body: vapiResponse.message,
      intent: vapiResponse.intent,
    });

    return NextResponse.json({
      status: 'success',
      sessionId,
      intent: vapiResponse.intent,
    });
  } catch (error: any) {
    console.error('Telnyx SMS webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process SMS webhook', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'SanMiguel Connect AI Telnyx SMS Webhook',
    version: '1.0.0',
  });
}
