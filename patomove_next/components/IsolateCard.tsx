'use client';

import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import ComponentFeedback from './ComponentFeedback';

interface IsolateCardProps {
  isolate: {
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
    };
    environment?: {
      siteName: string;
      facilityType: string;
    };
    phenotypeProfile?: {
      species: string;
      confidence: number;
    };
    genomicData?: Array<{
      platform: string;
      coverage: number;
    }>;
  };
  onDelete?: (isolateId: string) => void;
}

export default function IsolateCard({ isolate, onDelete }: IsolateCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = confirm(
      `Are you sure you want to delete isolate "${isolate.label}"?\n\nThis action cannot be undone and will permanently remove all associated data including genomic analysis results.`
    );
    
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`/api/isolates/${isolate.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (onDelete) {
          onDelete(isolate.id);
        }
      } else {
        alert('Failed to delete isolate. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete isolate. Please check your connection.');
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getProcessingStage = () => {
    if (!isolate.phenotypeProfile) return 'Culture';
    if (!isolate.phenotypeProfile.species) return 'Identification';
    if (!isolate.genomicData?.length) return 'AST';
    return 'Complete';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Culture': return 'bg-blue-100 text-blue-800';
      case 'Identification': return 'bg-purple-100 text-purple-800';
      case 'AST': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stage = getProcessingStage();

  return (
    <div className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-6">
      <ComponentFeedback componentName="IsolateCard" />
      <Link href={`/path-lab/isolates/${isolate.id}`} className="block">
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                  {isolate.label}
                </h3>
                <p className="text-sm text-gray-500">
                  Collected {formatDate(isolate.collectionDate)}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                    title="Delete isolate"
                    type="button"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(isolate.priority)}`}>
                    {isolate.priority}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
                  {stage}
                </span>
              </div>
            </div>

            {/* Sample Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <p className="text-gray-600">{isolate.collectionSource}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Site:</span>
                <p className="text-gray-600">{isolate.collectionSite}</p>
              </div>
            </div>

            {/* Patient/Environment Info */}
            <div className="text-sm">
              {isolate.patient ? (
                <div>
                  <span className="font-medium text-gray-700">Patient:</span>
                  <p className="text-gray-600">
                    ID: {isolate.patient.id} - {isolate.patient.sex}
                  </p>
                </div>
              ) : isolate.environment ? (
                <div>
                  <span className="font-medium text-gray-700">Environment:</span>
                  <p className="text-gray-600">
                    {isolate.environment.siteName} ({isolate.environment.facilityType})
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-gray-500">No patient or environment data</span>
                </div>
              )}
            </div>

            {/* Laboratory Results */}
            {isolate.phenotypeProfile && (
              <div className="bg-gray-50 rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Species:</span>
                    <p className="text-gray-900 font-medium">{isolate.phenotypeProfile.species}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-700 text-sm">Confidence:</span>
                    <p className="text-gray-900 font-medium">{isolate.phenotypeProfile.confidence}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Genomic Data Summary */}
            {isolate.genomicData && isolate.genomicData.length > 0 && (
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Platform: {isolate.genomicData[0].platform}</span>
                <span>Coverage: {isolate.genomicData[0].coverage}x</span>
              </div>
            )}

            {/* Organization */}
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              {isolate.organization.name} ({isolate.organization.type})
            </div>
          </div>
      </Link>
    </div>
  );
}