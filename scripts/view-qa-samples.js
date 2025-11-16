/**
 * View random samples from the Q&A dataset
 * Useful for quality checking and reviewing the generated questions
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', 'data', 'qa-dataset.json');

if (!fs.existsSync(datasetPath)) {
  console.error('Dataset not found. Run generate-qa-dataset.js first.');
  process.exit(1);
}

console.log('Loading dataset...');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// Get command line arguments
const args = process.argv.slice(2);
const category = args[0];
const language = args[1];
const count = parseInt(args[2]) || 10;

console.log(`\nTotal questions in dataset: ${dataset.length.toLocaleString()}\n`);

// Filter dataset
let filtered = dataset;

if (category) {
  filtered = filtered.filter(q => q.category === category);
  console.log(`Filtered by category '${category}': ${filtered.length.toLocaleString()} questions`);
}

if (language) {
  filtered = filtered.filter(q => q.language === language);
  console.log(`Filtered by language '${language}': ${filtered.length.toLocaleString()} questions`);
}

// Get random samples
const samples = [];
const usedIndices = new Set();

while (samples.length < Math.min(count, filtered.length)) {
  const randomIndex = Math.floor(Math.random() * filtered.length);
  if (!usedIndices.has(randomIndex)) {
    usedIndices.add(randomIndex);
    samples.push(filtered[randomIndex]);
  }
}

// Display samples
console.log(`\n${'='.repeat(80)}`);
console.log(`RANDOM SAMPLES (${samples.length} questions)`);
console.log('='.repeat(80));

samples.forEach((q, index) => {
  console.log(`\n[${index + 1}] ID: ${q.id} | Category: ${q.category} | Language: ${q.language}`);
  console.log(`Q: ${q.question}`);
  console.log(`A: ${q.answer.substring(0, 150)}${q.answer.length > 150 ? '...' : ''}`);
  console.log('-'.repeat(80));
});

// Show category breakdown
console.log('\n' + '='.repeat(80));
console.log('CATEGORY BREAKDOWN');
console.log('='.repeat(80));

const categoryCount = {};
dataset.forEach(q => {
  categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
});

Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const percentage = ((count / dataset.length) * 100).toFixed(1);
    console.log(`${cat.padEnd(20)} ${count.toLocaleString().padStart(10)} (${percentage}%)`);
  });

// Show language breakdown
console.log('\n' + '='.repeat(80));
console.log('LANGUAGE BREAKDOWN');
console.log('='.repeat(80));

const languageCount = {};
dataset.forEach(q => {
  languageCount[q.language] = (languageCount[q.language] || 0) + 1;
});

Object.entries(languageCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([lang, count]) => {
    const percentage = ((count / dataset.length) * 100).toFixed(1);
    console.log(`${lang.padEnd(20)} ${count.toLocaleString().padStart(10)} (${percentage}%)`);
  });

console.log('\n' + '='.repeat(80));
console.log('\nUsage:');
console.log('  node scripts/view-qa-samples.js [category] [language] [count]');
console.log('\nExamples:');
console.log('  node scripts/view-qa-samples.js pricing en 5');
console.log('  node scripts/view-qa-samples.js locations es 10');
console.log('  node scripts/view-qa-samples.js appointments');
console.log('\nCategories: pricing, locations, services, appointments, hours, language, mission');
console.log('Languages: en, es\n');
