'use client';

import { useState, useEffect } from 'react';
import ComponentFeedback from './ComponentFeedback';

interface SampleDetailModalProps {
  sampleId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SampleDetail {
  id: string;
  label: string;
  collectionDate: string;
  collectionSource: string;
  collectionSite: string;
  priority: string;
  processingStatus: string;
  organization: {
    name: string;
    type: string;
  };
  patient?: {
    id: string;
    sex: string;
    dateOfBirth: string;
  };
  environment?: {
    siteName: string;
    facilityType: string;
  };
  phenotypeProfile?: {
    species: string;
    method: string;
    testDate: string;
    confidence: number;
    micData: any;
  };
  genomicData?: Array<{
    sequencingDate: string;
    platform: string;
    coverage: number;
    species: string;
    mlst: string;
    pipeline: string;
    cleanReadsQc: any;
    cleanAssemblyQc: any;
  }>;
  treatments?: Array<{
    antibiotic: string;
    startDate: string;
    outcome: string;
  }>;
}

export default function SampleDetailModal({ sampleId, isOpen, onClose }: SampleDetailModalProps) {
  const [sampleDetail, setSampleDetail] = useState<SampleDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sampleId) {
      fetchSampleDetail();
    }
  }, [isOpen, sampleId]);

  const fetchSampleDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/isolates/${sampleId}`);
      const data = await response.json();
      setSampleDetail(data);
    } catch (error) {
      console.error('Failed to fetch sample detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getProcessingStage = (sample: SampleDetail) => {
    if (!sample.phenotypeProfile) return 'Culture';
    if (!sample.phenotypeProfile.species) return 'Identification';  
    if (!sample.phenotypeProfile.micData) return 'AST';
    if (!sample.genomicData?.length) return 'Genomic Analysis';
    return 'Complete';
  };

  const getStageIcon = (stage: string, isComplete: boolean) => {
    return isComplete ? '●' : '○';
  };

  const formatMicData = (micData: any) => {
    if (!micData) return 'No data';
    try {
      const data = typeof micData === 'string' ? JSON.parse(micData) : micData;
      return Object.entries(data).map(([drug, mic]) => 
        `${drug}: ${mic}`
      ).join(', ');
    } catch {
      return 'Invalid data';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-90vh overflow-y-auto relative">
        <ComponentFeedback componentName="SampleDetailModal" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sample Detail: {sampleDetail?.label || sampleId}
            </h2>
            {sampleDetail && (
              <p className="text-sm text-gray-500 mt-1">
                Collected {new Date(sampleDetail.collectionDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : sampleDetail ? (
            <div className="space-y-6">
              {/* Processing Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Timeline</h3>
                <div className="flex items-center space-x-8">
                  {['Culture', 'Identification', 'AST', 'Genomic Analysis', 'Complete'].map((stage, index) => {
                    const isActive = getProcessingStage(sampleDetail) === stage;
                    const isComplete = ['Culture', 'Identification', 'AST', 'Genomic Analysis'].indexOf(getProcessingStage(sampleDetail)) > index || getProcessingStage(sampleDetail) === 'Complete';
                    
                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                          isComplete ? 'bg-green-100 text-green-600' : 
                          isActive ? 'bg-blue-100 text-blue-600' : 
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {getStageIcon(stage, isComplete)}
                        </div>
                        <span className={`text-xs mt-2 ${isActive ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sample ID</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Collection Source</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.collectionSource}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Collection Site</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.collectionSite}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sampleDetail.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          sampleDetail.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sampleDetail.priority}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Patient/Source</h3>
                  <dl className="space-y-2">
                    {sampleDetail.patient ? (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                          <dd className="text-sm text-gray-900">{sampleDetail.patient.id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Sex</dt>
                          <dd className="text-sm text-gray-900">{sampleDetail.patient.sex}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(sampleDetail.patient.dateOfBirth).toLocaleDateString()}
                          </dd>
                        </div>
                      </>
                    ) : sampleDetail.environment ? (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Site Name</dt>
                          <dd className="text-sm text-gray-900">{sampleDetail.environment.siteName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Facility Type</dt>
                          <dd className="text-sm text-gray-900">{sampleDetail.environment.facilityType}</dd>
                        </div>
                      </>
                    ) : (
                      <div>
                        <dd className="text-sm text-gray-500">No patient or environment data</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Organization</dt>
                      <dd className="text-sm text-gray-900">
                        {sampleDetail.organization.name} ({sampleDetail.organization.type})
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Laboratory Results */}
              {sampleDetail.phenotypeProfile && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Laboratory Results</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Species</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.phenotypeProfile.species}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Method</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.phenotypeProfile.method}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Test Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(sampleDetail.phenotypeProfile.testDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Confidence</dt>
                      <dd className="text-sm text-gray-900">{sampleDetail.phenotypeProfile.confidence}%</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">MIC Data</dt>
                      <dd className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
                        {formatMicData(sampleDetail.phenotypeProfile.micData)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Genomic Data */}
              {sampleDetail.genomicData && sampleDetail.genomicData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Genomic Analysis</h3>
                  {sampleDetail.genomicData.map((genomic, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
                      <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Platform</dt>
                          <dd className="text-sm text-gray-900">{genomic.platform}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Coverage</dt>
                          <dd className="text-sm text-gray-900">{genomic.coverage}x</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">MLST</dt>
                          <dd className="text-sm text-gray-900">{genomic.mlst}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Pipeline</dt>
                          <dd className="text-sm text-gray-900">{genomic.pipeline}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Species Confirmation</dt>
                          <dd className="text-sm text-gray-900">{genomic.species}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Sequencing Date</dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(genomic.sequencingDate).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}

              {/* Treatment Outcomes */}
              {sampleDetail.treatments && sampleDetail.treatments.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Treatment Outcomes</h3>
                  <div className="space-y-3">
                    {sampleDetail.treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-gray-900">{treatment.antibiotic}</div>
                          <div className="text-sm text-gray-500">
                            Started {new Date(treatment.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          treatment.outcome === 'success' ? 'bg-green-100 text-green-800' :
                          treatment.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {treatment.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load sample details
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}