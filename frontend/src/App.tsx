import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { EarlyWarningPanel } from './components/EarlyWarningPanel';
import { MapView } from './components/MapView';
import { SimulatorModal } from './components/SimulatorModal';
import { EvacuationRouter } from './components/EvacuationRouter';
import { CitizenSOSModal } from './components/CitizenSOSModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ExecutiveSummary } from './components/ExecutiveSummary';

import {
  getCities, getWeatherTelemetry, predictNowcast,
  runInundationSimulation, getScenarioPresets, getIoTSensors,
  getSafeEvacuationRoute, submitCitizenSOS, listSOSRequests,
  updateSOSStatus, submitFloodReport, listFloodReports
} from './services/api';

import {
  WeatherTelemetry, NowcastPrediction, CityInundationResponse,
  IoTSensor, CitizenSOS, CrowdFloodReport, EvacuationRouteResponse,
  SimulationRequest, CityProfile, WardInundationDetail, EvacuationRouteRequest
} from './types';

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('mumbai');
  const [cityProfiles, setCityProfiles] = useState<Record<string, CityProfile>>({});
  const [activeTab, setActiveTab] = useState<'map' | 'evacuation' | 'analytics' | 'summary'>('map');

  // Meteorological & Simulation states
  const [isLiveWeather, setIsLiveWeather] = useState<boolean>(false);
  const [simulatedRainRate, setSimulatedRainRate] = useState<number>(75.0);
  const [telemetry, setTelemetry] = useState<WeatherTelemetry | null>(null);
  const [nowcast, setNowcast] = useState<NowcastPrediction | null>(null);
  const [inundationData, setInundationData] = useState<CityInundationResponse | null>(null);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [sosList, setSosList] = useState<CitizenSOS[]>([]);
  const [crowdReports, setCrowdReports] = useState<CrowdFloodReport[]>([]);
  const [activeRoute, setActiveRoute] = useState<EvacuationRouteResponse | null>(null);
  const [presetScenarios, setPresetScenarios] = useState<Record<string, any>>({});

  // Modals & Loaders
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isRoutingLoading, setIsRoutingLoading] = useState<boolean>(false);
  const [currentSimParams, setCurrentSimParams] = useState<SimulationRequest>({
    city_id: 'mumbai',
    rainfall_rate_mm_h: 75.0,
    duration_hours: 3.0,
    drainage_clogging_factor: 0.35,
    soil_saturation_override: 0.85,
    scenario_preset: 'custom',
  });

  // 1. Initial Load: Cities, Presets, SOS
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cities, presets, sos, reports] = await Promise.all([
          getCities(),
          getScenarioPresets(),
          listSOSRequests(),
          listFloodReports(),
        ]);
        setCityProfiles(cities);
        setPresetScenarios(presets);
        setSosList(sos);
        setCrowdReports(reports);
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch City Inundation, Telemetry & Nowcast when city or rain rate changes
  const refreshCityData = useCallback(async () => {
    try {
      const currentCityInfo = cityProfiles[selectedCity] || {
        center_lat: 19.0760,
        center_lng: 72.8777,
      };

      // Fetch Weather Telemetry
      const telem = await getWeatherTelemetry(
        currentCityInfo.center_lat,
        currentCityInfo.center_lng,
        simulatedRainRate,
        isLiveWeather
      );
      setTelemetry(telem);

      // Run Nowcasting AI
      const nowc = await predictNowcast(telem);
      setNowcast(nowc);

      // Run Inundation Physics
      const inun = await runInundationSimulation({
        ...currentSimParams,
        city_id: selectedCity,
        rainfall_rate_mm_h: simulatedRainRate,
      });
      setInundationData(inun);

      // Fetch Sensors
      const sens = await getIoTSensors(selectedCity, simulatedRainRate);
      setSensors(sens);
    } catch (err) {
      console.error('Error refreshing telemetry and simulation:', err);
    }
  }, [selectedCity, simulatedRainRate, isLiveWeather, currentSimParams, cityProfiles]);

  useEffect(() => {
    refreshCityData();
  }, [refreshCityData]);

  // Telemetry auto-refresh pulse every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getIoTSensors(selectedCity, simulatedRainRate).then(setSensors).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCity, simulatedRainRate]);

  // Handle Simulation execution from Modal
  const handleRunSimulation = async (params: SimulationRequest) => {
    setCurrentSimParams(params);
    setSimulatedRainRate(params.rainfall_rate_mm_h);
    setSelectedCity(params.city_id);
    setActiveTab('map');
  };

  // Handle Evacuation Path Calculation
  const handleCalculateRoute = async (req: EvacuationRouteRequest) => {
    setIsRoutingLoading(true);
    try {
      const res = await getSafeEvacuationRoute(req);
      setActiveRoute(res);
    } catch (err) {
      console.error('Error calculating route:', err);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  // Handle selecting a ward directly from map popup to route from
  const handleSelectWardForRouting = (ward: WardInundationDetail) => {
    setActiveTab('evacuation');
    handleCalculateRoute({
      city_id: selectedCity,
      start_lat: ward.center_lat,
      start_lng: ward.center_lng,
      destination_type: 'nearest_shelter',
    });
  };

  // Handle Citizen SOS creation
  const handleSubmitSOS = async (sos: CitizenSOS) => {
    try {
      const created = await submitCitizenSOS(sos);
      setSosList((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to submit SOS:', err);
    }
  };

  // Handle SOS status change
  const handleUpdateSOSStatus = async (sosId: string, status: string) => {
    try {
      await updateSOSStatus(sosId, status);
      setSosList((prev) =>
        prev.map((item) => (item.id === sosId ? { ...item, status } : item))
      );
    } catch (err) {
      console.error('Failed to update SOS status:', err);
    }
  };

  // Handle Crowd Report creation
  const handleSubmitReport = async (rpt: CrowdFloodReport) => {
    try {
      const created = await submitFloodReport(rpt);
      setCrowdReports((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  const currentCity = cityProfiles[selectedCity] || {
    city_name: 'Mumbai, Maharashtra',
    center_lat: 19.0760,
    center_lng: 72.8777,
    default_zoom: 12,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        selectedCity={selectedCity}
        onCityChange={(c) => {
          setSelectedCity(c);
          setCurrentSimParams({ ...currentSimParams, city_id: c });
        }}
        alertLevel={nowcast?.alert_level || 'GREEN'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        isLiveWeather={isLiveWeather}
        onToggleLiveWeather={() => setIsLiveWeather(!isLiveWeather)}
        simulatedRainRate={simulatedRainRate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-5">
        {/* TAB 1: GIS FLOOD MAP & COMMAND DASHBOARD */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
            {/* Left Sidebar: AI Early Warning & Atmospheric Telemetry (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <EarlyWarningPanel
                nowcast={nowcast}
                telemetry={telemetry}
                cityName={currentCity.city_name}
              />
            </div>

            {/* Right Map Canvas (8 Cols) */}
            <div className="lg:col-span-8 h-[640px] flex flex-col">
              <MapView
                centerLat={currentCity.center_lat}
                centerLng={currentCity.center_lng}
                zoom={currentCity.default_zoom || 12}
                wards={inundationData?.wards || []}
                shelters={inundationData?.recommended_shelters || []}
                sensors={sensors}
                sosList={sosList}
                activeRoute={activeRoute}
                onSelectWardForRouting={handleSelectWardForRouting}
              />
            </div>
          </div>
        )}

        {/* TAB 2: EVACUATION & SAFE ROUTING */}
        {activeTab === 'evacuation' && (
          <div className="flex flex-col gap-5">
            <EvacuationRouter
              selectedCity={selectedCity}
              wards={inundationData?.wards || []}
              shelters={inundationData?.recommended_shelters || []}
              activeRoute={activeRoute}
              onCalculateRoute={handleCalculateRoute}
              isLoading={isRoutingLoading}
            />

            {/* Route Map Preview */}
            <div className="h-[420px] rounded-2xl overflow-hidden">
              <MapView
                centerLat={currentCity.center_lat}
                centerLng={currentCity.center_lng}
                zoom={currentCity.default_zoom || 12}
                wards={inundationData?.wards || []}
                shelters={inundationData?.recommended_shelters || []}
                sensors={sensors}
                sosList={sosList}
                activeRoute={activeRoute}
              />
            </div>
          </div>
        )}

        {/* TAB 3: WARD ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel inundationData={inundationData} />
        )}

        {/* TAB 4: SIH EXECUTIVE SUMMARY & PITCH GUIDE */}
        {activeTab === 'summary' && (
          <ExecutiveSummary />
        )}
      </main>

      {/* Cloudburst & Scenario Simulation Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        selectedCity={selectedCity}
        onRunSimulation={handleRunSimulation}
        currentParams={currentSimParams}
        presetScenarios={presetScenarios}
      />

      {/* Citizen SOS & Crowdsourced Reporting Modal */}
      <CitizenSOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        wards={inundationData?.wards || []}
        sosList={sosList}
        crowdReports={crowdReports}
        onSubmitSOS={handleSubmitSOS}
        onSubmitReport={handleSubmitReport}
        onUpdateSOSStatus={handleUpdateSOSStatus}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            JalPrahari AI (जल प्रहरी) &copy; 2026 — Smart India Hackathon Prototype
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Powered by FastAPI · Scikit-Learn · NetworkX · Leaflet GIS
          </span>
        </div>
      </footer>
    </div>
  );
};
