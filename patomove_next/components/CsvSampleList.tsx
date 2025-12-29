'use client';

import { useState, useRef, useEffect } from 'react';
import ComponentFeedback from './ComponentFeedback';

interface CsvRow {
  [key: string]: string;
}

interface ParsedSample {
  id: string;
  label: string;
  sampleType: 'clinical' | 'environmental';
  collectionSource: string;
  collectionSite: string;
  collectionDate: string;
  priority: 'normal' | 'priority';
  notes: string;
  status: 'pending' | 'selected' | 'completed';
}

export default function CsvSampleList() {
  const [samples, setSamples] = useState<ParsedSample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent about CSV upload status
  useEffect(() => {
    const hasCsvData = samples.length > 0;
    
    window.dispatchEvent(new CustomEvent('csvStatusChange', {
      detail: { hasCsvData }
    }));
  }, [samples]);

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

      // Parse CSV data into sample objects
      const parsedSamples: ParsedSample[] = data.map((row, index) => ({
        id: `csv-${index}`,
        label: row['Sample ID'] || row['label'] || `Sample-${index + 1}`,
        sampleType: (row['Sample Type'] || row['sampleType'] || 'clinical').toLowerCase() as 'clinical' | 'environmental',
        collectionSource: row['Collection Source'] || row['collectionSource'] || '',
        collectionSite: row['Collection Site'] || row['collectionSite'] || '',
        collectionDate: row['Collection Date'] || row['collectionDate'] || '',
        priority: (row['Priority'] || row['priority'] || 'normal').toLowerCase() as 'normal' | 'priority',
        notes: row['Notes'] || row['notes'] || '',
        status: 'pending'
      }));

      setSamples(parsedSamples);
    };
    reader.readAsText(file);
  };

  const handleSampleSelect = (sample: ParsedSample) => {
    // Update selected sample
    setSelectedSampleId(sample.id);
    setSamples(prev => prev.map(s => ({
      ...s,
      status: s.id === sample.id ? 'selected' : s.status === 'selected' ? 'pending' : s.status
    })));

    // Dispatch custom event to prefill form
    window.dispatchEvent(new CustomEvent('prefillForm', {
      detail: {
        label: sample.label,
        sampleType: sample.sampleType,
        collectionSource: sample.collectionSource,
        collectionSite: sample.collectionSite,
        collectionDate: sample.collectionDate,
        priority: sample.priority,
        notes: sample.notes
      }
    }));
  };

  const markSampleCompleted = (sampleId: string) => {
    setSamples(prev => prev.map(s => 
      s.id === sampleId ? { ...s, status: 'completed' } : s
    ));
  };

  // Listen for form submission success
  useEffect(() => {
    const handleFormSuccess = () => {
      if (selectedSampleId) {
        markSampleCompleted(selectedSampleId);
        setSelectedSampleId(null);
      }
    };

    window.addEventListener('isolateCreated', handleFormSuccess);
    return () => window.removeEventListener('isolateCreated', handleFormSuccess);
  }, [selectedSampleId]);

  const downloadTemplate = () => {
    const csvContent = 'Sample ID,Sample Type,Collection Source,Collection Site,Collection Date,Priority,Notes\n' +
      'LAB-2024-001,clinical,blood,"Ward 3A Room 205",2024-01-15,normal,Sample collection notes';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isolate_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearSamples = () => {
    if (samples.some(s => s.status !== 'completed')) {
      const confirmed = window.confirm('You have unprocessed samples. Are you sure you want to clear the list?');
      if (!confirmed) return;
    }
    setSamples([]);
    setSelectedSampleId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = (status: ParsedSample['status']) => {
    switch (status) {
      case 'pending': return 'border-l-gray-400 bg-white';
      case 'selected': return 'border-l-blue-500 bg-blue-50';
      case 'completed': return 'border-l-green-500 bg-green-50';
    }
  };

  const getStatusIcon = (status: ParsedSample['status']) => {
    switch (status) {
      case 'pending':
        return <span className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'selected':
        return <span className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'completed':
        return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>;
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <ComponentFeedback componentName="CsvSampleList" />
      
      {/* Upload Section */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={downloadTemplate}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
          >
            Download Template
          </button>
          {samples.length > 0 && (
            <button
              onClick={clearSamples}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
            >
              Clear List
            </button>
          )}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Upload CSV File
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Upload CSV to prefill samples
          </p>
        </div>
      </div>

      {/* Sample List */}
      {samples.length > 0 && (
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Samples ({samples.filter(s => s.status === 'completed').length}/{samples.length} completed)
            </h3>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleSelect(sample)}
                disabled={sample.status === 'completed'}
                className={`text-left p-3 border-l-4 rounded transition-colors hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${getStatusColor(sample.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {sample.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {sample.sampleType} • {sample.collectionSite}
                    </p>
                    {sample.collectionDate && (
                      <p className="text-xs text-gray-400">
                        {new Date(sample.collectionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    {getStatusIcon(sample.status)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {samples.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          No CSV file uploaded
        </div>
      )}
    </div>
  );
}