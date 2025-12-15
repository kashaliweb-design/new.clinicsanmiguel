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
      .from(TABLES.INTERACTIONS)
      .select(`
        *,
        patient:sanmiguel_patients(first_name, last_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('channel', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching interactions:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch interactions',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Error in interactions API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred',
      error: error.message
    }, { status: 500 });
  }
}
