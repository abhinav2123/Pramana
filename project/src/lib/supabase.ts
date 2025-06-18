import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are properly formatted as URLs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Patient = {
  id: string;
  created_at: string;
  name: string;
  dob?: string;
  gender?: string;
  contact?: string;
  email?: string;
  address?: string;
  uhid?: string;
  aadhaar_number?: string;
  abha_id?: string;
  marital_status?: string;
  occupation?: string;
  insurance_status?: boolean;
  insurance_provider?: string;
  preferred_physician?: string;
  emergency_contact?: string;
};

// API functions for patients
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getPatient = async (id: string): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> => {
  // Clean up the data before sending to Supabase
  const cleanedPatient = {
    ...patient,
    // Convert empty strings to null for date fields
    dob: patient.dob === '' ? null : patient.dob,
  };

  const { data, error } = await supabase
    .from('patients')
    .insert([cleanedPatient])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient> => {
  // Clean up the data before sending to Supabase
  const cleanedUpdates = {
    ...updates,
    // Convert empty strings to null for date fields
    dob: updates.dob === '' ? null : updates.dob,
  };

  const { data, error } = await supabase
    .from('patients')
    .update(cleanedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};