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
  Sparkles,
  Truck,
  X
} from 'lucide-react';

export default function AuthoritySidebar() {
  const { 
    activePage, 
    setActivePage, 
    systemRisk, 
    sosRequests,
    isMobileMenuOpen,
    closeMobileMenu
  } = useApp();

  const navItems = [
    { id: 'authority', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'rescue-operations', label: 'Rescue Operations', icon: Truck },
    { id: 'ai-map-studio', label: 'AI Map Studio', icon: Sparkles },
    { id: 'risk-intelligence', label: 'Risk Intelligence Map', icon: Map },
    { id: 'impact-assessment', label: 'Impact Assessment', icon: Users },
    { id: 'simulation-studio', label: 'Simulation Studio', icon: Zap },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    closeMobileMenu();
  };

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-60 bg-[#0B2233] border-r border-[#294657] flex-col justify-between h-[calc(100vh-53px)] p-3 shrink-0 overflow-y-auto font-mono text-xs text-[#D7E0E7]">
        {/* Navigation List */}
        <div className="space-y-4">
          {/* SEOC Administrative Subhead */}
          <div className="px-2 py-1.5 bg-[#123047] border border-[#294657] rounded flex items-center justify-between text-[11px]">
            <span className="text-[#D7E0E7] font-bold uppercase tracking-wider">SEOC WORKSPACES</span>
            <span className="text-[#C62828] font-bold">ACTIVE</span>
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
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all ${
                    isActive
                      ? 'bg-[#1769AA] text-white font-bold shadow-sm'
                      : 'text-[#D7E0E7] hover:bg-[#183D55] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#D7E0E7]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      typeof item.badge === 'string' && item.badge.includes('SOS')
                        ? 'bg-[#C62828] text-white'
                        : 'bg-[#123047] text-[#D7E0E7]'
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
        <div className="pt-3 border-t border-[#294657] text-[10px] text-[#D7E0E7] space-y-1">
          <div className="flex justify-between">
            <span>Command Level:</span>
            <span className="text-white font-bold">STATE SEOC</span>
          </div>
          <div className="flex justify-between">
            <span>Protocol:</span>
            <span className="text-[#D7E0E7] font-bold">CAP v1.2 XML</span>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Slide-Over for Authority mode */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[999] bg-[#0B2233]/80 backdrop-blur-sm flex flex-col justify-start animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        >
          <div 
            className="w-full max-w-xs bg-[#0B2233] border-r border-[#294657] h-full p-4 overflow-y-auto space-y-4 shadow-2xl flex flex-col justify-between font-mono text-xs text-[#D7E0E7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#294657]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#123047] border border-[#294657] flex items-center justify-center text-[#1769AA] font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white">SEOC COMMAND</h2>
                    <span className="text-[10px] text-[#D7E0E7]">Authority Workspaces</span>
                  </div>
                </div>
                <button 
                  onClick={closeMobileMenu}
                  className="p-1.5 rounded-lg bg-[#123047] border border-[#294657] text-[#D7E0E7] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id || 
                    (item.id === 'authority' && activePage === 'dashboard') ||
                    (item.id === 'risk-intelligence' && activePage === 'map');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-all ${
                        isActive
                          ? 'bg-[#1769AA] text-white font-bold shadow-sm'
                          : 'text-[#D7E0E7] hover:bg-[#183D55] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#D7E0E7]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          typeof item.badge === 'string' && item.badge.includes('SOS')
                            ? 'bg-[#C62828] text-white'
                            : 'bg-[#123047] text-[#D7E0E7]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#294657] text-[10px] text-[#D7E0E7] space-y-1">
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="text-white font-bold">CAP v1.2 XML</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-[#16855B] font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
