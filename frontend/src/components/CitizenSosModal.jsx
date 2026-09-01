import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, Send, Phone, MapPin, Users, HeartPulse, CheckCircle2, X } from 'lucide-react';

export default function CitizenSosModal({ isOpen, onClose }) {
  const { selectedLocation, submitSosRequest } = useApp();
  const [formData, setFormData] = useState({
    citizen_name: '',
    phone: '',
    people_count: 2,
    urgency: 'CRITICAL',
    message: 'Water entering ground floor / Road blocked by debris. Need urgent rescue evacuation.'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSosRequest({
      ...formData,
      people_count: Number(formData.people_count)
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131315] border-2 border-red-500 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase">
                EMERGENCY SOS RESCUE REQUEST
              </h3>
              <p className="text-xs text-red-100 font-mono">
                Direct transmission to NDRF / SDRF Emergency Operation Center
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isSubmitted ? (
            <div className="p-6 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">
                SOS Transmission Dispatched!
              </h4>
              <p className="text-xs text-emerald-200 font-mono leading-relaxed">
                Your emergency distress signal has been prioritized in the State Disaster Command Queue. A rescue coordinator has been notified. Stay on high ground.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span>Sector: <strong>{selectedLocation?.name}, {selectedLocation?.state}</strong></span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.citizen_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizen_name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contact Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">People Trapped / With You</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.people_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, people_count: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Urgency Level</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="CRITICAL">CRITICAL (Water rapidly rising / House unstable)</option>
                  <option value="HIGH">HIGH (Trapped by flood / Road cut off)</option>
                  <option value="MODERATE">MODERATE (Need assistance for elderly/infant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Situation Details / Landmark</label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Mention exact landmark, floor, or medical condition..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT EMERGENCY SOS</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
