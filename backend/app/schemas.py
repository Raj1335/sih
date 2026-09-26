from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class WeatherTelemetry(BaseModel):
    timestamp: str
    temperature_c: float
    relative_humidity_pct: float
    surface_pressure_hpa: float
    wind_speed_kmh: float
    precipitation_mm: float
    radar_reflectivity_dbz: float
    cape_j_kg: float = 1200.0  # Convective Available Potential Energy

class NowcastPrediction(BaseModel):
    current_intensity_mm_h: float
    forecast_1h_mm: float
    forecast_3h_mm: float
    forecast_6h_mm: float
    forecast_24h_mm: float
    alert_level: str  # "GREEN", "YELLOW", "ORANGE", "RED"
    alert_title: str
    advisory: str
    cloudburst_probability_pct: float
    confidence_score: float

class WardInundationDetail(BaseModel):
    ward_id: str
    ward_name: str
    center_lat: float
    center_lng: float
    elevation_m: float
    slope_deg: float
    drainage_capacity_mm_h: float
    soil_saturation_index: float  # 0.0 to 1.0
    accumulated_rainfall_mm: float
    inundation_depth_m: float
    inundation_depth_cm: float
    risk_level: str  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    submerged_area_sq_km: float
    affected_population_est: int
    critical_infrastructure: List[str]
    roads_impassable: bool

class CityInundationResponse(BaseModel):
    city_id: str
    city_name: str
    total_rainfall_injected_mm: float
    overall_city_risk: str
    wards: List[WardInundationDetail]
    high_risk_wards_count: int
    total_critical_assets_threatened: int
    recommended_shelters: List[Dict[str, Any]]
    generated_at: str

class SimulationRequest(BaseModel):
    city_id: str = "mumbai"
    rainfall_rate_mm_h: float = 75.0
    duration_hours: float = 3.0
    drainage_clogging_factor: float = 0.35  # 0.0 to 1.0
    soil_saturation_override: Optional[float] = 0.85
    scenario_preset: Optional[str] = "custom"

class RoutePoint(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None

class EvacuationRouteRequest(BaseModel):
    city_id: str
    start_lat: float
    start_lng: float
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    destination_type: str = "nearest_shelter"  # or "custom"

class RouteSegment(BaseModel):
    from_point: RoutePoint
    to_point: RoutePoint
    distance_km: float
    estimated_water_depth_m: float
    status: str  # "CLEAR", "CAUTION", "BLOCKED"

class EvacuationRouteResponse(BaseModel):
    route_id: str
    total_distance_km: float
    estimated_travel_time_mins: float
    is_safe: bool
    max_water_depth_m: float
    avoided_flooded_roads_count: int
    waypoints: List[List[float]]  # [[lat, lng], ...]
    segments: List[RouteSegment]
    destination_info: Dict[str, Any]
    advisory: str

class CitizenSOS(BaseModel):
    id: Optional[str] = None
    citizen_name: str
    phone_number: str
    lat: float
    lng: float
    ward_name: Optional[str] = None
    num_people_stranded: int = 1
    water_level_description: str  # "Ankle", "Knee", "Waist", "Neck/Roof"
    medical_emergency: bool = False
    notes: Optional[str] = ""
    timestamp: Optional[str] = None
    status: str = "DISPATCH_PENDING"  # "DISPATCH_PENDING", "TEAM_EN_ROUTE", "RESCUED"

class CrowdFloodReport(BaseModel):
    id: Optional[str] = None
    reporter_name: Optional[str] = "Anonymous Citizen"
    lat: float
    lng: float
    location_name: str
    water_depth_cm: float
    road_traffic_status: str  # "PASSABLE", "SLOW", "BLOCKED"
    description: str
    photo_url: Optional[str] = None
    timestamp: Optional[str] = None
    verified_votes: int = 1
