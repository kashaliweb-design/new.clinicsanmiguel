/**
 * Database Migration Script
 * Run this to set up the database schema in Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('SanMiguel Connect AI - Database Migration');
console.log('='.repeat(60));
console.log();

console.log('To migrate your database:');
console.log();
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy the contents of: supabase/schema.sql');
console.log('5. Paste and run the query');
console.log();

const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');

if (fs.existsSync(schemaPath)) {
  console.log('✓ Schema file found at:', schemaPath);
  console.log();
  console.log('Schema preview:');
  console.log('-'.repeat(60));
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const lines = schema.split('\n').slice(0, 20);
  console.log(lines.join('\n'));
  console.log('...');
  console.log('-'.repeat(60));
} else {
  console.log('✗ Schema file not found!');
}

console.log();
console.log('After migration, run: npm run db:seed');
console.log();
