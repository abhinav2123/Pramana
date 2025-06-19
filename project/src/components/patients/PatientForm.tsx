import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building, CreditCard, Heart, Home, Phone, User, Calendar, Mail, ArrowLeft, MapPin, Users, Briefcase } from 'lucide-react';
import { createPatient } from '../../lib/supabase';
import { PatientFormData, Address, EmergencyContact } from '../../types/database';

const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    dob: '',
    gender: '',
    mobile: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      full_address: ''
    },
    uhid: '',
    aadhaar_number: '',
    abha_id: '',
    marital_status: '',
    occupation: '',
    occupation_type: '',
    insurance_status: false,
    insurance_provider: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    family_history: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform form data to match the enhanced schema
      const patientData = {
        ...formData,
        // Convert address object to string for backward compatibility
        address: formData.address?.full_address || 
                 `${formData.address?.street || ''}, ${formData.address?.city || ''}, ${formData.address?.state || ''}`.trim(),
        // Convert emergency contact object to string for backward compatibility
        emergency_contact: formData.emergency_contact ? 
          `${formData.emergency_contact.name} (${formData.emergency_contact.relationship}): ${formData.emergency_contact.phone}` : '',
        // Use mobile as contact for backward compatibility
        contact: formData.mobile
      };

      const patient = await createPatient(patientData);
      toast.success('Patient created successfully!');
      navigate(`/patient/${patient.id}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [field]: value
        }
      }));
    } else if (name.startsWith('emergency_contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergency_contact: {
          ...prev.emergency_contact!,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const addFamilyHistory = () => {
    setFormData(prev => ({
      ...prev,
      family_history: [...(prev.family_history || []), '']
    }));
  };

  const updateFamilyHistory = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      family_history: prev.family_history?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const removeFamilyHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      family_history: prev.family_history?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-blue-800">New Patient Registration</h1>
            <p className="text-gray-600 mt-2">Add a new patient with enhanced Ayurvedic clinical data</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input pl-10"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="input pl-10"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="patient@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                        className="input pl-10"
                      >
                        <option value="">Select status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address?.street}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter street address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.postal_code"
                      value={formData.address?.postal_code}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address?.country}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter country"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address (for backward compatibility)
                    </label>
                    <textarea
                      name="address.full_address"
                      value={formData.address?.full_address}
                      onChange={handleChange}
                      className="input"
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Medical Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UHID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="uhid"
                        value={formData.uhid}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter UHID"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="aadhaar_number"
                        value={formData.aadhaar_number}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter Aadhaar number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ABHA ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Heart className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="abha_id"
                        value={formData.abha_id}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter ABHA ID"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter occupation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation Type
                    </label>
                    <select
                      name="occupation_type"
                      value={formData.occupation_type}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select type</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.name"
                      value={formData.emergency_contact?.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.relationship"
                      value={formData.emergency_contact?.relationship}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="emergency_contact.phone"
                        value={formData.emergency_contact?.phone}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="emergency_contact.email"
                        value={formData.emergency_contact?.email}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Emergency contact email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family History */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Family History
                </h2>
                <div className="space-y-4">
                  {formData.family_history?.map((condition, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) => updateFamilyHistory(index, e.target.value)}
                        className="input flex-1"
                        placeholder="Enter family medical condition"
                      />
                      <button
                        type="button"
                        onClick={() => removeFamilyHistory(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFamilyHistory}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add Family History
                  </button>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Insurance Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="insurance_status"
                        checked={formData.insurance_status}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Has health insurance
                      </label>
                    </div>
                  </div>

                  {formData.insurance_status && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Provider
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="insurance_provider"
                          value={formData.insurance_provider}
                          onChange={handleChange}
                          className="input pl-10"
                          placeholder="Enter insurance provider"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Patient'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientForm;