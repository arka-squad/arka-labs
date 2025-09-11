'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
  projectId: string;
  onUploadSuccess: () => void;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  name: string;
  tags: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function DocumentUpload({ projectId, onUploadSuccess, onClose }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      name: file.name,
      tags: '',
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, ...updates } : file
    ));
  };

  const uploadFile = async (fileData: UploadFile, index: number) => {
    updateFile(index, { status: 'uploading', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('name', fileData.name);
      formData.append('tags', fileData.tags);

      // Utilisation de l'API backoffice (adaptée pour cockpit)
      const response = await fetch(`/api/backoffice/projets/${projectId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      updateFile(index, { status: 'success', progress: 100 });
      
    } catch (error) {
      updateFile(index, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed',
        progress: 0 
      });
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    // Upload files in parallel
    await Promise.all(
      pendingFiles.map((file, originalIndex) => {
        const fileIndex = files.findIndex(f => f === file);
        return uploadFile(file, fileIndex);
      })
    );

    // Check if all uploads succeeded
    const hasErrors = files.some(f => f.status === 'error');
    if (!hasErrors) {
      onUploadSuccess();
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    if (bytes === 0) return '0 Octets';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📁';
    }
  };

  const allUploaded = files.length > 0 && files.every(f => f.status === 'success');
  const hasErrors = files.some(f => f.status === 'error');
  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">📎 Télécharger des Documents</h2>
            <p className="text-gray-400 text-sm">Ajouter des documents pour fournir du contexte aux agents</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 flex-1 overflow-auto">
          {files.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Glissez vos fichiers ici ou cliquez pour parcourir
              </h3>
              <p className="text-gray-400 mb-4">
                PDF, DOC, XLS, PPT, images et plus (max 50Mo chacun)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
              >
                Sélectionner des fichiers
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File List */}
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 space-y-3 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(fileData.file.name)}</span>
                      <div>
                        <div className="font-medium text-white">{fileData.file.name}</div>
                        <div className="text-sm text-gray-400">
                          {formatFileSize(fileData.file.size)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {fileData.status === 'success' && (
                        <CheckCircle size={20} className="text-green-400" />
                      )}
                      {fileData.status === 'error' && (
                        <AlertCircle size={20} className="text-red-400" />
                      )}
                      {fileData.status === 'pending' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {fileData.status === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Nom du document
                        </label>
                        <input
                          type="text"
                          value={fileData.name}
                          onChange={(e) => updateFile(index, { name: e.target.value })}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom du document"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Tags (séparés par des virgules)
                        </label>
                        <input
                          type="text"
                          value={fileData.tags}
                          onChange={(e) => updateFile(index, { tags: e.target.value })}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="spéc, exigences, design"
                        />
                      </div>
                    </div>
                  )}

                  {fileData.status === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Téléchargement...</span>
                        <span className="text-gray-300">{fileData.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fileData.status === 'error' && (
                    <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                      ❌ Erreur: {fileData.error}
                    </div>
                  )}

                  {fileData.status === 'success' && (
                    <div className="text-green-400 text-sm bg-green-900/20 p-2 rounded">
                      ✅ Téléchargement réussi
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Files */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-4 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isUploading}
              >
                + Ajouter d'autres fichiers
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="p-6 border-t border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              {hasErrors && <span className="text-red-400 ml-2">• Certains téléchargements ont échoué</span>}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isUploading}
              >
                {allUploaded ? 'Fermer' : 'Annuler'}
              </button>
              {!allUploaded && (
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || files.every(f => f.status !== 'pending')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isUploading ? 'Téléchargement...' : 'Tout télécharger'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}