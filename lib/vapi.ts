import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

export interface VapiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface VapiChatRequest {
  messages: VapiMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface VapiChatResponse {
  message: string;
  intent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

/**
 * Send a chat message to Vapi
 */
export async function sendVapiChat(
  messages: VapiMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<VapiChatResponse> {
  try {
    const response = await axios.post(
      `${VAPI_BASE_URL}/chat`,
      {
        messages,
        model: options?.model || 'gpt-3.5-turbo',
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      message: response.data.message || response.data.choices?.[0]?.message?.content,
      intent: response.data.intent,
      confidence: response.data.confidence,
      metadata: response.data.metadata,
    };
  } catch (error: any) {
    console.error('Vapi API error:', error.response?.data || error.message);
    throw new Error('Failed to get response from Vapi');
  }
}

/**
 * Analyze intent from user message
 */
export async function analyzeIntent(message: string): Promise<{
  intent: string;
  confidence: number;
  entities?: Record<string, any>;
}> {
  try {
    const response = await axios.post(
      `${VAPI_BASE_URL}/analyze`,
      {
        text: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      intent: response.data.intent || 'unknown',
      confidence: response.data.confidence || 0,
      entities: response.data.entities,
    };
  } catch (error: any) {
    console.error('Vapi intent analysis error:', error.response?.data || error.message);
    return {
      intent: 'unknown',
      confidence: 0,
    };
  }
}

/**
 * Create a system prompt for the assistant
 */
export function createSystemPrompt(context?: {
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
- Support both English and Spanish languages`;

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
