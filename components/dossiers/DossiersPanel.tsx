'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { apiFetch } from '@/lib/http';
import { 
  Folder, 
  FileText, 
  Users,
  Calendar,
  Eye,
  Plus
} from 'lucide-react';

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  context: {
    completion: number;
  };
  agents: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  stats: {
    docs_total: number;
    docs_assigned: number;
    agents_assigned: number;
    roadmap_progress: number;
  };
  updated_at: string;
}

export default function DossiersPanel() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch('/api/folders');
      
      if (!response.ok) {
        throw new Error('Failed to load folders');
      }
      
      const data = await response.json();
      
      // Transform API data to match ProjectSummary interface
      const transformedProjects: ProjectSummary[] = data.items.map((folder: any) => ({
        id: folder.id.toString(),
        title: folder.title,
        status: folder.status,
        context: { completion: folder.context?.completion || 0 },
        agents: folder.agents || [],
        stats: {
          docs_total: folder.stats?.docs_total || 0,
          docs_assigned: folder.stats?.docs_assigned || 0,
          agents_assigned: folder.stats?.agents_assigned || 0,
          roadmap_progress: folder.stats?.roadmap_progress || 0
        },
        updated_at: folder.updated_at
      }));
      
      setProjects(transformedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openProject = (projectId: string) => {
    router.push(`/console/folders/${projectId}`);
  };

  const createNewFolder = async () => {
    if (!newFolderTitle.trim()) return;

    try {
      const response = await apiFetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newFolderTitle.trim(),
          vision: {
            objectif: 'À définir',
            livrable: 'À définir',
            contraintes: [],
            succes: []
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      // Reload projects list
      await loadProjects();
      setShowNewFolderForm(false);
      setNewFolderTitle('');
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError(err instanceof Error ? err.message : 'Erreur de création');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Erreur</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadProjects}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Dossiers</h2>
        </div>
        <Button 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowNewFolderForm(true)}
        >
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {/* New Folder Form */}
      {showNewFolderForm && (
        <Card className="bg-card border-soft">
          <CardHeader>
            <CardTitle className="text-base">Nouveau Dossier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Titre du dossier</label>
              <Input
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                placeholder="Ex: Projet Migration Q1"
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createNewFolder} disabled={!newFolderTitle.trim()}>
                Créer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowNewFolderForm(false);
                  setNewFolderTitle('');
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {projects.map((project) => (
          <Card key={project.id} className="bg-card border-soft hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">
                  {project.title}
                </CardTitle>
                <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Context Completion */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Contexte</span>
                  <span className="text-muted-foreground">{project.context.completion}%</span>
                </div>
                <Progress value={project.context.completion} className="h-1" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {project.stats.docs_assigned}/{project.stats.docs_total} docs
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {project.stats.agents_assigned} agents
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {project.stats.roadmap_progress}% roadmap
                  </span>
                </div>
              </div>

              {/* Agents */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {project.agents.slice(0, 3).map((agent, idx) => (
                    <div
                      key={agent.id}
                      className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                      title={agent.name}
                    >
                      {agent.name.substring(0, 1)}
                    </div>
                  ))}
                  {project.agents.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border-2 border-background">
                      +{project.agents.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Mis à jour {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openProject(project.id)}
                className="w-full flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ouvrir le dossier
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-2">Aucun dossier</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Créez votre premier dossier pour commencer
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer un dossier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}