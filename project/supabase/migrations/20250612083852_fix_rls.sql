/*
  # Fix RLS policies for patients table

  1. Changes
    - Ensure RLS is enabled
    - Drop all existing policies
    - Create new policies for public access
*/

-- First, ensure RLS is enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public insert access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public update access to patients" ON patients;
DROP POLICY IF EXISTS "Physicians can read all patients" ON patients;
DROP POLICY IF EXISTS "Patients can read own records" ON patients;
DROP POLICY IF EXISTS "Physicians can insert patients" ON patients;
DROP POLICY IF EXISTS "Physicians can update patients" ON patients;
DROP POLICY IF EXISTS "Users can read all patients" ON patients;
DROP POLICY IF EXISTS "Users can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;

-- Create new policies for public access
CREATE POLICY "Allow public read access to patients"
  ON patients
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to patients"
  ON patients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to patients"
  ON patients
  FOR UPDATE
  USING (true); 