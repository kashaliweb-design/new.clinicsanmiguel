import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendOpenAIChat, createOpenAISystemPrompt, ChatMessage } from '@/lib/openai';
import { generateSessionId, sanitizeInput, RateLimiter } from '@/lib/utils';

const rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!rateLimiter.check(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId: providedSessionId, phone } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeInput(message);
    const sessionId = providedSessionId || generateSessionId();
    const supabase = getServiceSupabase();

    // Try to find patient by phone if provided
    let patient = null;
    if (phone) {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', phone)
        .single();
      patient = data;
    }

    // Get clinic info for context
    const { data: clinics } = await supabase
      .from('clinics')
      .select('*')
      .eq('active', true);

    // Get relevant FAQs
    const { data: faqs } = await supabase
      .from('faqs')
      .select('*')
      .eq('active', true)
      .eq('language', 'en')
      .limit(10);

    // Build context for system prompt
    const context = {
      clinicInfo: clinics,
      patientInfo: patient,
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

    // Log interaction
    await supabase.from('interactions').insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'web_chat',
      direction: 'inbound',
      message_body: sanitizedMessage,
      intent: vapiResponse.intent,
      metadata: {
        ip: clientIp,
        user_agent: request.headers.get('user-agent'),
      },
    });

    await supabase.from('interactions').insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'web_chat',
      direction: 'outbound',
      message_body: vapiResponse.message,
      intent: vapiResponse.intent,
    });

    return NextResponse.json({
      message: vapiResponse.message,
      sessionId,
      intent: vapiResponse.intent,
      confidence: vapiResponse.confidence,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'SanMiguel Connect AI Chat API',
    version: '1.0.0',
  });
}
