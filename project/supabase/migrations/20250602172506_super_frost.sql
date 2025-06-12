/*
  # Add user roles and policies

  1. Changes
    - Add role column to auth.users
    - Add policies for different user roles
  
  2. Security
    - Ensure users can only access appropriate data based on their role
*/

-- Add role to auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Ensure role is set, default to 'patient' if not specified
  NEW.raw_user_meta_data := 
    COALESCE(NEW.raw_user_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'patient'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing policies to check roles
DROP POLICY IF EXISTS "Users can read all patients" ON patients;
DROP POLICY IF EXISTS "Users can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;

-- Physicians can read all patients
CREATE POLICY "Physicians can read all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Patients can only read their own records
CREATE POLICY "Patients can read own records"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'patient' AND
    id = auth.uid()
  );

-- Only physicians can insert patients
CREATE POLICY "Physicians can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Only physicians can update patients
CREATE POLICY "Physicians can update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Update assessment policies
DROP POLICY IF EXISTS "Users can read all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments" ON assessments;

CREATE POLICY "Physicians can manage assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Patients can read own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'patient' AND
    patient_id = auth.uid()
  );

-- Update treatment policies
DROP POLICY IF EXISTS "Users can read all treatments" ON treatments;
DROP POLICY IF EXISTS "Users can insert treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments" ON treatments;

CREATE POLICY "Physicians can manage treatments"
  ON treatments
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Patients can read own treatments"
  ON treatments
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'patient' AND
    patient_id = auth.uid()
  );

-- Update timeline policies
DROP POLICY IF EXISTS "Users can read all timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can insert timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can update timeline entries" ON timeline_entries;

CREATE POLICY "Physicians can manage timeline entries"
  ON timeline_entries
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'physician' OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Patients can read own timeline entries"
  ON timeline_entries
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'patient' AND
    patient_id = auth.uid()
  );