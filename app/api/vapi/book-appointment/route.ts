import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

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

    const supabase = getServiceSupabase();

    // Step 1: Check if patient exists or create new patient
    let patientId;
    
    const { data: existingPatient } = await supabase
      .from(TABLES.PATIENTS)
      .select('id')
      .eq('phone', phoneNumber)
      .single();

    if (existingPatient) {
      patientId = existingPatient.id;
      console.log('Existing patient found:', patientId);
      
      // Update patient info if provided
      const updateData: any = {};
      if (email) updateData.email = email;
      if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from(TABLES.PATIENTS)
          .update(updateData)
          .eq('id', patientId);
      }
    } else {
      // Parse patient name
      const nameParts = patientName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      // Create new patient
      const { data: newPatient, error: patientError } = await supabase
        .from(TABLES.PATIENTS)
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          date_of_birth: dateOfBirth || null,
          email: email || null,
          consent_sms: true,
          consent_voice: true,
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

    // Step 2: Get first available clinic
    const { data: clinic } = await supabase
      .from(TABLES.CLINICS)
      .select('id')
      .eq('active', true)
      .limit(1)
      .single();

    if (!clinic) {
      return NextResponse.json({
        result: {
          success: false,
          message: 'No active clinic found'
        }
      });
    }

    // Step 3: Create appointment
    // Convert time format if needed
    let time24Hour = appointmentTime;
    const timeMatch = appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      time24Hour = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    const appointmentDateTime = `${appointmentDate}T${time24Hour}:00`;
    
    // Generate confirmation code (max 10 chars)
    const tempId = Date.now().toString().slice(-5);
    const confirmationCode = `VAPI-${tempId}`;
    
    const { data: appointment, error: appointmentError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .insert({
        patient_id: patientId,
        clinic_id: clinic.id,
        service_type: appointmentType || 'consultation',
        appointment_date: appointmentDateTime,
        status: 'confirmed',
        confirmation_code: confirmationCode,
        notes: `Booked via Vapi voice call. ${isNewPatient ? 'New patient.' : 'Returning patient.'}`,
        duration_minutes: 30,
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

    // Step 4: Log interaction
    await supabase.from(TABLES.INTERACTIONS).insert({
      session_id: `vapi-${Date.now()}`,
      patient_id: patientId,
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

    console.log('Appointment created successfully:', appointment.id);
    console.log('Confirmation code:', confirmationCode);

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
