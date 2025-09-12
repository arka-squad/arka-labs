'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// Tabs removed for now - not in package dependencies
import { apiFetch } from '@/lib/http';
import { 
  Brain, 
  Clock, 
  Users,
  FileText,
  Shield,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Eye,
  Download,
  Calendar,
  Tag,
  TrendingUp
} from 'lucide-react';

interface MemoryBlock {
  id: string;
  type: string;
  content: Record<string, any>;
  agent_source?: string;
  importance: number;
  tags: string[];
  created_at: string;
  thread_ref?: string;
}

interface ProjectMemoryData {
  project_id: string;
  project_name: string;
  memory_summary: {
    total_blocks: number;
    by_type: Record<string, number>;
    context_completion: number;
    last_updated: string;
  };
  memory_blocks: MemoryBlock[];
  agents_state: Record<string, {
    last_contribution: string;
    blocks_contributed: number;
  }>;
  governance: {
    current_phase: string;
    gates_passed: string[];
    next_milestone: string;
    blockers_active: string[];
  };
}

export default function MemoryDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const project_id = params.project_id as string;
  
  const [memoryData, setMemoryData] = useState<ProjectMemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'blocks' | 'agents' | 'governance'>('blocks');

  useEffect(() => {
    loadMemoryData();
  }, [project_id]);

  const loadMemoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch(`/api/memory/project/${project_id}`);
      const data = await response.json();
      setMemoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vision': return <Brain className="h-4 w-4" />;
      case 'decision': return <Shield className="h-4 w-4" />;
      case 'context_evolution': return <RotateCcw className="h-4 w-4" />;
      case 'agents_interaction': return <Users className="h-4 w-4" />;
      case 'governance': return <Shield className="h-4 w-4" />;
      case 'blocker': return <AlertTriangle className="h-4 w-4" />;
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vision': 'Vision',
      'decision': 'Décision',
      'context_evolution': 'Évolution Contexte',
      'agents_interaction': 'Interaction Agents',
      'governance': 'Gouvernance',
      'blocker': 'Blocage',
      'insight': 'Insight'
    };
    return labels[type] || type;
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 9) return 'bg-red-100 text-red-800';
    if (importance >= 7) return 'bg-orange-100 text-orange-800';
    if (importance >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBlocks = memoryData?.memory_blocks.filter(block => {
    if (selectedType !== 'all' && block.type !== selectedType) return false;
    if (selectedAgent !== 'all' && block.agent_source !== selectedAgent) return false;
    return true;
  }) || [];

  const exportMemory = async () => {
    try {
      const response = await fetch(`/api/memory/export/${project_id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memory_export_${project_id}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Erreur</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadMemoryData} variant="outline">Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!memoryData) return null;

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mémoire Projet</h1>
          <p className="text-muted-foreground">{memoryData.project_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/console/memory/timeline/${project_id}`)}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Timeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMemory}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Context Completion */}
        <Card className="bg-card border-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contexte</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {memoryData.memory_summary.context_completion}%
            </div>
            <Progress 
              value={memoryData.memory_summary.context_completion} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Total Blocks */}
        <Card className="bg-card border-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocs Mémoire</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {memoryData.memory_summary.total_blocks}
            </div>
            <p className="text-xs text-muted-foreground">
              Mis à jour {formatDate(memoryData.memory_summary.last_updated)}
            </p>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card className="bg-card border-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Object.keys(memoryData.agents_state).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Contributeurs projet
            </p>
          </CardContent>
        </Card>

        {/* Current Phase */}
        <Card className="bg-card border-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phase Actuelle</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">
              {memoryData.governance.current_phase}
            </div>
            <p className="text-xs text-muted-foreground">
              {memoryData.governance.gates_passed.length} gates passés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {[
            { key: 'blocks', label: 'Blocs Mémoire' },
            { key: 'agents', label: 'État Agents' },
            { key: 'governance', label: 'Gouvernance' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Tous</option>
                {Object.keys(memoryData.memory_summary.by_type).map(type => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)} ({memoryData.memory_summary.by_type[type]})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Agent:</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Tous</option>
                {Object.keys(memoryData.agents_state).map(agent => (
                  <option key={agent} value={agent}>
                    {agent} ({memoryData.agents_state[agent].blocks_contributed})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Memory Blocks */}
          <div className="grid gap-4">
            {filteredBlocks.map((block) => (
              <Card key={block.id} className="bg-card border-soft">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(block.type)}
                      <CardTitle className="text-base">
                        {getTypeLabel(block.type)}
                      </CardTitle>
                      <Badge className={getImportanceColor(block.importance)}>
                        {block.importance}/10
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(block.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Content Preview */}
                  <div className="text-sm text-foreground">
                    {block.type === 'vision' && block.content.objectif && (
                      <p><strong>Objectif:</strong> {block.content.objectif}</p>
                    )}
                    {block.type === 'decision' && block.content.decision && (
                      <p><strong>Décision:</strong> {block.content.decision}</p>
                    )}
                    {block.type === 'blocker' && block.content.blocker && (
                      <p><strong>Blocage:</strong> {block.content.blocker}</p>
                    )}
                    {block.content.summary && (
                      <p>{block.content.summary}</p>
                    )}
                  </div>

                  {/* Tags */}
                  {block.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {block.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Agent & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {block.agent_source && (
                        <span>Par {block.agent_source}</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(memoryData.agents_state).map(([agent, state]) => (
              <Card key={agent} className="bg-card border-soft">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {agent}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Contributions:</span>
                      <span className="ml-2 font-medium">{state.blocks_contributed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dernière activité:</span>
                      <span className="ml-2 font-medium">{formatDate(state.last_contribution)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-4">
          <div className="grid gap-4">
            {/* Gates Passed */}
            <Card className="bg-card border-soft">
              <CardHeader>
                <CardTitle className="text-base">Gates Validés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {memoryData.governance.gates_passed.map(gate => (
                    <Badge key={gate} className="bg-green-100 text-green-800">
                      {gate}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Milestone */}
            {memoryData.governance.next_milestone && (
              <Card className="bg-card border-soft">
                <CardHeader>
                  <CardTitle className="text-base">Prochaine Étape</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">
                    {memoryData.governance.next_milestone}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Active Blockers */}
            {memoryData.governance.blockers_active.length > 0 && (
              <Card className="bg-card border-soft">
                <CardHeader>
                  <CardTitle className="text-base text-orange-600">Blocages Actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {memoryData.governance.blockers_active.map((blocker, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {blocker}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}