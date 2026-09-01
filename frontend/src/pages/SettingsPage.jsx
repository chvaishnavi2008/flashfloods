import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Smartphone, Bell, CheckCircle2, Shield, Radio } from 'lucide-react';

export default function SettingsPage() {
  const { locations, subscribeCitizen, selectedLocationId } = useApp();

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Citizen Early Warning Subscription & SMS Alerts</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Configure hyper-local automated multi-hazard SMS and Push broadcast preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
        {isSaved && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Subscription updated successfully! A prototype SMS verification has been generated.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Citizen / Recipient Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Mobile Number for SMS Dispatch</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">Primary Monitored Sector / Location</label>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: Number(e.target.value) }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}, {loc.state}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* Hazard Subscription Checkboxes */}
          <div>
            <label className="block text-slate-400 mb-2 font-semibold">
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
                  className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.hazard_preferences[key]}
                    onChange={() => handleCheckboxChange(key)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span className="text-slate-200">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono font-bold text-sm uppercase tracking-wider shadow-lg transition-all"
          >
            {loading ? 'Saving Preferences...' : 'Save Alert Subscription'}
          </button>
        </form>
      </div>
    </div>
  );
}
