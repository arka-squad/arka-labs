"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';

type ChatSize = 'collapsed' | 'normal' | 'expanded';

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [size, setSize] = useState<ChatSize>('normal');
  const chatRef = useRef<HTMLDivElement>(null);

  // Calcul de la largeur selon la taille
  const getWidth = () => {
    if (!isOpen) return 0;
    switch (size) {
      case 'collapsed': return 300;
      case 'normal': return 400;
      case 'expanded': return 600;
      default: return 400;
    }
  };

  // Publier la largeur en CSS custom property
  useEffect(() => {
    const width = getWidth();
    document.documentElement.style.setProperty('--cockpit-chat-w', `${width}px`);
    
    return () => {
      document.documentElement.style.setProperty('--cockpit-chat-w', '0px');
    };
  }, [isOpen, size]);

  const width = getWidth();

  return (
    <>
      {/* Toggle button quand fermé */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-[72px] top-1/2 -translate-y-1/2 z-30 bg-gray-800 border border-gray-700 rounded-r-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Ouvrir le chat"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed left-[72px] top-14 bottom-0 bg-gray-800 border-r border-gray-700 flex flex-col z-20 shadow-lg"
          style={{ width: `${width}px` }}
        >
          {/* Header du chat */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-850">
            <div className="flex items-center space-x-2">
              <MessageSquare size={16} className="text-blue-400" />
              <span className="text-white font-medium">Chat Global</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="En ligne" />
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Contrôles de taille */}
              <button
                onClick={() => setSize(size === 'collapsed' ? 'normal' : 'collapsed')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={size === 'collapsed' ? 'Agrandir' : 'Réduire'}
              >
                {size === 'collapsed' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              
              {size !== 'collapsed' && (
                <button
                  onClick={() => setSize(size === 'expanded' ? 'normal' : 'expanded')}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title={size === 'expanded' ? 'Taille normale' : 'Pleine largeur'}
                >
                  <Maximize2 size={14} />
                </button>
              )}
              
              {/* Fermer */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Fermer le chat"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Contenu du chat */}
          <div className="flex-1 flex flex-col">
            {size === 'collapsed' ? (
              // Version réduite - juste indicateur
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <MessageSquare size={24} className="mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm">Chat réduit</p>
                  <button
                    onClick={() => setSize('normal')}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Développer
                  </button>
                </div>
              </div>
            ) : (
              // Chat complet - Version temporaire
              <div className="flex-1 p-4">
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm">💬 Assistant Cockpit</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Interface de chat intégrée - En cours de développement
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Posez vos questions sur l'administration..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  disabled
                />
              </div>
            )}
          </div>

          {/* Footer avec infos */}
          <div className="p-2 border-t border-gray-700 bg-gray-850">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Cockpit Assistant</span>
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>Prêt</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}