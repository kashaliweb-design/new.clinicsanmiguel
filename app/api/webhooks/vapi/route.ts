import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Vapi webhook received:', JSON.stringify(body, null, 2));
    
    // Vapi sends different event structures
    const eventType = body.type || body.message?.type;
    const messageType = body.message?.type;
    
    console.log('Event type:', eventType, 'Message type:', messageType);

    // Handle different Vapi events
    if (eventType === 'end-of-call-report' || messageType === 'end-of-call-report') {
      await handleCallEnd(body);
    } else if (eventType === 'status-update' || messageType === 'status-update') {
      if (body.message?.status === 'started') {
        await handleCallStart(body);
      }
    } else if (eventType === 'conversation-update' || messageType === 'conversation-update') {
      await handleConversationUpdate(body);
    } else if (eventType === 'speech-update' || messageType === 'speech-update') {
      await handleSpeechUpdate(body);
    } else if (eventType === 'transcript' || messageType === 'transcript') {
      await handleTranscript(body.call, body.transcript || body.message);
    } else if (eventType === 'function-call' || messageType === 'function-call') {
      console.log('Function call received:', body);
    } else {
      // Log all unhandled events for debugging
      console.log('Unhandled Vapi event:', {
        eventType,
        messageType,
        fullBody: body
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vapi webhook processed successfully' 
    });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCallStart(data: any) {
  const { call, message } = data;
  const callData = call || message?.call;
  const callId = callData?.id;
  const phoneNumber = callData?.customer?.number || callData?.phoneNumber;

  console.log('Vapi call started:', { callId, phoneNumber });

  try {
    // Try to find or create patient if phone number exists
    let patientId = null;
    if (phoneNumber && phoneNumber !== 'unknown') {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient record
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            first_name: 'Voice',
            last_name: 'Caller',
            phone: phoneNumber,
            preferred_language: 'en',
            consent_voice: true,
          })
          .select()
          .single();
        
        if (newPatient) {
          patientId = newPatient.id;
          console.log('Created new patient:', patientId);
        }
      }
    }

    await supabase.from('interactions').insert({
      session_id: callId,
      patient_id: patientId,
      channel: 'voice',
      direction: 'inbound',
      from_number: phoneNumber || 'Web Caller',
      to_number: 'clinic',
      message_body: 'Voice call started via Vapi',
      intent: 'voice_call',
      metadata: {
        call_id: callId,
        event: 'call-start',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging call start:', error);
  }
}

async function handleSpeechUpdate(data: any) {
  const { message } = data;
  const callId = message?.call?.id;
  const transcript = message?.transcript || message?.speech;

  if (!transcript) return;

  console.log('Speech update:', transcript);

  try {
    await supabase.from('interactions').insert({
      session_id: callId,
      channel: 'voice',
      direction: message?.role === 'user' ? 'inbound' : 'outbound',
      from_number: message?.role === 'user' ? 'Web Caller' : 'AI Assistant',
      to_number: message?.role === 'user' ? 'clinic' : 'Web Caller',
      message_body: transcript,
      intent: extractIntent(transcript),
      metadata: {
        call_id: callId,
        event: 'speech-update',
        role: message?.role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging speech:', error);
  }
}

async function handleConversationUpdate(data: any) {
  const { message } = data;
  const callId = message?.call?.id;
  const conversation = message?.conversation || [];

  console.log('Conversation update:', conversation.length, 'messages');

  // Log the last message in conversation
  if (conversation.length > 0) {
    const lastMessage = conversation[conversation.length - 1];
    
    try {
      await supabase.from('interactions').insert({
        session_id: callId,
        channel: 'voice',
        direction: lastMessage?.role === 'user' ? 'inbound' : 'outbound',
        from_number: lastMessage?.role === 'user' ? 'Web Caller' : 'AI Assistant',
        to_number: lastMessage?.role === 'user' ? 'clinic' : 'Web Caller',
        message_body: lastMessage?.content || lastMessage?.message,
        intent: extractIntent(lastMessage?.content || lastMessage?.message),
        metadata: {
          call_id: callId,
          event: 'conversation-update',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }
}

async function handleTranscript(call: any, transcript: any) {
  const { id, phoneNumber, customer } = call;
  const { text, role } = transcript;

  console.log('Vapi transcript:', { role, text });

  // Log each message in the conversation
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: role === 'user' ? 'inbound' : 'outbound',
      from_number: role === 'user' ? (customer?.number || phoneNumber || 'unknown') : 'clinic',
      to_number: role === 'user' ? 'clinic' : (customer?.number || phoneNumber || 'unknown'),
      message_body: text,
      intent: extractIntent(text),
      metadata: {
        call_id: id,
        event: 'transcript',
        role: role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging transcript:', error);
  }
}

async function handleMessage(call: any, message: any) {
  const { id, phoneNumber, customer } = call;
  const { role, content } = message;

  console.log('Vapi message:', { role, content });

  // Log the message
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: role === 'user' ? 'inbound' : 'outbound',
      from_number: role === 'user' ? (customer?.number || phoneNumber || 'unknown') : 'clinic',
      to_number: role === 'user' ? 'clinic' : (customer?.number || phoneNumber || 'unknown'),
      message_body: content,
      intent: extractIntent(content),
      metadata: {
        call_id: id,
        event: 'message',
        role: role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging message:', error);
  }
}

async function handleCallEnd(data: any) {
  const { message, call } = data;
  const callData = call || message?.call || message;
  const callId = callData?.id;
  const phoneNumber = callData?.customer?.number || callData?.phoneNumber || callData?.phoneNumberId;
  const endedReason = message?.endedReason || callData?.endedReason;
  const duration = message?.duration || callData?.duration;
  const summary = message?.summary || callData?.summary;

  console.log('Vapi call ended:', { callId, phoneNumber, duration, endedReason });

  try {
    // Try to find or create patient
    let patientId = null;
    if (phoneNumber && phoneNumber !== 'unknown') {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            first_name: 'Voice',
            last_name: 'Caller',
            phone: phoneNumber,
            preferred_language: 'en',
            consent_voice: true,
          })
          .select()
          .single();
        
        if (newPatient) {
          patientId = newPatient.id;
          console.log('Created new patient from call end:', patientId);
        }
      }
    }

    await supabase.from('interactions').insert({
      session_id: callId,
      patient_id: patientId,
      channel: 'voice',
      direction: 'inbound',
      from_number: phoneNumber || 'Web Caller',
      to_number: 'clinic',
      message_body: summary || `Voice call ended: ${endedReason || 'completed'}. Duration: ${duration}s`,
      intent: 'call_ended',
      metadata: {
        call_id: callId,
        event: 'end-of-call-report',
        ended_reason: endedReason,
        duration_seconds: duration,
        summary: summary,
        timestamp: new Date().toISOString(),
        full_data: data,
      },
    });
  } catch (error) {
    console.error('Error logging call end:', error);
  }
}

// Extract intent from message content
function extractIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('appointment') || lowerText.includes('schedule') || lowerText.includes('book')) {
    return 'appointment_booking';
  }
  if (lowerText.includes('cancel') || lowerText.includes('reschedule')) {
    return 'appointment_modification';
  }
  if (lowerText.includes('hours') || lowerText.includes('open') || lowerText.includes('time')) {
    return 'clinic_hours';
  }
  if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where')) {
    return 'clinic_location';
  }
  if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('treatment')) {
    return 'services_inquiry';
  }
  if (lowerText.includes('insurance') || lowerText.includes('payment') || lowerText.includes('cost')) {
    return 'billing_inquiry';
  }
  
  return 'general_inquiry';
}
