import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, CreditCard, Heart, Building, FileText, Copy, Brain, Loader } from 'lucide-react';
import { getPatient, Patient } from '../../lib/supabase';
import { analyzePatientWithAI } from '../../lib/ai-service';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientSummary, setPatientSummary] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        const data = await getPatient(id);
        setPatient(data);
        if (data) {
          const summary = generatePatientPrompt(data);
          setPatientSummary(summary);
        }
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

  const generatePatientPrompt = (patient: Patient): string => {
    const age = patient.dob ? calculateAge(patient.dob) : 'N/A';
    const birthDate = patient.dob ? format(new Date(patient.dob), 'MMM d, yyyy') : 'N/A';
    
    return `
${patient.name} is a ${age}-year-old ${patient.gender || 'person'} born on ${birthDate}.
${patient.marital_status ? `They are ${patient.marital_status.toLowerCase()}` : ''}${patient.occupation ? ` and work as a ${patient.occupation}` : ''}.
Contact info: ${patient.contact ? `Phone - ${patient.contact}` : ''}${patient.email ? `, Email - ${patient.email}` : ''}${patient.address ? `, Address - ${patient.address}` : ''}.
${patient.emergency_contact ? `Emergency contact: ${patient.emergency_contact}.` : ''}
Medical IDs: ${patient.uhid ? `UHID - ${patient.uhid}` : ''}${patient.aadhaar_number ? `, Aadhaar - ${patient.aadhaar_number}` : ''}${patient.abha_id ? `, ABHA - ${patient.abha_id}` : ''}.
Insurance Status: ${patient.insurance_status ? 'Insured' : 'Not insured'}${patient.insurance_provider ? ` (${patient.insurance_provider})` : ''}.
    `.trim();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(patientSummary);
      toast.success('Patient summary copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const analyzeWithAI = async () => {
    if (!patientSummary || !patient) {
      toast.error('No patient summary available for analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzePatientWithAI({
        patientSummary,
        patientName: patient.name
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setAiAnalysis(result.analysis);
        toast.success('Ayurvedic analysis completed!');
      }
    } catch (error) {
      toast.error('Failed to analyze with AI');
      console.error('AI analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
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

          {/* Patient Summary */}
          <div className="card mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Patient Summary
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                  className="btn btn-secondary flex items-center text-sm"
                >
                  {analyzing ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  {analyzing ? 'Analyzing...' : 'AI Analysis'}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-outline flex items-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed">
                {patientSummary}
              </pre>
            </div>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="card mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Ayurvedic AI Analysis
                </h2>
                <button
                  onClick={() => navigator.clipboard.writeText(aiAnalysis)}
                  className="btn btn-outline flex items-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Analysis
                </button>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientProfile;