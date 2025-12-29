import Link from 'next/link';
import ComponentFeedback from '@/components/ComponentFeedback';

interface IsolatePageProps {
  params: {
    id: string;
  };
}

// Mock function to get isolate data - replace with real API call
async function getIsolateData(id: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock isolate data based on ID
  const isolateNumber = parseInt(id.replace('isolate-', '')) || 1;
  
  const filterOptions = {
    species: ['Escherichia coli', 'Staphylococcus aureus', 'Klebsiella pneumoniae', 'Pseudomonas aeruginosa', 'Enterococcus faecium'],
    sources: ['Blood', 'Urine', 'Wound', 'Sputum', 'CSF', 'Environmental'],
    sites: ['ICU', 'Emergency Department', 'Medical Ward', 'Surgical Ward', 'Outpatient']
  };

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const seed = isolateNumber;
  const baseDate = new Date('2024-12-01').getTime();
  const dayOffset = Math.floor(seededRandom(seed) * 30);

  return {
    id: `isolate-${seed}`,
    label: `ISO-2024-${String(seed).padStart(3, '0')}`,
    collectionDate: new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000).toISOString(),
    collectionSource: filterOptions.sources[Math.floor(seededRandom(seed + 1) * filterOptions.sources.length)],
    collectionSite: filterOptions.sites[Math.floor(seededRandom(seed + 2) * filterOptions.sites.length)],
    priority: (['urgent', 'high', 'normal', 'low'] as const)[Math.floor(seededRandom(seed + 3) * 4)],
    processingStatus: 'in_progress',
    organization: {
      name: 'Queensland Health Pathology',
      type: 'pathlab'
    },
    patient: seededRandom(seed + 4) > 0.3 ? {
      id: `P${String(Math.floor(seededRandom(seed + 5) * 10000)).padStart(4, '0')}`,
      sex: seededRandom(seed + 6) > 0.5 ? 'M' : 'F',
      dateOfBirth: new Date(baseDate - seededRandom(seed + 7) * 365 * 24 * 60 * 60 * 1000 * 50).toISOString()
    } : undefined,
    environment: seededRandom(seed + 7) > 0.7 ? {
      siteName: 'Environmental Sample Site',
      facilityType: 'Hospital'
    } : undefined,
    phenotypeProfile: seededRandom(seed + 8) > 0.2 ? {
      species: filterOptions.species[Math.floor(seededRandom(seed + 9) * filterOptions.species.length)],
      method: 'MALDI-TOF',
      testDate: new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString(),
      confidence: Math.floor(seededRandom(seed + 10) * 30) + 70,
      micData: JSON.stringify({
        'Ampicillin': `${Math.floor(seededRandom(seed + 11) * 32) + 1} μg/mL`,
        'Ciprofloxacin': `${Math.floor(seededRandom(seed + 12) * 16) + 1} μg/mL`,
        'Vancomycin': `${Math.floor(seededRandom(seed + 13) * 8) + 1} μg/mL`
      })
    } : undefined,
    genomicData: seededRandom(seed + 11) > 0.5 ? [{
      sequencingDate: new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000).toISOString(),
      platform: (['Illumina NextSeq', 'Oxford Nanopore', 'Ion Torrent'] as const)[Math.floor(seededRandom(seed + 12) * 3)],
      coverage: Math.floor(seededRandom(seed + 13) * 100) + 50,
      species: filterOptions.species[Math.floor(seededRandom(seed + 9) * filterOptions.species.length)],
      mlst: `ST${Math.floor(seededRandom(seed + 14) * 500) + 1}`,
      pipeline: 'Unicycler v0.4.8',
      cleanReadsQc: { quality_score: Math.floor(seededRandom(seed + 15) * 10) + 20 },
      cleanAssemblyQc: { n50: Math.floor(seededRandom(seed + 16) * 100000) + 50000 }
    }] : undefined,
    treatments: seededRandom(seed + 17) > 0.6 ? [{
      antibiotic: 'Ciprofloxacin',
      startDate: new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000 + 5 * 24 * 60 * 60 * 1000).toISOString(),
      outcome: (['success', 'failure', 'ongoing'] as const)[Math.floor(seededRandom(seed + 18) * 3)]
    }] : undefined
  };
}

export default async function IsolatePage({ params }: IsolatePageProps) {
  const isolate = await getIsolateData(params.id);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
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
                Collected {formatDate(isolate.collectionDate)} from {isolate.collectionSource}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(isolate.priority)}`}>
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
                    <dd className="text-sm text-gray-900">{formatDate(isolate.collectionDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Processing Status</dt>
                    <dd className="text-sm text-gray-900">{stage}</dd>
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
                  {isolate.patient ? 'Patient Information' : 'Environmental Information'}
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
                      <dd className="text-sm text-gray-900">{formatDate(isolate.patient.dateOfBirth)}</dd>
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
                  <p className="text-sm text-gray-500">No patient or environmental data available</p>
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
                      <dd className="text-sm text-gray-900">{formatDate(isolate.phenotypeProfile.testDate)}</dd>
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
                            <span className="font-medium">{mic}</span>
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
                          <dd className="text-sm text-gray-900">{genomic.platform}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Coverage</dt>
                          <dd className="text-sm text-gray-900">{genomic.coverage}x</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">MLST</dt>
                          <dd className="text-sm text-gray-900 font-mono">{genomic.mlst}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Pipeline</dt>
                          <dd className="text-sm text-gray-900">{genomic.pipeline}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Sequencing Date</dt>
                          <dd className="text-sm text-gray-900">{formatDate(genomic.sequencingDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Species Confirmation</dt>
                          <dd className="text-sm text-gray-900">{genomic.species}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}

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
                            Started {formatDate(treatment.startDate)}
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