import React from 'react';
import { 
  FileText, Award, Shield, Sparkles, Cpu, 
  Layers, CheckCircle, ExternalLink, Zap, Network
} from 'lucide-react';

export const ExecutiveSummary: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Badge */}
      <div className="glass-card p-6 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-cyan-600 text-slate-950 rounded-full text-xs font-black tracking-wide">
                SIH 2026 OFFICIAL SUBMISSION DOSSIER
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded text-xs font-mono">
                Software & AI Edition
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Project Codename: <span className="font-bold text-cyan-400">JalPrahari AI (जल प्रहरी)</span> — Real-Time Meteorological Nowcasting, Topographical Inundation Modeling & Flood-Aware Evacuation Routing.
            </p>
          </div>

          <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-center shrink-0">
            <Award className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-200 block">Jury Readiness</span>
            <span className="text-xs font-mono font-extrabold text-cyan-400">100% Production Ready</span>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Pillars of Innovation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>1. Atmospheric ML Nowcasting Engine</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike static weather forecast APIs that report macroscopic city temperatures, JalPrahari combines Doppler radar reflectivity (Marshall-Palmer relation Z = 200 * R^1.6), Convective Available Potential Energy (CAPE), barometric pressure deficits, and relative humidity to produce localized precipitation forecasts across 1h, 3h, 6h, 24h horizons with automated IMD-standard Color Warnings.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>2. DEM & Hydrological Runoff Modeling</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Implements the USDA Soil Conservation Service Curve Number (SCS-CN) runoff equation combined with Digital Elevation Models (DEM), terrain slopes (degrees), and municipal stormwater drainage coefficients to simulate realistic ward-level water depth accumulation (0.1m - 3.5m) and depression stagnation.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Network className="w-4 h-4" />
            <span>3. Dynamic Flood-Aware Evacuation Router</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrates real-time ward inundation water-depth into a dynamic weighted graph (Dijkstra / A* algorithm). Roads with water depth &gt;= 0.35m are dynamically penalized and tagged impassable, automatically navigating rescue convoys, ambulances, and fleeing citizens around flooded chokepoints directly to high-ground relief centers.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>4. Citizen SOS & Crowdsourced Ground-Truth</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dual-channel crisis response: Citizens trapped in life-threatening water levels can broadcast GPS distress signals with medical emergency flags directly to the Disaster Command Console, while citizens report localized waterlogging photos to validate and refine AI predictions in real-time.
          </p>
        </div>
      </div>

      {/* Mathematical & Algorithmic Formulation */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Mathematical & Hydrological Formulation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
            <span className="text-cyan-400 font-bold block mb-1 font-sans">SCS-CN Surface Runoff:</span>
            <div className="text-slate-300 text-xs">
              Q = (P - Ia)² / (P - Ia + S)<br/>
              where S = (25400 / CN) - 254
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Calculates direct rainfall converted into surface runoff based on soil saturation.</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
            <span className="text-cyan-400 font-bold block mb-1 font-sans">Doppler Radar Reflectivity (Marshall-Palmer):</span>
            <div className="text-slate-300 text-xs">
              Z = 200 · R^1.6<br/>
              dBZ = 10 · log10(Z)
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Empirical relation converting radar backscatter reflectivity into instantaneous rain rate (mm/h).</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">System Implementation Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">AI / ML Engine</span>
            <span className="font-bold text-slate-100">Scikit-Learn, NumPy, Ensemble RF</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Backend API</span>
            <span className="font-bold text-slate-100">FastAPI, Python 3.12, Uvicorn</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Routing & Graph</span>
            <span className="font-bold text-slate-100">NetworkX (Dynamic Dijkstra)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">GIS & Frontend</span>
            <span className="font-bold text-slate-100">React 18, Leaflet, Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
