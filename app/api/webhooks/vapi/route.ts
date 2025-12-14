import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();
    console.log('Vapi webhook received:', JSON.stringify(body, null, 2));
    
    // Vapi sends different event structures
    const eventType = body.type || body.message?.type;
    const messageType = body.message?.type;
    
    console.log('Event type:', eventType, 'Message type:', messageType);

    // Handle different Vapi events
    if (eventType === 'end-of-call-report' || messageType === 'end-of-call-report') {
      await handleCallEnd(supabase, body);
    } else if (eventType === 'status-update' || messageType === 'status-update') {
      if (body.message?.status === 'started') {
        await handleCallStart(supabase, body);
      }
    } else if (eventType === 'conversation-update' || messageType === 'conversation-update') {
      await handleConversationUpdate(supabase, body);
    } else if (eventType === 'speech-update' || messageType === 'speech-update') {
      await handleSpeechUpdate(supabase, body);
    } else if (eventType === 'transcript' || messageType === 'transcript') {
      await handleTranscript(supabase, body.call, body.transcript || body.message);
    } else if (eventType === 'function-call' || messageType === 'function-call') {
      console.log('Function call received:', body);
    } else {
      // Log all unhandled events for debugging
      console.log('Unhandled Vapi event:', {
        eventType,
        messageType,
        fullBody: body
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vapi webhook processed successfully' 
    });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCallStart(supabase: any, data: any) {
  const { call, message } = data;
  const callData = call || message?.call;
  const callId = callData?.id;
  const phoneNumber = callData?.customer?.number || callData?.phoneNumber;

  console.log('Vapi call started:', { callId, phoneNumber });

  try {
    // Try to find or create patient if phone number exists
    let patientId = null;
    if (phoneNumber && phoneNumber !== 'unknown') {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
        console.log('Found existing patient:', patientId);
      } else {
        // Create placeholder patient record (will be updated at call end with real details)
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            first_name: 'Voice',
            last_name: 'Caller',
            phone: phoneNumber,
            preferred_language: 'en',
            consent_voice: true,
          })
          .select()
          .single();
        
        if (newPatient) {
          patientId = newPatient.id;
          console.log('Created placeholder patient (will update with details):', patientId);
        }
      }
    }

    await supabase.from('interactions').insert({
      session_id: callId,
      patient_id: patientId,
      channel: 'voice',
      direction: 'inbound',
      from_number: phoneNumber || 'Web Caller',
      to_number: 'clinic',
      message_body: 'Voice call started via Vapi',
      intent: 'voice_call',
      metadata: {
        call_id: callId,
        event: 'call-start',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging call start:', error);
  }
}

async function handleSpeechUpdate(data: any) {
  const { message } = data;
  const callId = message?.call?.id;
  const transcript = message?.transcript || message?.speech;

  if (!transcript) return;

  console.log('Speech update:', transcript);

  try {
    await supabase.from('interactions').insert({
      session_id: callId,
      channel: 'voice',
      direction: message?.role === 'user' ? 'inbound' : 'outbound',
      from_number: message?.role === 'user' ? 'Web Caller' : 'AI Assistant',
      to_number: message?.role === 'user' ? 'clinic' : 'Web Caller',
      message_body: transcript,
      intent: extractIntent(transcript),
      metadata: {
        call_id: callId,
        event: 'speech-update',
        role: message?.role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging speech:', error);
  }
}

async function handleConversationUpdate(data: any) {
  const { message } = data;
  const callId = message?.call?.id;
  const conversation = message?.conversation || [];

  console.log('Conversation update:', conversation.length, 'messages');

  // Log the last message in conversation
  if (conversation.length > 0) {
    const lastMessage = conversation[conversation.length - 1];
    
    try {
      await supabase.from('interactions').insert({
        session_id: callId,
        channel: 'voice',
        direction: lastMessage?.role === 'user' ? 'inbound' : 'outbound',
        from_number: lastMessage?.role === 'user' ? 'Web Caller' : 'AI Assistant',
        to_number: lastMessage?.role === 'user' ? 'clinic' : 'Web Caller',
        message_body: lastMessage?.content || lastMessage?.message,
        intent: extractIntent(lastMessage?.content || lastMessage?.message),
        metadata: {
          call_id: callId,
          event: 'conversation-update',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }
}

async function handleTranscript(call: any, transcript: any) {
  const { id, phoneNumber, customer } = call;
  const { text, role } = transcript;

  console.log('Vapi transcript:', { role, text });

  // Log each message in the conversation
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: role === 'user' ? 'inbound' : 'outbound',
      from_number: role === 'user' ? (customer?.number || phoneNumber || 'unknown') : 'clinic',
      to_number: role === 'user' ? 'clinic' : (customer?.number || phoneNumber || 'unknown'),
      message_body: text,
      intent: extractIntent(text),
      metadata: {
        call_id: id,
        event: 'transcript',
        role: role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging transcript:', error);
  }
}

async function handleMessage(call: any, message: any) {
  const { id, phoneNumber, customer } = call;
  const { role, content } = message;

  console.log('Vapi message:', { role, content });

  // Log the message
  try {
    await supabase.from('interactions').insert({
      session_id: id, // Use call ID as session ID
      channel: 'voice',
      direction: role === 'user' ? 'inbound' : 'outbound',
      from_number: role === 'user' ? (customer?.number || phoneNumber || 'unknown') : 'clinic',
      to_number: role === 'user' ? 'clinic' : (customer?.number || phoneNumber || 'unknown'),
      message_body: content,
      intent: extractIntent(content),
      metadata: {
        call_id: id,
        event: 'message',
        role: role,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging message:', error);
  }
}

async function handleCallEnd(data: any) {
  const { message, call } = data;
  const callData = call || message?.call || message;
  const callId = callData?.id;
  const phoneNumber = callData?.customer?.number || callData?.phoneNumber || callData?.phoneNumberId;
  const endedReason = message?.endedReason || callData?.endedReason;
  const duration = message?.duration || callData?.duration;
  const summary = message?.summary || callData?.summary;
  const transcript = message?.transcript || callData?.transcript || [];
  const analysis = message?.analysis || callData?.analysis;

  console.log('=== VAPI CALL ENDED ===');
  console.log('Call ID:', callId);
  console.log('Phone Number:', phoneNumber);
  console.log('Duration:', duration);
  console.log('Ended Reason:', endedReason);
  console.log('Summary:', summary);
  console.log('Transcript:', JSON.stringify(transcript, null, 2));
  console.log('Analysis:', JSON.stringify(analysis, null, 2));

  try {
    // Extract patient information from conversation
    const patientInfo = extractPatientInfo(transcript, summary, analysis);
    console.log('=== EXTRACTED PATIENT INFO ===');
    console.log(JSON.stringify(patientInfo, null, 2));

    // Try to find or create patient
    let patientId = null;
    if (phoneNumber && phoneNumber !== 'unknown') {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
        
        // Update patient with extracted information if available
        if (patientInfo.first_name || patientInfo.last_name || patientInfo.date_of_birth || patientInfo.email) {
          const updateData: any = {};
          if (patientInfo.first_name) updateData.first_name = patientInfo.first_name;
          if (patientInfo.last_name) updateData.last_name = patientInfo.last_name;
          if (patientInfo.date_of_birth) updateData.date_of_birth = patientInfo.date_of_birth;
          if (patientInfo.email) updateData.email = patientInfo.email;
          if (patientInfo.preferred_language) updateData.preferred_language = patientInfo.preferred_language;
          
          await supabase
            .from('patients')
            .update(updateData)
            .eq('id', patientId);
          
          console.log('Updated patient with extracted info:', updateData);
        }
      } else {
        // Create new patient with extracted information
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            first_name: patientInfo.first_name || 'Voice',
            last_name: patientInfo.last_name || 'Caller',
            phone: phoneNumber,
            email: patientInfo.email || null,
            date_of_birth: patientInfo.date_of_birth || null,
            preferred_language: patientInfo.preferred_language || 'en',
            consent_voice: true,
          })
          .select()
          .single();
        
        if (newPatient) {
          patientId = newPatient.id;
          console.log('Created new patient from call end with details:', patientInfo);
        }
      }
    }

    // Extract intent from conversation
    const fullText = Array.isArray(transcript) 
      ? transcript.map((t: any) => t.text || t.content || '').join(' ')
      : (summary || '');
    const intent = extractIntent(fullText);

    await supabase.from('interactions').insert({
      session_id: callId,
      patient_id: patientId,
      channel: 'voice',
      direction: 'inbound',
      from_number: phoneNumber || 'Web Caller',
      to_number: 'clinic',
      message_body: summary || `Voice call ended: ${endedReason || 'completed'}. Duration: ${duration}s`,
      intent: intent,
      metadata: {
        call_id: callId,
        event: 'end-of-call-report',
        ended_reason: endedReason,
        duration_seconds: duration,
        summary: summary,
        timestamp: new Date().toISOString(),
        full_data: data,
      },
    });

    // Create appointment if intent is appointment booking
    console.log('=== APPOINTMENT CHECK ===');
    console.log('Intent:', intent);
    console.log('Patient ID:', patientId);
    console.log('Should create appointment:', intent === 'appointment_booking' && patientId);
    
    if (intent === 'appointment_booking' && patientId) {
      console.log('=== CREATING APPOINTMENT ===');
      
      // Extract appointment details from conversation
      const appointmentInfo = extractAppointmentInfo(fullText, summary, analysis);
      console.log('Extracted appointment info:', appointmentInfo);

      // Get first available clinic
      const { data: clinic } = await supabase
        .from('clinics')
        .select('id')
        .limit(1)
        .single();

      if (clinic) {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            clinic_id: clinic.id,
            appointment_date: appointmentInfo.date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
            appointment_time: appointmentInfo.time || '10:00:00',
            reason: appointmentInfo.reason || 'General Consultation',
            status: 'scheduled',
            notes: `Appointment scheduled via VAPI call. Call ID: ${callId}`,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Error creating appointment:', appointmentError);
        } else {
          console.log('=== APPOINTMENT CREATED ===');
          console.log('Appointment ID:', appointment?.id);
          console.log('Date:', appointmentInfo.date);
          console.log('Time:', appointmentInfo.time);
        }
      } else {
        console.log('No clinic found, skipping appointment creation');
      }
    }
  } catch (error) {
    console.error('Error logging call end:', error);
  }
}

// Extract intent from message content
function extractIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('appointment') || lowerText.includes('schedule') || lowerText.includes('book')) {
    return 'appointment_booking';
  }
  if (lowerText.includes('cancel') || lowerText.includes('reschedule')) {
    return 'appointment_modification';
  }
  if (lowerText.includes('hours') || lowerText.includes('open') || lowerText.includes('time')) {
    return 'clinic_hours';
  }
  if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where')) {
    return 'clinic_location';
  }
  if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('treatment')) {
    return 'services_inquiry';
  }
  if (lowerText.includes('insurance') || lowerText.includes('payment') || lowerText.includes('cost')) {
    return 'billing_inquiry';
  }
  
  return 'general_inquiry';
}

// Extract appointment information from conversation
function extractAppointmentInfo(text: string, summary: string, analysis: any): any {
  const appointmentInfo: any = {
    date: null,
    time: null,
    reason: null,
  };

  try {
    const lowerText = text.toLowerCase();

    // Extract date patterns
    // Look for dates like "tomorrow", "next Monday", "December 25", etc.
    const datePatterns = [
      /(?:on|for)\s+(tomorrow|today)/i,
      /(?:on|for)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:on|for)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        if (dateStr === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          appointmentInfo.date = tomorrow.toISOString().split('T')[0];
        } else if (dateStr === 'today') {
          appointmentInfo.date = new Date().toISOString().split('T')[0];
        } else {
          // Try to parse the date
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            appointmentInfo.date = parsed.toISOString().split('T')[0];
          }
        }
        break;
      }
    }

    // Extract time patterns
    // Look for times like "10 AM", "2:30 PM", "14:00", etc.
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})/,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const meridiem = match[3]?.toLowerCase();

        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;

        appointmentInfo.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        break;
      }
    }

    // Extract reason/purpose
    if (lowerText.includes('checkup') || lowerText.includes('check up')) {
      appointmentInfo.reason = 'General Checkup';
    } else if (lowerText.includes('consultation')) {
      appointmentInfo.reason = 'Consultation';
    } else if (lowerText.includes('follow up') || lowerText.includes('followup')) {
      appointmentInfo.reason = 'Follow-up Visit';
    } else if (lowerText.includes('emergency')) {
      appointmentInfo.reason = 'Emergency';
    } else if (lowerText.includes('dental')) {
      appointmentInfo.reason = 'Dental Appointment';
    } else {
      appointmentInfo.reason = 'General Consultation';
    }

  } catch (error) {
    console.error('Error extracting appointment info:', error);
  }

  return appointmentInfo;
}

