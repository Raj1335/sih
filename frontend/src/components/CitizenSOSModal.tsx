import React, { useState } from 'react';
import { 
  ShieldAlert, X, Send, MapPin, Phone, Users, 
  HeartPulse, AlertTriangle, CheckCircle, Camera, Radio, LifeBuoy
} from 'lucide-react';
import { CitizenSOS, CrowdFloodReport, WardInundationDetail } from '../types';

interface CitizenSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: WardInundationDetail[];
  sosList: CitizenSOS[];
  crowdReports: CrowdFloodReport[];
  onSubmitSOS: (sos: CitizenSOS) => void;
  onSubmitReport: (rpt: CrowdFloodReport) => void;
  onUpdateSOSStatus: (sosId: string, status: string) => void;
}

export const CitizenSOSModal: React.FC<CitizenSOSModalProps> = ({
  isOpen,
  onClose,
  wards,
  sosList,
  crowdReports,
  onSubmitSOS,
  onSubmitReport,
  onUpdateSOSStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'sos' | 'report' | 'admin'>('sos');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // SOS Form state
  const [sosName, setSosName] = useState('');
  const [sosPhone, setSosPhone] = useState('');
  const [sosWard, setSosWard] = useState(wards[0]?.ward_name || '');
  const [numPeople, setNumPeople] = useState(1);
  const [waterLevel, setWaterLevel] = useState('Waist');
  const [medicalEmergency, setMedicalEmergency] = useState(false);
  const [notes, setNotes] = useState('');

  // Report Form state
  const [repName, setRepName] = useState('');
  const [repLocation, setRepLocation] = useState('');
  const [repDepth, setRepDepth] = useState(30);
  const [repTraffic, setRepTraffic] = useState<'PASSABLE' | 'SLOW' | 'BLOCKED'>('BLOCKED');
  const [repDesc, setRepDesc] = useState('');

  if (!isOpen) return null;

  const handleSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wardObj = wards.find((w) => w.ward_name === sosWard) || wards[0];
    onSubmitSOS({
      citizen_name: sosName || 'Citizen in Distress',
      phone_number: sosPhone || '+91-XXXXX-XXXXX',
      lat: wardObj ? wardObj.center_lat + (Math.random() - 0.5) * 0.01 : 19.0760,
      lng: wardObj ? wardObj.center_lng + (Math.random() - 0.5) * 0.01 : 72.8777,
      ward_name: sosWard,
      num_people_stranded: numPeople,
      water_level_description: waterLevel,
      medical_emergency: medicalEmergency,
      notes: notes,
    });
    setSubmittedMessage('Emergency SOS Dispatched to NDRF Command Center!');
    setTimeout(() => {
      setSubmittedMessage(null);
      setActiveTab('admin');
    }, 1500);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wardObj = wards[0];
    onSubmitReport({
      reporter_name: repName || 'Citizen Reporter',
      lat: wardObj ? wardObj.center_lat + (Math.random() - 0.5) * 0.01 : 19.0760,
      lng: wardObj ? wardObj.center_lng + (Math.random() - 0.5) * 0.01 : 72.8777,
      location_name: repLocation || 'Local Road',
      water_depth_cm: repDepth,
      road_traffic_status: repTraffic,
      description: repDesc,
    });
    setSubmittedMessage('Crowdsourced Waterlogging Report Published!');
    setTimeout(() => {
      setSubmittedMessage(null);
      setActiveTab('admin');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Citizen Safety & Emergency Response Portal
              </h2>
              <p className="text-xs text-slate-400">
                Direct integration with Municipal Disaster Management & NDRF rescue units.
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

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sos'
                ? 'bg-red-600 text-white shadow-md shadow-red-950'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            🚨 Send Emergency SOS
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            📸 Report Waterlogging
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            📡 Live Rescue Feed ({sosList.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto">
          {submittedMessage && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {submittedMessage}
            </div>
          )}

          {/* TAB 1: EMERGENCY SOS FORM */}
          {activeTab === 'sos' && (
            <form onSubmit={handleSosSubmit} className="space-y-4">
              <div className="bg-red-950/30 border border-red-800/40 p-3 rounded-xl text-xs text-red-200">
                <span className="font-bold">⚠️ Life-Threatening Situation?</span> Your live GPS coordinates will be instantly transmitted to the NDRF Disaster Response Room.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Your Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={sosName}
                    onChange={(e) => setSosName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Emergency Contact No:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91-98765-43210"
                    value={sosPhone}
                    onChange={(e) => setSosPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Current Flooded Ward:</label>
                  <select
                    value={sosWard}
                    onChange={(e) => setSosWard(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  >
                    {wards.map((w) => (
                      <option key={w.ward_id} value={w.ward_name}>{w.ward_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">No. of People Stranded:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numPeople}
                    onChange={(e) => setNumPeople(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Current Water Depth Level:</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['Ankle Deep (<0.2m)', 'Knee Deep (~0.5m)', 'Waist Deep (~1.1m)', 'Roof/Neck (>1.8m)'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setWaterLevel(lvl)}
                      className={`p-2 rounded-lg border text-[11px] font-medium transition ${
                        waterLevel === lvl
                          ? 'bg-red-900/60 border-red-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="med"
                  checked={medicalEmergency}
                  onChange={(e) => setMedicalEmergency(e.target.checked)}
                  className="rounded text-red-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <label htmlFor="med" className="text-xs font-bold text-red-400 cursor-pointer flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" /> Immediate Medical Triage Required (Pregnant, Infant, Oxygen Support)
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Location Details / Landmark:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Near 2nd floor balcony, orange building opposite Metro pillar 42..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition"
              >
                <ShieldAlert className="w-4 h-4" /> Broadcast Emergency SOS Rescue Signal
              </button>
            </form>
          )}

          {/* TAB 2: CROWDSOURCED FLOOD REPORT */}
          {activeTab === 'report' && (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="bg-cyan-950/30 border border-cyan-800/40 p-3 rounded-xl text-xs text-cyan-200">
                Help fellow citizens and municipal authorities by reporting ground-truth water levels in your area.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Reporter Name:</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Street / Location Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Milan Subway underpass"
                    value={repLocation}
                    onChange={(e) => setRepLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Water Depth (cm): {repDepth} cm</label>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={repDepth}
                    onChange={(e) => setRepDepth(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Road Traffic Condition:</label>
                  <select
                    value={repTraffic}
                    onChange={(e) => setRepTraffic(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="PASSABLE">Passable (Light Water)</option>
                    <option value="SLOW">Slow / Crawling Traffic</option>
                    <option value="BLOCKED">Completely Blocked / Submerged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Ground Situation Description:</label>
                <textarea
                  rows={2}
                  placeholder="Describe vehicles trapped, storm drain overflows, fallen trees..."
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold rounded-xl"
              >
                Publish Verified Flood Ground Report
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN RESCUE FEED & DISPATCH */}
          {activeTab === 'admin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active SOS Rescue Distress Calls
                </span>
                <span className="text-[10px] font-mono bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">
                  {sosList.filter((s) => s.status !== 'RESCUED').length} Pending Dispatch
                </span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {sosList.map((sos) => (
                  <div
                    key={sos.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sos.citizen_name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{sos.phone_number}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          sos.status === 'RESCUED' ? 'bg-emerald-900 text-emerald-300' :
                          sos.status === 'TEAM_EN_ROUTE' ? 'bg-amber-900 text-amber-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {sos.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ward: <span className="text-slate-200">{sos.ward_name}</span> | Stranded: <span className="text-slate-200">{sos.num_people_stranded} People ({sos.water_level_description})</span>
                      </p>
                      {sos.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">"{sos.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sos.status !== 'TEAM_EN_ROUTE' && sos.status !== 'RESCUED' && (
                        <button
                          onClick={() => onUpdateSOSStatus(sos.id!, 'TEAM_EN_ROUTE')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Dispatch NDRF Boat
                        </button>
                      )}
                      {sos.status !== 'RESCUED' && (
                        <button
                          onClick={() => onUpdateSOSStatus(sos.id!, 'RESCUED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Mark Rescued
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
