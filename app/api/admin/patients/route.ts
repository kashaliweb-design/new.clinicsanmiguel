import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch patients',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Error in patients API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred',
      error: error.message
    }, { status: 500 });
  }
}
