/*
  # Enhanced Ayurvedic Clinical Database Schema
  
  This migration enhances the existing schema with:
  1. Extended patients table with comprehensive demographic data
  2. Enhanced assessments table with detailed Ayurvedic examination fields
  3. Disease mappings table for ICD-11 to Ayurvedic correlations
  4. Enhanced treatments table with structured therapy protocols
  5. Ayurvedic herbs database with multilingual support
  6. Clinical timeline improvements
  7. Materialized views for common queries
*/

-- 1. Enhance patients table with additional fields
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS updated_at timestamptz,
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS uhid text UNIQUE,
ADD COLUMN IF NOT EXISTS aadhaar_number text,
ADD COLUMN IF NOT EXISTS abha_id text,
ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS occupation_type text CHECK (occupation_type IN ('sedentary', 'moderate', 'heavy')),
ADD COLUMN IF NOT EXISTS insurance_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_provider text,
ADD COLUMN IF NOT EXISTS preferred_physician uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS emergency_contact jsonb,
ADD COLUMN IF NOT EXISTS family_history jsonb,
ADD CONSTRAINT IF NOT EXISTS valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- Update existing address field to use JSONB structure
ALTER TABLE patients 
ALTER COLUMN address TYPE jsonb USING 
  CASE 
    WHEN address IS NULL THEN NULL
    ELSE jsonb_build_object('full_address', address)
  END;

-- 2. Enhance assessments table with detailed Ayurvedic examination fields
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS assessor_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS nadi_pariksha text,
ADD COLUMN IF NOT EXISTS jihva_pariksha text,
ADD COLUMN IF NOT EXISTS akriti_pariksha text,
ADD COLUMN IF NOT EXISTS srotas_analysis jsonb,
ADD COLUMN IF NOT EXISTS icd11_codes text[],
ADD COLUMN IF NOT EXISTS lab_results jsonb,
ADD CONSTRAINT IF NOT EXISTS valid_prakriti CHECK (
  (prakriti->>'vata')::integer + 
  (prakriti->>'pitta')::integer + 
  (prakriti->>'kapha')::integer = 100
);

-- 3. Create disease mappings table
CREATE TABLE IF NOT EXISTS disease_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icd11_code text NOT NULL UNIQUE,
  icd11_name text NOT NULL,
  ayurvedic_name text NOT NULL,
  ayurvedic_synonyms text[],
  samprapti text,
  dosha_involvement jsonb,
  primary_dosha text,
  references jsonb,
  severity_classification text,
  modern_lab_correlations jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- 4. Enhance treatments table with structured therapy protocols
ALTER TABLE treatments 
ADD COLUMN IF NOT EXISTS assessment_id uuid REFERENCES assessments(id),
ADD COLUMN IF NOT EXISTS physician_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS primary_ayurvedic_diagnosis text,
ADD COLUMN IF NOT EXISTS secondary_ayurvedic_diagnoses text[],
ADD COLUMN IF NOT EXISTS icd11_diagnoses text[],
ADD COLUMN IF NOT EXISTS shamana_therapy jsonb,
ADD COLUMN IF NOT EXISTS shodhana_therapy jsonb,
ADD COLUMN IF NOT EXISTS rasayana_plan jsonb,
ADD COLUMN IF NOT EXISTS diet_plan jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_recommendations jsonb,
ADD COLUMN IF NOT EXISTS expected_timeline jsonb,
ADD COLUMN IF NOT EXISTS followup_schedule jsonb,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));

