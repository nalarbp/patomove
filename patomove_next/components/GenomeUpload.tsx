'use client';

import { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, DocumentIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ComponentFeedback from './ComponentFeedback';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'validating' | 'valid' | 'invalid' | 'complete';
  progress: number;
  validationResults?: {
    format: 'valid' | 'invalid';
    size: number;
    sequences: number;
    n50?: number;
    gcContent?: number;
    errors?: string[];
    pipelineJobId?: string;
    note?: string;
  };
  genomeId?: string;
  storagePath?: string;
}

export default function GenomeUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file extensions
  const supportedExtensions = ['.fasta', '.fa', '.fas', '.fastq', '.fq', '.gz'];

  const validateFileType = (fileName: string): boolean => {
    const lowerName = fileName.toLowerCase();
    return supportedExtensions.some(ext => lowerName.endsWith(ext));
  };

  const generateFileId = (): string => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validateFileType(file.name)) {
        alert(`Unsupported file format: ${file.name}. Please upload FASTA, FASTQ, or compressed files.`);
        continue;
      }

      const uploadFile: UploadFile = {
        id: generateFileId(),
        file,
        status: 'pending',
        progress: 0
      };
      
      newFiles.push(uploadFile);
    }

    if (newFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...newFiles]);
      
      // Start upload process for new files
      newFiles.forEach(uploadFile => {
        processFileUpload(uploadFile);
      });
    }
  }, []);

  const processFileUpload = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 10 });

      // Calculate file hash (simple implementation)
      const fileHash = await calculateFileHash(uploadFile.file);
      
      // Update progress
      updateFileStatus(uploadFile.id, { progress: 20 });

      // First create genome record to get ID
      const metadataResponse = await fetch('/api/genomics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${uploadFile.id}_${uploadFile.file.name}`,
          originalFilename: uploadFile.file.name,
          storagePath: '', // Will be updated after file upload
          fileSize: uploadFile.file.size,
          fileHash: fileHash,
          uploadedBy: 'current-user-id', // TODO: Get from auth
          validationStatus: 'pending',
          processingStatus: 'uploading'
        })
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to create genome record');
      }

      const genomeRecord = await metadataResponse.json();
      updateFileStatus(uploadFile.id, { progress: 30, genomeId: genomeRecord.id });

      // Now upload the actual file to storage
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('genomeId', genomeRecord.id);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      const uploadResult = await uploadResponse.json();
      updateFileStatus(uploadFile.id, { progress: 50 });

      // Update genome record with storage path
      await fetch(`/api/genomics/${genomeRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: uploadResult.absolutePath,
          processingStatus: 'uploaded'
        })
      });
      
      // Update with genome ID and start validation
      const updatedFile = { 
        ...uploadFile, 
        genomeId: genomeRecord.id,
        storagePath: uploadResult.absolutePath
      };
      updateFileStatus(uploadFile.id, { 
        status: 'validating', 
        progress: 60,
        genomeId: genomeRecord.id
      });

      // Submit to pipeline for real validation and analysis
      await submitToPipelineForValidation(updatedFile);

    } catch (error) {
      console.error('Upload failed:', error);
      updateFileStatus(uploadFile.id, { 
        status: 'invalid', 
        progress: 0,
        validationResults: {
          format: 'invalid',
          size: uploadFile.file.size,
          sequences: 0,
          errors: ['Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
        }
      });
    }
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const submitToPipelineForValidation = async (uploadFile: UploadFile) => {
    try {
      // Step 1: Upload file to pipeline
      updateFileStatus(uploadFile.id, { status: 'validating', progress: 70 });
      
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      
      console.log('Uploading file to pipeline:', uploadFile.file.name);
      
      const uploadResponse = await fetch('/api/pipeline/pipeline/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        throw new Error(`Pipeline file upload failed: ${uploadResponse.status} ${uploadError}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Pipeline upload successful:', uploadResult.path);
      
      updateFileStatus(uploadFile.id, { progress: 80 });

      // Step 2: Submit job with uploaded file path
      const hostname = window.location.origin;
      const pipelinePayload = {
        isolate_id: `genome_${uploadFile.genomeId}`,
        assembly_path: uploadResult.path, // Use path returned from pipeline upload
        analysis_types: ['resistance', 'mlst', 'annotation'],
        callback_url: `${hostname}/api/pipeline-webhook`,
        metadata: {
          genome_id: uploadFile.genomeId,
          filename: uploadFile.file.name,
          file_size: uploadFile.file.size.toString(),
          upload_type: 'genome_validation',
          submitted_from: 'genome_management'
        }
      };

      console.log('Submitting job to pipeline:', pipelinePayload);
      
      const jobResponse = await fetch('/api/pipeline/pipeline/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelinePayload)
      });

      if (jobResponse.ok) {
        const jobResult = await jobResponse.json();
        console.log('Pipeline job submitted successfully:', jobResult.job_id);
        
        // Update status to indicate pipeline is processing
        updateFileStatus(uploadFile.id, {
          status: 'validating',
          progress: 90,
          validationResults: {
            format: 'valid',
            size: uploadFile.file.size,
            sequences: 0, // Will be populated by pipeline callback
            pipelineJobId: jobResult.job_id,
            note: `Pipeline job ${jobResult.job_id} - processing uploaded file`
          }
        });

        // Update backend with pipeline job ID and file path
        if (uploadFile.genomeId) {
          await updateGenomeValidation(uploadFile.genomeId, {
            processingStatus: 'analyzing',
            pipelineJobId: jobResult.job_id,
            assemblyPath: uploadResult.path, // Store pipeline file path
            validationStatus: 'pending'
          });
        }
        
      } else {
        const jobError = await jobResponse.text();
        throw new Error(`Pipeline job submission failed: ${jobResponse.status} ${jobError}`);
      }
      
    } catch (error) {
      console.error('Pipeline processing failed:', error);
      
      updateFileStatus(uploadFile.id, {
        status: 'invalid',
        progress: 100,
        validationResults: {
          format: 'invalid',
          size: uploadFile.file.size,
          sequences: 0,
          errors: [`Pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          note: 'Failed to upload or submit to pipeline'
        }
      });

      if (uploadFile.genomeId) {
        await updateGenomeValidation(uploadFile.genomeId, {
          validationStatus: 'invalid',
          processingStatus: 'failed',
          validationErrors: `Pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const updateGenomeValidation = async (genomeId: string, updates: any) => {
    try {
      await fetch(`/api/genomics/${genomeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update genome status:', error);
    }
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
      case 'uploading':
      case 'validating':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>;
      case 'valid':
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'valid':
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'uploading':
      case 'validating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <ComponentFeedback componentName="GenomeUpload" />
      
      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".fasta,.fa,.fas,.fastq,.fq,.gz"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <CloudArrowUpIcon />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload Genome Files</h3>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                browse files
              </button>
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            Supports FASTA (.fasta, .fa, .fas), FASTQ (.fastq, .fq), and compressed files (.gz)
            <br />
            Maximum file size: 500 MB
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upload Queue</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(uploadFile.status)}`}>
                          {uploadFile.status}
                        </span>
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' || uploadFile.status === 'validating' ? (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {uploadFile.status === 'uploading' ? 'Uploading...' : 'Validating...'}
                          </span>
                          <span className="text-gray-600">{uploadFile.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Validation Results */}
                    {uploadFile.validationResults && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Results</h4>
                        
                        {uploadFile.validationResults.format === 'valid' ? (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Sequences:</span>
                              <span className="ml-2 font-medium">{uploadFile.validationResults.sequences}</span>
                            </div>
                            {uploadFile.validationResults.n50 && (
                              <div>
                                <span className="text-gray-600">N50:</span>
                                <span className="ml-2 font-medium">{uploadFile.validationResults.n50.toLocaleString()} bp</span>
                              </div>
                            )}
                            {uploadFile.validationResults.gcContent && (
                              <div>
                                <span className="text-gray-600">GC Content:</span>
                                <span className="ml-2 font-medium">{uploadFile.validationResults.gcContent}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="text-red-600 mb-2">Validation failed:</p>
                            <ul className="list-disc list-inside text-red-600 space-y-1">
                              {uploadFile.validationResults.errors?.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Upload Guidelines</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Assembly files should be in FASTA format (.fasta, .fa, .fas)</p>
          <p>• Raw reads can be uploaded in FASTQ format (.fastq, .fq)</p>
          <p>• Compressed files (.gz) are supported and recommended for large files</p>
          <p>• Files will be automatically validated for format compliance and quality</p>
          <p>• Valid assemblies can be linked to sample records for analysis</p>
        </div>
      </div>
    </div>
  );
}