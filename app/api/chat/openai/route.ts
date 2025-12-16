import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServiceSupabase, TABLES } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AppointmentIntent {
  action: 'book' | 'confirm' | 'cancel' | 'reschedule' | 'none';
  data: any;
}

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'OpenAI API key is not configured. Please contact support.',
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 30000,
    });

    const { messages, conversationState, appointmentData, patientPhone, sessionId } = await request.json();

    const systemPrompt = `You are Riley, a friendly scheduling assistant for Clinica San Miguel.

RESPONSE STYLE - CRITICAL:
• Keep responses SHORT (1-2 sentences max)
• Use emojis sparingly (✅ 📅 🏥 💰)
• Ask ONE question at a time
• Be conversational and warm

KEY INFO:
💰 Consultation: $19 | Immigration Exam: $220
🕐 Hours: Mon-Fri 8am-5pm, Sat 9am-12pm
🏥 Services: Primary Care, Specialist, Urgent Care, Immigration Exams, Diagnostics, Wellness

LOCATIONS: Dallas, Arlington, Houston, San Antonio, Fort Worth, Farmers Branch

Current state: ${conversationState || 'initial'}
${appointmentData ? `Data: ${JSON.stringify(appointmentData)}` : ''}

APPOINTMENT MANAGEMENT FLOWS:

BOOKING FLOW - Follow this EXACT sequence:
1. If no name: "May I have your name, please?"
2. If no phone: "Could you please provide your phone number?"
3. If no date: "When would you like to schedule your appointment? (Please provide a date)"
4. If no time: "What time works best for you on that date?"
5. If no service type: "What type of service do you need? (consultation, immigration exam, etc.)"
6. CONFIRMATION: "To confirm, would you like to book a [service] for [date] at [time]?"
7. Wait for YES/confirmation before booking

CANCELLATION FLOW:
1. "I can help you cancel your appointment. May I have your phone number?"
2. "What's your confirmation code? (or appointment date if you don't have the code)"
3. Find and show appointment details
4. "To confirm, do you want to cancel your [service] appointment on [date] at [time]?"
5. Wait for YES confirmation before canceling

RESCHEDULING FLOW:
1. "I can help you reschedule. What's your phone number?"
2. "What's your confirmation code? (or current appointment date)"
3. Show current appointment
4. "What's your new preferred date?"
5. "What time works best on the new date?"
6. "To confirm, reschedule from [old date/time] to [new date/time]?"
7. Wait for YES confirmation before rescheduling

NEVER skip confirmation steps! Always confirm before making changes.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const assistantMessage = completion.choices[0].message.content;

    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let intent = 'none';
    
    // Check if user is confirming a booking (has all required data + confirmation words)
    const hasAllBookingData = appointmentData?.patientName && 
                              appointmentData?.phoneNumber && 
                              appointmentData?.appointmentDate && 
                              appointmentData?.appointmentTime;

    const isConfirmingBooking = (lastUserMessage.includes('yes') || 
                                 lastUserMessage.includes('confirm') || 
                                 lastUserMessage.includes('correct') ||
                                 lastUserMessage.includes('ok') ||
                                 lastUserMessage.includes('sure') ||
                                 lastUserMessage.includes('plz') ||
                                 lastUserMessage.includes('please')) && hasAllBookingData;

    if (isConfirmingBooking) {
      intent = 'book'; // Treat confirmation as booking action when all data is present
    } else if (lastUserMessage.includes('book') || lastUserMessage.includes('schedule') || lastUserMessage.includes('appointment')) {
      intent = 'book';
    } else if (lastUserMessage.includes('cancel')) {
      intent = 'cancel';
    } else if (lastUserMessage.includes('reschedule') || lastUserMessage.includes('change')) {
      intent = 'reschedule';
    }

    const supabase = getServiceSupabase();
    let appointmentResult = null;

    console.log('🔍 DEBUG BOOKING:', {
      lastUserMessage,
      intent,
      hasAllBookingData,
      isConfirmingBooking,
      appointmentData
    });
    console.log('Intent detected:', intent);
    console.log('Appointment data:', appointmentData);
    console.log('Has required fields:', {
      patientName: !!appointmentData?.patientName,
      phoneNumber: !!appointmentData?.phoneNumber,
      appointmentDate: !!appointmentData?.appointmentDate,
      appointmentTime: !!appointmentData?.appointmentTime
    });

    // Auto-create/update patient when we have name and phone (regardless of appointment)
    let autoCreatedPatientId = null;
    if (appointmentData?.patientName && appointmentData?.phoneNumber) {
      try {
        console.log('👤 Auto-creating/updating patient with collected details');
        const nameParts = appointmentData.patientName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Check if patient exists
        const { data: existingPatient } = await supabase
          .from(TABLES.PATIENTS)
          .select('id')
          .eq('phone', appointmentData.phoneNumber)
          .single();

        if (existingPatient) {
          console.log('✅ Patient already exists:', existingPatient.id);
          autoCreatedPatientId = existingPatient.id;
          
          // Update patient info if new data provided
          const updateData: any = {};
          if (appointmentData.email) updateData.email = appointmentData.email;
          if (appointmentData.dateOfBirth) updateData.date_of_birth = appointmentData.dateOfBirth;
          
          if (Object.keys(updateData).length > 0) {
            await supabase.from(TABLES.PATIENTS).update(updateData).eq('id', existingPatient.id);
            console.log('✅ Patient info updated');
          }
        } else {
          // Create new patient
          const { data: newPatient, error: patientError } = await supabase
            .from(TABLES.PATIENTS)
            .insert({
              first_name: firstName,
              last_name: lastName,
              phone: appointmentData.phoneNumber,
              email: appointmentData.email || null,
              date_of_birth: appointmentData.dateOfBirth || null,
              consent_sms: true,
              consent_voice: false,
            })
            .select()
            .single();

          if (patientError) {
            console.error('❌ Error creating patient:', patientError);
          } else if (newPatient) {
            autoCreatedPatientId = newPatient.id;
            console.log('✅ New patient created:', newPatient.id);
          }
        }
      } catch (error) {
        console.error('❌ Error in auto-patient creation:', error);
      }
    }

    if (intent === 'book' && appointmentData?.patientName && appointmentData?.phoneNumber && appointmentData?.appointmentDate && appointmentData?.appointmentTime) {
      try {
        const bookingData = {
          patientName: appointmentData.patientName,
          phoneNumber: appointmentData.phoneNumber,
          email: appointmentData.email,
          dateOfBirth: appointmentData.dateOfBirth,
          appointmentType: appointmentData.appointmentType || 'consultation',
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          isNewPatient: appointmentData.isNewPatient !== false,
          notes: appointmentData.notes,
        };

        const nameParts = bookingData.patientName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        let patientId;
        const { data: existingPatient } = await supabase
          .from(TABLES.PATIENTS)
          .select('id')
          .eq('phone', bookingData.phoneNumber)
          .single();

        if (existingPatient) {
          patientId = existingPatient.id;
          const updateData: any = {};
          if (bookingData.email) updateData.email = bookingData.email;
          if (bookingData.dateOfBirth) updateData.date_of_birth = bookingData.dateOfBirth;
          if (Object.keys(updateData).length > 0) {
            await supabase.from(TABLES.PATIENTS).update(updateData).eq('id', patientId);
          }
        } else {
          const { data: newPatient } = await supabase
            .from(TABLES.PATIENTS)
            .insert({
              first_name: firstName,
              last_name: lastName,
              phone: bookingData.phoneNumber,
              date_of_birth: bookingData.dateOfBirth || null,
              email: bookingData.email || null,
              consent_sms: true,
              consent_voice: false,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();
          if (newPatient) patientId = newPatient.id;
        }

        const { data: clinic, error: clinicError } = await supabase
          .from(TABLES.CLINICS)
          .select('id')
          .eq('active', true)
          .limit(1)
          .single();

        if (clinicError) {
          console.error('❌ Error fetching clinic:', clinicError);
        }

        if (!clinic) {
          console.error('❌ No active clinic found in database');
        }

        if (!patientId) {
          console.error('❌ Patient ID is missing');
        }

        if (clinic && patientId) {
          console.log('✅ Clinic found:', clinic.id);
          console.log('✅ Patient ID:', patientId);

          let time24Hour = bookingData.appointmentTime;
          const timeMatch = bookingData.appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const period = timeMatch[3].toUpperCase();
            if (period === 'PM' && hours !== 12) hours += 12;
            else if (period === 'AM' && hours === 12) hours = 0;
            time24Hour = `${hours.toString().padStart(2, '0')}:${minutes}`;
          }

          const appointmentDateTime = `${bookingData.appointmentDate}T${time24Hour}:00`;
          // Generate 10-char confirmation code: CHAT-XXXXX (max 10 chars)
          const confirmationCode = `CHAT-${Date.now().toString().slice(-5)}`;

          console.log('📅 Creating appointment:', {
            patient_id: patientId,
            clinic_id: clinic.id,
            appointment_date: appointmentDateTime,
            service_type: bookingData.appointmentType || 'consultation',
            status: 'confirmed',
            confirmation_code: confirmationCode,
          });

          const { data: appointment, error: appointmentError } = await supabase
            .from(TABLES.APPOINTMENTS)
            .insert({
              patient_id: patientId,
              clinic_id: clinic.id,
              appointment_date: appointmentDateTime,
              service_type: bookingData.appointmentType || 'consultation',
              status: 'confirmed',
              confirmation_code: confirmationCode,
              notes: bookingData.notes || `Booked via web chat.`,
              duration_minutes: 30,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (appointmentError) {
            console.error('❌ APPOINTMENT INSERT ERROR:', appointmentError);
            console.error('Error details:', JSON.stringify(appointmentError, null, 2));
          }

          if (appointment) {
            console.log('✅ Appointment created successfully:', appointment.id);
            appointmentResult = {
              success: true,
              message: `Perfect! Your appointment has been confirmed. Your confirmation code is ${confirmationCode}. You're scheduled for ${bookingData.appointmentType || 'consultation'} on ${bookingData.appointmentDate} at ${bookingData.appointmentTime}.`,
              appointmentId: appointment.id,
              confirmationCode: confirmationCode,
              patientId: patientId,
            };
          } else {
            console.error('❌ Appointment was not created (no data returned)');
          }
        } else {
          console.error('❌ Cannot create appointment - missing clinic or patientId');
        }
        
        if (sessionId && appointmentResult) {
          await supabase.from(TABLES.INTERACTIONS).insert({
            session_id: sessionId,
            patient_id: appointmentResult.patientId,
            channel: 'web_chat',
            direction: 'outbound',
            message_body: appointmentResult.message,
            to_number: appointmentData.phoneNumber,
            intent: 'appointment_booking',
            metadata: {
              appointment_id: appointmentResult.appointmentId,
              confirmation_code: appointmentResult.confirmationCode,
              action: 'booked',
            },
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error booking appointment:', error);
      }
    } else if (intent === 'confirm' && (appointmentData?.confirmationCode || appointmentData?.phoneNumber)) {
      try {
        let query = supabase.from(TABLES.APPOINTMENTS).select('*, patients(*), clinics(*)');
        if (appointmentData.confirmationCode) {
          query = query.eq('confirmation_code', appointmentData.confirmationCode.toUpperCase());
        } else if (appointmentData.appointmentId) {
          query = query.eq('id', appointmentData.appointmentId);
        }

        const { data: appointments } = await query;
        if (appointments && appointments.length > 0) {
          const appointment = appointments[0];
          if (appointment.status !== 'confirmed') {
            const { data: updatedAppointment } = await supabase
              .from(TABLES.APPOINTMENTS)
              .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
              })
              .eq('id', appointment.id)
              .select('*, patients(*), clinics(*)')
              .single();

            if (updatedAppointment) {
              appointmentResult = {
                success: true,
                message: 'Appointment confirmed successfully',
                appointment: updatedAppointment,
              };
            }
          } else {
            appointmentResult = {
              success: true,
              message: 'Appointment already confirmed',
              appointment: appointment,
            };
          }
        }
        
        if (sessionId && appointmentResult && appointmentResult.appointment) {
          await supabase.from(TABLES.INTERACTIONS).insert({
            session_id: sessionId,
            patient_id: appointmentResult.appointment.patient_id,
            channel: 'web_chat',
            direction: 'outbound',
            message_body: appointmentResult.message,
            to_number: patientPhone,
            intent: 'appointment_confirmation',
            metadata: {
              appointment_id: appointmentResult.appointment.id,
              action: 'confirmed',
            },
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error confirming appointment:', error);
      }
    } else if (intent === 'cancel' && appointmentData?.phoneNumber && (appointmentData?.confirmationCode || appointmentData?.appointmentId)) {
      try {
        const { data: patient } = await supabase
          .from(TABLES.PATIENTS)
          .select('id')
          .eq('phone', appointmentData.phoneNumber)
          .single();

        if (patient) {
          let appointment;
          if (appointmentData.appointmentId) {
            const { data } = await supabase
              .from(TABLES.APPOINTMENTS)
              .select('*')
              .eq('id', appointmentData.appointmentId)
              .eq('patient_id', patient.id)
              .single();
            appointment = data;
          } else if (appointmentData.confirmationCode) {
            const { data } = await supabase
              .from(TABLES.APPOINTMENTS)
              .select('*')
              .eq('patient_id', patient.id)
              .eq('confirmation_code', appointmentData.confirmationCode)
              .single();
            appointment = data;
          }

          if (appointment && appointment.status !== 'cancelled') {
            const { data: cancelledAppointment } = await supabase
              .from(TABLES.APPOINTMENTS)
              .update({
                status: 'cancelled',
                notes: `${appointment.notes || ''}\n\nCancelled via web chat. Reason: ${appointmentData.reason || 'Not specified'}`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', appointment.id)
              .select()
              .single();

            if (cancelledAppointment) {
              appointmentResult = {
                success: true,
                message: `Your appointment has been successfully cancelled. If you'd like to reschedule, please let me know.`,
                appointmentId: appointment.id,
              };
            }
          }
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    } else if (intent === 'reschedule' && appointmentData?.phoneNumber && (appointmentData?.confirmationCode || appointmentData?.appointmentId) && appointmentData?.newDate && appointmentData?.newTime) {
      try {
        const { data: patient } = await supabase
          .from(TABLES.PATIENTS)
          .select('id')
          .eq('phone', appointmentData.phoneNumber)
          .single();

        if (patient) {
          let appointment;
          if (appointmentData.appointmentId) {
            const { data } = await supabase
              .from(TABLES.APPOINTMENTS)
              .select('*')
              .eq('id', appointmentData.appointmentId)
              .eq('patient_id', patient.id)
              .single();
            appointment = data;
          } else if (appointmentData.confirmationCode) {
            const { data } = await supabase
              .from(TABLES.APPOINTMENTS)
              .select('*')
              .eq('patient_id', patient.id)
              .eq('confirmation_code', appointmentData.confirmationCode)
              .single();
            appointment = data;
          }

          if (appointment && appointment.status !== 'cancelled' && appointment.status !== 'completed') {
            let time24Hour = appointmentData.newTime;
            const timeMatch = appointmentData.newTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (timeMatch) {
              let hours = parseInt(timeMatch[1]);
              const minutes = timeMatch[2];
              const period = timeMatch[3].toUpperCase();
              if (period === 'PM' && hours !== 12) hours += 12;
              else if (period === 'AM' && hours === 12) hours = 0;
              time24Hour = `${hours.toString().padStart(2, '0')}:${minutes}`;
            }

            const newAppointmentDate = `${appointmentData.newDate}T${time24Hour}:00`;
            const { data: updatedAppointment } = await supabase
              .from(TABLES.APPOINTMENTS)
              .update({
                appointment_date: newAppointmentDate,
                status: 'scheduled',
                notes: `${appointment.notes || ''}\n\nRescheduled via web chat: ${appointmentData.reason || 'Not specified'}`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', appointment.id)
              .select()
              .single();

            if (updatedAppointment) {
              appointmentResult = {
                success: true,
                message: `Your appointment has been successfully rescheduled to ${appointmentData.newDate} at ${appointmentData.newTime}. You'll receive a confirmation shortly.`,
                appointmentId: appointment.id,
                newDate: newAppointmentDate,
              };
            }
          }
        }
      } catch (error) {
        console.error('Error rescheduling appointment:', error);
      }
    }

    // Log inbound interaction (user message)
    if (sessionId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      try {
        await supabase.from(TABLES.INTERACTIONS).insert({
          session_id: sessionId,
          patient_id: appointmentResult?.patientId || null,
          channel: 'web_chat',
          direction: 'inbound',
          message_body: lastUserMessage.content,
          from_number: patientPhone || appointmentData?.phoneNumber || null,
          intent: intent !== 'none' ? intent : null,
          metadata: {
            appointment_data: appointmentData,
            source: 'web_chat',
          },
          created_at: new Date().toISOString(),
        });
        console.log('✅ Inbound interaction logged');
      } catch (error) {
        console.error('Error logging inbound interaction:', error);
      }
    }

    // Log outbound interaction (assistant response)
    if (sessionId) {
      try {
        await supabase.from(TABLES.INTERACTIONS).insert({
          session_id: sessionId,
          patient_id: appointmentResult?.patientId || null,
          channel: 'web_chat',
          direction: 'outbound',
          message_body: appointmentResult?.message || assistantMessage,
          to_number: patientPhone || appointmentData?.phoneNumber || null,
          intent: intent !== 'none' ? intent : null,
          metadata: {
            appointment_result: appointmentResult,
            intent: intent,
            source: 'web_chat',
          },
          created_at: new Date().toISOString(),
        });
        console.log('✅ Outbound interaction logged');
      } catch (error) {
        console.error('Error logging outbound interaction:', error);
      }
    }

    // If appointment was created, use the confirmation message instead of OpenAI's generic response
    const finalMessage = appointmentResult?.success 
      ? appointmentResult.message 
      : assistantMessage;

    return NextResponse.json({
      success: true,
      message: finalMessage,
      intent,
      appointmentResult,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Handle OpenAI rate limit errors specifically
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json({
        success: false,
        message: 'I\'m receiving too many requests right now. Please wait a moment and try again. ⏳',
        error: 'rate_limit_exceeded',
        retryAfter: error.headers?.['retry-after'] || 20
      }, { status: 429 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.',
      error: error.message
    }, { status: 500 });
  }
}
