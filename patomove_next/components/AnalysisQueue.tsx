'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface PipelineJob {
  job_id: string;
  isolate_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  current_step?: string;
  errors?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  metadata?: {
    genome_id?: string;
    filename?: string;
    file_size?: number;
    upload_type?: string;
    submitted_from?: string;
  };
}

export default function AnalysisQueue() {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchPipelineJobs();
  }, []);

  useEffect(() => {
    // Auto-refresh every 1 minute for active jobs
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'queued' || job.status === 'running')) {
        fetchPipelineJobs();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [jobs]);

  const fetchPipelineJobs = async () => {
    try {
      setError(null);
      const response = await fetch('/api/pipeline/pipeline/jobs');
      
      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Pipeline jobs response:', data);
      
      // Handle different response formats
      let allJobs: PipelineJob[] = [];
      if (Array.isArray(data)) {
        allJobs = data;
      } else if (data.jobs && Array.isArray(data.jobs)) {
        allJobs = data.jobs;
      } else if (typeof data === 'object' && data !== null) {
        allJobs = [data];
      }
      
      // Sort by creation date (newest first)
      allJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setJobs(allJobs);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch pipeline jobs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'running':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (start: string, end?: string): string => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getJobType = (job: PipelineJob): string => {
    if (job.metadata?.upload_type === 'genome_validation') {
      return 'Genome Validation';
    }
    if (job.isolate_id.startsWith('genome_')) {
      return 'Genome Analysis';
    }
    return 'Sample Analysis';
  };

  const getJobTitle = (job: PipelineJob): string => {
    if (job.metadata?.filename) {
      return job.metadata.filename;
    }
    // For genome jobs, extract just the ID part
    if (job.isolate_id.startsWith('genome_')) {
      const genomeId = job.isolate_id.replace('genome_', '');
      return genomeId !== 'undefined' ? `Genome ${genomeId.slice(0, 8)}...` : 'Unknown Genome';
    }
    return job.isolate_id;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <h2 className="text-lg font-medium text-gray-900">Loading Pipeline Status...</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Analysis Queue</h2>
            <p className="text-sm text-gray-600">
              Real-time pipeline status • {jobs.length} total jobs
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">
              Last updated: {formatDate(lastRefresh.toISOString())}
            </span>
            <button
              onClick={fetchPipelineJobs}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Refresh"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Pipeline Connection Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="divide-y divide-gray-200">
        {jobs.length === 0 && !error ? (
          <div className="p-12 text-center">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No pipeline jobs found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload genome files or submit samples for analysis to see jobs here.
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.job_id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(job.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {getJobTitle(job)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getJobType(job)} • Job ID: {job.job_id.slice(0, 8)}...
                      </p>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>

                  {/* Progress Bar for Running Jobs */}
                  {job.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">
                          {job.current_step || 'Processing...'}
                        </span>
                        <span className="text-gray-600">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Started:</span><br />
                      {formatDate(job.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span><br />
                      {formatDuration(job.created_at, job.completed_at)}
                    </div>
                  </div>

                  {/* Metadata */}
                  {job.metadata && (
                    <div className="mt-3 text-xs">
                      <div className="flex items-center space-x-4 text-gray-500">
                        {job.metadata.file_size && (
                          <span>Size: {(job.metadata.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        )}
                        {job.metadata.submitted_from && (
                          <span>From: {job.metadata.submitted_from.replace('_', ' ')}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {job.errors && job.errors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                      <div className="text-xs text-red-600 space-y-1">
                        {job.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {jobs.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Queued: {jobs.filter(j => j.status === 'queued').length}</span>
              <span>Running: {jobs.filter(j => j.status === 'running').length}</span>
              <span>Completed: {jobs.filter(j => j.status === 'completed').length}</span>
              <span>Failed: {jobs.filter(j => j.status === 'failed').length}</span>
            </div>
            <span>Pipeline: http://100.120.129.79:3456</span>
          </div>
        </div>
      )}
    </div>
  );
}