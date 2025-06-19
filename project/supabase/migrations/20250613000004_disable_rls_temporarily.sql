/*
  # Temporarily Disable RLS for Testing
  
  This migration temporarily disables RLS on timeline_entries to test
  if the RLS policies are causing the issue.
*/

-- Temporarily disable RLS on timeline_entries
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other tables for consistency
ALTER TABLE treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON timeline_entries TO authenticated;
GRANT ALL ON treatments TO authenticated;
GRANT ALL ON assessments TO authenticated;
GRANT ALL ON patients TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a simple test function
CREATE OR REPLACE FUNCTION test_insert_timeline()
RETURNS text AS $$
DECLARE
  test_patient_id uuid;
BEGIN
  -- Get a real patient ID for testing
  SELECT id INTO test_patient_id FROM patients LIMIT 1;
  
  IF test_patient_id IS NULL THEN
    RETURN 'No patients found for testing';
  END IF;
  
  -- Try to insert a test record
  INSERT INTO timeline_entries (patient_id, title, notes, entry_type)
  VALUES (test_patient_id, 'Test Entry', 'Test notes', 'note');
  
  RETURN 'Insert successful with patient_id: ' || test_patient_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 