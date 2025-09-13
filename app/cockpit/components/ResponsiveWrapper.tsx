'use client';

import { ReactNode } from 'react';
import MobileNav from './MobileNav';
import NotificationCenter from './NotificationCenter';
import { RealTimeIndicator, useRealTimeUpdates } from './RealTimeUpdates';

interface ResponsiveWrapperProps {
  children: ReactNode;
  currentPath?: string;
  userRole?: string;
  showMobileNav?: boolean;
  contentClassName?: string; // Classes CSS pour le conteneur de contenu
  innerClassName?: string;   // Classes CSS pour le conteneur intérieur (max-width, etc.)
}

export default function ResponsiveWrapper({ 
  children, 
  currentPath,
  userRole = 'viewer',
  showMobileNav = true,
  contentClassName = '',
  innerClassName = ''
}: ResponsiveWrapperProps) {
  // Set up real-time connection status monitoring
  const { status } = useRealTimeUpdates({
    endpoint: '/api/health',
    interval: 30000, // Check every 30 seconds
    enabled: true
  });

  return (
    <div className="console-theme min-h-screen text-white relative">
      {showMobileNav && (
        <MobileNav currentPath={currentPath} userRole={userRole} />
      )}
      
      {/* Top Bar for Notifications and Status - Desktop */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <div className="flex items-center space-x-3">
          <RealTimeIndicator 
            status={status} 
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <NotificationCenter />
        </div>
      </div>

      {/* Mobile Notification Bar */}
      <div className="fixed top-4 right-4 z-30 md:hidden">
        <div className="flex items-center space-x-2">
          <RealTimeIndicator status={status} className="scale-90" />
          <NotificationCenter />
        </div>
      </div>
      
      {/* Main Content with proper mobile padding */}
      <div className={`
        ${showMobileNav ? 'pt-4 md:pt-6' : 'pt-6'}
        pb-6
        ${contentClassName}
      `}>
        <div className={`${innerClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
