const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Database Connection and Data...\n');
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Not Set');
console.log('Service Role Key:', serviceRoleKey ? '✅ Set' : '❌ Not Set');
console.log('');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!');
  console.log('\nPlease ensure .env.local has:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabase() {
  try {
    // Check patients
    console.log('📊 Checking PATIENTS table...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5);
    
    if (patientsError) {
      console.error('❌ Patients Error:', patientsError.message);
    } else {
      console.log(`✅ Found ${patients?.length || 0} patients (showing first 5)`);
      if (patients && patients.length > 0) {
        console.log('   Sample:', patients[0].first_name, patients[0].last_name);
      }
    }
    console.log('');

    // Check appointments
    console.log('📅 Checking APPOINTMENTS table...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*, patients(*), clinics(*)')
      .limit(5);
    
    if (appointmentsError) {
      console.error('❌ Appointments Error:', appointmentsError.message);
    } else {
      console.log(`✅ Found ${appointments?.length || 0} appointments (showing first 5)`);
      if (appointments && appointments.length > 0) {
        console.log('   Sample:', appointments[0].status, '-', appointments[0].appointment_date);
      }
    }
    console.log('');

    // Check interactions
    console.log('💬 Checking INTERACTIONS table...');
    const { data: interactions, error: interactionsError } = await supabase
      .from('interactions')
      .select('*, patient:patients(first_name, last_name)')
      .limit(5);
    
    if (interactionsError) {
      console.error('❌ Interactions Error:', interactionsError.message);
    } else {
      console.log(`✅ Found ${interactions?.length || 0} interactions (showing first 5)`);
      if (interactions && interactions.length > 0) {
        console.log('   Sample:', interactions[0].channel, '-', interactions[0].direction);
      }
    }
    console.log('');

    // Check clinics
    console.log('🏥 Checking CLINICS table...');
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      .limit(5);
    
    if (clinicsError) {
      console.error('❌ Clinics Error:', clinicsError.message);
    } else {
      console.log(`✅ Found ${clinics?.length || 0} clinics`);
      if (clinics && clinics.length > 0) {
        console.log('   Sample:', clinics[0].name);
      }
    }
    console.log('');

    // Summary
    console.log('📋 SUMMARY:');
    console.log('─────────────────────────────────────');
    const totalPatients = patients?.length || 0;
    const totalAppointments = appointments?.length || 0;
    const totalInteractions = interactions?.length || 0;
    const totalClinics = clinics?.length || 0;

    if (totalPatients === 0 && totalAppointments === 0 && totalInteractions === 0) {
      console.log('⚠️  DATABASE IS EMPTY - No data found in any table');
      console.log('\nPossible reasons:');
      console.log('1. Fresh database that needs seeding');
      console.log('2. Wrong database URL (check if you migrated to new database)');
      console.log('3. RLS policies blocking access (unlikely with service role)');
    } else {
      console.log(`✅ Database has data:`);
      console.log(`   - ${totalPatients} patients`);
      console.log(`   - ${totalAppointments} appointments`);
      console.log(`   - ${totalInteractions} interactions`);
      console.log(`   - ${totalClinics} clinics`);
    }

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
  }
}

checkDatabase();
