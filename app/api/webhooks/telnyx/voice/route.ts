import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, payload } = body.data || body;

    console.log('Telnyx voice webhook received:', event_type);

    // Handle different call events
    switch (event_type) {
      case 'call.initiated':
        await handleCallInitiated(payload);
        break;
      
      case 'call.answered':
        await handleCallAnswered(payload);
        break;
      
      case 'call.hangup':
        await handleCallHangup(payload);
        break;
      
      default:
        console.log('Unhandled event type:', event_type);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    console.error('Voice webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCallInitiated(payload: any) {
  const { call_control_id, from, to, direction } = payload;

  console.log('Call initiated:', { from, to, direction });

  const supabase = getServiceSupabase();

  // Log the interaction in database
  try {
    await supabase.from(TABLES.INTERACTIONS).insert({
      channel: 'voice',
      direction: direction === 'incoming' ? 'inbound' : 'outbound',
      from_number: from,
      to_number: to,
      message_body: 'Voice call initiated',
      intent: 'voice_call',
      metadata: {
        call_control_id,
        event: 'call.initiated',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging call initiation:', error);
  }
}

async function handleCallAnswered(payload: any) {
  const { call_control_id, from, to } = payload;

  console.log('Call answered:', { from, to });

  const supabase = getServiceSupabase();

  // Update interaction status
  try {
    await supabase
      .from(TABLES.INTERACTIONS)
      .update({
        metadata: {
          call_control_id,
          event: 'call.answered',
          timestamp: new Date().toISOString(),
        },
      })
      .eq('from_number', from)
      .eq('to_number', to)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating call status:', error);
  }
}

async function handleCallHangup(payload: any) {
  const { call_control_id, from, to, hangup_cause, call_duration_secs } = payload;

  console.log('Call ended:', { from, to, duration: call_duration_secs });

  const supabase = getServiceSupabase();

  // Update interaction with call duration
  try {
    await supabase
      .from(TABLES.INTERACTIONS)
      .update({
        metadata: {
          call_control_id,
          event: 'call.hangup',
          hangup_cause,
          duration_seconds: call_duration_secs,
          timestamp: new Date().toISOString(),
        },
      })
      .eq('from_number', from)
      .eq('to_number', to)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating call end:', error);
  }
}
