import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CitizenSosModal from './CitizenSosModal';
import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  BellRing, 
  Home, 
  ShieldAlert, 
  Settings, 
  Flame, 
  Zap, 
  RotateCcw,
  Navigation,
  HeartPulse,
  Send,
  Radio,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activePage, 
    setActivePage, 
    userRole, 
    setUserRole,
    triggerSimulation, 
    isSimulating,
    systemRisk,
    sosRequests
  } = useApp();

  const [isSosOpen, setIsSosOpen] = useState(false);

  const pendingSosCount = sosRequests.filter(s => s.status === 'PENDING').length;

  const citizenNavItems = [
    { id: 'dashboard', label: 'My Safety Home', icon: LayoutDashboard },
    { id: 'map', label: 'Threat GIS Map', icon: Map },
    { id: 'location-risk', label: 'Location Risk', icon: MapPin },
    { id: 'safe-locations', label: 'Safe Evacuation Route', icon: Navigation },
    { id: 'alerts', label: 'Disaster Warnings', icon: BellRing, badge: systemRisk?.stats?.active_alerts || 0 },
    { id: 'settings', label: 'SMS & Alerts Setup', icon: Settings },
  ];

  const authorityNavItems = [
    { id: 'authority', label: 'SEOC Command Console', icon: ShieldAlert },
    { id: 'map', label: 'Tactical Threat GIS', icon: Map },
    { id: 'alerts', label: 'Broadcast History', icon: BellRing, badge: systemRisk?.stats?.active_alerts || 0 },
    { id: 'safe-locations', label: 'Shelter Logistics', icon: Home },
    { id: 'dashboard', label: 'Citizen View Preview', icon: UserCheck },
    { id: 'settings', label: 'Alert Subscriptions', icon: Settings }
  ];

  const navItems = userRole === 'authority' ? authorityNavItems : citizenNavItems;

  return (
    <aside className="w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between h-[calc(100vh-64px)] p-4 shrink-0 overflow-y-auto">
      {/* Navigation List */}
      <div className="space-y-6">
        {/* Role Badge Indicator */}
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
          userRole === 'authority'
            ? 'bg-red-950/40 border-red-500/40 text-red-300'
            : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
        }`}>
          {userRole === 'authority' ? (
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <UserCheck className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <div className="truncate">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70">
              Active Experience
            </span>
            <span className="text-xs font-bold font-mono">
              {userRole === 'authority' ? 'Government SEOC Command' : 'Citizen Safety Portal'}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
            {userRole === 'authority' ? 'Authority Modules' : 'Citizen Modules'}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? userRole === 'authority'
                        ? 'bg-red-600/20 text-red-300 border border-red-500/40 shadow-sm'
                        : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? (userRole === 'authority' ? 'text-red-400' : 'text-blue-400') : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-red-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Citizen Distress Trigger (Citizen Mode) */}
        {userRole === 'citizen' && (
          <div className="pt-2">
            <button
              onClick={() => setIsSosOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/20 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md"
            >
              <HeartPulse className="w-4 h-4 animate-pulse text-red-400" />
              <span>REQUEST SOS RESCUE</span>
            </button>
          </div>
        )}

        {/* SIH Simulation Studio (Both Modes) */}
        <div className="pt-4 border-t border-[#334155]">
          <div className="flex items-center gap-2 mb-2 px-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              SIH Simulation Studio
            </p>
          </div>
          <p className="text-[11px] text-slate-400 px-3 mb-3 leading-relaxed">
            Trigger environmental scenarios to evaluate real-time multi-hazard calculations.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => triggerSimulation('combined_emergency')}
              disabled={isSimulating}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-950/80 border border-red-500/60 hover:bg-red-900 text-red-200 rounded-lg text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Simulate Emergency (Full)</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerSimulation('flash_flood')}
                disabled={isSimulating}
                className="px-2 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-blue-300 rounded text-[11px] font-mono transition-all text-center truncate"
              >
                🌊 Flash Flood
              </button>
              <button
                onClick={() => triggerSimulation('landslide')}
                disabled={isSimulating}
                className="px-2 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-amber-300 rounded text-[11px] font-mono transition-all text-center truncate"
              >
                ⛰️ Landslide
              </button>
            </div>

            <button
              onClick={() => triggerSimulation('reset')}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-all"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#334155] text-[10px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Active Sector:</span>
          <span className="text-blue-400 font-semibold">Himalayan Arc</span>
        </div>
        <div className="flex justify-between">
          <span>Engine:</span>
          <span className="text-emerald-400">Deterministic + AI</span>
        </div>
      </div>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </aside>
  );
}
