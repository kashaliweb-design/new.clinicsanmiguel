import axios from 'axios';

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER;
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';

export interface SendSMSParams {
  to: string;
  text: string;
  from?: string;
}

export interface TelnyxWebhookPayload {
  data: {
    event_type: string;
    id: string;
    occurred_at: string;
    payload: {
      id: string;
      from: {
        phone_number: string;
      };
      to: Array<{
        phone_number: string;
      }>;
      text?: string;
      media?: Array<{
        url: string;
      }>;
    };
  };
}

/**
 * Send an SMS via Telnyx
 */
export async function sendSMS({ to, text, from }: SendSMSParams): Promise<any> {
  if (!TELNYX_API_KEY) {
    throw new Error('TELNYX_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `${TELNYX_BASE_URL}/messages`,
      {
        from: from || TELNYX_PHONE_NUMBER,
        to,
        text,
      },
      {
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Telnyx SMS error:', error.response?.data || error.message);
    throw new Error('Failed to send SMS via Telnyx');
  }
}

/**
 * Validate Telnyx webhook signature
 */
export function validateTelnyxWebhook(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  // Implement signature validation if Telnyx provides webhook secrets
  // For now, return true (implement proper validation in production)
  return true;
}

/**
 * Parse Telnyx webhook payload
 */
export function parseTelnyxWebhook(body: any): {
  eventType: string;
  from: string;
  to: string;
  text?: string;
  messageId: string;
} | null {
  try {
    const { data } = body;
    const eventType = data.event_type;
    const payload = data.payload;

    return {
      eventType,
      from: payload.from.phone_number,
      to: payload.to[0].phone_number,
      text: payload.text,
      messageId: payload.id,
    };
  } catch (error) {
    console.error('Failed to parse Telnyx webhook:', error);
    return null;
  }
}

/**
 * Initiate an outbound call via Telnyx
 */
export async function initiateCall(params: {
  to: string;
  from?: string;
  webhookUrl: string;
}): Promise<any> {
  if (!TELNYX_API_KEY) {
    throw new Error('TELNYX_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `${TELNYX_BASE_URL}/calls`,
      {
        connection_id: process.env.TELNYX_CONNECTION_ID,
        to: params.to,
        from: params.from || TELNYX_PHONE_NUMBER,
        webhook_url: params.webhookUrl,
      },
      {
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Telnyx call error:', error.response?.data || error.message);
    throw new Error('Failed to initiate call via Telnyx');
  }
}
