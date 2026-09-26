import React from 'react';
import { 
  BarChart3, AlertOctagon, ShieldAlert, Building2, 
  Users, Waves, ArrowDownRight, Layers, CheckCircle2
} from 'lucide-react';
import { WardInundationDetail, CityInundationResponse } from '../types';

interface AnalyticsPanelProps {
  inundationData: CityInundationResponse | null;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ inundationData }) => {
  if (!inundationData) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center text-slate-400">
        Run an inundation simulation or load city telemetry to view ward analytics.
      </div>
    );
  }

  const { wards, city_name, total_rainfall_injected_mm, high_risk_wards_count, total_critical_assets_threatened } = inundationData;

  const totalAffectedPop = wards.reduce((sum, w) => sum + w.affected_population_est, 0);
  const totalSubmergedArea = wards.reduce((sum, w) => sum + w.submerged_area_sq_km, 0);

  return (
    <div className="space-y-5">
      {/* High-Level Impact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <Waves className="w-4 h-4" />
            <span>Rainfall Injected</span>
          </div>
          <span className="text-xl font-extrabold text-white font-mono">{total_rainfall_injected_mm} mm</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cumulative catchment volume</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>High-Risk Wards</span>
          </div>
          <span className="text-xl font-extrabold text-red-400 font-mono">
            {high_risk_wards_count} / {wards.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Wards with &gt; 0.7m depth</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Exposed Population</span>
          </div>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            {totalAffectedPop.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Estimated residents affected</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Critical Assets at Risk</span>
          </div>
          <span className="text-xl font-extrabold text-indigo-300 font-mono">
            {total_critical_assets_threatened} Assets
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Hospitals, metros, power hubs</span>
        </div>
      </div>

      {/* Ward Details Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Ward-by-Ward Hydrological Inundation Vulnerability Breakdown
            </h3>
            <p className="text-xs text-slate-400">{city_name} Drainage Basin</p>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-800">
            Submerged Area: {totalSubmergedArea.toFixed(1)} km²
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Ward Name</th>
                <th className="p-3">Elevation (DEM)</th>
                <th className="p-3">Drainage Cap.</th>
                <th className="p-3">Water Depth</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Road Status</th>
                <th className="p-3">Critical Assets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {wards.map((w) => (
                <tr key={w.ward_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">
                    {w.ward_name}
                    <span className="text-[10px] text-slate-500 font-mono block">{w.ward_id}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={w.elevation_m < 6.0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {w.elevation_m} m
                    </span>
                    <span className="text-[10px] text-slate-500 block">{w.slope_deg}° slope</span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {w.drainage_capacity_mm_h} mm/h
                  </td>
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-extrabold ${
                        w.inundation_depth_m >= 1.2 ? 'text-red-400' :
                        w.inundation_depth_m >= 0.7 ? 'text-orange-400' :
                        w.inundation_depth_m >= 0.3 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {w.inundation_depth_m} m
                      </span>
                      <span className="text-[10px] text-slate-500">({w.inundation_depth_cm}cm)</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      w.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      w.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      w.risk_level === 'MODERATE' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {w.risk_level}
                    </span>
                  </td>
                  <td className="p-3">
                    {w.roads_impassable ? (
                      <span className="text-red-400 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertOctagon className="w-3.5 h-3.5" /> Impassable (&gt;35cm)
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passable
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {w.critical_infrastructure.map((infra, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                          {infra}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
