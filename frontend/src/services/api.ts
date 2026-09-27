import axios from 'axios';
import {
  WeatherTelemetry, NowcastPrediction, SimulationRequest,
  CityInundationResponse, EvacuationRouteRequest, EvacuationRouteResponse,
  CitizenSOS, CrowdFloodReport, IoTSensor, CityProfile, HistoricalEventSummary, HistoricalReplayResponse
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getCities = async (): Promise<Record<string, CityProfile>> => {
  const res = await api.get('/cities');
  return res.data;
};

export const getWeatherTelemetry = async (lat: number, lng: number, rainRate?: number, live?: boolean): Promise<WeatherTelemetry> => {
  const res = await api.get('/weather/telemetry', {
    params: { lat, lng, rain_rate: rainRate, live }
  });
  return res.data;
};

export const predictNowcast = async (telemetry: WeatherTelemetry): Promise<NowcastPrediction> => {
  const res = await api.post('/ml/nowcast', telemetry);
  return res.data;
};

export const runInundationSimulation = async (params: SimulationRequest): Promise<CityInundationResponse> => {
  const res = await api.post('/simulation/inundation', params);
  return res.data;
};

export const getScenarioPresets = async () => {
  const res = await api.get('/scenarios/presets');
  return res.data;
};

export const getIoTSensors = async (cityId: string, rainRate: number): Promise<IoTSensor[]> => {
  const res = await api.get('/sensors/telemetry', {
    params: { city_id: cityId, rain_rate: rainRate }
  });
  return res.data;
};

export const getSafeEvacuationRoute = async (req: EvacuationRouteRequest): Promise<EvacuationRouteResponse> => {
  const res = await api.post('/routing/evacuation-path', req);
  return res.data;
};

export const submitCitizenSOS = async (sos: CitizenSOS): Promise<any> => {
  const res = await api.post('/citizen/sos', sos);
  return res.data;
};

export const listSOSRequests = async (): Promise<CitizenSOS[]> => {
  const res = await api.get('/citizen/sos-list');
  return res.data;
};

export const updateSOSStatus = async (sosId: string, status: string): Promise<any> => {
  const res = await api.patch(`/citizen/sos/${sosId}/status`, null, {
    params: { status }
  });
  return res.data;
};

export const submitFloodReport = async (rpt: CrowdFloodReport): Promise<any> => {
  const res = await api.post('/citizen/report', rpt);
  return res.data;
};

export const listFloodReports = async (): Promise<CrowdFloodReport[]> => {
  const res = await api.get('/citizen/reports');
  return res.data;
};

export const getHistoricalEvents = async (): Promise<HistoricalEventSummary[]> => {
  const res = await api.get('/historical/events');
  return res.data;
};

export const getHistoricalReplay = async (cityId: string, date: string): Promise<HistoricalReplayResponse> => {
  const res = await api.get('/historical/replay', {
    params: { city_id: cityId, date }
  });
  return res.data;
};