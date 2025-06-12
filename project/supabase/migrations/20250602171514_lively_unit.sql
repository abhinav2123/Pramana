/*
  # Create timeline entries table

  1. New Tables
    - `timeline_entries`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `patient_id` (uuid, foreign key to patients)
      - `notes` (text)
      - `entry_type` (text - assessment, treatment, followup, note)
      - `reference_id` (uuid - optional, links to the original record)
  2. Security
    - Enable RLS on `timeline_entries` table
    - Add policy for authenticated users to read and write their own data
*/

CREATE TABLE IF NOT EXISTS timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  notes text,
  entry_type text CHECK (entry_type IN ('assessment', 'treatment', 'followup', 'note')),
  reference_id uuid
);

ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read timeline entries they create
CREATE POLICY "Users can read all timeline entries"
  ON timeline_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert timeline entries
CREATE POLICY "Users can insert timeline entries"
  ON timeline_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their timeline entries
CREATE POLICY "Users can update timeline entries"
  ON timeline_entries
  FOR UPDATE
  TO authenticated
  USING (true);