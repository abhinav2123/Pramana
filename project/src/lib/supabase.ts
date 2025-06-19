import { createClient } from '@supabase/supabase-js';
import { Patient, PatientFormData } from '../types/database';

// Ensure environment variables are properly formatted as URLs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const createPatient = async (patientData: Partial<PatientFormData>): Promise<Patient> => {
  // Transform the data to match the database schema
  const patientRecord = {
    name: patientData.name,
    dob: patientData.dob === '' ? null : patientData.dob,
    gender: patientData.gender,
    contact: patientData.contact || patientData.mobile,
    mobile: patientData.mobile,
    email: patientData.email,
    address: patientData.address,
    uhid: patientData.uhid,
    aadhaar_number: patientData.aadhaar_number,
    abha_id: patientData.abha_id,
    marital_status: patientData.marital_status,
    occupation: patientData.occupation,
    occupation_type: patientData.occupation_type,
    insurance_status: patientData.insurance_status || false,
    insurance_provider: patientData.insurance_provider,
    emergency_contact: patientData.emergency_contact,
    family_history: patientData.family_history
  };

  const { data, error } = await supabase
    .from('patients')
    .insert([patientRecord])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePatient = async (id: string, updates: Partial<PatientFormData>): Promise<Patient> => {
  // Transform the data to match the database schema
  const updateRecord = {
    name: updates.name,
    dob: updates.dob === '' ? null : updates.dob,
    gender: updates.gender,
    contact: updates.contact || updates.mobile,
    mobile: updates.mobile,
    email: updates.email,
    address: updates.address,
    uhid: updates.uhid,
    aadhaar_number: updates.aadhaar_number,
    abha_id: updates.abha_id,
    marital_status: updates.marital_status,
    occupation: updates.occupation,
    occupation_type: updates.occupation_type,
    insurance_status: updates.insurance_status,
    insurance_provider: updates.insurance_provider,
    emergency_contact: updates.emergency_contact,
    family_history: updates.family_history,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('patients')
    .update(updateRecord)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};