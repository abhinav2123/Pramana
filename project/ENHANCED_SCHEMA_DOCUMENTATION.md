# Enhanced Ayurvedic Clinical Database Schema Documentation

## Overview

This enhanced schema provides a comprehensive foundation for Ayurvedic clinical practice management with modern medical system integration. The schema supports multilingual data, evidence-based disease mappings, and advanced clinical analytics.

## Key Features

### 1. **Comprehensive Patient Profiling**
- Extended demographic data with Indian healthcare identifiers (UHID, Aadhaar, ABHA)
- Structured family history and emergency contacts
- Occupation classification (sedentary/moderate/heavy)
- Insurance and provider information

### 2. **Advanced Ayurvedic Assessment**
- Quantitative dosha scoring (prakriti/vikriti) with validation
- Detailed examination fields (nadi, jihva, akriti pariksha)
- Srotas (channel system) evaluation
- ICD-11 code integration

### 3. **Evidence-Based Disease Mappings**
- ICD-11 to Ayurvedic disease correlations
- Dosha involvement percentages
- Classical text references
- Modern lab correlations

### 4. **Multilingual Herb Database**
- Sanskrit, Hindi, and Malayalam names
- Comprehensive pharmacological data
- Drug interaction warnings
- Standardized dosages

### 5. **Structured Treatment Protocols**
- Phase-based therapy tracking (shamana, shodhana, rasayana)
- Structured diet and lifestyle recommendations
- Expected outcome timelines

## Database Schema Details

### Patients Table (Enhanced)

```sql
-- Core fields (existing)
id, created_at, name, dob, gender, contact, email, address

-- New enhanced fields
mobile, uhid, aadhaar_number, abha_id, marital_status, occupation, 
occupation_type, insurance_status, insurance_provider, preferred_physician,
emergency_contact, family_history, updated_at
```

**Key Features:**
- `uhid`: Unique Health ID for patient identification
- `emergency_contact`: JSONB structure for emergency contact details
- `family_history`: JSONB array of family medical conditions
- `address`: Converted to JSONB for structured address data

### Assessments Table (Enhanced)

```sql
-- Core fields (existing)
id, created_at, patient_id, prakriti, vikriti, notes

-- New enhanced fields
assessor_id, nadi_pariksha, jihva_pariksha, akriti_pariksha, 
srotas_analysis, icd11_codes, lab_results
```

**Key Features:**
- `prakriti`/`vikriti`: JSONB with dosha scores (validated to sum to 100)
- `nadi_pariksha`: Pulse diagnosis notes
- `jihva_pariksha`: Tongue examination findings
- `akriti_pariksha`: Physical appearance assessment
- `srotas_analysis`: Channel system evaluation
- `icd11_codes`: Array of modern medical codes

### Disease Mappings Table (New)

```sql
CREATE TABLE disease_mappings (
  id uuid PRIMARY KEY,
  icd11_code text UNIQUE,
  icd11_name text,
  ayurvedic_name text,
  ayurvedic_synonyms text[],
  samprapti text,
  dosha_involvement jsonb,
  primary_dosha text,
  references jsonb,
  severity_classification text,
  modern_lab_correlations jsonb
);
```

**Sample Data:**
- **GERD** → **Amlapitta** (Pitta dominant, 80% involvement)
- **Type 2 Diabetes** → **Prameha** (Kapha dominant, 50% involvement)
- **Osteoarthritis** → **Sandhigata Vata** (Vata dominant, 100% involvement)

### Ayurvedic Herbs Table (New)

```sql
CREATE TABLE ayurvedic_herbs (
  id uuid PRIMARY KEY,
  sanskrit_name text,
  hindi_name text,
  malayalam_name text,
  common_name text,
  latin_name text,
  primary_dosha_effect text,
  rasa text[],
  virya text,
  vipaka text,
  indications text[],
  contraindications text[],
  standard_dosage text,
  herb_drug_interactions jsonb
);
```

**Sample Herbs:**
- **Ashwagandha**: Vata balancing, stress management
- **Haridra (Turmeric)**: Kapha balancing, anti-inflammatory
- **Brahmi**: Vata-Pitta balancing, cognitive enhancement
- **Triphala**: Tridoshic, digestive health

### Treatments Table (Enhanced)

```sql
-- Core fields (existing)
id, created_at, patient_id, diagnosis, herbs, therapy, diet, lifestyle

-- New enhanced fields
assessment_id, physician_id, primary_ayurvedic_diagnosis, 
secondary_ayurvedic_diagnoses, icd11_diagnoses, shamana_therapy,
shodhana_therapy, rasayana_plan, diet_plan, lifestyle_recommendations,
expected_timeline, followup_schedule, status
```

## Advanced Features

### 1. Materialized Views

**Patient Dosha Imbalances View:**
```sql
CREATE MATERIALIZED VIEW patient_dosha_imbalances AS
SELECT 
  p.id, p.name,
  (a.vikriti->>'vata')::float - (a.prakriti->>'vata')::float AS vata_imbalance,
  (a.vikriti->>'pitta')::float - (a.prakriti->>'pitta')::float AS pitta_imbalance,
  (a.vikriti->>'kapha')::float - (a.prakriti->>'kapha')::float AS kapha_imbalance
FROM patients p
JOIN assessments a ON p.id = a.patient_id;
```

### 2. Search Functions

**Herb Search by Indication:**
```sql
SELECT * FROM search_herbs_by_indication('stress');
-- Returns: Ashwagandha, Brahmi, Shankhapushpi
```

**Patient Dosha Analysis:**
```sql
SELECT * FROM get_patient_dosha_analysis('patient-uuid');
-- Returns comprehensive dosha analysis with imbalances
```

