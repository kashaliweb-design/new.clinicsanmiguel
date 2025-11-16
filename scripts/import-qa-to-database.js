const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function extractKeywords(question) {
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'do', 'you', 'your'];
  const words = question.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));
  return [...new Set(words)];
}

async function importQAData() {
  console.log('Starting Q&A import...');
  
  const datasetPath = path.join(__dirname, '..', 'data', 'qa-dataset.json');
  
  if (!fs.existsSync(datasetPath)) {
    console.error('Dataset not found. Run generate-qa-dataset.js first.');
    process.exit(1);
  }
  
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`Loaded ${dataset.length} questions`);
  
  const batchSize = 1000;
  let imported = 0;
  
  for (let i = 0; i < dataset.length; i += batchSize) {
    const batch = dataset.slice(i, i + batchSize);
    
    const faqBatch = batch.map(item => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      language: item.language,
      keywords: extractKeywords(item.question),
      active: true
    }));
    
    const { error } = await supabase.from('faqs').insert(faqBatch);
    
    if (error) {
      console.error(`Error in batch ${i / batchSize + 1}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`Imported: ${imported} questions`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\nImport complete! Total: ${imported} questions`);
}

importQAData().catch(console.error);
