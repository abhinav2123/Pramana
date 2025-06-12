/*
  # Add medical information fields to patients table

  1. Changes
    - Add new columns to patients table for medical information
    - Update existing policies to handle new fields
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'uhid') THEN
    ALTER TABLE patients 
      ADD COLUMN uhid text,
      ADD COLUMN aadhaar_number text,
      ADD COLUMN abha_id text,
      ADD COLUMN marital_status text,
      ADD COLUMN occupation text,
      ADD COLUMN insurance_status boolean DEFAULT false,
      ADD COLUMN insurance_provider text,
      ADD COLUMN preferred_physician uuid REFERENCES auth.users(id),
      ADD COLUMN emergency_contact text;
  END IF;
END $$;