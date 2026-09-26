import math
from datetime import datetime
from typing import Optional
import httpx
from app.config import settings
from app.schemas import WeatherTelemetry

class WeatherService:
    """
    Integrates with live Open-Meteo API for real-time weather & radar parameters,
    with robust offline/simulated fallback telemetry for hackathon demos.
    """
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=5.0)

    def _calculate_radar_dbz(self, rain_rate_mm_h: float) -> float:
        """
        Marshall-Palmer empirical relationship between rain rate (R) and radar reflectivity (Z):
        Z = 200 * R^1.6
        dBZ = 10 * log10(Z)
        """
        if rain_rate_mm_h <= 0.05:
            return 5.0
        Z = 200.0 * (rain_rate_mm_h ** 1.6)
        dbz = 10.0 * math.log10(max(1.0, Z))
        return round(float(np_clip := max(5.0, min(65.0, dbz))), 1)

    async def fetch_live_weather(self, lat: float, lng: float) -> WeatherTelemetry:
        """Fetches live meteorological parameters from Open-Meteo API."""
        try:
            params = {
                "latitude": lat,
                "longitude": lng,
                "current": ["temperature_2m", "relative_humidity_2m", "surface_pressure", "wind_speed_10m", "precipitation"],
                "timezone": "auto"
            }
            res = await self.client.get(settings.OPEN_METEO_URL, params=params)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                precip = float(current.get("precipitation", 0.0))
                dbz = self._calculate_radar_dbz(precip)

                return WeatherTelemetry(
                    timestamp=current.get("time", datetime.utcnow().isoformat()),
                    temperature_c=float(current.get("temperature_2m", 28.5)),
                    relative_humidity_pct=float(current.get("relative_humidity_2m", 82.0)),
                    surface_pressure_hpa=float(current.get("surface_pressure", 1008.0)),
                    wind_speed_kmh=float(current.get("wind_speed_10m", 18.0)),
                    precipitation_mm=precip,
                    radar_reflectivity_dbz=dbz,
                    cape_j_kg=1450.0
                )
        except Exception:
            pass

        # Fallback realistic monsoon telemetry
        return self.get_simulated_telemetry(precip_mm=12.5)

    def get_simulated_telemetry(self, precip_mm: float = 45.0, temp: float = 27.5, humidity: float = 88.0) -> WeatherTelemetry:
        dbz = self._calculate_radar_dbz(precip_mm)
        cape = 800.0 + (precip_mm * 28.0) + (humidity * 12.0)
        pressure = 1012.0 - (precip_mm * 0.18)

        return WeatherTelemetry(
            timestamp=datetime.utcnow().isoformat() + "Z",
            temperature_c=round(temp, 1),
            relative_humidity_pct=round(humidity, 1),
            surface_pressure_hpa=round(pressure, 1),
            wind_speed_kmh=round(15.0 + (precip_mm * 0.35), 1),
            precipitation_mm=round(precip_mm, 2),
            radar_reflectivity_dbz=dbz,
            cape_j_kg=round(cape, 1)
        )

weather_service = WeatherService()
