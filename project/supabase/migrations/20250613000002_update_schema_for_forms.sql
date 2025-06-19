/*
  # Update Schema for Current Form Inputs
  
  This migration updates the database schema to match the current form inputs:
  1. Update treatments table to match TreatmentFormData interface
  2. Update assessments table to match AssessmentFormData interface
  3. Update timeline_entries table to match TimelineEntry interface
  4. Add missing columns and constraints
*/

-- 1. Update treatments table to match TreatmentFormData interface
-- Remove old simple text columns that are now replaced by structured JSONB
ALTER TABLE treatments 
DROP COLUMN IF EXISTS diagnosis,
DROP COLUMN IF EXISTS herbs,
DROP COLUMN IF EXISTS therapy,
DROP COLUMN IF EXISTS diet,
DROP COLUMN IF EXISTS lifestyle;

-- Add missing columns for TreatmentFormData
ALTER TABLE treatments 
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
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- Add constraints for treatments
DO $$ 
BEGIN
    -- Add status constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'treatments_status_check'
    ) THEN
        ALTER TABLE treatments ADD CONSTRAINT treatments_status_check 
        CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));
    END IF;

    -- Add foreign keys if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'treatments_assessment_id_fkey'
    ) THEN
        ALTER TABLE treatments ADD CONSTRAINT treatments_assessment_id_fkey 
        FOREIGN KEY (assessment_id) REFERENCES assessments(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'treatments_physician_id_fkey'
    ) THEN
        ALTER TABLE treatments ADD CONSTRAINT treatments_physician_id_fkey 
        FOREIGN KEY (physician_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Update assessments table to match AssessmentFormData interface
-- Add missing columns for AssessmentFormData
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS assessor_id uuid,
ADD COLUMN IF NOT EXISTS nadi_pariksha text,
ADD COLUMN IF NOT EXISTS jihva_pariksha text,
ADD COLUMN IF NOT EXISTS akriti_pariksha text,
ADD COLUMN IF NOT EXISTS srotas_analysis jsonb,
ADD COLUMN IF NOT EXISTS icd11_codes text[],
ADD COLUMN IF NOT EXISTS lab_results jsonb;

-- Add constraints for assessments
DO $$ 
BEGIN
    -- Add assessor_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assessments_assessor_id_fkey'
    ) THEN
        ALTER TABLE assessments ADD CONSTRAINT assessments_assessor_id_fkey 
        FOREIGN KEY (assessor_id) REFERENCES auth.users(id);
    END IF;

    -- Add prakriti validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_prakriti'
    ) THEN
        ALTER TABLE assessments ADD CONSTRAINT valid_prakriti 
        CHECK (
          (prakriti->>'vata')::integer + 
          (prakriti->>'pitta')::integer + 
          (prakriti->>'kapha')::integer = 100
        );
    END IF;

    -- Add vikriti validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_vikriti'
    ) THEN
        ALTER TABLE assessments ADD CONSTRAINT valid_vikriti 
        CHECK (
          (vikriti->>'vata')::integer + 
          (vikriti->>'pitta')::integer + 
          (vikriti->>'kapha')::integer = 100
        );
    END IF;
END $$;

-- 3. Update timeline_entries table to match TimelineEntry interface
-- Add missing columns for TimelineEntry
ALTER TABLE timeline_entries 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS details text,
ADD COLUMN IF NOT EXISTS entry_type text DEFAULT 'note',
ADD COLUMN IF NOT EXISTS reference_id uuid,
ADD COLUMN IF NOT EXISTS metadata jsonb,
ADD COLUMN IF NOT EXISTS recorded_by uuid;

