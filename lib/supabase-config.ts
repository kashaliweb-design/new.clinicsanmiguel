// Supabase Table Names Configuration
// Change these if you want to use different table names

export const SUPABASE_TABLES = {
  CLINICS: 'clinics',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  INTERACTIONS: 'interactions',
  FAQS: 'faqs',
  CANNED_RESPONSES: 'canned_responses',
  CALL_LOGS: 'call_logs',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Helper function to get table name
export const getTableName = (table: keyof typeof SUPABASE_TABLES): string => {
  return SUPABASE_TABLES[table];
};
