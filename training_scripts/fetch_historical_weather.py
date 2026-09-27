"""
fetch_historical_weather.py

Pulls REAL hourly historical weather data (ERA5 reanalysis, free, no API key)
from the Open-Meteo Archive API for the four JalPrahari cities, covering
monsoon months across multiple years. Saves one CSV per city.

Run this once on your machine (needs internet):
    pip install requests
    python fetch_historical_weather.py

Output: ./historical_data/<city_id>.csv
Each row = one hour of real observed weather at that city's center coordinates.
"""

import csv
import time
from pathlib import Path
import requests

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

# Must match center_lat/center_lng in backend/app/data/city_profiles.json
CITIES = {
    "mumbai":    (19.0760, 72.8777),
    "chennai":   (13.0827, 80.2707),
    "bengaluru": (12.9716, 77.5946),
    "delhi":     (28.6139, 77.2090),
}

# Monsoon-heavy windows (India: roughly June-September) across recent years.
# Kept short per city to stay well within Open-Meteo's free, keyless usage.
DATE_RANGES = [
    ("2021-06-01", "2021-09-30"),
    ("2022-06-01", "2022-09-30"),
    ("2023-06-01", "2023-09-30"),
    ("2024-06-01", "2024-09-30"),
]

HOURLY_VARS = [
    "temperature_2m",
    "relative_humidity_2m",
    "surface_pressure",
    "wind_speed_10m",
    "precipitation",
]

OUT_DIR = Path("historical_data")
OUT_DIR.mkdir(exist_ok=True)


def fetch_range(lat: float, lng: float, start: str, end: str) -> dict:
    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": start,
        "end_date": end,
        "hourly": ",".join(HOURLY_VARS),
        "timezone": "Asia/Kolkata",
    }
    resp = requests.get(ARCHIVE_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()["hourly"]


def main():
    for city_id, (lat, lng) in CITIES.items():
        print(f"[{city_id}] fetching {len(DATE_RANGES)} monsoon windows...")
        rows = []
        for start, end in DATE_RANGES:
            try:
                data = fetch_range(lat, lng, start, end)
            except requests.RequestException as e:
                print(f"  ! failed {start}..{end}: {e}")
                continue

            times = data["time"]
            for i in range(len(times)):
                rows.append({
                    "time": times[i],
                    "temperature_c": data["temperature_2m"][i],
                    "humidity_pct": data["relative_humidity_2m"][i],
                    "pressure_hpa": data["surface_pressure"][i],
                    "wind_kmh": data["wind_speed_10m"][i],
                    "precip_mm": data["precipitation"][i],
                })
            time.sleep(1)  # be polite to the free API

        out_path = OUT_DIR / f"{city_id}.csv"
        with open(out_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        print(f"  -> saved {len(rows)} hourly records to {out_path}")

    print("\nDone. Next: run train_rainfall_model.py")


if __name__ == "__main__":
    main()
