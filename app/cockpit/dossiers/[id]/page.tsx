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
  ArrowDown,
  ArrowLeft
} from 'lucide-react';

interface ProjectData {
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
    completion_breakdown?: Record<string, number>;
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
    docs_assigned: number;
    agents_assigned: number;
    roadmap_progress: number;
  };
  created_by: string;
  created_at: string;
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
  metadata?: {
    storage_url?: string;
    size?: number;
  };
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

export default function CockpitDossierPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { session } = useSession();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load project and documents
      const [projectRes, docsRes] = await Promise.all([
        apiFetch(`/api/projects/${projectId}`),
        apiFetch(`/api/projects/${projectId}/documents`)
      ]);
      
      if (!projectRes.ok) {
        const errorData = await projectRes.json();
        throw new Error(errorData.message || 'Project not found');
      }
      if (!docsRes.ok) throw new Error('Failed to load documents');
      
      const projectData = await projectRes.json();
      const docsData = await docsRes.json();
      
      setProject(projectData);
      setDocuments(docsData.items || []);
      
      // Mock roadmap data for now
      setRoadmap({
        folder_id: projectId,
        milestones: [
          {
            id: 'm1_proj' + projectId,
            title: 'Salle réservée',
            date: '2025-09-15',
            status: 'done'
          },
          {
            id: 'm2_proj' + projectId,
            title: 'Atelier coworking',
            date: '2025-09-22',
            status: 'pending'
          },
          {
            id: 'm3_proj' + projectId,
            title: 'Synthèse livrée',
            date: '2025-09-23',
            status: 'pending'
          }
        ],
        progress: projectData.stats?.roadmap_progress || 33,
        critical_path: ['m1_proj' + projectId, 'm2_proj' + projectId, 'm3_proj' + projectId]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const response = await apiFetch(`/api/projects/${projectId}/context`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': `add-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          type: 'user_note',
          content: newNote.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }
      
      // Reload project data to get updated context
      await loadProjectData();
      setNewNote('');
      setShowAddNote(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
      case 'pass': return 'bg-green-900/20 text-green-300 border-green-500/20';
      case 'warn': return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/20';
      case 'fail': return 'bg-red-900/20 text-red-300 border-red-500/20';
      case 'done': return 'bg-green-900/20 text-green-300 border-green-500/20';
      case 'pending': return 'bg-blue-900/20 text-blue-300 border-blue-500/20';
      case 'blocked': return 'bg-red-900/20 text-red-300 border-red-500/20';
      default: return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Dossier introuvable</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
          <p className="text-sm text-muted-foreground">
            Créé par {project.created_by} • {new Date(project.updated_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="ml-auto">
          <Badge className={`${getStatusColor(project.status)} border`}>
            {project.status}
          </Badge>
        </div>
      </div>

      {/* Vision Header - Always Visible */}
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-accent">Vision du Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">Objectif</h4>
              <p className="text-sm text-muted-foreground">{project.vision?.objectif || 'Non défini'}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Livrable</h4>
              <p className="text-sm text-muted-foreground">{project.vision?.livrable || 'Non défini'}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Contraintes</h4>
              <div className="flex flex-wrap gap-1">
                {(project.vision?.contraintes || []).map((contrainte, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-muted">
                    {contrainte}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Succès</h4>
              <div className="flex flex-wrap gap-1">
                {(project.vision?.succes || []).map((succes, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-muted">
                    {succes}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Context & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context Section */}
          <Card className="bg-card border-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  Contexte
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={project.context?.completion || 0} className="w-20" />
                  <span className="text-sm text-muted-foreground">{project.context?.completion || 0}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(project.context?.guided_notes || []).map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-muted/10">
                  <div className="flex items-start gap-2">
                    {note.type === 'agent_question' ? (
                      <User className="h-4 w-4 mt-1 text-blue-400" />
                    ) : (
                      <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{note.content}</p>
                      {note.agent && (
                        <p className="text-xs text-muted-foreground mt-1">— {note.agent}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <FoldersRBACGuard roles={['editor', 'admin', 'owner']}>
                <div className="pt-4 border-t border-soft">
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
                        className="resize-none bg-background/50"
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
          <Card className="bg-card border-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5" />
                Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-soft rounded-lg hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <h4 className="font-medium text-foreground">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.owner}</span>
                          {doc.assigned_to && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs border-muted">
                                {doc.raci_role}: {doc.assigned_to.substring(0, 8)}...
                              </Badge>
                            </>
                          )}
                          {doc.metadata?.size && (
                            <>
                              <span>•</span>
                              <span>{Math.round(doc.metadata.size / 1024)} KB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`border ${getStatusColor(doc.status)}`}>
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
          <Card className="bg-card border-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5" />
                Agents ({project.agents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(project.agents || []).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs border-muted">
                          RACI: {agent.role}
                        </Badge>
                        <span>•</span>
                        <span>{agent.load}% charge</span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'
                    }`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <Card className="bg-card border-soft">
            <CardHeader>
              <CardTitle className="text-foreground">Indicateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents assignés</span>
                    <span className="text-muted-foreground">{project.stats?.docs_assigned || 0}/{project.stats?.docs_total || 0}</span>
                  </div>
                  <Progress value={
                    project.stats?.docs_total 
                      ? Math.round((project.stats.docs_assigned / project.stats.docs_total) * 100) 
                      : 0
                  } className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Roadmap</span>
                    <span className="text-muted-foreground">{project.stats?.roadmap_progress || 0}%</span>
                  </div>
                  <Progress value={project.stats?.roadmap_progress || 0} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-muted/10 rounded">
                    <div className="font-semibold text-lg text-foreground">{project.stats?.agents_assigned || 0}</div>
                    <div className="text-xs text-muted-foreground">Agents</div>
                  </div>
                  <div className="p-2 bg-muted/10 rounded">
                    <div className="font-semibold text-lg text-foreground">{project.context?.completion || 0}%</div>
                    <div className="text-xs text-muted-foreground">Contexte</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap */}
          {roadmap && (
            <Card className="bg-card border-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
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
                          ? 'bg-green-400 border-green-400' 
                          : 'border-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {milestone.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(milestone.date).toLocaleDateString('fr-FR')}</span>
                          <Badge className={`text-xs border ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                      {idx < roadmap.milestones.length - 1 && (
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-soft">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression globale</span>
                    <span className="text-muted-foreground">{roadmap.progress}%</span>
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