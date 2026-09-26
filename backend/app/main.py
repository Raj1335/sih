from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.config import settings
from app.schemas import (
    WeatherTelemetry, NowcastPrediction, SimulationRequest,
    CityInundationResponse, EvacuationRouteRequest, EvacuationRouteResponse,
    CitizenSOS, CrowdFloodReport
)
from app.ml.rainfall_model import rainfall_nowcaster
from app.ml.inundation_model import inundation_predictor
from app.ml.routing_engine import routing_engine
from app.services.weather_service import weather_service
from app.services.simulation_service import simulation_service
from app.services.notification_service import notification_service

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SIH 2026 AI/ML-Based Heavy Rainfall Early Warning & Inundation Prediction System API"
)

# Enable CORS for frontend UI communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "system": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "docs_url": "/docs"
    }

# ----------------- WEATHER & NOWCASTING ENDPOINTS -----------------

@app.get("/api/v1/weather/telemetry", response_model=WeatherTelemetry)
async def get_weather_telemetry(lat: float = 19.0760, lng: float = 72.8777, live: bool = False, rain_rate: Optional[float] = None):
    """Retrieves current weather telemetry (live Open-Meteo or simulated with custom rain rate)."""
    if live:
        return await weather_service.fetch_live_weather(lat, lng)
    if rain_rate is not None:
        return weather_service.get_simulated_telemetry(precip_mm=rain_rate)
    return weather_service.get_simulated_telemetry(precip_mm=38.5)

@app.post("/api/v1/ml/nowcast", response_model=NowcastPrediction)
async def predict_nowcast(telemetry: WeatherTelemetry):
    """Runs AI/ML Rainfall Nowcasting and IMD Alert model on incoming telemetry."""
    return rainfall_nowcaster.predict(telemetry)

# ----------------- INUNDATION & SIMULATION ENDPOINTS -----------------

@app.get("/api/v1/cities")
async def get_supported_cities():
    """Returns metadata for all configured metropolitan catchment basins."""
    return inundation_predictor.city_profiles

@app.get("/api/v1/scenarios/presets")
async def get_scenario_presets():
    """Returns pre-configured disaster scenarios (e.g. Mumbai 26/7, Chennai Michaung)."""
    return simulation_service.get_presets()

@app.post("/api/v1/simulation/inundation", response_model=CityInundationResponse)
async def run_inundation_simulation(req: SimulationRequest):
    """
    Executes DEM-based Hydrological Inundation simulation for a city
    given rainfall intensity, duration, soil saturation, and drainage clogging.
    """
    return inundation_predictor.simulate_inundation(req)

@app.get("/api/v1/sensors/telemetry")
async def get_iot_sensors(city_id: str = "mumbai", rain_rate: float = 45.0):
    """Returns live telemetry for simulated IoT rain gauges and water level depth monitors."""
    return simulation_service.generate_iot_telemetry(city_id, rain_rate)

# ----------------- EVACUATION & SAFE ROUTING ENDPOINTS -----------------

@app.post("/api/v1/routing/evacuation-path", response_model=EvacuationRouteResponse)
async def get_safe_evacuation_route(req: EvacuationRouteRequest):
    """
    Calculates dynamic flood-aware shortest safe path bypassing waterlogged arterial roads.
    """
    # Simulate current ward water depth from a baseline rainfall of 80mm
    sim_res = inundation_predictor.simulate_inundation(
        SimulationRequest(city_id=req.city_id, rainfall_rate_mm_h=80.0, duration_hours=3.0)
    )
    ward_depths = {w.ward_id: w.inundation_depth_m for w in sim_res.wards}
    return routing_engine.calculate_safe_route(req, ward_depths)

# ----------------- CITIZEN SOS & REPORTING ENDPOINTS -----------------

@app.post("/api/v1/citizen/sos")
async def submit_sos_distress(sos: CitizenSOS):
    """Logs an emergency citizen SOS rescue request."""
    return notification_service.add_sos(sos)

@app.get("/api/v1/citizen/sos-list")
async def list_sos_requests():
    """Retrieves all active citizen SOS distress beacons for Disaster Management Command."""
    return notification_service.get_all_sos()

@app.patch("/api/v1/citizen/sos/{sos_id}/status")
async def update_sos_status(sos_id: str, status: str):
    """Updates rescue dispatch status for an SOS beacon."""
    success = notification_service.update_sos_status(sos_id, status)
    if not success:
        raise HTTPException(status_code=404, detail="SOS record not found")
    return {"message": "Status updated successfully", "sos_id": sos_id, "status": status}

@app.post("/api/v1/citizen/report")
async def submit_flood_report(report: CrowdFloodReport):
    """Submits a crowdsourced local waterlogging photo and depth report."""
    return notification_service.add_crowd_report(report)

@app.get("/api/v1/citizen/reports")
async def list_flood_reports():
    """Returns all crowdsourced flood reports."""
    return notification_service.get_all_reports()
