'use client';

import { useState, useEffect } from 'react';
import ComponentFeedback from './ComponentFeedback';
import OrganizationSelect from './OrganizationSelect';
import PatientSelect from './PatientSelect';
import EnvironmentSelect from './EnvironmentSelect';

interface IsolateFormData {
  label: string;
  sampleType: 'Clinical' | 'Environmental';
  collectionSource: string;
  collectionSite: string;
  collectionDate: string;
  priority: 'Normal' | 'Priority';
  processingStatus: string;
  notes: string;
  orgId: string;
  patientId: string;
  environmentId: string;
}

export default function AddIsolateForm() {
  const [formData, setFormData] = useState<IsolateFormData>({
    label: '',
    sampleType: 'Clinical',
    collectionSource: '',
    collectionSite: '',
    collectionDate: '',
    priority: 'Normal',
    processingStatus: 'pending',
    notes: '',
    orgId: '',
    patientId: '',
    environmentId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Listen for CSV sample selection events
  useEffect(() => {
    const handlePrefillForm = (event: CustomEvent) => {
      const sampleData = event.detail;
      setFormData(prev => ({
        ...prev,
        label: sampleData.label || '',
        sampleType: sampleData.sampleType || 'Clinical',
        collectionSource: sampleData.collectionSource || '',
        collectionSite: sampleData.collectionSite || '',
        collectionDate: sampleData.collectionDate || '',
        priority: sampleData.priority || 'Normal',
        notes: sampleData.notes || ''
      }));
      // Clear any validation errors when prefilling
      setErrors({});
    };

    window.addEventListener('prefillForm', handlePrefillForm as EventListener);
    return () => window.removeEventListener('prefillForm', handlePrefillForm as EventListener);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) newErrors.label = 'Sample ID is required';
    if (!formData.orgId) newErrors.orgId = 'Organization is required';
    if (!formData.collectionSite.trim()) newErrors.collectionSite = 'Collection site is required';
    if (!formData.collectionDate) newErrors.collectionDate = 'Collection date is required';

    // Schema constraint: sampleType determines required ID field
    if (formData.sampleType === 'Clinical' && !formData.patientId) {
      newErrors.patientId = 'Patient is required for clinical samples';
    }
    if (formData.sampleType === 'Environmental' && !formData.environmentId) {
      newErrors.environmentId = 'Environment site is required for environmental samples';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = {
        label: formData.label,
        sampleType: formData.sampleType,
        collectionSource: formData.collectionSource,
        collectionSite: formData.collectionSite,
        collectionDate: new Date(formData.collectionDate).toISOString(),
        priority: formData.priority,
        processingStatus: formData.processingStatus,
        notes: formData.notes,
        orgId: formData.orgId,
        // Include only the relevant ID based on sampleType
        ...(formData.sampleType === 'Clinical' && { patientId: formData.patientId }),
        ...(formData.sampleType === 'Environmental' && { environmentId: formData.environmentId }),
        // TODO: Add createdBy when user auth is implemented
        createdBy: 'current-user-id'
      };

      const response = await fetch('/api/isolates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Notify CSV component of successful submission
        window.dispatchEvent(new CustomEvent('isolateCreated'));
        resetForm();
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        console.error('Submit error:', errorData);
      }
    } catch (error) {
      console.error('Failed to create isolate:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      sampleType: 'Clinical',
      collectionSource: '',
      collectionSite: '',
      collectionDate: '',
      priority: 'Normal',
      processingStatus: 'pending',
      notes: '',
      orgId: '',
      patientId: '',
      environmentId: ''
    });
    setErrors({});
    setSubmitStatus('idle');
  };

  return (
    <div className="relative max-w-2xl">
      <ComponentFeedback componentName="AddIsolateForm" />
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Sample ID */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Sample ID *
          </label>
          <input
            type="text"
            id="label"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.label ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., LAB-2024-001"
          />
          {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
        </div>

        {/* Organization */}
        <OrganizationSelect
          value={formData.orgId}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, orgId: value }));
            setErrors(prev => ({ ...prev, orgId: '' }));
          }}
          required
          error={errors.orgId}
        />

        {/* Sample Type */}
        <div>
          <label htmlFor="sampleType" className="block text-sm font-medium text-gray-700 mb-1">
            Sample Type *
          </label>
          <select
            id="sampleType"
            name="sampleType"
            value={formData.sampleType}
            onChange={(e) => {
              const newSampleType = e.target.value as 'Clinical' | 'Environmental';
              setFormData(prev => ({ 
                ...prev, 
                sampleType: newSampleType,
                // Clear opposite field when switching sample type
                patientId: newSampleType === 'Clinical' ? prev.patientId : '',
                environmentId: newSampleType === 'Environmental' ? prev.environmentId : ''
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Clinical">Clinical</option>
            <option value="Environmental">Environmental</option>
          </select>
        </div>

        {/* Patient/Environment Selection based on Sample Type */}
        {formData.sampleType === 'Clinical' && (
          <PatientSelect
            value={formData.patientId}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, patientId: value }));
              setErrors(prev => ({ ...prev, patientId: '' }));
            }}
            organizationId={formData.orgId}
            required
            error={errors.patientId}
          />
        )}

        {formData.sampleType === 'Environmental' && (
          <EnvironmentSelect
            value={formData.environmentId}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, environmentId: value }));
              setErrors(prev => ({ ...prev, environmentId: '' }));
            }}
            organizationId={formData.orgId}
            required
            error={errors.environmentId}
          />
        )}

        {/* Collection Source */}
        <div>
          <label htmlFor="collectionSource" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Source
          </label>
          <input
            type="text"
            id="collectionSource"
            name="collectionSource"
            value={formData.collectionSource}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={formData.sampleType === 'Clinical' ? 'e.g., Blood, Urine, Wound' : 'e.g., Water, Surface, Air'}
          />
        </div>

        {/* Collection Site */}
        <div>
          <label htmlFor="collectionSite" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Site *
          </label>
          <input
            type="text"
            id="collectionSite"
            name="collectionSite"
            value={formData.collectionSite}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.collectionSite ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={formData.sampleType === 'Clinical' ? 'e.g., Ward 3A, Room 205' : 'e.g., ICU Sink, Kitchen Counter'}
          />
          {errors.collectionSite && <p className="mt-1 text-sm text-red-600">{errors.collectionSite}</p>}
        </div>

        {/* Collection Date */}
        <div>
          <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Date *
          </label>
          <input
            type="date"
            id="collectionDate"
            name="collectionDate"
            value={formData.collectionDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.collectionDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.collectionDate && <p className="mt-1 text-sm text-red-600">{errors.collectionDate}</p>}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Normal">Normal</option>
            <option value="Priority">Priority</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional collection notes or observations"
          />
        </div>

        {/* Submit Status */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-700 text-sm">Isolate created successfully!</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">Failed to create isolate. Please try again.</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Isolate'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear Form
          </button>
        </div>

        {/* Field requirement note */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Indicates required fields
          </p>
        </div>
      </form>
    </div>
  );
}