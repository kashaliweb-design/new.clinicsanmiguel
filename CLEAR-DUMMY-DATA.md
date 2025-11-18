# Clear Dummy Data from Dashboard

## Option 1: Using Supabase SQL Editor (RECOMMENDED)

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Clear all dummy/test data
DELETE FROM interactions;
DELETE FROM appointments;
DELETE FROM patients;

-- Verify the data is cleared
SELECT 
  (SELECT COUNT(*) FROM interactions) as interactions_count,
  (SELECT COUNT(*) FROM appointments) as appointments_count,
  (SELECT COUNT(*) FROM patients) as patients_count;
```

5. Click **Run** button
6. You should see all counts as 0

## Option 2: Keep Clinics but Clear Patient Data

If you want to keep the clinic information but remove patient data:

```sql
-- Clear only patient-related data
DELETE FROM interactions;
DELETE FROM appointments;
DELETE FROM patients;

-- Keep clinics, FAQs, and canned responses
-- These contain your real clinic information
```

## Option 3: Clear Everything and Start Fresh

If you want to clear ALL data including clinics:

```sql
-- Clear everything
DELETE FROM interactions;
DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM clinics;
DELETE FROM faqs;
DELETE FROM canned_responses;
```

## After Clearing Data

Your dashboard will show:
- **Total Interactions**: 0
- **Total Appointments**: 0
- **Total Patients**: 0
- **Today's Activity**: 0

The dashboard will start showing real numbers as soon as:
- Patients send SMS messages
- Patients make voice calls
- Patients use the web interface
- You manually add appointments

## Re-add Clinic Information (If Needed)

If you cleared clinics and want to add them back:

```sql
-- Add your real clinic information
INSERT INTO clinics (name, address, phone, email, hours, services, timezone) VALUES
  (
    'Your Clinic Name',
    'Your Address',
    '+1234567890',
    'your@email.com',
    '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "closed", "sunday": "closed"}',
    ARRAY['General Practice', 'Family Medicine'],
    'America/Los_Angeles'
  );
```

## Verify Dashboard is Clean

1. Go to: `http://localhost:3000/admin`
2. All stats should show **0**
3. Recent interactions table should be **empty**
4. Go to: `http://localhost:3000/admin/interactions`
5. Should show "No interactions found"

---

**Note**: This only clears the database. Your application code and configuration remain unchanged.
