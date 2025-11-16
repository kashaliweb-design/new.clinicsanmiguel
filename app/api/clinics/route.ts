import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      clinics: data,
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Clinics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics', details: error.message },
      { status: 500 }
    );
  }
}
