import pytest
from app.schemas import WeatherTelemetry, SimulationRequest, EvacuationRouteRequest, CitizenSOS, CrowdFloodReport
from app.ml.rainfall_model import rainfall_nowcaster
from app.ml.inundation_model import inundation_predictor
from app.ml.routing_engine import routing_engine
from app.services.simulation_service import simulation_service
from app.services.notification_service import notification_service

def test_rainfall_nowcasting_green():
    telemetry = WeatherTelemetry(
        timestamp="2026-08-26T12:00:00Z",
        temperature_c=31.0,
        relative_humidity_pct=60.0,
        surface_pressure_hpa=1012.0,
        wind_speed_kmh=12.0,
        precipitation_mm=5.0,
        radar_reflectivity_dbz=15.0,
        cape_j_kg=600.0
    )
    pred = rainfall_nowcaster.predict(telemetry)
    assert pred.alert_level in ["GREEN", "YELLOW"]
    assert pred.forecast_1h_mm >= 0.0
    assert pred.confidence_score > 80.0

def test_rainfall_nowcasting_cloudburst_red():
    telemetry = WeatherTelemetry(
        timestamp="2026-08-26T12:00:00Z",
        temperature_c=26.0,
        relative_humidity_pct=96.0,
        surface_pressure_hpa=992.0,
        wind_speed_kmh=45.0,
        precipitation_mm=110.0,
        radar_reflectivity_dbz=54.0,
        cape_j_kg=3800.0
    )
    pred = rainfall_nowcaster.predict(telemetry)
    assert pred.alert_level == "RED"
    assert pred.cloudburst_probability_pct > 60.0

def test_inundation_simulation():
    req = SimulationRequest(
        city_id="mumbai",
        rainfall_rate_mm_h=120.0,
        duration_hours=3.0,
        drainage_clogging_factor=0.50
    )
    res = inundation_predictor.simulate_inundation(req)
    assert res.city_id == "mumbai"
    assert len(res.wards) > 0
    assert res.total_rainfall_injected_mm == 360.0
    # Lowest elevation wards (Kurla/Hindmata) should exhibit high inundation depth
    kurla = next((w for w in res.wards if "Kurla" in w.ward_name), None)
    assert kurla is not None
    assert kurla.inundation_depth_m > 0.35
    assert kurla.roads_impassable is True

def test_evacuation_routing():
    req = EvacuationRouteRequest(
        city_id="mumbai",
        start_lat=19.0688,
        start_lng=72.8795,
        destination_type="nearest_shelter"
    )
    res = routing_engine.calculate_safe_route(req)
    assert len(res.waypoints) >= 2
    assert res.total_distance_km > 0.0
    assert "SHELTER" in res.destination_info.get("id", "") or "DEFAULT" in res.destination_info.get("id", "")

def test_notification_and_sos():
    sos = CitizenSOS(
        citizen_name="Test Rescue Request",
        phone_number="+91-99999-00000",
        lat=19.05,
        lng=72.85,
        ward_name="Test Ward",
        num_people_stranded=3,
        water_level_description="Waist",
        medical_emergency=True,
        notes="Urgent evacuation needed"
    )
    added = notification_service.add_sos(sos)
    assert "SOS_" in added["id"]
    all_sos = notification_service.get_all_sos()
    assert any(s["id"] == added["id"] for s in all_sos)

if __name__ == "__main__":
    pytest.main(["-v", __file__])
