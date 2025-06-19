# Enhanced Ayurvedic Database Schema - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the enhanced Ayurvedic clinical database schema in your EHR system. The schema includes comprehensive patient management, evidence-based disease mappings, multilingual herb database, and advanced clinical analytics.

## Prerequisites

- Supabase project set up
- Node.js and npm installed
- Basic knowledge of TypeScript and React
- Understanding of Ayurvedic principles

## Step 1: Database Migration

### 1.1 Run the Enhanced Schema Migration

```bash
# Navigate to your project directory
cd project

# Apply the enhanced schema migration
npx supabase db push
```

The migration file `20250613000001_enhanced_schema.sql` will:
- Enhance existing tables with new fields
- Create new tables for disease mappings and herbs
- Add indexes for performance optimization
- Create materialized views and functions
- Populate sample data

### 1.2 Verify Migration Success

```sql
-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disease_mappings', 'ayurvedic_herbs');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('search_herbs_by_indication', 'get_patient_dosha_analysis');
```

## Step 2: TypeScript Integration

### 2.1 Install Type Definitions

The enhanced schema includes comprehensive TypeScript interfaces in `src/types/database.ts`. These interfaces provide:

- Strong typing for all database entities
- Form data types for frontend components
- API response types
- Utility types for common operations

### 2.2 Import Types in Your Components

```typescript
import type {
  Patient,
  Assessment,
  Treatment,
  DiseaseMapping,
  AyurvedicHerb,
  PatientDoshaAnalysis
} from '../types/database';
```

## Step 3: API Service Integration

### 3.1 Use the Enhanced API Service

The enhanced API service (`src/lib/enhanced-api-service.ts`) provides:

- Comprehensive CRUD operations
- Search and filtering capabilities
- Analytics and dashboard functions
- Bulk operations support

### 3.2 Basic Usage Examples

```typescript
import { enhancedApiService } from '../lib/enhanced-api-service';

// Create a patient with enhanced data
const patientData = {
  name: 'Rajesh Kumar',
  dob: '1985-03-15',
  gender: 'male',
  mobile: '+91-9876543210',
  email: 'rajesh.kumar@email.com',
  uhid: 'UHID123456789',
  marital_status: 'married',
  occupation: 'Software Engineer',
  occupation_type: 'sedentary',
  emergency_contact: {
    name: 'Priya Kumar',
    relationship: 'spouse',
    phone: '+91-9876543211'
  },
  family_history: ['diabetes', 'hypertension']
};

const { data: patient, error } = await enhancedApiService.createPatient(patientData);

// Search for herbs by indication
const { data: herbs } = await enhancedApiService.searchHerbsByIndication('stress');

// Get patient dosha analysis
const { data: analysis } = await enhancedApiService.getPatientDoshaAnalysis(patientId);
```

## Step 4: Frontend Component Updates

### 4.1 Enhanced Patient Form

Update your patient form to include new fields:

```typescript
import { useState } from 'react';
import type { PatientFormData } from '../types/database';

const EnhancedPatientForm = () => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    dob: '',
    gender: 'male',
    mobile: '',
    email: '',
    uhid: '',
    marital_status: 'single',
    occupation: '',
    occupation_type: 'sedentary',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    family_history: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await enhancedApiService.createPatient(formData);
    if (data) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Information */}
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      {/* Enhanced Fields */}
      <input
        type="text"
        placeholder="UHID"
        value={formData.uhid}
        onChange={(e) => setFormData({...formData, uhid: e.target.value})}
      />
      
      <select
        value={formData.occupation_type}
        onChange={(e) => setFormData({...formData, occupation_type: e.target.value})}
      >
        <option value="sedentary">Sedentary</option>
        <option value="moderate">Moderate</option>
        <option value="heavy">Heavy</option>
      </select>
      
      {/* Emergency Contact */}
      <input
        type="text"
        placeholder="Emergency Contact Name"
        value={formData.emergency_contact?.name}
        onChange={(e) => setFormData({
          ...formData, 
          emergency_contact: {...formData.emergency_contact, name: e.target.value}
        })}
      />
      
      <button type="submit">Create Patient</button>
    </form>
  );
};
```

### 4.2 Enhanced Assessment Form

