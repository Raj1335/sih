# SIH 2026 Pitch Deck Guide & Jury Demonstration Script

## 1. 10-Slide Pitch Deck Structure (7-Minute Presentation)

### Slide 1: Title & Hook (0:00 - 0:30)
- **Title:** JalPrahari AI (जल प्रहरी) — AI/ML-Based Heavy Rainfall Early Warning and Inundation Prediction System
- **Hook:** *"Every monsoon, Indian cities come to a standstill. In 2023, urban flash floods caused over ₹15,000 Crores in economic losses and claimed hundreds of lives. Why? Because existing weather models tell you THAT it will rain, but cannot tell you WHERE 1.5 meters of water will submerge roads 4 hours in advance. Today, we present JalPrahari AI."*

### Slide 2: The Problem & Gap Analysis (0:30 - 1:15)
- Synoptic 50km resolution forecasts miss 5km cloudburst cells.
- Topographical blind spots: Drainage silt blockage + low elevation depression bowls = flash inundation.
- Navigation blind spots: Google Maps directs emergency ambulances into 1-meter deep flooded underpasses.

### Slide 3: The Solution — 4 Integrated Pillars (1:15 - 2:00)
- Pillar 1: Atmospheric ML Nowcasting (1h, 3h, 6h, 24h) with IMD Color Alerts.
- Pillar 2: Digital Elevation Model (DEM) & SCS-CN Hydrological Inundation Engine.
- Pillar 3: Dynamic Flood-Aware Evacuation Routing (Dijkstra graph avoidance).
- Pillar 4: Citizen SOS Distress Beacon & Crowdsourced Ground Validation.

### Slide 4: System Architecture & Data Flow (2:00 - 2:45)
- Real-time weather APIs + Doppler Radar dBZ conversion.
- FastAPI asynchronous backend + Scikit-Learn AI inference core.
- Interactive Leaflet GIS dashboard with dynamic flood contours.

### Slide 5: Mathematical & Scientific Rigor (2:45 - 3:30)
- Marshall-Palmer Radar Equation: $Z = 200 R^{1.6}$.
- USDA SCS-CN Runoff Equation: $Q = \frac{(P - I_a)^2}{P - I_a + S}$.
- Topographical depression stagnation with Manning's roughness.

### Slide 6: LIVE PROTOTYPE DEMONSTRATION (3:30 - 5:30)
- *(Execute the live demo script detailed in Section 2 below)*

### Slide 7: Social Impact & Beneficiaries (5:30 - 6:00)
- Zero-casualty target in urban underpasses and low-lying slums.
- Optimized municipal dewatering pump placement 3 hours prior to peak storm.
- Faster NDRF rescue deployment with prioritized GPS beacons.

### Slide 8: Feasibility, Scalability & Government Integration (6:00 - 6:30)
- Direct integration with NDMA / SDMA disaster command rooms.
- Common Alerting Protocol (CAP) for automated telecom SMS alerts.
- Scalable to any tier-1 or tier-2 Indian city with GIS DEM shapefiles.

### Slide 9: Competitive Advantage / Innovation Matrix (6:30 - 6:50)
- Table comparing JalPrahari vs IMD standard website vs Google Maps vs commercial weather apps.

### Slide 10: Conclusion & Call to Action (6:50 - 7:00)
- Summary: From reactive disaster cleanup to proactive AI early warning and life preservation.

---

## 2. 5-Minute Live Interactive Demo Script for Hackathon Jury

1. **Step 1: Open the Main GIS Dashboard**
   - Show the selected city (e.g. *Mumbai - Mithi Catchment*).
   - Point out the **AI Early Warning Card** displaying current IMD alerts, atmospheric pressure, humidity, and Doppler radar reflectivity ($15\text{ dBZ}$ - Green Alert).

2. **Step 2: Launch the Cloudburst Simulator**
   - Click the **"Simulate (75mm/h)"** button at the top.
   - Tell the judges: *"Now let's simulate a sudden 145mm/h cloudburst event over Mumbai."*
   - Select the preset **"Mumbai Severe Urban Cloudburst"** or drag the rainfall slider to $145\text{ mm/h}$.
   - Click **"Run Inundation Simulation"**.

3. **Step 3: Observe Instant Real-Time Reaction**
   - Show how the Early Warning Panel instantly turns to a pulsing **RED ALERT** with a $85\%$ cloudburst probability warning.
   - Show the interactive GIS Map: low-lying wards (Kurla, Hindmata, Milan Subway) immediately bloom into red/orange circles indicating $>1.2\text{m}$ water depth.
   - Click a flooded ward on the map to display its popup showing water depth in meters/cm, elevation above sea level, drainage capacity, and affected critical hospitals/metro lines.

4. **Step 4: Demonstrate Flood-Aware Evacuation Routing**
   - Click **"Route Evacuation From Here"** inside the Kurla popup or switch to the **"Evac Routes"** tab.
   - Click **"Find Safe Evacuation Route"**.
   - Show the judges: *"Notice how our algorithm bypassed the submerged arterial highway and safely rerouted through high-ground bypasses directly to the MMRDA High Ground Relief Haven, avoiding 2 flooded chokepoints."*

5. **Step 5: Trigger a Citizen SOS Distress Beacon**
   - Click **"SOS / Citizen Portal"**.
   - Fill in an emergency distress request (e.g. *"Elderly patient needing oxygen in flooded ground floor, Waist-Deep water"*).
   - Click **"Broadcast Emergency SOS"**.
   - Show the instant SOS marker appearing on the map and in the live **Disaster Command Queue**, and click **"Dispatch NDRF Boat"**.

6. **Step 6: Show Ward Analytics & SIH Synopsis**
   - Switch to **"Ward Analytics"** and **"SIH Synopsis"** to show the judges the comprehensive documentation, math formulas, and ward vulnerability breakdown table.

---

## 3. Top Expected Jury Questions & Winning Answers

- **Q1: Where do you get the elevation and drainage data in real life?**
  - *Answer:* "We integrate with NRSC (National Remote Sensing Centre) Cartosat $10\text{m}$ Digital Elevation Models (DEM) and municipal GIS shapefiles for stormwater drainage networks (published under Smart Cities Open Data portals)."

- **Q2: How accurate is your Nowcasting model compared to physical numerical weather models?**
  - *Answer:* "Numerical Weather Prediction (NWP) models like WRF require 3–6 hours of compute time on supercomputers. Our AI nowcaster acts on real-time Doppler radar reflectivity and atmospheric instability indices to generate millisecond predictions over short $1\text{–}6$ hour lead times when fast action is crucial."

- **Q3: How does the system handle offline situations when mobile networks fail during a flood?**
  - *Answer:* "Our backend is designed for edge deployment on municipal command servers with local LoRaWAN IoT mesh networks for sensor telemetry and VHF radio broadcast gateways for emergency responder routing."
