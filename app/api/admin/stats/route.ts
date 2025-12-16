import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    // Get all stats in parallel
    const [interactions, appointments, patients, todayInteractions, recentInteractions] = await Promise.all([
      supabase.from(TABLES.INTERACTIONS).select('id', { count: 'exact', head: true }),
      supabase.from(TABLES.APPOINTMENTS).select('id', { count: 'exact', head: true }),
      supabase.from(TABLES.PATIENTS).select('id', { count: 'exact', head: true }),
      supabase
        .from(TABLES.INTERACTIONS)
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabase
        .from(TABLES.INTERACTIONS)
        .select('*, patient:patients(first_name, last_name, phone, date_of_birth)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Check for errors
    if (interactions.error) throw interactions.error;
    if (appointments.error) throw appointments.error;
    if (patients.error) throw patients.error;
    if (todayInteractions.error) throw todayInteractions.error;
    if (recentInteractions.error) throw recentInteractions.error;

    return NextResponse.json({
      success: true,
      data: {
        totalInteractions: interactions.count || 0,
        totalAppointments: appointments.count || 0,
        totalPatients: patients.count || 0,
        todayInteractions: todayInteractions.count || 0,
        recentInteractions: recentInteractions.data || [],
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    }, { status: 500 });
  }
}