```typescript
import { useState } from 'react';
import type { AssessmentFormData, DoshaScores } from '../types/database';

const EnhancedAssessmentForm = ({ patientId }: { patientId: string }) => {
  const [formData, setFormData] = useState<AssessmentFormData>({
    patient_id: patientId,
    prakriti: { vata: 33, pitta: 33, kapha: 34 },
    vikriti: { vata: 33, pitta: 33, kapha: 34 },
    nadi_pariksha: '',
    jihva_pariksha: '',
    akriti_pariksha: '',
    icd11_codes: [],
    notes: ''
  });

  const updateDoshaScore = (type: 'prakriti' | 'vikriti', dosha: keyof DoshaScores, value: number) => {
    setFormData({
      ...formData,
      [type]: { ...formData[type], [dosha]: value }
    });
  };

  return (
    <form>
      {/* Dosha Assessment */}
      <div>
        <h3>Prakriti Assessment</h3>
        <label>Vata: <input type="range" min="0" max="100" value={formData.prakriti.vata} 
          onChange={(e) => updateDoshaScore('prakriti', 'vata', parseInt(e.target.value))} /></label>
        <label>Pitta: <input type="range" min="0" max="100" value={formData.prakriti.pitta} 
          onChange={(e) => updateDoshaScore('prakriti', 'pitta', parseInt(e.target.value))} /></label>
        <label>Kapha: <input type="range" min="0" max="100" value={formData.prakriti.kapha} 
          onChange={(e) => updateDoshaScore('prakriti', 'kapha', parseInt(e.target.value))} /></label>
      </div>

      {/* Examination Fields */}
      <textarea
        placeholder="Nadi Pariksha (Pulse Diagnosis)"
        value={formData.nadi_pariksha}
        onChange={(e) => setFormData({...formData, nadi_pariksha: e.target.value})}
      />
      
      <textarea
        placeholder="Jihva Pariksha (Tongue Examination)"
        value={formData.jihva_pariksha}
        onChange={(e) => setFormData({...formData, jihva_pariksha: e.target.value})}
      />
    </form>
  );
};
```

### 4.3 Herb Search Component

```typescript
import { useState, useEffect } from 'react';
import { enhancedApiService } from '../lib/enhanced-api-service';
import type { HerbSearchResult } from '../types/database';

const HerbSearch = () => {
  const [query, setQuery] = useState('');
  const [herbs, setHerbs] = useState<HerbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchHerbs = async (indication: string) => {
    setLoading(true);
    const { data } = await enhancedApiService.searchHerbsByIndication(indication);
    setHerbs(data || []);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search herbs by indication..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => searchHerbs(query)} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div>
        {herbs.map((herb) => (
          <div key={herb.sanskrit_name}>
            <h4>{herb.sanskrit_name} ({herb.common_name})</h4>
            <p>Hindi: {herb.hindi_name}</p>
            <p>Malayalam: {herb.malayalam_name}</p>
            <p>Primary Effect: {herb.primary_dosha_effect}</p>
            <p>Indications: {herb.indications.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Step 5: Dashboard Integration

### 5.1 Dosha Analytics Dashboard

```typescript
import { useState, useEffect } from 'react';
import { enhancedApiService } from '../lib/enhanced-api-service';
import type { PatientDoshaImbalance } from '../types/database';

