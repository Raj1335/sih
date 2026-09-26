import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "JalPrahari AI - Heavy Rainfall Early Warning & Inundation Prediction System"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Meteorological Thresholds (IMD Standards mm/24h or mm/h rate equivalent)
    GREEN_THRESHOLD_MM: float = 15.0      # Light rainfall
    YELLOW_THRESHOLD_MM: float = 64.4     # Moderate to Heavy (Watch)
    ORANGE_THRESHOLD_MM: float = 115.5    # Very Heavy (Alert)
    RED_THRESHOLD_MM: float = 204.4       # Extremely Heavy / Cloudburst (Warning)
    
    # Inundation Depth Severity Thresholds (meters)
    INUNDATION_LOW_M: float = 0.15        # Ankle-deep (Passable by vehicles)
    INUNDATION_MODERATE_M: float = 0.40   # Knee-deep (Impassable for small cars)
    INUNDATION_HIGH_M: float = 0.80       # Waist-deep (Requires boat evacuation)
    INUNDATION_CRITICAL_M: float = 1.50   # Submerged ground floors
    
    # Open-Meteo API endpoint
    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"

settings = Settings()
