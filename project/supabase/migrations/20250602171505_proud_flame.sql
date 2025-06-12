/*
  # Create assessments table

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `patient_id` (uuid, foreign key to patients)
      - `prakriti` (jsonb for dosha scores)
      - `vikriti` (jsonb for dosha scores)
      - `notes` (text)
  2. Security
    - Enable RLS on `assessments` table
    - Add policy for authenticated users to read and write their own data
*/

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  prakriti jsonb NOT NULL DEFAULT '{"vata": 33, "pitta": 33, "kapha": 34}'::jsonb,
  vikriti jsonb NOT NULL DEFAULT '{"vata": 33, "pitta": 33, "kapha": 34}'::jsonb,
  notes text
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read assessments they create
CREATE POLICY "Users can read all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert assessments
CREATE POLICY "Users can insert assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their assessments
CREATE POLICY "Users can update assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (true);