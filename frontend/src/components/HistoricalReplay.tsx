import React, { useEffect, useState } from 'react';
import { History, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { getHistoricalEvents, getHistoricalReplay } from '../services/api';
import { HistoricalEventSummary, HistoricalReplayResponse } from '../types';

const alertColor: Record<string, string> = {
  RED: 'text-alert-red',
  ORANGE: 'text-flood-secondary',
  YELLOW: 'text-alert-amber',
  GREEN: 'text-alert-green',
};

export const HistoricalReplay: React.FC<{ selectedCity: string }> = ({ selectedCity }) => {
  const [events, setEvents] = useState<HistoricalEventSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [replay, setReplay] = useState<HistoricalReplayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistoricalEvents()
      .then(setEvents)
      .catch(() => setError(
        'No historical data found on the backend. Run fetch_historical_weather.py + ' +
        'train_rainfall_model.py, then copy historical_data/ into backend/app/data/historical/.'
      ));
  }, []);

  const cityEvent = events.find((e) => e.city_id === selectedCity);

  const runReplay = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistoricalReplay(selectedCity, date);
      setReplay(res);
      setSelectedDate(date);
    } catch (err) {
      setError(`No data for ${selectedCity} on ${date}.`);
      setReplay(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded bg-surface-container p-5 border border-surface-variant/60">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-flood-primary-light" />
          <h2 className="text-xl font-bold text-onsurface font-display">Historical Replay</h2>
        </div>
        <p className="text-sm text-onsurface-variant">
          Replays real historical weather data through the live trained model, hour by hour,
          and compares its forecast against what actually happened. This is genuine accuracy
          on real data — not a scripted demo.
        </p>
      </div>

      {error && (
        <div className="rounded bg-alert-red-container/20 border border-alert-red/40 p-4 flex items-start gap-2 text-sm text-alert-red">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cityEvent && (
        <div className="rounded bg-surface-container-low p-4 border border-surface-variant/40">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-flood-secondary" />
            <span className="text-xs font-mono uppercase tracking-wider text-onsurface-variant">
              Pick a real day ({cityEvent.available_from} to {cityEvent.available_to})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cityEvent.notable_high_rainfall_days.map((d) => (
              <button
                key={d.date}
                onClick={() => runReplay(d.date)}
                className={`px-3 py-1.5 rounded text-xs font-mono border transition ${
                  selectedDate === d.date
                    ? 'bg-flood-primary text-onsurface border-flood-primary'
                    : 'bg-surface-container border-surface-variant text-onsurface-variant hover:border-flood-secondary'
                }`}
              >
                {d.date} · {d.total_rainfall_mm}mm total
              </button>
            ))}
            <input
              type="date"
              min={cityEvent.available_from}
              max={cityEvent.available_to}
              onChange={(e) => e.target.value && runReplay(e.target.value)}
              className="bg-surface-container border border-surface-variant rounded px-3 py-1.5 text-xs font-mono text-onsurface"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-onsurface-variant text-sm py-8 font-mono">
          Replaying real historical hours through the model...
        </div>
      )}

      {replay && !loading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded bg-surface-container p-3 border border-surface-variant/40">
              <span className="text-[10px] uppercase text-onsurface-variant font-mono">Total Real Rainfall</span>
              <div className="text-2xl font-bold text-flood-primary-light font-mono">
                {replay.total_actual_rainfall_mm}mm
              </div>
            </div>
            <div className="rounded bg-surface-container p-3 border border-surface-variant/40">
              <span className="text-[10px] uppercase text-onsurface-variant font-mono">Mean Absolute Error</span>
              <div className="text-2xl font-bold text-flood-secondary font-mono">
                {replay.mean_absolute_error_mm != null ? `${replay.mean_absolute_error_mm}mm` : '—'}
              </div>
            </div>
            <div className="rounded bg-surface-container p-3 border border-surface-variant/40">
              <span className="text-[10px] uppercase text-onsurface-variant font-mono">Hours Replayed</span>
              <div className="text-2xl font-bold text-onsurface font-mono">{replay.hours_replayed}</div>
            </div>
          </div>

          <div className="rounded bg-surface-container-low border border-surface-variant/40 overflow-hidden">
            <div className="p-3 bg-surface-container flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-flood-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider text-onsurface font-mono">
                Actual vs. Predicted (next-hour rainfall)
              </span>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-container text-onsurface-variant uppercase sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Actual (mm/h)</th>
                    <th className="py-2 px-3">Actual Next Hr</th>
                    <th className="py-2 px-3">Predicted Next Hr</th>
                    <th className="py-2 px-3">Predicted Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {replay.points.map((p, i) => (
                    <tr key={i} className="hover:bg-surface-container">
                      <td className="py-1.5 px-3 text-onsurface">{p.time}</td>
                      <td className="py-1.5 px-3 text-onsurface-variant">{p.actual_precip_mm}</td>
                      <td className="py-1.5 px-3 text-onsurface">{p.actual_next_hour_mm}</td>
                      <td className="py-1.5 px-3 text-flood-secondary">{p.predicted_next_hour_mm}</td>
                      <td className={`py-1.5 px-3 font-bold ${alertColor[p.predicted_alert_level]}`}>
                        {p.predicted_alert_level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};