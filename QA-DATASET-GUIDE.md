# Clinica San Miguel Q&A Dataset - Quick Start Guide

## 🎉 Successfully Generated: 200,000 Questions!

Your comprehensive Q&A dataset has been created and is ready for use with your chatbot.

## 📊 What Was Created

### 1. **Base Data** (`data/base-qa-data.json`)
Core questions and answers organized by 11 categories, sourced from analyzing https://new.clinicsanmiguel.com

### 2. **Full Dataset** (`data/qa-dataset.json`)
**200,000 questions** with variations including:
- Different phrasings and formats
- Conversational prefixes (Hi, Hello, Excuse me, etc.)
- Polite suffixes (please, thanks, por favor)
- English and Spanish versions
- Case variations

### 3. **Summary** (`data/qa-summary.json`)
Statistics breakdown:
- Total: 200,000 questions
- English: 185,705 (92.9%)
- Spanish: 14,295 (7.1%)
- 7 main categories

## 🚀 How to Use

### Step 1: Review the Dataset
```bash
# View summary
cat data/qa-summary.json

# View first few questions
head -n 50 data/qa-dataset.json
```

### Step 2: Import to Database
```bash
# Make sure your .env.local has Supabase credentials
node scripts/import-qa-to-database.js
```

This will:
- Read all 200,000 questions
- Insert into the `faqs` table in batches of 1,000
- Extract keywords automatically
- Take approximately 3-5 minutes

### Step 3: Verify Import
Check your Supabase dashboard or run:
```sql
SELECT COUNT(*) FROM faqs;
-- Should return 200,000

SELECT category, COUNT(*) 
FROM faqs 
GROUP BY category;
-- Shows distribution by category
```

## 📋 Dataset Categories

### 1. **Pricing** (42,915 questions - 21.5%)
Everything about the $19 visit cost, no insurance requirement, affordability
- "How much does a visit cost?"
- "Do I need insurance?"
- "What does the $19 visit include?"

### 2. **Locations** (29,210 questions - 14.6%)
17 clinics across Texas (Dallas, Houston, San Antonio)
- "Where are you located?"
- "Do you have a clinic near me?"
- "How many locations do you have?"

### 3. **Services** (28,860 questions - 14.4%)
General check-ups, preventive care, health screenings
- "What services do you offer?"
- "Do you do check-ups?"
- "Can you help with routine care?"

### 4. **Appointments** (28,170 questions - 14.1%)
Walk-ins welcome, no appointment needed
- "Do I need an appointment?"
- "Can I walk in?"
- "How do I schedule?"

### 5. **Hours** (28,110 questions - 14.1%)
Operating hours by location
- "What are your hours?"
- "Are you open on weekends?"
- "When are you open?"

### 6. **Language** (28,734 questions - 14.4%)
Bilingual English/Spanish support
- "Do you speak Spanish?"
- "¿Hablan español?"
- "Is there Spanish-speaking staff?"

### 7. **Mission** (14,001 questions - 7.0%)
Values, purpose, who they serve
- "What is your mission?"
- "Why do you exist?"
- "Who do you serve?"

## 🔍 Key Information Included

Based on analysis of https://new.clinicsanmiguel.com:

### Core Services:
✅ **$19 Visits** - Affordable care, no insurance required  
✅ **17 Locations** - Across Texas (Dallas, Houston, San Antonio, etc.)  
✅ **Walk-ins Welcome** - No appointment needed  
✅ **Bilingual Staff** - English and Spanish  
✅ **Family Care** - All ages welcome  
✅ **General Check-ups** - Vital signs, health assessment, consultation  
✅ **Preventive Care** - Screenings and routine visits  

### Mission:
"We believe everyone deserves quality care. Our mission is to provide affordable, compassionate healthcare starting at just $19—no insurance needed. We make health a right, not a privilege."

## 🤖 Chatbot Integration

### The dataset works with your existing setup:

1. **Vapi AI** - Natural language understanding
2. **Supabase FAQs table** - Fast keyword search
3. **API endpoint** - `/api/faqs?q=query&lang=en`

### Example API Usage:
```javascript
// In your chatbot code
const response = await fetch('/api/faqs?q=appointment&lang=en');
const faqs = await response.json();
```

### Example Supabase Query:
```javascript
const { data } = await supabase
  .from('faqs')
  .select('*')
  .ilike('question', '%appointment%')
  .eq('language', 'en')
  .eq('active', true)
  .limit(5);
```

## 📝 Sample Questions & Answers

### Pricing:
**Q:** "How much does a visit cost?"  
**A:** "Our visits start at just $19. This affordable price includes a general health check-up where our caring team checks your vitals, answers your questions, and helps you feel your best."

### Locations:
**Q:** "Where are you located?"  
**A:** "We have 17 clinics across Texas, including locations in Dallas, Houston, and San Antonio. Visit our website to find the clinic nearest to you."

### Appointments:
**Q:** "Do I need an appointment?"  
**A:** "No appointment needed! We welcome walk-ins, making it easy to get care when you need it. However, you can schedule an appointment if you prefer."

### Spanish:
**Q:** "¿Cuánto cuesta una visita?"  
**A:** "Nuestras visitas comienzan en solo $19. Este precio asequible incluye un chequeo general de salud donde nuestro equipo verifica sus signos vitales, responde sus preguntas y le ayuda a sentirse mejor."

## 🔧 Maintenance

### To Add New Questions:
1. Edit `data/base-qa-data.json`
2. Add to the appropriate category
3. Run: `node scripts/generate-qa-dataset.js`
4. Run: `node scripts/import-qa-to-database.js`

### To Update Answers:
1. Update in `base-qa-data.json`
2. Regenerate dataset
3. Clear old FAQs: `DELETE FROM faqs;`
4. Re-import

## ✅ Verification Checklist

- [x] Dataset generated: 200,000 questions
- [x] Categories: 7 main categories
- [x] Languages: English (92.9%) and Spanish (7.1%)
- [x] Base data: Sourced from official website
- [x] Scripts: Generation and import scripts ready
- [x] Documentation: Complete README and guide

## 🎯 Next Steps

1. **Import to Database** (if not done yet)
   ```bash
   node scripts/import-qa-to-database.js
   ```

2. **Test the Chatbot**
   - Start your dev server: `npm run dev`
   - Open the chat widget
   - Try questions like:
     - "How much does a visit cost?"
     - "Do I need an appointment?"
     - "Where are you located?"
     - "¿Hablan español?"

3. **Monitor Performance**
   - Check response accuracy
   - Review user questions
   - Add missing Q&As as needed

4. **Expand Dataset** (optional)
   - Add more Spanish translations
   - Include location-specific details
   - Add service-specific pricing
   - Expand to 500,000+ questions

## 📞 Support

If you need help:
1. Check `data/README.md` for detailed documentation
2. Review the generation script: `scripts/generate-qa-dataset.js`
3. Check import script: `scripts/import-qa-to-database.js`
4. Review main project README: `README.md`

## 🎊 Success!

You now have a comprehensive Q&A dataset with **200,000 questions** ready to power your Clinica San Miguel chatbot!

The dataset covers:
- ✅ All major services and information
- ✅ Multiple question variations
- ✅ Bilingual support (English/Spanish)
- ✅ Natural conversational patterns
- ✅ Proper categorization
- ✅ Keyword extraction for search

**Your chatbot is now equipped to handle a wide variety of patient questions about Clinica San Miguel's services, locations, pricing, and more!**

---

**Generated**: November 2024  
**Source**: https://new.clinicsanmiguel.com  
**Total Questions**: 200,000  
**Status**: ✅ Ready for Production
