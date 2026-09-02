"""
PralayWatch Phase 1 Database Seeder
-----------------------------------
Populates the local SQLite/PostgreSQL database with realistic baseline DEMO/SEED data
for high-vulnerability multi-hazard mountain and river basin settlements across 5 Indian states:
- Himachal Pradesh
- Uttarakhand
- Sikkim
- Assam
- Meghalaya

ALL RECORDS ARE CLEARLY MARKED AS DEMO / SEED DATA.
"""

from datetime import datetime, timezone
from app.models import db, Location, Sensor, Risk
from app.services.risk_engine import RiskEngine

def utc_now():
    return datetime.now(timezone.utc)

# -----------------------------------------------------------------------------
# SAMPLE LOCATIONS (DEMO SEED DATA)
# -----------------------------------------------------------------------------
SEED_LOCATIONS = [
    # 1. HIMACHAL PRADESH
    {
        "state": "Himachal Pradesh",
        "district": "Kullu",
        "village": "Manali (Beas Basin)",
        "latitude": 32.2432,
        "longitude": 77.1892,
        "elevation": 2050.0,
        "slope": 32.0,
        "flood_susceptibility": 0.75,
        "landslide_susceptibility": 0.65,
        "sensors": [
            {"sensor_type": "rainfall", "value": 72.5, "unit": "mm/h", "status": "WARNING"},
            {"sensor_type": "soil_moisture", "value": 81.0, "unit": "%", "status": "WARNING"},
            {"sensor_type": "river_level", "value": 4.6, "unit": "m", "status": "WARNING"},
            {"sensor_type": "water_discharge", "value": 1420.0, "unit": "m3/s", "status": "WARNING"},
            {"sensor_type": "temperature", "value": 14.5, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Himachal Pradesh",
        "district": "Mandi",
        "village": "Pandoh (Beas Gorge)",
        "latitude": 31.6710,
        "longitude": 77.0392,
        "elevation": 880.0,
        "slope": 28.0,
        "flood_susceptibility": 0.80,
        "landslide_susceptibility": 0.60,
        "sensors": [
            {"sensor_type": "rainfall", "value": 45.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 68.0, "unit": "%", "status": "ACTIVE"},
            {"sensor_type": "river_level", "value": 3.8, "unit": "m", "status": "ACTIVE"},
            {"sensor_type": "water_discharge", "value": 890.0, "unit": "m3/s", "status": "ACTIVE"},
            {"sensor_type": "temperature", "value": 19.2, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Himachal Pradesh",
        "district": "Kangra",
        "village": "Dharamshala (Bhagsunag)",
        "latitude": 32.2190,
        "longitude": 76.3234,
        "elevation": 1457.0,
        "slope": 36.0,
        "flood_susceptibility": 0.50,
        "landslide_susceptibility": 0.75,
        "sensors": [
            {"sensor_type": "rainfall", "value": 55.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 74.0, "unit": "%", "status": "ACTIVE"},
            {"sensor_type": "river_level", "value": 2.2, "unit": "m", "status": "ACTIVE"},
            {"sensor_type": "water_discharge", "value": 310.0, "unit": "m3/s", "status": "ACTIVE"},
            {"sensor_type": "temperature", "value": 17.0, "unit": "°C", "status": "ACTIVE"}
        ]
    },

    # 2. UTTARAKHAND
    {
        "state": "Uttarakhand",
        "district": "Chamoli",
        "village": "Joshimath (Sunil Ward)",
        "latitude": 30.5539,
        "longitude": 79.5658,
        "elevation": 1875.0,
        "slope": 36.0,
        "flood_susceptibility": 0.60,
        "landslide_susceptibility": 0.88,
        "sensors": [
            {"sensor_type": "rainfall", "value": 62.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 88.5, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 3.4, "unit": "m", "status": "ACTIVE"},
            {"sensor_type": "water_discharge", "value": 450.0, "unit": "m3/s", "status": "ACTIVE"},
            {"sensor_type": "temperature", "value": 12.8, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Uttarakhand",
        "district": "Chamoli",
        "village": "Chamoli (Alaknanda Corridor)",
        "latitude": 30.4124,
        "longitude": 79.3198,
        "elevation": 1300.0,
        "slope": 34.0,
        "flood_susceptibility": 0.85,
        "landslide_susceptibility": 0.75,
        "sensors": [
            {"sensor_type": "rainfall", "value": 94.0, "unit": "mm/h", "status": "CRITICAL"},
            {"sensor_type": "soil_moisture", "value": 84.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 5.8, "unit": "m", "status": "CRITICAL"},
            {"sensor_type": "water_discharge", "value": 2350.0, "unit": "m3/s", "status": "CRITICAL"},
            {"sensor_type": "temperature", "value": 16.0, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Uttarakhand",
        "district": "Rudraprayag",
        "village": "Kedarnath (Mandakini Catchment)",
        "latitude": 30.7346,
        "longitude": 79.0669,
        "elevation": 3583.0,
        "slope": 38.0,
        "flood_susceptibility": 0.90,
        "landslide_susceptibility": 0.80,
        "sensors": [
            {"sensor_type": "rainfall", "value": 88.0, "unit": "mm/h", "status": "CRITICAL"},
            {"sensor_type": "soil_moisture", "value": 82.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 5.2, "unit": "m", "status": "CRITICAL"},
            {"sensor_type": "water_discharge", "value": 1850.0, "unit": "m3/s", "status": "CRITICAL"},
            {"sensor_type": "temperature", "value": 5.5, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Uttarakhand",
        "district": "Dehradun",
        "village": "Sahastradhara (Rispana Basin)",
        "latitude": 30.3872,
        "longitude": 78.1316,
        "elevation": 850.0,
        "slope": 22.0,
        "flood_susceptibility": 0.65,
        "landslide_susceptibility": 0.45,
        "sensors": [
            {"sensor_type": "rainfall", "value": 32.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 52.0, "unit": "%", "status": "ACTIVE"},
            {"sensor_type": "river_level", "value": 2.1, "unit": "m", "status": "ACTIVE"},
            {"sensor_type": "water_discharge", "value": 210.0, "unit": "m3/s", "status": "ACTIVE"},
            {"sensor_type": "temperature", "value": 24.5, "unit": "°C", "status": "ACTIVE"}
        ]
    },

    # 3. SIKKIM
    {
        "state": "Sikkim",
        "district": "Mangan",
        "village": "Chungthang (Teesta Valley)",
        "latitude": 27.6039,
        "longitude": 88.6464,
        "elevation": 1790.0,
        "slope": 35.0,
        "flood_susceptibility": 0.88,
        "landslide_susceptibility": 0.82,
        "sensors": [
            {"sensor_type": "rainfall", "value": 78.0, "unit": "mm/h", "status": "WARNING"},
            {"sensor_type": "soil_moisture", "value": 85.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 5.4, "unit": "m", "status": "CRITICAL"},
            {"sensor_type": "water_discharge", "value": 2100.0, "unit": "m3/s", "status": "CRITICAL"},
            {"sensor_type": "temperature", "value": 11.2, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Sikkim",
        "district": "East Sikkim",
        "village": "Singtam (Teesta Confluence)",
        "latitude": 27.2344,
        "longitude": 88.4981,
        "elevation": 400.0,
        "slope": 26.0,
        "flood_susceptibility": 0.75,
        "landslide_susceptibility": 0.65,
        "sensors": [
            {"sensor_type": "rainfall", "value": 42.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 65.0, "unit": "%", "status": "ACTIVE"},
            {"sensor_type": "river_level", "value": 3.2, "unit": "m", "status": "ACTIVE"},
            {"sensor_type": "water_discharge", "value": 950.0, "unit": "m3/s", "status": "ACTIVE"},
            {"sensor_type": "temperature", "value": 21.0, "unit": "°C", "status": "ACTIVE"}
        ]
    },

    # 4. ASSAM
    {
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "village": "Guwahati (Pandu Ghat)",
        "latitude": 26.1620,
        "longitude": 91.6870,
        "elevation": 55.0,
        "slope": 6.0,
        "flood_susceptibility": 0.92,
        "landslide_susceptibility": 0.20,
        "sensors": [
            {"sensor_type": "rainfall", "value": 68.0, "unit": "mm/h", "status": "WARNING"},
            {"sensor_type": "soil_moisture", "value": 86.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 6.8, "unit": "m", "status": "CRITICAL"},
            {"sensor_type": "water_discharge", "value": 18500.0, "unit": "m3/s", "status": "CRITICAL"},
            {"sensor_type": "temperature", "value": 28.5, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Assam",
        "district": "Cachar",
        "village": "Silchar (Barak Riverbank)",
        "latitude": 24.8333,
        "longitude": 92.7789,
        "elevation": 22.0,
        "slope": 4.0,
        "flood_susceptibility": 0.90,
        "landslide_susceptibility": 0.15,
        "sensors": [
            {"sensor_type": "rainfall", "value": 52.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 78.0, "unit": "%", "status": "WARNING"},
            {"sensor_type": "river_level", "value": 5.1, "unit": "m", "status": "WARNING"},
            {"sensor_type": "water_discharge", "value": 4200.0, "unit": "m3/s", "status": "WARNING"},
            {"sensor_type": "temperature", "value": 29.0, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Assam",
        "district": "Golaghat",
        "village": "Kaziranga (Brahmaputra Lowlands)",
        "latitude": 26.5775,
        "longitude": 93.1711,
        "elevation": 64.0,
        "slope": 3.0,
        "flood_susceptibility": 0.95,
        "landslide_susceptibility": 0.10,
        "sensors": [
            {"sensor_type": "rainfall", "value": 48.0, "unit": "mm/h", "status": "ACTIVE"},
            {"sensor_type": "soil_moisture", "value": 82.0, "unit": "%", "status": "WARNING"},
            {"sensor_type": "river_level", "value": 5.6, "unit": "m", "status": "WARNING"},
            {"sensor_type": "water_discharge", "value": 12400.0, "unit": "m3/s", "status": "WARNING"},
            {"sensor_type": "temperature", "value": 27.8, "unit": "°C", "status": "ACTIVE"}
        ]
    },

    # 5. MEGHALAYA
    {
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "village": "Cherrapunji (Sohra)",
        "latitude": 25.2702,
        "longitude": 91.7323,
        "elevation": 1430.0,
        "slope": 28.0,
        "flood_susceptibility": 0.82,
        "landslide_susceptibility": 0.70,
        "sensors": [
            {"sensor_type": "rainfall", "value": 125.0, "unit": "mm/h", "status": "CRITICAL"},
            {"sensor_type": "soil_moisture", "value": 92.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 5.5, "unit": "m", "status": "CRITICAL"},
            {"sensor_type": "water_discharge", "value": 3100.0, "unit": "m3/s", "status": "CRITICAL"},
            {"sensor_type": "temperature", "value": 18.2, "unit": "°C", "status": "ACTIVE"}
        ]
    },
    {
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "village": "Mawsynram (High Catchment)",
        "latitude": 25.2974,
        "longitude": 91.5824,
        "elevation": 1400.0,
        "slope": 27.0,
        "flood_susceptibility": 0.80,
        "landslide_susceptibility": 0.72,
        "sensors": [
            {"sensor_type": "rainfall", "value": 115.0, "unit": "mm/h", "status": "CRITICAL"},
            {"sensor_type": "soil_moisture", "value": 89.0, "unit": "%", "status": "CRITICAL"},
            {"sensor_type": "river_level", "value": 4.9, "unit": "m", "status": "WARNING"},
            {"sensor_type": "water_discharge", "value": 2800.0, "unit": "m3/s", "status": "WARNING"},
            {"sensor_type": "temperature", "value": 19.0, "unit": "°C", "status": "ACTIVE"}
        ]
    }
]

def _seed_logic(force=False):
    existing_count = Location.query.count()
    if existing_count > 0 and not force:
        print(f"[Seed] Database already contains {existing_count} locations. Skipping seed.")
        return

    if force:
        print("[Seed] Resetting database tables...")
        db.drop_all()
        db.create_all()

    print(f"[Seed] Seeding PralayWatch database with {len(SEED_LOCATIONS)} high-risk locations...")

    for loc_data in SEED_LOCATIONS:
        # 1. Create Location Record
        loc = Location(
            state=loc_data["state"],
            district=loc_data["district"],
            village=loc_data["village"],
            latitude=loc_data["latitude"],
            longitude=loc_data["longitude"],
            elevation=loc_data["elevation"],
            slope=loc_data["slope"],
            flood_susceptibility=loc_data["flood_susceptibility"],
            landslide_susceptibility=loc_data["landslide_susceptibility"],
            created_at=utc_now()
        )
        db.session.add(loc)
        db.session.flush()

        # 2. Add Sensor Readings
        raw_inputs = {
            'slope': loc.slope,
            'flood_susceptibility': loc.flood_susceptibility,
            'landslide_susceptibility': loc.landslide_susceptibility
        }

        for s_data in loc_data.get("sensors", []):
            sensor = Sensor(
                location_id=loc.id,
                sensor_type=s_data["sensor_type"],
                value=s_data["value"],
                unit=s_data["unit"],
                status=s_data.get("status", "ACTIVE"),
                timestamp=utc_now()
            )
            db.session.add(sensor)
            raw_inputs[s_data["sensor_type"]] = s_data["value"]

        # 3. Compute Risk Assessment via Transparent Risk Engine
        eval_result = RiskEngine.evaluate(raw_inputs, loc)

        risk_record = Risk(
            location_id=loc.id,
            flash_flood_score=eval_result["flash_flood_score"],
            landslide_score=eval_result["landslide_score"],
            overall_score=eval_result["overall_score"],
            risk_level=eval_result["risk_level"],
            lead_time_minutes=eval_result["lead_time_minutes"],
            created_at=utc_now()
        )
        db.session.add(risk_record)

    db.session.commit()
    print(f"[Seed] Successfully seeded {Location.query.count()} locations, {Sensor.query.count()} sensors, and {Risk.query.count()} risk assessments!")

def seed_database(app=None, force=False):
    """
    Populate database with sample locations, sensors, and risk scores.
    If app is None and no app context is active, creates a new app.
    """
    if app:
        with app.app_context():
            _seed_logic(force)
    else:
        from flask import has_app_context
        if has_app_context():
            _seed_logic(force)
        else:
            from app import create_app
            standalone_app = create_app()
            with standalone_app.app_context():
                _seed_logic(force)

if __name__ == '__main__':
    import sys
    force_seed = '--force' in sys.argv
    seed_database(force=force_seed)
