'use client';

import { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import Modal from './Modal';

interface Environment {
  id: string;
  siteName: string;
  facilityType?: string;
  organization: {
    name: string;
  };
}

interface EnvironmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  organizationId?: string;
  required?: boolean;
  error?: string;
}

export default function EnvironmentSelect({ value, onChange, organizationId, required, error }: EnvironmentSelectProps) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEnvironmentData, setNewEnvironmentData] = useState({
    siteName: '',
    facilityType: '',
    orgId: organizationId || ''
  });

  useEffect(() => {
    fetchEnvironments();
  }, [organizationId]);

  const fetchEnvironments = async () => {
    try {
      let url = '/api/environments';
      if (organizationId) {
        url += `?orgId=${organizationId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setEnvironments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch environments:', error);
      setEnvironments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
    setNewEnvironmentData({
      siteName: '',
      facilityType: '',
      orgId: organizationId || ''
    });
  };

  const handleSubmitNewEnvironment = async () => {
    if (!newEnvironmentData.orgId) {
      alert('Please select an organization first');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnvironmentData)
      });

      if (response.ok) {
        const newEnvironment = await response.json();
        setEnvironments(prev => [...prev, newEnvironment]);
        onChange(newEnvironment.id);
        setIsModalOpen(false);
      } else {
        alert('Failed to create environment');
      }
    } catch (error) {
      console.error('Failed to create environment:', error);
      alert('Failed to create environment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = environments.map(env => ({
    id: env.id,
    name: env.siteName,
    subtitle: `${env.facilityType || 'Unknown type'} - ${env.organization.name}`
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
        label="Environment Site"
        placeholder="Search environment sites..."
        options={options}
        value={value}
        onChange={onChange}
        onCreateNew={handleCreateNew}
        createNewLabel="Create New Environment Site"
        required={required}
        error={error}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Environment Site">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name *
            </label>
            <input
              type="text"
              value={newEnvironmentData.siteName}
              onChange={(e) => setNewEnvironmentData(prev => ({ ...prev, siteName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ICU Sink #3, Kitchen Counter, Patient Room 205"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              value={newEnvironmentData.facilityType}
              onChange={(e) => setNewEnvironmentData(prev => ({ ...prev, facilityType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              <option value="hospital_ward">Hospital Ward</option>
              <option value="icu">Intensive Care Unit</option>
              <option value="emergency_dept">Emergency Department</option>
              <option value="outpatient_clinic">Outpatient Clinic</option>
              <option value="laboratory">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="food_service">Food Service</option>
              <option value="waste_management">Waste Management</option>
              <option value="hvac_system">HVAC System</option>
              <option value="water_system">Water System</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmitNewEnvironment}
              disabled={isSubmitting || !organizationId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Environment Site'}
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