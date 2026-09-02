# PralayWatch — Phase 1 Backend

> **AI-Powered Multi-Hazard Early Warning & Risk Intelligence System**  
> *Phase 1: Database & Data Modeling → Sensors & Telemetry Ingestion → Transparent Baseline Risk Engine → REST API*

---

## 📌 Overview

**PralayWatch** is an early warning system designed for vulnerable mountain valleys, river basins, and landslide corridors across India (Himachal Pradesh, Uttarakhand, Sikkim, Assam, Meghalaya).

Phase 1 establishes the foundational backend architecture:
1. **Flask Application Factory** with modular Blueprints and CORS support.
2. **SQLAlchemy Data Models**: `Location`, `Sensor`, and `Risk`.
3. **Transparent Baseline Risk Engine**: Deterministic weighted mathematical formulas (no black-box ML in Phase 1) evaluating normalized inputs (0–100) for Flash Floods and Landslides.
4. **REST API**: Clean JSON endpoints for system health, locations, live sensor telemetry, and risk evaluation.
5. **Pre-configured Seed Dataset**: 14 high-risk demo locations across 5 Indian states.

---

## 🏗️ Project Structure

```
pralaywatch-backend/
├── app/
│   ├── __init__.py          # Flask application factory, CORS, error handlers
│   ├── config.py            # PostgreSQL & SQLite configuration classes
│   ├── models/
│   │   ├── __init__.py      # Models export
│   │   ├── base.py          # Shared SQLAlchemy db instance
│   │   ├── location.py      # Location geospatial & susceptibility model
│   │   ├── sensor.py        # Sensor telemetry model
│   │   └── risk.py          # Risk evaluation model
│   ├── routes/
│   │   ├── __init__.py      # API Blueprint & /api/health endpoint
│   │   ├── locations.py     # /api/locations routes
│   │   ├── sensors.py       # /api/sensors routes
│   │   └── risk.py          # /api/risk routes
│   └── services/
│       ├── __init__.py      # Services export
│       └── risk_engine.py   # Transparent weighted risk calculation engine
├── tests/
│   ├── test_api.py          # Automated unit test suite
│   └── verify_live_server.py # Live HTTP server integration tests
├── seed.py                  # Database seeder with sample demo data
├── run.py                   # Server startup script with auto-seeding
├── requirements.txt         # Minimal production & development dependencies
├── .env                     # Local environment configuration
├── .env.example             # Environment template
└── README.md                # Documentation
```

---

## ⚙️ Tech Stack

- **Language:** Python 3.10+
- **Framework:** Flask 3.1.x
- **ORM:** Flask-SQLAlchemy 3.1.x / SQLAlchemy 2.0
- **CORS:** Flask-CORS 6.0.x
- **Config:** python-dotenv 1.2.x
- **Database:** SQLite (Local Development) / PostgreSQL (Production Compatible)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher installed on your system.

### 2. Create Virtual Environment
```bash
# Navigate to backend directory
cd pralaywatch-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
.\venv\Scripts\activate.bat
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` (or customize `.env`):
```bash
# .env is pre-configured with defaults:
FLASK_APP=run.py
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=pralaywatch-secret-key-phase1-demo
DATABASE_URL=sqlite:///pralaywatch.db
PORT=5000
HOST=0.0.0.0
CORS_ORIGINS=*
```

### 5. Seed the Database
Populate 14 sample locations across HP, UK, Sikkim, Assam, and Meghalaya:
```bash
python seed.py
```
*(To force re-seeding and reset tables, use `python seed.py --force`)*

### 6. Run the Server
```bash
python run.py
```
The server will start at: `http://localhost:5000`

---

## 🧪 Running Automated Tests

Run the complete test suite (10 unit & integration tests):
```bash
python -m unittest discover tests
```

Run live HTTP server verification:
```bash
python tests/verify_live_server.py
```

---

## 📊 Transparent Baseline Risk Engine

In Phase 1, the risk engine is a **transparent, deterministic weighted formula** (no black-box machine learning).

### Input Normalization (0–100 Scale):
- **Rainfall ($R$):** $0 \text{ mm/h} \to 0$, $15 \text{ mm/h (Moderate)} \to 25$, $65 \text{ mm/h (Heavy)} \to 60$, $\ge 100 \text{ mm/h (Cloudburst)} \to 100$.
- **Soil Moisture ($M$):** $0\% - 100\%$ saturation.
- **River Level ($H$):** $0\text{m} - 1.5\text{m} \to 0-25$, $1.5\text{m}-3.5\text{m} \to 25-50$, $3.5\text{m}-5.0\text{m} \to 50-75$, $\ge 6.0\text{m} \to 75-100$.
- **Terrain Slope ($S$):** Normalized $0-45^\circ \to 0-100$.
- **Baseline Susceptibility ($K$):** Normalized $0-100$.

### Multi-Hazard Formulas:

$$\text{Flash Flood Score} = 0.35 R + 0.25 M + 0.20 H + 0.10 S + 0.10 K_{flood}$$

$$\text{Landslide Score} = 0.35 M + 0.25 R + 0.25 S + 0.15 K_{landslide}$$

$$\text{Overall Score} = 0.75 \times \max(\text{Flood}, \text{Landslide}) + 0.25 \times \min(\text{Flood}, \text{Landslide})$$

### Standardized Threat Levels:
| Score Range | Severity Level | Actionable Evacuation Lead Time |
| :--- | :--- | :--- |
| **0 – 25** | `LOW` | $> 360 \text{ minutes}$ (Nominal Monitoring) |
| **26 – 50** | `MODERATE` | $120 – 360 \text{ minutes}$ (Watch & Prepare) |
| **51 – 75** | `HIGH` | $45 – 120 \text{ minutes}$ (High Alert / Stage Response) |
| **76 – 100** | `CRITICAL` | $15 – 45 \text{ minutes}$ (Immediate Evacuation) |

