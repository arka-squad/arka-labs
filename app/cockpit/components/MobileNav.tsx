'use client';

import { useState } from 'react';
import { 
  Menu, X, Home, Users, Briefcase, Zap, BarChart3,
  Settings, LogOut, ChevronDown 
} from 'lucide-react';

interface MobileNavProps {
  currentPath?: string;
  userRole?: string;
}

export default function MobileNav({ currentPath, userRole = 'viewer' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { 
      path: '/cockpit/admin', 
      label: 'Dashboard', 
      icon: Home,
      roles: ['admin', 'manager', 'operator', 'viewer'] 
    },
    { 
      path: '/cockpit/admin/squads', 
      label: 'Squads', 
      icon: Users,
      roles: ['admin', 'manager', 'operator'] 
    },
    { 
      path: '/cockpit/admin/projects', 
      label: 'Projets', 
      icon: Briefcase,
      roles: ['admin', 'manager', 'operator', 'viewer'] 
    },
    { 
      path: '/cockpit/instructions', 
      label: 'Instructions', 
      icon: Zap,
      roles: ['admin', 'manager', 'operator'] 
    },
    { 
      path: '/cockpit/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      roles: ['admin', 'manager'] 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed position */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700 shadow-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Panel */}
      <div className={`
        fixed top-0 left-0 h-full w-80 console-theme border-r border-gray-700 z-50 
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">B23 Cockpit</h2>
                <p className="text-gray-400 text-sm">Console Admin</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-2 px-4">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      window.location.href = item.path;
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                      transition-colors ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Menu */}
          <div className="border-t border-gray-700 p-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userRole?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm font-medium capitalize">
                      {userRole}
                    </div>
                    <div className="text-gray-400 text-xs">Connecté</div>
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors">
                    <Settings size={16} className="text-gray-400" />
                    <span className="text-gray-300">Paramètres</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors text-red-400">
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header Spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
}