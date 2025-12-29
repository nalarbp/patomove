import Link from 'next/link';
import ComponentFeedback from '@/components/ComponentFeedback';
import PipelineStatus from '@/components/PipelineStatus';

interface IsolatePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Real API call to get isolate data  
async function getIsolateData(id: string) {
  try {
    // Use direct database access for server-side rendering
    const { prisma } = await import('@/app/lib/prisma');
    
    const isolate = await prisma.isolate.findUnique({
      where: { id },
      include: {
        organization: true,
        patient: true,
        environment: true,
        phenotypeProfile: true,
        genome: true,
        genomicData: true,
        treatments: true
      }
    });

    return isolate;
  } catch (error) {
    console.error('Error fetching isolate:', error);
    return null;
  }
}

export default async function IsolatePage({ params }: IsolatePageProps) {
  const { id } = await params;
  const isolate = await getIsolateData(id);

  // Handle not found case
  if (!isolate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Isolate Not Found</h1>
          <p className="text-gray-600 mb-6">The requested isolate could not be found.</p>
          <Link 
            href="/path-lab/isolates" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Browse Isolates
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getProcessingStage = () => {
    if (!isolate.phenotypeProfile) return 'Culture';
    if (!isolate.phenotypeProfile.species) return 'Identification';  
    if (!isolate.phenotypeProfile.micData) return 'AST';
    if (!isolate.genomicData?.length) return 'Genomic Analysis';
    return 'Complete';
  };

  const getProcessingStatusDisplay = () => {
    if (!isolate.processingStatus) return 'Unknown';
    return isolate.processingStatus
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'priority': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stage = getProcessingStage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <Link href="/path-lab/isolates" className="hover:text-gray-700">
            ← Back to Browse Isolates
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="relative bg-white rounded-lg shadow">
        <ComponentFeedback componentName="IsolateDetailPage" />
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isolate.label}</h1>
              <p className="text-gray-600 mt-1">
                Collected {formatDate(isolate.collectionDate.toString())} from {isolate.collectionSource}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(isolate.priority || 'normal')}`}>
                {isolate.priority} priority
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stage === 'Complete' ? 'bg-green-100 text-green-800' :
                stage === 'Culture' ? 'bg-blue-100 text-blue-800' :
                stage === 'Identification' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {stage}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Sample Information */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sample Information</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sample ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{isolate.label}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Collection Source</dt>
                    <dd className="text-sm text-gray-900">{isolate.collectionSource}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Collection Site</dt>
                    <dd className="text-sm text-gray-900">{isolate.collectionSite}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Collection Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(isolate.collectionDate.toString())}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Processing Status</dt>
                    <dd className="text-sm text-gray-900">{getProcessingStatusDisplay()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="text-sm text-gray-900">{isolate.organization.name}</dd>
                  </div>
                </dl>
              </div>

              {/* Patient/Environment Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
  {isolate.patient ? 'Patient Information' : isolate.environment ? 'Environmental Information' : 'Sample Information'}
                </h2>
                {isolate.patient ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{isolate.patient.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sex</dt>
                      <dd className="text-sm text-gray-900">{isolate.patient.sex}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="text-sm text-gray-900">{isolate.patient.dateOfBirth ? formatDate(isolate.patient.dateOfBirth.toString()) : 'Unknown'}</dd>
                    </div>
                  </dl>
                ) : isolate.environment ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Site Name</dt>
                      <dd className="text-sm text-gray-900">{isolate.environment.siteName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Facility Type</dt>
                      <dd className="text-sm text-gray-900">{isolate.environment.facilityType}</dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sample Type</dt>
                      <dd className="text-sm text-gray-900 capitalize">{isolate.sampleType}</dd>
                    </div>
                    {isolate.genome && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Genome File</dt>
                        <dd className="text-sm text-gray-900">
                          <span className="font-mono text-xs">{isolate.genome.filename}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            isolate.genome.validationStatus === 'valid' ? 'bg-green-100 text-green-800' :
                            isolate.genome.validationStatus === 'invalid' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isolate.genome.validationStatus}
                          </span>
                        </dd>
                      </div>
                    )}
                    {isolate.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900">{isolate.notes}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>

              {/* Laboratory Results */}
              {isolate.phenotypeProfile && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Laboratory Results</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Species</dt>
                      <dd className="text-sm text-gray-900 font-medium">{isolate.phenotypeProfile.species}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Method</dt>
                      <dd className="text-sm text-gray-900">{isolate.phenotypeProfile.method}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Test Date</dt>
                      <dd className="text-sm text-gray-900">{isolate.phenotypeProfile.testDate ? formatDate(isolate.phenotypeProfile.testDate.toString()) : 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Confidence</dt>
                      <dd className="text-sm text-gray-900">{isolate.phenotypeProfile.confidence}%</dd>
                    </div>
                  </dl>
                  
                  {isolate.phenotypeProfile.micData && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">MIC Results</dt>
                      <dd className="text-sm text-gray-900 bg-white p-3 rounded border font-mono">
                        {Object.entries(JSON.parse(isolate.phenotypeProfile.micData)).map(([drug, mic]) => (
                          <div key={drug} className="flex justify-between py-1">
                            <span>{drug}:</span>
                            <span className="font-medium">{String(mic)}</span>
                          </div>
                        ))}
                      </dd>
                    </div>
                  )}
                </div>
              )}

              {/* Genomic Data */}
              {isolate.genomicData && isolate.genomicData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Genomic Analysis</h2>
                  {isolate.genomicData.map((genomic, index) => (
                    <div key={index}>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Platform</dt>
                          <dd className="text-sm text-gray-900">{genomic.sequencingPlatform || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">MLST Scheme</dt>
                          <dd className="text-sm text-gray-900">{genomic.mlstScheme || 'Not available'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">MLST Type</dt>
                          <dd className="text-sm text-gray-900 font-mono">{genomic.mlstType || 'Not available'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Analysis Status</dt>
                          <dd className="text-sm text-gray-900">{genomic.analysisCompleted ? 'Completed' : 'In Progress'}</dd>
                        </div>
                        {genomic.assemblyPath && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Assembly File</dt>
                            <dd className="text-sm text-gray-900 font-mono text-xs break-all">{genomic.assemblyPath}</dd>
                          </div>
                        )}
                        {genomic.createdAt && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Analysis Date</dt>
                            <dd className="text-sm text-gray-900">{formatDate(genomic.createdAt.toString())}</dd>
                          </div>
                        )}
                      </dl>
                      
                      {/* Resistance Genes */}
                      {genomic.resistanceGenes && (
                        <div className="mt-4">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Resistance Genes</dt>
                          <dd className="text-sm text-gray-900 bg-white p-3 rounded border">
                            {(() => {
                              try {
                                const genes = JSON.parse(genomic.resistanceGenes);
                                if (Array.isArray(genes)) {
                                  return genes.map((gene, idx) => (
                                    <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                                      <span className="font-medium">{gene.gene}</span>
                                      <span className="text-xs text-gray-500">{gene.class} ({gene.identity}% identity)</span>
                                    </div>
                                  ));
                                } else {
                                  return <span className="text-gray-500">No resistance genes detected</span>;
                                }
                              } catch {
                                return <span className="text-gray-500">Data format error</span>;
                              }
                            })()}
                          </dd>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pipeline Status */}
              <PipelineStatus 
                isolateLabel={isolate.label}
                genome={isolate.genome}
              />

              {/* Treatment Outcomes */}
              {isolate.treatments && isolate.treatments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Treatment Outcomes</h2>
                  <div className="space-y-3">
                    {isolate.treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <div className="font-medium text-gray-900">{treatment.antibiotic}</div>
                          <div className="text-sm text-gray-500">
                            Started {formatDate(treatment.startDate.toString())}
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

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Update Status
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Add Note
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Export Data
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    View Related
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}