---

## 📡 REST API Reference

### 1. Health Check
`GET /api/health`

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "PralayWatch Multi-Hazard Early Warning Backend",
  "phase": 1,
  "version": "1.0.0",
  "timestamp": "2026-09-01T13:45:00.000000Z",
  "database": {
    "status": "connected",
    "locations_count": 14,
    "sensors_count": 70,
    "risks_count": 14
  },
  "risk_engine": {
    "type": "Deterministic Weighted Formula (Phase 1 Baseline)",
    "ml_status": "Disabled (Planned Phase 2)",
    "active_hazard_models": ["flash_flood", "landslide", "composite_overall"]
  }
}
```

---

### 2. Get All Locations
`GET /api/locations`  
*Optional Filters:* `?state=Uttarakhand`, `?district=Chamoli`, `?risk_level=CRITICAL`

**Response `200 OK`:**
```json
{
  "success": true,
  "count": 14,
  "locations": [
    {
      "id": 1,
      "state": "Himachal Pradesh",
      "district": "Kullu",
      "village": "Manali (Beas Basin)",
      "name": "Manali (Beas Basin), Kullu",
      "latitude": 32.2432,
      "longitude": 77.1892,
      "elevation": 2050.0,
      "slope": 32.0,
      "flood_susceptibility": 0.75,
      "landslide_susceptibility": 0.65,
      "latest_risk": {
        "id": 1,
        "flash_flood_score": 71.95,
        "landslide_score": 71.58,
        "overall_score": 71.86,
        "risk_level": "HIGH",
        "lead_time_minutes": 54,
        "created_at": "2026-09-01T13:40:00.000000Z"
      }
    }
  ]
}
```

---

### 3. Get Single Location Detail
`GET /api/locations/<id>`

**Response `200 OK`:**
```json
{
  "success": true,
  "location": {
    "id": 4,
    "state": "Uttarakhand",
    "district": "Chamoli",
    "village": "Joshimath (Sunil Ward)",
    "name": "Joshimath (Sunil Ward), Chamoli",
    "latitude": 30.5539,
    "longitude": 79.5658,
    "elevation": 1875.0,
    "slope": 36.0,
    "sensors": [
      {
        "id": 16,
        "sensor_type": "rainfall",
        "value": 62.0,
        "unit": "mm/h",
        "status": "ACTIVE"
      },
      {
        "id": 17,
        "sensor_type": "soil_moisture",
        "value": 88.5,
        "unit": "%",
        "status": "CRITICAL"
      }
    ],
    "latest_risk": {
      "overall_score": 77.58,
      "risk_level": "CRITICAL",
      "lead_time_minutes": 43
    }
  }
}
```

---

### 4. Get Location Risk Assessment
`GET /api/risk/<location_id>`  
*Optional:* `?recalculate=true` (forces live re-evaluation against current sensor readings)

**Response `200 OK`:**
```json
{
  "success": true,
  "risk_assessment": {
    "risk_id": 5,
    "flash_flood_score": 93.68,
    "landslide_score": 86.85,
    "overall_score": 91.97,
    "risk_level": "CRITICAL",
    "lead_time_minutes": 25,
    "dominant_hazard": "flash_flood",
    "recommended_action": "IMMEDIATE EVACUATION: Move to designated high-ground shelters. Avoid river banks, culverts, and bridges.",
    "contributing_factors": [
      "Torrential Rainfall Intensity (94.0 mm/h, Norm: 93.1)",
      "Severe Soil Pore Pressure Saturation (84.0%, Norm: 84.0)",
      "High River Stage (5.8m, Norm: 95.0)",
      "Steep Unstable Terrain Gradient (34.0°, Norm: 70.7)"
    ],
    "normalized_inputs": {
      "rainfall": 93.14,
      "soil_moisture": 84.0,
      "river_level": 95.0,
      "slope": 70.67,
      "flood_susceptibility": 85.0,
      "landslide_susceptibility": 75.0
    }
  }
}
```

---

### 5. Evaluate Custom / Simulated Risk Surge
`POST /api/risk/evaluate/<location_id>`

**Request Body (JSON):**
```json
{
  "rainfall": 125.0,
  "soil_moisture": 94.0,
  "river_level": 6.5
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Risk evaluation completed and saved successfully",
  "risk_assessment": {
    "flash_flood_score": 96.57,
    "landslide_score": 90.85,
    "overall_score": 95.14,
    "risk_level": "CRITICAL",
    "lead_time_minutes": 21
  }
}
```

---

### 6. Ingest Sensor Telemetry
`POST /api/sensors`

**Request Body (JSON):**
```json
{
  "location_id": 1,
  "sensor_type": "rainfall",
  "value": 110.0,
  "unit": "mm/h",
  "status": "CRITICAL"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Successfully ingested 1 sensor reading(s)",
  "sensors": [
    {
      "id": 71,
      "location_id": 1,
      "sensor_type": "rainfall",
      "value": 110.0,
      "unit": "mm/h",
      "status": "CRITICAL",
      "timestamp": "2026-09-01T13:46:00.000000Z"
    }
  ]
}
```

---

## 🔒 Phase 1 Constraints & Roadmap
- ✅ **In Scope (Phase 1):** Database Models, Location & Sensor CRUD, Transparent Baseline Weighted Mathematical Risk Engine, REST APIs, Seed Data.
- 🚫 **Not in Scope for Phase 1:** Machine learning models, SMS/Twilio gateways, hardware IoT firmware, user authentication, external weather APIs. (Scheduled for subsequent phases).
