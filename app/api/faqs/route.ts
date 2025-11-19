import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang') || 'en';
    const category = searchParams.get('category');

    const supabase = getServiceSupabase();
    let queryBuilder = supabase
      .from('faqs')
      .select('*')
      .eq('active', true)
      .eq('language', language);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    // Simple text search if query provided
    if (query) {
      queryBuilder = queryBuilder.or(
        `question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`
      );
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      faqs: data,
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('FAQs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs', details: error.message },
      { status: 500 }
    );
  }
}
