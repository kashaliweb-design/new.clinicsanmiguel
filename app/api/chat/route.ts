import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { generateSessionId, sanitizeInput, RateLimiter } from '@/lib/utils';

const rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

// Simple keyword matching function
function findBestMatch(userMessage: string, faqs: any[]): any | null {
  const lowerMessage = userMessage.toLowerCase();
  
  // Extract keywords from user message
  const keywords = lowerMessage.split(/\s+/).filter(word => word.length > 2);
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const faq of faqs) {
    let score = 0;
    const faqQuestion = faq.question.toLowerCase();
    const faqKeywords = faq.keywords || [];
    
    // Check for exact phrase match
    if (faqQuestion.includes(lowerMessage) || lowerMessage.includes(faqQuestion)) {
      score += 100;
    }
    
    // Check keyword matches
    for (const keyword of keywords) {
      if (faqQuestion.includes(keyword)) {
        score += 10;
      }
      if (faqKeywords.some((k: string) => k.toLowerCase().includes(keyword))) {
        score += 5;
      }
    }
    
    // Check category relevance
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('much')) {
      if (faq.category === 'pricing') score += 20;
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
      if (faq.category === 'locations') score += 20;
    }
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      if (faq.category === 'appointments') score += 20;
    }
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
      if (faq.category === 'hours') score += 20;
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('treatment') || lowerMessage.includes('care')) {
      if (faq.category === 'services') score += 20;
    }
    if (lowerMessage.includes('spanish') || lowerMessage.includes('español') || lowerMessage.includes('hablan')) {
      if (faq.category === 'language') score += 20;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  return highestScore > 5 ? bestMatch : null;
}

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
    const { message, sessionId: providedSessionId, phone, language = 'en' } = body;

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

    // Detect language from message
    const detectedLanguage = /[áéíóúñ¿¡]/i.test(sanitizedMessage) ? 'es' : language;

    // Search FAQs in database
    const { data: faqs, error: faqError } = await supabase
      .from('faqs')
      .select('*')
      .eq('active', true)
      .eq('language', detectedLanguage)
      .limit(50);

    if (faqError) {
      console.error('FAQ search error:', faqError);
    }

    // Find best matching FAQ
    let responseMessage = '';
    let intent = 'general_inquiry';
    let confidence = 0;

    if (faqs && faqs.length > 0) {
      const bestMatch = findBestMatch(sanitizedMessage, faqs);
      
      if (bestMatch) {
        responseMessage = bestMatch.answer;
        intent = bestMatch.category || 'general_inquiry';
        confidence = 0.85;
      } else {
        // Default response if no match found
        responseMessage = detectedLanguage === 'es' 
          ? 'Gracias por su pregunta. Nuestras clínicas ofrecen atención médica asequible desde $19, sin necesidad de seguro. Tenemos 17 ubicaciones en Texas. ¿Puedo ayudarle con algo específico sobre nuestros servicios, ubicaciones, horarios o precios?'
          : 'Thank you for your question. Our clinics offer affordable healthcare starting at $19, no insurance required. We have 17 locations across Texas. Can I help you with something specific about our services, locations, hours, or pricing?';
        confidence = 0.3;
      }
    } else {
      // Fallback if FAQs not loaded yet
      responseMessage = detectedLanguage === 'es'
        ? 'Bienvenido a Clínica San Miguel. Ofrecemos atención médica asequible desde $19. ¿En qué puedo ayudarle?'
        : 'Welcome to Clinica San Miguel. We offer affordable healthcare starting at $19. How can I help you?';
      confidence = 0.2;
    }

    // Log interaction
    await supabase.from('interactions').insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'web_chat',
      direction: 'inbound',
      message_body: sanitizedMessage,
      intent: intent,
      metadata: {
        ip: clientIp,
        user_agent: request.headers.get('user-agent'),
        language: detectedLanguage,
      },
    });

    await supabase.from('interactions').insert({
      session_id: sessionId,
      patient_id: patient?.id || null,
      channel: 'web_chat',
      direction: 'outbound',
      message_body: responseMessage,
      intent: intent,
    });

    return NextResponse.json({
      message: responseMessage,
      sessionId,
      intent: intent,
      confidence: confidence,
      language: detectedLanguage,
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
