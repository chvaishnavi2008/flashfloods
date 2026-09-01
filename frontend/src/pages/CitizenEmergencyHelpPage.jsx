import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CitizenSosModal from '../components/CitizenSosModal';
import { 
  HeartPulse, 
  PhoneCall, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Share2, 
  CheckCircle2, 
  Radio,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function CitizenEmergencyHelpPage() {
  const { selectedLocation, locationRisk, setActivePage } = useApp();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  const handleShareLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`EMERGENCY: I am in ${selectedLocation?.name || 'Chamoli'}, ${selectedLocation?.state || 'Uttarakhand'} (Lat: ${selectedLocation?.lat || '30.41'}, Lon: ${selectedLocation?.lon || '79.32'}). Please send rescue.`);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-red-950/70 border border-red-500/60 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl shrink-0">
            <HeartPulse className="w-7 h-7 animate-pulse text-red-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
              DIRECT DISASTER LIFELINE
            </span>
            <h1 className="text-2xl font-black text-white mt-0.5">
              🆘 Emergency Help & Rescue
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          If you or someone near you is trapped, injured, or in immediate danger from flooding or landslides, use these tools to request rescue and contact authorities immediately.
        </p>
      </div>

      {/* 4 Large Action Cards (Unmissable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Request SOS Rescue */}
        <button
          onClick={() => setIsSosOpen(true)}
          className="p-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl shadow-xl flex flex-col justify-between text-left space-y-4 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl">
              <HeartPulse className="w-8 h-8 animate-bounce" />
            </div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold font-mono">
              PRIORITY RESCUE
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight group-hover:underline">
              1. REQUEST SOS RESCUE
            </h2>
            <p className="text-xs text-red-100 mt-1">
              Send your exact GPS coordinates and medical details directly to SDRF / NDRF teams.
            </p>
          </div>
        </button>

        {/* 2. Call Emergency Contacts */}
        <div className="p-6 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
              <PhoneCall className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold font-mono">
              24/7 TOLL-FREE
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              2. EMERGENCY CONTACTS
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              National Emergency: <strong className="text-red-400 text-sm">112</strong> • SDMA Disaster Line: <strong className="text-blue-400 text-sm">1070</strong>
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href="tel:112"
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase text-center rounded-xl transition-all"
            >
              Call 112
            </a>
            <a
              href="tel:1070"
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase text-center rounded-xl border border-slate-700 transition-all"
            >
              Call 1070
            </a>
          </div>
        </div>

        {/* 3. Share My Location */}
        <button
          onClick={handleShareLocation}
          className="p-6 bg-[#1E293B] border border-slate-700 hover:border-slate-600 rounded-2xl shadow-xl flex flex-col justify-between text-left space-y-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            {copiedLocation ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-mono">
                ONE-CLICK COPY
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              3. SHARE MY LOCATION
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Copy your GPS sector text to paste into SMS or WhatsApp to family & rescue teams.
            </p>
          </div>
        </button>

        {/* 4. Find Safe Places */}
        <button
          onClick={() => setActivePage('safe-locations')}
          className="p-6 bg-[#1E293B] border border-slate-700 hover:border-emerald-500/50 rounded-2xl shadow-xl flex flex-col justify-between text-left space-y-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold font-mono">
              OPEN SHELTERS
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              4. FIND SAFE PLACE
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              See nearest community relief camps and dry shelter centers above danger mark.
            </p>
          </div>
        </button>
      </div>

      {/* Citizen SOS Modal */}
      <CitizenSosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
