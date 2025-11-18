const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function clearDummyData() {
  console.log('🗑️  Clearing dummy data from database...\n');

  try {
    // Clear interactions (sample conversations)
    console.log('Clearing interactions...');
    const { error: interactionsError } = await supabase
      .from('interactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (interactionsError) {
      console.error('❌ Error clearing interactions:', interactionsError);
    } else {
      console.log('✅ Interactions cleared');
    }

    // Clear appointments (sample appointments)
    console.log('Clearing appointments...');
    const { error: appointmentsError } = await supabase
      .from('appointments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (appointmentsError) {
      console.error('❌ Error clearing appointments:', appointmentsError);
    } else {
      console.log('✅ Appointments cleared');
    }

    // Clear patients (sample patients)
    console.log('Clearing patients...');
    const { error: patientsError } = await supabase
      .from('patients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (patientsError) {
      console.error('❌ Error clearing patients:', patientsError);
    } else {
      console.log('✅ Patients cleared');
    }

    // Keep clinics (real clinic data)
    console.log('⚠️  Keeping clinics data (real clinic information)');

    // Keep FAQs (real FAQ data)
    console.log('⚠️  Keeping FAQs data (real FAQ information)');

    // Keep canned responses (real response templates)
    console.log('⚠️  Keeping canned responses (real templates)');

    console.log('\n✅ Dummy data cleared successfully!');
    console.log('\nNote: Clinics, FAQs, and canned responses were kept as they contain real information.');
    console.log('Your dashboard will now show 0 until real patient interactions occur.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearDummyData();
