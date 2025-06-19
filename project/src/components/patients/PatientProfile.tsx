import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, CreditCard, Heart, Building, FileText, Copy, Brain, Loader, Users, Briefcase, Activity, Stethoscope, Clock, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { getPatient } from '../../lib/supabase';
import { Patient, Assessment, Treatment, TimelineEntry } from '../../types/database';
import { enhancedApiService } from '../../lib/enhanced-api-service';
import { analyzePatientWithAI } from '../../lib/ai-service';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AssessmentForm from './AssessmentForm';
import TreatmentForm from './TreatmentForm';
import TimelineEntryForm from './TimelineEntryForm';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientSummary, setPatientSummary] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  // Modal states
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showTimelineForm, setShowTimelineForm] = useState(false);

  const fetchPatientData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch patient data
      const patientData = await getPatient(id);
      setPatient(patientData);
      
      if (patientData) {
        // Fetch related data
        const [assessmentsRes, treatmentsRes, timelineRes, statsRes] = await Promise.all([
          enhancedApiService.getPatientAssessments(id),
          enhancedApiService.getPatientTreatments(id),
          enhancedApiService.getPatientTimeline(id),
          enhancedApiService.getPatientStats(id)
        ]);
        
        setAssessments(assessmentsRes.data || []);
        setTreatments(treatmentsRes.data || []);
        setTimelineEntries(timelineRes.data || []);
        setStats(statsRes.data);
        
        // Generate comprehensive patient summary
        const summary = generateComprehensivePatientPrompt(patientData, assessmentsRes.data || [], treatmentsRes.data || [], timelineRes.data || []);
        setPatientSummary(summary);
      }
    } catch (error) {
      toast.error('Failed to load patient data');
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
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

  // Helper function to get address display
  const getAddressDisplay = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    if (address && typeof address === 'object') {
      const addr = address;
      const parts = [addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean);
      return parts.join(', ');
    }
    return 'Address not provided';
  };

  // Helper function to get emergency contact display
  const getEmergencyContactDisplay = (emergencyContact: any) => {
    if (typeof emergencyContact === 'string') {
      return emergencyContact;
    }
    if (emergencyContact && typeof emergencyContact === 'object') {
      const ec = emergencyContact;
      return `${ec.name} (${ec.relationship}) - ${ec.phone}${ec.email ? `, ${ec.email}` : ''}`;
    }
    return 'Not provided';
  };

  // Helper function to format dosha scores
  const formatDoshaScores = (doshaScores: any) => {
    if (!doshaScores) return 'Not assessed';
    return `Vata: ${doshaScores.vata || 0}, Pitta: ${doshaScores.pitta || 0}, Kapha: ${doshaScores.kapha || 0}`;
  };

  // Helper function to get latest assessment
  const getLatestAssessment = () => {
    return assessments.length > 0 ? assessments[0] : null;
  };

  // Helper function to get active treatments
  const getActiveTreatments = () => {
    return treatments.filter(t => t.status === 'active');
  };

  // Helper function to get recent timeline entries
  const getRecentTimelineEntries = (limit = 5) => {
    return timelineEntries.slice(0, limit);
  };

  const generateComprehensivePatientPrompt = (
    patient: Patient, 
    assessments: Assessment[], 
    treatments: Treatment[], 
    timelineEntries: TimelineEntry[]
  ): string => {
    const age = patient.dob ? calculateAge(patient.dob) : 'N/A';
    const birthDate = patient.dob ? format(new Date(patient.dob), 'MMM d, yyyy') : 'N/A';
    const address = getAddressDisplay(patient.address);
    const emergencyContact = getEmergencyContactDisplay(patient.emergency_contact);
    const latestAssessment = getLatestAssessment();
    const activeTreatments = getActiveTreatments();
    
    let summary = `
PATIENT PROFILE:
${patient.name} is a ${age}-year-old ${patient.gender || 'person'} born on ${birthDate}.
${patient.marital_status ? `They are ${patient.marital_status.toLowerCase()}` : ''}${patient.occupation ? ` and work as a ${patient.occupation}${patient.occupation_type ? ` (${patient.occupation_type} work)` : ''}` : ''}.

CONTACT INFORMATION:
${patient.mobile || patient.contact ? `Phone: ${patient.mobile || patient.contact}` : ''}
${patient.email ? `Email: ${patient.email}` : ''}
${address ? `Address: ${address}` : ''}
${emergencyContact !== 'Not provided' ? `Emergency Contact: ${emergencyContact}` : ''}

MEDICAL IDENTIFIERS:
${patient.uhid ? `UHID: ${patient.uhid}` : ''}
${patient.aadhaar_number ? `Aadhaar: ${patient.aadhaar_number}` : ''}
${patient.abha_id ? `ABHA ID: ${patient.abha_id}` : ''}

INSURANCE STATUS:
${patient.insurance_status ? 'Insured' : 'Not insured'}${patient.insurance_provider ? ` (${patient.insurance_provider})` : ''}

FAMILY HISTORY:
${patient.family_history && patient.family_history.length > 0 ? patient.family_history.join(', ') : 'No family history recorded'}

CLINICAL DATA:
`;

    // Add assessment information
    if (assessments.length > 0) {
      summary += `
ASSESSMENTS (${assessments.length} total):
Latest Assessment (${latestAssessment ? format(new Date(latestAssessment.created_at), 'MMM d, yyyy') : 'N/A'}):
- Prakriti: ${latestAssessment ? formatDoshaScores(latestAssessment.prakriti) : 'Not assessed'}
- Vikriti: ${latestAssessment ? formatDoshaScores(latestAssessment.vikriti) : 'Not assessed'}
${latestAssessment?.nadi_pariksha ? `- Nadi Pariksha: ${latestAssessment.nadi_pariksha}` : ''}
${latestAssessment?.jihva_pariksha ? `- Jihva Pariksha: ${latestAssessment.jihva_pariksha}` : ''}
${latestAssessment?.akriti_pariksha ? `- Akriti Pariksha: ${latestAssessment.akriti_pariksha}` : ''}
${latestAssessment?.icd11_codes && latestAssessment.icd11_codes.length > 0 ? `- ICD-11 Codes: ${latestAssessment.icd11_codes.join(', ')}` : ''}
${latestAssessment?.notes ? `- Notes: ${latestAssessment.notes}` : ''}
`;
    } else {
      summary += `
ASSESSMENTS: No assessments recorded
`;
    }

    // Add treatment information
    if (treatments.length > 0) {
      summary += `
TREATMENTS (${treatments.length} total):
Active Treatments (${activeTreatments.length}):
`;
      activeTreatments.forEach((treatment, index) => {
        summary += `
${index + 1}. ${treatment.primary_ayurvedic_diagnosis || 'Diagnosis not specified'}
- Status: ${treatment.status}
- Created: ${format(new Date(treatment.created_at), 'MMM d, yyyy')}
${treatment.herbs ? `- Herbs: ${treatment.herbs}` : ''}
${treatment.therapy ? `- Therapy: ${treatment.therapy}` : ''}
${treatment.diet ? `- Diet: ${treatment.diet}` : ''}
${treatment.lifestyle ? `- Lifestyle: ${treatment.lifestyle}` : ''}
`;
      });
    } else {
      summary += `
TREATMENTS: No treatments recorded
`;
    }

    // Add recent timeline entries
    if (timelineEntries.length > 0) {
      const recentEntries = getRecentTimelineEntries(5);
      summary += `
RECENT TIMELINE ENTRIES (${timelineEntries.length} total):
`;
      recentEntries.forEach((entry, index) => {
        summary += `
${index + 1}. ${entry.title || entry.entry_type} (${format(new Date(entry.created_at), 'MMM d, yyyy')})
- Type: ${entry.entry_type}
${entry.notes ? `- Notes: ${entry.notes}` : ''}
${entry.details ? `- Details: ${entry.details}` : ''}
`;
      });
    } else {
      summary += `
TIMELINE ENTRIES: No timeline entries recorded
`;
    }

    summary += `
STATISTICS:
- Total Assessments: ${assessments.length}
- Total Treatments: ${treatments.length}
- Active Treatments: ${activeTreatments.length}
- Timeline Entries: ${timelineEntries.length}
`;

    return summary.trim();
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

  const handleDataUpdate = () => {
    fetchPatientData();
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

  const latestAssessment = getLatestAssessment();
  const activeTreatments = getActiveTreatments();
  const recentTimelineEntries = getRecentTimelineEntries(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
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
                  {patient.marital_status && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {patient.marital_status}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn btn-outline flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAssessmentForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </button>
              <button
                onClick={() => setShowTreatmentForm(true)}
                className="btn btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Treatment
              </button>
              <button
                onClick={() => setShowTimelineForm(true)}
                className="btn btn-outline flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Timeline Entry
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card bg-blue-50">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Assessments</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.stats?.assessments || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-green-50">
                <div className="flex items-center">
                  <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Treatments</p>
                    <p className="text-2xl font-bold text-green-800">{stats.stats?.treatments || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-purple-50">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Timeline Entries</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.stats?.timeline_entries || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-orange-50">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Active Treatments</p>
                    <p className="text-2xl font-bold text-orange-800">{activeTreatments.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                {(patient.mobile || patient.contact) && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{patient.mobile || patient.contact}</span>
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
                    <span>{getAddressDisplay(patient.address)}</span>
                  </div>
                )}
                {patient.emergency_contact && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500 block">Emergency Contact</span>
                      <span>{getEmergencyContactDisplay(patient.emergency_contact)}</span>
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
                      <span>
                        {patient.occupation}
                        {patient.occupation_type && (
                          <span className="text-gray-500 ml-1">({patient.occupation_type})</span>
                        )}
                      </span>
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

          {/* Latest Assessment */}
          {latestAssessment && (
            <div className="card mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Latest Assessment ({format(new Date(latestAssessment.created_at), 'MMM d, yyyy')})
                </h2>
                <button
                  onClick={() => setShowAssessmentForm(true)}
                  className="btn btn-outline btn-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Assessment
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Prakriti (Constitution)</h3>
                  <p className="text-gray-600">{formatDoshaScores(latestAssessment.prakriti)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Vikriti (Current Imbalance)</h3>
                  <p className="text-gray-600">{formatDoshaScores(latestAssessment.vikriti)}</p>
                </div>
                {latestAssessment.icd11_codes && latestAssessment.icd11_codes.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-2">ICD-11 Diagnoses</h3>
                    <div className="flex flex-wrap gap-2">
                      {latestAssessment.icd11_codes.map((code, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {latestAssessment.notes && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-2">Assessment Notes</h3>
                    <p className="text-gray-600">{latestAssessment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Treatments */}
          {activeTreatments.length > 0 && (
            <div className="card mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Active Treatments ({activeTreatments.length})
                </h2>
                <button
                  onClick={() => setShowTreatmentForm(true)}
                  className="btn btn-outline btn-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Treatment
                </button>
              </div>
              <div className="space-y-4">
                {activeTreatments.map((treatment, index) => (
                  <div key={treatment.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {treatment.primary_ayurvedic_diagnosis || 'Diagnosis not specified'}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(treatment.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {treatment.herbs && (
                        <div>
                          <span className="font-medium text-gray-700">Herbs:</span> {treatment.herbs}
                        </div>
                      )}
                      {treatment.therapy && (
                        <div>
                          <span className="font-medium text-gray-700">Therapy:</span> {treatment.therapy}
                        </div>
                      )}
                      {treatment.diet && (
                        <div>
                          <span className="font-medium text-gray-700">Diet:</span> {treatment.diet}
                        </div>
                      )}
                      {treatment.lifestyle && (
                        <div>
                          <span className="font-medium text-gray-700">Lifestyle:</span> {treatment.lifestyle}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Timeline Entries */}
          {recentTimelineEntries.length > 0 && (
            <div className="card mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Timeline Entries
                </h2>
                <button
                  onClick={() => setShowTimelineForm(true)}
                  className="btn btn-outline btn-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Entry
                </button>
              </div>
              <div className="space-y-3">
                {recentTimelineEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">
                          {entry.title || entry.entry_type}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {entry.entry_type}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-700 mt-2">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Family History */}
          {patient.family_history && patient.family_history.length > 0 && (
            <div className="card mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Family History
              </h2>
              <div className="space-y-2">
                {patient.family_history.map((condition, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    <span className="text-gray-700">{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Summary */}
          <div className="card mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Comprehensive Patient Summary
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
              <pre className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed text-sm">
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

      {/* Modal Forms */}
      <AnimatePresence>
        {showAssessmentForm && (
          <AssessmentForm
            patientId={patient.id}
            patientName={patient.name}
            onClose={() => setShowAssessmentForm(false)}
            onSuccess={handleDataUpdate}
          />
        )}
        
        {showTreatmentForm && (
          <TreatmentForm
            patientId={patient.id}
            patientName={patient.name}
            assessmentId={latestAssessment?.id}
            onClose={() => setShowTreatmentForm(false)}
            onSuccess={handleDataUpdate}
          />
        )}
        
        {showTimelineForm && (
          <TimelineEntryForm
            patientId={patient.id}
            patientName={patient.name}
            onClose={() => setShowTimelineForm(false)}
            onSuccess={handleDataUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientProfile;