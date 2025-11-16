import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIChatResponse {
  message: string;
  intent?: string;
  confidence?: number;
}

/**
 * Send a chat message to OpenAI
 */
export async function sendOpenAIChat(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<OpenAIChatResponse> {
  // Check if API key is configured
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured in environment variables');
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options?.model || 'gpt-3.5-turbo',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;

    return {
      message: aiMessage,
      intent: extractIntent(aiMessage),
      confidence: 0.9,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local');
    }
    
    throw new Error('Failed to get response from OpenAI: ' + (error.response?.data?.error?.message || error.message));
  }
}

/**
 * Extract intent from message (basic implementation)
 */
function extractIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
    return 'appointment_inquiry';
  }
  if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
    return 'hours_inquiry';
  }
  if (lowerMessage.includes('location') || lowerMessage.includes('address')) {
    return 'location_inquiry';
  }
  if (lowerMessage.includes('service')) {
    return 'services_inquiry';
  }
  
  return 'general_inquiry';
}

/**
 * Create a system prompt for the healthcare assistant
 */
export function createOpenAISystemPrompt(context?: {
  clinicInfo?: any;
  patientInfo?: any;
  appointmentInfo?: any;
}): string {
  let prompt = `You are a helpful medical assistant for SanMiguel Connect AI, a healthcare clinic system. 
Your role is to:
- Answer questions about clinic hours, services, and locations
- Help patients with appointment information
- Provide general healthcare guidance (non-diagnostic)
- Be empathetic, professional, and HIPAA-compliant

Important guidelines:
- Never provide medical diagnoses or treatment advice
- Always verify patient identity before sharing personal information
- Escalate complex medical questions to human staff
- Be concise and clear in your responses
- Support both English and Spanish languages
- Keep responses under 150 words`;

  if (context?.clinicInfo) {
    prompt += `\n\nClinic Information:\n${JSON.stringify(context.clinicInfo, null, 2)}`;
  }

  if (context?.patientInfo) {
    prompt += `\n\nPatient Context (verified):\nName: ${context.patientInfo.first_name} ${context.patientInfo.last_name}`;
  }

  if (context?.appointmentInfo) {
    prompt += `\n\nUpcoming Appointments:\n${JSON.stringify(context.appointmentInfo, null, 2)}`;
  }

  return prompt;
}
