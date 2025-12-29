'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ComponentFeedback from '@/components/ComponentFeedback';
import AddIsolateForm from '@/components/AddIsolateForm';
import CsvSampleList from '@/components/CsvSampleList';

export default function SampleManagement() {
  const [hasCsvData, setHasCsvData] = useState(false);
  const router = useRouter();

  // Listen for CSV upload status from CsvSampleList
  useEffect(() => {
    const handleCsvStatus = (event: CustomEvent) => {
      setHasCsvData(event.detail.hasCsvData);
    };

    window.addEventListener('csvStatusChange', handleCsvStatus as EventListener);
    return () => window.removeEventListener('csvStatusChange', handleCsvStatus as EventListener);
  }, []);

  // Navigation warning when CSV is uploaded
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasCsvData) {
        e.preventDefault();
        e.returnValue = 'You have uploaded CSV data. Are you sure you want to leave?';
      }
    };

    if (hasCsvData) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasCsvData]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ComponentFeedback componentName="SampleManagement" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Isolate/s</h1>
        <p className="text-gray-600 mt-1">Create isolate records individually or import from CSV for bulk prefilling</p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left Panel - CSV Import */}
        <div className="w-1/3 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV Import (Optional)</h2>
          <p className="text-gray-600 mb-4 text-sm">Upload a CSV file to prefill samples. Select each sample to populate the form.</p>
          
          <CsvSampleList />
        </div>

        {/* Right Panel - Individual Form */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Details</h2>
          <p className="text-gray-600 mb-6 text-sm">Enter or review sample information before submission</p>
          
          <AddIsolateForm />
        </div>
      </div>
    </div>
  );
}