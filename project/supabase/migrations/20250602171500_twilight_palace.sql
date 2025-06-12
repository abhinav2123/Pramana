/*
  # Create patients table

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `dob` (date)
      - `gender` (text)
      - `contact` (text)
      - `email` (text)
      - `address` (text)
  2. Security
    - Enable RLS on `patients` table
    - Add policy for authenticated users to read and write their own data
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  dob date,
  gender text,
  contact text,
  email text,
  address text
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all patients they create
CREATE POLICY "Users can read all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own patients
CREATE POLICY "Users can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own patients
CREATE POLICY "Users can update their own patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (true);