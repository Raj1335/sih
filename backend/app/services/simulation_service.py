from typing import Dict, Any, List
import random
from datetime import datetime

PRESET_SCENARIOS = {
    "mumbai_cloudburst": {
        "id": "mumbai_cloudburst",
        "name": "Mumbai Severe Urban Cloudburst",
        "city_id": "mumbai",
        "rainfall_rate_mm_h": 145.0,
        "duration_hours": 4.0,
        "drainage_clogging_factor": 0.65,
        "soil_saturation_override": 0.95,
        "description": "Simulates 580mm extreme cloudburst over Mithi River basin causing severe Kurla/Hindmata submergence."
    },
    "chennai_cyclone": {
        "id": "chennai_cyclone",
        "name": "Chennai Cyclone Heavy Inundation",
        "city_id": "chennai",
        "rainfall_rate_mm_h": 95.0,
        "duration_hours": 6.0,
        "drainage_clogging_factor": 0.55,
        "soil_saturation_override": 0.92,
        "description": "Simulates cyclone landfall with heavy torrential rain flooding Velachery and Saidapet marsh basins."
    },
    "bengaluru_floods": {
        "id": "bengaluru_floods",
        "name": "Bengaluru Bellandur Valley Breach",
        "city_id": "bengaluru",
        "rainfall_rate_mm_h": 85.0,
        "duration_hours": 3.5,
        "drainage_clogging_factor": 0.70,
        "soil_saturation_override": 0.88,
        "description": "Simulates cascade lake overflow submerging Outer Ring Road tech corridors and low-lying layouts."
    },
    "delhi_yamuna": {
        "id": "delhi_yamuna",
        "name": "Delhi Yamuna Spillage & Storm",
        "city_id": "delhi",
        "rainfall_rate_mm_h": 70.0,
        "duration_hours": 5.0,
        "drainage_clogging_factor": 0.45,
        "soil_saturation_override": 0.90,
        "description": "Simulates Yamuna water level crossing danger mark coupled with intense local storm waterlogging Kashmere Gate."
    },
    "normal_monsoon": {
        "id": "normal_monsoon",
        "name": "Normal Seasonal Monsoon Shower",
        "city_id": "mumbai",
        "rainfall_rate_mm_h": 14.0,
        "duration_hours": 2.0,
        "drainage_clogging_factor": 0.15,
        "soil_saturation_override": 0.60,
        "description": "Baseline typical monsoon shower within municipal drainage clearance capacity."
    }
}

class SimulationService:
    def get_presets(self) -> Dict[str, Any]:
        return PRESET_SCENARIOS

    def generate_iot_telemetry(self, city_id: str, current_rain_rate: float) -> List[Dict[str, Any]]:
        """Generates dynamic live telemetry data for IoT rain gauges and acoustic water level ultrasonic sensors."""
        sensors = []
        base_locations = {
            "mumbai": [
                {"id": "IOT_MUM_R1", "name": "Mithi River Culvert Gauge", "lat": 19.0700, "lng": 72.8750, "type": "Ultrasonic Water Depth"},
                {"id": "IOT_MUM_R2", "name": "Hindmata Underpass Sensor", "lat": 19.0190, "lng": 72.8460, "type": "Acoustic Depth Sensor"},
                {"id": "IOT_MUM_R3", "name": "Milan Subway Rain Station", "lat": 19.1180, "lng": 72.8450, "type": "Tipping Bucket Rain Gauge"},
                {"id": "IOT_MUM_R4", "name": "Sion Railway Sump Gauge", "lat": 19.0410, "lng": 72.8630, "type": "Ultrasonic Water Depth"}
            ],
            "chennai": [
                {"id": "IOT_CHE_R1", "name": "Velachery Marsh Gauge", "lat": 12.9770, "lng": 72.2230, "type": "Ultrasonic Water Depth"},
                {"id": "IOT_CHE_R2", "name": "Adyar Maraimalai Bridge Sensor", "lat": 13.0220, "lng": 80.2220, "type": "River Discharge Gauge"}
            ],
            "bengaluru": [
                {"id": "IOT_BLR_R1", "name": "Bellandur Sluice Gate Monitor", "lat": 12.9280, "lng": 77.6740, "type": "Ultrasonic Water Depth"},
                {"id": "IOT_BLR_R2", "name": "Koramangala Valley Drain", "lat": 12.9360, "lng": 77.6250, "type": "Flow Velocity Gauge"}
            ],
            "delhi": [
                {"id": "IOT_DEL_R1", "name": "Old Railway Bridge Yamuna Gauge", "lat": 28.6650, "lng": 77.2350, "type": "River Crest Monitor"},
                {"id": "IOT_DEL_R2", "name": "Minto Bridge Underpass Sensor", "lat": 28.6350, "lng": 77.2230, "type": "Ultrasonic Water Depth"}
            ]
        }

        city_sensors = base_locations.get(city_id.lower(), base_locations["mumbai"])
        
        for s in city_sensors:
            noise = random.uniform(-0.05, 0.05)
            # Water level proportional to rain rate
            water_level_m = max(0.02, round((current_rain_rate / 65.0) * 0.95 + noise, 2))
            rate = max(0.0, round(current_rain_rate + random.uniform(-4.0, 4.0), 1))
            status = "NORMAL"
            if water_level_m >= 0.70:
                status = "DANGER_OVERFLOW"
            elif water_level_m >= 0.30:
                status = "WARNING_HIGH"

            sensors.append({
                "sensor_id": s["id"],
                "sensor_name": s["name"],
                "sensor_type": s["type"],
                "lat": s["lat"],
                "lng": s["lng"],
                "water_level_m": water_level_m,
                "current_rain_rate_mm_h": rate,
                "battery_pct": random.randint(92, 99),
                "status": status,
                "last_ping": datetime.utcnow().strftime("%H:%M:%S") + " UTC"
            })
        return sensors

simulation_service = SimulationService()
