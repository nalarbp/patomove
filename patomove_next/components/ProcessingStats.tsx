'use client';

import { useEffect, useState } from 'react';
import ComponentFeedback from './ComponentFeedback';

interface ProcessingMetrics {
  totalThisWeek: number;
  totalThisMonth: number;
  processStages: {
    culture: number;
    identification: number;
    ast: number;
    genomic: number;
    completed: number;
  };
  topSubmitters: Array<{ name: string; count: number }>;
  topCollectionSites: Array<{ name: string; count: number }>;
}

export default function ProcessingStats() {
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/isolates');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const isolates = data;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const metrics: ProcessingMetrics = {
          totalThisWeek: 0,
          totalThisMonth: 0,
          processStages: {
            culture: 0,
            identification: 0,
            ast: 0,
            genomic: 0,
            completed: 0
          },
          topSubmitters: [],
          topCollectionSites: []
        };

        const submitterCounts: Record<string, number> = {};
        const siteCounts: Record<string, number> = {};

        isolates.forEach((isolate: any) => {
          const collectedDate = new Date(isolate.collectionDate);
          
          //calculate time-based totals
          if (collectedDate >= oneWeekAgo) {
            metrics.totalThisWeek++;
          }
          if (collectedDate >= oneMonthAgo) {
            metrics.totalThisMonth++;
          }
          
          //calculate process stages
          if (!isolate.phenotypeProfile) {
            metrics.processStages.culture++;
          } else if (!isolate.phenotypeProfile.species) {
            metrics.processStages.identification++;
          } else if (!isolate.phenotypeProfile.micData) {
            metrics.processStages.ast++;
          } else if (!isolate.genomicData?.length) {
            metrics.processStages.genomic++;
          } else {
            metrics.processStages.completed++;
          }

          //count submitting organizations
          const orgName = isolate.organization?.name || 'Unknown';
          submitterCounts[orgName] = (submitterCounts[orgName] || 0) + 1;

          //count collection sites
          const siteName = isolate.collectionSite || isolate.environment?.siteName || 'Unknown';
          siteCounts[siteName] = (siteCounts[siteName] || 0) + 1;
        });

        //get top 5 submitters
        metrics.topSubmitters = Object.entries(submitterCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        //get top 5 collection sites
        metrics.topCollectionSites = Object.entries(siteCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        setMetrics(metrics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="relative bg-white rounded-lg shadow p-6">
        <ComponentFeedback componentName="ProcessingStats" />
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow p-6">
      <ComponentFeedback componentName="ProcessingStats" />
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Processing Overview</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Time-based totals */}
        <div className="flex gap-4">
          <div className="bg-blue-50 text-blue-700 rounded-lg p-4 flex-1">
            <p className="text-xs font-medium opacity-75">Total This Week</p>
            <p className="text-xl font-bold mt-1">{metrics.totalThisWeek}</p>
          </div>
          <div className="bg-green-50 text-green-700 rounded-lg p-4 flex-1">
            <p className="text-xs font-medium opacity-75">Total This Month</p>
            <p className="text-xl font-bold mt-1">{metrics.totalThisMonth}</p>
          </div>
        </div>

        {/* Process stages */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Process Stages</h3>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex flex-wrap gap-x-4">
              <div className="flex justify-between min-w-0 flex-1 py-1">
                <span>Culture:</span>
                <span className="font-medium">{metrics.processStages.culture}</span>
              </div>
              <div className="flex justify-between min-w-0 flex-1 py-1">
                <span>Identification:</span>
                <span className="font-medium">{metrics.processStages.identification}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <div className="flex justify-between min-w-0 flex-1 py-1">
                <span>AST Testing:</span>
                <span className="font-medium">{metrics.processStages.ast}</span>
              </div>
              <div className="flex justify-between min-w-0 flex-1 py-1">
                <span>Genomic:</span>
                <span className="font-medium">{metrics.processStages.genomic}</span>
              </div>
            </div>
            <div className="flex justify-between py-1 border-t pt-2">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{metrics.processStages.completed}</span>
            </div>
          </div>
        </div>

        {/* Top submitters */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Top Submitting Organizations</h3>
          <div className="flex flex-col gap-2">
            {metrics.topSubmitters.map((submitter, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="truncate">{submitter.name}</span>
                <span className="font-medium ml-2">{submitter.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top collection sites */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Top Collection Sites</h3>
          <div className="flex flex-col gap-2">
            {metrics.topCollectionSites.map((site, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="truncate">{site.name}</span>
                <span className="font-medium ml-2">{site.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}