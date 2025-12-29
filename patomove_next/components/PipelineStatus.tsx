'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, CheckIcon, ExclamationTriangleIcon, PlayIcon } from '@heroicons/react/24/outline';

interface PipelineStatusProps {
  isolateLabel: string;
  genome?: {
    id: string;
    storagePath: string;
    filename: string;
    validationStatus: string;
  } | null;
}

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
}

export default function PipelineStatus({ isolateLabel, genome }: PipelineStatusProps) {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPipelineStatus();
  }, [isolateLabel]);

  useEffect(() => {
    // Poll for updates every 1 minute if there are active jobs
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'queued' || job.status === 'running')) {
        fetchPipelineStatus();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [jobs]);

  const fetchPipelineStatus = async () => {
    try {
      const response = await fetch('/api/pipeline/pipeline/jobs');
      if (response.ok) {
        const data = await response.json();
        console.log('Pipeline API response:', data); // Debug log
        
        // Handle different response formats
        let allJobs = [];
        if (Array.isArray(data)) {
          allJobs = data;
        } else if (data.jobs && Array.isArray(data.jobs)) {
          allJobs = data.jobs;
        } else if (typeof data === 'object' && data !== null) {
          // Convert object to array if it's a job object
          allJobs = [data];
        }
        
        // Filter jobs for this specific isolate
        const isolateJobs = allJobs.filter((job: PipelineJob) => 
          job.isolate_id === isolateLabel
        );
        
        // Get detailed status for each job
        const jobsWithDetails = await Promise.all(
          isolateJobs.map(async (job: any) => {
            try {
              const detailResponse = await fetch(`/api/pipeline/pipeline/status/${job.job_id}`);
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return { ...job, ...detailData };
              }
            } catch (error) {
              console.error('Failed to get job details:', error);
            }
            return job;
          })
        );
        
        setJobs(jobsWithDetails);
      } else {
        console.error('Pipeline API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch pipeline status:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitToPipeline = async () => {
    if (!genome || genome.validationStatus !== 'valid') {
      alert('No valid genome file available for this isolate');
      return;
    }

    setSubmitting(true);
    try {
      const hostname = window.location.origin;
      
      const pipelinePayload = {
        isolate_id: isolateLabel,
        assembly_path: genome.storagePath,
        analysis_types: ['resistance', 'mlst', 'annotation'],
        callback_url: `${hostname}/api/pipeline-webhook`,
        metadata: {
          sample_id: isolateLabel,
          genome_id: genome.id,
          genome_filename: genome.filename,
          submitted_from: 'detail_page'
        }
      };

      const response = await fetch('/api/pipeline/pipeline/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelinePayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Pipeline job submitted:', result.job_id);
        // Refresh status immediately
        setTimeout(fetchPipelineStatus, 1000);
      } else {
        alert('Failed to submit to pipeline. Please check connectivity.');
      }
    } catch (error) {
      console.error('Pipeline submission error:', error);
      alert('Pipeline submission failed. Please check connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'running':
        return <PlayIcon className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'completed':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Genomic Analysis Pipeline</h2>
        <p className="text-sm text-gray-500">Loading pipeline status...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Genomic Analysis Pipeline</h2>
        {genome && genome.validationStatus === 'valid' && jobs.length === 0 && (
          <button
            onClick={submitToPipeline}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Start Analysis'}
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-2">No genomic analysis jobs found</p>
          {(!genome || genome.validationStatus !== 'valid') && (
            <p className="text-xs text-red-500">
              {!genome ? 'No genome file linked - ' : 'Invalid genome file - '}
              cannot run analysis
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.job_id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {job.job_id.slice(0, 8)}...
                </span>
              </div>

              {job.status === 'running' && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {job.current_step ? `Step: ${job.current_step}` : 'Processing...'}
                    </span>
                    <span className="text-gray-600">{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {job.status === 'failed' && (
                <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-red-700 mb-1">Analysis failed at {job.progress}% completion</p>
                  <p className="text-xs text-red-600">
                    This may be due to file access issues or invalid assembly format. 
                    Check that the assembly file exists and is accessible to the pipeline.
                  </p>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="font-medium text-gray-500">Started</dt>
                  <dd className="text-gray-900">{formatDateTime(job.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900">{formatDateTime(job.updated_at)}</dd>
                </div>
                {job.completed_at && (
                  <div className="col-span-2">
                    <dt className="font-medium text-gray-500">Completed</dt>
                    <dd className="text-gray-900">{formatDateTime(job.completed_at)}</dd>
                  </div>
                )}
              </dl>

              {job.errors && job.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                  <dt className="text-xs font-medium text-red-700 mb-1">Errors</dt>
                  <dd className="text-xs text-red-600">
                    {job.errors.join(', ')}
                  </dd>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={fetchPipelineStatus}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}