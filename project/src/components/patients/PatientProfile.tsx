import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, CreditCard, Heart, Building } from 'lucide-react';
import { getPatient, Patient } from '../../lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        const data = await getPatient(id);
        setPatient(data);
      } catch (error) {
        toast.error('Failed to load patient data');
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading patient data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
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
          </div>

          {/* Header */}
          <div className="card mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {patient.gender}, {patient.dob ? calculateAge(patient.dob) : 'N/A'} years
                  </span>
                  {patient.dob && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Born {format(new Date(patient.dob), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-outline flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                {patient.contact && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{patient.contact}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.emergency_contact && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-red-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">Emergency Contact</span>
                      <span>{patient.emergency_contact}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                {patient.marital_status && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">Marital Status</span>
                      <span className="capitalize">{patient.marital_status}</span>
                    </div>
                  </div>
                )}
                {patient.occupation && (
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">Occupation</span>
                      <span>{patient.occupation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
              <div className="space-y-4">
                {patient.uhid && (
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">UHID</span>
                      <span>{patient.uhid}</span>
                    </div>
                  </div>
                )}
                {patient.aadhaar_number && (
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">Aadhaar Number</span>
                      <span>{patient.aadhaar_number}</span>
                    </div>
                  </div>
                )}
                {patient.abha_id && (
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">ABHA ID</span>
                      <span>{patient.abha_id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500 block">Insurance Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.insurance_status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.insurance_status ? 'Insured' : 'Not Insured'}
                    </span>
                  </div>
                </div>
                {patient.insurance_status && patient.insurance_provider && (
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500 block">Insurance Provider</span>
                      <span>{patient.insurance_provider}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientProfile;