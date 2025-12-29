'use client';

import { useState, useRef, useEffect } from 'react';
import ComponentFeedback from './ComponentFeedback';
import OrganizationSelect from './OrganizationSelect';
import PatientSelect from './PatientSelect';
import EnvironmentSelect from './EnvironmentSelect';

interface CsvRow {
  [key: string]: string;
}

interface ParsedIsolate {
  id: string; // temp ID for tracking
  label: string;
  sampleType: 'Clinical' | 'Environmental';
  collectionSource: string;
  collectionSite: string;
  collectionDate: string;
  priority: 'Normal' | 'Priority';
  notes: string;
  orgId: string;
  patientId: string;
  environmentId: string;
  status: 'pending' | 'submitting' | 'success' | 'error';
  error?: string;
}

const requiredFields = [
  { key: 'label', label: 'Sample ID', required: true },
  { key: 'sampleType', label: 'Sample Type', required: true },
  { key: 'collectionSource', label: 'Collection Source', required: false },
  { key: 'collectionSite', label: 'Collection Site', required: true },
  { key: 'collectionDate', label: 'Collection Date', required: true },
  { key: 'priority', label: 'Priority', required: false },
  { key: 'notes', label: 'Notes', required: false }
];

export default function CsvImportWizard() {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isolates, setIsolates] = useState<ParsedIsolate[]>([]);
  const [globalOrgId, setGlobalOrgId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation warning when data would be lost
  useEffect(() => {
    const hasUnsavedData = step === 'review' && isolates.length > 0 && isolates.some(i => i.status !== 'success');
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved isolate data. Are you sure you want to leave?';
      }
    };

    if (hasUnsavedData) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, isolates]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: CsvRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(data);
      
      // Parse CSV data into isolate objects with default values
      const parsedIsolates: ParsedIsolate[] = data.map((row, index) => ({
        id: `temp-${index}`,
        label: row['Sample ID'] || row['label'] || '',
        sampleType: (row['Sample Type'] || row['sampleType'] || 'Clinical') as 'Clinical' | 'Environmental',
        collectionSource: row['Collection Source'] || row['collectionSource'] || '',
        collectionSite: row['Collection Site'] || row['collectionSite'] || '',
        collectionDate: row['Collection Date'] || row['collectionDate'] || '',
        priority: (row['Priority'] || row['priority'] || 'Normal') as 'Normal' | 'Priority',
        notes: row['Notes'] || row['notes'] || '',
        orgId: globalOrgId,
        patientId: '',
        environmentId: '',
        status: 'pending'
      }));

      setIsolates(parsedIsolates);
      setStep('review');
    };
    reader.readAsText(file);
  };

  const updateIsolate = (id: string, updates: Partial<ParsedIsolate>) => {
    setIsolates(prev => prev.map(isolate => 
      isolate.id === id ? { ...isolate, ...updates } : isolate
    ));
  };

  const validateIsolate = (isolate: ParsedIsolate): string[] => {
    const errors: string[] = [];
    
    if (!isolate.label.trim()) errors.push('Sample ID required');
    if (!isolate.orgId) errors.push('Organization required');
    if (!isolate.collectionSite.trim()) errors.push('Collection site required');
    if (!isolate.collectionDate) errors.push('Collection date required');
    
    if (isolate.sampleType === 'Clinical' && !isolate.patientId) {
      errors.push('Patient required for clinical samples');
    }
    if (isolate.sampleType === 'Environmental' && !isolate.environmentId) {
      errors.push('Environment site required for environmental samples');
    }
    
    return errors;
  };

  const submitIsolate = async (isolate: ParsedIsolate) => {
    const errors = validateIsolate(isolate);
    if (errors.length > 0) {
      updateIsolate(isolate.id, { status: 'error', error: errors.join(', ') });
      return;
    }

    updateIsolate(isolate.id, { status: 'submitting' });

    try {
      const payload = {
        label: isolate.label,
        sampleType: isolate.sampleType,
        collectionSource: isolate.collectionSource,
        collectionSite: isolate.collectionSite,
        collectionDate: new Date(isolate.collectionDate).toISOString(),
        priority: isolate.priority,
        processingStatus: 'pending',
        notes: isolate.notes,
        orgId: isolate.orgId,
        ...(isolate.sampleType === 'Clinical' && { patientId: isolate.patientId }),
        ...(isolate.sampleType === 'Environmental' && { environmentId: isolate.environmentId }),
        createdBy: 'current-user-id' // TODO: get from auth
      };

      const response = await fetch('/api/isolates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        updateIsolate(isolate.id, { status: 'success' });
      } else {
        const errorData = await response.json();
        updateIsolate(isolate.id, { 
          status: 'error', 
          error: errorData.error || 'Failed to create isolate' 
        });
      }
    } catch (error) {
      updateIsolate(isolate.id, { 
        status: 'error', 
        error: 'Network error - please try again' 
      });
    }
  };

  const resetWizard = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setIsolates([]);
    setGlobalOrgId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = requiredFields.map(f => f.label);
    const csvContent = headers.join(',') + '\n' + 
      'LAB-2024-001,Clinical,blood,"Ward 3A Room 205",2024-01-15,normal,Sample collection notes';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isolate_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: ParsedIsolate['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-50 text-gray-700';
      case 'submitting': return 'bg-blue-50 text-blue-700';
      case 'success': return 'bg-green-50 text-green-700';
      case 'error': return 'bg-red-50 text-red-700';
    }
  };

  const getStatusIcon = (status: ParsedIsolate['status']) => {
    switch (status) {
      case 'pending':
        return <span className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'submitting':
        return <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'success':
        return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>;
      case 'error':
        return <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>;
    }
  };

  return (
    <div className="relative max-w-7xl">
      <ComponentFeedback componentName="CsvImportWizard" />
      
      {step === 'upload' && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
            <p className="text-gray-600 mb-4">Upload a CSV file to prefill isolate data for manual review and submission.</p>
          </div>

          {/* Global Organization Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-3">Select Default Organization</h4>
            <p className="text-sm text-blue-700 mb-3">This organization will be applied to all imported samples by default.</p>
            <OrganizationSelect
              value={globalOrgId}
              onChange={setGlobalOrgId}
              required
            />
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Download Template
            </button>
            <span className="text-sm text-gray-500 flex items-center">
              Use this template to format your data correctly
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!globalOrgId}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose CSV File
            </button>
            <p className="text-gray-500 mt-2">Select an organization first, then upload your CSV file</p>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Submit Samples</h3>
              <p className="text-gray-600">Review each sample and submit individually after validation.</p>
            </div>
            <button
              onClick={resetWizard}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Upload New File
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Manual Curation Required:</strong> Review each sample's organization, patient/environment, and other details before submitting.
              Each sample must be submitted individually after validation.
            </p>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Sample ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Organization</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Patient/Environment</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Collection Site</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Priority</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {isolates.map((isolate) => (
                  <tr key={isolate.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={isolate.label}
                        onChange={(e) => updateIsolate(isolate.id, { label: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Sample ID"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={isolate.sampleType}
                        onChange={(e) => updateIsolate(isolate.id, { 
                          sampleType: e.target.value as 'Clinical' | 'Environmental',
                          patientId: e.target.value === 'Clinical' ? isolate.patientId : '',
                          environmentId: e.target.value === 'Environmental' ? isolate.environmentId : ''
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="Clinical">Clinical</option>
                        <option value="Environmental">Environmental</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 w-48">
                      <OrganizationSelect
                        value={isolate.orgId}
                        onChange={(value) => updateIsolate(isolate.id, { orgId: value })}
                      />
                    </td>
                    <td className="px-3 py-2 w-48">
                      {isolate.sampleType === 'Clinical' ? (
                        <PatientSelect
                          value={isolate.patientId}
                          onChange={(value) => updateIsolate(isolate.id, { patientId: value })}
                          organizationId={isolate.orgId}
                        />
                      ) : (
                        <EnvironmentSelect
                          value={isolate.environmentId}
                          onChange={(value) => updateIsolate(isolate.id, { environmentId: value })}
                          organizationId={isolate.orgId}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={isolate.collectionSite}
                        onChange={(e) => updateIsolate(isolate.id, { collectionSite: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Collection site"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={isolate.collectionDate}
                        onChange={(e) => updateIsolate(isolate.id, { collectionDate: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={isolate.priority}
                        onChange={(e) => updateIsolate(isolate.id, { priority: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Priority">Priority</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${getStatusColor(isolate.status)}`}>
                        {getStatusIcon(isolate.status)}
                        <span className="capitalize">{isolate.status}</span>
                      </div>
                      {isolate.error && (
                        <p className="text-red-600 text-xs mt-1">{isolate.error}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => submitIsolate(isolate)}
                        disabled={isolate.status === 'submitting' || isolate.status === 'success'}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isolate.status === 'submitting' ? 'Submitting...' : 
                         isolate.status === 'success' ? 'Submitted' : 'Submit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              {isolates.filter(i => i.status === 'success').length} of {isolates.length} samples submitted successfully
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-gray-500">Status:</span>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Pending ({isolates.filter(i => i.status === 'pending').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Success ({isolates.filter(i => i.status === 'success').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Error ({isolates.filter(i => i.status === 'error').length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}