export interface WeatherTelemetry {
  timestamp: string;
  temperature_c: number;
  relative_humidity_pct: number;
  surface_pressure_hpa: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  radar_reflectivity_dbz: number;
  cape_j_kg: number;
}

export interface NowcastPrediction {
  current_intensity_mm_h: number;
  forecast_1h_mm: number;
  forecast_3h_mm: number;
  forecast_6h_mm: number;
  forecast_24h_mm: number;
  alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  alert_title: string;
  advisory: string;
  cloudburst_probability_pct: number;
  confidence_score: number;
}

export interface WardInundationDetail {
  ward_id: string;
  ward_name: string;
  center_lat: number;
  center_lng: number;
  elevation_m: number;
  slope_deg: number;
  drainage_capacity_mm_h: number;
  soil_saturation_index: number;
  accumulated_rainfall_mm: number;
  inundation_depth_m: number;
  inundation_depth_cm: number;
  risk_level: 'NORMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  submerged_area_sq_km: number;
  affected_population_est: number;
  critical_infrastructure: string[];
  roads_impassable: boolean;
}

export interface CityInundationResponse {
  city_id: string;
  city_name: string;
  total_rainfall_injected_mm: number;
  overall_city_risk: string;
  wards: WardInundationDetail[];
  high_risk_wards_count: number;
  total_critical_assets_threatened: number;
  recommended_shelters: ReliefCenter[];
  generated_at: string;
}

export interface ReliefCenter {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  capacity_people: number;
  current_occupancy: number;
  elevation_m: number;
  contact: string;
  amenities: string[];
  status: string;
}

export interface SimulationRequest {
  city_id: string;
  rainfall_rate_mm_h: number;
  duration_hours: number;
  drainage_clogging_factor: number;
  soil_saturation_override?: number;
  scenario_preset?: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface EvacuationRouteRequest {
  city_id: string;
  start_lat: number;
  start_lng: number;
  destination_lat?: number;
  destination_lng?: number;
  destination_type?: string;
}

export interface RouteSegment {
  from_point: RoutePoint;
  to_point: RoutePoint;
  distance_km: number;
  estimated_water_depth_m: number;
  status: 'CLEAR' | 'CAUTION' | 'BLOCKED';
}

export interface EvacuationRouteResponse {
  route_id: string;
  total_distance_km: number;
  estimated_travel_time_mins: number;
  is_safe: boolean;
  max_water_depth_m: number;
  avoided_flooded_roads_count: number;
  waypoints: [number, number][];
  segments: RouteSegment[];
  destination_info: any;
  advisory: string;
}

export interface CitizenSOS {
  id?: string;
  citizen_name: string;
  phone_number: string;
  lat: number;
  lng: number;
  ward_name?: string;
  num_people_stranded: number;
  water_level_description: string;
  medical_emergency: boolean;
  notes?: string;
  timestamp?: string;
  status?: string;
}

export interface CrowdFloodReport {
  id?: string;
  reporter_name?: string;
  lat: number;
  lng: number;
  location_name: string;
  water_depth_cm: number;
  road_traffic_status: 'PASSABLE' | 'SLOW' | 'BLOCKED';
  description: string;
  photo_url?: string;
  timestamp?: string;
  verified_votes?: number;
}

export interface IoTSensor {
  sensor_id: string;
  sensor_name: string;
  sensor_type: string;
  lat: number;
  lng: number;
  water_level_m: number;
  current_rain_rate_mm_h: number;
  battery_pct: number;
  status: string;
  last_ping: string;
}

export interface CityProfile {
  city_id: string;
  city_name: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  catchment_basin: string;
  drainage_system: string;
  wards: any[];
}

export interface HistoricalEventSummary {
  city_id: string;
  available_from: string;
  available_to: string;
  notable_high_rainfall_days: { date: string; total_rainfall_mm: number }[];
}

export interface HistoricalReplayPoint {
  time: string;
  actual_precip_mm: number;
  actual_next_hour_mm: number;
  predicted_next_hour_mm: number;
  predicted_alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  cloudburst_probability_pct: number;
}

export interface HistoricalReplayResponse {
  city_id: string;
  date: string;
  total_actual_rainfall_mm: number;
  mean_absolute_error_mm: number | null;
  hours_replayed: number;
  points: HistoricalReplayPoint[];
}