import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      preferred_language,
      consent_sms,
      consent_voice,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Insert patient into database
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .insert([
        {
          first_name,
          last_name,
          phone,
          email: email || null,
          date_of_birth: date_of_birth || null,
          preferred_language: preferred_language || 'en',
          consent_sms: consent_sms || false,
          consent_voice: consent_voice || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/patients:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