const DoshaAnalyticsDashboard = () => {
  const [imbalances, setImbalances] = useState<PatientDoshaImbalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoshaImbalances();
  }, []);

  const loadDoshaImbalances = async () => {
    const { data } = await enhancedApiService.getDoshaImbalances();
    setImbalances(data || []);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Patient Dosha Imbalances</h2>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Vata Imbalance</th>
            <th>Pitta Imbalance</th>
            <th>Kapha Imbalance</th>
            <th>Assessment Date</th>
          </tr>
        </thead>
        <tbody>
          {imbalances.map((imbalance) => (
            <tr key={imbalance.id}>
              <td>{imbalance.name}</td>
              <td className={imbalance.vata_imbalance > 10 ? 'high' : ''}>
                {imbalance.vata_imbalance}
              </td>
              <td className={imbalance.pitta_imbalance > 10 ? 'high' : ''}>
                {imbalance.pitta_imbalance}
              </td>
              <td className={imbalance.kapha_imbalance > 10 ? 'high' : ''}>
                {imbalance.kapha_imbalance}
              </td>
              <td>{new Date(imbalance.assessment_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Step 6: Advanced Features

### 6.1 Disease Mapping Integration

```typescript
const DiseaseMappingComponent = () => {
  const [diseases, setDiseases] = useState<DiseaseMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const searchDiseases = async () => {
    const { data } = await enhancedApiService.searchDiseaseMappings(searchQuery);
    setDiseases(data || []);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search diseases..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={searchDiseases}>Search</button>

      {diseases.map((disease) => (
        <div key={disease.id}>
          <h3>{disease.icd11_name} → {disease.ayurvedic_name}</h3>
          <p>ICD-11 Code: {disease.icd11_code}</p>
          <p>Primary Dosha: {disease.primary_dosha}</p>
          <p>Dosha Involvement: Vata {disease.dosha_involvement.vata}%, 
             Pitta {disease.dosha_involvement.pitta}%, 
             Kapha {disease.dosha_involvement.kapha}%</p>
        </div>
      ))}
    </div>
  );
};
```

### 6.2 Treatment Protocol Builder

```typescript
const TreatmentProtocolBuilder = ({ patientId, assessmentId }: { patientId: string, assessmentId: string }) => {
  const [treatment, setTreatment] = useState<TreatmentFormData>({
    patient_id: patientId,
    assessment_id: assessmentId,
    primary_ayurvedic_diagnosis: '',
    shamana_therapy: {
      internal_medicines: [],
      external_therapies: []
    },
    diet_plan: {
      foods_to_include: [],
      foods_to_avoid: []
    },
    lifestyle_recommendations: {
      daily_routine: '',
      exercise: '',
      stress_management: ''
    }
  });

  const addHerbToTreatment = async (indication: string) => {
    const { data: herbs } = await enhancedApiService.searchHerbsByIndication(indication);
    if (herbs && herbs.length > 0) {
      setTreatment({
        ...treatment,
        shamana_therapy: {
          ...treatment.shamana_therapy,
          internal_medicines: [
            ...(treatment.shamana_therapy?.internal_medicines || []),
            herbs[0].sanskrit_name
          ]
        }
      });
    }
  };

  return (
    <div>
      <h2>Treatment Protocol Builder</h2>
      
      {/* Diagnosis */}
      <input
        type="text"
        placeholder="Primary Ayurvedic Diagnosis"
        value={treatment.primary_ayurvedic_diagnosis}
        onChange={(e) => setTreatment({...treatment, primary_ayurvedic_diagnosis: e.target.value})}
      />

      {/* Herb Selection */}
      <button onClick={() => addHerbToTreatment('stress')}>Add Stress Management Herbs</button>
      <button onClick={() => addHerbToTreatment('inflammation')}>Add Anti-inflammatory Herbs</button>

      {/* Treatment Plan Display */}
      <div>
        <h3>Internal Medicines</h3>
        <ul>
          {treatment.shamana_therapy?.internal_medicines?.map((herb, index) => (
            <li key={index}>{herb}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

## Step 7: Testing and Validation

### 7.1 Test Database Functions

```sql
-- Test herb search function
SELECT * FROM search_herbs_by_indication('stress');

-- Test patient dosha analysis
SELECT * FROM get_patient_dosha_analysis('your-patient-uuid');

-- Test materialized view
SELECT * FROM patient_dosha_imbalances LIMIT 5;
```

### 7.2 Test API Endpoints

```typescript
// Test API service functions
const testApiService = async () => {
  // Test patient creation
  const patientResult = await enhancedApiService.createPatient({
    name: 'Test Patient',
    email: 'test@example.com'
  });
  console.log('Patient created:', patientResult);

  // Test herb search
  const herbResult = await enhancedApiService.searchHerbsByIndication('diabetes');
  console.log('Herbs found:', herbResult);

  // Test disease mapping
  const diseaseResult = await enhancedApiService.getDiseaseByICD11('5B81.0');
  console.log('Disease mapping:', diseaseResult);
};
```

## Step 8: Performance Optimization

### 8.1 Monitor Query Performance

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('patients', 'assessments', 'treatments', 'ayurvedic_herbs');

-- Check materialized view refresh
SELECT * FROM pg_stat_user_tables WHERE relname = 'patient_dosha_imbalances';
```

### 8.2 Optimize Full-Text Search

```sql
-- Create additional indexes for better search performance
CREATE INDEX CONCURRENTLY idx_herbs_indications_gin ON ayurvedic_herbs 
USING gin(array_to_string(indications, ' '));

CREATE INDEX CONCURRENTLY idx_disease_synonyms_gin ON disease_mappings 
USING gin(array_to_string(ayurvedic_synonyms, ' '));
```

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure your Supabase project has the necessary permissions
2. **Type Errors**: Verify that all TypeScript interfaces are properly imported
3. **Performance Issues**: Check that indexes are being used effectively
4. **Data Validation**: Ensure dosha scores sum to 100 in assessments

### Debug Commands

```sql
-- Check table structure
\d patients
\d assessments
\d ayurvedic_herbs

-- Check function definitions
\df search_herbs_by_indication
\df get_patient_dosha_analysis

-- Check materialized view
\d patient_dosha_imbalances
```

## Next Steps

1. **Customize the schema** based on your specific requirements
2. **Add more disease mappings** and herbs to the database
3. **Implement advanced analytics** using the materialized views
4. **Create custom reports** using the enhanced data structure
5. **Integrate with external systems** using the ICD-11 mappings

This enhanced schema provides a solid foundation for modern Ayurvedic clinical practice while maintaining the integrity of classical knowledge and enabling integration with contemporary healthcare systems. 