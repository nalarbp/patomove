'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import ComponentFeedback from './ComponentFeedback';

interface GenomeData {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  validationStatus: 'pending' | 'valid' | 'invalid';
  processingStatus: 'uploaded' | 'validated' | 'analyzing' | 'completed' | 'failed';
  contigCount?: number;
  totalLength?: number;
  n50?: number;
  gcContent?: number;
  primaryIsolate: Array<{ id: string; label: string }>;
  analysisIsolates: Array<{ id: string; label: string }>;
}

export default function GenomeLibrary() {
  const [genomes, setGenomes] = useState<GenomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'name'>('date');

  useEffect(() => {
    fetchGenomes();
  }, []);

  useEffect(() => {
    // Poll for updates every 1 minute if there are genomes being analyzed
    const interval = setInterval(() => {
      if (genomes.some(g => g.processingStatus === 'analyzing' || g.validationStatus === 'pending')) {
        fetchGenomes();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [genomes]);

  const fetchGenomes = async () => {
    try {
      const response = await fetch('/api/genomics');
      if (response.ok) {
        const data = await response.json();
        setGenomes(data);
      } else {
        console.error('Failed to fetch genomes');
      }
    } catch (error) {
      console.error('Error fetching genomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedGenomes = genomes
    .filter(genome => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        genome.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        genome.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || genome.validationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'size':
          return b.fileSize - a.fileSize;
        case 'name':
          return a.originalFilename.localeCompare(b.originalFilename);
        default:
          return 0;
      }
    });

  const getStatusIcon = (validationStatus: string, processingStatus: string) => {
    if (processingStatus === 'analyzing') {
      return <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>;
    }
    
    switch (validationStatus) {
      case 'valid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (validationStatus: string, processingStatus: string) => {
    if (processingStatus === 'analyzing') {
      return 'bg-orange-100 text-orange-800';
    }

    switch (validationStatus) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startAnalysis = async (genomeId: string) => {
    try {
      // TODO: Implement pipeline submission for genome
      console.log('Starting analysis for genome:', genomeId);
      alert('Analysis pipeline integration coming soon!');
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };

  const deleteGenome = async (genomeId: string) => {
    if (!confirm('Are you sure you want to delete this genome file? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/genomics/${genomeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGenomes(prev => prev.filter(g => g.id !== genomeId));
      } else {
        alert('Failed to delete genome file');
      }
    } catch (error) {
      console.error('Error deleting genome:', error);
      alert('Error deleting genome file');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <ComponentFeedback componentName="GenomeLibrary" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Genome Library</h2>
            <p className="text-sm text-gray-600">
              {genomes.length} files • {genomes.filter(g => g.validationStatus === 'valid').length} validated
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'size' | 'name')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genome List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedGenomes.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No genome files found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload genome files to get started with genomic analysis.'
              }
            </p>
          </div>
        ) : (
          filteredAndSortedGenomes.map((genome) => (
            <div key={genome.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(genome.validationStatus, genome.processingStatus)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {genome.originalFilename}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(genome.validationStatus, genome.processingStatus)}`}>
                        {genome.processingStatus === 'analyzing' ? 'Analyzing' : genome.validationStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(genome.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(genome.uploadDate)}</span>
                      <span>•</span>
                      <span>by {genome.uploadedBy}</span>
                      {genome.contigCount && (
                        <>
                          <span>•</span>
                          <span>{genome.contigCount} contigs</span>
                        </>
                      )}
                    </div>

                    {/* Quality Metrics */}
                    {genome.validationStatus === 'valid' && (genome.n50 || genome.gcContent) && (
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        {genome.n50 && <span>N50: {genome.n50.toLocaleString()} bp</span>}
                        {genome.gcContent && <span>GC: {genome.gcContent}%</span>}
                        {genome.totalLength && <span>Length: {(genome.totalLength / 1000000).toFixed(1)}M bp</span>}
                      </div>
                    )}

                    {/* Linked Isolates */}
                    {(genome.primaryIsolate.length > 0 || genome.analysisIsolates.length > 0) && (
                      <div className="mt-2 text-xs text-gray-600">
                        {genome.primaryIsolate.length > 0 && (
                          <span>Primary: {genome.primaryIsolate.map(i => i.label).join(', ')}</span>
                        )}
                        {genome.analysisIsolates.length > 0 && (
                          <span>
                            {genome.primaryIsolate.length > 0 ? ' • ' : ''}
                            Analyzed: {genome.analysisIsolates.map(i => i.label).join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {genome.validationStatus === 'valid' && genome.processingStatus !== 'analyzing' && (
                    <button
                      onClick={() => startAnalysis(genome.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Start Analysis"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteGenome(genome.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete File"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredAndSortedGenomes.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedGenomes.length} of {genomes.length} files
            </span>
            <button
              onClick={fetchGenomes}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}