'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();
    
    // Set up WebSocket connection for real-time updates
    const setupWebSocket = () => {
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`);
      
      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          addNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        // Retry connection after delay
        setTimeout(setupWebSocket, 5000);
      };

      return ws;
    };

    // For now, simulate notifications since WebSocket might not be available
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        addMockNotification();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      } else {
        // Load mock notifications for demo
        loadMockNotifications();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      loadMockNotifications();
    }
  };

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Instruction terminée',
        message: 'Squad Tech Alpha a terminé l\'instruction "Optimiser API users"',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Nouveau projet assigné',
        message: 'Squad RH Beta a été assignée au projet "Formation Q4"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'warning',
        title: 'Performance dégradée',
        message: 'Squad Marketing Core a un score de performance en baisse (78%)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const addMockNotification = () => {
    const mockNotifications = [
      {
        type: 'success' as const,
        title: 'Instruction terminée',
        message: 'Une instruction a été complétée avec succès'
      },
      {
        type: 'info' as const,
        title: 'Nouvelle squad créée',
        message: 'Une nouvelle squad a été ajoutée au système'
      },
      {
        type: 'warning' as const,
        title: 'Performance',
        message: 'Une squad nécessite votre attention'
      },
      {
        type: 'error' as const,
        title: 'Instruction échouée',
        message: 'Une instruction a rencontré une erreur'
      }
    ];
    
    const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
    addNotification(randomNotification);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read ? prev - 1 : prev;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
      case 'info': return <Info size={16} className="text-blue-400" />;
      default: return <Info size={16} className="text-gray-400" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Tout marquer lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700/30 transition-colors ${
                        !notification.read ? 'bg-gray-700/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-gray-400 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="w-2 h-2 bg-blue-400 rounded-full"
                                  title="Marquer comme lu"
                                />
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              {notification.action.label} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-4 border-t border-gray-700 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}