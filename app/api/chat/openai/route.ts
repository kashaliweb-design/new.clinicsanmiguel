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
        const bookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/book-appointment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: appointmentData.patientName,
            phoneNumber: appointmentData.phoneNumber,
            email: appointmentData.email,
            dateOfBirth: appointmentData.dateOfBirth,
            appointmentType: appointmentData.appointmentType || 'consultation',
            appointmentDate: appointmentData.appointmentDate,
            appointmentTime: appointmentData.appointmentTime,
            isNewPatient: appointmentData.isNewPatient !== false,
            notes: appointmentData.notes,
          }),
        });
        appointmentResult = await bookResponse.json();
        
        if (sessionId) {
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
        const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/appointments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            confirmationCode: appointmentData.confirmationCode,
            appointmentId: appointmentData.appointmentId,
          }),
        });
        appointmentResult = await confirmResponse.json();
        
        if (sessionId && appointmentResult.appointment) {
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
        const cancelResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/cancel-appointment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: appointmentData.phoneNumber,
            confirmationCode: appointmentData.confirmationCode,
            appointmentId: appointmentData.appointmentId,
            reason: appointmentData.reason || 'Cancelled via chat',
          }),
        });
        appointmentResult = await cancelResponse.json();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    } else if (intent === 'reschedule' && appointmentData?.phoneNumber && (appointmentData?.confirmationCode || appointmentData?.appointmentId) && appointmentData?.newDate && appointmentData?.newTime) {
      try {
        const rescheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/reschedule-appointment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: appointmentData.phoneNumber,
            confirmationCode: appointmentData.confirmationCode,
            appointmentId: appointmentData.appointmentId,
            newDate: appointmentData.newDate,
            newTime: appointmentData.newTime,
            reason: appointmentData.reason,
          }),
        });
        appointmentResult = await rescheduleResponse.json();
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
