import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';
import { sendSMS } from '@/lib/telnyx';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, confirmationCode } = body;

    if (!appointmentId && !confirmationCode) {
      return NextResponse.json(
        { error: 'Appointment ID or confirmation code is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Find appointment
    let query = supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, patients(*), clinics(*)');

    if (confirmationCode) {
      query = query.eq('confirmation_code', confirmationCode.toUpperCase());
    } else {
      query = query.eq('id', appointmentId);
    }

    const { data: appointments, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointments[0];

    // Check if already confirmed
    if (appointment.status === 'confirmed') {
      return NextResponse.json({
        message: 'Appointment already confirmed',
        appointment,
      });
    }

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', appointment.id)
      .select('*, patients(*), clinics(*)')
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log audit
    await supabase.from(TABLES.AUDIT_LOGS).insert({
      entity_type: 'appointment',
      entity_id: appointment.id,
      action: 'confirm',
      changes: {
        status: { from: appointment.status, to: 'confirmed' },
      },
    });

    // Send confirmation SMS
    if (appointment.patients?.phone && appointment.patients?.consent_sms) {
      const appointmentDate = new Date(appointment.appointment_date);
      const message = `Your appointment at ${appointment.clinics?.name} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()} has been confirmed. Confirmation code: ${appointment.confirmation_code}`;
      
      try {
        await sendSMS({
          to: appointment.patients.phone,
          text: message,
        });
      } catch (smsError) {
        console.error('Failed to send confirmation SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json({
      message: 'Appointment confirmed successfully',
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error('Confirm appointment API error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm appointment', details: error.message },
      { status: 500 }
    );
  }
}
