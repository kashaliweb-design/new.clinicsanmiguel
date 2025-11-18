import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, call, message, transcript } = body;

    console.log('Vapi webhook received:', type);

    // Handle different Vapi events
    switch (type) {
      case 'call-start':
        await handleCallStart(call);
        break;
      
      case 'transcript':
        await handleTranscript(call, transcript);
        break;
      
      case 'call-end':
        await handleCallEnd(call);
        break;
      
      case 'message':
        await handleMessage(call, message);
        break;
      
      default:
        console.log('Unhandled Vapi event type:', type);
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

async function handleCallStart(call: any) {
  const { id, phoneNumber, customer } = call;

  console.log('Vapi call started:', { id, phoneNumber });

  // Log the interaction in database
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: 'inbound',
      from_number: customer?.number || phoneNumber || 'unknown',
      to_number: phoneNumber || 'clinic',
      message_body: 'Voice call started via Vapi',
      intent: 'voice_call',
      metadata: {
        call_id: id,
        event: 'call-start',
        timestamp: new Date().toISOString(),
        customer: customer,
      },
    });
  } catch (error) {
    console.error('Error logging call start:', error);
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

async function handleCallEnd(call: any) {
  const { id, phoneNumber, customer, endedReason, duration } = call;

  console.log('Vapi call ended:', { id, duration, endedReason });

  // Log call end
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: 'inbound',
      from_number: customer?.number || phoneNumber || 'unknown',
      to_number: phoneNumber || 'clinic',
      message_body: `Voice call ended: ${endedReason || 'completed'}`,
      intent: 'call_ended',
      metadata: {
        call_id: id,
        event: 'call-end',
        ended_reason: endedReason,
        duration_seconds: duration,
        timestamp: new Date().toISOString(),
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
