'use client';

import { usePathname } from 'next/navigation';
import { Users, Briefcase, Zap, Building, BarChart3, Settings } from 'lucide-react';

interface AdminNavMenuProps {
  className?: string;
}

export default function AdminNavMenu({ className = '' }: AdminNavMenuProps) {
  const pathname = usePathname();

  const navItems = [
    { 
      id: 'dashboard', 
      label: '🏠 Dashboard', 
      href: '/cockpit/admin',
      icon: Settings
    },
    { 
      id: 'projects', 
      label: '📋 Projets', 
      href: '/cockpit/projects',
      icon: Briefcase
    },
    { 
      id: 'squads', 
      label: '🔷 Squads', 
      href: '/cockpit/squads',
      icon: Users
    },
    { 
      id: 'agents', 
      label: '👤 Agents', 
      href: '/cockpit/agents',
      icon: Zap
    },
    { 
      id: 'clients', 
      label: '🏢 Clients', 
      href: '/cockpit/clients',
      icon: Building
    },
    { 
      id: 'analytics', 
      label: '📊 Analytics', 
      href: '/cockpit/analytics',
      icon: BarChart3
    }
  ];

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className={`border-b border-gray-700 mb-6 ${className}`}>
      <div className="flex space-x-6 overflow-x-auto scroller">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}