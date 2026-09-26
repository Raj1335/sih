import React, { useState } from 'react';
import { 
  Navigation, ShieldCheck, AlertTriangle, MapPin, 
  Clock, Route, CheckCircle2, ChevronRight, Compass, ArrowRight
} from 'lucide-react';
import { 
  EvacuationRouteResponse, WardInundationDetail, 
  ReliefCenter, EvacuationRouteRequest 
} from '../types';

interface EvacuationRouterProps {
  selectedCity: string;
  wards: WardInundationDetail[];
  shelters: ReliefCenter[];
  activeRoute: EvacuationRouteResponse | null;
  onCalculateRoute: (req: EvacuationRouteRequest) => void;
  isLoading: boolean;
}

export const EvacuationRouter: React.FC<EvacuationRouterProps> = ({
  selectedCity,
  wards,
  shelters,
  activeRoute,
  onCalculateRoute,
  isLoading,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0]?.ward_id || '');
  const [destinationType, setDestinationType] = useState<'nearest_shelter' | 'specific_shelter'>('nearest_shelter');
  const [selectedShelterId, setSelectedShelterId] = useState<string>(shelters[0]?.id || '');

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ward = wards.find((w) => w.ward_id === selectedWardId) || wards[0];
    if (!ward) return;

    let destLat: number | undefined;
    let destLng: number | undefined;

    if (destinationType === 'specific_shelter') {
      const shelter = shelters.find((s) => s.id === selectedShelterId);
      if (shelter) {
        destLat = shelter.lat;
        destLng = shelter.lng;
      }
    }

    onCalculateRoute({
      city_id: selectedCity,
      start_lat: ward.center_lat,
      start_lng: ward.center_lng,
      destination_lat: destLat,
      destination_lng: destLng,
      destination_type: destinationType,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Route Setup Form */}
      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Dynamic Flood-Aware Router</h3>
              <p className="text-[11px] text-slate-400">
                A* pathfinding avoiding roads with &gt; 35cm waterlogging.
              </p>
            </div>
          </div>

          <form onSubmit={handleRouteSubmit} className="space-y-4">
            {/* Origin Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                Select Evacuation Origin (Stranded Zone):
              </label>
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    {w.ward_name} ({w.risk_level} - {w.inundation_depth_cm}cm depth)
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Target Destination:
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setDestinationType('nearest_shelter')}
                  className={`p-2 rounded-xl text-xs font-medium border transition ${
                    destinationType === 'nearest_shelter'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Nearest Safe Haven
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationType('specific_shelter')}
                  className={`p-2 rounded-xl text-xs font-medium border transition ${
                    destinationType === 'specific_shelter'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Specific Shelter
                </button>
              </div>

              {destinationType === 'specific_shelter' && (
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type} - {s.elevation_m}m AMSL)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Navigation className="w-4 h-4 fill-current" />
              {isLoading ? 'Computing Flood-Aware Route...' : 'Find Safe Evacuation Route'}
            </button>
          </form>
        </div>

        {/* Algorithm Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Routing Algorithm:</span>
          <span className="font-mono text-cyan-400 font-semibold">Dynamic Weighted Dijkstra</span>
        </div>
      </div>

      {/* Route Result & Navigation Overview */}
      <div className="glass-card p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between">
        {activeRoute ? (
          <div className="space-y-4">
            {/* Header Result Card */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              activeRoute.is_safe
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-red-950/40 border-red-500/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  activeRoute.is_safe ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      activeRoute.is_safe ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {activeRoute.is_safe ? 'Passable & Safe Route' : 'Caution: High Clearance Only'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{activeRoute.route_id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    Destination: {activeRoute.destination_info?.name || 'Assigned Relief Center'}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Distance</span>
                  <span className="text-sm font-bold text-cyan-300">{activeRoute.total_distance_km} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Est. Time</span>
                  <span className="text-sm font-bold text-cyan-300">{activeRoute.estimated_travel_time_mins} min</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Avoided Chokepoints</span>
                  <span className="text-sm font-bold text-emerald-400">{activeRoute.avoided_flooded_roads_count} Roads</span>
                </div>
              </div>
            </div>

            {/* Advisory */}
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              <span className="font-semibold text-cyan-300">Navigation Advisory: </span>
              {activeRoute.advisory}
            </p>

            {/* Road Segments Breakdown */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Route Waypoints & Depth Analysis
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeRoute.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </span>
                      <span>Segment {idx + 1} ({seg.distance_km} km)</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">Water Depth: {seg.estimated_water_depth_m}m</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        seg.status === 'CLEAR' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        seg.status === 'CAUTION' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {seg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <Route className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-200">No Active Route Calculated</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select a flooded origin ward and click "Find Safe Evacuation Route" to compute a flood-avoidance path to high ground.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
