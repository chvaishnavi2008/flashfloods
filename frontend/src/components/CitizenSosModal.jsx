import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-mono text-xs">
      <div className="bg-[#131315] border-2 border-red-500 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse shrink-0" />
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight uppercase font-sans">
                EMERGENCY SOS RESCUE REQUEST
              </h3>
              <p className="text-[10px] sm:text-xs text-red-100">
                Direct transmission to NDRF / SDRF Command Queue
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-red-700/50">
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
              <div className="p-5 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl text-center space-y-2.5 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  ✅ SOS SENT SUCCESSFULLY
                </h4>
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-xs tracking-wider font-mono">
                  TICKET: #{activeSosTicket.sos_id || activeSosTicket.id}
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed font-sans">
                  Your distress beacon has been registered in the State Emergency Operations Center (SEOC). Stay in a secure high-ground location.
                </p>
              </div>

              {/* Status Tracker */}
              <div className="p-4 bg-slate-900 border border-slate-700/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Live Rescue Status</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    activeSosTicket.status === 'NEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                    activeSosTicket.status === 'ACKNOWLEDGED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                    activeSosTicket.status === 'TEAM DISPATCHED' ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                    activeSosTicket.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-slate-800 text-white'
                  }`}>
                    {activeSosTicket.status === 'NEW' ? 'WAITING FOR AUTHORITY' : activeSosTicket.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-1 text-center pt-2">
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 1 ? 'bg-red-950/80 border-red-500 text-red-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <span>1. SENT</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 2 ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <span>2. ACK</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 3 ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <span>3. DISPATCH</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-[10px] ${
                    currentStep >= 5 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <span>4. RESOLVED</span>
                  </div>
                </div>

                {/* Details Summary */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <strong className="text-white text-right">{activeSosTicket.location_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="text-cyan-300 font-mono">
                      {Number(activeSosTicket.location_latitude || activeSosTicket.lat || 30.4124).toFixed(4)}°N, {Number(activeSosTicket.location_longitude || activeSosTicket.lng || 79.3198).toFixed(4)}°E
                    </span>
                  </div>
                  {activeSosTicket.assigned_team_name && (
                    <div className="flex justify-between p-2 bg-blue-950/40 border border-blue-500/40 rounded-lg">
                      <span className="text-slate-400">Assigned Rescue Team:</span>
                      <strong className="text-blue-300">🚑 {activeSosTicket.assigned_team_name}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setActiveSosTicket(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
                >
                  Send Another SOS
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
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
              <div className="p-2.5 sm:p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-between text-red-300">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">Sector: <strong>{selectedLocation?.name}, {selectedLocation?.state}</strong></span>
                </div>
                {gpsCoords && (
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0 font-mono">
                    {gpsCoords.lat.toFixed(3)}°N, {gpsCoords.lng.toFixed(3)}°E
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.citizen_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizen_name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contact Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">People Trapped / With You</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.people_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, people_count: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Urgency Level</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Water rapidly rising / House unstable)</option>
                  <option value="HIGH">🟠 HIGH (Trapped by flood / Road cut off)</option>
                  <option value="MODERATE">🟡 MODERATE (Need assistance for elderly/infant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Situation Details / Landmark</label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Mention exact landmark, floor, or medical condition..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
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
