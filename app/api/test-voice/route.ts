import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test adding a voice interaction
    const { data, error } = await supabase.from('interactions').insert({
      session_id: 'test-' + Date.now(),
      channel: 'voice',
      direction: 'inbound',
      from_number: 'Test User',
      to_number: 'clinic',
      message_body: 'Test voice call - I need an appointment for tomorrow',
      intent: 'appointment_booking',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    }).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test interaction added',
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
