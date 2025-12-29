'use client';

import { useState } from 'react';
import { 
  exportElementToPDF, 
  generateSampleReportFilename, 
  showExportSuccess, 
  showExportError 
} from '@/lib/pdfExport';

interface ExportButtonProps {
  elementId: string;
  sampleLabel: string;
  className?: string;
  children: React.ReactNode;
}

export default function ExportButton({ 
  elementId, 
  sampleLabel, 
  className = '', 
  children 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      const filename = generateSampleReportFilename(sampleLabel);
      await exportElementToPDF(elementId, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        margin: 15
      });
      showExportSuccess(filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showExportError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className={`${className} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''} relative`}
    >
      {isExporting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={isExporting ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}