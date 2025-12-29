'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ComponentFeedback from './ComponentFeedback';

interface FilterOptions {
  species: string[];
  sources: string[];
  sites: string[];
}

interface IsolateFiltersProps {
  filterOptions: FilterOptions;
  basePath: string;
}

export default function IsolateFilters({ filterOptions, basePath }: IsolateFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pending states for manual trigger
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingSpecies, setPendingSpecies] = useState<string[]>([]);
  const [pendingSources, setPendingSources] = useState<string[]>([]);
  const [pendingSites, setPendingSites] = useState<string[]>([]);
  const [pendingDateFrom, setPendingDateFrom] = useState('');
  const [pendingDateTo, setPendingDateTo] = useState('');

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const species = searchParams.get('species')?.split(',').filter(Boolean) || [];
    const sources = searchParams.get('sources')?.split(',').filter(Boolean) || [];
    const sites = searchParams.get('sites')?.split(',').filter(Boolean) || [];
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';

    setSearchText(search);
    setSelectedSpecies(species);
    setSelectedSources(sources);
    setSelectedSites(sites);
    setDateFrom(from);
    setDateTo(to);

    setPendingSearch(search);
    setPendingSpecies(species);
    setPendingSources(sources);
    setPendingSites(sites);
    setPendingDateFrom(from);
    setPendingDateTo(to);
  }, [searchParams]);

  const handleSpeciesChange = (species: string) => {
    const updated = pendingSpecies.includes(species)
      ? pendingSpecies.filter(s => s !== species)
      : [...pendingSpecies, species];
    setPendingSpecies(updated);
  };

  const handleSourceChange = (source: string) => {
    const updated = pendingSources.includes(source)
      ? pendingSources.filter(s => s !== source)
      : [...pendingSources, source];
    setPendingSources(updated);
  };

  const handleSiteChange = (site: string) => {
    const updated = pendingSites.includes(site)
      ? pendingSites.filter(s => s !== site)
      : [...pendingSites, site];
    setPendingSites(updated);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (pendingSearch) params.set('search', pendingSearch);
    if (pendingSpecies.length > 0) params.set('species', pendingSpecies.join(','));
    if (pendingSources.length > 0) params.set('sources', pendingSources.join(','));
    if (pendingSites.length > 0) params.set('sites', pendingSites.join(','));
    if (pendingDateFrom) params.set('from', pendingDateFrom);
    if (pendingDateTo) params.set('to', pendingDateTo);

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.replace(`${basePath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setPendingSearch('');
    setPendingSpecies([]);
    setPendingSources([]);
    setPendingSites([]);
    setPendingDateFrom('');
    setPendingDateTo('');
    router.replace(basePath);
  };

  const hasChanges = 
    pendingSearch !== searchText ||
    JSON.stringify(pendingSpecies.sort()) !== JSON.stringify(selectedSpecies.sort()) ||
    JSON.stringify(pendingSources.sort()) !== JSON.stringify(selectedSources.sort()) ||
    JSON.stringify(pendingSites.sort()) !== JSON.stringify(selectedSites.sort()) ||
    pendingDateFrom !== dateFrom ||
    pendingDateTo !== dateTo;

  return (
    <div className="relative bg-white rounded-lg shadow p-6 h-fit">
      <ComponentFeedback componentName="IsolateFilters" />
      
      <div className="flex flex-col space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>

        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            placeholder="Search isolates..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Species Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Species</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
            {filterOptions.species.map((species) => (
              <label key={species} className="flex items-center py-1">
                <input
                  type="checkbox"
                  checked={pendingSpecies.includes(species)}
                  onChange={() => handleSpeciesChange(species)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{species}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Collection Source Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Collection Source</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
            {filterOptions.sources.map((source) => (
              <label key={source} className="flex items-center py-1">
                <input
                  type="checkbox"
                  checked={pendingSources.includes(source)}
                  onChange={() => handleSourceChange(source)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Collection Site Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Collection Site</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
            {filterOptions.sites.map((site) => (
              <label key={site} className="flex items-center py-1">
                <input
                  type="checkbox"
                  checked={pendingSites.includes(site)}
                  onChange={() => handleSiteChange(site)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{site}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Collection Date Range</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={pendingDateFrom}
                onChange={(e) => setPendingDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={pendingDateTo}
                onChange={(e) => setPendingDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button
            onClick={applyFilters}
            disabled={!hasChanges}
            className={`w-full px-4 py-2 rounded-md transition-colors ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply Filters
          </button>
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Active Filters Count */}
        {(selectedSpecies.length > 0 || selectedSources.length > 0 || selectedSites.length > 0 || searchText || dateFrom || dateTo) && (
          <div className="text-xs text-gray-500 pt-2">
            Active filters: {[
              searchText ? 'search' : '',
              selectedSpecies.length ? `species (${selectedSpecies.length})` : '',
              selectedSources.length ? `sources (${selectedSources.length})` : '',
              selectedSites.length ? `sites (${selectedSites.length})` : '',
              (dateFrom || dateTo) ? 'date range' : ''
            ].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}