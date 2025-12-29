'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import ComponentFeedback from './ComponentFeedback';

interface GenomeSuggestion {
  id: string;
  originalFilename: string;
  uploadDate: string;
  fileSize: number;
  confidence: number;
  matchReason: string;
  uploadedBy: string;
  processingStatus: string;
}

interface GenomeSuggestionsProps {
  isolateId: string;
  isolateLabel: string;
  onGenomeLinked?: () => void;
}

export default function GenomeSuggestions({ 
  isolateId, 
  isolateLabel,
  onGenomeLinked 
}: GenomeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GenomeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [totalUnlinked, setTotalUnlinked] = useState(0);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/isolates/${isolateId}/genome-suggestions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setTotalUnlinked(data.totalUnlinkedGenomes);
      }
    } catch (error) {
      console.error('Failed to fetch genome suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const linkGenome = async (genomeId: string, method: string = 'manual_search') => {
    try {
      setLinking(genomeId);
      
      const response = await fetch(`/api/isolates/${isolateId}/genome-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genomeId,
          linkingMethod: method
        })
      });

      if (response.ok) {
        //remove linked genome from suggestions
        setSuggestions(prev => prev.filter(s => s.id !== genomeId));
        setTotalUnlinked(prev => prev - 1);
        
        if (onGenomeLinked) {
          onGenomeLinked();
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to link genome');
      }
    } catch (error) {
      console.error('Failed to link genome:', error);
      alert('Failed to link genome');
    } finally {
      setLinking(null);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [isolateId]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Looking for matching genomes...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          No genome suggestions found for "{isolateLabel}".
          {totalUnlinked > 0 && (
            <span className="block mt-1">
              {totalUnlinked} unlinked genomes available in the library.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <ComponentFeedback componentName="GenomeSuggestions" />
      
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Genome suggestions found
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Found {suggestions.length} genome(s) that might belong to isolate "{isolateLabel}":
          </p>
          
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-md p-3 border border-yellow-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {suggestion.originalFilename}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.confidence >= 0.8
                          ? 'bg-green-100 text-green-800'
                          : suggestion.confidence >= 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.round(suggestion.confidence * 100)}% match
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.matchReason} • 
                      Uploaded {new Date(suggestion.uploadDate).toLocaleDateString()} • 
                      {Math.round(suggestion.fileSize / 1024)} KB • 
                      Status: {suggestion.processingStatus}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => linkGenome(suggestion.id, 'manual_suggestion')}
                    disabled={linking === suggestion.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {linking === suggestion.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700 mr-1"></div>
                        Linking...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Link to Isolate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {totalUnlinked > suggestions.length && (
            <p className="text-xs text-yellow-600 mt-2">
              {totalUnlinked - suggestions.length} more unlinked genomes available in the library.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}