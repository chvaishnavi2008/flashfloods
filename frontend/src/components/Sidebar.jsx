import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CitizenSosModal from './CitizenSosModal';
import { 
  LayoutDashboard, 
  Map, 
  BellRing, 
  Users, 
  ShieldCheck, 
  Brain, 
  Zap, 
  Settings, 
  ShieldAlert, 
  UserCheck, 
  HeartPulse,
  Radio,
  Building2,
  Navigation
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activePage, 
    setActivePage, 
    userRole, 
    setUserRole,
    systemRisk,
    sosRequests
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const pendingSosCount = (sosRequests || []).filter(s => s.status === 'PENDING').length;
  const activeAlertsCount = systemRisk?.stats?.active_alerts || 0;

  // The 8 Canonical Product Workspaces
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      tag: 'Real-time overview',
      icon: LayoutDashboard 
    },
    { 
      id: 'risk-intelligence', 
      label: 'Risk Intelligence', 
      tag: 'Threat GIS & layers',
      icon: Map 
    },
    { 
      id: 'alerts', 
      label: 'Alerts & Warnings', 
      tag: 'Broadcast feeds',
      icon: BellRing, 
      badge: activeAlertsCount 
    },
    { 
      id: 'impact-assessment', 
      label: 'Impact Assessment', 
      tag: 'Exposure & assets',
      icon: Users 
    },
    { 
      id: 'emergency-response', 
      label: 'Emergency Response', 
      tag: 'Shelters & routes',
      icon: ShieldCheck 
    },
    { 
      id: 'ai-risk-engine', 
      label: 'AI Risk Engine', 
      tag: 'Formula & pipeline',
      icon: Brain 
    },
    { 
      id: 'simulation-studio', 
      label: 'Simulation Studio', 
      tag: 'SIH 7-phase demo',
      icon: Zap,
      highlight: true
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      tag: 'Subscriptions & role',
      icon: Settings 
    }
  ];

  return (
    <aside className="w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between h-[calc(100vh-64px)] p-4 shrink-0 overflow-y-auto font-mono">
      {/* Navigation List */}
      <div className="space-y-5">
        {/* Role Switcher Pill */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
          userRole === 'authority'
            ? 'bg-red-950/40 border-red-500/40 text-red-300'
            : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {userRole === 'authority' ? (
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <div className="truncate">
              <span className="text-[9px] uppercase tracking-wider block opacity-70">
                Mode
              </span>
              <span className="text-xs font-bold truncate">
                {userRole === 'authority' ? 'Authority SEOC' : 'Citizen Safety'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setUserRole(userRole === 'authority' ? 'citizen' : 'authority')}
            className="text-[10px] underline hover:text-white transition-all ml-1 shrink-0"
          >
            Switch
          </button>
        </div>

        {/* 8 Clean Core Workspaces */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
            Disaster Workspaces
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id || 
                (item.id === 'risk-intelligence' && (activePage === 'map' || activePage === 'location-risk')) ||
                (item.id === 'emergency-response' && activePage === 'safe-locations');
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : item.highlight
                        ? 'text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive 
                        ? (item.highlight ? 'text-indigo-300' : 'text-blue-400') 
                        : (item.highlight ? 'text-indigo-400' : 'text-slate-400')
                    }`} />
                    <div className="text-left truncate">
                      <span className="block font-bold truncate">{item.label}</span>
                    </div>
                  </div>

                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-red-600 text-white rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SOS Emergency Trigger Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsSosOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-600/20 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <HeartPulse className="w-4 h-4 animate-pulse text-red-400" />
            <span>REQUEST SOS RESCUE</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#334155] text-[10px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Himalayan Arc:</span>
          <span className="text-blue-400 font-bold">Chamoli (Alaknanda)</span>
        </div>
        <div className="flex justify-between">
          <span>Early Warning:</span>
          <span className="text-emerald-400 font-bold">CAP-RSS v1.2</span>
        </div>
      </div>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </aside>
  );
}
