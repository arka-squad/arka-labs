'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings, FileText, Upload, Download, Trash2, Eye, Plus, AlertCircle } from 'lucide-react';
import { COLOR } from '../../../../apps/console/src/ui/tokens';
import DocumentUpload from './DocumentUpload';

interface ProjectDetail {
  id: number;
  nom: string;
  description: string;
  client_id: string;
  client_name: string;
  client_secteur: string;
  budget: number;
  deadline: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  tags: string[];
  requirements: string[];
  created_at: string;
  updated_at: string;
  agents_assigned: number;
  squads_assigned: number;
  estimated_cost: number;
  deadline_status: string;
  progress_status: string;
}

interface ProjectDocument {
  id: string;
  title: string;
  type: string;
  owner: string;
  status: string;
  assigned_to?: string;
  updated_at: string;
  metadata: {
    storage_url: string;
    size: number;
  };
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'squads'>('overview');
  const [uploadModal, setUploadModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchProjectDetail(),
      fetchProjectDocuments()
    ]);
  }, [params.id]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project details');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDocuments = async () => {
    try {
      setDocsLoading(true);
      const response = await fetch(`/api/admin/projects/${params.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setDocuments(data.items || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'assigned': return '#3B82F6';
      case 'untested': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'normal': return '#10B981';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'text': return '📄';
      case 'image': return '🖼️';
      case 'application': return '📊';
      default: return '📁';
    }
  };

  if (loading) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
          </button>
          
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Project</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLOR.body }} className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>Back to Projects</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{project.nom}</h1>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                />
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                  style={{ 
                    backgroundColor: getPriorityColor(project.priority) + '20', 
                    color: getPriorityColor(project.priority) 
                  }}
                >
                  {project.priority} priority
                </span>
              </div>
              <p className="text-gray-400">
                {project.client_name} • {project.client_secteur} • Project #{project.id}
              </p>
              {project.description && (
                <p className="text-gray-300 mt-2 max-w-2xl">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'documents' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FileText size={16} />
            <span>Documents ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'squads' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users size={16} />
            <span>Squads ({project.squads_assigned})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">{project.squads_assigned}</div>
                  <div className="text-gray-400 text-sm">Squads</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-400">{project.agents_assigned}</div>
                  <div className="text-gray-400 text-sm">Agents</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-400">{documents.length}</div>
                  <div className="text-gray-400 text-sm">Documents</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {project.budget ? `€${project.budget.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-gray-400 text-sm">Budget</div>
                </div>
              </div>

              {/* Requirements */}
              {project.requirements.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {project.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Project Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2 capitalize">{project.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className="ml-2 capitalize">{project.priority}</span>
                  </div>
                  {project.deadline && (
                    <div>
                      <span className="text-gray-400">Deadline:</span>
                      <span className="ml-2">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="ml-2">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Documents Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Project Documents</h2>
                <p className="text-gray-400">
                  Manage documents that will be accessible to squad agents
                </p>
              </div>
              <button
                onClick={() => setUploadModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                <Upload size={16} />
                <span>Upload Document</span>
              </button>
            </div>

            {/* Documents List */}
            <div className="bg-gray-800 rounded-xl p-6">
              {docsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-gray-400 mb-4">
                    Upload documents to provide context for your squad agents
                  </p>
                  <button
                    onClick={() => setUploadModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mx-auto"
                  >
                    <Plus size={16} />
                    <span>Upload First Document</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getFileIcon(doc.type)}</span>
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatFileSize(doc.metadata.size)}</span>
                            <span>•</span>
                            <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{ 
                                backgroundColor: getStatusColor(doc.status) + '20',
                                color: getStatusColor(doc.status)
                              }}
                            >
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center py-12">
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Squad Management</h3>
              <p className="text-gray-400">Squad assignment interface coming soon</p>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadModal && (
          <DocumentUpload
            projectId={params.id}
            onUploadSuccess={() => {
              setUploadModal(false);
              fetchProjectDocuments();
            }}
            onClose={() => setUploadModal(false)}
          />
        )}
      </div>
    </div>
  );
}