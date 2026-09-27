import math
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from app.schemas import WeatherTelemetry
from app.ml.rainfall_model import rainfall_nowcaster

HISTORICAL_DIR = Path(__file__).parent.parent / "data" / "historical"


def _radar_dbz(rain_rate_mm_h: float) -> float:
    """Same Marshall-Palmer formula used across the app for consistency."""
    if rain_rate_mm_h <= 0.05:
        return 5.0
    z = 200.0 * (rain_rate_mm_h ** 1.6)
    dbz = 10.0 * math.log10(max(1.0, z))
    return float(np.clip(dbz, 5.0, 65.0))


def _cape_proxy(temp_c: float, humidity_pct: float) -> float:
    """Same proxy used in train_rainfall_model.py, for feature consistency."""
    return max(100.0, (humidity_pct - 40.0) * 25.0 + (temp_c - 22.0) * 30.0)


class HistoricalReplayService:
    """
    Replays REAL historical weather data (the same ERA5 data used for
    training) through the live model, hour by hour, so a real vs.
    predicted comparison can be shown for a documented date - instead of
    a fabricated 'validated against satellite flood extent' claim.
    """

    def __init__(self):
        self._cache: Dict[str, pd.DataFrame] = {}

    def _load_city(self, city_id: str) -> Optional[pd.DataFrame]:
        if city_id in self._cache:
            return self._cache[city_id]
        path = HISTORICAL_DIR / f"{city_id}.csv"
        if not path.exists():
            return None
        df = pd.read_csv(path)
        df["time"] = pd.to_datetime(df["time"])
        df = df.sort_values("time").reset_index(drop=True)
        self._cache[city_id] = df
        return df

    def get_available_events(self) -> List[Dict]:
        """Returns cities with data available and their date range, plus a
        few notable high-rainfall days worth pointing a judge/demo at."""
        events = []
        if not HISTORICAL_DIR.exists():
            return events
        for csv_path in sorted(HISTORICAL_DIR.glob("*.csv")):
            city_id = csv_path.stem
            df = self._load_city(city_id)
            if df is None or df.empty:
                continue
            daily_totals = df.groupby(df["time"].dt.date)["precip_mm"].sum()
            top_days = daily_totals.sort_values(ascending=False).head(3)
            events.append({
                "city_id": city_id,
                "available_from": str(df["time"].min().date()),
                "available_to": str(df["time"].max().date()),
                "notable_high_rainfall_days": [
                    {"date": str(d), "total_rainfall_mm": round(float(v), 1)}
                    for d, v in top_days.items()
                ],
            })
        return events

    def replay_day(self, city_id: str, date_str: str) -> Optional[Dict]:
        """
        For every real hour on the given date: builds the telemetry the
        model would have seen at that hour, runs the real trained model,
        and compares its 1h-ahead forecast to what ACTUALLY happened in
        the historical record.
        """
        df = self._load_city(city_id)
        if df is None:
            return None

        day_df = df[df["time"].dt.date.astype(str) == date_str].reset_index(drop=True)
        if day_df.empty:
            return None

        points = []
        abs_errors = []

        for i in range(len(day_df) - 1):  # need i+1 for the "actual next hour"
            row = day_df.iloc[i]
            actual_next_hour = float(day_df.iloc[i + 1]["precip_mm"])

            telemetry = WeatherTelemetry(
                timestamp=row["time"].isoformat(),
                temperature_c=float(row["temperature_c"]),
                relative_humidity_pct=float(row["humidity_pct"]),
                surface_pressure_hpa=float(row["pressure_hpa"]),
                wind_speed_kmh=float(row["wind_kmh"]),
                precipitation_mm=float(row["precip_mm"]),
                radar_reflectivity_dbz=_radar_dbz(float(row["precip_mm"])),
                cape_j_kg=_cape_proxy(float(row["temperature_c"]), float(row["humidity_pct"])),
            )

            prediction = rainfall_nowcaster.predict(telemetry)
            error = abs(prediction.forecast_1h_mm - actual_next_hour)
            abs_errors.append(error)

            points.append({
                "time": row["time"].strftime("%H:%M"),
                "actual_precip_mm": round(float(row["precip_mm"]), 1),
                "actual_next_hour_mm": round(actual_next_hour, 1),
                "predicted_next_hour_mm": round(prediction.forecast_1h_mm, 1),
                "predicted_alert_level": prediction.alert_level,
                "cloudburst_probability_pct": prediction.cloudburst_probability_pct,
            })

        mae = round(float(np.mean(abs_errors)), 2) if abs_errors else None
        total_actual_rainfall = round(float(day_df["precip_mm"].sum()), 1)

        return {
            "city_id": city_id,
            "date": date_str,
            "total_actual_rainfall_mm": total_actual_rainfall,
            "mean_absolute_error_mm": mae,
            "hours_replayed": len(points),
            "points": points,
        }


historical_replay_service = HistoricalReplayService()