import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CitizenSosModal from './CitizenSosModal';
import { 
  Home, 
  Map, 
  BellRing, 
  Building2, 
  Navigation, 
  HeartPulse, 
  ShieldAlert, 
  UserCheck, 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Brain, 
  Zap, 
  Settings,
  Sparkles,
  Truck 
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activePage, 
    setActivePage, 
    userRole, 
    setUserRole,
    systemRisk,
    sosRequests,
    isGlobalSosOpen,
    setIsGlobalSosOpen
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const activeAlertsCount = systemRisk?.stats?.active_alerts || 0;

  // 1. Citizen-First Navigation (Simple, Human, Action-Oriented)
  const citizenNavItems = [
    { 
      id: 'dashboard', 
      label: 'Home', 
      tag: 'Am I safe?',
      icon: Home 
    },
    { 
      id: 'map', 
      label: 'Danger Map', 
      tag: 'Floods & slopes',
      icon: Map 
    },
    { 
      id: 'alerts', 
      label: 'My Alerts', 
      tag: 'Local warnings',
      icon: BellRing, 
      badge: activeAlertsCount 
    },
    { 
      id: 'safe-locations', 
      label: 'Safe Places', 
      tag: 'Relief shelters',
      icon: Building2 
    },
    { 
      id: 'evacuation', 
      label: 'Evacuation', 
      tag: 'Safest routes',
      icon: Navigation 
    },
    { 
      id: 'emergency-help', 
      label: 'Emergency Help', 
      tag: 'SOS & contacts',
      icon: HeartPulse,
      highlightRed: true
    }
  ];

  // 2. Authority Command Navigation (Full Technical Intelligence Workspaces)
  const authorityNavItems = [
    { 
      id: 'authority', 
      label: 'Command Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'rescue-operations', 
      label: 'Rescue Operations', 
      icon: Truck,
      highlightRed: true 
    },
    { 
      id: 'ai-map-studio', 
      label: 'AI Map Studio', 
      icon: Sparkles 
    },
    { 
      id: 'risk-intelligence', 
      label: 'Risk Intelligence Map', 
      icon: Map 
    },
    { 
      id: 'impact-assessment', 
      label: 'Impact Assessment', 
      icon: Users 
    },
    { 
      id: 'simulation-studio', 
      label: 'Simulation Studio', 
      icon: Zap
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings 
    }
  ];

  const currentNavItems = userRole === 'authority' ? authorityNavItems : citizenNavItems;

  return (
    <aside className="hidden lg:flex w-64 bg-[#0B2233] border-r border-[#294657] flex-col justify-between h-[calc(100vh-64px)] p-4 shrink-0 overflow-y-auto font-mono text-xs">
      {/* Top Navigation Items */}
      <div className="space-y-5">
        {/* Active Role Indicator Card */}
        <div className="p-2.5 rounded-xl border border-[#294657] bg-[#123047] text-[#D7E0E7] flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            {userRole === 'authority' ? (
              <ShieldAlert className="w-4 h-4 text-[#1769AA] shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#1769AA] shrink-0" />
            )}
            <div className="truncate">
              <span className="text-[9px] uppercase tracking-wider block opacity-70">
                Experience
              </span>
              <span className="text-xs font-bold truncate text-white">
                {userRole === 'authority' ? 'Authority Command' : 'Citizen Safety'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const nextRole = userRole === 'authority' ? 'citizen' : 'authority';
              setUserRole(nextRole);
              setActivePage(nextRole === 'authority' ? 'authority' : 'dashboard');
            }}
            className="text-[10px] text-[#D7E0E7] underline hover:text-white transition-all ml-1 shrink-0"
          >
            Switch
          </button>
        </div>

        {/* Navigation Item Links */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D7E0E7] mb-2 px-2">
            {userRole === 'authority' ? 'SEOC Workspaces' : 'Citizen Safety Navigation'}
          </p>
          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id || 
                (item.id === 'map' && activePage === 'map') ||
                (item.id === 'safe-locations' && activePage === 'safe-locations');

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1769AA] text-white font-bold'
                      : 'text-[#D7E0E7] hover:bg-[#183D55] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#D7E0E7]'
                    }`} />
                    <div className="text-left truncate">
                      <span className="block font-bold truncate">{item.label}</span>
                    </div>
                  </div>

                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#C62828] text-white rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SOS Button in Sidebar (Citizen Mode) */}
        {userRole === 'citizen' && (
          <div className="pt-2">
            <button
              onClick={() => setIsSosOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <HeartPulse className="w-4 h-4 text-white" />
              <span>REQUEST SOS RESCUE</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#294657] text-[10px] text-[#D7E0E7] space-y-1">
        <div className="flex justify-between">
          <span>Active Mode:</span>
          <span className="text-[#16855B] font-bold">
            {userRole === 'authority' ? 'SEOC Expert' : 'Citizen Safety'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="text-[#16855B] font-bold">OPERATIONAL</span>
        </div>
      </div>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen || isGlobalSosOpen} onClose={() => { setIsSosOpen(false); setIsGlobalSosOpen(false); }} />
    </aside>
  );
}
