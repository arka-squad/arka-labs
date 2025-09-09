'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/http';
import { 
  Clock,
  ArrowLeft,
  User,
  Calendar,
  Filter,
  RotateCcw,
  Brain,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface TimelineEntry {
  timestamp: string;
  type: string;
  agent: string;
  content: {
    summary: string;
    impact?: string;
    decisions_triggered?: string[];
    rationale?: string;
    impact_agents?: string[];
  };
  block_id: string;
  importance: number;
}

interface TimelineData {
  project_id: string;
  timeline: TimelineEntry[];
  page: number;
  limit: number;
  total: number;
  filters_applied: string[];
}

export default function MemoryTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const project_id = params.project_id as string;
  
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadTimeline();
  }, [project_id, currentPage, typeFilter, agentFilter, fromDate, toDate]);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (typeFilter) params.append('type', typeFilter);
      if (agentFilter) params.append('agent', agentFilter);
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      
      const response = await apiFetch(`/api/memory/timeline/${project_id}?${params}`);
      const data = await response.json();
      setTimelineData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vision': return <Brain className="h-5 w-5" />;
      case 'decision': return <Shield className="h-5 w-5" />;
      case 'context_evolution': return <RotateCcw className="h-5 w-5" />;
      case 'agents_interaction': return <Users className="h-5 w-5" />;
      case 'governance': return <Shield className="h-5 w-5" />;
      case 'blocker': return <AlertTriangle className="h-5 w-5" />;
      case 'insight': return <Lightbulb className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vision': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'decision': return 'bg-green-100 text-green-800 border-green-200';
      case 'context_evolution': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'agents_interaction': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'governance': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'blocker': return 'bg-red-100 text-red-800 border-red-200';
      case 'insight': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    if (importance >= 9) return 'bg-red-500';
    if (importance >= 7) return 'bg-orange-500';
    if (importance >= 5) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setTypeFilter('');
    setAgentFilter('');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredTimeline = timelineData?.timeline.filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.content.summary.toLowerCase().includes(searchLower) ||
      entry.agent.toLowerCase().includes(searchLower) ||
      (entry.content.impact && entry.content.impact.toLowerCase().includes(searchLower))
    );
  }) || [];

  const totalPages = timelineData ? Math.ceil(timelineData.total / limit) : 1;

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
          <Button onClick={loadTimeline} variant="outline">Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!timelineData) return null;

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/console/memory/${project_id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Timeline Mémoire
            </h1>
            <p className="text-muted-foreground">
              {timelineData.total} événements • Projet {project_id}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-input rounded px-3 py-2 text-sm"
              >
                <option value="">Tous les types</option>
                <option value="vision">Vision</option>
                <option value="decision">Décision</option>
                <option value="context_evolution">Évolution Contexte</option>
                <option value="agents_interaction">Interaction Agents</option>
                <option value="governance">Gouvernance</option>
                <option value="blocker">Blocage</option>
                <option value="insight">Insight</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Agent</label>
              <Input
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                placeholder="Nom de l'agent"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Depuis</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Jusqu&apos;à</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Recherche</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans le contenu..."
              className="text-sm"
            />
          </div>

          {timelineData.filters_applied.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>
              {timelineData.filters_applied.map((filter, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
          
          <div className="space-y-6">
            {filteredTimeline.map((entry, index) => (
              <div key={entry.block_id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background ${getTypeColor(entry.type)}`}>
                  {getTypeIcon(entry.type)}
                </div>

                {/* Content */}
                <Card className="flex-1 bg-card border-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {getTypeLabel(entry.type)}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{entry.agent}</span>
                            <Calendar className="h-3 w-3 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">
                              {formatDate(entry.timestamp)} à {formatTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${getImportanceColor(entry.importance)}`}
                          title={`Importance: ${entry.importance}/10`}
                        />
                        <Badge variant="outline" className="text-xs">
                          {entry.importance}/10
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Main Content */}
                    <div className="text-sm text-foreground">
                      <p className="font-medium">{entry.content.summary}</p>
                    </div>

                    {/* Additional Details */}
                    {entry.content.impact && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Impact:</span> {entry.content.impact}
                      </div>
                    )}

                    {entry.content.rationale && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Justification:</span> {entry.content.rationale}
                      </div>
                    )}

                    {/* Triggered Decisions */}
                    {entry.content.decisions_triggered && entry.content.decisions_triggered.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Décisions déclenchées:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.content.decisions_triggered.map((decision, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {decision}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Impacted Agents */}
                    {entry.content.impact_agents && entry.content.impact_agents.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Agents impactés:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.content.impact_agents.map((agent, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-card border-soft">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} • {timelineData.total} événements
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}