import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatSosTime, formatSosDateTime } from '../services/sosService';
import { 
  AlertOctagon, 
  Send, 
  Phone, 
  MapPin, 
  Users, 
  HeartPulse, 
  CheckCircle2, 
  X, 
  Radio, 
  Compass, 
  ShieldAlert, 
  Clock,
  Truck,
  Check
} from 'lucide-react';

export default function CitizenSosModal({ isOpen, onClose }) {
  const { 
    selectedLocation, 
    locationRisk, 
    submitSosRequest, 
    sosRequests 
  } = useApp();

  const [formData, setFormData] = useState({
    citizen_name: '',
    phone: '',
    people_count: 2,
    urgency: 'CRITICAL',
    message: 'Water entering ground floor / Road blocked by debris. Need urgent rescue evacuation.'
  });

  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Detecting GPS...');
  const [activeSosTicket, setActiveSosTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically attempt browser GPS geolocation on open
  useEffect(() => {
    if (isOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
            setGpsStatus('Live GPS Acquired');
          },
          () => {
            // Fallback to currently selected sector location coordinates
            const lat = selectedLocation?.lat || 30.4124;
            const lng = selectedLocation?.lng || 79.3198;
            setGpsCoords({ lat, lng });
            setGpsStatus('Sector Location GPS');
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        const lat = selectedLocation?.lat || 30.4124;
        const lng = selectedLocation?.lng || 79.3198;
        setGpsCoords({ lat, lng });
        setGpsStatus('Sector Location GPS');
      }
    }
  }, [isOpen, selectedLocation]);

  // Synchronize active SOS ticket status in real-time from global sosRequests
  useEffect(() => {
    if (activeSosTicket) {
      const match = sosRequests.find(s => s.sos_id === activeSosTicket.sos_id || s.id === activeSosTicket.id);
      if (match && match.status !== activeSosTicket.status) {
        setActiveSosTicket(prev => ({ ...prev, ...match }));
      }
    }
  }, [sosRequests, activeSosTicket]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dominantHazard = locationRisk?.dominant_hazard || 'FLASH FLOOD';
      const created = await submitSosRequest({
        ...formData,
        people_count: Number(formData.people_count),
        location_latitude: gpsCoords?.lat || selectedLocation?.lat || 30.4124,
        location_longitude: gpsCoords?.lng || selectedLocation?.lng || 79.3198,
        lat: gpsCoords?.lat || selectedLocation?.lat || 30.4124,
        lng: gpsCoords?.lng || selectedLocation?.lng || 79.3198,
        location_name: selectedLocation ? `${selectedLocation.name}, ${selectedLocation.state}` : 'Chamoli, Uttarakhand',
        hazard: dominantHazard,
        risk_level: formData.urgency || locationRisk?.overall_level || 'CRITICAL'
      });

      setActiveSosTicket(created);
    } catch (err) {
      console.error('[CitizenSosModal] Failed to submit SOS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'NEW':
        return 1;
      case 'ACKNOWLEDGED':
        return 2;
      case 'TEAM DISPATCHED':
        return 3;
      case 'RESCUE IN PROGRESS':
        return 4;
      case 'RESOLVED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = activeSosTicket ? getStatusStep(activeSosTicket.status) : 1;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-mono text-xs text-[#172B3A] dark:text-[#E2E8F0]">
      <div className="bg-white dark:bg-[#111C35] border-2 border-[#C62828] rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="bg-[#C62828] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight uppercase font-sans">
                EMERGENCY SOS RESCUE REQUEST
              </h3>
              <p className="text-[10px] sm:text-xs text-red-100">
                Direct transmission to NDRF / SDRF Command Queue
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {activeSosTicket ? (
            /* ========================================================================= */
            /* CITIZEN CONFIRMATION & LIVE LIFECYCLE TRACKER                             */
            /* ========================================================================= */
            <div className="space-y-4">
              <div className="p-5 bg-[#EAF7F1] dark:bg-emerald-950/40 border-2 border-[#16855B] rounded-2xl text-center space-y-2.5">
                <CheckCircle2 className="w-10 h-10 text-[#16855B] dark:text-emerald-400 mx-auto" />
                <h4 className="text-base sm:text-lg font-black text-[#172B3A] dark:text-white uppercase tracking-wider">
                  ✅ SOS SENT SUCCESSFULLY
                </h4>
                <div className="inline-block px-3 py-1 bg-[#C62828] text-white font-bold rounded-lg text-xs tracking-wider font-mono">
                  TICKET: #{activeSosTicket.sos_id || activeSosTicket.id}
                </div>
                <p className="text-xs text-[#172B3A] dark:text-slate-200 leading-relaxed font-sans">
                  Your distress beacon has been registered in the State Emergency Operations Center (SEOC). Stay in a secure high-ground location.
                </p>
              </div>

              {/* Status Tracker */}
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#5B6B78] dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">Live Rescue Status</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    activeSosTicket.status === 'NEW' ? 'bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border border-[#D99A00]/40' :
                    activeSosTicket.status === 'ACKNOWLEDGED' ? 'bg-[#E8F2F8] dark:bg-blue-950/40 text-[#1769AA] dark:text-blue-300 border border-[#1769AA]/40' :
                    activeSosTicket.status === 'TEAM DISPATCHED' ? 'bg-[#FFF1F1] dark:bg-red-950/40 text-[#C62828] dark:text-red-300 border border-[#C62828]/40' :
                    activeSosTicket.status === 'RESOLVED' ? 'bg-[#EAF7F1] dark:bg-emerald-950/40 text-[#16855B] dark:text-emerald-300 border border-[#16855B]/40' :
                    'bg-[#F8FAFC] dark:bg-slate-800 text-[#172B3A] dark:text-white'
                  }`}>
                    {activeSosTicket.status === 'NEW' ? 'WAITING FOR AUTHORITY' : activeSosTicket.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-1 text-center pt-2">
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 1 ? 'bg-[#FFF1F1] dark:bg-red-950/50 border-[#C62828] text-[#C62828] dark:text-red-300 font-bold' : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
                  }`}>
                    <span>1. SENT</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 2 ? 'bg-[#FFF7E6] dark:bg-amber-950/50 border-[#D99A00] text-[#D99A00] dark:text-amber-300 font-bold' : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
                  }`}>
                    <span>2. ACK</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 3 ? 'bg-[#E8F2F8] dark:bg-blue-950/50 border-[#1769AA] text-[#1769AA] dark:text-blue-300 font-bold' : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
                  }`}>
                    <span>3. DISPATCH</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 5 ? 'bg-[#EAF7F1] dark:bg-emerald-950/50 border-[#16855B] text-[#16855B] dark:text-emerald-300 font-bold' : 'bg-[#F8FAFC] dark:bg-[#0D162B] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
                  }`}>
                    <span>4. RESOLVED</span>
                  </div>
                </div>

                {/* Details Summary */}
                <div className="pt-2 border-t border-[#D7E0E7] dark:border-[#1E2E4A] space-y-1.5 text-[11px] text-[#172B3A] dark:text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-[#5B6B78] dark:text-slate-400">Location:</span>
                    <strong className="text-[#172B3A] dark:text-white text-right">{activeSosTicket.location_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6B78] dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C62828] dark:text-red-400" />
                      <span>Time Generated:</span>
                    </span>
                    <strong className="text-[#172B3A] dark:text-white font-bold">
                      {formatSosDateTime(activeSosTicket.timestamp)} ({activeSosTicket.time_ago || 'Just now'})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6B78] dark:text-slate-400">GPS Coordinates:</span>
                    <span className="text-[#1769AA] dark:text-[#38BDF8] font-mono font-bold">
                      {Number(activeSosTicket.location_latitude || activeSosTicket.lat || 30.4124).toFixed(4)}°N, {Number(activeSosTicket.location_longitude || activeSosTicket.lng || 79.3198).toFixed(4)}°E
                    </span>
                  </div>
                  {activeSosTicket.assigned_team_name && (
                    <div className="flex justify-between p-2 bg-[#E8F2F8] dark:bg-[#1769AA]/20 border border-[#1769AA]/40 rounded-lg">
                      <span className="text-[#5B6B78] dark:text-slate-300">Assigned Rescue Team:</span>
                      <strong className="text-[#1769AA] dark:text-[#38BDF8]">🚑 {activeSosTicket.assigned_team_name}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setActiveSosTicket(null)}
                  className="w-full py-2.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA] font-bold rounded-xl text-xs transition-all"
                >
                  Send Another SOS
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#C62828] hover:bg-[#a82222] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Close & Keep Monitoring
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* SOS TRANSMISSION INPUT FORM                                               */
            /* ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* GPS Coordinates Bar */}
              <div className="p-2.5 sm:p-3 bg-[#FFF1F1] dark:bg-red-950/40 border border-[#C62828]/30 rounded-xl flex items-center justify-between text-[#C62828] dark:text-red-300">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#C62828] dark:text-red-400 shrink-0" />
                  <span className="truncate text-[#172B3A] dark:text-white">Sector: <strong>{selectedLocation?.name}, {selectedLocation?.state}</strong></span>
                </div>
                {gpsCoords && (
                  <span className="text-[10px] text-[#1769AA] dark:text-[#38BDF8] bg-[#E8F2F8] dark:bg-[#070F1E] px-2 py-0.5 rounded border border-[#1769AA]/30 shrink-0 font-mono font-bold">
                    {gpsCoords.lat.toFixed(3)}°N, {gpsCoords.lng.toFixed(3)}°E
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.citizen_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizen_name: e.target.value }))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white font-sans text-xs focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">Contact Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">People Trapped / With You</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.people_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, people_count: e.target.value }))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA] text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">Urgency Level</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white font-bold focus:outline-none focus:border-[#1769AA] text-xs"
                >
                  <option value="CRITICAL" className="bg-white dark:bg-[#070F1E]">🔴 CRITICAL (Water rapidly rising / House unstable)</option>
                  <option value="HIGH" className="bg-white dark:bg-[#070F1E]">🟠 HIGH (Trapped by flood / Road cut off)</option>
                  <option value="MODERATE" className="bg-white dark:bg-[#070F1E]">🟡 MODERATE (Need assistance for elderly/infant)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172B3A] dark:text-slate-200 mb-1 font-semibold">Situation Details / Landmark</label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Mention exact landmark, floor, or medical condition..."
                  className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-2.5 text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA] font-sans text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#C62828] hover:bg-[#a82222] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'TRANSMITTING SOS SIGNAL...' : '🆘 TRANSMIT EMERGENCY SOS'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
