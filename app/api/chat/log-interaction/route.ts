import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      session_id,
      patient_id,
      channel,
      direction,
      from_number,
      to_number,
      message_body,
      intent,
      metadata
    } = body;

    // Validate required fields
    if (!session_id || !channel || !direction || !message_body) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const interactionData: any = {
      session_id,
      channel,
      direction,
      message_body,
      created_at: new Date().toISOString(),
    };

    if (patient_id) interactionData.patient_id = patient_id;
    if (from_number) interactionData.from_number = from_number;
    if (to_number) interactionData.to_number = to_number;
    if (intent) interactionData.intent = intent;
    if (metadata) interactionData.metadata = metadata;

    const { data, error } = await supabase
      .from('interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) {
      console.error('Error logging interaction:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to log interaction',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Error in log-interaction API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while logging interaction',
      error: error.message
    }, { status: 500 });
  }
}
