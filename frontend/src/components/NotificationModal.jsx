import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Bell, CheckCheck, X, ShieldAlert } from 'lucide-react';

export default function NotificationModal() {
  const { showNotificationModal, setShowNotificationModal, latestNotification } = useApp();

  if (!showNotificationModal || !latestNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[950] max-w-md w-[calc(100%-48px)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#131315] border-2 border-blue-500 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              PROTOTYPE SMS NOTIFICATION DISPATCH
            </span>
          </div>
          <button
            onClick={() => setShowNotificationModal(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smartphone SMS Bubble Representation */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>To: <strong className="text-slate-200">{latestNotification.phone || "+91 98765 43210"}</strong></span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCheck className="w-3.5 h-3.5" /> Dispatched
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white uppercase">
                {latestNotification.severity || "CRITICAL"}
              </span>
              <span className="text-xs font-bold text-white">
                {latestNotification.title || "Emergency Advisory"}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {latestNotification.message}
            </p>
          </div>

          {/* Prototype Label */}
          <div className="text-[11px] font-mono text-amber-400/90 bg-amber-950/30 p-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Prototype Notification:</strong> Simulated SMS broadcast interface for SIH evaluation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
