'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FoldersRBACGuard } from '@/components/FoldersRBACGuard';
import { apiFetch } from '@/lib/http';
import { useSession } from '@/hooks/useSession';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  AlertTriangle,
  Plus,
  ArrowDown
} from 'lucide-react';

interface FolderData {
  id: string;
  title: string;
  status: string;
  vision: {
    objectif: string;
    livrable: string;
    contraintes: string[];
    succes: string[];
  };
  context: {
    guided_notes: Array<{
      id: string;
      type: string;
      content: string;
      agent?: string;
    }>;
    completion: number;
  };
  agents: Array<{
    id: string;
    name: string;
    role: string;
    load: number;
    status: string;
  }>;
  stats: {
    docs_total: number;
    docs_tested: number;
    agents_assigned: number;
    roadmap_progress: number;
  };
  updated_at: string;
}

interface DocumentData {
  id: string;
  title: string;
  type: string;
  owner: string;
  status: string;
  assigned_to?: string;
  raci_role?: string;
  updated_at: string;
}

interface RoadmapData {
  folder_id: string;
  milestones: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
  }>;
  progress: number;
  critical_path: string[];
}

export default function FolderPage() {
  const params = useParams();
  const folderId = params.id as string;
  const { session } = useSession();
  
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadFolderData();
  }, [folderId]);

  const loadFolderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load folder, documents and roadmap in parallel
      const [folderRes, docsRes, roadmapRes] = await Promise.all([
        apiFetch(`/api/folders/${folderId}`),
        apiFetch(`/api/folders/${folderId}/documents`),
        apiFetch(`/api/folders/${folderId}/roadmap`)
      ]);
      
      if (!folderRes.ok) throw new Error('Folder not found');
      if (!docsRes.ok) throw new Error('Failed to load documents');
      if (!roadmapRes.ok) throw new Error('Failed to load roadmap');
      
      const folderData = await folderRes.json();
      const docsData = await docsRes.json();
      const roadmapData = await roadmapRes.json();
      
      setFolder(folderData);
      setDocuments(docsData.items || []);
      setRoadmap(roadmapData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const response = await apiFetch(`/api/folders/${folderId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_note',
          content: newNote.trim()
        })
      });
      
      if (!response.ok) throw new Error('Failed to add note');
      
      // Reload folder data to get updated context
      await loadFolderData();
      setNewNote('');
      setShowAddNote(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dossier introuvable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vision Header - Always Visible */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {folder.title}
              </CardTitle>
              <Badge className={`mt-2 ${getStatusColor(folder.status)}`}>
                {folder.status}
              </Badge>
            </div>
            <div className="text-right text-sm text-gray-500">
              Mis à jour: {new Date(folder.updated_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Objectif</h4>
              <p className="text-sm text-gray-700">{folder.vision.objectif}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Livrable</h4>
              <p className="text-sm text-gray-700">{folder.vision.livrable}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Contraintes</h4>
              <div className="flex flex-wrap gap-1">
                {folder.vision.contraintes.map((contrainte, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {contrainte}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Succès</h4>
              <div className="flex flex-wrap gap-1">
                {folder.vision.succes.map((succes, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {succes}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Context & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contexte
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={folder.context.completion} className="w-20" />
                  <span className="text-sm text-gray-600">{folder.context.completion}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {folder.context.guided_notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-start gap-2">
                    {note.type === 'agent_question' ? (
                      <User className="h-4 w-4 mt-1 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 mt-1 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{note.content}</p>
                      {note.agent && (
                        <p className="text-xs text-gray-500 mt-1">— {note.agent}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <FoldersRBACGuard roles={['editor', 'admin', 'owner']}>
                <div className="pt-4 border-t">
                  {!showAddNote ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddNote(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une note
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Votre note ou contrainte..."
                        className="resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddNote}>
                          Ajouter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setShowAddNote(false); setNewNote(''); }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </FoldersRBACGuard>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.owner}</span>
                          {doc.assigned_to && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {doc.raci_role}: {doc.assigned_to}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Agents ({folder.agents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {folder.agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          RACI: {agent.role}
                        </Badge>
                        <span>•</span>
                        <span>{agent.load}% charge</span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Documents testés</span>
                    <span>{folder.stats.docs_tested}/{folder.stats.docs_total}</span>
                  </div>
                  <Progress value={(folder.stats.docs_tested / folder.stats.docs_total) * 100} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Roadmap</span>
                    <span>{folder.stats.roadmap_progress}%</span>
                  </div>
                  <Progress value={folder.stats.roadmap_progress} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-lg">{folder.stats.agents_assigned}</div>
                    <div className="text-xs text-gray-600">Agents</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-lg">{folder.context.completion}%</div>
                    <div className="text-xs text-gray-600">Contexte</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap */}
          {roadmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roadmap.milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        milestone.status === 'done' 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {milestone.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(milestone.date).toLocaleDateString('fr-FR')}</span>
                          <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                      {idx < roadmap.milestones.length - 1 && (
                        <ArrowDown className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Progression globale</span>
                    <span>{roadmap.progress}%</span>
                  </div>
                  <Progress value={roadmap.progress} className="mt-1" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}