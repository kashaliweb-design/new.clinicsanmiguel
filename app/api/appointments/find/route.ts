import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';
import { formatPhoneNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, confirmationCode } = body;

    if (!phone && !confirmationCode) {
      return NextResponse.json(
        { error: 'Phone number or confirmation code is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    let query = supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, patients(*), clinics(*)')
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true });

    if (confirmationCode) {
      query = query.eq('confirmation_code', confirmationCode.toUpperCase());
    } else if (phone) {
      const formattedPhone = formatPhoneNumber(phone);
      
      // First find patient
      const { data: patient } = await supabase
        .from(TABLES.PATIENTS)
        .select('id')
        .eq('phone', formattedPhone)
        .single();

      if (!patient) {
        return NextResponse.json(
          { error: 'No patient found with this phone number' },
          { status: 404 }
        );
      }

      query = query.eq('patient_id', patient.id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No appointments found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appointments: data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Find appointments API error:', error);
    return NextResponse.json(
      { error: 'Failed to find appointments', details: error.message },
      { status: 500 }
    );
  }
}
