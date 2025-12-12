import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationState, appointmentData } = await request.json();

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

Remember: SHORT, FRIENDLY, ONE QUESTION AT A TIME!`;

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

    return NextResponse.json({
      success: true,
      message: assistantMessage,
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
