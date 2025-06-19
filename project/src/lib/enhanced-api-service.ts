import { supabase } from './supabase';
import type {
  Patient,
  Assessment,
  Treatment,
  TimelineEntry,
  DiseaseMapping,
  AyurvedicHerb,
  PatientDoshaAnalysis,
  HerbSearchResult,
  PatientFormData,
  AssessmentFormData,
  TreatmentFormData,
  ApiResponse,
  PaginatedResponse
} from '../types/database';

export class EnhancedAyurvedicApiService {
  
  // ===== PATIENT MANAGEMENT =====
  
  async createPatient(patientData: PatientFormData): Promise<ApiResponse<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  async getPatients(page = 1, limit = 10): Promise<PaginatedResponse<Patient>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    } catch (error) {
      return { data: [], total: 0, page, limit, hasMore: false };
    }
  }

  async getPatientById(id: string): Promise<ApiResponse<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${query}%,uhid.ilike.%${query}%,aadhaar_number.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  // ===== ASSESSMENT MANAGEMENT =====

  async createAssessment(assessmentData: AssessmentFormData): Promise<ApiResponse<Assessment>> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  async getPatientAssessments(patientId: string): Promise<ApiResponse<Assessment[]>> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async getPatientDoshaAnalysis(patientId: string): Promise<ApiResponse<PatientDoshaAnalysis>> {
    try {
      const { data, error } = await supabase
        .rpc('get_patient_dosha_analysis', { patient_uuid: patientId });

      if (error) throw error;
      return { data: data[0] };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  // ===== TREATMENT MANAGEMENT =====

  async createTreatment(treatmentData: TreatmentFormData): Promise<ApiResponse<Treatment>> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .insert([treatmentData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  async getPatientTreatments(patientId: string): Promise<ApiResponse<Treatment[]>> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async updateTreatmentStatus(treatmentId: string, status: string): Promise<ApiResponse<Treatment>> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .update({ status })
        .eq('id', treatmentId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  // ===== DISEASE MAPPINGS =====

  async getDiseaseMappings(): Promise<ApiResponse<DiseaseMapping[]>> {
    try {
      const { data, error } = await supabase
        .from('disease_mappings')
        .select('*')
        .order('icd11_name');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async searchDiseaseMappings(query: string): Promise<ApiResponse<DiseaseMapping[]>> {
    try {
      const { data, error } = await supabase
        .from('disease_mappings')
        .select('*')
        .or(`icd11_name.ilike.%${query}%,ayurvedic_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async getDiseaseByICD11(icd11Code: string): Promise<ApiResponse<DiseaseMapping>> {
    try {
      const { data, error } = await supabase
        .from('disease_mappings')
        .select('*')
        .eq('icd11_code', icd11Code)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  // ===== AYURVEDIC HERBS =====

  async getAyurvedicHerbs(): Promise<ApiResponse<AyurvedicHerb[]>> {
    try {
      const { data, error } = await supabase
        .from('ayurvedic_herbs')
        .select('*')
        .order('sanskrit_name');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async searchHerbsByIndication(indication: string): Promise<ApiResponse<HerbSearchResult[]>> {
    try {
      const { data, error } = await supabase
        .rpc('search_herbs_by_indication', { search_term: indication });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async searchHerbs(query: string): Promise<ApiResponse<AyurvedicHerb[]>> {
    try {
      const { data, error } = await supabase
        .from('ayurvedic_herbs')
        .select('*')
        .or(`sanskrit_name.ilike.%${query}%,hindi_name.ilike.%${query}%,common_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async getHerbsByDosha(dosha: string): Promise<ApiResponse<AyurvedicHerb[]>> {
    try {
      const { data, error } = await supabase
        .from('ayurvedic_herbs')
        .select('*')
        .eq('primary_dosha_effect', dosha)
        .order('sanskrit_name');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  // ===== TIMELINE MANAGEMENT =====

  async createTimelineEntry(entry: Partial<TimelineEntry>): Promise<ApiResponse<TimelineEntry>> {
    try {
      const { data, error } = await supabase
        .from('timeline_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  async getPatientTimeline(patientId: string): Promise<ApiResponse<TimelineEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('timeline_entries')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  // ===== ANALYTICS & DASHBOARD =====

  async getDoshaImbalances(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('patient_dosha_imbalances')
        .select('*')
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async getPatientStats(patientId: string): Promise<ApiResponse<any>> {
    try {
      // Get patient with assessment and treatment counts
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Get assessment count
      const { count: assessmentCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId);

      // Get treatment count
      const { count: treatmentCount } = await supabase
        .from('treatments')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId);

      // Get timeline entry count
      const { count: timelineCount } = await supabase
        .from('timeline_entries')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId);

      return {
        data: {
          patient,
          stats: {
            assessments: assessmentCount || 0,
            treatments: treatmentCount || 0,
            timeline_entries: timelineCount || 0
          }
        }
      };
    } catch (error) {
      return { data: null as any, error: error.message };
    }
  }

  // ===== FULL-TEXT SEARCH =====

  async fullTextSearchHerbs(query: string): Promise<ApiResponse<AyurvedicHerb[]>> {
    try {
      const { data, error } = await supabase
        .from('ayurvedic_herbs')
        .select('*')
        .textSearch('sanskrit_name', query)
        .limit(20);

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async fullTextSearchDiseases(query: string): Promise<ApiResponse<DiseaseMapping[]>> {
    try {
      const { data, error } = await supabase
        .from('disease_mappings')
        .select('*')
        .textSearch('icd11_name', query)
        .limit(20);

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  // ===== UTILITY FUNCTIONS =====

  async refreshDoshaImbalances(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .rpc('refresh_dosha_imbalances');

      if (error) throw error;
      return { data: undefined };
    } catch (error) {
      return { data: undefined, error: error.message };
    }
  }

  // ===== BULK OPERATIONS =====

  async bulkCreatePatients(patients: PatientFormData[]): Promise<ApiResponse<Patient[]>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patients)
        .select();

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  async bulkCreateAssessments(assessments: AssessmentFormData[]): Promise<ApiResponse<Assessment[]>> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert(assessments)
        .select();

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedAyurvedicApiService();

// Export individual functions for convenience
export const {
  createPatient,
  getPatients,
  getPatientById,
  searchPatients,
  createAssessment,
  getPatientAssessments,
  getPatientDoshaAnalysis,
  createTreatment,
  getPatientTreatments,
  updateTreatmentStatus,
  getDiseaseMappings,
  searchDiseaseMappings,
  getDiseaseByICD11,
  getAyurvedicHerbs,
  searchHerbsByIndication,
  searchHerbs,
  getHerbsByDosha,
  createTimelineEntry,
  getPatientTimeline,
  getDoshaImbalances,
  getPatientStats,
  fullTextSearchHerbs,
  fullTextSearchDiseases,
  refreshDoshaImbalances,
  bulkCreatePatients,
  bulkCreateAssessments
} = enhancedApiService; 