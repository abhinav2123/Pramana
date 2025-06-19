import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Stethoscope, Leaf, Utensils, Heart, Calendar, Plus, Minus } from 'lucide-react';
import { TreatmentFormData } from '../../types/database';
import { enhancedApiService } from '../../lib/enhanced-api-service';
import { toast } from 'sonner';

interface TreatmentFormProps {
  patientId: string;
  patientName: string;
  assessmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ patientId, patientName, assessmentId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TreatmentFormData>({
    patient_id: patientId,
    assessment_id: assessmentId,
    primary_ayurvedic_diagnosis: '',
    secondary_ayurvedic_diagnoses: [],
    icd11_diagnoses: [],
    shamana_therapy: {
      internal_medicines: [],
      external_therapies: [],
      dosage_instructions: '',
      duration: ''
    },
    shodhana_therapy: {
      vamana: '',
      virechana: '',
      basti: '',
      nasya: '',
      raktamokshana: '',
      preparation_phase: '',
      main_phase: '',
      post_phase: ''
    },
    rasayana_plan: {
      herbs: [],
      duration: '',
      seasonal_considerations: '',
      contraindications: []
    },
    diet_plan: {
      foods_to_include: [],
      foods_to_avoid: [],
      meal_timing: '',
      cooking_methods: [],
      special_instructions: ''
    },
    lifestyle_recommendations: {
      daily_routine: '',
      exercise: '',
      stress_management: '',
      sleep_hygiene: '',
      seasonal_adaptations: ''
    },
    expected_timeline: {
      phases: [],
      total_duration: '',
      milestones: []
    },
    followup_schedule: {
      frequency: '',
      next_visit: '',
      assessments_required: [],
      lab_tests: []
    },
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await enhancedApiService.createTreatment(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Treatment created successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create treatment');
      console.error('Error creating treatment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [objectName, fieldName] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [objectName]: {
          ...prev[objectName as keyof TreatmentFormData],
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Function to add item to nested array
  const addNestedArrayItem = (objectName: string, arrayField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [objectName]: {
        ...prev[objectName as keyof TreatmentFormData],
        [arrayField]: [...(prev[objectName as keyof TreatmentFormData] as any)[arrayField] || [], value]
      }
    }));
  };

  // Function to remove item from nested array
  const removeNestedArrayItem = (objectName: string, arrayField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [objectName]: {
        ...prev[objectName as keyof TreatmentFormData],
        [arrayField]: (prev[objectName as keyof TreatmentFormData] as any)[arrayField]?.filter((_: any, i: number) => i !== index) || []
      }
    }));
  };

  // Function to update item in nested array
  const updateNestedArrayItem = (objectName: string, arrayField: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [objectName]: {
        ...prev[objectName as keyof TreatmentFormData],
        [arrayField]: (prev[objectName as keyof TreatmentFormData] as any)[arrayField]?.map((item: any, i: number) => i === index ? value : item) || []
      }
    }));
  };

  // Function to add item to top-level array
  const addArrayItem = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof TreatmentFormData] as string[] || []), value]
    }));
  };

  // Function to remove item from top-level array
  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof TreatmentFormData] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  // Function to update item in top-level array
  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof TreatmentFormData] as string[] || []).map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="h-6 w-6 mr-2" />
              New Treatment for {patientName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Diagnosis */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Ayurvedic Diagnosis *
                  </label>
                  <input
                    type="text"
                    name="primary_ayurvedic_diagnosis"
                    value={formData.primary_ayurvedic_diagnosis}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="Enter primary Ayurvedic diagnosis"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Diagnoses
                  </label>
                  <div className="space-y-2">
                    {formData.secondary_ayurvedic_diagnoses?.map((diagnosis, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={diagnosis}
                          onChange={(e) => updateArrayItem('secondary_ayurvedic_diagnoses', index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter secondary diagnosis"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('secondary_ayurvedic_diagnoses', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('secondary_ayurvedic_diagnoses', '')}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Secondary Diagnosis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shamana Therapy */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Leaf className="h-5 w-5 mr-2" />
                Shamana Therapy (Palliative Treatment)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Medicines
                  </label>
                  <div className="space-y-2">
                    {formData.shamana_therapy?.internal_medicines?.map((medicine, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={medicine}
                          onChange={(e) => updateNestedArrayItem('shamana_therapy', 'internal_medicines', index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter medicine name"
                        />
                        <button
                          type="button"
                          onClick={() => removeNestedArrayItem('shamana_therapy', 'internal_medicines', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem('shamana_therapy', 'internal_medicines', '')}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medicine
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External Therapies
                  </label>
                  <div className="space-y-2">
                    {formData.shamana_therapy?.external_therapies?.map((therapy, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={therapy}
                          onChange={(e) => updateNestedArrayItem('shamana_therapy', 'external_therapies', index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter therapy name"
                        />
                        <button
                          type="button"
                          onClick={() => removeNestedArrayItem('shamana_therapy', 'external_therapies', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem('shamana_therapy', 'external_therapies', '')}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Therapy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage Instructions
                  </label>
                  <textarea
                    name="shamana_therapy.dosage_instructions"
                    value={formData.shamana_therapy?.dosage_instructions}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Enter dosage instructions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="shamana_therapy.duration"
                    value={formData.shamana_therapy?.duration}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., 30 days, 3 months"
                  />
                </div>
              </div>
            </div>

            {/* Diet Plan */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Utensils className="h-5 w-5 mr-2" />
                Diet Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foods to Include
                  </label>
                  <div className="space-y-2">
                    {formData.diet_plan?.foods_to_include?.map((food, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={food}
                          onChange={(e) => updateNestedArrayItem('diet_plan', 'foods_to_include', index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter food item"
                        />
                        <button
                          type="button"
                          onClick={() => removeNestedArrayItem('diet_plan', 'foods_to_include', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem('diet_plan', 'foods_to_include', '')}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Food
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foods to Avoid
                  </label>
                  <div className="space-y-2">
                    {formData.diet_plan?.foods_to_avoid?.map((food, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={food}
                          onChange={(e) => updateNestedArrayItem('diet_plan', 'foods_to_avoid', index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter food item"
                        />
                        <button
                          type="button"
                          onClick={() => removeNestedArrayItem('diet_plan', 'foods_to_avoid', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem('diet_plan', 'foods_to_avoid', '')}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Food
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="diet_plan.special_instructions"
                  value={formData.diet_plan?.special_instructions}
                  onChange={handleChange}
                  className="input w-full"
                  rows={3}
                  placeholder="Enter special dietary instructions..."
                />
              </div>
            </div>

            {/* Lifestyle Recommendations */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Lifestyle Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Routine
                  </label>
                  <textarea
                    name="lifestyle_recommendations.daily_routine"
                    value={formData.lifestyle_recommendations?.daily_routine}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Enter daily routine recommendations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise
                  </label>
                  <textarea
                    name="lifestyle_recommendations.exercise"
                    value={formData.lifestyle_recommendations?.exercise}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Enter exercise recommendations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stress Management
                  </label>
                  <textarea
                    name="lifestyle_recommendations.stress_management"
                    value={formData.lifestyle_recommendations?.stress_management}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Enter stress management techniques..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Hygiene
                  </label>
                  <textarea
                    name="lifestyle_recommendations.sleep_hygiene"
                    value={formData.lifestyle_recommendations?.sleep_hygiene}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Enter sleep hygiene recommendations..."
                  />
                </div>
              </div>
            </div>

            {/* Follow-up Schedule */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Follow-up Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Frequency
                  </label>
                  <input
                    type="text"
                    name="followup_schedule.frequency"
                    value={formData.followup_schedule?.frequency}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., Weekly, Monthly, Every 2 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Visit Date
                  </label>
                  <input
                    type="date"
                    name="followup_schedule.next_visit"
                    value={formData.followup_schedule?.next_visit}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Treatment Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Status</h3>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input w-full md:w-1/3"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Treatment'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TreatmentForm; 