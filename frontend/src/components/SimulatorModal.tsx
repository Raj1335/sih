import React, { useState } from 'react';
import { 
  CloudRain, Sliders, X, Play, RefreshCw, 
  Flame, ShieldAlert, Sparkles, Building2, Droplets
} from 'lucide-react';
import { SimulationRequest } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onRunSimulation: (params: SimulationRequest) => void;
  currentParams: SimulationRequest;
  presetScenarios: Record<string, any>;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onRunSimulation,
  currentParams,
  presetScenarios,
}) => {
  const [params, setParams] = useState<SimulationRequest>(currentParams);

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    const preset = presetScenarios[presetKey];
    if (preset) {
      setParams({
        city_id: preset.city_id,
        rainfall_rate_mm_h: preset.rainfall_rate_mm_h,
        duration_hours: preset.duration_hours,
        drainage_clogging_factor: preset.drainage_clogging_factor,
        soil_saturation_override: preset.soil_saturation_override,
        scenario_preset: presetKey,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunSimulation(params);
    onClose();
  };

  const totalRainfall = Math.round(params.rainfall_rate_mm_h * params.duration_hours);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Cloudburst & Inundation Scenario Simulator
                <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-400 rounded border border-cyan-800 font-mono">
                  SIH Demo Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inject custom rainfall intensities to observe hydrological runoff and road impassability.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              ⚡ Quick Select Real-World Disaster Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(presetScenarios).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    params.scenario_preset === key
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{preset.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      {preset.rainfall_rate_mm_h} mm/h
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-4">
            {/* Slider 1: Rainfall Rate */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  Precipitation Intensity Rate:
                </span>
                <span className="font-mono font-bold text-sm text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {params.rainfall_rate_mm_h} mm/hour
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={params.rainfall_rate_mm_h}
                onChange={(e) =>
                  setParams({ ...params, rainfall_rate_mm_h: parseFloat(e.target.value), scenario_preset: 'custom' })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5 mm/h (Drizzle)</span>
                <span>65 mm/h (Heavy)</span>
                <span>120 mm/h (Very Heavy)</span>
                <span>250 mm/h (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Slider 2: Duration */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Continuous Storm Duration:
                </span>
                <span className="font-mono font-bold text-sm text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {params.duration_hours} Hours
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={params.duration_hours}
                onChange={(e) =>
                  setParams({ ...params, duration_hours: parseFloat(e.target.value), scenario_preset: 'custom' })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Total Rainfall Output Badge */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Accumulated Rainfall Volume:</span>
                <span className="text-base font-extrabold text-cyan-300 font-mono">{totalRainfall} mm</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                totalRainfall > 200 ? 'bg-red-950 text-red-400 border border-red-800' :
                totalRainfall > 100 ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                totalRainfall > 50 ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {totalRainfall > 200 ? 'Extremely Severe Storm' : totalRainfall > 100 ? 'Severe Downpour' : 'Moderate Downpour'}
              </span>
            </div>

            {/* Slider 3: Drainage Clogging */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Drainage Silt Clogging:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {Math.round(params.drainage_clogging_factor * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.85"
                  step="0.05"
                  value={params.drainage_clogging_factor}
                  onChange={(e) =>
                    setParams({ ...params, drainage_clogging_factor: parseFloat(e.target.value) })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Soil Moisture Saturation:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {Math.round((params.soil_saturation_override || 0.8) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.98"
                  step="0.02"
                  value={params.soil_saturation_override || 0.8}
                  onChange={(e) =>
                    setParams({ ...params, soil_saturation_override: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Inundation Simulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
