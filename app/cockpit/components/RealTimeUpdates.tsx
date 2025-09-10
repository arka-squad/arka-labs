'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface RealTimeStatus {
  connected: boolean;
  lastUpdate: Date | null;
  retryCount: number;
}

interface UseRealTimeOptions {
  endpoint: string;
  interval?: number;
  enabled?: boolean;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useRealTimeUpdates<T>({
  endpoint,
  interval = 10000, // 10 seconds
  enabled = true,
  onUpdate,
  onError
}: UseRealTimeOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RealTimeStatus>({
    connected: false,
    lastUpdate: null,
    retryCount: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Real-Time': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setLoading(false);
      setStatus(prev => ({
        connected: true,
        lastUpdate: new Date(),
        retryCount: 0
      }));

      if (onUpdate) {
        onUpdate(result);
      }
    } catch (error) {
      console.error('Real-time update failed:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        retryCount: prev.retryCount + 1
      }));

      if (onError) {
        onError(error as Error);
      }
    }
  }, [endpoint, onUpdate, onError]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return { data, loading, status, refresh };
}

interface RealTimeIndicatorProps {
  status: RealTimeStatus;
  onRefresh?: () => void;
  className?: string;
}

export function RealTimeIndicator({ status, onRefresh, className = '' }: RealTimeIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (seconds < 60) return `Il y a ${seconds}s`;
    if (minutes < 60) return `Il y a ${minutes}min`;
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          status.connected 
            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
            : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
        }`}
      >
        {status.connected ? (
          <Wifi size={12} className="animate-pulse" />
        ) : (
          <WifiOff size={12} />
        )}
        <span>
          {status.connected ? 'En ligne' : 'Hors ligne'}
        </span>
      </button>

      {showDetails && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Statut temps réel</h4>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">État</span>
                  <span className={status.connected ? 'text-green-400' : 'text-red-400'}>
                    {status.connected ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Dernière MàJ</span>
                  <span className="text-gray-300">
                    {formatLastUpdate(status.lastUpdate)}
                  </span>
                </div>
                
                {status.retryCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tentatives</span>
                    <span className="text-yellow-400">
                      {status.retryCount}
                    </span>
                  </div>
                )}
              </div>

              {!status.connected && status.retryCount > 3 && (
                <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400">
                  ⚠️ Problème de connexion persistant
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface LiveDataBadgeProps {
  children: React.ReactNode;
  isLive?: boolean;
  className?: string;
}

export function LiveDataBadge({ children, isLive = true, className = '' }: LiveDataBadgeProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLive && (
        <div className="absolute -top-1 -right-1">
          <div className="flex items-center justify-center w-4 h-4">
            <div className="absolute w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealTimeUpdates() {
  // This component can be used as a provider for global real-time features
  return null;
}