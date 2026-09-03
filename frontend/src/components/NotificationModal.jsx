import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Bell, CheckCheck, X, ShieldAlert } from 'lucide-react';

export default function NotificationModal() {
  const { showNotificationModal, setShowNotificationModal, latestNotification } = useApp();

  if (!showNotificationModal || !latestNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] max-w-md w-[calc(100%-48px)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white border-2 border-[#1769AA] rounded-2xl shadow-xl overflow-hidden text-[#172B3A]">
        {/* Header */}
        <div className="bg-[#1769AA] px-4 py-2.5 flex items-center justify-between text-white">
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
          <div className="flex items-center justify-between text-xs font-mono text-[#5B6B78] border-b border-[#D7E0E7] pb-2">
            <span>To: <strong className="text-[#172B3A]">{latestNotification.phone || "+91 98765 43210"}</strong></span>
            <span className="flex items-center gap-1 text-[#16855B] font-bold">
              <CheckCheck className="w-3.5 h-3.5" /> Dispatched
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#D7E0E7] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C62828] text-white uppercase">
                {latestNotification.severity || "CRITICAL"}
              </span>
              <span className="text-xs font-bold text-[#172B3A]">
                {latestNotification.title || "Emergency Advisory"}
              </span>
            </div>

            <p className="text-xs text-[#172B3A] leading-relaxed font-sans">
              {latestNotification.message}
            </p>
          </div>

          {/* Prototype Label */}
          <div className="text-[11px] font-mono text-[#D99A00] bg-[#FFF7E6] p-2 rounded-lg border border-[#D99A00]/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#D99A00]" />
            <span>
              <strong>Prototype Notification:</strong> Simulated SMS broadcast interface for evaluation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
