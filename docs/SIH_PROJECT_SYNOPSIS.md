# Smart India Hackathon 2026 — Formal Project Synopsis

## 1. Project Identification
- **Project Title:** AI/ML-Based Integrated Heavy Rainfall Early Warning and Inundation Prediction System
- **Project Codename:** **JalPrahari AI (जल प्रहरी)**
- **Theme / Category:** Disaster Management / Smart Cities / Environmental & Climate Resilience
- **Edition:** Software Edition — SIH 2026
- **Target Stakeholders:** National Disaster Management Authority (NDMA), State Disaster Management Authorities (SDMAs), Municipal Corporations (BMC, GCC, BBMP, MCD), India Meteorological Department (IMD), National Disaster Response Force (NDRF), and Citizens.

---

## 2. Executive Abstract
Urban flash flooding caused by localized cloudbursts and extreme precipitation events is among the most catastrophic climate challenges confronting Indian metropolitan centers. Existing municipal mechanisms rely largely on coarse, city-wide weather forecasts and reactive physical drainage monitoring, failing to pinpoint localized ward-level inundation hours before severe waterlogging paralyzes critical transit arteries.

**JalPrahari AI** bridges this critical gap by delivering an end-to-end, real-time early warning and urban flood prediction platform. The system couples an atmospheric machine learning nowcasting model (trained on Doppler radar reflectivity, convective available potential energy $\text{CAPE}$, and barometric pressure anomalies) with a Digital Elevation Model (DEM) and hydrological runoff simulation engine (utilizing the USDA Soil Conservation Service Curve Number method). 

The platform predicts localized rainfall rates ($1h, 3h, 6h, 24h$), calculates ward-by-ward inundation depth ($0.1m - 3.5m$), maps vulnerable infrastructure and road network chokepoints, and dynamically computes flood-aware evacuation paths using graph-based pathfinding algorithms. Furthermore, a dual-channel citizen SOS and crowdsourced ground-truth portal connects stranded citizens directly with NDRF rescue operations.

---

## 3. Problem Statement & Ground-Truth Challenges
1. **Lack of Hyperlocal Nowcasting:** Synoptic weather models often forecast rainfall across hundreds of square kilometers, failing to capture high-intensity cloudbursts that occur within narrow $5\text{–}10\text{ km}$ convective cells.
2. **Inundation Blindness:** Municipalities lack tools to predict *how many centimeters of water will accumulate in low-lying bowls* (such as Kurla, Hindmata, Velachery, Bellandur, or Minto Bridge) as a function of terrain slope, antecedent soil saturation, and silt-clogged stormwater drains.
3. **Impassable Evacuation Routes:** During severe downpours, navigation apps unaware of road water depth direct ambulances, rescue crafts, and fleeing citizens into flooded underpasses.
4. **Disjointed Emergency Response:** Absence of a synchronized dashboard linking citizen SOS distress calls with real-time flood depth maps for rescue boat dispatch.

---

## 4. Proposed Solution & Core System Modules

### Module 1: Atmospheric AI Nowcasting & IMD Alert Engine
- Continuously ingests meteorological feeds (relative humidity, barometric pressure, wind divergence, radar backscatter $\text{dBZ}$, and $\text{CAPE}$).
- Utilizes ensemble Gradient Boosted Decision Trees and Random Forest regressors to forecast precipitation across $1h, 3h, 6h,$ and $24h$ horizons.
- Automatically generates color-coded advisories following India Meteorological Department standards:
  - **Green:** Normal meteorological state ($<15\text{ mm}$).
  - **Yellow Watch:** Moderate to heavy rainfall ($15\text{–}64.4\text{ mm}$).
  - **Orange Alert:** Very heavy rainfall ($64.5\text{–}115.5\text{ mm}$).
  - **Red Warning:** Extremely heavy downpour / Cloudburst risk ($>115.5\text{ mm}$).

### Module 2: DEM & Hydrological Runoff Inundation Engine
- Models urban surface runoff using the USDA SCS-CN equation:
  $$Q = \frac{(P - I_a)^2}{P - I_a + S}, \quad S = \frac{25400}{CN} - 254$$
- Incorporates Digital Elevation Model (DEM) data, terrain slope ($\theta$), catchment basin boundaries, and municipal drainage throughput capacity ($D_{cap}$) adjusted for silt clogging factor ($\beta_{clog}$):
  $$\text{Net Excess} = \max(0, P_{rate} - D_{cap} \cdot (1 - \beta_{clog}))$$
- Computes inundation depth in meters and centimeters for each urban ward.
- Automatically flags roads with water depth $\ge 0.35\text{ m}$ as impassable for standard vehicular traffic.

### Module 3: Flood-Aware Dynamic Safe Evacuation Router
- Builds an active road network graph using NetworkX.
- Assigns dynamic flood penalty weights to road edges based on predicted water depth.
- Executes Dijkstra / A* pathfinding to navigate emergency convoys and citizens around submerged arteries directly to operational high-ground relief centers.

### Module 4: Citizen SOS & Crowdsourced Ground-Truth Portal
- Trapped citizens can broadcast GPS distress signals with medical emergency flags directly to the Disaster Command Console.
- Citizens can submit geotagged waterlogging reports to validate and calibrate the AI flood model in real-time.

---

## 5. Technology Architecture
- **AI / Machine Learning:** Python 3.12, Scikit-Learn (Random Forest, Gradient Boosting), NumPy, NetworkX.
- **Backend & APIs:** FastAPI, Uvicorn, Pydantic, HTTPX, Asynchronous REST endpoints.
- **GIS & Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet / React-Leaflet, Lucide Icons.
- **Live Data Feeds:** Open-Meteo REST API, Doppler Radar Marshall-Palmer Z-R conversion ($Z = 200 R^{1.6}$).

---

## 6. Social Impact & Government Alignment
1. **Alignment with National Disaster Management Authority (NDMA):** Fulfills early warning mandates under the National Disaster Management Plan.
2. **Integration with Common Alerting Protocol (CAP):** Ready for telecom SMS broadcasts and sirens.
3. **Casualty Prevention & Asset Protection:** Reduces loss of life in chronic urban flood hotspots and saves millions of rupees in infrastructure damage.
4. **Scalability:** The modular architecture allows rapid onboarding of any Indian municipality with DEM elevation data and drainage GIS layers.
