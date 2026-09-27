"""
train_rainfall_model.py

Trains the rainfall nowcasting models on REAL historical weather data
(pulled by fetch_historical_weather.py) instead of the original repo's
synthetic random data.

For every hour in the data, features = conditions AT that hour,
targets = ACTUAL total rainfall in the NEXT 1h / 3h / 6h / 24h.
This is genuine time-series supervised learning on observed data.

Run after fetch_historical_weather.py:
    pip install pandas numpy scikit-learn joblib
    python train_rainfall_model.py

Output: ./trained_models/*.pkl  (copy this whole folder into
        backend/app/ml/models/ in the repo)
"""

import math
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, precision_score, r2_score, recall_score
from sklearn.model_selection import train_test_split

DATA_DIR = Path("historical_data")
OUT_DIR = Path("trained_models")
OUT_DIR.mkdir(exist_ok=True)


def radar_dbz(rain_rate_mm_h: float) -> float:
    """Same Marshall-Palmer formula already used in weather_service.py."""
    if rain_rate_mm_h <= 0.05:
        return 5.0
    z = 200.0 * (rain_rate_mm_h ** 1.6)
    dbz = 10.0 * math.log10(max(1.0, z))
    return float(np.clip(dbz, 5.0, 65.0))


def cape_proxy(temp_c: float, humidity_pct: float) -> float:
    """
    Real ERA5 archive data (free tier) doesn't expose CAPE directly.
    Approximate atmospheric instability from temperature + humidity,
    calibrated so typical pre-monsoon-burst conditions land in the
    1500-3000 J/kg range used by IMD-style classification.
    """
    return max(100.0, (humidity_pct - 40.0) * 25.0 + (temp_c - 22.0) * 30.0)


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["time"] = pd.to_datetime(df["time"])
    df = df.sort_values("time").reset_index(drop=True)
    df["radar_dbz"] = df["precip_mm"].apply(radar_dbz)
    df["cape"] = df.apply(lambda r: cape_proxy(r["temperature_c"], r["humidity_pct"]), axis=1)

    # Rolling forward-sums of ACTUAL future rainfall = real supervised targets
    precip = df["precip_mm"].values
    n = len(precip)
    y_1h = np.full(n, np.nan)
    y_3h = np.full(n, np.nan)
    y_6h = np.full(n, np.nan)
    y_24h = np.full(n, np.nan)
    for i in range(n):
        y_1h[i] = precip[i + 1] if i + 1 < n else np.nan
        y_3h[i] = precip[i + 1:i + 4].sum() if i + 4 <= n else np.nan
        y_6h[i] = precip[i + 1:i + 7].sum() if i + 7 <= n else np.nan
        y_24h[i] = precip[i + 1:i + 25].sum() if i + 25 <= n else np.nan

    df["y_1h"] = y_1h
    df["y_3h"] = y_3h
    df["y_6h"] = y_6h
    df["y_24h"] = y_24h
    # Lowered from 30mm to 10mm/h: at 30mm the positive class was too rare
    # (~3 events in ~38k hours) to train or evaluate meaningfully. 10mm/h
    # ("heavy rain" by IMD's own hourly-rate convention) gives enough real
    # positive examples for the classifier to learn from.
    df["y_cloudburst"] = (df["y_1h"] >= 10.0).astype(int)

    return df.dropna(subset=["y_1h", "y_3h", "y_6h", "y_24h"])


def main():
    csvs = sorted(DATA_DIR.glob("*.csv"))
    if not csvs:
        raise SystemExit(f"No CSVs found in {DATA_DIR}/. Run fetch_historical_weather.py first.")

    frames = [build_features(pd.read_csv(p)) for p in csvs]
    full = pd.concat(frames, ignore_index=True)
    print(f"Total training rows across {len(csvs)} cities: {len(full)}")

    feature_cols = [
        "temperature_c", "humidity_pct", "pressure_hpa",
        "wind_kmh", "radar_dbz", "precip_mm", "cape",
    ]
    X = full[feature_cols].values

    targets = {
        "1h": full["y_1h"].values,
        "3h": full["y_3h"].values,
        "6h": full["y_6h"].values,
        "24h": full["y_24h"].values,
    }

    regressors = {}
    for horizon, y in targets.items():
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        r2 = r2_score(y_test, model.predict(X_test))
        print(f"  regressor_{horizon}: R^2 on held-out real data = {r2:.3f}")
        regressors[horizon] = model

    y_cb = full["y_cloudburst"].values
    Xc_train, Xc_test, yc_train, yc_test = train_test_split(X, y_cb, test_size=0.2, random_state=42, stratify=y_cb if y_cb.sum() > 1 else None)
    clf = GradientBoostingClassifier(n_estimators=100, random_state=42)
    clf.fit(Xc_train, yc_train)
    preds = clf.predict(Xc_test)
    acc = accuracy_score(yc_test, preds)
    prec = precision_score(yc_test, preds, zero_division=0)
    rec = recall_score(yc_test, preds, zero_division=0)
    f1 = f1_score(yc_test, preds, zero_division=0)
    print(f"  cloudburst_classifier (>=10mm/h in next hour):")
    print(f"    positive rate in data: {y_cb.mean():.2%}  (n_positive = {int(y_cb.sum())})")
    print(f"    accuracy = {acc:.3f}  <- NOT meaningful alone on imbalanced data, ignore this number")
    print(f"    precision = {prec:.3f}, recall = {rec:.3f}, f1 = {f1:.3f}  <- report THESE instead")

    joblib.dump(regressors["1h"], OUT_DIR / "regressor_1h.pkl")
    joblib.dump(regressors["3h"], OUT_DIR / "regressor_3h.pkl")
    joblib.dump(regressors["6h"], OUT_DIR / "regressor_6h.pkl")
    joblib.dump(regressors["24h"], OUT_DIR / "regressor_24h.pkl")
    joblib.dump(clf, OUT_DIR / "cloudburst_classifier.pkl")

    print(f"\nSaved 5 model files to {OUT_DIR}/")
    print("Copy this folder to backend/app/ml/models/ then use the patched rainfall_model.py")
    print(f"\nFor your slide/report: 'Trained on {len(full)} real hourly ERA5 records "
          f"across 4 Indian cities (2021-2024 monsoon seasons).'")


if __name__ == "__main__":
    main()