-- Add constraints for timeline_entries
DO $$ 
BEGIN
    -- Add entry_type constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'timeline_entries_entry_type_check'
    ) THEN
        ALTER TABLE timeline_entries ADD CONSTRAINT timeline_entries_entry_type_check 
        CHECK (entry_type IN ('assessment', 'treatment', 'observation', 'lab_result', 'symptom_update', 'therapy_session', 'followup', 'note'));
    END IF;

    -- Add recorded_by foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_entries_recorded_by_fkey'
    ) THEN
        ALTER TABLE timeline_entries ADD CONSTRAINT timeline_entries_recorded_by_fkey 
        FOREIGN KEY (recorded_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
CREATE INDEX IF NOT EXISTS idx_treatments_primary_diagnosis ON treatments(primary_ayurvedic_diagnosis);
CREATE INDEX IF NOT EXISTS idx_assessments_icd11_codes ON assessments USING GIN(icd11_codes);
CREATE INDEX IF NOT EXISTS idx_timeline_entries_type ON timeline_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_timeline_entries_reference ON timeline_entries(reference_id);

-- 5. Add RLS policies for new columns
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can read all treatments" ON treatments;
DROP POLICY IF EXISTS "Users can insert treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments" ON treatments;

DROP POLICY IF EXISTS "Users can read all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments" ON assessments;

DROP POLICY IF EXISTS "Users can read all timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can insert timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can update timeline entries" ON timeline_entries;

-- Treatments policies
CREATE POLICY "Users can read all treatments"
  ON treatments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert treatments"
  ON treatments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update treatments"
  ON treatments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Assessments policies
CREATE POLICY "Users can read all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Timeline entries policies
CREATE POLICY "Users can read all timeline entries"
  ON timeline_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert timeline entries"
  ON timeline_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update timeline entries"
  ON timeline_entries
  FOR UPDATE
  TO authenticated
  USING (true);

-- 6. Create functions for common operations
-- Function to get treatment with all related data
CREATE OR REPLACE FUNCTION get_treatment_with_details(treatment_uuid uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  patient_id uuid,
  assessment_id uuid,
  physician_id uuid,
  primary_ayurvedic_diagnosis text,
  secondary_ayurvedic_diagnoses text[],
  icd11_diagnoses text[],
  shamana_therapy jsonb,
  shodhana_therapy jsonb,
  rasayana_plan jsonb,
  diet_plan jsonb,
  lifestyle_recommendations jsonb,
  expected_timeline jsonb,
  followup_schedule jsonb,
  status text,
  patient_name text,
  assessment_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.created_at,
    t.patient_id,
    t.assessment_id,
    t.physician_id,
    t.primary_ayurvedic_diagnosis,
    t.secondary_ayurvedic_diagnoses,
    t.icd11_diagnoses,
    t.shamana_therapy,
    t.shodhana_therapy,
    t.rasayana_plan,
    t.diet_plan,
    t.lifestyle_recommendations,
    t.expected_timeline,
    t.followup_schedule,
    t.status,
    p.name as patient_name,
    a.created_at as assessment_date
  FROM treatments t
  LEFT JOIN patients p ON t.patient_id = p.id
  LEFT JOIN assessments a ON t.assessment_id = a.id
  WHERE t.id = treatment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assessment with patient details
CREATE OR REPLACE FUNCTION get_assessment_with_details(assessment_uuid uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  patient_id uuid,
  assessor_id uuid,
  prakriti jsonb,
  vikriti jsonb,
  nadi_pariksha text,
  jihva_pariksha text,
  akriti_pariksha text,
  srotas_analysis jsonb,
  icd11_codes text[],
  lab_results jsonb,
  notes text,
  patient_name text,
  patient_dob date,
  patient_gender text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.created_at,
    a.patient_id,
    a.assessor_id,
    a.prakriti,
    a.vikriti,
    a.nadi_pariksha,
    a.jihva_pariksha,
    a.akriti_pariksha,
    a.srotas_analysis,
    a.icd11_codes,
    a.lab_results,
    a.notes,
    p.name as patient_name,
    p.dob as patient_dob,
    p.gender as patient_gender
  FROM assessments a
  LEFT JOIN patients p ON a.patient_id = p.id
  WHERE a.id = assessment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get timeline entries with patient details
CREATE OR REPLACE FUNCTION get_timeline_entries_with_details(patient_uuid uuid, limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  patient_id uuid,
  title text,
  notes text,
  details text,
  entry_type text,
  reference_id uuid,
  metadata jsonb,
  recorded_by uuid,
  patient_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.created_at,
    t.patient_id,
    t.title,
    t.notes,
    t.details,
    t.entry_type,
    t.reference_id,
    t.metadata,
    t.recorded_by,
    p.name as patient_name
  FROM timeline_entries t
  LEFT JOIN patients p ON t.patient_id = p.id
  WHERE t.patient_id = patient_uuid
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update materialized views to include new fields
DROP MATERIALIZED VIEW IF EXISTS patient_dosha_imbalances;

CREATE MATERIALIZED VIEW patient_dosha_imbalances AS
SELECT 
  p.id,
  p.name,
  COALESCE((a.vikriti->>'vata')::integer - (a.prakriti->>'vata')::integer, 0) as vata_imbalance,
  COALESCE((a.vikriti->>'pitta')::integer - (a.prakriti->>'pitta')::integer, 0) as pitta_imbalance,
  COALESCE((a.vikriti->>'kapha')::integer - (a.prakriti->>'kapha')::integer, 0) as kapha_imbalance,
  a.created_at as assessment_date
FROM patients p
LEFT JOIN LATERAL (
  SELECT * FROM assessments 
  WHERE patient_id = p.id 
  ORDER BY created_at DESC 
  LIMIT 1
) a ON true;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_dosha_imbalances_id ON patient_dosha_imbalances(id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION trigger_refresh_dosha_imbalances()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY patient_dosha_imbalances;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for materialized view refresh
DROP TRIGGER IF EXISTS refresh_dosha_imbalances_trigger ON assessments;
CREATE TRIGGER refresh_dosha_imbalances_trigger
  AFTER INSERT OR UPDATE OR DELETE ON assessments
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_dosha_imbalances();

-- 8. Add comments for documentation
COMMENT ON TABLE treatments IS 'Enhanced treatments table with structured Ayurvedic therapy protocols';
COMMENT ON TABLE assessments IS 'Enhanced assessments table with detailed Ayurvedic examination fields';
COMMENT ON TABLE timeline_entries IS 'Enhanced timeline entries for comprehensive patient history tracking';

COMMENT ON COLUMN treatments.primary_ayurvedic_diagnosis IS 'Primary Ayurvedic diagnosis in Sanskrit/Hindi';
COMMENT ON COLUMN treatments.shamana_therapy IS 'JSONB object containing internal medicines, external therapies, dosage, and duration';
COMMENT ON COLUMN treatments.shodhana_therapy IS 'JSONB object containing panchakarma procedures and phases';
COMMENT ON COLUMN treatments.diet_plan IS 'JSONB object containing foods to include/avoid, meal timing, and cooking methods';
COMMENT ON COLUMN treatments.followup_schedule IS 'JSONB object containing frequency, next visit, and required assessments';

COMMENT ON COLUMN assessments.nadi_pariksha IS 'Pulse examination findings';
COMMENT ON COLUMN assessments.jihva_pariksha IS 'Tongue examination findings';
COMMENT ON COLUMN assessments.akriti_pariksha IS 'General appearance examination findings';
COMMENT ON COLUMN assessments.srotas_analysis IS 'JSONB object containing analysis of all 13 srotas (channels)';

COMMENT ON COLUMN timeline_entries.entry_type IS 'Type of timeline entry: assessment, treatment, observation, lab_result, symptom_update, therapy_session, followup, note';
COMMENT ON COLUMN timeline_entries.metadata IS 'Additional structured data specific to the entry type'; 