import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Brain, FileText, Plus, Minus } from 'lucide-react';
import { AssessmentFormData, DoshaScores } from '../../types/database';
import { enhancedApiService } from '../../lib/enhanced-api-service';
import { toast } from 'sonner';

interface AssessmentFormProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ patientId, patientName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData>({
    patient_id: patientId,
    prakriti: { vata: 0, pitta: 0, kapha: 0 },
    vikriti: { vata: 0, pitta: 0, kapha: 0 },
    nadi_pariksha: '',
    jihva_pariksha: '',
    akriti_pariksha: '',
    icd11_codes: [],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await enhancedApiService.createAssessment(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Assessment created successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create assessment');
      console.error('Error creating assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDoshaScores = (type: 'prakriti' | 'vikriti', dosha: keyof DoshaScores, value: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [dosha]: Math.max(0, value)
      }
    }));
  };

  const addICD11Code = () => {
    setFormData(prev => ({
      ...prev,
      icd11_codes: [...(prev.icd11_codes || []), '']
    }));
  };

  const updateICD11Code = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      icd11_codes: prev.icd11_codes?.map((code, i) => i === index ? value : code) || []
    }));
  };

  const removeICD11Code = (index: number) => {
    setFormData(prev => ({
      ...prev,
      icd11_codes: prev.icd11_codes?.filter((_, i) => i !== index) || []
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-2" />
              New Assessment for {patientName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dosha Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prakriti */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Prakriti (Constitution)
                </h3>
                <div className="space-y-4">
                  {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
                    <div key={dosha}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {dosha} Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.prakriti[dosha]}
                        onChange={(e) => updateDoshaScores('prakriti', dosha, parseInt(e.target.value) || 0)}
                        className="input w-full"
                        placeholder={`Enter ${dosha} score`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Vikriti */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Vikriti (Current Imbalance)
                </h3>
                <div className="space-y-4">
                  {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
                    <div key={dosha}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {dosha} Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.vikriti[dosha]}
                        onChange={(e) => updateDoshaScores('vikriti', dosha, parseInt(e.target.value) || 0)}
                        className="input w-full"
                        placeholder={`Enter ${dosha} score`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pariksha Results */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pariksha Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nadi Pariksha
                  </label>
                  <textarea
                    name="nadi_pariksha"
                    value={formData.nadi_pariksha}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Pulse examination findings..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jihva Pariksha
                  </label>
                  <textarea
                    name="jihva_pariksha"
                    value={formData.jihva_pariksha}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Tongue examination findings..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akriti Pariksha
                  </label>
                  <textarea
                    name="akriti_pariksha"
                    value={formData.akriti_pariksha}
                    onChange={handleChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Physical examination findings..."
                  />
                </div>
              </div>
            </div>

            {/* ICD-11 Codes */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ICD-11 Diagnoses</h3>
                <button
                  type="button"
                  onClick={addICD11Code}
                  className="btn btn-outline btn-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Code
                </button>
              </div>
              <div className="space-y-3">
                {formData.icd11_codes?.map((code, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => updateICD11Code(index, e.target.value)}
                      className="input flex-1"
                      placeholder="Enter ICD-11 code (e.g., 6A02.0)"
                    />
                    <button
                      type="button"
                      onClick={() => removeICD11Code(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {(!formData.icd11_codes || formData.icd11_codes.length === 0) && (
                  <p className="text-gray-500 text-sm">No ICD-11 codes added yet</p>
                )}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Clinical Notes
              </h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input w-full"
                rows={6}
                placeholder="Enter detailed clinical observations, findings, and recommendations..."
              />
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
                {loading ? 'Creating...' : 'Create Assessment'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssessmentForm; 