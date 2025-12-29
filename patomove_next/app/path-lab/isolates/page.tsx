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

// Real API call to fetch isolates
async function getIsolatesData(searchParams: SearchParams) {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    const response = await fetch(`${baseUrl}/api/isolates`, {
      cache: 'no-store' // Ensure we get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch isolates');
    }
    
    const isolates = await response.json();
    
    // Filter options based on actual data
    const filterOptions = {
      species: ['Escherichia coli', 'Staphylococcus aureus', 'Klebsiella pneumoniae', 'Pseudomonas aeruginosa', 'Enterococcus faecium'],
      sources: ['Blood', 'Urine', 'Wound', 'Sputum', 'CSF', 'Environmental'],
      sites: ['ICU', 'Emergency Department', 'Medical Ward', 'Surgical Ward', 'Outpatient']
    };

    const totalInDatabase = isolates.length;
    // Simple filtering for demo
    let filteredIsolates = isolates;
  
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
  } catch (error) {
    console.error('Failed to fetch isolates:', error);
    // Return empty results on error
    return {
      isolates: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
      },
      filterOptions: {
        species: [],
        sources: [],
        sites: []
      }
    };
  }
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