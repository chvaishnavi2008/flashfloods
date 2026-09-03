import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Map, 
  Building2, 
  BellRing, 
  HeartPulse, 
  LayoutDashboard, 
  Zap, 
  Menu,
  Sparkles,
  Truck
} from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    activePage, 
    setActivePage, 
    userRole, 
    systemRisk, 
    setIsGlobalSosOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useApp();

  const activeAlertsCount = systemRisk?.stats?.active_alerts || 0;
  const isAuthority = userRole === 'authority';

  const handleNav = (pageId) => {
    closeMobileMenu();
    setActivePage(pageId);
  };

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-lg border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {!isAuthority ? (
        /* Citizen Safety Bottom Bar */
        <div className="grid grid-cols-5 items-center justify-items-center gap-1 max-w-md mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'dashboard'
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'dashboard' ? 'bg-blue-500/20' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
          </button>

          {/* 2. Danger Map */}
          <button
            onClick={() => handleNav('map')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'map'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'map' ? 'bg-cyan-500/20' : ''}`}>
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Map</span>
          </button>

          {/* 3. Center SOS Emergency Action */}
          <button
            onClick={() => {
              closeMobileMenu();
              setIsGlobalSosOpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-4 group"
            title="Emergency SOS Rescue"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 ring-4 ring-[#0B1120] transform active:scale-95 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] text-red-400 font-bold mt-1 tracking-wider uppercase">
              SOS
            </span>
          </button>

          {/* 4. Safe Places */}
          <button
            onClick={() => handleNav('safe-locations')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'safe-locations'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'safe-locations' ? 'bg-emerald-500/20' : ''}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Shelters</span>
          </button>

          {/* 5. Alerts */}
          <button
            onClick={() => handleNav('alerts')}
            className={`relative flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'alerts'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg relative ${activePage === 'alerts' ? 'bg-amber-500/20' : ''}`}>
              <BellRing className="w-5 h-5" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Alerts</span>
          </button>
        </div>
      ) : (
        /* Authority SEOC Command Bottom Bar */
        <div className="grid grid-cols-5 items-center justify-items-center gap-1 max-w-md mx-auto">
          {/* 1. Command Dashboard */}
          <button
            onClick={() => handleNav('authority')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'authority' || activePage === 'dashboard'
                ? 'text-red-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'authority' || activePage === 'dashboard' ? 'bg-red-500/20' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Command</span>
          </button>

          {/* 2. Risk Intel */}
          <button
            onClick={() => handleNav('risk-intelligence')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'risk-intelligence' || activePage === 'map'
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'risk-intelligence' || activePage === 'map' ? 'bg-blue-500/20' : ''}`}>
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Intel Map</span>
          </button>

          {/* 3. AI Map Studio */}
          <button
            onClick={() => handleNav('ai-map-studio')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'ai-map-studio'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'ai-map-studio' ? 'bg-cyan-500/20' : ''}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">AI Studio</span>
          </button>

          {/* 4. Rescue Operations */}
          <button
            onClick={() => handleNav('rescue-operations')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
              activePage === 'rescue-operations'
                ? 'text-red-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activePage === 'rescue-operations' ? 'bg-red-500/20' : ''}`}>
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Rescue</span>
          </button>

          {/* 5. Full Drawer Menu */}
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center justify-center w-full py-1 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
          </button>
        </div>
      )}
    </nav>
  );
}
