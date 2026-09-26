import React, { useEffect, useRef, useState } from 'react';
import { 
  MapContainer, TileLayer, Circle, Marker, Popup, 
  Polyline, useMap, LayersControl 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  WardInundationDetail, ReliefCenter, IoTSensor, 
  EvacuationRouteResponse, CitizenSOS 
} from '../types';
import { 
  Layers, Navigation, Shield, AlertTriangle, 
  MapPin, Radio, Building2, Info, LifeBuoy
} from 'lucide-react';

// Fix standard Leaflet default icon issues in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons for Map Markers
const shelterIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const sensorIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-7 h-7 rounded-full bg-cyan-600 border-2 border-cyan-300 shadow-md flex items-center justify-center text-white text-[10px] animate-pulse">📡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const sosIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs animate-bounce">🆘</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapViewProps {
  centerLat: number;
  centerLng: number;
  zoom: number;
  wards: WardInundationDetail[];
  shelters: ReliefCenter[];
  sensors: IoTSensor[];
  sosList: CitizenSOS[];
  activeRoute: EvacuationRouteResponse | null;
  onSelectWardForRouting?: (ward: WardInundationDetail) => void;
}

// Map center synchronizer
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  centerLat,
  centerLng,
  zoom,
  wards,
  shelters,
  sensors,
  sosList,
  activeRoute,
  onSelectWardForRouting
}) => {
  const [showInundation, setShowInundation] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showSOS, setShowSOS] = useState(true);

  const getInundationColor = (depthM: number) => {
    if (depthM >= 1.2) return { fill: '#ef4444', stroke: '#b91c1c', opacity: 0.75 }; // Critical Red
    if (depthM >= 0.7) return { fill: '#f97316', stroke: '#c2410c', opacity: 0.65 }; // High Orange
    if (depthM >= 0.3) return { fill: '#f59e0b', stroke: '#d97706', opacity: 0.55 }; // Moderate Yellow
    if (depthM >= 0.1) return { fill: '#0284c7', stroke: '#0369a1', opacity: 0.45 }; // Low Blue
    return { fill: '#10b981', stroke: '#059669', opacity: 0.3 };
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Layer Toggle Overlay */}
      <div className="absolute top-3 right-3 z-[1000] glass-panel px-3 py-2 rounded-xl text-xs flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> GIS Layers:
        </span>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={showInundation}
            onChange={(e) => setShowInundation(e.target.checked)}
            className="rounded text-cyan-500 bg-slate-900 border-slate-700"
          />
          Inundation Heatmap
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={showShelters}
            onChange={(e) => setShowShelters(e.target.checked)}
            className="rounded text-emerald-500 bg-slate-900 border-slate-700"
          />
          Relief Havens
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={showSensors}
            onChange={(e) => setShowSensors(e.target.checked)}
            className="rounded text-blue-500 bg-slate-900 border-slate-700"
          />
          IoT Gauges
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={showSOS}
            onChange={(e) => setShowSOS(e.target.checked)}
            className="rounded text-red-500 bg-slate-900 border-slate-700"
          />
          SOS Beacons
        </label>
      </div>

      {/* Map Inundation Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-2.5 rounded-xl text-[11px] space-y-1.5 max-w-[200px]">
        <span className="font-bold text-slate-300 uppercase tracking-wider block text-[10px]">
          Flood Depth Legend (DEM)
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-300">&gt; 1.2m (Submerged / Boats)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
          <span className="text-slate-300">0.7m - 1.2m (Impassable)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span className="text-slate-300">0.3m - 0.7m (Knee Deep)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
          <span className="text-slate-300">&lt; 0.3m (Passable)</span>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={[centerLat, centerLng]} zoom={zoom} />

        {/* Dark CartoDB Basemap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> & OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 1. WARD INUNDATION HYDROLOGICAL LAYERS */}
        {showInundation &&
          wards.map((w) => {
            const style = getInundationColor(w.inundation_depth_m);
            const radius = Math.sqrt(w.submerged_area_sq_km > 0 ? w.submerged_area_sq_km : 3.0) * 850;

            return (
              <Circle
                key={w.ward_id}
                center={[w.center_lat, w.center_lng]}
                radius={radius}
                pathOptions={{
                  fillColor: style.fill,
                  fillOpacity: style.opacity,
                  color: style.stroke,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-bold text-xs text-white">{w.ward_name}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                        w.risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                        w.risk_level === 'HIGH' ? 'bg-orange-600 text-white' :
                        w.risk_level === 'MODERATE' ? 'bg-yellow-600 text-slate-900' : 'bg-emerald-600 text-white'
                      }`}>
                        {w.risk_level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Water Depth:</span>
                        <span className="font-mono font-bold text-cyan-300">{w.inundation_depth_m}m ({w.inundation_depth_cm}cm)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Elevation:</span>
                        <span className="font-mono font-bold text-slate-200">{w.elevation_m}m AMSL</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Slope:</span>
                        <span className="font-mono text-slate-200">{w.slope_deg}°</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Drainage:</span>
                        <span className="font-mono text-slate-200">{w.drainage_capacity_mm_h} mm/h</span>
                      </div>
                    </div>

                    {w.critical_infrastructure.length > 0 && (
                      <div className="pt-1 border-t border-slate-800">
                        <span className="text-[9px] text-slate-400 font-semibold block">Critical Assets at Risk:</span>
                        <ul className="text-[10px] text-red-300 list-disc list-inside">
                          {w.critical_infrastructure.slice(0, 2).map((infra, idx) => (
                            <li key={idx}>{infra}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {onSelectWardForRouting && (
                      <button
                        onClick={() => onSelectWardForRouting(w)}
                        className="w-full mt-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Route Evacuation From Here
                      </button>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* 2. RELIEF CENTERS & SHELTERS */}
        {showShelters &&
          shelters.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={shelterIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs border-b border-slate-700 pb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{s.name}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p className="text-slate-300"><span className="text-slate-400">Type:</span> {s.type}</p>
                    <p className="text-slate-300"><span className="text-slate-400">Capacity:</span> {s.capacity_people} (Occupied: {s.current_occupancy})</p>
                    <p className="text-slate-300"><span className="text-slate-400">Elevation:</span> <span className="font-mono text-emerald-300">{s.elevation_m}m (Safe High Ground)</span></p>
                    <p className="text-slate-300"><span className="text-slate-400">Helpline:</span> {s.contact}</p>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {s.amenities.map((a, i) => (
                      <span key={i} className="text-[9px] bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 3. IOT RAIN & DEPTH SENSORS */}
        {showSensors &&
          sensors.map((sn) => (
            <Marker
              key={sn.sensor_id}
              position={[sn.lat, sn.lng]}
              icon={sensorIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 min-w-[180px]">
                  <span className="font-bold text-xs text-cyan-300 block border-b border-slate-700 pb-0.5">
                    {sn.sensor_name}
                  </span>
                  <div className="text-[11px] space-y-0.5 font-mono">
                    <p className="text-slate-300">Live Water Depth: <span className="text-cyan-400 font-bold">{sn.water_level_m} m</span></p>
                    <p className="text-slate-300">Rain Rate: <span className="text-sky-400">{sn.current_rain_rate_mm_h} mm/h</span></p>
                    <p className="text-slate-400 text-[9px]">Battery: {sn.battery_pct}% | Last Ping: {sn.last_ping}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. CITIZEN SOS BEACONS */}
        {showSOS &&
          sosList.map((sos) => (
            <Marker
              key={sos.id}
              position={[sos.lat, sos.lng]}
              icon={sosIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-red-800 pb-0.5">
                    <span className="font-bold text-xs text-red-400">SOS DISTRESS BEACON</span>
                    <span className="text-[9px] px-1 bg-red-950 text-red-300 rounded border border-red-700">{sos.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-200 space-y-0.5">
                    <p><span className="text-slate-400">Citizen:</span> {sos.citizen_name}</p>
                    <p><span className="text-slate-400">Phone:</span> {sos.phone_number}</p>
                    <p><span className="text-slate-400">Stranded:</span> {sos.num_people_stranded} People ({sos.water_level_description})</p>
                    {sos.medical_emergency && (
                      <p className="text-red-400 font-bold text-[10px]">⚠️ CRITICAL MEDICAL EMERGENCY</p>
                    )}
                    {sos.notes && <p className="text-[10px] italic text-slate-400">"{sos.notes}"</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 5. ACTIVE EVACUATION ROUTE POLYLINE */}
        {activeRoute && activeRoute.waypoints.length > 0 && (
          <Polyline
            positions={activeRoute.waypoints}
            pathOptions={{
              color: activeRoute.is_safe ? '#10b981' : '#ef4444',
              weight: 6,
              opacity: 0.9,
              dashArray: activeRoute.is_safe ? undefined : '8, 8',
            }}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-emerald-400 block">AI Recommended Safe Route</span>
                <p className="text-slate-300">Distance: {activeRoute.total_distance_km} km</p>
                <p className="text-slate-300">Est. Time: {activeRoute.estimated_travel_time_mins} mins</p>
                <p className="text-slate-300">Avoided Flooded Chokepoints: {activeRoute.avoided_flooded_roads_count}</p>
              </div>
            </Popup>
          </Polyline>
        )}
      </MapContainer>
    </div>
  );
};
