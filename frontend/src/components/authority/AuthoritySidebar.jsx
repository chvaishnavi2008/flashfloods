import React from 'react';
import { useApp } from '../../context/AppContext';
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
  Server,
  FileText,
  Radio,
  Clock,
  Building2,
  Sparkles
} from 'lucide-react';

export default function AuthoritySidebar() {
  const { 
    activePage, 
    setActivePage, 
    systemRisk, 
    sosRequests 
  } = useApp();

  const activeAlertsCount = systemRisk?.stats?.active_alerts || 0;
  const pendingSosCount = (sosRequests || []).filter(s => s.status === 'PENDING').length;

  const navItems = [
    { id: 'authority', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'ai-map-studio', label: 'AI Map Studio', icon: Sparkles },
    { id: 'risk-intelligence', label: 'Risk Intelligence', icon: Map },
    { id: 'alerts', label: 'Alerts & Warnings', icon: BellRing, badge: activeAlertsCount },
    { id: 'impact-assessment', label: 'Impact Assessment', icon: Users },
    { id: 'ai-risk-engine', label: 'AI Risk Engine', icon: Brain },
    { id: 'simulation-studio', label: 'Simulation Studio', icon: Zap },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-[#0B1120] border-r border-slate-700/80 flex flex-col justify-between h-[calc(100vh-53px)] p-3 shrink-0 overflow-y-auto font-mono text-xs">
      {/* Navigation List */}
      <div className="space-y-4">
        {/* SEOC Administrative Subhead */}
        <div className="px-2 py-1.5 bg-slate-900 border border-slate-700/80 rounded flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider">SEOC WORKSPACES</span>
          <span className="text-red-400 font-bold">ACTIVE</span>
        </div>

        {/* Workspace Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || 
              (item.id === 'authority' && activePage === 'dashboard') ||
              (item.id === 'risk-intelligence' && activePage === 'map');

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border-l-2 border-red-500 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    typeof item.badge === 'string' && item.badge.includes('SOS')
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional Footer */}
      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Command Level:</span>
          <span className="text-slate-300 font-bold">STATE SEOC</span>
        </div>
        <div className="flex justify-between">
          <span>Protocol:</span>
          <span className="text-slate-300 font-bold">CAP v1.2 XML</span>
        </div>
      </div>
    </aside>
  );
}
