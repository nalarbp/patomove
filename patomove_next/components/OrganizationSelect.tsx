'use client';

import { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import Modal from './Modal';

interface Organization {
  id: string;
  name: string;
  type: string;
  code: string;
}

interface OrganizationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export default function OrganizationSelect({ value, onChange, required, error }: OrganizationSelectProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    type: 'hospital',
    code: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
    setNewOrgData({
      name: '',
      type: 'hospital',
      code: '',
      contactEmail: '',
      contactPhone: '',
      address: ''
    });
  };

  const handleSubmitNewOrg = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrgData)
      });

      if (response.ok) {
        const newOrg = await response.json();
        setOrganizations(prev => [...prev, newOrg]);
        onChange(newOrg.id);
        setIsModalOpen(false);
      } else {
        alert('Failed to create organization');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert('Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = organizations.map(org => ({
    id: org.id,
    name: org.name,
    subtitle: `${org.type} - ${org.code}`
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
        label="Submitting Organization"
        placeholder="Search organizations..."
        options={options}
        value={value}
        onChange={onChange}
        onCreateNew={handleCreateNew}
        createNewLabel="Create New Organization"
        required={required}
        error={error}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Organization">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              value={newOrgData.name}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., City General Hospital"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type *
            </label>
            <select
              value={newOrgData.type}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="laboratory">Laboratory</option>
              <option value="research">Research Institution</option>
              <option value="government">Government Agency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Code *
            </label>
            <input
              type="text"
              value={newOrgData.code}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, code: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CGH-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={newOrgData.contactEmail}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@organization.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={newOrgData.contactPhone}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, contactPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={newOrgData.address}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street address, city, state, zip"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmitNewOrg}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}