-- 5. Create ayurvedic herbs database
CREATE TABLE IF NOT EXISTS ayurvedic_herbs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sanskrit_name text NOT NULL,
  hindi_name text NOT NULL,
  malayalam_name text NOT NULL,
  common_name text NOT NULL,
  latin_name text NOT NULL,
  primary_dosha_effect text CHECK (primary_dosha_effect IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha', 'vata-kapha', 'tridoshic')),
  secondary_effects jsonb,
  rasa text[],
  virya text CHECK (virya IN ('ushna', 'shita', 'variable')),
  vipaka text,
  prabhava text,
  indications text[],
  contraindications text[],
  modern_research jsonb,
  standard_dosage text,
  herb_drug_interactions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- 6. Enhance timeline entries table
ALTER TABLE timeline_entries 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS details text,
ADD COLUMN IF NOT EXISTS metadata jsonb,
ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES auth.users(id);

-- Update entry_type to include more clinical events
ALTER TABLE timeline_entries 
DROP CONSTRAINT IF EXISTS timeline_entries_entry_type_check;

ALTER TABLE timeline_entries 
ADD CONSTRAINT timeline_entries_entry_type_check 
CHECK (entry_type IN ('assessment', 'treatment', 'observation', 'lab_result', 'symptom_update', 'therapy_session', 'followup', 'note'));

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_uhid ON patients(uhid);
CREATE INDEX IF NOT EXISTS idx_patients_aadhaar ON patients(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessor ON assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_assessment ON treatments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_treatments_physician ON treatments(physician_id);
CREATE INDEX IF NOT EXISTS idx_disease_mappings_icd11 ON disease_mappings(icd11_code);
CREATE INDEX IF NOT EXISTS idx_disease_mappings_ayurvedic ON disease_mappings(ayurvedic_name);
CREATE INDEX IF NOT EXISTS idx_herbs_sanskrit ON ayurvedic_herbs(sanskrit_name);
CREATE INDEX IF NOT EXISTS idx_herbs_hindi ON ayurvedic_herbs(hindi_name);
CREATE INDEX IF NOT EXISTS idx_herbs_malayalam ON ayurvedic_herbs(malayalam_name);
CREATE INDEX IF NOT EXISTS idx_herbs_dosha ON ayurvedic_herbs(primary_dosha_effect);
CREATE INDEX IF NOT EXISTS idx_timeline_patient ON timeline_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_entries(entry_type);

-- 8. Enable RLS on new tables
ALTER TABLE disease_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayurvedic_herbs ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for new tables
CREATE POLICY "Users can read disease mappings"
  ON disease_mappings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read herbs"
  ON ayurvedic_herbs
  FOR SELECT
  TO authenticated
  USING (true);

-- 10. Create materialized view for dosha imbalances
CREATE MATERIALIZED VIEW IF NOT EXISTS patient_dosha_imbalances AS
SELECT 
  p.id,
  p.name,
  (a.vikriti->>'vata')::float - (a.prakriti->>'vata')::float AS vata_imbalance,
  (a.vikriti->>'pitta')::float - (a.prakriti->>'pitta')::float AS pitta_imbalance,
  (a.vikriti->>'kapha')::float - (a.prakriti->>'kapha')::float AS kapha_imbalance,
  a.created_at as assessment_date
FROM patients p
JOIN assessments a ON p.id = a.patient_id
WHERE a.created_at = (
  SELECT MAX(created_at) 
  FROM assessments 
  WHERE patient_id = p.id
);

-- 11. Create function to update materialized view
CREATE OR REPLACE FUNCTION refresh_dosha_imbalances()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW patient_dosha_imbalances;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to automatically update materialized view
CREATE OR REPLACE FUNCTION trigger_refresh_dosha_imbalances()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_dosha_imbalances();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_dosha_imbalances_trigger
  AFTER INSERT OR UPDATE OR DELETE ON assessments
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_dosha_imbalances();

-- 13. Insert sample disease mappings
INSERT INTO disease_mappings (
  icd11_code, icd11_name, ayurvedic_name, ayurvedic_synonyms, samprapti, 
  dosha_involvement, primary_dosha, references, severity_classification, modern_lab_correlations
) VALUES
-- Gastrointestinal
(
  '8A62.0',
  'Gastroesophageal reflux disease',
  'Amlapitta',
  ARRAY['Acid Gastritis', 'Urdhvag Amlapitta'],
  'Mandagni → Vidagdha Anna → Pitta Prakopa → Amavisha Formation',
  '{"vata": 20, "pitta": 80, "kapha": 0}'::jsonb,
  'pitta',
  '{"charaka": "Chikitsa 15", "ashtanga": "Uttara 40"}'::jsonb,
  'Sadhya (Curable)',
  '{"pH_monitoring": "<4.0 for >5% time", "endoscopy": "Esophagitis Grade A-D"}'::jsonb
),
-- Metabolic/Endocrine
(
  '5B81.0',
  'Type 2 Diabetes Mellitus',
  'Prameha (Madhumeha)',
  ARRAY['Dhatupaka Janya Vikara', 'Ashtau Prameha'],
  'Medodushti → Kleda Accumulation → Dhatu Kshaya',
  '{"vata": 40, "pitta": 10, "kapha": 50}'::jsonb,
  'kapha',
  '{"charaka": "Nidana 4", "sushruta": "Chikitsa 11"}'::jsonb,
  'Yapya (Manageable)',
  '{"hba1c": ">6.5%", "ogtt": "≥200 mg/dL"}'::jsonb
),
-- Musculoskeletal
(
  'FA01.0',
  'Osteoarthritis of knee',
  'Sandhigata Vata',
  ARRAY['Janu Sandhi Shoola', 'Asthi-Majja Gata Vata'],
  'Vata Prakopa → Asthi-Majja Dhatu Kshaya → Shoola',
  '{"vata": 100, "pitta": 0, "kapha": 0}'::jsonb,
  'vata',
  '{"madhav": "Nidana 22", "bhavaprakash": "Chikitsa 28"}'::jsonb,
  'Krichrasadhya (Difficult to cure)',
  '{"xray": "Kellgren-Lawrence Grade", "esr": "20-40 mm/hr"}'::jsonb
),
-- Respiratory
(
  'CA23.0',
  'Allergic Rhinitis',
  'Vata-Kapha Pratishyaya',
  ARRAY['Seenapratishyaya', 'Nasagata Roga'],
  'Pratighata of Pranavaha Srotas → Shirogaurava',
  '{"vata": 50, "pitta": 10, "kapha": 40}'::jsonb,
  'kapha',
  '{"charaka": "Sutra 17", "vagbhata": "Chikitsa 19"}'::jsonb,
  'Sadhya (Curable)',
  '{"ige": ">100 IU/mL", "eosinophils": ">5%"}'::jsonb
),
-- Psychiatric
(
  '6A70',
  'Major Depressive Disorder',
  'Vishada',
  ARRAY['Manasika Roga', 'Avasadaja Vikara'],
  'Manovaha Srotavrodha → Tamo Guna Vriddhi',
  '{"vata": 70, "pitta": 30, "kapha": 0}'::jsonb,
  'vata',
  '{"charaka": "Sutra 1", "yogaratnakara": "Uttara Khanda"}'::jsonb,
  'Yapya (Manageable)',
  '{"hamd_score": "≥20", "bdnf": "<12 ng/mL"}'::jsonb
),
-- Dermatological
(
  'EA90',
  'Psoriasis',
  'Ekakushta',
  ARRAY['Kitibha', 'Mandala Kushtha'],
  'Tridosha Prakopa → Twak-Rakta Dushti',
  '{"vata": 40, "pitta": 40, "kapha": 20}'::jsonb,
  'pitta',
  '{"charaka": "Chikitsa 7", "sushruta": "Chikitsa 9"}'::jsonb,
  'Krichrasadhya (Difficult to cure)',
  '{"pasi_score": "≥10", "crp": "≥3 mg/L"}'::jsonb
),
-- Neurological
(
  '8A00',
  'Migraine',
  'Ardhavabhedaka',
  ARRAY['Shirashoola', 'Anantavata'],
  'Vata-Pitta Prakopa → Shirah Srotas Avrodha',
  '{"vata": 60, "pitta": 40, "kapha": 0}'::jsonb,
  'vata',
  '{"madhava": "Nidana 19", "bhavaprakash": "Chikitsa 62"}'::jsonb,
  'Yapya (Manageable)',
  '{"mri": "White matter lesions", "cgrp": "Elevated"}'::jsonb
),
-- Cardiovascular
(
  'BA01',
  'Essential Hypertension',
  'Raktagata Vata',
  ARRAY['Raktavrita Vata', 'Vyana Vata Dushti'],
  'Vata Prakopa → Rasa-Rakta Gati Vaigunya',
  '{"vata": 80, "pitta": 20, "kapha": 0}'::jsonb,
  'vata',
  '{"charaka": "Sutra 28", "vagbhata": "Chikitsa 22"}'::jsonb,
  'Yapya (Manageable)',
  '{"bp": ">140/90 mmHg", "ldl": ">130 mg/dL"}'::jsonb
)
ON CONFLICT (icd11_code) DO NOTHING;

-- 14. Insert sample ayurvedic herbs
INSERT INTO ayurvedic_herbs (
  sanskrit_name, hindi_name, malayalam_name, common_name, latin_name,
  primary_dosha_effect, rasa, virya, vipaka, indications, contraindications,
  standard_dosage, herb_drug_interactions
) VALUES
-- Ashwagandha
(
  'Ashwagandha',
  'अश्वगंधा',
  'അമുക്കുരം',
  'Winter Cherry',
  'Withania somnifera',
  'vata',
  ARRAY['madhura', 'tikta'],
  'ushna',
  'madhura',
  ARRAY['Stress', 'Fatigue', 'Muscle weakness', 'Anxiety', 'Insomnia'],
  ARRAY['Pregnancy', 'Hyperthyroidism', 'Autoimmune conditions'],
  '3-6g powder/day',
  '[
    {"drug_class": "Sedatives", "effect": "Increased drowsiness", "severity": "moderate"},
    {"drug_class": "Thyroid hormones", "effect": "May interfere with treatment", "severity": "high"}
  ]'::jsonb
),
-- Haridra (Turmeric)
(
  'Haridra',
  'हल्दी',
  'മഞ്ഞൾ',
  'Turmeric',
  'Curcuma longa',
  'kapha',
  ARRAY['tikta', 'katu'],
  'ushna',
  'katu',
  ARRAY['Inflammation', 'Arthritis', 'Skin disorders', 'Digestive issues'],
  ARRAY['Bleeding disorders', 'Gallstones', 'Pregnancy (high doses)'],
  '1-3g powder/day',
  '[
    {"drug_class": "Anticoagulants", "effect": "Increased bleeding risk", "severity": "high"},
    {"drug_class": "Antacids", "effect": "Reduced absorption", "severity": "moderate"}
  ]'::jsonb
),
-- Brahmi
(
  'Brahmi',
  'ब्राह्मी',
  'ബ്രാഹ്മി',
  'Bacopa',
  'Bacopa monnieri',
  'vata-pitta',
  ARRAY['tikta'],
  'shita',
  'madhura',
  ARRAY['Memory enhancement', 'Anxiety', 'Epilepsy', 'ADHD'],
  ARRAY['Hypothyroidism', 'Bradycardia', 'Pregnancy'],
  '300-600mg extract/day',
  '[
    {"drug_class": "Thyroid medication", "effect": "May decrease efficacy", "severity": "moderate"},
    {"drug_class": "Sedatives", "effect": "Potentiates effect", "severity": "moderate"}
  ]'::jsonb
),
-- Guduchi
(
  'Guduchi',
  'गिलोय',
  'ചിറ്റമൃത്',
  'Giloy',
  'Tinospora cordifolia',
  'pitta-kapha',
  ARRAY['tikta', 'kashaya'],
  'ushna',
  'madhura',
  ARRAY['Fever', 'Diabetes', 'Liver disorders', 'Immunity'],
  ARRAY['Autoimmune diseases', 'Pregnancy'],
  '2-4g powder/day',
  '[
    {"drug_class": "Immunosuppressants", "effect": "May reduce efficacy", "severity": "high"},
    {"drug_class": "Hypoglycemics", "effect": "Enhanced effect", "severity": "moderate"}
  ]'::jsonb
),
-- Triphala
(
  'Triphala',
  'त्रिफला',
  'ത്രിഫല',
  'Three Fruits',
  'Emblica officinalis + Terminalia spp.',
  'tridoshic',
  ARRAY['madhura', 'amla', 'katu', 'tikta', 'kashaya'],
  'variable',
  'madhura',
  ARRAY['Constipation', 'Eye health', 'Detoxification', 'Digestive health'],
  ARRAY['Diarrhea', 'Dehydration', 'Pregnancy'],
  '3-5g at bedtime',
  '[
    {"drug_class": "Laxatives", "effect": "Additive effect", "severity": "moderate"},
    {"drug_class": "Diuretics", "effect": "Increased electrolyte loss", "severity": "moderate"}
  ]'::jsonb
),
-- Arjuna
(
  'Arjuna',
  'अर्जुन',
  'നീർമരുത്',
  'Arjun Tree',
  'Terminalia arjuna',
  'pitta-kapha',
  ARRAY['kashaya'],
  'shita',
  'katu',
  ARRAY['Hypertension', 'Heart failure', 'High cholesterol', 'Angina'],
  ARRAY['Hypotension', 'Pregnancy'],
  '1-3g bark decoction',
  '[
    {"drug_class": "Antihypertensives", "effect": "Enhanced effect", "severity": "high"},
    {"drug_class": "Nitrates", "effect": "Possible additive effect", "severity": "moderate"}
  ]'::jsonb
),
-- Shankhapushpi
(
  'Shankhapushpi',
  'शंखपुष्पी',
  'ശംഖുപുഷ്പം',
  'Aloe Weed',
  'Convolvulus pluricaulis',
  'vata-pitta',
  ARRAY['tikta', 'madhura'],
  'shita',
  'madhura',
  ARRAY['Insomnia', 'Anxiety', 'ADHD', 'Memory'],
  ARRAY['Hypoglycemia', 'Pregnancy'],
  '500mg-1g powder/day',
  '[
    {"drug_class": "Hypoglycemics", "effect": "Enhanced effect", "severity": "high"},
    {"drug_class": "Sedatives", "effect": "Additive effect", "severity": "moderate"}
  ]'::jsonb
),
-- Guggulu
(
  'Guggulu',
  'गुग्गुलु',
  'ഗുഗ്ഗുലു',
  'Indian Bdellium',
  'Commiphora mukul',
  'kapha',
  ARRAY['tikta', 'katu'],
  'ushna',
  'katu',
  ARRAY['Obesity', 'Arthritis', 'Hyperlipidemia', 'Skin disorders'],
  ARRAY['Pregnancy', 'Liver disease', 'Kidney disease'],
  '500mg-1g purified extract',
  '[
    {"drug_class": "Oral contraceptives", "effect": "May reduce efficacy", "severity": "high"},
    {"drug_class": "Thyroid hormones", "effect": "May alter absorption", "severity": "moderate"}
  ]'::jsonb
),
-- Punarnava
(
  'Punarnava',
  'पुनर्नवा',
  'താമര',
  'Hogweed',
  'Boerhavia diffusa',
  'kapha',
  ARRAY['tikta', 'kashaya'],
  'shita',
  'madhura',
  ARRAY['Edema', 'Kidney disorders', 'Urinary tract infections', 'Liver disorders'],
  ARRAY['Dehydration', 'Pregnancy'],
  '3-5g powder/day',
  '[
    {"drug_class": "Diuretics", "effect": "Additive effect", "severity": "high"},
    {"drug_class": "Lithium", "effect": "May increase toxicity", "severity": "high"}
  ]'::jsonb
),
-- Yashtimadhu
(
  'Yashtimadhu',
  'मुलेठी',
  'ഇരട്ടിമധുരം',
  'Licorice',
  'Glycyrrhiza glabra',
  'vata-pitta',
  ARRAY['madhura'],
  'shita',
  'madhura',
  ARRAY['Cough', 'Ulcers', 'Adrenal fatigue', 'Sore throat'],
  ARRAY['Hypertension', 'Hypokalemia', 'Pregnancy'],
  '1-3g root powder',
  '[
    {"drug_class": "Corticosteroids", "effect": "Potentiated effect", "severity": "high"},
    {"drug_class": "Antihypertensives", "effect": "May counteract", "severity": "moderate"}
  ]'::jsonb
)
ON CONFLICT (sanskrit_name) DO NOTHING;

