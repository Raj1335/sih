import React from 'react';
import {
  CloudRain, ShieldAlert, Navigation,
  BarChart3, History, Radio, Waves
} from 'lucide-react';

export type ActiveTab = 'map' | 'evacuation' | 'analytics' | 'replay';

interface NavbarProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
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
  simulatedRainRate,
}) => {
  const getAlertBadge = () => {
    switch (alertLevel) {
      case 'RED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-alert-red-container/20 border border-alert-red/40 text-alert-red rounded text-[11px] font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-alert-red animate-pulse" />
            RED ALERT — CLOUDBURST RISK
          </span>
        );
      case 'ORANGE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-flood-secondary-container/20 border border-flood-secondary/40 text-flood-secondary rounded text-[11px] font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-flood-secondary" />
            ORANGE ALERT — VERY HEAVY
          </span>
        );
      case 'YELLOW':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-alert-amber/10 border border-alert-amber/40 text-alert-amber rounded text-[11px] font-mono font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-alert-amber" />
            YELLOW WATCH
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-alert-green/10 border border-alert-green/40 text-alert-green rounded text-[11px] font-mono font-medium uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-alert-green" />
            CONDITIONS NORMAL
          </span>
        );
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: 'GIS Flood Map', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'evacuation', label: 'Evac Routes', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Ward Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'replay', label: 'Historical Replay', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface-lowest/90 backdrop-blur-xl border-b border-surface-variant/60 px-4 lg:px-6 py-2.5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-flood-primary to-flood-secondary-container flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.35)]">
              <Waves className="w-5 h-5 text-onsurface" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-onsurface font-display">
                  JAL-DRISHTI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-high text-flood-primary-light border border-surface-variant rounded font-bold uppercase">
                  EOC · SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-onsurface-variant font-medium uppercase tracking-wide">
                Integrated Heavy Rainfall & Inundation Command
              </p>
            </div>
          </div>

          <div className="block md:hidden">
            {getAlertBadge()}
          </div>
        </div>

        {/* Center: Navigation Tabs & City Selector */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-center">
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-surface-container border border-surface-variant hover:border-flood-secondary text-onsurface text-xs font-semibold rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-flood-primary cursor-pointer transition font-mono"
            >
              <option value="mumbai">Mumbai (Mithi Catchment)</option>
              <option value="chennai">Chennai (Adyar/Velachery)</option>
              <option value="bengaluru">Bengaluru (Bellandur Valley)</option>
              <option value="delhi">Delhi NCR (Yamuna Basin)</option>
            </select>
          </div>

          <nav className="flex items-center bg-surface-container p-1 rounded border border-surface-variant/60 text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition font-mono uppercase text-[11px] tracking-wide ${
                  activeTab === tab.id
                    ? 'bg-surface-high text-flood-primary-light shadow-inner font-bold'
                    : 'text-onsurface-variant hover:text-onsurface'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Actions: Simulator & SOS Beacon */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="hidden lg:block">
            {getAlertBadge()}
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-high border border-surface-variant hover:border-flood-secondary text-flood-secondary text-xs font-bold rounded transition transform active:scale-95 font-mono uppercase tracking-wide"
            title="Inject Cloudburst and simulate real-time inundation"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Simulate ({simulatedRainRate}mm/h)</span>
          </button>

          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-flood-primary hover:brightness-110 text-onsurface text-xs font-bold rounded shadow-[0_0_12px_rgba(249,115,22,0.35)] transition transform active:scale-95 font-mono uppercase tracking-wide"
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