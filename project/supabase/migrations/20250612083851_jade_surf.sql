/*
  # Simplify database for patient records only

  1. Changes
    - Remove role-based policies
    - Simplify RLS policies for public access
    - Remove unused tables (assessments, treatments, timeline_entries)
  
  2. Security
    - Allow public read/write access to patients table for demo purposes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Physicians can read all patients" ON patients;
DROP POLICY IF EXISTS "Patients can read own records" ON patients;
DROP POLICY IF EXISTS "Physicians can insert patients" ON patients;
DROP POLICY IF EXISTS "Physicians can update patients" ON patients;

-- Create simple policies for public access
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

-- Drop unused tables if they exist
DROP TABLE IF EXISTS timeline_entries CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;

-- Drop the user role function as it's no longer needed
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;