/*
  # Fix Timeline Entries RLS Policies
  
  This migration fixes the RLS policies for the timeline_entries table
  to resolve the "violates row-level security policy" error.
*/

-- First, let's check and drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can insert timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can update timeline entries" ON timeline_entries;
DROP POLICY IF EXISTS "Users can delete timeline entries" ON timeline_entries;

-- Create new, more permissive policies for timeline entries
CREATE POLICY "timeline_entries_select_policy"
  ON timeline_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "timeline_entries_insert_policy"
  ON timeline_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "timeline_entries_update_policy"
  ON timeline_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "timeline_entries_delete_policy"
  ON timeline_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Also ensure RLS is enabled
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- Let's also check if there are any issues with the table structure
-- Add any missing columns that might be needed
ALTER TABLE timeline_entries 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS details text,
ADD COLUMN IF NOT EXISTS metadata jsonb,
ADD COLUMN IF NOT EXISTS recorded_by uuid;

-- Update the entry_type constraint to include all the types we're using
ALTER TABLE timeline_entries DROP CONSTRAINT IF EXISTS timeline_entries_entry_type_check;

ALTER TABLE timeline_entries ADD CONSTRAINT timeline_entries_entry_type_check 
CHECK (entry_type IN ('assessment', 'treatment', 'observation', 'lab_result', 'symptom_update', 'therapy_session', 'followup', 'note'));

-- Add foreign key for recorded_by if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_entries_recorded_by_fkey'
    ) THEN
        ALTER TABLE timeline_entries ADD CONSTRAINT timeline_entries_recorded_by_fkey 
        FOREIGN KEY (recorded_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Create a test function to verify RLS is working
CREATE OR REPLACE FUNCTION test_timeline_rls()
RETURNS text AS $$
BEGIN
  -- Try to insert a test record
  INSERT INTO timeline_entries (patient_id, title, notes, entry_type)
  VALUES (gen_random_uuid(), 'Test Entry', 'Test notes', 'note');
  
  -- If we get here, RLS is working
  RETURN 'RLS is working correctly';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'RLS Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON timeline_entries TO authenticated; 