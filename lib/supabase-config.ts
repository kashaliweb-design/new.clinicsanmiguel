// Supabase Table Names Configuration
// Change these if you want to use different table names

export const SUPABASE_TABLES = {
  CLINICS: 'sanmiguel_clinics',
  PATIENTS: 'sanmiguel_patients',
  APPOINTMENTS: 'sanmiguel_appointments',
  INTERACTIONS: 'sanmiguel_interactions',
  FAQS: 'sanmiguel_faqs',
  CANNED_RESPONSES: 'sanmiguel_canned_responses',
  CALL_LOGS: 'sanmiguel_call_logs',
  AUDIT_LOGS: 'sanmiguel_audit_logs',
} as const;

// Helper function to get table name
export const getTableName = (table: keyof typeof SUPABASE_TABLES): string => {
  return SUPABASE_TABLES[table];
};
