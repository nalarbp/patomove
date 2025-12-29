'use client';

import { useState } from 'react';
import Link from 'next/link';
import ComponentFeedback from '@/components/ComponentFeedback';
import GenomeUpload from '@/components/GenomeUpload';
import GenomeLibrary from '@/components/GenomeLibrary';
import AnalysisQueue from '@/components/AnalysisQueue';

export default function GenomesPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'queue'>('upload');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ComponentFeedback componentName="GenomesPage" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Genome Management</h1>
            <p className="text-gray-600 mt-2">
              Upload, validate, and manage genome assembly files for genomic analysis
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                NCBI SRA-style
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Files
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'library'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Genome Library
          </button>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analysis Queue
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Interface */}
          <div className="lg:col-span-2">
            <GenomeUpload />
          </div>

          {/* Right Column - Quick Stats & Guides */}
          <div className="space-y-6">
            {/* File Format Guide */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Supported Formats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-blue-800">.fasta, .fa, .fas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-blue-800">.fastq, .fq (reads)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-blue-800">.gz compressed</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  Files are submitted to pipeline for real validation and quality analysis.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab('library')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  View Genome Library
                </button>
                <button 
                  onClick={() => setActiveTab('queue')}
                  className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm"
                >
                  Check Analysis Queue
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div>
          <GenomeLibrary />
        </div>
      )}

      {activeTab === 'queue' && (
        <div>
          <AnalysisQueue />
        </div>
      )}

    </div>
  );
}