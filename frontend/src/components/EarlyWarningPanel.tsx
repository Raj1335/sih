import React, { useState } from 'react';
import { 
  CloudRain, Wind, Gauge, Droplets, Zap, 
  AlertOctagon, CheckCircle2, BellRing, Sparkles, Flame
} from 'lucide-react';
import { NowcastPrediction, WeatherTelemetry } from '../types';

interface EarlyWarningPanelProps {
  nowcast: NowcastPrediction | null;
  telemetry: WeatherTelemetry | null;
  cityName: string;
}

export const EarlyWarningPanel: React.FC<EarlyWarningPanelProps> = ({
  nowcast,
  telemetry,
  cityName,
}) => {
  const [broadcastSent, setBroadcastSent] = useState(false);

  if (!nowcast || !telemetry) {
    return (
      <div className="glass-card p-4 rounded-xl animate-pulse text-slate-400 text-xs">
        Loading AI Meteorological Nowcast telemetry...
      </div>
    );
  }

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'RED':
        return {
          bg: 'bg-red-950/70 border-red-500/80 text-red-100',
          badge: 'bg-red-600 text-white',
          glow: 'alert-glow-red',
          icon: <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
        };
      case 'ORANGE':
        return {
          bg: 'bg-orange-950/70 border-orange-500/80 text-orange-100',
          badge: 'bg-orange-600 text-white',
          glow: 'alert-glow-orange',
          icon: <AlertOctagon className="w-5 h-5 text-orange-400" />
        };
      case 'YELLOW':
        return {
          bg: 'bg-yellow-950/60 border-yellow-500/70 text-yellow-100',
          badge: 'bg-yellow-600 text-slate-950 font-bold',
          glow: 'alert-glow-yellow',
          icon: <AlertOctagon className="w-5 h-5 text-yellow-400" />
        };
      default:
        return {
          bg: 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100',
          badge: 'bg-emerald-600 text-white',
          glow: 'alert-glow-green',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
    }
  };

  const alertStyle = getAlertStyles(nowcast.alert_level);

  return (
    <div className="flex flex-col gap-3.5">
      {/* IMD Alert Hero Card */}
      <div className={`p-4 rounded-xl border transition-all ${alertStyle.bg} ${alertStyle.glow}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {alertStyle.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${alertStyle.badge}`}>
                  {nowcast.alert_level} ALERT
                </span>
                <span className="text-xs text-slate-300 font-semibold">{cityName}</span>
              </div>
              <h3 className="text-sm font-bold mt-1 text-slate-100 leading-snug">
                {nowcast.alert_title}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-mono block">AI Confidence</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{nowcast.confidence_score}%</span>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-slate-300/90 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
          <span className="font-semibold text-slate-200">Disaster Advisory: </span>
          {nowcast.advisory}
        </p>

        {/* Cloudburst Risk Meter */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Flame className={`w-3.5 h-3.5 ${nowcast.cloudburst_probability_pct > 50 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
            <span>Cloudburst Probability:</span>
            <span className="font-mono font-bold text-white">{nowcast.cloudburst_probability_pct}%</span>
          </div>

          <button
            onClick={handleBroadcast}
            disabled={broadcastSent}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
              broadcastSent
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <BellRing className="w-3 h-3" />
            {broadcastSent ? 'CAP Broadcast Triggered!' : 'Trigger CAP Alert Broadcast'}
          </button>
        </div>
      </div>

      {/* Multi-Horizon Precipitation Forecast Cards */}
      <div className="glass-card p-3.5 rounded-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Precipitation Nowcast Horizons</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Current: {nowcast.current_intensity_mm_h} mm/h</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">t + 1 Hour</span>
            <span className="text-sm font-extrabold text-cyan-400 font-mono">{nowcast.forecast_1h_mm}</span>
            <span className="text-[9px] text-slate-500 block">mm</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">t + 3 Hours</span>
            <span className="text-sm font-extrabold text-sky-400 font-mono">{nowcast.forecast_3h_mm}</span>
            <span className="text-[9px] text-slate-500 block">mm</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">t + 6 Hours</span>
            <span className="text-sm font-extrabold text-blue-400 font-mono">{nowcast.forecast_6h_mm}</span>
            <span className="text-[9px] text-slate-500 block">mm</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">t + 24 Hours</span>
            <span className="text-sm font-extrabold text-indigo-400 font-mono">{nowcast.forecast_24h_mm}</span>
            <span className="text-[9px] text-slate-500 block">mm</span>
          </div>
        </div>
      </div>

      {/* Atmospheric & Doppler Radar Telemetry Grid */}
      <div className="glass-card p-3.5 rounded-xl">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
          Atmospheric Telemetry & Doppler Radar
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
              <span className="font-mono font-bold text-slate-200">{telemetry.relative_humidity_pct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
            <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Barometric Pressure</span>
              <span className="font-mono font-bold text-slate-200">{telemetry.surface_pressure_hpa} hPa</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
            <Zap className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Radar Reflectivity</span>
              <span className="font-mono font-bold text-slate-200">{telemetry.radar_reflectivity_dbz} dBZ</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
            <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
              <span className="font-mono font-bold text-slate-200">{telemetry.wind_speed_kmh} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
