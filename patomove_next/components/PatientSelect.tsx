'use client';

import { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import Modal from './Modal';

interface Patient {
  id: string;
  dateOfBirth?: string;
  sex?: string;
  organization: {
    name: string;
  };
}

interface PatientSelectProps {
  value?: string;
  onChange: (value: string) => void;
  organizationId?: string;
  required?: boolean;
  error?: string;
}

export default function PatientSelect({ value, onChange, organizationId, required, error }: PatientSelectProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    dateOfBirth: '',
    sex: '',
    clinicalNotes: '',
    orgId: organizationId || ''
  });

  useEffect(() => {
    fetchPatients();
  }, [organizationId]);

  const fetchPatients = async () => {
    try {
      let url = '/api/patients';
      if (organizationId) {
        url += `?orgId=${organizationId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
    setNewPatientData({
      dateOfBirth: '',
      sex: '',
      clinicalNotes: '',
      orgId: organizationId || ''
    });
  };

  const handleSubmitNewPatient = async () => {
    if (!newPatientData.orgId) {
      alert('Please select an organization first');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...newPatientData,
        ...(newPatientData.dateOfBirth && { dateOfBirth: new Date(newPatientData.dateOfBirth).toISOString() })
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const newPatient = await response.json();
        setPatients(prev => [...prev, newPatient]);
        onChange(newPatient.id);
        setIsModalOpen(false);
      } else {
        alert('Failed to create patient');
      }
    } catch (error) {
      console.error('Failed to create patient:', error);
      alert('Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPatientName = (patient: Patient) => {
    const parts = [];
    if (patient.sex) parts.push(patient.sex);
    if (patient.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
      parts.push(`Age ${age}`);
    }
    return `Patient ${patient.id.slice(0, 8)}${parts.length ? ` (${parts.join(', ')})` : ''}`;
  };

  const options = patients.map(patient => ({
    id: patient.id,
    name: formatPatientName(patient),
    subtitle: patient.organization.name
  }));

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <SearchableSelect
        label="Patient"
        placeholder="Search patients..."
        options={options}
        value={value}
        onChange={onChange}
        onCreateNew={handleCreateNew}
        createNewLabel="Create New Patient"
        required={required}
        error={error}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Patient">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={newPatientData.dateOfBirth}
              onChange={(e) => setNewPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              value={newPatientData.sex}
              onChange={(e) => setNewPatientData(prev => ({ ...prev, sex: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Notes
            </label>
            <textarea
              value={newPatientData.clinicalNotes}
              onChange={(e) => setNewPatientData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional clinical notes or observations"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmitNewPatient}
              disabled={isSubmitting || !organizationId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Patient'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>

          {!organizationId && (
            <p className="text-sm text-red-600">Please select an organization first</p>
          )}
        </div>
      </Modal>
    </>
  );
}