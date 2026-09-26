import React from 'react';
import { 
  CloudRain, AlertTriangle, ShieldAlert, Navigation, 
  BarChart3, FileText, Activity, Radio, Waves
} from 'lucide-react';

interface NavbarProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  activeTab: 'map' | 'evacuation' | 'analytics' | 'summary';
  setActiveTab: (tab: 'map' | 'evacuation' | 'analytics' | 'summary') => void;
  onOpenSimulator: () => void;
  onOpenSOS: () => void;
  isLiveWeather: boolean;
  onToggleLiveWeather: () => void;
  simulatedRainRate: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCity,
  onCityChange,
  alertLevel,
  activeTab,
  setActiveTab,
  onOpenSimulator,
  onOpenSOS,
  isLiveWeather,
  onToggleLiveWeather,
  simulatedRainRate,
}) => {
  const getAlertBadge = () => {
    switch (alertLevel) {
      case 'RED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500 text-red-400 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            IMD RED ALERT (CLOUDBURST RISK)
          </span>
        );
      case 'ORANGE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-950/80 border border-orange-500 text-orange-400 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            IMD ORANGE ALERT (VERY HEAVY)
          </span>
        );
      case 'YELLOW':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-950/80 border border-yellow-500 text-yellow-400 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            IMD YELLOW WATCH
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-400 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            CONDITIONS NORMAL
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  JalPrahari AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-700/50 rounded font-bold">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Integrated Heavy Rainfall & Inundation Warning System
              </p>
            </div>
          </div>

          <div className="block md:hidden">
            {getAlertBadge()}
          </div>
        </div>

        {/* Center: Navigation Tabs & City Selector */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-center">
          {/* City Selector */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition"
            >
              <option value="mumbai">Mumbai (Mithi Catchment)</option>
              <option value="chennai">Chennai (Adyar/Velachery)</option>
              <option value="bengaluru">Bengaluru (Bellandur Valley)</option>
              <option value="delhi">Delhi NCR (Yamuna Basin)</option>
            </select>
          </div>

          {/* Navigation Mode Tabs */}
          <nav className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'map'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              GIS Flood Map
            </button>
            <button
              onClick={() => setActiveTab('evacuation')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'evacuation'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Evac Routes
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Ward Analytics
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'summary'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              SIH Synopsis
            </button>
          </nav>
        </div>

        {/* Right Actions: Simulator & SOS Beacon */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="hidden lg:block">
            {getAlertBadge()}
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg shadow-md shadow-sky-900/30 transition transform active:scale-95"
            title="Inject Cloudburst and simulate real-time inundation"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Simulate ({simulatedRainRate}mm/h)</span>
          </button>

          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-red-900/30 transition transform active:scale-95 animate-pulse"
            title="Emergency Citizen Distress SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS / Citizen Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
