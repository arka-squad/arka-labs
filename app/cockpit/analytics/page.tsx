'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Users, Briefcase, Zap, 
  Clock, Target, ArrowUp, ArrowDown, Calendar, Filter,
  Download, RefreshCw, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import ResponsiveWrapper from '../components/ResponsiveWrapper';

interface PerformanceMetrics {
  squads: {
    total: number;
    active: number;
    performance_avg: number;
    top_performer: { name: string; score: number } | null;
  };
  projects: {
    total: number;
    active: number;
    completion_rate: number;
    avg_duration_days: number;
  };
  instructions: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    in_progress: number;
    avg_completion_hours: number;
    success_rate: number;
  };
  trends: {
    squad_growth: number;
    project_growth: number;
    instruction_growth: number;
    performance_trend: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    squads: { total: 0, active: 0, performance_avg: 0, top_performer: null },
    projects: { total: 0, active: 0, completion_rate: 0, avg_duration_days: 0 },
    instructions: { total: 0, completed: 0, failed: 0, pending: 0, in_progress: 0, avg_completion_hours: 0, success_rate: 0 },
    trends: { squad_growth: 0, project_growth: 0, instruction_growth: 0, performance_trend: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedChart, setSelectedChart] = useState<'instructions' | 'performance' | 'projects'>('instructions');
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, chartsRes] = await Promise.all([
        fetch(`/api/analytics/metrics?range=${timeRange}`, {
          credentials: 'include'
        }),
        fetch(`/api/analytics/charts?range=${timeRange}&type=${selectedChart}`, {
          credentials: 'include'
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      } else {
        // Fallback with mock data for demo
        setMetrics({
          squads: { 
            total: 12, 
            active: 10, 
            performance_avg: 0.87, 
            top_performer: { name: 'Tech Core Alpha', score: 0.94 }
          },
          projects: { 
            total: 8, 
            active: 6, 
            completion_rate: 0.75, 
            avg_duration_days: 14.5 
          },
          instructions: { 
            total: 156, 
            completed: 142, 
            failed: 8, 
            pending: 4, 
            in_progress: 2, 
            avg_completion_hours: 2.3, 
            success_rate: 0.91 
          },
          trends: { 
            squad_growth: 0.15, 
            project_growth: 0.23, 
            instruction_growth: 0.34, 
            performance_trend: 0.08 
          }
        });
      }

      if (chartsRes.ok) {
        const chartsData = await chartsRes.json();
        setChartData(chartsData);
      } else {
        // Mock chart data
        const mockData = generateMockChartData(selectedChart, timeRange);
        setChartData(mockData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set default mock data
      setMetrics({
        squads: { total: 12, active: 10, performance_avg: 0.87, top_performer: { name: 'Tech Core Alpha', score: 0.94 }},
        projects: { total: 8, active: 6, completion_rate: 0.75, avg_duration_days: 14.5 },
        instructions: { total: 156, completed: 142, failed: 8, pending: 4, in_progress: 2, avg_completion_hours: 2.3, success_rate: 0.91 },
        trends: { squad_growth: 0.15, project_growth: 0.23, instruction_growth: 0.34, performance_trend: 0.08 }
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = (type: string, range: string): ChartData => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const labels = Array.from({length: days}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    });

    switch (type) {
      case 'instructions':
        return {
          labels,
          datasets: [
            {
              label: 'Terminées',
              data: Array.from({length: days}, () => Math.floor(Math.random() * 20) + 5),
              color: '#10B981'
            },
            {
              label: 'Créées',
              data: Array.from({length: days}, () => Math.floor(Math.random() * 25) + 8),
              color: '#3B82F6'
            }
          ]
        };
      case 'performance':
        return {
          labels,
          datasets: [
            {
              label: 'Score Moyen (%)',
              data: Array.from({length: days}, () => Math.floor(Math.random() * 20) + 75),
              color: '#8B5CF6'
            }
          ]
        };
      case 'projects':
        return {
          labels,
          datasets: [
            {
              label: 'Projets Actifs',
              data: Array.from({length: days}, () => Math.floor(Math.random() * 3) + 5),
              color: '#F59E0B'
            }
          ]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon size={14} />
        <span>{Math.abs(value * 100).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <ResponsiveWrapper 
        currentPath="/cockpit/analytics"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des analytics...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/analytics"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/cockpit/admin'}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Dashboard
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Analytics & Performance</h1>
              <p className="text-gray-400">Métriques de performance et insights en temps réel</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              <span>Actualiser</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Squad Performance */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Users size={24} className="text-blue-400" />
              </div>
              {formatTrend(metrics.trends.squad_growth)}
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-white mb-1">{metrics.squads.active}</div>
              <div className="text-gray-400 text-sm">Squads Actives</div>
            </div>
            <div className="text-xs text-blue-400">
              Performance: {Math.round(metrics.squads.performance_avg * 100)}%
            </div>
          </div>

          {/* Projects */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Briefcase size={24} className="text-green-400" />
              </div>
              {formatTrend(metrics.trends.project_growth)}
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-white mb-1">{metrics.projects.active}</div>
              <div className="text-gray-400 text-sm">Projets Actifs</div>
            </div>
            <div className="text-xs text-green-400">
              Durée moy: {metrics.projects.avg_duration_days.toFixed(1)} jours
            </div>
          </div>

          {/* Instructions Success Rate */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Zap size={24} className="text-purple-400" />
              </div>
              {formatTrend(metrics.trends.instruction_growth)}
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-white mb-1">
                {Math.round(metrics.instructions.success_rate * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Taux de Succès</div>
            </div>
            <div className="text-xs text-purple-400">
              {metrics.instructions.completed}/{metrics.instructions.total} terminées
            </div>
          </div>

          {/* Average Completion Time */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-900/30 rounded-lg">
                <Clock size={24} className="text-orange-400" />
              </div>
              {formatTrend(metrics.trends.performance_trend)}
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.instructions.avg_completion_hours.toFixed(1)}h
              </div>
              <div className="text-gray-400 text-sm">Temps Moyen</div>
            </div>
            <div className="text-xs text-orange-400">
              Par instruction
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Évolution Temporelle</h3>
              <div className="flex bg-gray-700 rounded-lg p-1">
                {['instructions', 'performance', 'projects'].map((chart) => (
                  <button
                    key={chart}
                    onClick={() => setSelectedChart(chart as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                      selectedChart === chart 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Simple Chart Visualization */}
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center space-y-1 h-48 justify-end">
                    {chartData.datasets.map((dataset, datasetIndex) => {
                      const value = dataset.data[index] || 0;
                      const maxValue = Math.max(...dataset.data);
                      const height = (value / maxValue) * 160;
                      
                      return (
                        <div
                          key={datasetIndex}
                          className="rounded-t opacity-80 hover:opacity-100 transition-opacity"
                          style={{
                            backgroundColor: dataset.color,
                            height: `${height}px`,
                            minHeight: '4px',
                            width: '20px'
                          }}
                          title={`${dataset.label}: ${value}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-4">
              {chartData.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: dataset.color }}
                  />
                  <span className="text-sm text-gray-400">{dataset.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Squad Performance Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Performance des Squads</h3>
            
            <div className="space-y-4">
              {metrics.squads.top_performer && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">🏆 Meilleure Performance</span>
                    <span className="text-green-400 font-bold">
                      {Math.round(metrics.squads.top_performer.score * 100)}%
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{metrics.squads.top_performer.name}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {metrics.squads.total}
                  </div>
                  <div className="text-gray-400 text-sm">Total Squads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {Math.round(metrics.squads.performance_avg * 100)}%
                  </div>
                  <div className="text-gray-400 text-sm">Perf. Moyenne</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instruction Status Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">État des Instructions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-gray-300">Terminées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-medium">{metrics.instructions.completed}</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ 
                        width: `${(metrics.instructions.completed / metrics.instructions.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity size={16} className="text-blue-400" />
                  <span className="text-gray-300">En cours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-medium">{metrics.instructions.in_progress}</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ 
                        width: `${(metrics.instructions.in_progress / metrics.instructions.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-gray-300">En attente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-medium">{metrics.instructions.pending}</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${(metrics.instructions.pending / metrics.instructions.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle size={16} className="text-red-400" />
                  <span className="text-gray-300">Échecs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 font-medium">{metrics.instructions.failed}</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ 
                        width: `${(metrics.instructions.failed / metrics.instructions.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
          <div className="flex items-center space-x-3 mb-4">
            <Target size={24} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Insights Clés</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-green-400 font-medium">Performance Croissante</span>
              </div>
              <p className="text-gray-300 text-sm">
                Le taux de succès des instructions a augmenté de {Math.abs(metrics.trends.performance_trend * 100).toFixed(1)}% 
                sur la période sélectionnée.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity size={16} className="text-blue-400" />
                <span className="text-blue-400 font-medium">Squads Actives</span>
              </div>
              <p className="text-gray-300 text-sm">
                {Math.round((metrics.squads.active / metrics.squads.total) * 100)}% des squads sont 
                actuellement actives et performantes.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-orange-400" />
                <span className="text-orange-400 font-medium">Efficacité</span>
              </div>
              <p className="text-gray-300 text-sm">
                Temps moyen de {metrics.instructions.avg_completion_hours.toFixed(1)}h par instruction, 
                légèrement en dessous de la cible de 3h.
              </p>
            </div>
          </div>
        </div>
    </ResponsiveWrapper>
  );
}