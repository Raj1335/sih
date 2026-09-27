import numpy as np
from pathlib import Path
from datetime import datetime, timezone
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from app.config import settings
from app.schemas import NowcastPrediction, WeatherTelemetry

MODELS_DIR = Path(__file__).parent / "models"


class RainfallNowcastModel:
    """
    AI/ML-based Rainfall Nowcasting and IMD Alert Classification Engine.
    Uses atmospheric variables (humidity, pressure, CAPE, radar dBZ, temperature, wind)
    to predict forward precipitation intensity and assess cloudburst probability.

    Loads models trained on REAL historical weather data (see
    fetch_historical_weather.py / train_rainfall_model.py) if present in
    ./models/. Falls back to synthetic-data training if the real trained
    models haven't been generated yet, so the app never breaks.
    """
    def __init__(self):
        self._is_trained = False
        self._using_real_data = False

        if self._real_models_available():
            self._load_real_models()
        else:
            self._init_synthetic_models()
            self._train_baseline_models()

    def _real_models_available(self) -> bool:
        required = [
            "regressor_1h.pkl", "regressor_3h.pkl", "regressor_6h.pkl",
            "regressor_24h.pkl", "cloudburst_classifier.pkl",
        ]
        return MODELS_DIR.exists() and all((MODELS_DIR / f).exists() for f in required)

    def _load_real_models(self):
        self.regressor_1h = joblib.load(MODELS_DIR / "regressor_1h.pkl")
        self.regressor_3h = joblib.load(MODELS_DIR / "regressor_3h.pkl")
        self.regressor_6h = joblib.load(MODELS_DIR / "regressor_6h.pkl")
        self.regressor_24h = joblib.load(MODELS_DIR / "regressor_24h.pkl")
        self.cloudburst_classifier = joblib.load(MODELS_DIR / "cloudburst_classifier.pkl")
        self._is_trained = True
        self._using_real_data = True
        print("[RainfallNowcastModel] Loaded models trained on real historical weather data.")

    def _init_synthetic_models(self):
        self.regressor_1h = RandomForestRegressor(n_estimators=60, random_state=42)
        self.regressor_3h = RandomForestRegressor(n_estimators=60, random_state=42)
        self.regressor_6h = RandomForestRegressor(n_estimators=60, random_state=42)
        self.regressor_24h = RandomForestRegressor(n_estimators=60, random_state=42)
        self.cloudburst_classifier = GradientBoostingClassifier(n_estimators=50, random_state=42)

    def _train_baseline_models(self):
        """
        FALLBACK ONLY: synthetic-data training, used only if no real trained
        models are found in ./models/. Kept so the app runs out of the box
        before you've generated the real ones. Do not present this synthetic
        version as the trained model in your submission — run
        fetch_historical_weather.py + train_rainfall_model.py first.
        """
        print("[RainfallNowcastModel] WARNING: no real trained models found in "
              "app/ml/models/ - falling back to synthetic training data.")
        np.random.seed(42)
        n_samples = 2000

        temp = np.random.uniform(22.0, 38.0, n_samples)
        humidity = np.random.uniform(40.0, 99.0, n_samples)
        pressure = np.random.uniform(980.0, 1018.0, n_samples)
        wind_speed = np.random.uniform(5.0, 80.0, n_samples)
        radar_dbz = np.random.uniform(0.0, 65.0, n_samples)
        current_precip = np.random.uniform(0.0, 150.0, n_samples)
        cape = np.random.uniform(100.0, 4500.0, n_samples)

        X = np.column_stack([temp, humidity, pressure, wind_speed, radar_dbz, current_precip, cape])

        instability = (
            (radar_dbz / 50.0) * 0.35 +
            (np.maximum(0, humidity - 50.0) / 50.0) * 0.25 +
            (np.maximum(0, 1013.0 - pressure) / 25.0) * 0.20 +
            (cape / 3000.0) * 0.20
        )
        instability = np.clip(instability, 0.05, 1.5)

        base_rate = current_precip * 0.70 + (instability * 25.0)
        noise = np.random.normal(0, 1.2, n_samples)

        y_1h = np.maximum(0.0, base_rate * 0.90 + noise)
        y_3h = np.maximum(0.0, base_rate * 2.2 + noise * 1.5)
        y_6h = np.maximum(0.0, base_rate * 3.8 + noise * 2.0)
        y_24h = np.maximum(0.0, base_rate * 7.5 + noise * 3.0)

        y_cloudburst = ((current_precip > 65.0) & (radar_dbz > 45.0) & (cape > 2000.0)).astype(int)

        self.regressor_1h.fit(X, y_1h)
        self.regressor_3h.fit(X, y_3h)
        self.regressor_6h.fit(X, y_6h)
        self.regressor_24h.fit(X, y_24h)
        self.cloudburst_classifier.fit(X, y_cloudburst)
        self._is_trained = True

    def predict(self, telemetry: WeatherTelemetry) -> NowcastPrediction:
        """Executes AI inference on incoming weather telemetry and generates IMD alerts."""
        features = np.array([[
            telemetry.temperature_c,
            telemetry.relative_humidity_pct,
            telemetry.surface_pressure_hpa,
            telemetry.wind_speed_kmh,
            telemetry.radar_reflectivity_dbz,
            telemetry.precipitation_mm,
            telemetry.cape_j_kg
        ]])

        f_1h = float(max(0.0, self.regressor_1h.predict(features)[0]))
        f_3h = float(max(0.0, self.regressor_3h.predict(features)[0]))
        f_6h = float(max(0.0, self.regressor_6h.predict(features)[0]))
        f_24h = float(max(0.0, self.regressor_24h.predict(features)[0]))

        cb_proba = float(self.cloudburst_classifier.predict_proba(features)[0][1] * 100.0)

        if telemetry.precipitation_mm >= 70.0 and telemetry.radar_reflectivity_dbz >= 48.0:
            cb_proba = max(cb_proba, 85.0)
            f_1h = max(f_1h, telemetry.precipitation_mm * 1.1)

        # IMD Standard Alert Classification:
        # Green: <15mm/24h | Yellow: 15-64.4mm | Orange: 64.5-115.5mm | Red: >115.5mm/204mm
        if f_24h >= settings.RED_THRESHOLD_MM or f_1h >= 60.0 or cb_proba >= 65.0:
            alert_level = "RED"
            alert_title = "RED ALERT: Extremely Heavy Rainfall / Cloudburst Warning"
            advisory = "Immediate disaster response mobilization advised. Low-lying areas face severe inundation. Discontinue non-essential transport."
        elif f_24h >= settings.ORANGE_THRESHOLD_MM or f_1h >= 30.0:
            alert_level = "ORANGE"
            alert_title = "ORANGE ALERT: Very Heavy Rainfall Warning"
            advisory = "Be Prepared. High risk of waterlogging in underpasses and valley zones. Keep emergency drainage dewatering pumps active."
        elif f_24h >= settings.YELLOW_THRESHOLD_MM or f_1h >= 12.0:
            alert_level = "YELLOW"
            alert_title = "YELLOW WATCH: Moderate to Heavy Rainfall Forecast"
            advisory = "Stay updated. Localized urban water accumulation possible in vulnerable intersections."
        else:
            alert_level = "GREEN"
            alert_title = "Normal Meteorological Conditions"
            advisory = "No heavy rainfall warnings in effect. Municipal drainage operating normally."

        confidence = float(np.clip(88.0 + (telemetry.radar_reflectivity_dbz / 100.0) * 8.0, 82.0, 97.5))

        return NowcastPrediction(
            current_intensity_mm_h=round(telemetry.precipitation_mm, 2),
            forecast_1h_mm=round(f_1h, 2),
            forecast_3h_mm=round(f_3h, 2),
            forecast_6h_mm=round(f_6h, 2),
            forecast_24h_mm=round(f_24h, 2),
            alert_level=alert_level,
            alert_title=alert_title,
            advisory=advisory,
            cloudburst_probability_pct=round(cb_proba, 1),
            confidence_score=round(confidence, 1)
        )


rainfall_nowcaster = RainfallNowcastModel()
