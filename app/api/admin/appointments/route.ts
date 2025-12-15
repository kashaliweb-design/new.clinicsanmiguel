import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    const supabase = getServiceSupabase();

    let query = supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, sanmiguel_patients(*), sanmiguel_clinics(*)')
      .order('appointment_date', { ascending: true });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch appointments',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Error in appointments API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred',
      error: error.message
    }, { status: 500 });
  }
}
