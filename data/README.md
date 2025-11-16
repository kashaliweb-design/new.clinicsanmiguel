# Clinica San Miguel Q&A Dataset

## Overview
This directory contains a comprehensive Q&A dataset with **200,000 questions and answers** for the Clinica San Miguel chatbot, generated from analysis of the official website at https://new.clinicsanmiguel.com/services

## Dataset Statistics

### Total Questions: 200,000

### By Category:
- **Pricing**: 42,915 questions (21.5%)
- **Locations**: 29,210 questions (14.6%)
- **Services**: 28,860 questions (14.4%)
- **Appointments**: 28,170 questions (14.1%)
- **Hours**: 28,110 questions (14.1%)
- **Language**: 28,734 questions (14.4%)
- **Mission**: 14,001 questions (7.0%)

### By Language:
- **English**: 185,705 questions (92.9%)
- **Spanish**: 14,295 questions (7.1%)

## Files

### 1. `base-qa-data.json`
Core Q&A data organized by category with base questions and answers derived from the Clinica San Miguel website analysis.

**Categories covered:**
- Pricing ($19 visits, no insurance required)
- Locations (17 clinics across Texas)
- Services (general check-ups, preventive care, screenings)
- Appointments (walk-ins welcome, no appointment needed)
- Hours (varies by location)
- Insurance (not required)
- Language (bilingual English/Spanish)
- New patients
- Children/family care
- Contact information
- Mission and values

### 2. `qa-dataset.json`
Full generated dataset with 200,000 questions. Each entry contains:
```json
{
  "id": 1,
  "question": "How much does a visit cost?",
  "answer": "Our visits start at just $19...",
  "category": "pricing",
  "language": "en"
}
```

### 3. `qa-summary.json`
Statistical summary of the dataset including counts by category and language.

## Key Information from Clinica San Miguel Website

### Core Services:
- **Affordable Care**: $19 visits, no insurance required
- **17 Locations**: Across Texas (Dallas, Houston, San Antonio, etc.)
- **Walk-in Welcome**: No appointment needed
- **Bilingual Staff**: English and Spanish
- **Family Care**: All ages welcome
- **General Health Check-ups**: Vital signs, health assessment, consultation
- **Preventive Care**: Screenings and routine medical visits

### Mission:
"We believe everyone deserves quality care. Proudly serving Texas communities, especially the Hispanic population, we provide affordable, compassionate healthcare starting at just $19—no insurance needed. Our mission is to make health a right, not a privilege."

## Usage

### Generate the Dataset
```bash
node scripts/generate-qa-dataset.js
```

This will:
1. Load base Q&A data
2. Generate variations with different phrasings
3. Expand to 200,000 questions
4. Save to `data/qa-dataset.json`
5. Generate summary statistics

### Import to Database
```bash
node scripts/import-qa-to-database.js
```

This will:
1. Read the generated dataset
2. Transform to FAQ table format
3. Batch insert into Supabase (1000 at a time)
4. Extract keywords for search
5. Report import statistics

**Prerequisites:**
- Supabase credentials in `.env.local`
- FAQs table created (run `supabase/schema.sql`)

### Query Examples

**Find pricing questions:**
```sql
SELECT * FROM faqs 
WHERE category = 'pricing' 
AND language = 'en' 
LIMIT 10;
```

**Search by keyword:**
```sql
SELECT * FROM faqs 
WHERE 'insurance' = ANY(keywords) 
AND active = true;
```

**Get Spanish questions:**
```sql
SELECT * FROM faqs 
WHERE language = 'es';
```

## Question Variations

The dataset includes multiple variations of each base question:

**Prefixes:**
- Direct: "How much does a visit cost?"
- Polite: "Hi, how much does a visit cost?"
- Conversational: "I was wondering, how much does a visit cost?"
- Spanish: "Hola, ¿cuánto cuesta una visita?"

**Suffixes:**
- Plain: "How much does a visit cost"
- Question mark: "How much does a visit cost?"
- Polite: "How much does a visit cost please?"
- Spanish: "¿Cuánto cuesta una visita por favor?"

## Categories Explained

### 1. Pricing (42,915 questions)
Questions about costs, fees, insurance requirements, and affordability.
- $19 visit cost
- No insurance needed
- No hidden fees
- Affordable care

### 2. Locations (29,210 questions)
Questions about clinic locations, addresses, and directions.
- 17 clinics across Texas
- Dallas, Houston, San Antonio
- Nearest clinic finder
- Directions and access

### 3. Services (28,860 questions)
Questions about medical services offered.
- General check-ups
- Preventive care
- Health screenings
- Routine medical visits

### 4. Appointments (28,170 questions)
Questions about scheduling and walk-ins.
- No appointment needed
- Walk-ins welcome
- How to schedule
- Same-day visits

### 5. Hours (28,110 questions)
Questions about operating hours.
- Weekday hours
- Weekend availability
- Opening/closing times
- Holiday hours

### 6. Language (28,734 questions)
Questions about language support.
- Bilingual staff
- Spanish-speaking
- English services
- Language preferences

### 7. Mission (14,001 questions)
Questions about values and purpose.
- Healthcare accessibility
- Community service
- Affordable care mission
- Who they serve

## Integration with Chatbot

The Q&A dataset is designed to work with:

1. **Vapi AI Assistant**: Natural language understanding
2. **Supabase FAQs Table**: Fast keyword search
3. **OpenAI Embeddings**: Semantic search (future)
4. **Multi-language Support**: English and Spanish

### API Usage Example:
```javascript
// Search FAQs
const { data } = await supabase
  .from('faqs')
  .select('*')
  .textSearch('question', 'appointment')
  .eq('language', 'en')
  .eq('active', true)
  .limit(5);
```

## Maintenance

### Adding New Questions:
1. Edit `data/base-qa-data.json`
2. Add to appropriate category
3. Run `node scripts/generate-qa-dataset.js`
4. Run `node scripts/import-qa-to-database.js`

### Updating Answers:
1. Update in `base-qa-data.json`
2. Regenerate dataset
3. Clear old FAQs in database
4. Re-import

### Adding Categories:
1. Add new category in `base-qa-data.json`
2. Update generation script if needed
3. Regenerate and import

## Quality Assurance

The dataset ensures:
- ✅ Accurate information from official website
- ✅ Consistent answers across variations
- ✅ Bilingual support (English/Spanish)
- ✅ Natural language variations
- ✅ Proper categorization
- ✅ Keyword extraction for search

## Future Enhancements

- [ ] Add more Spanish translations
- [ ] Include location-specific details
- [ ] Add service-specific pricing
- [ ] Expand to 500,000+ questions
- [ ] Add embeddings for semantic search
- [ ] Include FAQ confidence scores
- [ ] Add response templates
- [ ] Multi-turn conversation support

## Support

For questions or issues:
- Check the main README.md
- Review the generation script
- Contact the development team

---

**Generated**: November 2024  
**Source**: https://new.clinicsanmiguel.com  
**Version**: 1.0  
**Total Questions**: 200,000
