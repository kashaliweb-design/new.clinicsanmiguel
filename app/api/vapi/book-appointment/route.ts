import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Vapi Function Call - Book Appointment:', body);

    // Extract data from Vapi function call
    const { message } = body;
    const functionCall = message?.functionCall;
    
    if (!functionCall) {
      return NextResponse.json(
        { error: 'No function call data provided' },
        { status: 400 }
      );
    }

    const {
      patientName,
      phoneNumber,
      dateOfBirth,
      appointmentType,
      appointmentDate,
      appointmentTime,
      isNewPatient,
      address,
      email
    } = functionCall.parameters;

    // Validate required fields
    if (!patientName || !phoneNumber || !appointmentDate || !appointmentTime) {
      return NextResponse.json({
        result: {
          success: false,
          message: 'Missing required fields: patientName, phoneNumber, appointmentDate, or appointmentTime'
        }
      });
    }

    // Step 1: Check if patient exists or create new patient
    let patientId;
    
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', phoneNumber)
      .single();

    if (existingPatient) {
      patientId = existingPatient.id;
      console.log('Existing patient found:', patientId);
    } else {
      // Create new patient
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          name: patientName,
          phone: phoneNumber,
          date_of_birth: dateOfBirth || null,
          email: email || null,
          address: address || null,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (patientError) {
        console.error('Error creating patient:', patientError);
        return NextResponse.json({
          result: {
            success: false,
            message: 'Failed to create patient record'
          }
        });
      }

      patientId = newPatient.id;
      console.log('New patient created:', patientId);
    }

    // Step 2: Create appointment
    const appointmentDateTime = `${appointmentDate} ${appointmentTime}`;
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        appointment_type: appointmentType || 'consultation',
        appointment_date: appointmentDateTime,
        status: 'scheduled',
        notes: `Booked via Vapi voice call. ${isNewPatient ? 'New patient.' : 'Returning patient.'}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return NextResponse.json({
        result: {
          success: false,
          message: 'Failed to create appointment'
        }
      });
    }

    // Step 3: Log interaction
    await supabase.from('interactions').insert({
      channel: 'voice_call',
      direction: 'inbound',
      message_body: `Appointment booked: ${appointmentType} on ${appointmentDate} at ${appointmentTime}`,
      from_number: phoneNumber,
      assistant_id: '34c63f21-7844-47b6-ba91-bca6b9512a21',
      metadata: {
        function_tool_id: '1f671185-45b9-43be-82c8-1f885bf7f872',
        function_name: 'bookAppointment',
        appointment_id: appointment.id
      },
      created_at: new Date().toISOString()
    });

    // Generate confirmation code
    const confirmationCode = `APT-${appointment.id.toString().padStart(6, '0')}`;

    console.log('Appointment created successfully:', appointment.id);

    // Return success response to Vapi
    return NextResponse.json({
      result: {
        success: true,
        message: `Perfect! Your appointment has been confirmed. Your confirmation code is ${confirmationCode}. You're scheduled for ${appointmentType} on ${appointmentDate} at ${appointmentTime}. We'll send you a reminder before your appointment. Is there anything else I can help you with?`,
        appointmentId: appointment.id,
        confirmationCode: confirmationCode,
        patientId: patientId
      }
    });

  } catch (error: any) {
    console.error('Error in book-appointment API:', error);
    return NextResponse.json({
      result: {
        success: false,
        message: 'An error occurred while booking your appointment. Please try again or call our office directly.'
      }
    }, { status: 500 });
  }
}
