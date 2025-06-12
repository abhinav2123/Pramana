import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients, Patient } from '../../lib/supabase';
import PatientCard from '../patients/PatientCard';
import MetricCard from '../ui/MetricCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Records</h1>
        <p className="text-gray-600 mb-8">Manage your patient database</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard 
            title="Total Patients"
            value={patients.length}
            icon={<Users />}
            color="bg-blue-100"
            textColor="text-blue-800"
          />
          <MetricCard 
            title="New This Month"
            value={patients.filter(p => {
              const created = new Date(p.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
            icon={<Users />}
            color="bg-cyan-100"
            textColor="text-cyan-800"
          />
          <MetricCard 
            title="Active Records"
            value={patients.length}
            icon={<Users />}
            color="bg-purple-100"
            textColor="text-purple-800"
          />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">All Patients</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                className="input pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-primary flex items-center"
              onClick={() => navigate('/patient/new')}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Patient
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-pulse">Loading patients...</div>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No patients found. Create your first patient to get started.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;