// Extract patient information from conversation transcript
function extractPatientInfo(transcript: any, summary: string, analysis: any): any {
  const patientInfo: any = {
    first_name: null,
    last_name: null,
    date_of_birth: null,
    email: null,
    preferred_language: 'en',
  };

  try {
    // Combine all text from transcript
    let fullText = '';
    if (Array.isArray(transcript)) {
      fullText = transcript
        .map((t: any) => t.text || t.content || t.message || '')
        .join(' ');
    } else if (typeof transcript === 'string') {
      fullText = transcript;
    }

    // Add summary if available
    if (summary) {
      fullText += ' ' + summary;
    }

    // Add analysis if available
    if (analysis && typeof analysis === 'object') {
      fullText += ' ' + JSON.stringify(analysis);
    }

    const lowerText = fullText.toLowerCase();

    // Extract name patterns
    // Look for "my name is [Name]" or "I'm [Name]" or "this is [Name]"
    const namePatterns = [
      /(?:my name is|i'm|this is|i am)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
      /(?:name|called)\s*:?\s*([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        patientInfo.first_name = match[1];
        patientInfo.last_name = match[2];
        break;
      }
    }

    // Extract date of birth patterns
    // Look for dates in various formats
    const dobPatterns = [
      /(?:born|birth|dob|date of birth)\s*:?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
      /(?:born|birth|dob)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];

    for (const pattern of dobPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        // Try to parse and format the date
        const dateStr = match[1];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          patientInfo.date_of_birth = date.toISOString().split('T')[0];
          break;
        }
      }
    }

    // Extract email patterns
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = fullText.match(emailPattern);
    if (emailMatch) {
      patientInfo.email = emailMatch[1];
    }

    // Detect language preference
    if (lowerText.includes('spanish') || lowerText.includes('español') || lowerText.includes('espanol')) {
      patientInfo.preferred_language = 'es';
    }

    console.log('Extracted patient info from transcript:', patientInfo);
  } catch (error) {
    console.error('Error extracting patient info:', error);
  }

  return patientInfo;
}
