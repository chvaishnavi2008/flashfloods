from datetime import datetime, timedelta
import json
from database import db
from models import Location, Hazard, EnvironmentalData, RiskAssessment, Alert, SafeLocation, User, Notification
from services.risk_engine import PrototypeRiskAssessmentEngine
from services.ai_service import AiIntelligenceService

def seed_database():
    """
    Seeds initial prototype database with realistic vulnerable locations across
    Himalayan & Indian multi-hazard zones, standard hazards, environmental telemetry,
    safe shelters, and active alert logs.
    """
    if Location.query.first() is not None:
        print("[Database] Database already populated with seed data.")
        return

    print("[Database] Seeding fresh database for PralayWatch...")

    # 1. Seed Hazards
    hazards_data = [
        {"code": "flash_flood", "name": "Flash Flood", "icon": "water_drop", "description": "Rapid water surge in steep tributaries and valleys following intense cloudbursts.", "unit": "mm/hr & Gauge Level"},
        {"code": "flood", "name": "Riverine Flood", "icon": "flood", "description": "Prolonged water overflow exceeding riverbank carrying capacity into floodplain settlements.", "unit": "Gauge Level (m)"},
        {"code": "landslide", "name": "Landslide / Land Risk", "icon": "landslide", "description": "Geotechnical slope failure triggered by severe soil moisture saturation and hydraulic pressure.", "unit": "Soil Saturation % & Slope °"},
        {"code": "heavy_rainfall", "name": "Heavy Rainfall / Cloudburst", "icon": "thunderstorm", "description": "Extreme precipitation rates capable of initiating multi-hazard cascading disasters.", "unit": "mm / 24h"}
    ]
    for h in hazards_data:
        db.session.add(Hazard(**h))
    db.session.commit()

    # 2. Seed Locations (Spanning Uttarakhand, Himachal, Sikkim, Assam, Arunachal, Meghalaya, J&K, WB, Nepal)
    locations_data = [
        # Uttarakhand
        {"name": "Dehradun", "region": "Doon Valley", "state": "Uttarakhand", "country": "India", "lat": 30.3165, "lng": 78.0322, "elevation": 640, "terrain_type": "Valley Basin", "population": 578000},
        {"name": "Joshimath", "region": "Garhwal", "state": "Uttarakhand", "country": "India", "lat": 30.5539, "lng": 79.5658, "elevation": 1875, "terrain_type": "Steep Mountain Slope", "population": 16700},
        {"name": "Chamoli", "region": "Alaknanda Basin", "state": "Uttarakhand", "country": "India", "lat": 30.4124, "lng": 79.3198, "elevation": 1300, "terrain_type": "River Corridor", "population": 22400},
        {"name": "Uttarkashi", "region": "Bhagirathi Valley", "state": "Uttarakhand", "country": "India", "lat": 30.7268, "lng": 78.4354, "elevation": 1158, "terrain_type": "High Vulnerability Valley", "population": 34000},
        
        # Himachal Pradesh
        {"name": "Shimla (Ward 4)", "region": "Shimla Ridge", "state": "Himachal Pradesh", "country": "India", "lat": 31.1048, "lng": 77.1734, "elevation": 2276, "terrain_type": "Steep Urban Ridge", "population": 21000},
        {"name": "Kullu - Manali", "region": "Beas Basin", "state": "Himachal Pradesh", "country": "India", "lat": 31.9579, "lng": 77.1095, "elevation": 1279, "terrain_type": "High-Flow River Catchment", "population": 43500},
        {"name": "Mandi", "region": "Beas Valley", "state": "Himachal Pradesh", "country": "India", "lat": 31.7087, "lng": 76.9320, "elevation": 760, "terrain_type": "River Gorge Basin", "population": 26000},
        
        # Sikkim
        {"name": "Chungthang", "region": "North Sikkim", "state": "Sikkim", "country": "India", "lat": 27.6039, "lng": 88.6464, "elevation": 1790, "terrain_type": "Glacial Lake Outflow Basin", "population": 12000},
        {"name": "Gangtok", "region": "East Sikkim", "state": "Sikkim", "country": "India", "lat": 27.3389, "lng": 88.6065, "elevation": 1650, "terrain_type": "Active Slope Geohazard", "population": 100000},
        
        # Assam
        {"name": "Guwahati (Brahmaputra)", "region": "Kamrup", "state": "Assam", "country": "India", "lat": 26.1445, "lng": 91.7362, "elevation": 55, "terrain_type": "Major Floodplain Basin", "population": 960000},
        {"name": "Silchar", "region": "Barak Valley", "state": "Assam", "country": "India", "lat": 24.8333, "lng": 92.7789, "elevation": 22, "terrain_type": "Inundation Floodplain", "population": 172000},
        
        # Arunachal Pradesh
        {"name": "Pasighat", "region": "Siang Catchment", "state": "Arunachal Pradesh", "country": "India", "lat": 28.0664, "lng": 95.3268, "elevation": 155, "terrain_type": "Riverine Foothills", "population": 25000},
        {"name": "Tawang", "region": "High Himalayas", "state": "Arunachal Pradesh", "country": "India", "lat": 27.5861, "lng": 91.8594, "elevation": 3048, "terrain_type": "High Altitude Slopes", "population": 11200},
        
        # Meghalaya
        {"name": "Cherrapunji (Sohra)", "region": "Khasi Hills", "state": "Meghalaya", "country": "India", "lat": 25.2702, "lng": 91.7323, "elevation": 1430, "terrain_type": "Extreme Rainfall Plateau", "population": 15000},
        
        # Jammu & Kashmir
        {"name": "Ramban (NH-44)", "region": "Chenab Basin", "state": "Jammu & Kashmir", "country": "India", "lat": 33.2423, "lng": 75.2415, "elevation": 1156, "terrain_type": "Active Landslide Corridor", "population": 19000},
        {"name": "Srinagar (Jhelum)", "region": "Kashmir Valley", "state": "Jammu & Kashmir", "country": "India", "lat": 34.0837, "lng": 74.7973, "elevation": 1585, "terrain_type": "Riverine Valley Basin", "population": 1180000},
        
        # West Bengal
        {"name": "Darjeeling - Kalimpong", "region": "Teesta Basin", "state": "West Bengal", "country": "India", "lat": 27.0410, "lng": 88.2663, "elevation": 2042, "terrain_type": "Steep Hill Slopes", "population": 120000},
        
        # Nepal
        {"name": "Melamchi", "region": "Sindhupalchok", "state": "Bagmati Province", "country": "Nepal", "lat": 27.8333, "lng": 85.5833, "elevation": 870, "terrain_type": "Debris Flow & Flash Flood Zone", "population": 45000},
        {"name": "Pokhara (Seti River)", "region": "Gandaki", "state": "Gandaki Province", "country": "Nepal", "lat": 28.2096, "lng": 83.9856, "elevation": 822, "terrain_type": "Gorge Catchment", "population": 350000}
    ]

    location_objs = {}
    for loc_data in locations_data:
        loc = Location(**loc_data)
        db.session.add(loc)
        db.session.flush()
        location_objs[loc.name] = loc

    # 3. Seed Environmental Data & Safe Shelters for each location
    # Default environmental parameters (Dehradun set to HIGH initially to provide ready rich demo)
    for loc in location_objs.values():
        if loc.name == "Dehradun":
            # High baseline scenario for immediate demo richness
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=135.0,
                rainfall_rate=58.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Rising",
                river_level_m=4.8,
                river_capacity_pct=76.0,
                river_trend="Rising",
                soil_saturation_pct=79.0,
                slope_deg=34.0,
                slope_stability="Moderate Risk"
            )
        elif loc.name == "Joshimath":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=85.0,
                rainfall_rate=32.0,
                rainfall_intensity="Moderate",
                rainfall_forecast_trend="Stable",
                river_level_m=3.8,
                river_capacity_pct=62.0,
                river_trend="Rising",
                soil_saturation_pct=84.0,
                slope_deg=38.0,
                slope_stability="Moderate Risk"
            )
        elif loc.name == "Chungthang":
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=110.0,
                rainfall_rate=45.0,
                rainfall_intensity="Heavy",
                rainfall_forecast_trend="Rising",
                river_level_m=5.1,
                river_capacity_pct=72.0,
                river_trend="Rising",
                soil_saturation_pct=76.0,
                slope_deg=36.0,
                slope_stability="Moderate Risk"
            )
        else:
            # Baseline normal conditions
            env = EnvironmentalData(
                location_id=loc.id,
                rainfall_mm=25.0,
                rainfall_rate=6.0,
                rainfall_intensity="Light",
                rainfall_forecast_trend="Stable",
                river_level_m=2.2,
                river_capacity_pct=34.0,
                river_trend="Normal",
                soil_saturation_pct=42.0,
                slope_deg=loc.elevation / 70.0,
                slope_stability="Stable"
            )
        db.session.add(env)
        db.session.flush()

        # Compute initial risk assessment
        risk_calc = PrototypeRiskAssessmentEngine.evaluate_composite_risk(env, loc)
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
            ai_explanation=ai_exp,
            recommended_action=risk_calc["recommended_action"]
        )
        db.session.add(assessment)

        # Seed 3-4 Safe Shelters around each location
        lat, lng = loc.lat, loc.lng
        shelters = [
            {
                "name": f"Govt. Higher Secondary School - {loc.name}",
                "type": "Emergency Shelter",
                "lat": lat + 0.008,
                "lng": lng + 0.006,
                "capacity": 600,
                "current_occupancy": 320,
                "status": "OPEN",
                "distance_km": 1.2,
                "est_walking_mins": 15,
                "facilities": "Medical Team, Drinking Water, Power Backup, Sanitation"
            },
            {
                "name": f"Community Relief Centre & Hall B - {loc.name}",
                "type": "Relief Centre",
                "lat": lat - 0.007,
                "lng": lng + 0.009,
                "capacity": 400,
                "current_occupancy": 360,
                "status": "NEAR CAP",
                "distance_km": 2.4,
                "est_walking_mins": 28,
                "facilities": "Food Packets, Bedding, First Aid"
            },
            {
                "name": f"District Indoor Stadium Complex - {loc.name}",
                "type": "High-Capacity Safe Zone",
                "lat": lat + 0.012,
                "lng": lng - 0.008,
                "capacity": 1800,
                "current_occupancy": 450,
                "status": "OPEN",
                "distance_km": 3.8,
                "est_walking_mins": 45,
                "facilities": "Helipad Access, Telecom Node, Trauma Care Center"
            }
        ]
        for s in shelters:
            s["location_id"] = loc.id
            db.session.add(SafeLocation(**s))

    # 4. Seed Initial Alerts
    dehradun = location_objs["Dehradun"]
    joshimath = location_objs["Joshimath"]
    
    alert1 = Alert(
        location_id=dehradun.id,
        hazard_type="Flash Flood & Landslide",
        severity="HIGH",
        title="Elevated Flash Flood & Slope Failure Watch: Dehradun Catchment",
        message="Sustained rainfall exceeding 58 mm/hr has elevated runoff levels along Rispana and Bindal streams. Slopes on Rajpur road are under close geotechnical observation.",
        radius_km=15.0,
        lead_time_min=45,
        status="Active",
        issued_by="Uttarakhand SDMA & CWC",
        created_at=datetime.utcnow() - timedelta(minutes=24)
    )
    db.session.add(alert1)

    alert2 = Alert(
        location_id=joshimath.id,
        hazard_type="Landslide",
        severity="MODERATE",
        title="Landslide Vulnerability Warning: Sunil & Marwari Sectors",
        message="Soil moisture saturation has touched 84%. Minor subsidence monitored near Alaknanda confluence. Exercise caution on NH-58.",
        radius_km=10.0,
        lead_time_min=90,
        status="Monitoring",
        issued_by="Chamoli District Emergency Operation Center",
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.session.add(alert2)

    # 5. Seed Demo User
    demo_user = User(
        name="Sunita Sharma",
        phone="+91 98765 43210",
        location_id=dehradun.id,
        hazard_flash_flood=True,
        hazard_flood=True,
        hazard_landslide=True,
        hazard_heavy_rainfall=True
    )
    db.session.add(demo_user)
    db.session.flush()

    # Initial notification
    notif = Notification(
        user_id=demo_user.id,
        phone=demo_user.phone,
        title="PralayWatch Advisory: High Flash Flood Watch",
        message="Active advisory for Dehradun sector. Check nearest safe shelter routes on PralayWatch app.",
        hazard_type="Flash Flood",
        severity="HIGH",
        status="Delivered",
        sent_at=datetime.utcnow() - timedelta(minutes=20)
    )
    db.session.add(notif)

    db.session.commit()
    print("[Database] Successfully seeded 19 locations, environmental streams, risk scores, safe shelters, alerts, and user profiles.")
