import { Suspense } from 'react';
import IsolateFilters from '@/components/IsolateFilters';
import IsolateCard from '@/components/IsolateCard';
import Pagination from '@/components/Pagination';
import ComponentFeedback from '@/components/ComponentFeedback';

interface SearchParams {
  search?: string;
  species?: string;
  sources?: string;
  sites?: string;
  from?: string;
  to?: string;
  page?: string;
}

interface BrowseIsolatesProps {
  searchParams: SearchParams;
}

// Mock data - replace with actual API call
async function getIsolatesData(searchParams: SearchParams) {
  // Mock filter options
  const filterOptions = {
    species: ['Escherichia coli', 'Staphylococcus aureus', 'Klebsiella pneumoniae', 'Pseudomonas aeruginosa', 'Enterococcus faecium'],
    sources: ['Blood', 'Urine', 'Wound', 'Sputum', 'CSF', 'Environmental'],
    sites: ['ICU', 'Emergency Department', 'Medical Ward', 'Surgical Ward', 'Outpatient']
  };

  // Use actual database count for realistic demo - we know we have 499 isolates
  const totalInDatabase = 499;
  
  // Simple pseudo-random function based on index for consistent SSR/client results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Mock isolates data - using deterministic generation for SSR compatibility
  const mockIsolates = Array.from({ length: totalInDatabase }, (_, i) => {
    const seed = i + 1;
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
        sex: seededRandom(seed + 6) > 0.5 ? 'M' : 'F'
      } : undefined,
      environment: seededRandom(seed + 7) > 0.7 ? {
        siteName: 'Environmental Sample Site',
        facilityType: 'Hospital'
      } : undefined,
      phenotypeProfile: seededRandom(seed + 8) > 0.2 ? {
        species: filterOptions.species[Math.floor(seededRandom(seed + 9) * filterOptions.species.length)],
        confidence: Math.floor(seededRandom(seed + 10) * 30) + 70
      } : undefined,
      genomicData: seededRandom(seed + 11) > 0.5 ? [{
        platform: (['Illumina NextSeq', 'Oxford Nanopore', 'Ion Torrent'] as const)[Math.floor(seededRandom(seed + 12) * 3)],
        coverage: Math.floor(seededRandom(seed + 13) * 100) + 50
      }] : undefined
    };
  });

  // Simple filtering for demo
  let filteredIsolates = mockIsolates;
  
  if (searchParams.search) {
    const search = searchParams.search.toLowerCase();
    filteredIsolates = filteredIsolates.filter(isolate =>
      isolate.label.toLowerCase().includes(search) ||
      isolate.collectionSource.toLowerCase().includes(search) ||
      isolate.phenotypeProfile?.species.toLowerCase().includes(search)
    );
  }

  if (searchParams.species) {
    const species = searchParams.species.split(',');
    filteredIsolates = filteredIsolates.filter(isolate =>
      isolate.phenotypeProfile && species.includes(isolate.phenotypeProfile.species)
    );
  }

  if (searchParams.sources) {
    const sources = searchParams.sources.split(',');
    filteredIsolates = filteredIsolates.filter(isolate =>
      sources.includes(isolate.collectionSource)
    );
  }

  const page = parseInt(searchParams.page || '1');
  const itemsPerPage = 10;
  const totalItems = filteredIsolates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedIsolates = filteredIsolates.slice(startIndex, startIndex + itemsPerPage);

  return {
    isolates: paginatedIsolates,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage
    },
    filterOptions
  };
}

export default async function BrowseIsolates({ searchParams }: BrowseIsolatesProps) {
  const data = await getIsolatesData(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Panel - Left Side */}
        <div className="w-full lg:w-1/4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <IsolateFilters
              filterOptions={data.filterOptions}
              basePath="/path-lab/isolates"
            />
          </Suspense>
        </div>

        {/* Results Panel - Right Side */}
        <div className="w-full lg:w-3/4">
          <div className="relative bg-white rounded-lg shadow">
            <ComponentFeedback componentName="IsolateResults" />
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Isolate Results
                </h2>
                <p className="text-sm text-gray-500">
                  {data.pagination.totalItems} isolates found
                </p>
              </div>
            </div>

            <div className="p-6">
              {data.isolates.length > 0 ? (
                <>
                  {/* Results Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                    {data.isolates.map((isolate) => (
                      <IsolateCard key={isolate.id} isolate={isolate} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={data.pagination.currentPage}
                    totalPages={data.pagination.totalPages}
                    totalItems={data.pagination.totalItems}
                    itemsPerPage={data.pagination.itemsPerPage}
                    basePath="/path-lab/isolates"
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No isolates found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}