### 3. Full-Text Search

```sql
-- Search herbs by name or indication
SELECT * FROM ayurvedic_herbs 
WHERE to_tsvector('english', sanskrit_name || ' ' || array_to_string(indications, ' ')) 
@@ plainto_tsquery('english', 'memory');

-- Search disease mappings
SELECT * FROM disease_mappings 
WHERE to_tsvector('english', icd11_name || ' ' || ayurvedic_name) 
@@ plainto_tsquery('english', 'diabetes');
```

## Usage Examples

### 1. Creating a Patient with Enhanced Data

```sql
INSERT INTO patients (
  name, dob, gender, mobile, email, uhid, aadhaar_number,
  marital_status, occupation, occupation_type, insurance_status,
  emergency_contact, family_history, address
) VALUES (
  'Rajesh Kumar', '1985-03-15', 'male', '+91-9876543210',
  'rajesh.kumar@email.com', 'UHID123456789', '123456789012',
  'married', 'Software Engineer', 'sedentary', true,
  '{"name": "Priya Kumar", "relationship": "spouse", "phone": "+91-9876543211"}'::jsonb,
  '["diabetes", "hypertension"]'::jsonb,
  '{"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001"}'::jsonb
);
```

### 2. Creating a Comprehensive Assessment

```sql
INSERT INTO assessments (
  patient_id, assessor_id, prakriti, vikriti, nadi_pariksha,
  jihva_pariksha, akriti_pariksha, srotas_analysis, icd11_codes, notes
) VALUES (
  'patient-uuid', 'physician-uuid',
  '{"vata": 30, "pitta": 40, "kapha": 30}'::jsonb,
  '{"vata": 50, "pitta": 35, "kapha": 15}'::jsonb,
  'Vata pulse prominent, irregular rhythm',
  'Coated tongue, slight yellow discoloration',
  'Thin build, dry skin, anxious appearance',
  '{"pranavaha": "impaired", "annavaha": "normal", "udakavaha": "impaired"}'::jsonb,
  ARRAY['5B81.0', 'BA01'],
  'Vata prakopa with pitta involvement'
);
```

### 3. Creating a Treatment Plan

```sql
INSERT INTO treatments (
  patient_id, assessment_id, physician_id, primary_ayurvedic_diagnosis,
  icd11_diagnoses, shamana_therapy, diet_plan, lifestyle_recommendations,
  expected_timeline, status
) VALUES (
  'patient-uuid', 'assessment-uuid', 'physician-uuid',
  'Vata Prakopa with Pitta Involvement',
  ARRAY['5B81.0', 'BA01'],
  '{"internal_medicines": ["Ashwagandha", "Brahmi"], "external_therapies": ["Abhyanga"]}'::jsonb,
  '{"foods_to_include": ["warm foods", "sweet taste"], "foods_to_avoid": ["cold foods", "bitter taste"]}'::jsonb,
  '{"daily_routine": "early sleep", "exercise": "gentle yoga", "stress_management": "meditation"}'::jsonb,
  '{"phases": [{"duration": "2 weeks", "goals": "symptom relief"}, {"duration": "4 weeks", "goals": "dosha balance"}]}'::jsonb,
  'active'
);
```

### 4. Searching for Herbs by Indication

```sql
-- Find herbs for stress management
SELECT * FROM search_herbs_by_indication('stress');

-- Find herbs for diabetes
SELECT * FROM search_herbs_by_indication('diabetes');

-- Find herbs for inflammation
SELECT * FROM search_herbs_by_indication('inflammation');
```

### 5. Analyzing Patient Dosha Imbalances

```sql
-- Get comprehensive dosha analysis
SELECT * FROM get_patient_dosha_analysis('patient-uuid');

-- View all patient imbalances
SELECT * FROM patient_dosha_imbalances 
WHERE vata_imbalance > 10 OR pitta_imbalance > 10 OR kapha_imbalance > 10;
```

## Performance Optimizations

### 1. Indexes
- **Patient identifiers**: UHID, Aadhaar, ABHA
- **Clinical data**: Patient IDs, assessment dates
- **Search optimization**: Full-text search indexes
- **Multilingual support**: Sanskrit, Hindi, Malayalam names

### 2. Materialized Views
- **Dosha imbalances**: Pre-calculated for quick access
- **Auto-refresh**: Trigger-based updates

### 3. Functions
- **Search functions**: Optimized herb and disease searches
- **Analysis functions**: Patient dosha analysis

## Security Features

### 1. Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can read disease mappings and herbs
- Patient data access controlled by user permissions

### 2. Data Validation
- Email format validation
- Dosha score validation (must sum to 100)
- Enum constraints for categorical data

## Integration Capabilities

### 1. Modern Medical Systems
- ICD-11 code integration
- Lab result correlation
- Standardized medical terminology

### 2. Multilingual Support
- Sanskrit classical names
- Hindi vernacular names
- Malayalam regional names
- English common names

### 3. API Ready
- JSONB fields for flexible data structures
- Array fields for multiple values
- Structured responses for frontend consumption

## Migration Notes

The enhanced schema is backward compatible with existing data. The migration:

1. **Adds new columns** to existing tables
2. **Creates new tables** for disease mappings and herbs
3. **Converts address field** to JSONB structure
4. **Populates sample data** for immediate use
5. **Creates indexes and functions** for performance

## Next Steps

1. **Run the migration** to apply the enhanced schema
2. **Test the functions** with sample data
3. **Update frontend components** to use new fields
4. **Implement search features** using the new functions
5. **Add more disease mappings** and herbs as needed

This enhanced schema provides a robust foundation for modern Ayurvedic clinical practice while maintaining the integrity of classical knowledge and enabling integration with contemporary healthcare systems. 