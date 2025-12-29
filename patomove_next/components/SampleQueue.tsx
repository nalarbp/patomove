'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ComponentFeedback from './ComponentFeedback';

interface Isolate {
  id: string;
  sampleId: string;
  submitterOrg: string;
  collectionDate: string;
  collectionSource: string;
  processingStage: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

export default function SampleQueue() {
  const [samples, setSamples] = useState<Isolate[]>([]);
  const [loading, setLoading] = useState(true);

  const getProcessingStage = (isolate: any) => {
    if (!isolate.phenotypeProfile) return 'Culture';
    if (!isolate.phenotypeProfile.species) return 'Identification';  
    if (!isolate.phenotypeProfile.micData) return 'AST';
    if (!isolate.genomicData?.length) return 'Genomic Analysis';
    return 'Complete';
  };

  const getSubmitterOrg = (isolate: any) => {
    return isolate.organization?.name || 'Unknown';
  };

  const getCollectionSource = (isolate: any) => {
    if (isolate.patient) {
      return 'Clinical';
    } else if (isolate.environment) {
      return isolate.environment.siteName || 'Environmental';
    }
    return isolate.collectionSource || 'Unknown';
  };

  const getPriority = (isolate: any): 'urgent' | 'high' | 'normal' | 'low' => {
    const priorities: ('urgent' | 'high' | 'normal' | 'low')[] = ['normal', 'high', 'urgent', 'low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  };

  const fetchSamples = async () => {
    try {
      const response = await fetch('/api/isolates');
      const data = await response.json();
      
      //get latest 10 isolates sorted by collection date
      const sortedData = Array.isArray(data) ? data.sort((a: any, b: any) => 
        new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime()
      ) : [];
      
      const transformedSamples = sortedData.slice(0, 10).map((isolate: any) => ({
        id: isolate.id,
        sampleId: isolate.label,
        submitterOrg: getSubmitterOrg(isolate),
        collectionDate: isolate.collectionDate,
        collectionSource: getCollectionSource(isolate),
        processingStage: getProcessingStage(isolate),
        priority: getPriority(isolate)
      }));

      setSamples(transformedSamples);
    } catch (error) {
      console.error('Failed to fetch samples:', error);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Culture': return 'bg-blue-100 text-blue-800';
      case 'Identification': return 'bg-purple-100 text-purple-800';
      case 'AST': return 'bg-orange-100 text-orange-800';
      case 'Genomic Analysis': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white rounded-lg shadow p-6">
        <ComponentFeedback componentName="SampleQueue" />
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow">
      <ComponentFeedback componentName="SampleQueue" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Samples</h2>
          <span className="text-sm text-gray-500">{samples.length} latest samples</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Sample ID</th>
                <th className="text-left py-3 font-medium text-gray-700">Submitter Org</th>
                <th className="text-left py-3 font-medium text-gray-700">Collection Date</th>
                <th className="text-left py-3 font-medium text-gray-700">Collection Source</th>
                <th className="text-left py-3 font-medium text-gray-700">Processing Stage</th>
                <th className="text-left py-3 font-medium text-gray-700">Priority Status</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample) => (
                <tr key={sample.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <Link
                      href={`/path-lab/isolates/${sample.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {sample.sampleId}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600">{sample.submitterOrg}</td>
                  <td className="py-3 text-gray-500">
                    {new Date(sample.collectionDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-gray-600">{sample.collectionSource}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(sample.processingStage)}`}>
                      {sample.processingStage}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(sample.priority)}`}>
                      {sample.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {samples.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recent samples found
          </div>
        )}
      </div>
    </div>
  );
}