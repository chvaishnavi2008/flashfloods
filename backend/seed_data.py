from datetime import datetime, timedelta
import json
from database import db
from models import Location, Hazard, EnvironmentalData, RiskAssessment, Alert, SafeLocation, User, Notification
from services.risk_engine import PralayWatchRiskEngine
from services.ai_service import AiIntelligenceService

def seed_database():
    """
    Seeds initial prototype database with realistic vulnerable locations across
    all key high-risk multi-hazard regions of India and neighboring border areas:
    - Uttarakhand (Chamoli, Joshimath, Dehradun, Kedarnath, Uttarkashi)
    - Himachal Pradesh (Kullu - Manali, Mandi, Shimla, Dharamshala)
    - Sikkim (Chungthang, Gangtok)
    - Assam (Guwahati, Silchar, Kaziranga)
    - Arunachal Pradesh (Pasighat, Tawang)
    - Meghalaya (Cherrapunji, Mawsynram)
    - Jammu & Kashmir (Ramban, Srinagar, Poonch)
    - Kerala (Wayanad, Idukki, Munnar)
    - West Bengal (Darjeeling - Kalimpong, Jalpaiguri)
    - Bihar (Supaul, Patna)
    - Nepal Border (Darchula Border, Melamchi, Pokhara)
    """
    if Location.query.first() is not None:
        print("[Database] Database already populated with seed data.")
        return

    print("[Database] Seeding fresh database for PralayWatch multi-hazard network...")

    # 1. Seed Hazards
    hazards_data = [
        {"code": "flash_flood", "name": "Flash Flood", "icon": "water_drop", "description": "Rapid water surge in steep tributaries and valleys following intense cloudbursts.", "unit": "mm/hr & Gauge Level"},
        {"code": "flood", "name": "Riverine Flood", "icon": "flood", "description": "Prolonged water overflow exceeding riverbank carrying capacity into floodplain settlements.", "unit": "Gauge Level (m)"},
        {"code": "landslide", "name": "Landslide / Geohazard", "icon": "landslide", "description": "Geotechnical slope failure triggered by severe soil moisture saturation and hydraulic pressure.", "unit": "Soil Saturation % & Slope °"},
        {"code": "heavy_rainfall", "name": "Heavy Rainfall / Cloudburst", "icon": "thunderstorm", "description": "Extreme precipitation rates capable of initiating multi-hazard cascading disasters.", "unit": "mm / 24h"},
        {"code": "cyclone", "name": "Cyclone / Storm Surge", "icon": "cyclone", "description": "High wind velocities combined with heavy convective precipitation bands.", "unit": "km/h & mm/hr"},
        {"code": "glof", "name": "GLOF (Glacial Lake Outburst)", "icon": "ac_unit", "description": "Catastrophic release of moraine-dammed glacial lakes in high-altitude cryosphere.", "unit": "Elevation (m) & Surge Rate"}
    ]
    for h in hazards_data:
        if not Hazard.query.filter_by(code=h['code']).first():
            db.session.add(Hazard(**h))
    db.session.commit()

    # 2. Seed High-Risk Locations Across India & Neighboring Zones
    locations_data = [
        # --- UTTARAKHAND ---
        {"name": "Chamoli", "region": "Alaknanda Basin", "state": "Uttarakhand", "country": "India", "lat": 30.4124, "lng": 79.3198, "elevation": 1300, "terrain_type": "Mountain Valley Corridor", "population": 22400},
        {"name": "Joshimath", "region": "Garhwal", "state": "Uttarakhand", "country": "India", "lat": 30.5539, "lng": 79.5658, "elevation": 1875, "terrain_type": "Steep Mountain Slope", "population": 16700},
        {"name": "Kedarnath", "region": "Mandakini Basin", "state": "Uttarakhand", "country": "India", "lat": 30.7346, "lng": 79.0669, "elevation": 3583, "terrain_type": "High Himalayan Catchment", "population": 8500},
        {"name": "Dehradun", "region": "Doon Valley", "state": "Uttarakhand", "country": "India", "lat": 30.3165, "lng": 78.0322, "elevation": 640, "terrain_type": "Valley Basin", "population": 578000},
        {"name": "Uttarkashi", "region": "Bhagirathi Valley", "state": "Uttarakhand", "country": "India", "lat": 30.7268, "lng": 78.4354, "elevation": 1158, "terrain_type": "High Vulnerability Valley", "population": 34000},

        # --- HIMACHAL PRADESH ---
        {"name": "Kullu - Manali", "region": "Beas Basin", "state": "Himachal Pradesh", "country": "India", "lat": 31.9579, "lng": 77.1095, "elevation": 1279, "terrain_type": "High-Flow River Catchment", "population": 43500},
        {"name": "Mandi", "region": "Beas Valley", "state": "Himachal Pradesh", "country": "India", "lat": 31.7087, "lng": 76.9320, "elevation": 760, "terrain_type": "River Gorge Basin", "population": 26000},
        {"name": "Shimla (Ward 4)", "region": "Shimla Ridge", "state": "Himachal Pradesh", "country": "India", "lat": 31.1048, "lng": 77.1734, "elevation": 2276, "terrain_type": "Steep Urban Ridge", "population": 21000},
        {"name": "Dharamshala", "region": "Kangra Valley", "state": "Himachal Pradesh", "country": "India", "lat": 32.2190, "lng": 76.3234, "elevation": 1457, "terrain_type": "Dhauladhar Slope", "population": 53000},

        # --- SIKKIM ---
        {"name": "Chungthang", "region": "North Sikkim", "state": "Sikkim", "country": "India", "lat": 27.6039, "lng": 88.6464, "elevation": 1790, "terrain_type": "Glacial Lake Outflow Basin", "population": 12000},
        {"name": "Gangtok", "region": "East Sikkim", "state": "Sikkim", "country": "India", "lat": 27.3389, "lng": 88.6065, "elevation": 1650, "terrain_type": "Active Slope Geohazard", "population": 100000},

        # --- ASSAM ---
        {"name": "Guwahati (Brahmaputra)", "region": "Kamrup", "state": "Assam", "country": "India", "lat": 26.1445, "lng": 91.7362, "elevation": 55, "terrain_type": "Major Floodplain Basin", "population": 960000},
        {"name": "Silchar", "region": "Barak Valley", "state": "Assam", "country": "India", "lat": 24.8333, "lng": 92.7789, "elevation": 22, "terrain_type": "Inundation Floodplain", "population": 172000},
        {"name": "Kaziranga", "region": "Golaghat", "state": "Assam", "country": "India", "lat": 26.5775, "lng": 93.1711, "elevation": 64, "terrain_type": "Wetland Floodplain", "population": 48000},

        # --- ARUNACHAL PRADESH ---
        {"name": "Pasighat", "region": "Siang Catchment", "state": "Arunachal Pradesh", "country": "India", "lat": 28.0664, "lng": 95.3268, "elevation": 155, "terrain_type": "Riverine Foothills", "population": 25000},
        {"name": "Tawang", "region": "High Himalayas", "state": "Arunachal Pradesh", "country": "India", "lat": 27.5861, "lng": 91.8594, "elevation": 3048, "terrain_type": "High Altitude Slopes", "population": 11200},

        # --- MEGHALAYA ---
        {"name": "Cherrapunji (Sohra)", "region": "Khasi Hills", "state": "Meghalaya", "country": "India", "lat": 25.2702, "lng": 91.7323, "elevation": 1430, "terrain_type": "Extreme Rainfall Plateau", "population": 15000},
        {"name": "Mawsynram", "region": "East Khasi Hills", "state": "Meghalaya", "country": "India", "lat": 25.2974, "lng": 91.5824, "elevation": 1400, "terrain_type": "Ultra-High Precipitation Zone", "population": 13500},

        # --- JAMMU & KASHMIR ---
        {"name": "Ramban (NH-44)", "region": "Chenab Basin", "state": "Jammu & Kashmir", "country": "India", "lat": 33.2423, "lng": 75.2415, "elevation": 1156, "terrain_type": "Active Landslide Corridor", "population": 19000},
        {"name": "Srinagar (Jhelum)", "region": "Kashmir Valley", "state": "Jammu & Kashmir", "country": "India", "lat": 34.0837, "lng": 74.7973, "elevation": 1585, "terrain_type": "Riverine Valley Basin", "population": 1180000},
        {"name": "Poonch", "region": "Pir Panjal", "state": "Jammu & Kashmir", "country": "India", "lat": 33.7712, "lng": 74.0934, "elevation": 981, "terrain_type": "Mountain River Gorge", "population": 28000},

        # --- KERALA (WESTERN GHATS) ---
        {"name": "Wayanad (Meppadi)", "region": "Western Ghats", "state": "Kerala", "country": "India", "lat": 11.5534, "lng": 76.1264, "elevation": 780, "terrain_type": "High Geotechnical Slope Vulnerability", "population": 45000},
        {"name": "Idukki", "region": "Periyar Basin", "state": "Kerala", "country": "India", "lat": 9.8494, "lng": 76.9804, "elevation": 1200, "terrain_type": "Steep Hill Reservoir Basin", "population": 52000},
        {"name": "Munnar", "region": "Anamalai Hills", "state": "Kerala", "country": "India", "lat": 10.0889, "lng": 77.0595, "elevation": 1532, "terrain_type": "Tea Plantation Slopes", "population": 38000},

        # --- WEST BENGAL ---
        {"name": "Darjeeling - Kalimpong", "region": "Teesta Basin", "state": "West Bengal", "country": "India", "lat": 27.0410, "lng": 88.2663, "elevation": 2042, "terrain_type": "Steep Hill Slopes", "population": 120000},
        {"name": "Jalpaiguri", "region": "Dooars Plains", "state": "West Bengal", "country": "India", "lat": 26.5404, "lng": 88.7196, "elevation": 83, "terrain_type": "Teesta Floodplain", "population": 107000},

        # --- BIHAR ---
        {"name": "Supaul (Kosi)", "region": "Kosi Basin", "state": "Bihar", "country": "India", "lat": 26.1228, "lng": 86.5985, "elevation": 45, "terrain_type": "Braided River Inundation Zone", "population": 65000},
        {"name": "Patna (Ganges)", "region": "Gangetic Plain", "state": "Bihar", "country": "India", "lat": 25.5941, "lng": 85.1376, "elevation": 53, "terrain_type": "Lowland Confluence", "population": 2040000},

        # --- NEPAL & BORDER CORRIDORS ---
        {"name": "Darchula Border", "region": "Mahakali Corridor", "state": "Uttarakhand / Sudurpashchim", "country": "India / Nepal", "lat": 29.8456, "lng": 80.5369, "elevation": 915, "terrain_type": "Transboundary River Canyon", "population": 21000},
        {"name": "Melamchi", "region": "Sindhupalchok", "state": "Bagmati Province", "country": "Nepal", "lat": 27.8333, "lng": 85.5833, "elevation": 870, "terrain_type": "Debris Flow & Flash Flood Zone", "population": 45000},
        {"name": "Pokhara (Seti River)", "region": "Gandaki", "state": "Gandaki Province", "country": "Nepal", "lat": 28.2096, "lng": 83.9856, "elevation": 822, "terrain_type": "Gorge Catchment", "population": 350000}
    ]

    location_objs = {}
    for loc_data in locations_data:
        loc = Location(**loc_data)
        db.session.add(loc)
        db.session.flush()
        location_objs[loc.name] = loc

    # 3. Seed Environmental Telemetry
    # Baseline: Chamoli, Joshimath, Wayanad, Cherrapunji configured with rich active metrics
    for loc in location_objs.values():
        if loc.name == "Chamoli":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=110.0,
                rainfall_rate=84.0,
                rainfall_intensity="Torrential",
                rainfall_forecast_trend="Rising",
                river_level_m=5.8,
                river_capacity_pct=88.0,
                river_trend="Rising Rapidly",
                soil_saturation_pct=82.0,
                slope_deg=35.0,
                slope_stability="Critical / Imminent Slip"
            )
        elif loc.name == "Joshimath":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=95.0,
                rainfall_rate=50.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Stable",
                river_level_m=4.1,
                river_capacity_pct=65.0,
                river_trend="Rising",
                soil_saturation_pct=85.0,
                slope_deg=36.0,
                slope_stability="Moderate Risk"
            )
        elif loc.name == "Wayanad (Meppadi)":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=125.0,
                rainfall_rate=68.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Peaking",
                river_level_m=4.6,
                river_capacity_pct=72.0,
                river_trend="Rising",
                soil_saturation_pct=92.0,
                slope_deg=38.0,
                slope_stability="Critical / Imminent Slip"
            )
        elif loc.name == "Cherrapunji (Sohra)":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=180.0,
                rainfall_rate=115.0,
                rainfall_intensity="Cloudburst / Torrential",
                rainfall_forecast_trend="Peaking",
                river_level_m=5.2,
                river_capacity_pct=80.0,
                river_trend="Rising Rapidly",
                soil_saturation_pct=88.0,
                slope_deg=28.0,
                slope_stability="Moderate Risk"
            )
        elif loc.name == "Chungthang":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=90.0,
                rainfall_rate=65.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Rising",
                river_level_m=5.5,
                river_capacity_pct=85.0,
                river_trend="Rising Rapidly",
                soil_saturation_pct=75.0,
                slope_deg=34.0,
                slope_stability="Moderate Risk"
            )
        elif loc.name == "Guwahati (Brahmaputra)":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=120.0,
                rainfall_rate=42.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Rising",
                river_level_m=6.8,
                river_capacity_pct=91.0,
                river_trend="Rising",
                soil_saturation_pct=80.0,
                slope_deg=8.0,
                slope_stability="Stable"
            )
        else:
            # Nominal baseline watch conditions for other sectors
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=32.0,
                rainfall_rate=6.5,
                rainfall_intensity="Moderate",
                rainfall_forecast_trend="Stable",
                river_level_m=2.4,
                river_capacity_pct=38.0,
                river_trend="Normal",
                soil_saturation_pct=45.0,
                slope_deg=24.0,
                slope_stability="Stable"
            )
        db.session.add(env)
        db.session.flush()

        # Calculate initial risk assessment
        risk_calc = PralayWatchRiskEngine.evaluate_composite_risk(env, loc)
        ai_exp = AiIntelligenceService.generate_explanation(loc.name, env, risk_calc)
        
        assessment = RiskAssessment(
            location_id=loc.id,
            overall_score=risk_calc["overall_score"],
            overall_level=risk_calc["overall_level"],
            flash_flood_score=risk_calc["flash_flood_score"],
            flash_flood_level=risk_calc["flash_flood_level"],
            flood_score=risk_calc["flood_score"],
            flood_level=risk_calc["flood_level"],
            landslide_score=risk_calc["landslide_score"],
            landslide_level=risk_calc["landslide_level"],
            heavy_rainfall_score=risk_calc["heavy_rainfall_score"],
            heavy_rainfall_level=risk_calc["heavy_rainfall_level"],
            lead_time_minutes=risk_calc["lead_time_minutes"],
            contributing_factors=risk_calc["contributing_factors"],
            recommended_action=risk_calc["recommended_action"],
            ai_explanation=ai_exp
        )
        db.session.add(assessment)

    # 4. Seed Safe Shelters for Locations
    for loc in location_objs.values():
        shelters = [
            {
                "location_id": loc.id,
                "name": f"{loc.name} High-Ground Disaster Relief Shelter",
                "type": "Primary Structural Safe Shelter",
                "lat": loc.lat + 0.008,
                "lng": loc.lng + 0.007,
                "capacity": 850,
                "current_occupancy": 120,
                "status": "OPEN",
                "distance_km": 1.4,
                "est_walking_mins": 18,
                "contact_phone": "+91 1800-180-1104",
                "facilities": "Medical Aid, High-Output Generators, Dry Food Rations, Purified Water"
            },
            {
                "location_id": loc.id,
                "name": f"{loc.name} Community Hall & Helipad Refuge",
                "type": "Secondary Emergency Shelter",
                "lat": loc.lat - 0.006,
                "lng": loc.lng - 0.006,
                "capacity": 450,
                "current_occupancy": 40,
                "status": "OPEN",
                "distance_km": 2.2,
                "est_walking_mins": 26,
                "contact_phone": "+91 94120-00108",
                "facilities": "Emergency Medical Bay, Helipad Access, Satellite Communication, Trauma Care"
            }
        ]
        for s in shelters:
            db.session.add(SafeLocation(**s))

    # 5. Seed Broadcast Alerts for Critical/High Zones
    chamoli_loc = location_objs["Chamoli"]
    alert1 = Alert(
        location_id=chamoli_loc.id,
        hazard_type="Flash Flood",
        severity="CRITICAL",
        title=f"CRITICAL FLASH FLOOD WARNING: Upper Alaknanda Catchment",
        message=f"[DEMO SIMULATION] Rainfall 84mm/hr with rapid river surge. Immediate evacuation of low-lying floodplains in Chamoli activated.",
        radius_km=25.0,
        status="Active",
        lead_time_min=30,
        issued_by="PralayWatch Real-Time AI Simulation Core",
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db.session.add(alert1)

    wayanad_loc = location_objs["Wayanad (Meppadi)"]
    alert2 = Alert(
        location_id=wayanad_loc.id,
        hazard_type="Landslide",
        severity="CRITICAL",
        title=f"CRITICAL LANDSLIDE RED ALERT: Meppadi Hillslope Sector",
        message=f"[DEMO SIMULATION] Soil saturation 92% and slope strain threshold exceeded. Evacuate downstream settlements immediately.",
        radius_km=18.0,
        status="Active",
        lead_time_min=45,
        issued_by="PralayWatch Real-Time AI Simulation Core",
        created_at=datetime.utcnow() - timedelta(minutes=28)
    )
    db.session.add(alert2)

    # 6. Seed Subscribed Citizens
    users_data = [
        {"name": "Aarav Sharma", "phone": "+91 98765 43210", "location_id": chamoli_loc.id, "preferred_language": "Hindi"},
        {"name": "Priya Nair", "phone": "+91 98450 11223", "location_id": wayanad_loc.id, "preferred_language": "Malayalam"}
    ]
    for u in users_data:
        db.session.add(User(**u))

    db.session.commit()
    print(f"[Database] Successfully seeded {len(locations_data)} multi-hazard monitoring zones across India and neighboring borders!")
