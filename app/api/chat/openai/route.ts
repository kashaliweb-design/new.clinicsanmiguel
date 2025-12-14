import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServiceSupabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AppointmentIntent {
  action: 'book' | 'confirm' | 'cancel' | 'reschedule' | 'none';
  data: any;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationState, appointmentData, patientPhone, sessionId } = await request.json();

    const systemPrompt = `You are Riley, a friendly scheduling assistant for Clinica San Miguel.

RESPONSE STYLE - CRITICAL:
• Keep responses SHORT (2-3 sentences max)
• Use emojis sparingly for visual appeal (✅ 📅 🏥 💰)
• Break long info into bullet points
• Ask ONE question at a time
• Be conversational and warm, not robotic

KEY INFO:
💰 Consultation: $19 | Immigration Exam: $220
🕐 Hours: Mon-Fri 8am-5pm, Sat 9am-12pm
🏥 Services: Primary Care, Specialist, Urgent Care, Immigration Exams, Diagnostics, Wellness

LOCATIONS (by ZIP):
Dallas: 75203, 75220, 75218 | Arlington: 76010
Houston: 77545, 77015, 77067, 77084, 77036, 77386, 77502
San Antonio: 78221, 78217, 78216 | Fort Worth: 76114, 76115
Farmers Branch: 75234

Current state: ${conversationState || 'initial'}
${appointmentData ? `Data: ${JSON.stringify(appointmentData)}` : ''}

BOOKING FLOW: Ask for info one step at a time (name → phone → DOB → email → location → service → date/time).

When user wants to:
- BOOK: Collect name, phone, DOB (optional), email (optional), service type, date, time
- CONFIRM: Ask for confirmation code or phone number
- CANCEL: Ask for confirmation code or phone number and reason
- RESCHEDULE: Ask for confirmation code or phone number, new date, and new time

Remember: SHORT, FRIENDLY, ONE QUESTION AT A TIME!`;

    const intentDetectionPrompt = `Based on the conversation, determine if the user wants to:
- book (schedule a new appointment)
- confirm (confirm an existing appointment)
- cancel (cancel an appointment)
- reschedule (change appointment date/time)
- none (just asking questions or chatting)

Conversation:
${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Respond with ONLY ONE WORD: book, confirm, cancel, reschedule, or none`;

    const intentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: intentDetectionPrompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const intent = intentCompletion.choices[0].message.content?.toLowerCase().trim() || 'none';

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
      max_tokens: 200,
    });

    const assistantMessage = completion.choices[0].message.content;

    const supabase = getServiceSupabase();
    let appointmentResult = null;

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
          .from('patients')
          .select('id')
          .eq('phone', bookingData.phoneNumber)
          .single();

        if (existingPatient) {
          patientId = existingPatient.id;
          const updateData: any = {};
          if (bookingData.email) updateData.email = bookingData.email;
          if (bookingData.dateOfBirth) updateData.date_of_birth = bookingData.dateOfBirth;
          if (Object.keys(updateData).length > 0) {
            await supabase.from('patients').update(updateData).eq('id', patientId);
          }
        } else {
          const { data: newPatient } = await supabase
            .from('patients')
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

        const { data: clinic } = await supabase
          .from('clinics')
          .select('id')
          .eq('active', true)
          .limit(1)
          .single();

        if (clinic && patientId) {
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
          const confirmationCode = `CHAT-${Date.now().toString().substring(5)}`;

          const { data: appointment } = await supabase
            .from('appointments')
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

          if (appointment) {
            appointmentResult = {
              success: true,
              message: `Perfect! Your appointment has been confirmed. Your confirmation code is ${confirmationCode}. You're scheduled for ${bookingData.appointmentType || 'consultation'} on ${bookingData.appointmentDate} at ${bookingData.appointmentTime}.`,
              appointmentId: appointment.id,
              confirmationCode: confirmationCode,
              patientId: patientId,
            };
          }
        }
        
        if (sessionId && appointmentResult) {
          await supabase.from('interactions').insert({
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
        let query = supabase.from('appointments').select('*, patients(*), clinics(*)');
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
              .from('appointments')
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
          await supabase.from('interactions').insert({
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
          .from('patients')
          .select('id')
          .eq('phone', appointmentData.phoneNumber)
          .single();

        if (patient) {
          let appointment;
          if (appointmentData.appointmentId) {
            const { data } = await supabase
              .from('appointments')
              .select('*')
              .eq('id', appointmentData.appointmentId)
              .eq('patient_id', patient.id)
              .single();
            appointment = data;
          } else if (appointmentData.confirmationCode) {
            const { data } = await supabase
              .from('appointments')
              .select('*')
              .eq('patient_id', patient.id)
              .eq('confirmation_code', appointmentData.confirmationCode)
              .single();
            appointment = data;
          }

          if (appointment && appointment.status !== 'cancelled') {
            const { data: cancelledAppointment } = await supabase
              .from('appointments')
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
          .from('patients')
          .select('id')
          .eq('phone', appointmentData.phoneNumber)
          .single();

        if (patient) {
          let appointment;
          if (appointmentData.appointmentId) {
            const { data } = await supabase
              .from('appointments')
              .select('*')
              .eq('id', appointmentData.appointmentId)
              .eq('patient_id', patient.id)
              .single();
            appointment = data;
          } else if (appointmentData.confirmationCode) {
            const { data } = await supabase
              .from('appointments')
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
              .from('appointments')
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

    return NextResponse.json({
      success: true,
      message: appointmentResult?.message || assistantMessage,
      intent,
      appointmentResult,
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'I apologize, but I\'m having trouble processing your request. Please try again or call us at (415) 555-1000.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
