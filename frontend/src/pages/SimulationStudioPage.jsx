import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { soundService } from '../services/soundService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  CloudRain, 
  Droplets, 
  Waves, 
  Mountain, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  Info,
  MapPin,
  Activity,
  Radio,
  Flame,
  CheckCircle2,
  Sliders,
  Compass,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';

// 5 Regional Disaster Scenarios Catalog
const REGIONAL_SCENARIOS = [
  {
    id: 'himalayan_cloudburst',
    name: 'Himalayan Cloudburst',
    location: 'Chamoli, Uttarakhand',
    hazardType: 'Flash Flood + Landslide',
    icon: '🌊',
    stages: [
      {
        stage: 1,
        title: 'NORMAL',
        rainfall_mm_hr: 5,
        soil_moisture_pct: 42,
        river_level_pct: 35,
        slope_stability_pct: 85,
        flash_flood_risk: 18,
        flash_flood_level: 'LOW',
        landslide_risk: 14,
        landslide_level: 'LOW',
        lead_time: '3.5 Hours',
        lead_time_desc: 'Standard operational monitoring window. No immediate threat detected.',
        what_is_happening: 'Normal mountain weather baseline. River channels running clear.',
        explanation: 'Rainfall is minimal (5 mm/hr). Soil infiltration capacity is high. Slope shear resistance is well above stability threshold.',
        action_required: false
      },
      {
        stage: 2,
        title: 'HEAVY RAIN',
        rainfall_mm_hr: 35,
        soil_moisture_pct: 65,
        river_level_pct: 52,
        slope_stability_pct: 70,
        flash_flood_risk: 45,
        flash_flood_level: 'MODERATE',
        landslide_risk: 38,
        landslide_level: 'MODERATE',
        lead_time: '2.0 Hours',
        lead_time_desc: 'Early advisory window. Localized surface runoff commencing.',
        what_is_happening: 'Intense rain band arrives over the mountain catchment area.',
        explanation: 'Rainfall rate increases to 35 mm/hr → soil infiltration begins saturating top layers → river levels begin rising.',
        action_required: false
      },
      {
        stage: 3,
        title: 'RISK INCREASING',
        rainfall_mm_hr: 68,
        soil_moisture_pct: 78,
        river_level_pct: 72,
        slope_stability_pct: 55,
        flash_flood_risk: 68,
        flash_flood_level: 'HIGH',
        landslide_risk: 62,
        landslide_level: 'HIGH',
        lead_time: '75 Minutes',
        lead_time_desc: 'Critical preparedness lead time before high water levels reach valley settlements.',
        what_is_happening: 'Sustained downpour exceeds drainage capacity. River surging rapidly.',
        explanation: 'Heavy sustained precipitation (68 mm/hr) → soil moisture reaches 78% → river level rises to 72% → slope shear stress builds.',
        action_required: true,
        action_text: 'Issue Stage 2 Advisory: Alert rescue teams, prepare shelters, advise high-ground movement.'
      },
      {
        stage: 4,
        title: 'HIGH RISK',
        rainfall_mm_hr: 110,
        soil_moisture_pct: 88,
        river_level_pct: 86,
        slope_stability_pct: 40,
        flash_flood_risk: 82,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 76,
        landslide_level: 'HIGH',
        lead_time: '54 Minutes',
        lead_time_desc: 'Time available for evacuation and preparedness before critical breach conditions occur.',
        what_is_happening: 'Cloudburst conditions detected. Flash flood surge imminent along Alaknanda channel.',
        explanation: 'Torrential rainfall (110 mm/hr) → soil saturation hits 88% → river approaches 86% danger mark → slope stability drops to 40% (high risk).',
        action_required: true,
        action_text: 'IMMEDIATE ACTION: Evacuate low-lying riverbanks and unstable hillsides.'
      },
      {
        stage: 5,
        title: 'WARNING & ACTION',
        rainfall_mm_hr: 135,
        soil_moisture_pct: 92,
        river_level_pct: 94,
        slope_stability_pct: 28,
        flash_flood_risk: 94,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 91,
        landslide_level: 'CRITICAL',
        lead_time: '32 Minutes',
        lead_time_desc: 'Urgent emergency response window. Complete evacuation to designated safe zones immediately.',
        what_is_happening: 'Severe cloudburst & river overflow. Active mudslide and flash surge underway.',
        explanation: 'Extreme deluge (135 mm/hr) → soil saturation exceeds 92% → river breaches 94% capacity → rotational slope failure imminent.',
        action_required: true,
        action_text: 'RED ALERT: EVACUATE LOW-LYING AND UNSTABLE AREAS IMMEDIATELY.'
      }
    ]
  },
  {
    id: 'western_ghats_landslide',
    name: 'Western Ghats Landslide',
    location: 'Wayanad (Meppadi), Kerala',
    hazardType: 'Landslide Debris Flow',
    icon: '⛰️',
    stages: [
      {
        stage: 1,
        title: 'NORMAL',
        rainfall_mm_hr: 4,
        soil_moisture_pct: 48,
        river_level_pct: 30,
        slope_stability_pct: 88,
        flash_flood_risk: 12,
        flash_flood_level: 'LOW',
        landslide_risk: 16,
        landslide_level: 'LOW',
        lead_time: '4.0 Hours',
        lead_time_desc: 'Stable terrain conditions on plantation hillsides.',
        what_is_happening: 'Nominal monsoon drizzle. Plantation soil drainage operating normally.',
        explanation: 'Baseline conditions. Plantation soil pore pressure is stable and slopes are secure.',
        action_required: false
      },
      {
        stage: 2,
        title: 'HEAVY RAIN',
        rainfall_mm_hr: 42,
        soil_moisture_pct: 72,
        river_level_pct: 45,
        slope_stability_pct: 68,
        flash_flood_risk: 35,
        flash_flood_level: 'MODERATE',
        landslide_risk: 48,
        landslide_level: 'MODERATE',
        lead_time: '2.5 Hours',
        lead_time_desc: 'Monsoon intensification advisory.',
        what_is_happening: 'Heavy orographic rainfall over Western Ghats ridge.',
        explanation: 'Continuous heavy rainfall (42 mm/hr) begins saturating deep weathered laterite layers.',
        action_required: false
      },
      {
        stage: 3,
        title: 'RISK INCREASING',
        rainfall_mm_hr: 75,
        soil_moisture_pct: 84,
        river_level_pct: 64,
        slope_stability_pct: 48,
        flash_flood_risk: 58,
        flash_flood_level: 'HIGH',
        landslide_risk: 72,
        landslide_level: 'HIGH',
        lead_time: '90 Minutes',
        lead_time_desc: 'Geotechnical alert window for tea estate communities.',
        what_is_happening: 'Pore-water pressure spikes in steep slope cuts.',
        explanation: 'Sustained high precipitation (75 mm/hr) → soil saturation at 84% creates hydrostatic pressure behind slope faces.',
        action_required: true,
        action_text: 'Advise residents in Chooralmala / Meppadi slopes to prepare for high-ground movement.'
      },
      {
        stage: 4,
        title: 'HIGH RISK',
        rainfall_mm_hr: 115,
        soil_moisture_pct: 91,
        river_level_pct: 80,
        slope_stability_pct: 34,
        flash_flood_risk: 74,
        flash_flood_level: 'HIGH',
        landslide_risk: 86,
        landslide_level: 'CRITICAL',
        lead_time: '48 Minutes',
        lead_time_desc: 'Immediate evacuation window before catastrophic slope shearing.',
        what_is_happening: 'High risk of massive debris flow and mudslide escalation.',
        explanation: 'Torrential downpour (115 mm/hr) → soil saturation 91% → slope stability drops to 34% (liquefaction risk).',
        action_required: true,
        action_text: 'IMMEDIATE ACTION: Move to Kalpetta Municipal Center or designated hill shelters.'
      },
      {
        stage: 5,
        title: 'WARNING & ACTION',
        rainfall_mm_hr: 140,
        soil_moisture_pct: 95,
        river_level_pct: 89,
        slope_stability_pct: 22,
        flash_flood_risk: 86,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 96,
        landslide_level: 'CRITICAL',
        lead_time: '25 Minutes',
        lead_time_desc: 'Critical emergency evacuation state.',
        what_is_happening: 'Severe debris avalanche risk across steep tea estate slopes.',
        explanation: 'Extreme saturation (95%) induces hydrostatic soil collapse. Immediate life-safety action mandated.',
        action_required: true,
        action_text: 'RED ALERT: EVACUATE STEEP SLOPES AND ESTABLISHED DEBRIS CHANNELS.'
      }
    ]
  },
  {
    id: 'meghalaya_deluge',
    name: 'Meghalaya Deluge',
    location: 'Cherrapunji, Meghalaya',
    hazardType: 'Flash Flood Torrent',
    icon: '🌧️',
    stages: [
      {
        stage: 1,
        title: 'NORMAL',
        rainfall_mm_hr: 15,
        soil_moisture_pct: 55,
        river_level_pct: 40,
        slope_stability_pct: 80,
        flash_flood_risk: 22,
        flash_flood_level: 'LOW',
        landslide_risk: 20,
        landslide_level: 'LOW',
        lead_time: '3.0 Hours',
        lead_time_desc: 'Normal Khasi Hills precipitation regime.',
        what_is_happening: 'Typical high-altitude rainfall draining into canyon networks.',
        explanation: 'Canyons are handling steady runoff volume without surcharge.',
        action_required: false
      },
      {
        stage: 2,
        title: 'HEAVY RAIN',
        rainfall_mm_hr: 55,
        soil_moisture_pct: 70,
        river_level_pct: 58,
        slope_stability_pct: 68,
        flash_flood_risk: 50,
        flash_flood_level: 'MODERATE',
        landslide_risk: 42,
        landslide_level: 'MODERATE',
        lead_time: '2.0 Hours',
        lead_time_desc: 'Canyon gorge monitoring advisory.',
        what_is_happening: 'Intensifying monsoon front over the southern Meghalaya plateau.',
        explanation: 'Rainfall accelerates to 55 mm/hr → runoff rapidly concentrates in steep gorges.',
        action_required: false
      },
      {
        stage: 3,
        title: 'RISK INCREASING',
        rainfall_mm_hr: 95,
        soil_moisture_pct: 82,
        river_level_pct: 75,
        slope_stability_pct: 52,
        flash_flood_risk: 75,
        flash_flood_level: 'HIGH',
        landslide_risk: 58,
        landslide_level: 'HIGH',
        lead_time: '65 Minutes',
        lead_time_desc: 'High runoff velocity warning for canyon crossings.',
        what_is_happening: 'Plateau sheetflow cascades into low-lying stream beds.',
        explanation: 'Precipitation reaches 95 mm/hr → runoff coefficient hits 0.88 → gorge water levels climb fast.',
        action_required: true,
        action_text: 'Close low-water bridges and canyon trails; alert downstream valley settlements.'
      },
      {
        stage: 4,
        title: 'HIGH RISK',
        rainfall_mm_hr: 150,
        soil_moisture_pct: 90,
        river_level_pct: 88,
        slope_stability_pct: 38,
        flash_flood_risk: 89,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 70,
        landslide_level: 'HIGH',
        lead_time: '40 Minutes',
        lead_time_desc: 'Torrential canyon surge lead time.',
        what_is_happening: 'Extreme rainfall deluge overwhelms plateau drainage channels.',
        explanation: 'Torrential rainfall (150 mm/hr) generates massive hydraulic surge through rocky gorges.',
        action_required: true,
        action_text: 'IMMEDIATE ACTION: Move to reinforced concrete shelters on high plateau ground.'
      },
      {
        stage: 5,
        title: 'WARNING & ACTION',
        rainfall_mm_hr: 190,
        soil_moisture_pct: 96,
        river_level_pct: 96,
        slope_stability_pct: 25,
        flash_flood_risk: 98,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 85,
        landslide_level: 'CRITICAL',
        lead_time: '20 Minutes',
        lead_time_desc: 'Emergency flash flood surge window.',
        what_is_happening: 'Record-level flash deluge with high hydraulic destruction potential.',
        explanation: 'Extreme rain volume creates deep flash surge. Complete all movement to high ground immediately.',
        action_required: true,
        action_text: 'RED ALERT: EVACUATE CANYON FLOORS AND ROADSIDE STREAMWAYS.'
      }
    ]
  },
  {
    id: 'brahmaputra_inundation',
    name: 'Brahmaputra / Kosi Inundation',
    location: 'Assam / Bihar Floodplain',
    hazardType: 'Riverine Inundation',
    icon: '🌊',
    stages: [
      {
        stage: 1,
        title: 'NORMAL',
        rainfall_mm_hr: 3,
        soil_moisture_pct: 50,
        river_level_pct: 42,
        slope_stability_pct: 90,
        flash_flood_risk: 15,
        flash_flood_level: 'LOW',
        landslide_risk: 10,
        landslide_level: 'LOW',
        lead_time: '6.0 Hours',
        lead_time_desc: 'Normal embankment discharge baseline.',
        what_is_happening: 'River channel running within designed embankments.',
        explanation: 'River stage is below warning mark. Embankments are structurally sound.',
        action_required: false
      },
      {
        stage: 2,
        title: 'HEAVY RAIN',
        rainfall_mm_hr: 28,
        soil_moisture_pct: 68,
        river_level_pct: 60,
        slope_stability_pct: 82,
        flash_flood_risk: 40,
        flash_flood_level: 'MODERATE',
        landslide_risk: 18,
        landslide_level: 'LOW',
        lead_time: '4.0 Hours',
        lead_time_desc: 'Embankment seepage surveillance advisory.',
        what_is_happening: 'Upstream catchment inflows swelling the main river channel.',
        explanation: 'Upstream rainfall enters river network → channel capacity reaches 60% mark.',
        action_required: false
      },
      {
        stage: 3,
        title: 'RISK INCREASING',
        rainfall_mm_hr: 55,
        soil_moisture_pct: 82,
        river_level_pct: 78,
        slope_stability_pct: 70,
        flash_flood_risk: 65,
        flash_flood_level: 'HIGH',
        landslide_risk: 28,
        landslide_level: 'LOW',
        lead_time: '2.5 Hours',
        lead_time_desc: 'Agricultural floodplain evacuation lead time.',
        what_is_happening: 'River water reaches danger level at multiple gauging stations.',
        explanation: 'Heavy tributary discharge pushes main river to 78% capacity → sandbar villages at risk.',
        action_required: true,
        action_text: 'Activate relief boats; move livestock and elderly to high-ground flood shelters.'
      },
      {
        stage: 4,
        title: 'HIGH RISK',
        rainfall_mm_hr: 85,
        soil_moisture_pct: 92,
        river_level_pct: 90,
        slope_stability_pct: 55,
        flash_flood_risk: 84,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 35,
        landslide_level: 'MODERATE',
        lead_time: '75 Minutes',
        lead_time_desc: 'Embankment breach preparedness window.',
        what_is_happening: 'River channel exceeds 90% capacity; high embankment erosion detected.',
        explanation: 'Extreme river discharge threatens embankment integrity. High inundation risk across low-lying wards.',
        action_required: true,
        action_text: 'IMMEDIATE ACTION: Evacuate riverside wards to designated multi-purpose flood shelters.'
      },
      {
        stage: 5,
        title: 'WARNING & ACTION',
        rainfall_mm_hr: 110,
        soil_moisture_pct: 97,
        river_level_pct: 98,
        slope_stability_pct: 42,
        flash_flood_risk: 95,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 45,
        landslide_level: 'MODERATE',
        lead_time: '45 Minutes',
        lead_time_desc: 'Emergency floodplain evacuation alert.',
        what_is_happening: 'Embankment overtopping in low sectors. Wide inundation underway.',
        explanation: 'River breaches flood mark (98%). Rapid inundation of low-lying agricultural corridors.',
        action_required: true,
        action_text: 'RED ALERT: MOVE TO HIGHEST AVAILABLE FLOOD PLATFORMS & RELIEF CAMPS.'
      }
    ]
  },
  {
    id: 'sikkim_teesta_glof',
    name: 'Sikkim Teesta GLOF',
    location: 'Chungthang / Teesta Valley, Sikkim',
    hazardType: 'Glacial Lake Outburst Flood',
    icon: '❄️',
    stages: [
      {
        stage: 1,
        title: 'NORMAL',
        rainfall_mm_hr: 6,
        soil_moisture_pct: 45,
        river_level_pct: 38,
        slope_stability_pct: 82,
        flash_flood_risk: 20,
        flash_flood_level: 'LOW',
        landslide_risk: 18,
        landslide_level: 'LOW',
        lead_time: '3.0 Hours',
        lead_time_desc: 'High-altitude moraine lake telemetry stable.',
        what_is_happening: 'Glacial meltwater discharge within normal diurnal rhythm.',
        explanation: 'Glacial moraine dam is stable; Teesta river flow is nominal.',
        action_required: false
      },
      {
        stage: 2,
        title: 'HEAVY RAIN',
        rainfall_mm_hr: 45,
        soil_moisture_pct: 68,
        river_level_pct: 56,
        slope_stability_pct: 66,
        flash_flood_risk: 48,
        flash_flood_level: 'MODERATE',
        landslide_risk: 42,
        landslide_level: 'MODERATE',
        lead_time: '2.0 Hours',
        lead_time_desc: 'High-altitude weather alert.',
        what_is_happening: 'Intense cloudburst over South Lhonak lake catchment.',
        explanation: 'Torrential rainfall over glacial lake raises water level against moraine wall.',
        action_required: false
      },
      {
        stage: 3,
        title: 'RISK INCREASING',
        rainfall_mm_hr: 82,
        soil_moisture_pct: 80,
        river_level_pct: 76,
        slope_stability_pct: 50,
        flash_flood_risk: 72,
        flash_flood_level: 'HIGH',
        landslide_risk: 65,
        landslide_level: 'HIGH',
        lead_time: '60 Minutes',
        lead_time_desc: 'Downstream Teesta valley lead time before hydro-surge arrival.',
        what_is_happening: 'Moraine breach detected. High-velocity hydro-surge traveling down Teesta.',
        explanation: 'Glacial lake breach discharges high-velocity surge into Chungthang river gorge.',
        action_required: true,
        action_text: 'Sound emergency sirens across downstream Teesta bridges and hydro-power townships.'
      },
      {
        stage: 4,
        title: 'HIGH RISK',
        rainfall_mm_hr: 120,
        soil_moisture_pct: 89,
        river_level_pct: 91,
        slope_stability_pct: 36,
        flash_flood_risk: 88,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 80,
        landslide_level: 'HIGH',
        lead_time: '35 Minutes',
        lead_time_desc: 'Hydro-surge transit lead time for Chungthang & Mangan.',
        what_is_happening: 'Catastrophic surge wave approaching river settlements.',
        explanation: 'Peak glacial flood wave (91% river surge) compounded by heavy rain undermines gorge slopes.',
        action_required: true,
        action_text: 'IMMEDIATE ACTION: Evacuate Teesta riverbed and lowest river terrace houses.'
      },
      {
        stage: 5,
        title: 'WARNING & ACTION',
        rainfall_mm_hr: 145,
        soil_moisture_pct: 94,
        river_level_pct: 98,
        slope_stability_pct: 24,
        flash_flood_risk: 97,
        flash_flood_level: 'CRITICAL',
        landslide_risk: 93,
        landslide_level: 'CRITICAL',
        lead_time: '18 Minutes',
        lead_time_desc: 'Immediate life-safety refuge state on high mountain spurs.',
        what_is_happening: 'Massive GLOF surge wave engulfs low terraces and bridges.',
        explanation: 'Extreme glacial flood surge (98% river level) triggers compound bank landslides.',
        action_required: true,
        action_text: 'RED ALERT: EVACUATE TO DESIGNATED HIGH-ALTITUDE MOUNTAIN HAVENS.'
      }
    ]
  }
];

