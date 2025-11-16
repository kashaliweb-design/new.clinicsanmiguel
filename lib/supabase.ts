import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for API routes)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

// Database types
export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  services: string[] | null;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  preferred_language: string;
  consent_sms: boolean;
  consent_voice: boolean;
  consent_recorded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  clinic_id: string;
  appointment_date: string;
  duration_minutes: number;
  service_type: string | null;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  confirmed_at: string | null;
  confirmation_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  session_id: string;
  patient_id: string | null;
  channel: 'web_chat' | 'sms' | 'voice';
  direction: 'inbound' | 'outbound';
  from_number: string | null;
  to_number: string | null;
  message_body: string | null;
  intent: string | null;
  sentiment: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  language: string;
  keywords: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  call_id: string;
  patient_id: string | null;
  from_number: string | null;
  to_number: string | null;
  direction: 'inbound' | 'outbound';
  status: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  ended_at: string | null;
}
