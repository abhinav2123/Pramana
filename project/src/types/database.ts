// Enhanced Ayurvedic Database Schema TypeScript Interfaces

export interface Patient {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  contact?: string;
  mobile?: string;
  email?: string;
  address?: Address;
  uhid?: string;
  aadhaar_number?: string;
  abha_id?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  occupation?: string;
  occupation_type?: 'sedentary' | 'moderate' | 'heavy';
  insurance_status?: boolean;
  insurance_provider?: string;
  preferred_physician?: string;
  emergency_contact?: EmergencyContact;
  family_history?: string[];
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Assessment {
  id: string;
  created_at: string;
  patient_id: string;
  assessor_id?: string;
  prakriti: DoshaScores;
  vikriti: DoshaScores;
  nadi_pariksha?: string;
  jihva_pariksha?: string;
  akriti_pariksha?: string;
  srotas_analysis?: SrotasAnalysis;
  icd11_codes?: string[];
  lab_results?: LabResults;
  notes?: string;
}

export interface DoshaScores {
  vata: number; // non-negative integer
  pitta: number; // non-negative integer
  kapha: number; // non-negative integer
}

export interface SrotasAnalysis {
  pranavaha?: 'normal' | 'impaired' | 'blocked';
  annavaha?: 'normal' | 'impaired' | 'blocked';
  udakavaha?: 'normal' | 'impaired' | 'blocked';
  rasavaha?: 'normal' | 'impaired' | 'blocked';
  raktavaha?: 'normal' | 'impaired' | 'blocked';
  mamsavaha?: 'normal' | 'impaired' | 'blocked';
  medovaha?: 'normal' | 'impaired' | 'blocked';
  asthivaha?: 'normal' | 'impaired' | 'blocked';
  majjavaha?: 'normal' | 'impaired' | 'blocked';
  shukravaha?: 'normal' | 'impaired' | 'blocked';
  mutravaha?: 'normal' | 'impaired' | 'blocked';
  purishavaha?: 'normal' | 'impaired' | 'blocked';
  swedavaha?: 'normal' | 'impaired' | 'blocked';
  artavavaha?: 'normal' | 'impaired' | 'blocked';
  stanyavaha?: 'normal' | 'impaired' | 'blocked';
  manovaha?: 'normal' | 'impaired' | 'blocked';
}

export interface LabResults {
  blood_pressure?: string;
  blood_sugar?: string;
  cholesterol?: string;
  liver_function?: string;
  kidney_function?: string;
  thyroid_function?: string;
  other_tests?: Record<string, string>;
}

export interface Treatment {
  id: string;
  created_at: string;
  patient_id: string;
  assessment_id?: string;
  physician_id?: string;
  diagnosis?: string;
  primary_ayurvedic_diagnosis?: string;
  secondary_ayurvedic_diagnoses?: string[];
  icd11_diagnoses?: string[];
  herbs?: string;
  therapy?: string;
  shamana_therapy?: ShamanaTherapy;
  shodhana_therapy?: ShodhanaTherapy;
  rasayana_plan?: RasayanaPlan;
  diet?: string;
  diet_plan?: DietPlan;
  lifestyle?: string;
  lifestyle_recommendations?: LifestyleRecommendations;
  expected_timeline?: TreatmentTimeline;
  followup_schedule?: FollowupSchedule;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface ShamanaTherapy {
  internal_medicines?: string[];
  external_therapies?: string[];
  dosage_instructions?: string;
  duration?: string;
}

export interface ShodhanaTherapy {
  vamana?: string;
  virechana?: string;
  basti?: string;
  nasya?: string;
  raktamokshana?: string;
  preparation_phase?: string;
  main_phase?: string;
  post_phase?: string;
}

export interface RasayanaPlan {
  herbs?: string[];
  duration?: string;
  seasonal_considerations?: string;
  contraindications?: string[];
}

export interface DietPlan {
  foods_to_include?: string[];
  foods_to_avoid?: string[];
  meal_timing?: string;
  cooking_methods?: string[];
  special_instructions?: string;
}

export interface LifestyleRecommendations {
  daily_routine?: string;
  exercise?: string;
  stress_management?: string;
  sleep_hygiene?: string;
  seasonal_adaptations?: string;
}

export interface TreatmentTimeline {
  phases?: TreatmentPhase[];
  total_duration?: string;
  milestones?: string[];
}

export interface TreatmentPhase {
  duration: string;
  goals: string;
  activities: string[];
  expected_outcomes: string[];
}

export interface FollowupSchedule {
  frequency: string;
  next_visit?: string;
  assessments_required?: string[];
  lab_tests?: string[];
}

export interface TimelineEntry {
  id: string;
  created_at: string;
  patient_id: string;
  title?: string;
  notes?: string;
  details?: string;
  entry_type: 'assessment' | 'treatment' | 'observation' | 'lab_result' | 'symptom_update' | 'therapy_session' | 'followup' | 'note';
  reference_id?: string;
  metadata?: Record<string, any>;
  recorded_by?: string;
}

export interface DiseaseMapping {
  id: string;
  icd11_code: string;
  icd11_name: string;
  ayurvedic_name: string;
  ayurvedic_synonyms: string[];
  samprapti?: string;
  dosha_involvement: DoshaScores;
  primary_dosha: 'vata' | 'pitta' | 'kapha';
  classical_references?: ClassicalReferences;
  severity_classification?: string;
  modern_lab_correlations?: LabCorrelations;
  created_at: string;
  updated_at?: string;
}

export interface ClassicalReferences {
  charaka?: string;
  sushruta?: string;
  vagbhata?: string;
  madhava?: string;
  bhavaprakash?: string;
  yogaratnakara?: string;
  ashtanga?: string;
}

export interface LabCorrelations {
  blood_tests?: Record<string, string>;
  imaging?: Record<string, string>;
  other_investigations?: Record<string, string>;
}

export interface AyurvedicHerb {
  id: string;
  sanskrit_name: string;
  hindi_name: string;
  malayalam_name: string;
  common_name: string;
  latin_name: string;
  primary_dosha_effect: 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha' | 'tridoshic';
  secondary_effects?: Record<string, any>;
  rasa: string[];
  virya: 'ushna' | 'shita' | 'variable';
  vipaka?: string;
  prabhava?: string;
  indications: string[];
  contraindications: string[];
  modern_research?: Record<string, any>;
  standard_dosage: string;
  herb_drug_interactions?: DrugInteraction[];
  created_at: string;
  updated_at?: string;
}

export interface DrugInteraction {
  drug_class: string;
  effect: string;
  severity: 'low' | 'moderate' | 'high';
  recommendations?: string;
}

// Database Views and Functions
export interface PatientDoshaImbalance {
  id: string;
  name: string;
  vata_imbalance: number;
  pitta_imbalance: number;
  kapha_imbalance: number;
  assessment_date: string;
}

export interface PatientDoshaAnalysis {
  patient_name: string;
  prakriti_vata: number;
  prakriti_pitta: number;
  prakriti_kapha: number;
  vikriti_vata: number;
  vikriti_pitta: number;
  vikriti_kapha: number;
  vata_imbalance: number;
  pitta_imbalance: number;
  kapha_imbalance: number;
  primary_imbalance: 'vata' | 'pitta' | 'kapha';
  assessment_date: string;
}

export interface HerbSearchResult {
  sanskrit_name: string;
  hindi_name: string;
  malayalam_name: string;
  common_name: string;
  primary_dosha_effect: string;
  indications: string[];
  contraindications: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface PatientFormData {
  name: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  address?: Address;
  uhid?: string;
  aadhaar_number?: string;
  abha_id?: string;
  marital_status?: string;
  occupation?: string;
  occupation_type?: string;
  insurance_status?: boolean;
  insurance_provider?: string;
  emergency_contact?: EmergencyContact;
  family_history?: string[];
}

export interface AssessmentFormData {
  patient_id: string;
  prakriti: DoshaScores;
  vikriti: DoshaScores;
  nadi_pariksha?: string;
  jihva_pariksha?: string;
  akriti_pariksha?: string;
  srotas_analysis?: SrotasAnalysis;
  icd11_codes?: string[];
  lab_results?: LabResults;
  notes?: string;
}

export interface TreatmentFormData {
  patient_id: string;
  assessment_id?: string;
  primary_ayurvedic_diagnosis?: string;
  secondary_ayurvedic_diagnoses?: string[];
  icd11_diagnoses?: string[];
  shamana_therapy?: ShamanaTherapy;
  shodhana_therapy?: ShodhanaTherapy;
  rasayana_plan?: RasayanaPlan;
  diet_plan?: DietPlan;
  lifestyle_recommendations?: LifestyleRecommendations;
  expected_timeline?: TreatmentTimeline;
  followup_schedule?: FollowupSchedule;
  status?: string;
}

// Utility Types
export type DoshaType = 'vata' | 'pitta' | 'kapha';
export type EntryType = 'assessment' | 'treatment' | 'observation' | 'lab_result' | 'symptom_update' | 'therapy_session' | 'followup' | 'note';
export type TreatmentStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type OccupationType = 'sedentary' | 'moderate' | 'heavy';
export type Virya = 'ushna' | 'shita' | 'variable';
export type DoshaEffect = 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha' | 'tridoshic';
export type InteractionSeverity = 'low' | 'moderate' | 'high'; 