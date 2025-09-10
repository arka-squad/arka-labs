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
          className="bg-gray-800 border border-gray-700 rounded-r-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors h-10 self-start mt-2"
          title="Ouvrir le chat"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div
          ref={chatRef}
          className="bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg h-full"
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
              // Chat fonctionnel - Similaire au screenshot
              <>
                {/* Chat Header avec informations thread */}
                <div className="border-b border-gray-700 p-3 bg-gray-800/50">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Chat — Arka 2.6 — ACP | Actif —</span>
                    <div className="flex items-center space-x-2">
                      <span>Squad</span>
                      <span>Alpha</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm font-medium">Agent du fil</span>
                      <div className="text-xs text-gray-500">ACP — Arka v2.5 - ACP</div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span>UTC+01</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-white bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-1 rounded">AGP — Arka v2.5 — ACP</span>
                      <span className="text-green-400">65%</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">EPIC-42    EPIC-7</div>
                    <div className="text-xs text-gray-500">TTFT 1.2j • Gate 92% • 8/sem</div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 text-xs">
                    <select className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white">
                      <option>Fournisseur</option>
                    </select>
                    <select className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white">
                      <option>Modèle</option>
                    </select>
                    <span className="text-white font-medium">Clé</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                    <span className="text-red-400">Déconnecté</span>
                    <span>TTFT —</span>
                    <span>🔗 Trace ---</span>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto scroller p-3 space-y-4">
                  {/* Message 1 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:41</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        Élaboration d&apos;un plan structuré
                      </div>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:42</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        2 fichiers générés: Livrable-ACP_Objectifs-Fonctionnels-Prioritaires-Arka.md (x2).
                      </div>
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:44</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        On prépare l&apos;ossature de la PR Vague 1 (répertoires + README), duplication des scripts CI sous infra/ci, + placeholders tests/docs. Un CR résumera les changements.
                      </div>
                    </div>
                  </div>

                  {/* Message 4 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:46</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        Je crée l&apos;ossature cible non destructive (dossiers + README) et duplique les scripts CI sous infra/ci/ sans toucher aux imports.
                      </div>
                    </div>
                  </div>

                  {/* Message 5 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:49</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        Reco: prise de connaissance faite — 9 fichiers lus, contenu cohérent; quelques artefacts d&apos;encodage FR mineurs visibles. Action: souhaitez-vous que je normalise l&apos;UTF-8 (sans BOM) sur ces docs ou que je passe au lot suivant Socle OPS/Repo ?
                      </div>
                    </div>
                  </div>

                  {/* Message 6 */}
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">a</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">agent</span>
                        <span className="text-gray-500 text-xs">09:50</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        Action: j&apos;ouvre local/100-repo-map-audit.md pour poursuivre le lot OPS/Repo.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t border-gray-700 p-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Message à squad Alpha..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm"
                    />
                    <button className="p-2 text-gray-400 hover:text-white">
                      <span>+</span>
                    </button>
                    <button className="p-2 text-blue-400 hover:text-blue-300">
                      <span>⚙️</span> Auto
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white">
                      <span>↑</span>
                    </button>
                  </div>
                </div>
              </>
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