-- 15. Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_herbs_fts ON ayurvedic_herbs 
USING gin(to_tsvector('english', sanskrit_name || ' ' || hindi_name || ' ' || malayalam_name || ' ' || common_name || ' ' || array_to_string(indications, ' ')));

CREATE INDEX IF NOT EXISTS idx_disease_mappings_fts ON disease_mappings 
USING gin(to_tsvector('english', icd11_name || ' ' || ayurvedic_name || ' ' || array_to_string(ayurvedic_synonyms, ' ')));

-- 16. Create function to search herbs by indication
CREATE OR REPLACE FUNCTION search_herbs_by_indication(search_term text)
RETURNS TABLE (
  sanskrit_name text,
  hindi_name text,
  malayalam_name text,
  common_name text,
  primary_dosha_effect text,
  indications text[],
  contraindications text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.sanskrit_name,
    h.hindi_name,
    h.malayalam_name,
    h.common_name,
    h.primary_dosha_effect,
    h.indications,
    h.contraindications
  FROM ayurvedic_herbs h
  WHERE EXISTS (
    SELECT 1 
    FROM unnest(h.indications) AS indication 
    WHERE indication ILIKE '%' || search_term || '%'
  )
  ORDER BY h.sanskrit_name;
END;
$$ LANGUAGE plpgsql;

-- 17. Create function to get patient dosha analysis
CREATE OR REPLACE FUNCTION get_patient_dosha_analysis(patient_uuid uuid)
RETURNS TABLE (
  patient_name text,
  prakriti_vata integer,
  prakriti_pitta integer,
  prakriti_kapha integer,
  vikriti_vata integer,
  vikriti_pitta integer,
  vikriti_kapha integer,
  vata_imbalance integer,
  pitta_imbalance integer,
  kapha_imbalance integer,
  primary_imbalance text,
  assessment_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    (a.prakriti->>'vata')::integer,
    (a.prakriti->>'pitta')::integer,
    (a.prakriti->>'kapha')::integer,
    (a.vikriti->>'vata')::integer,
    (a.vikriti->>'pitta')::integer,
    (a.vikriti->>'kapha')::integer,
    (a.vikriti->>'vata')::integer - (a.prakriti->>'vata')::integer,
    (a.vikriti->>'pitta')::integer - (a.prakriti->>'pitta')::integer,
    (a.vikriti->>'kapha')::integer - (a.prakriti->>'kapha')::integer,
    CASE 
      WHEN ABS((a.vikriti->>'vata')::integer - (a.prakriti->>'vata')::integer) > 
           ABS((a.vikriti->>'pitta')::integer - (a.prakriti->>'pitta')::integer) AND
           ABS((a.vikriti->>'vata')::integer - (a.prakriti->>'vata')::integer) > 
           ABS((a.vikriti->>'kapha')::integer - (a.prakriti->>'kapha')::integer)
      THEN 'vata'
      WHEN ABS((a.vikriti->>'pitta')::integer - (a.prakriti->>'pitta')::integer) > 
           ABS((a.vikriti->>'kapha')::integer - (a.prakriti->>'kapha')::integer)
      THEN 'pitta'
      ELSE 'kapha'
    END,
    a.created_at
  FROM patients p
  JOIN assessments a ON p.id = a.patient_id
  WHERE p.id = patient_uuid
  AND a.created_at = (
    SELECT MAX(created_at) 
    FROM assessments 
    WHERE patient_id = patient_uuid
  );
END;
$$ LANGUAGE plpgsql; 