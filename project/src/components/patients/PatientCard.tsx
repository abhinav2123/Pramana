import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, User, Eye, CreditCard, Building, Heart, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types/database';
import { format } from 'date-fns';

type PatientCardProps = {
  patient: Patient;
};

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();
  
  // Function to calculate age from date of birth
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

  const formattedDob = patient.dob ? format(new Date(patient.dob), 'MMM d, yyyy') : 'N/A';
  const age = patient.dob ? calculateAge(patient.dob) : 'N/A';

  // Helper function to get address display
  const getAddressDisplay = () => {
    if (typeof patient.address === 'string') {
      return patient.address;
    }
    if (patient.address && typeof patient.address === 'object') {
      const addr = patient.address;
      return [addr.street, addr.city, addr.state].filter(Boolean).join(', ') || 'Address not provided';
    }
    return 'Address not provided';
  };

  // Helper function to get emergency contact display
  const getEmergencyContactDisplay = () => {
    if (typeof patient.emergency_contact === 'string') {
      return patient.emergency_contact;
    }
    if (patient.emergency_contact && typeof patient.emergency_contact === 'object') {
      const ec = patient.emergency_contact;
      return `${ec.name} (${ec.relationship})`;
    }
    return 'Not provided';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/patient/${patient.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
          <div className="flex items-center text-gray-500 mt-1">
            <User className="h-4 w-4 mr-1" />
            <span>{patient.gender || 'N/A'}, {age} yrs</span>
            {patient.marital_status && (
              <span className="ml-2 text-gray-400">• {patient.marital_status}</span>
            )}
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Active
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Born: {formattedDob}</span>
        </div>
        
        <div className="flex items-center text-gray-700">
          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{patient.mobile || patient.contact || 'No contact information'}</span>
        </div>

        {patient.uhid && (
          <div className="flex items-center text-gray-700">
            <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">UHID: {patient.uhid}</span>
          </div>
        )}

        {patient.occupation && (
          <div className="flex items-center text-gray-700">
            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {patient.occupation}
              {patient.occupation_type && ` (${patient.occupation_type})`}
            </span>
          </div>
        )}

        {patient.abha_id && (
          <div className="flex items-center text-gray-700">
            <Heart className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">ABHA: {patient.abha_id}</span>
          </div>
        )}

        <div className="flex items-start text-gray-700">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
          <span className="truncate text-sm">{getAddressDisplay()}</span>
        </div>

        {patient.insurance_status && (
          <div className="flex items-center text-green-700">
            <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              Insured {patient.insurance_provider && `(${patient.insurance_provider})`}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-3">
        <button 
          className="btn btn-primary flex-1 py-2 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patient/${patient.id}`);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default PatientCard;