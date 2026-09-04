import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Smartphone, Bell, CheckCircle2, Shield, Radio, Sun, Moon, Palette, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { locations, subscribeCitizen, selectedLocationId } = useApp();
  const { theme, isDarkMode, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: 'Sunita Sharma',
    phone: '+91 98765 43210',
    location_id: selectedLocationId || 1,
    hazard_preferences: {
      flash_flood: true,
      flood: true,
      landslide: true,
      heavy_rainfall: true
    }
  });

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (key) => {
    setFormData(prev => ({
      ...prev,
      hazard_preferences: {
        ...prev.hazard_preferences,
        [key]: !prev.hazard_preferences[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await subscribeCitizen(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 transition-colors duration-200">
      {/* 1. Theme & Appearance Settings Card */}
      <section className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center gap-3 pb-3 border-b border-[#D7E0E7] dark:border-[#1E2E4A]">
          <div className="p-3 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
              <span>Display Theme & Visual Appearance</span>
            </h2>
            <p className="text-xs text-[#5B6B78] dark:text-slate-400 font-mono">
              Switch between High-Contrast Clean Light Mode and Institutional Deep Midnight Dark Mode.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Option Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between space-y-3 ${
              theme === 'light'
                ? 'border-[#1769AA] bg-[#E8F2F8]/60 shadow-md ring-2 ring-[#1769AA]/20'
                : 'border-[#D7E0E7] dark:border-[#1E2E4A] bg-[#F8FAFC] dark:bg-[#0D162B] hover:border-[#1769AA]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600 border border-amber-300/60">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B3A] dark:text-white">Clean Light Theme</h3>
                  <p className="text-[11px] text-[#5B6B78] dark:text-slate-400">High clarity daytime & field monitoring</p>
                </div>
              </div>
              {theme === 'light' && (
                <CheckCircle2 className="w-5 h-5 text-[#1769AA] shrink-0" />
              )}
            </div>

            {/* Mini Visual Preview */}
            <div className="w-full bg-[#F5F7F9] border border-[#D7E0E7] rounded-lg p-2.5 space-y-1.5 pointer-events-none">
              <div className="h-2.5 w-1/3 bg-[#123047] rounded-sm"></div>
              <div className="h-2 w-full bg-white rounded border border-[#D7E0E7]"></div>
              <div className="h-2 w-4/5 bg-[#1769AA]/20 rounded"></div>
            </div>
          </button>

          {/* Dark Theme Option Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between space-y-3 ${
              theme === 'dark'
                ? 'border-[#1769AA] bg-[#123047]/60 shadow-md ring-2 ring-[#1769AA]/20'
                : 'border-[#D7E0E7] dark:border-[#1E2E4A] bg-[#F8FAFC] dark:bg-[#0D162B] hover:border-[#1769AA]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B3A] dark:text-white">SEOC Dark Theme</h3>
                  <p className="text-[11px] text-[#5B6B78] dark:text-slate-400">Night operation & Command Center displays</p>
                </div>
              </div>
              {theme === 'dark' && (
                <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
              )}
            </div>

            {/* Mini Visual Preview */}
            <div className="w-full bg-[#070F1E] border border-[#1E2E4A] rounded-lg p-2.5 space-y-1.5 pointer-events-none">
              <div className="h-2.5 w-1/3 bg-[#1769AA] rounded-sm"></div>
              <div className="h-2 w-full bg-[#111C35] rounded border border-[#1E2E4A]"></div>
              <div className="h-2 w-4/5 bg-[#1769AA]/40 rounded"></div>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Citizen Subscription Header & Form */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E8F2F8] dark:bg-[#1769AA]/20 text-[#1769AA] dark:text-[#38BDF8] border border-[#1769AA]/30 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
              <span>Citizen Early Warning Subscription & SMS Alerts</span>
            </h2>
            <p className="text-xs text-[#5B6B78] dark:text-slate-400 font-mono">
              Configure hyper-local automated multi-hazard SMS and Push broadcast preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#111C35] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
        {isSaved && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Subscription updated successfully! A prototype SMS verification has been generated.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B3A] dark:text-slate-300 mb-1.5 font-semibold">Citizen / Recipient Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-3 text-sm text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA] font-sans"
              />
            </div>

            <div>
              <label className="block text-[#172B3A] dark:text-slate-300 mb-1.5 font-semibold">Mobile Number for SMS Dispatch</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-3 text-sm text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#172B3A] dark:text-slate-300 mb-1.5 font-semibold">Primary Monitored Sector / Location</label>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: Number(e.target.value) }))}
              className="w-full bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg p-3 text-sm text-[#172B3A] dark:text-white focus:outline-none focus:border-[#1769AA]"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#070F1E] text-[#172B3A] dark:text-white">
                  {loc.name}, {loc.state}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* Hazard Subscription Checkboxes */}
          <div>
            <label className="block text-[#172B3A] dark:text-slate-300 mb-2 font-semibold">
              Hazard Subscription Preferences:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'flash_flood', label: 'Flash Flood & Stream Runoff' },
                { key: 'flood', label: 'Riverine Inundation' },
                { key: 'landslide', label: 'Landslide & Slope Instability' },
                { key: 'heavy_rainfall', label: 'Heavy Rainfall & Cloudbursts' }
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-[#070F1E] border border-[#D7E0E7] dark:border-[#1E2E4A] rounded-lg cursor-pointer hover:border-[#1769AA] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.hazard_preferences[key]}
                    onChange={() => handleCheckboxChange(key)}
                    className="w-4 h-4 rounded text-[#1769AA] bg-white dark:bg-slate-800 border-[#D7E0E7] dark:border-slate-700 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[#172B3A] dark:text-slate-200 font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1769AA] hover:bg-[#125890] text-white rounded-lg font-mono font-bold text-sm uppercase tracking-wider shadow-md transition-all"
          >
            {loading ? 'Saving Preferences...' : 'Save Alert Subscription'}
          </button>
        </form>
      </div>
    </div>
  );
}
