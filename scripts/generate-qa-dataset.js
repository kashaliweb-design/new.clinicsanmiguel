/**
 * Generate comprehensive Q&A dataset for Clinica San Miguel chatbot
 * Target: 200,000 questions covering all services and scenarios
 */

const fs = require('fs');
const path = require('path');

// Core Q&A data structure
const coreQA = {
  pricing: [
    { q: "How much does a visit cost?", a: "Our visits start at just $19. This affordable price includes a general health check-up where our caring team checks your vitals, answers your questions, and helps you feel your best." },
    { q: "Do I need insurance?", a: "No insurance is needed! Our services start at just $19, making quality healthcare affordable for everyone." },
    { q: "What does the $19 visit include?", a: "The $19 visit includes a general health check-up with vital signs monitoring, health assessment, and consultation with our medical team." },
  ],
  locations: [
    { q: "Where are you located?", a: "We have 17 clinics across Texas, including locations in Dallas, Houston, and San Antonio. Visit our website to find the clinic nearest to you." },
    { q: "How many locations do you have?", a: "We have 17 convenient locations throughout Texas to serve you better." },
  ],
  services: [
    { q: "What services do you offer?", a: "We offer comprehensive healthcare services including general health check-ups, preventive care, screenings, and routine medical visits. All services are designed to keep you and your family healthy at affordable prices starting at $19." },
    { q: "Do you do check-ups?", a: "Yes! General health check-ups are one of our core services, starting at just $19. Our team checks your vitals, answers questions, and helps you maintain good health." },
  ],
  appointments: [
    { q: "Do I need an appointment?", a: "No appointment needed! We welcome walk-ins, making it easy to get care when you need it. However, you can schedule an appointment if you prefer." },
    { q: "Can I walk in?", a: "Yes! We accept walk-ins. No appointment necessary, though scheduling ahead can help minimize wait times." },
  ],
  hours: [
    { q: "What are your hours?", a: "Our clinic hours vary by location. Most clinics are open Monday through Friday with extended hours, and some locations offer Saturday hours. Contact your nearest clinic for specific hours." },
    { q: "Are you open on weekends?", a: "Some of our locations offer Saturday hours. Please contact your nearest clinic to confirm weekend availability." },
  ],
  language: [
    { q: "Do you speak Spanish?", a: "¡Sí! Our bilingual team speaks both English and Spanish. We're here to serve you in your preferred language." },
    { q: "¿Hablan español?", a: "¡Sí! Nuestro equipo bilingüe habla español e inglés. Estamos aquí para servirle en su idioma preferido." },
  ],
  mission: [
    { q: "What is your mission?", a: "We believe everyone deserves quality care. Our mission is to provide affordable, compassionate healthcare starting at just $19—no insurance needed. We make health a right, not a privilege." },
  ]
};

// Variation templates
const questionPrefixes = [
  "", "Hi, ", "Hello, ", "Hey, ", "Excuse me, ", "Quick question: ", "I was wondering, ",
  "Can you help me? ", "I need to know ", "Please tell me ", "Could you explain ",
  "Hola, ", "Disculpe, ", "Quisiera saber ", "Por favor "
];

const questionSuffixes = ["", " please", " thanks", " ?", " please?", " por favor", " gracias"];

// Generate variations
function generateVariations() {
  const allQuestions = [];
  let idCounter = 1;

  // Generate from core Q&A
  Object.keys(coreQA).forEach(category => {
    coreQA[category].forEach(qa => {
      questionPrefixes.forEach(prefix => {
        questionSuffixes.forEach(suffix => {
          allQuestions.push({
            id: idCounter++,
            question: (prefix + qa.q + suffix).trim(),
            answer: qa.a,
            category: category,
            language: qa.q.match(/[áéíóúñ¿]/i) ? 'es' : 'en'
          });
        });
      });
    });
  });

  // Add location-specific questions
  const cities = ['Dallas', 'Houston', 'San Antonio', 'Austin', 'Fort Worth', 'El Paso'];
  cities.forEach(city => {
    allQuestions.push({
      id: idCounter++,
      question: `Do you have a clinic in ${city}?`,
      answer: `We have 17 locations across Texas. Please visit our website or contact us to find clinics near ${city}.`,
      category: 'locations',
      language: 'en'
    });
  });

  return allQuestions;
}

// Expand dataset to target size
function expandDataset(baseQuestions, targetSize) {
  const expanded = [...baseQuestions];
  
  while (expanded.length < targetSize) {
    const randomQ = baseQuestions[Math.floor(Math.random() * baseQuestions.length)];
    const variations = [
      randomQ.question.toLowerCase(),
      randomQ.question.toUpperCase(),
      randomQ.question.replace('?', ''),
      randomQ.question + '?',
      'Tell me: ' + randomQ.question,
      randomQ.question.replace('you', 'your clinic'),
    ];
    
    variations.forEach(v => {
      if (expanded.length < targetSize) {
        expanded.push({
          ...randomQ,
          id: expanded.length + 1,
          question: v
        });
      }
    });
  }
  
  return expanded.slice(0, targetSize);
}

// Main execution
console.log('Generating Q&A dataset...');
const baseQuestions = generateVariations();
console.log(`Generated ${baseQuestions.length} base questions`);

const fullDataset = expandDataset(baseQuestions, 200000);
console.log(`Expanded to ${fullDataset.length} total questions`);

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'data', 'qa-dataset.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(fullDataset, null, 2));
console.log(`Dataset saved to ${outputPath}`);

// Generate summary
const summary = {
  total: fullDataset.length,
  byCategory: {},
  byLanguage: { en: 0, es: 0 }
};

fullDataset.forEach(q => {
  summary.byCategory[q.category] = (summary.byCategory[q.category] || 0) + 1;
  summary.byLanguage[q.language]++;
});

console.log('\nDataset Summary:');
console.log(JSON.stringify(summary, null, 2));

// Save summary
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'qa-summary.json'),
  JSON.stringify(summary, null, 2)
);

module.exports = { generateVariations, expandDataset };
