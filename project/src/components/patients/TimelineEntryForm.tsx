import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, FileText, Calendar } from 'lucide-react';
import { TimelineEntry, EntryType } from '../../types/database';
import { enhancedApiService } from '../../lib/enhanced-api-service';
import { toast } from 'sonner';

interface TimelineEntryFormProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TimelineEntryForm: React.FC<TimelineEntryFormProps> = ({ patientId, patientName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<TimelineEntry>>({
    patient_id: patientId,
    title: '',
    notes: '',
    details: '',
    entry_type: 'note'
  });

  const entryTypes: { value: EntryType; label: string }[] = [
    { value: 'assessment', label: 'Assessment' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'observation', label: 'Observation' },
    { value: 'lab_result', label: 'Lab Result' },
    { value: 'symptom_update', label: 'Symptom Update' },
    { value: 'therapy_session', label: 'Therapy Session' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'note', label: 'General Note' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await enhancedApiService.createTimelineEntry(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Timeline entry created successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create timeline entry');
      console.error('Error creating timeline entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              New Timeline Entry for {patientName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Type *
              </label>
              <select
                name="entry_type"
                value={formData.entry_type}
                onChange={handleChange}
                required
                className="input w-full"
              >
                {entryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Enter a descriptive title for this entry"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input w-full"
                rows={4}
                placeholder="Enter brief notes or observations..."
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                className="input w-full"
                rows={6}
                placeholder="Enter detailed description, findings, or recommendations..."
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
                {loading ? 'Creating...' : 'Create Entry'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimelineEntryForm; 