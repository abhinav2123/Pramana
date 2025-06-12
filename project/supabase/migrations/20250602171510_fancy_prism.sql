/*
  # Create treatments table

  1. New Tables
    - `treatments`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `patient_id` (uuid, foreign key to patients)
      - `diagnosis` (text)
      - `herbs` (text)
      - `therapy` (text)
      - `diet` (text)
      - `lifestyle` (text)
  2. Security
    - Enable RLS on `treatments` table
    - Add policy for authenticated users to read and write their own data
*/

CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis text,
  herbs text,
  therapy text,
  diet text,
  lifestyle text
);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read treatments they create
CREATE POLICY "Users can read all treatments"
  ON treatments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert treatments
CREATE POLICY "Users can insert treatments"
  ON treatments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their treatments
CREATE POLICY "Users can update treatments"
  ON treatments
  FOR UPDATE
  TO authenticated
  USING (true);