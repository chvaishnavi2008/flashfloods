# AapdaSetu — AI-Powered Multi-Hazard Early Warning & Emergency Response

AapdaSetu is a full-stack disaster risk intelligence platform for predicting flash floods, landslides, extreme cloudbursts, and riverine inundation across vulnerable Himalayan and Western Ghats sectors.

---

## 🚀 Quick Start

### 1. Backend (Python Flask + SQLite)

1. Navigate to the backend directory or project root:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask API server:
   ```bash
   python run.py
   ```
   *The Flask REST API will start at `http://127.0.0.1:5000`.*

---

### 2. Frontend (React + Vite + TailwindCSS + Leaflet)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:3000`.*

---

## 📡 REST API Documentation

### 1. Risk Assessment
- **`POST /api/risk-assessment`**
  Evaluates environmental and geotechnical inputs through the centralized Risk Engine, stores the calculation into SQLite, and returns structured risk indicators.

  **Request Body:**
  ```json
  {
    "location": {
      "name": "Chamoli",
      "latitude": 30.4124,
      "longitude": 79.3198
    },
    "rainfall": 120,
    "soil_moisture": 78,
    "slope": 35,
    "historical_risk": 70
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "risk_assessment": {
      "risk_id": 1,
      "overall_score": 76.62,
      "risk_level": "CRITICAL",
      "dominant_hazard": "landslide",
      "flash_flood_score": 80.0,
      "landslide_score": 81.13,
      "lead_time_minutes": 54,
      "recommended_action": "CRITICAL EMERGENCY: Evacuate low-lying riverbanks and unstable hillsides immediately. Move to designated high-ground safe havens."
    }
  }
  ```

- **`GET /api/risk-assessments`**
  Retrieves the history of recent risk assessments stored in SQLite.

- **`GET /api/risk-assessments/<id>`**
  Retrieves a single historical risk assessment by its ID.

---

### 2. Locations
- **`GET /api/locations`**
  Returns all 31 multi-hazard monitored sectors across India and border zones with current baseline risk levels.

---

### 3. Alerts & Early Warnings
- **`GET /api/alerts`**
  Returns active and historical disaster warnings.

- **`POST /api/alerts`**
  Broadcasts an official early warning or alert triggered from an assessment.

  **Request Body:**
  ```json
  {
    "location": "Chamoli",
    "alert_level": "CRITICAL",
    "hazard": "flash_flood",
    "message": "Immediate evacuation recommended along Alaknanda riverbank.",
    "recommended_action": "Move to Gopeshwar High-Ground Shelter."
  }
  ```

---

## 🧠 Risk Engine & Telemetry Architecture

The centralized risk engine (`backend/services/risk_engine.py`) separates:
1. **INPUT DATA** (Precipitation rate, soil moisture saturation, slope gradient, river capacity, historical vulnerability)
2. **RISK CALCULATION** (Deterministic multi-factor equations for flash flood and landslide susceptibility)
3. **HAZARD CLASSIFICATION** (Low, Moderate, High, Critical)
4. **LEAD TIME PREDICTION** (Time window available for evacuation before peak danger)
5. **ACTIONABLE DIRECTIVES** (Immediate evacuation, shelter routing, and SDMA advisory generation)

*Note: The prototype utilizes simulated and configurable environmental data benchmarks and is architected for seamless drop-in integration with real-time IoT sensors and IMD radar feeds.*
