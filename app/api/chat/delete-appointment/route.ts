import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Chat Appointment Delete Request:', body);

    const {
      phoneNumber,
      email,
      confirmationCode,
      appointmentId,
      reason
    } = body;

    // Validate required fields - need at least phone/email and confirmation code or appointment ID
    if ((!phoneNumber && !email) || (!confirmationCode && !appointmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: (phoneNumber or email) and (confirmationCode or appointmentId)'
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Step 1: Find the patient by phone or email
    let patient;
    if (phoneNumber) {
      const { data } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email')
        .eq('phone', phoneNumber)
        .single();
      patient = data;
    } else if (email) {
      const { data } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email')
        .eq('email', email)
        .single();
      patient = data;
    }

    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'No patient found with this phone number or email'
      }, { status: 404 });
    }

    // Step 2: Find the appointment
    let appointment;
    if (appointmentId) {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('patient_id', patient.id)
        .single();
      appointment = data;
    } else if (confirmationCode) {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('confirmation_code', confirmationCode)
        .single();
      appointment = data;
    }

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'No appointment found with the provided information'
      }, { status: 404 });
    }

    // Check if appointment can be deleted
    if (appointment.status === 'completed') {
      return NextResponse.json({
        success: false,
        message: 'This appointment has already been completed and cannot be deleted.'
      }, { status: 400 });
    }

    // Step 3: Delete the appointment (hard delete from database)
    const { error: deleteError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .delete()
      .eq('id', appointment.id);

    if (deleteError) {
      console.error('Error deleting appointment:', deleteError);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete appointment'
      }, { status: 500 });
    }

    // Step 4: Log interaction
    await supabase.from(TABLES.INTERACTIONS).insert({
      session_id: `chat-delete-${Date.now()}`,
      patient_id: patient.id,
      channel: 'web_chat',
      direction: 'inbound',
      message_body: `Appointment deleted permanently. Reason: ${reason || 'Not specified'}`,
      from_number: phoneNumber || patient.phone,
      intent: 'appointment_deletion',
      metadata: {
        appointment_id: appointment.id,
        deleted_date: appointment.appointment_date,
        confirmation_code: appointment.confirmation_code,
        source: 'web_chat'
      },
      created_at: new Date().toISOString()
    });

    console.log('Appointment deleted successfully:', appointment.id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Your appointment (${appointment.confirmation_code}) has been permanently deleted from our system.`,
      appointmentId: appointment.id
    });

  } catch (error: any) {
    console.error('Error in chat delete-appointment API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while deleting your appointment. Please try again or call our office directly.'
    }, { status: 500 });
  }
}
