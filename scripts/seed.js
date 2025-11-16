/**
 * Database Seed Script
 * Run this to populate the database with test data
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('SanMiguel Connect AI - Database Seeding');
console.log('='.repeat(60));
console.log();

console.log('To seed your database with test data:');
console.log();
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy the contents of: supabase/seed.sql');
console.log('5. Paste and run the query');
console.log();

const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');

if (fs.existsSync(seedPath)) {
  console.log('✓ Seed file found at:', seedPath);
  console.log();
  console.log('Seed data includes:');
  console.log('  • 2 Clinics (Downtown & North)');
  console.log('  • 3 Test Patients');
  console.log('  • 3 Sample Appointments');
  console.log('  • 7 FAQs (English & Spanish)');
  console.log('  • 5 Canned Responses');
  console.log('  • Sample Interactions');
  console.log();
} else {
  console.log('✗ Seed file not found!');
}

console.log();
console.log('After seeding, start the dev server: npm run dev');
console.log();
