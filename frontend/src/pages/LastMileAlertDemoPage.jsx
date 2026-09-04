import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { soundService } from '../services/soundService';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  PhoneCall, 
  RefreshCw, 
  Building2, 
  Cpu, 
  Wifi, 
  Server, 
  FileText, 
  Info, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Clock,
  MapPin,
  Flame,
  MessageSquare
} from 'lucide-react';

export default function LastMileAlertDemoPage() {
  const { 
    locations, 
    selectedLocation, 
    selectedLocationId,
    locationRisk,
    liveWeather,
    liveRisk
  } = useApp();

  // 1. Form Inputs State
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [targetLocationId, setTargetLocationId] = useState(selectedLocationId || 1);
  const [hazardType, setHazardType] = useState('flash_flood');
  const [riskLevel, setRiskLevel] = useState('HIGH');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState(54);
  const [customMessage, setCustomMessage] = useState('');
  const [isAutoMessage, setIsAutoMessage] = useState(true);

  // 2. Simulation Workflow State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0); // 0: Idle, 1: Authority, 2: Engine, 3: Message, 4: Gateway, 5: Delivered
  const [hasDelivered, setHasDelivered] = useState(false);
  const [deliveredMessage, setDeliveredMessage] = useState(null);
  const [deliveryTimestamp, setDeliveryTimestamp] = useState(null);
  const [smsId, setSmsId] = useState(101);
  const [phoneMessageState, setPhoneMessageState] = useState('inbox'); // 'inbox' | 'open' | 'deleted'

  const activeLoc = locations.find(l => l.id === Number(targetLocationId)) || selectedLocation || locations[0];

  // Helper to generate concise, realistic SMS text under 160 characters
  const generateSmsTemplate = (loc, hazard, level, leadTime) => {
    const locName = loc?.name || 'Chamoli';
    const hazardLabels = {
      flash_flood: 'Flash flood',
      landslide: 'Landslide',
      heavy_rainfall: 'Torrential rain'
    };
    const hazardText = hazardLabels[hazard] || 'Disaster';
    const riskScore = level === 'CRITICAL' ? 88 : (level === 'HIGH' ? 72 : 45);
    
    return `AapdaSetu ALERT: ${level} RISK. ${hazardText} risk detected in ${locName}. Risk: ${riskScore}/100. Warning: ${leadTime} mins. ACTION: Move to the nearest safe location. Emergency: 112`;
  };

  // Sync auto-message template on form parameter change
  useEffect(() => {
    if (isAutoMessage) {
      const generated = generateSmsTemplate(activeLoc, hazardType, riskLevel, leadTimeMinutes);
      setCustomMessage(generated);
    }
  }, [activeLoc, hazardType, riskLevel, leadTimeMinutes, isAutoMessage]);

  // Handle "Send Demo SMS" Simulation Flow
  const handleTriggerSimulation = (e) => {
    if (e) e.preventDefault();
    if (isSimulating) return;

    setIsSimulating(true);
    setHasDelivered(false);
    setSimulationStep(1);
    setPhoneMessageState('inbox');

    const finalMsg = customMessage.trim() || generateSmsTemplate(activeLoc, hazardType, riskLevel, leadTimeMinutes);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1 -> Step 2 (Engine) after 300ms
    setTimeout(() => {
      setSimulationStep(2);
    }, 350);

    // Step 2 -> Step 3 (Message Encoded) after 700ms
    setTimeout(() => {
      setSimulationStep(3);
    }, 750);

    // Step 3 -> Step 4 (SMS Gateway Simulated) after 1100ms
    setTimeout(() => {
      setSimulationStep(4);
    }, 1150);

    // Step 4 -> Step 5 (Feature Phone Received) after 1600ms
    setTimeout(() => {
      setSimulationStep(5);
      setIsSimulating(false);
      setHasDelivered(true);
      setDeliveredMessage({
        text: finalMsg,
        location: activeLoc?.name || 'Chamoli',
        hazard: hazardType,
        level: riskLevel,
        leadTime: leadTimeMinutes,
        score: riskLevel === 'CRITICAL' ? 88 : (riskLevel === 'HIGH' ? 72 : 45),
        time: timeStr,
        phone: recipientPhone
      });
      setDeliveryTimestamp(now);
      setSmsId(prev => prev + 1);

      // Play soft notification beep
      try {
        soundService.playAlertChime();
      } catch (err) {
        // audio policy fallback
      }
    }, 1650);
  };

  const handleResetDemo = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setHasDelivered(false);
    setDeliveredMessage(null);
    setPhoneMessageState('inbox');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-mono text-[#172B3A] dark:text-[#E2E8F0]">
      {/* ===================================================================== */}
      {/* PAGE HEADER & DEMO BANNER                                             */}
      {/* ===================================================================== */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/40 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#1769AA] dark:text-[#38BDF8]" />
                LAST-MILE EMERGENCY OUTREACH
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7E6] dark:bg-amber-950/40 text-[#D99A00] dark:text-amber-300 border border-[#D99A00]/40">
                DEMO — SMS DELIVERY SIMULATION
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#172B3A] dark:text-white flex items-center gap-2 pt-0.5">
              <span>Last-Mile Alert Demo</span>
            </h1>
            <p className="text-xs text-[#5B6B78] dark:text-slate-400">
              Demonstrate emergency alerts for users without smartphones or reliable internet.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetDemo}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#1769AA]/20 text-[#5B6B78] dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#D7E0E7] dark:border-[#1E2E4A] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#E8F2F8] dark:bg-[#1769AA]/15 border border-[#1769AA]/30 text-xs">
          <Info className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-[#172B3A] dark:text-slate-300">
            <strong>Prototype Notice:</strong> This interactive simulator demonstrates how AapdaSetu delivers life-saving SMS alerts to basic 2G/keypad mobile phones during network outages or for rural citizens without smartphones. <em>No actual cellular carrier charges or real SMS broadcasts occur in this demonstration.</em>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2-COLUMN WORKSPACE: FORM + DELIVERY FLOW (LEFT) & KEYPAD PHONE (RIGHT) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SECTION 1 (Form) + SECTION 2 (Flow) + SECTION 4 (Status) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1 — CREATE ALERT */}
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1769AA] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h2 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase tracking-wider">
                  Create Emergency Alert
                </h2>
              </div>
              <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">
                Authoring Console
              </span>
            </div>

            <form onSubmit={handleTriggerSimulation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Recipient Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-[#1769AA] dark:text-[#38BDF8]" />
                    <span>Recipient Phone</span>
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono font-bold text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C62828]" />
                    <span>Target Location</span>
                  </label>
                  <select
                    value={targetLocationId}
                    onChange={(e) => setTargetLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono font-bold text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-[#0B2233] text-white">
                        {loc.name}, {loc.state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hazard Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#E87516]" />
                    <span>Hazard</span>
                  </label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono font-bold text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                  >
                    <option value="flash_flood" className="bg-[#0B2233] text-white">Flash Flood</option>
                    <option value="landslide" className="bg-[#0B2233] text-white">Landslide</option>
                    <option value="heavy_rainfall" className="bg-[#0B2233] text-white">Extreme Rainfall / Cloudburst</option>
                  </select>
                </div>

                {/* Risk Level & Lead Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300">Risk Level</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono font-bold text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                    >
                      <option value="CRITICAL" className="bg-[#0B2233] text-white">CRITICAL</option>
                      <option value="HIGH" className="bg-[#0B2233] text-white">HIGH</option>
                      <option value="MODERATE" className="bg-[#0B2233] text-white">MODERATE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300">Lead Time</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="360"
                        value={leadTimeMinutes}
                        onChange={(e) => setLeadTimeMinutes(Number(e.target.value) || 30)}
                        className="w-full px-2.5 py-2 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono font-bold text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-[#5B6B78] dark:text-slate-400">mins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Message Textarea */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#5B6B78] dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#1769AA] dark:text-[#38BDF8]" />
                    <span>Emergency Message (Compact Plaintext SMS)</span>
                  </label>
                  <span className={`text-[10px] font-mono ${customMessage.length > 160 ? 'text-[#C62828] font-bold' : 'text-[#5B6B78] dark:text-slate-400'}`}>
                    {customMessage.length} / 160 chars {customMessage.length <= 160 ? '(1 SMS packet)' : '(Multi-part)'}
                  </span>
                </div>
                <textarea
                  rows="3"
                  value={customMessage}
                  onChange={(e) => {
                    setCustomMessage(e.target.value);
                    setIsAutoMessage(false);
                  }}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg text-xs font-mono text-[#172B3A] dark:text-slate-200 focus:outline-none focus:border-[#1769AA] leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="flex-1 px-4 py-2.5 bg-[#1769AA] hover:bg-[#125890] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
                  <span>{isSimulating ? 'Simulating Dispatch...' : 'Send Demo SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoMessage(true);
                    setCustomMessage(generateSmsTemplate(activeLoc, hazardType, riskLevel, leadTimeMinutes));
                  }}
                  className="px-3 py-2.5 bg-[#F8FAFC] dark:bg-[#070F1E] hover:bg-[#E8F2F8] dark:hover:bg-[#1769AA]/20 text-[#5B6B78] dark:text-slate-300 rounded-xl text-xs font-bold border border-[#D7E0E7] dark:border-[#1E2E4A] transition-all"
                  title="Regenerate template from current settings"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#38BDF8]" />
                  <span>Auto-Format</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2 — ALERT DELIVERY FLOW */}
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1769AA] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase tracking-wider">
                  Alert Delivery Flow
                </h2>
              </div>
              <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">
                End-to-End Pipeline
              </span>
            </div>

            {/* Stepped Flow Chart */}
            <div className="space-y-2">
              {/* Step 1: Authority */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                simulationStep >= 1 
                  ? 'bg-[#EAF7F1] dark:bg-emerald-950/30 border-[#16855B]/50 text-[#172B3A] dark:text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simulationStep >= 1 ? 'bg-[#16855B] text-white' : 'bg-[#D7E0E7] dark:bg-[#1E2E4A] text-[#5B6B78]'
                  }`}>
                    1
                  </div>
                  <div>
                    <strong className="block text-xs font-black">Authority (SEOC Command)</strong>
                    <span className="text-[10px] opacity-80">Incident trigger & dispatch initiated by operator</span>
                  </div>
                </div>
                {simulationStep >= 1 && <CheckCircle2 className="w-4 h-4 text-[#16855B] shrink-0" />}
              </div>

              {/* Step 2: Alert Engine */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                simulationStep >= 2 
                  ? 'bg-[#EAF7F1] dark:bg-emerald-950/30 border-[#16855B]/50 text-[#172B3A] dark:text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simulationStep >= 2 ? 'bg-[#16855B] text-white' : 'bg-[#D7E0E7] dark:bg-[#1E2E4A] text-[#5B6B78]'
                  }`}>
                    2
                  </div>
                  <div>
                    <strong className="block text-xs font-black">AapdaSetu Alert Engine</strong>
                    <span className="text-[10px] opacity-80">Geospatial matching & life-safety action generation</span>
                  </div>
                </div>
                {simulationStep >= 2 && <CheckCircle2 className="w-4 h-4 text-[#16855B] shrink-0" />}
              </div>

              {/* Step 3: SMS Generated */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                simulationStep >= 3 
                  ? 'bg-[#EAF7F1] dark:bg-emerald-950/30 border-[#16855B]/50 text-[#172B3A] dark:text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simulationStep >= 3 ? 'bg-[#16855B] text-white' : 'bg-[#D7E0E7] dark:bg-[#1E2E4A] text-[#5B6B78]'
                  }`}>
                    3
                  </div>
                  <div>
                    <strong className="block text-xs font-black">SMS Message Generated</strong>
                    <span className="text-[10px] opacity-80">Formatted into compact high-priority GSM-7 encoding</span>
                  </div>
                </div>
                {simulationStep >= 3 && <CheckCircle2 className="w-4 h-4 text-[#16855B] shrink-0" />}
              </div>

              {/* Step 4: SMS Gateway (SIMULATED) */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                simulationStep >= 4 
                  ? 'bg-[#EAF7F1] dark:bg-emerald-950/30 border-[#16855B]/50 text-[#172B3A] dark:text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simulationStep >= 4 ? 'bg-[#16855B] text-white' : 'bg-[#D7E0E7] dark:bg-[#1E2E4A] text-[#5B6B78]'
                  }`}>
                    4
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-black">SMS Gateway</strong>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FFF7E6] dark:bg-amber-950 text-[#D99A00] dark:text-amber-300 border border-[#D99A00]/40">
                        SIMULATED FOR PROTOTYPE
                      </span>
                    </div>
                    <span className="text-[10px] opacity-80">Cellular telecom SMPP routing queue</span>
                  </div>
                </div>
                {simulationStep >= 4 && <CheckCircle2 className="w-4 h-4 text-[#16855B] shrink-0" />}
              </div>

              {/* Step 5: Feature Phone */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                simulationStep >= 5 
                  ? 'bg-[#EAF7F1] dark:bg-emerald-950/30 border-[#16855B]/50 text-[#172B3A] dark:text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#070F1E] border-[#D7E0E7] dark:border-[#1E2E4A] text-[#5B6B78] dark:text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    simulationStep >= 5 ? 'bg-[#16855B] text-white' : 'bg-[#D7E0E7] dark:bg-[#1E2E4A] text-[#5B6B78]'
                  }`}>
                    5
                  </div>
                  <div>
                    <strong className="block text-xs font-black">Feature Phone</strong>
                    <span className="text-[10px] opacity-80">Offline user receives emergency alert via 2G network</span>
                  </div>
                </div>
                {simulationStep >= 5 && <CheckCircle2 className="w-4 h-4 text-[#16855B] shrink-0" />}
              </div>
            </div>
          </div>

          {/* SECTION 4 — DEMO DELIVERY STATUS */}
          {hasDelivered && (
            <div className="bg-[#EAF7F1] dark:bg-emerald-950/30 border border-[#16855B] rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-[#16855B]/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16855B]" />
                  <h3 className="text-sm font-black text-[#16855B] dark:text-emerald-300 uppercase tracking-wide">
                    Simulation successful
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#16855B] dark:text-emerald-400 font-bold">
                  Event ID #{smsId}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white/80 dark:bg-[#070F1E]/80 rounded-lg border border-[#16855B]/30 space-y-0.5">
                  <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block">Step 1</span>
                  <strong className="text-[#16855B] dark:text-emerald-300 font-bold flex items-center gap-1">
                    <span>✓ Alert Created</span>
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 dark:bg-[#070F1E]/80 rounded-lg border border-[#16855B]/30 space-y-0.5">
                  <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block">Step 2 & 3</span>
                  <strong className="text-[#16855B] dark:text-emerald-300 font-bold flex items-center gap-1">
                    <span>✓ Message Generated</span>
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 dark:bg-[#070F1E]/80 rounded-lg border border-[#16855B]/30 space-y-0.5">
                  <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block">Step 4</span>
                  <strong className="text-[#16855B] dark:text-emerald-300 font-bold flex items-center gap-1">
                    <span>✓ Delivery Simulated</span>
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 dark:bg-[#070F1E]/80 rounded-lg border border-[#16855B]/30 space-y-0.5">
                  <span className="text-[10px] text-[#5B6B78] dark:text-slate-400 block">Step 5</span>
                  <strong className="text-[#16855B] dark:text-emerald-300 font-bold flex items-center gap-1">
                    <span>✓ Phone Received</span>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SECTION 3 (KEYPAD FEATURE PHONE) & SECTION 5 (EXPLANATION) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 3 — FEATURE PHONE SIMULATION */}
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1769AA] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h2 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase tracking-wider">
                  Feature Phone Simulation
                </h2>
              </div>
              <span className="text-[10px] text-[#5B6B78] dark:text-slate-400">
                Keypad Handset Display
              </span>
            </div>

            {/* REALISTIC KEYPAD PHONE CHASSIS */}
            <div className="flex justify-center py-2">
              <div className="w-full max-w-[280px] bg-[#2C3E50] border-4 border-[#1A252F] rounded-[36px] p-4 shadow-2xl space-y-3.5 select-none transition-all">
                
                {/* Phone Speaker & Brand Header */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-1.5 bg-[#1A252F] rounded-full" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    AAPDASETU 2G
                  </span>
                </div>

                {/* RETRO LCD SCREEN (Green/Olive Matrix Screen) */}
                <div className="bg-[#8CA870] border-4 border-[#475E38] rounded-xl p-2.5 font-mono text-[#192B0C] shadow-inner space-y-2 min-h-[220px] flex flex-col justify-between">
                  
                  {/* LCD Status Header */}
                  <div className="flex items-center justify-between text-[9px] border-b border-[#475E38]/40 pb-1 font-bold">
                    <span className="flex items-center gap-0.5">
                      <span>📶</span>
                      <span>AapdaSetu</span>
                    </span>
                    <span>{deliveredMessage?.time || '10:15 AM'}</span>
                    <span>🔋</span>
                  </div>

                  {/* LCD Screen Content Area */}
                  <div className="flex-1 text-[10px] leading-tight space-y-1.5 py-1">
                    {phoneMessageState === 'deleted' ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-1 opacity-70">
                        <span className="text-xs">🗑️</span>
                        <p className="font-bold">Message Deleted</p>
                        <p className="text-[8px]">Inbox Empty</p>
                      </div>
                    ) : deliveredMessage ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between border-b border-[#475E38]/30 pb-0.5 text-[9px] font-bold">
                          <span>📩 NEW MESSAGE</span>
                          <span>1/1</span>
                        </div>

                        <div className="font-bold text-[10px] tracking-wide text-black uppercase">
                          {deliveredMessage.level} RISK ALERT
                        </div>

                        <p className="text-[9px] leading-snug">
                          {deliveredMessage.hazard === 'flash_flood' ? 'Flash flood' : (deliveredMessage.hazard === 'landslide' ? 'Landslide' : 'Extreme rain')} risk detected in {deliveredMessage.location}.
                        </p>

                        <div className="text-[9px] space-y-0.5">
                          <div>Risk: <strong className="font-black">{deliveredMessage.score}/100</strong></div>
                          <div>Warning: <strong className="font-black">{deliveredMessage.leadTime} minutes</strong></div>
                        </div>

                        <div className="pt-0.5 border-t border-[#475E38]/30 text-[9px]">
                          <strong className="block font-black">ACTION:</strong>
                          <span>Move to the nearest safe location.</span>
                        </div>

                        <div className="text-[9px] font-bold pt-0.5">
                          Emergency: 112
                        </div>
                      </div>
                    ) : (
                      /* Idle Feature Phone Screen */
                      <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-2">
                        <div className="p-2 rounded-full bg-[#475E38]/20 text-xs">
                          📱
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-[10px]">AapdaSetu Ready</p>
                          <p className="text-[8px] opacity-80">Click "Send Demo SMS" to simulate alert arrival</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#475E38]/20 rounded font-bold">
                          0 New Messages
                        </span>
                      </div>
                    )}
                  </div>

                  {/* LCD Softkey Labels */}
                  <div className="flex items-center justify-between text-[8px] font-bold border-t border-[#475E38]/40 pt-1">
                    <span>1 Open</span>
                    <span>2 Delete</span>
                  </div>
                </div>

                {/* PHYSICAL KEYPAD HARDWARE CONTROLS */}
                <div className="space-y-2 pt-1">
                  {/* Top Softkeys & D-Pad */}
                  <div className="grid grid-cols-3 gap-1.5 items-center">
                    <button 
                      onClick={() => setPhoneMessageState('open')}
                      className="py-1.5 bg-[#34495E] hover:bg-[#415B76] active:bg-[#1A252F] text-white text-[9px] font-bold rounded-lg border border-[#1A252F] shadow-sm transition-all"
                    >
                      —
                    </button>
                    <div className="h-8 bg-[#1A252F] rounded-lg flex items-center justify-center border border-[#34495E]">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#34495E]" />
                    </div>
                    <button 
                      onClick={() => setPhoneMessageState('deleted')}
                      className="py-1.5 bg-[#34495E] hover:bg-[#415B76] active:bg-[#1A252F] text-white text-[9px] font-bold rounded-lg border border-[#1A252F] shadow-sm transition-all"
                    >
                      —
                    </button>
                  </div>

                  {/* Call / End Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-1 bg-[#16855B] hover:bg-[#125890] active:bg-green-900 text-white text-[10px] font-bold rounded-md flex items-center justify-center shadow-sm">
                      📞
                    </button>
                    <button 
                      onClick={() => setPhoneMessageState('deleted')}
                      className="py-1 bg-[#C62828] hover:bg-red-800 active:bg-red-950 text-white text-[10px] font-bold rounded-md flex items-center justify-center shadow-sm"
                    >
                      🔴
                    </button>
                  </div>

                  {/* 12 Key Number Pad */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-white">
                    {[
                      { num: '1', sub: 'Open' },
                      { num: '2', sub: 'Delete' },
                      { num: '3', sub: 'def' },
                      { num: '4', sub: 'ghi' },
                      { num: '5', sub: 'jkl' },
                      { num: '6', sub: 'mno' },
                      { num: '7', sub: 'pqrs' },
                      { num: '8', sub: 'tuv' },
                      { num: '9', sub: 'wxyz' },
                      { num: '*', sub: '+' },
                      { num: '0', sub: '␣' },
                      { num: '#', sub: '⇧' }
                    ].map((keyItem) => (
                      <button
                        key={keyItem.num}
                        onClick={() => {
                          if (keyItem.num === '1') setPhoneMessageState('open');
                          if (keyItem.num === '2') setPhoneMessageState('deleted');
                        }}
                        className="p-1 bg-[#34495E] hover:bg-[#415B76] active:bg-[#1A252F] rounded-lg border border-[#1A252F] shadow-sm text-center leading-none"
                      >
                        <span className="text-xs font-bold block">{keyItem.num}</span>
                        <span className="text-[7px] text-slate-400 block">{keyItem.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Microphone Hole */}
                  <div className="flex justify-center pt-0.5">
                    <div className="w-1 h-1 bg-[#1A252F] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — EXPLANATION */}
          <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1769AA] text-white flex items-center justify-center text-xs font-bold">4</span>
                <h2 className="text-sm font-bold text-[#172B3A] dark:text-white uppercase tracking-wider">
                  How this works in production
                </h2>
              </div>
            </div>

            <ol className="space-y-2.5 text-xs text-[#5B6B78] dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1769AA] dark:text-[#38BDF8] shrink-0">1.</span>
                <span><strong>AapdaSetu detects a high-risk event</strong> using live telemetry and physics modeling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1769AA] dark:text-[#38BDF8] shrink-0">2.</span>
                <span><strong>Alert Engine generates an emergency message</strong> with actionable directives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1769AA] dark:text-[#38BDF8] shrink-0">3.</span>
                <span><strong>Backend sends the message to an SMS gateway</strong> over secure telecom APIs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1769AA] dark:text-[#38BDF8] shrink-0">4.</span>
                <span><strong>SMS gateway delivers the warning</strong> to registered phone numbers in the affected zone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1769AA] dark:text-[#38BDF8] shrink-0">5.</span>
                <span><strong>Feature-phone users receive the warning</strong> without needing smartphones or the web app.</span>
              </li>
            </ol>

            <div className="p-3 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-xl text-[11px] text-[#5B6B78] dark:text-slate-400 space-y-1">
              <div>
                <strong>Prototype:</strong> SMS delivery is simulated.
              </div>
              <div>
                <strong>Production:</strong> This module can be connected to a DLT-compliant SMS gateway (e.g., C-DAC / Telecom DLT framework).
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