export default function SimulationStudioPage() {
  const { setActivePage, safeLocations } = useApp();

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // 0 to 4 (Stages 1 to 5)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isTestingSiren, setIsTestingSiren] = useState(false);

  const activeScenario = REGIONAL_SCENARIOS[selectedScenarioIndex];
  const activeStageData = activeScenario.stages[currentStageIndex];

  // Auto-advance through 5 stages when Simulation is running (~3 seconds per stage)
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < 4) {
            return prev + 1;
          } else {
            setIsPlaying(false); // Stop at stage 5
            return 4;
          }
        });
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Stage-based Audio Alerts (Web Audio Dual-Tone Siren & Chimes)
  useEffect(() => {
    if (!isAudioEnabled) {
      soundService.stopEmergencySiren();
      return;
    }

    if (currentStageIndex === 0) {
      // Stage 1: Normal -> Silent
      soundService.stopEmergencySiren();
    } else if (currentStageIndex === 1 || currentStageIndex === 2) {
      // Stage 2 & 3: Heavy Rain & Risk Increasing -> Warning Chime
      soundService.stopEmergencySiren();
      soundService.playWarningChime();
    } else if (currentStageIndex === 3 || currentStageIndex === 4) {
      // Stage 4 & 5: High Risk & Warning & Action -> Emergency Alert Siren
      soundService.playEmergencySiren(true);
    }

    return () => {
      // Cleanup on unmount or stage change
      if (currentStageIndex < 3) {
        soundService.stopEmergencySiren();
      }
    };
  }, [currentStageIndex, isAudioEnabled]);

  // Stop siren on unmount
  useEffect(() => {
    return () => {
      soundService.stopEmergencySiren();
    };
  }, []);

  const handleStartSimulation = () => {
    soundService.initContext();
    if (currentStageIndex >= 4) {
      setCurrentStageIndex(0); // Restart from Stage 1 if at end
      soundService.stopEmergencySiren();
    }
    setIsPlaying(true);
  };

  const handlePauseSimulation = () => {
    setIsPlaying(false);
    soundService.stopEmergencySiren();
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    soundService.stopEmergencySiren();
    setIsTestingSiren(false);
  };

  const handleSelectScenario = (idx) => {
    setSelectedScenarioIndex(idx);
    setCurrentStageIndex(0);
    setIsPlaying(false);
    soundService.stopEmergencySiren();
    setIsTestingSiren(false);
  };

  const toggleAudio = () => {
    soundService.initContext();
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    if (!next) {
      soundService.stopEmergencySiren();
    } else if (currentStageIndex >= 3) {
      soundService.playEmergencySiren(true);
    }
  };

  const handleTestSiren = () => {
    soundService.initContext();
    if (isTestingSiren) {
      soundService.stopEmergencySiren();
      setIsTestingSiren(false);
    } else {
      setIsTestingSiren(true);
      soundService.playEmergencySiren(true);
      setTimeout(() => {
        if (currentStageIndex < 3) {
          soundService.stopEmergencySiren();
          setIsTestingSiren(false);
        }
      }, 4000);
    }
  };

  // Safe haven nearest distance (real or scenario benchmark)
  const nearestDistance = '2.4 km';
  const nearestHavenName = safeLocations && safeLocations.length > 0 
    ? safeLocations[0].name 
    : 'Gopeshwar High-Ground Relief Haven';

  // Helper for stage styling
  const getStageColor = (stageNum) => {
    switch (stageNum) {
      case 1: return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', badge: 'bg-emerald-950 text-emerald-300' };
      case 2: return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', badge: 'bg-yellow-950 text-yellow-300' };
      case 3: return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', badge: 'bg-orange-950 text-orange-300' };
      case 4: return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', badge: 'bg-red-950 text-red-300' };
      case 5: return { text: 'text-red-500', bg: 'bg-red-600/30', border: 'border-red-500', badge: 'bg-red-600 text-white animate-pulse' };
      default: return { text: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', badge: 'bg-slate-800 text-slate-300' };
    }
  };

  const isFinalStage = currentStageIndex === 4;
  const isCriticalOrHigh = currentStageIndex >= 3;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ===================================================================== */}
      {/* 1. TOP DEMO BANNER & HEADER                                           */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        {/* Prominent Demo Indicator */}
        <div className="bg-amber-950/80 border-2 border-amber-500/60 rounded-xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>SIMULATION MODE — DEMO DATA</span>
          </div>
          <span className="text-[11px] text-amber-200/90 font-mono">
            Interactive 10-Second Disaster Progression & Early Warning Walkthrough
          </span>
        </div>

        {/* Main Header Box */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Disaster Scenario Simulator</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                See how PralayWatch detects a developing disaster, predicts risk, provides lead time, and triggers an early warning.
              </p>
              
              {/* Scenario & Location Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-500/40 font-bold flex items-center gap-1.5">
                  <span>{activeScenario.icon}</span>
                  <span>Scenario: {activeScenario.name}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Location: {activeScenario.location}</span>
                </span>
              </div>
            </div>

            {/* Playback & Audio Controls */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Audio Siren Toggle Button */}
              <button
                onClick={toggleAudio}
                className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isAudioEnabled 
                    ? 'bg-blue-950/80 border-cyan-500 text-cyan-300 hover:bg-blue-900' 
                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Emergency Alert Siren Audio"
              >
                {isAudioEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Siren Audio: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span>Siren Audio: MUTED</span>
                  </>
                )}
              </button>

              {/* Siren Test Button */}
              <button
                onClick={handleTestSiren}
                className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isTestingSiren
                    ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-600/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Test synthesized emergency warning dual-tone siren"
              >
                <BellRing className={`w-3.5 h-3.5 ${isTestingSiren ? 'animate-bounce text-white' : 'text-amber-400'}`} />
                <span>{isTestingSiren ? 'Playing Siren...' : 'Test Siren'}</span>
              </button>

              {!isPlaying ? (
                <button
                  onClick={handleStartSimulation}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold font-mono text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentStageIndex === 4 ? 'Replay Simulation' : 'Start Simulation'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseSimulation}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold font-mono text-xs sm:text-sm shadow-xl shadow-amber-600/30 flex items-center gap-2 transition-all"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleResetSimulation}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold font-mono text-xs sm:text-sm border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Reset to Stage 1 (Normal)"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SIMPLE 5-STAGE DISASTER PROGRESSION TIMELINE                       */}
      {/* ===================================================================== */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Disaster Progression Timeline (5 Stages)</span>
          </span>
          {isPlaying && (
            <span className="text-xs font-mono font-bold text-cyan-400 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>Simulating progression...</span>
            </span>
          )}
        </div>

        {/* 5 Stage Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
          {activeScenario.stages.map((stg, idx) => {
            const isCurrent = currentStageIndex === idx;
            const isPassed = currentStageIndex > idx;
            const colors = getStageColor(stg.stage);

            return (
              <button
                key={stg.stage}
                onClick={() => {
                  setCurrentStageIndex(idx);
                  setIsPlaying(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isCurrent
                    ? `${colors.bg} ${colors.border} ring-2 ring-cyan-400/50 shadow-lg`
                    : isPassed
                    ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 hover:opacity-90'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl" />
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${colors.badge}`}>
                    STAGE {stg.stage}
                  </span>
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className={`text-xs font-black tracking-tight ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                  {stg.stage === 1 && '🟢 NORMAL'}
                  {stg.stage === 2 && '🟡 HEAVY RAIN'}
                  {stg.stage === 3 && '🟠 RISK INCREASING'}
                  {stg.stage === 4 && '🔴 HIGH RISK'}
                  {stg.stage === 5 && '🚨 WARNING & ACTION'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  Rain: {stg.rainfall_mm_hr} mm/h
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PROMINENT LEAD TIME BANNER (Visual Centerpiece)                     */}
      {/* ===================================================================== */}
      <div className={`rounded-2xl border-2 p-5 sm:p-6 shadow-2xl transition-all ${
        isFinalStage
          ? 'bg-gradient-to-r from-red-950 via-[#1f1115] to-red-950 border-red-500 shadow-red-950/50'
          : isCriticalOrHigh
          ? 'bg-gradient-to-r from-orange-950 via-[#1f1711] to-orange-950 border-orange-500/80 shadow-orange-950/40'
          : 'bg-gradient-to-r from-blue-950/90 via-[#0F172A] to-slate-900 border-blue-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>ESTIMATED LEAD TIME</span>
            </span>
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
              {activeStageData.lead_time}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {activeStageData.lead_time_desc}
            </p>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-slate-700/60 font-mono text-xs space-y-1.5 shrink-0 max-w-xs">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Why Lead Time Matters:</div>
            <div className="text-slate-200 text-[11px] leading-relaxed">
              PralayWatch uses upstream soil pore saturation & rainfall rates to issue warnings <strong className="text-cyan-300">before</strong> river crests reach settlements.
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MAIN TELEMETRY & RISK GRID                                         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 4 Live Conditions Parameters (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0B1120] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                LIVE CONDITIONS PANEL
              </h3>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
              SIMULATED DEMO DATA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Condition 1: Rainfall */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>🌧️ Rainfall</span>
                </span>
                <span className="text-blue-300 font-bold">Rate</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {activeStageData.rainfall_mm_hr} <span className="text-xs font-normal text-slate-400">mm/hr</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (activeStageData.rainfall_mm_hr / 150) * 100)}%` }}
                />
              </div>
            </div>

            {/* Condition 2: Soil Moisture */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>🌱 Soil Moisture</span>
                </span>
                <span className="text-cyan-300 font-bold">Saturation</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {activeStageData.soil_moisture_pct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeStageData.soil_moisture_pct}%` }}
                />
              </div>
            </div>

            {/* Condition 3: River Level */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-blue-400" />
                  <span>🌊 River Level</span>
                </span>
                <span className="text-blue-300 font-bold">Capacity</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {activeStageData.river_level_pct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeStageData.river_level_pct >= 85 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${activeStageData.river_level_pct}%` }}
                />
              </div>
            </div>

            {/* Condition 4: Slope Stability */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  <span>⛰️ Slope Stability</span>
                </span>
                <span className="text-amber-300 font-bold">Equilibrium</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {activeStageData.slope_stability_pct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeStageData.slope_stability_pct <= 40 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${activeStageData.slope_stability_pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Causal Explanation Box ("Why is the risk increasing?") */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why is the risk changing?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeStageData.explanation}
            </p>
          </div>
        </div>

        {/* Right: Risk Assessment Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Two Large Risk Assessment Cards */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            {/* Flash Flood Risk Card */}
            <div className={`p-4 rounded-2xl border-2 shadow-xl space-y-2 flex flex-col justify-between ${
              activeStageData.flash_flood_level === 'CRITICAL'
                ? 'bg-red-950/60 border-red-500 text-red-200'
                : activeStageData.flash_flood_level === 'HIGH'
                ? 'bg-orange-950/50 border-orange-500 text-orange-200'
                : activeStageData.flash_flood_level === 'MODERATE'
                ? 'bg-yellow-950/40 border-yellow-500/60 text-yellow-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">🌊 FLASH FLOOD RISK</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  activeStageData.flash_flood_level === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-white'
                }`}>
                  {activeStageData.flash_flood_level}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {activeStageData.flash_flood_risk}%
              </div>
              <div className="text-[10px] text-slate-400">
                Hydrological Inundation Model
              </div>
            </div>

            {/* Landslide Risk Card */}
            <div className={`p-4 rounded-2xl border-2 shadow-xl space-y-2 flex flex-col justify-between ${
              activeStageData.landslide_level === 'CRITICAL'
                ? 'bg-red-950/60 border-red-500 text-red-200'
                : activeStageData.landslide_level === 'HIGH'
                ? 'bg-orange-950/50 border-orange-500 text-orange-200'
                : activeStageData.landslide_level === 'MODERATE'
                ? 'bg-yellow-950/40 border-yellow-500/60 text-yellow-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">⛰️ LANDSLIDE RISK</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  activeStageData.landslide_level === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-white'
                }`}>
                  {activeStageData.landslide_level}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {activeStageData.landslide_risk}%
              </div>
              <div className="text-[10px] text-slate-400">
                Geotechnical Shear Model
              </div>
            </div>
          </div>

          {/* Action Directives Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-2xl space-y-3 ${
            isCriticalOrHigh
              ? 'bg-red-950/70 border-red-500 shadow-red-950/40'
              : 'bg-slate-900/90 border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${isCriticalOrHigh ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
                <h4 className="text-sm font-black text-white uppercase font-mono">
                  {isCriticalOrHigh ? '🚨 HIGH ALERT DIRECTIVE' : 'STATUS: NORMAL WATCH'}
                </h4>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                isCriticalOrHigh ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isCriticalOrHigh ? 'ACTION REQUIRED' : 'STANDBY'}
              </span>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Recommended Action:</div>
              <div className="font-bold text-white text-sm leading-snug">
                {activeStageData.action_required 
                  ? activeStageData.action_text 
                  : 'Maintain standard routine monitoring. No protective action required.'}
              </div>
            </div>

            {/* Nearest Safe Haven & Safe Route Link */}
            <div className="flex items-center justify-between pt-1 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Nearest Safe Zone:</span>
                  <strong className="text-emerald-400">{nearestDistance} ({nearestHavenName})</strong>
                </div>
              </div>

              <button
                onClick={() => setActivePage('safe-locations')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all text-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>View Safe Route</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. FINAL SIMULATION SUMMARY CARD (At Stage 5 or Completion)           */}
      {/* ===================================================================== */}
      {isFinalStage && (
        <div className="bg-gradient-to-r from-red-950 via-[#231215] to-red-950 border-2 border-red-500 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-red-500/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-lg animate-ping">
                🚨
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  DISASTER RISK DETECTED — FINAL STATE SUMMARY
                </h3>
                <span className="text-xs text-red-300 font-mono">
                  Location: {activeScenario.location}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-mono font-black uppercase animate-pulse">
              RED WARNING ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-black/50 border border-red-500/40 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase">Flash Flood Risk</span>
              <div className="text-lg font-black text-red-400">82% HIGH</div>
            </div>

            <div className="p-3 bg-black/50 border border-red-500/40 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase">Landslide Risk</span>
              <div className="text-lg font-black text-red-400">76% HIGH</div>
            </div>

            <div className="p-3 bg-black/50 border border-red-500/40 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase">Lead Time Provided</span>
              <div className="text-lg font-black text-cyan-300">54 MINUTES</div>
            </div>

            <div className="p-3 bg-black/50 border border-red-500/40 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase">Action Mandate</span>
              <div className="text-xs font-bold text-white uppercase mt-1">EVACUATE LOW-LYING & UNSTABLE AREAS</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setActivePage('safe-locations')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/40 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>View Evacuation Safe Route</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. REGIONAL SCENARIO SELECTOR ("Try Different Disaster Scenarios")    */}
      {/* ===================================================================== */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Try Different Disaster Scenarios</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            5 Benchmark Geo-Climatic Hotspots
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
          {REGIONAL_SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;

            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-blue-950/90 border-cyan-400 text-white ring-2 ring-cyan-400/40 shadow-xl'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{sc.icon}</span>
                  {isSelected && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500 text-slate-950">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div>
                  <strong className="text-xs text-white block leading-snug">{sc.name}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{sc.location}</span>
                </div>

                <div className="text-[9px] text-cyan-400 font-bold uppercase pt-1 border-t border-slate-800">
                  {sc.hazardType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. COLLAPSIBLE TECHNICAL DETAILS SECTION                              */}
      {/* ===================================================================== */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
        <button
          onClick={() => setIsTechOpen(!isTechOpen)}
          className="w-full p-4 flex items-center justify-between text-left text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>⚙️ Technical Details (Hydrological & Geotechnical Formula Telemetry)</span>
          </div>
          {isTechOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTechOpen && (
          <div className="p-4 pt-0 border-t border-slate-800 text-slate-300 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Flash Flood Formula</span>
                <p className="text-[11px] text-slate-300">
                  $$\text{FF} = 0.35 \cdot \text{RainRate} + 0.20 \cdot \text{Accum} + 0.20 \cdot \text{RiverLevel} + 0.15 \cdot \text{Trend} + 0.05 \cdot \text{Elev} + 0.05 \cdot \text{Hist}$$
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Landslide Formula</span>
                <p className="text-[11px] text-slate-300">
                  $$\text{LS} = 0.35 \cdot \text{SoilMoisture} + 0.30 \cdot \text{Slope} + 0.15 \cdot \text{RainRate} + 0.10 \cdot \text{Accum} + 0.05 \cdot \text{Elev} + 0.05 \cdot \text{Hist}$$
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lead Time Estimation</span>
                <p className="text-[11px] text-slate-300">
                  Derived from upstream hydrograph flood wave travel time ($t = d/v$) and soil pore-pressure saturation curve slope.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
