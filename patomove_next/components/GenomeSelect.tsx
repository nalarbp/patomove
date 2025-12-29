'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface GenomeSelectProps {
  value: string | null;
  onChange: (genomeId: string | null) => void;
  required?: boolean;
  error?: string;
}

interface GenomeOption {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  validationStatus: 'pending' | 'valid' | 'invalid';
  uploadDate: string;
  contigCount?: number;
  n50?: number;
}

export default function GenomeSelect({ value, onChange, required = false, error }: GenomeSelectProps) {
  const [genomes, setGenomes] = useState<GenomeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValidGenomes();
  }, []);

  const fetchValidGenomes = async () => {
    try {
      const response = await fetch('/api/genomics');
      if (response.ok) {
        const data = await response.json();
        // Only show valid genomes for selection
        const validGenomes = data.filter((g: GenomeOption) => g.validationStatus === 'valid');
        setGenomes(validGenomes);
      } else {
        console.error('Failed to fetch genomes');
      }
    } catch (error) {
      console.error('Error fetching genomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Genome File {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Genome File {required && <span className="text-red-500">*</span>}
      </label>
      
      {genomes.length === 0 ? (
        <div className="border border-gray-300 rounded-md p-4 text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">No validated genome files available</p>
          <Link 
            href="/path-lab/genomes"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Upload Genome Files
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a genome file...</option>
            {genomes.map((genome) => (
              <option key={genome.id} value={genome.id}>
                {genome.originalFilename} ({formatFileSize(genome.fileSize)})
                {genome.contigCount && ` • ${genome.contigCount} contigs`}
              </option>
            ))}
          </select>

          {/* Selected Genome Details */}
          {value && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              {(() => {
                const selectedGenome = genomes.find(g => g.id === value);
                if (!selectedGenome) return null;

                return (
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(selectedGenome.validationStatus)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedGenome.originalFilename}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-blue-700">
                        <span>{formatFileSize(selectedGenome.fileSize)}</span>
                        {selectedGenome.contigCount && (
                          <span>{selectedGenome.contigCount} contigs</span>
                        )}
                        {selectedGenome.n50 && (
                          <span>N50: {selectedGenome.n50.toLocaleString()} bp</span>
                        )}
                        <span>Validated</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Upload Link */}
          <div className="text-center">
            <Link 
              href="/path-lab/genomes"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Need to upload a new genome file?
            </Link>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}