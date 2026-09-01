from flask import Blueprint, jsonify, request
from models import Location, EnvironmentalData, RiskAssessment, Alert
from services.risk_engine import PrototypeRiskAssessmentEngine
from services.ai_service import AiIntelligenceService
from services.alert_service import AlertService
from services.notification_service import NotificationService
from database import db
from datetime import datetime

simulate_bp = Blueprint('simulate', __name__)

@simulate_bp.route('/api/simulate', methods=['POST'])
def simulate_event():
    """
    Simulates sudden environmental escalation or resets to normal.
    Scenarios:
    - 'heavy_rainfall': Spikes precipitation rate to 145 mm/hr, saturated soil
    - 'flash_flood': Spikes river level to 92% capacity and rapid runoff
    - 'landslide': Saturated soil 94% on steep terrain
    - 'combined_emergency' / 'multi_hazard': High cloudburst + river overflow + landslide
    - 'reset': Restores nominal baseline environmental conditions
    """
    data = request.get_json() or {}
    location_id = data.get('location_id')
    scenario = data.get('scenario', 'combined_emergency')
    
    # If location_id is provided, simulate for that location, otherwise for all vulnerable locations (or primary like Dehradun/Joshimath)
    if location_id:
        locations = Location.query.filter_by(id=location_id).all()
    else:
        locations = Location.query.all()
        
    if not locations:
        return jsonify({"success": False, "error": "No locations found"}), 404
        
    created_alert = None
    dispatched_notifs = []
    
    for loc in locations:
        env = EnvironmentalData.query.filter_by(location_id=loc.id).first()
        if not env:
            env = EnvironmentalData(location_id=loc.id)
            db.session.add(env)
            
        if scenario == 'reset':
            # Reset to nominal baseline
            env.rainfall_mm = 22.0
            env.rainfall_rate = 4.5
            env.rainfall_intensity = "Light"
            env.rainfall_forecast_trend = "Stable"
            env.river_level_m = 2.1
            env.river_capacity_pct = 32.0
            env.river_trend = "Normal"
            env.soil_saturation_pct = 42.0
            env.slope_stability = "Stable"
        elif scenario == 'flash_flood':
            env.rainfall_mm += 85.0
            env.rainfall_rate = 95.0
            env.rainfall_intensity = "Extremely Heavy"
            env.rainfall_forecast_trend = "Rising"
            env.river_level_m = 5.9
            env.river_capacity_pct = 91.0
            env.river_trend = "Rising Rapidly"
            env.soil_saturation_pct = 78.0
            env.slope_stability = "Moderate Risk"
        elif scenario == 'landslide':
            env.rainfall_mm += 70.0
            env.rainfall_rate = 65.0
            env.rainfall_intensity = "Heavy"
            env.rainfall_forecast_trend = "Stable"
            env.river_level_m = 3.5
            env.river_capacity_pct = 58.0
            env.river_trend = "Rising"
            env.soil_saturation_pct = 94.0
            env.slope_stability = "Critical / Imminent Slip"
        elif scenario in ['heavy_rainfall', 'cloudburst']:
            env.rainfall_mm += 120.0
            env.rainfall_rate = 142.0
            env.rainfall_intensity = "Cloudburst / Torrential"
            env.rainfall_forecast_trend = "Peaking"
            env.river_level_m = 5.2
            env.river_capacity_pct = 84.0
            env.river_trend = "Rising Rapidly"
            env.soil_saturation_pct = 86.0
            env.slope_stability = "High Risk of Failure"
        else: # combined_emergency / multi_hazard default
            env.rainfall_mm += 140.0
            env.rainfall_rate = 160.0
            env.rainfall_intensity = "Cloudburst / Torrential"
            env.rainfall_forecast_trend = "Peaking"
            env.river_level_m = 6.9
            env.river_capacity_pct = 95.0
            env.river_trend = "Overflowing / Critical Breach"
            env.soil_saturation_pct = 92.0
            env.slope_stability = "Critical / Imminent Slip"
            
        env.updated_at = datetime.utcnow()
        
        # Recalculate risk immediately
        risk_calc = PrototypeRiskAssessmentEngine.evaluate_composite_risk(env, loc)
        ai_explanation = AiIntelligenceService.generate_explanation(loc.name, env, risk_calc)
        risk_calc["ai_explanation"] = ai_explanation
        
        assessment = RiskAssessment.query.filter_by(location_id=loc.id).first()
        if not assessment:
            assessment = RiskAssessment(location_id=loc.id)
            db.session.add(assessment)
            
        assessment.overall_score = risk_calc["overall_score"]
        assessment.overall_level = risk_calc["overall_level"]
        assessment.flash_flood_score = risk_calc["flash_flood_score"]
        assessment.flash_flood_level = risk_calc["flash_flood_level"]
        assessment.flood_score = risk_calc["flood_score"]
        assessment.flood_level = risk_calc["flood_level"]
        assessment.landslide_score = risk_calc["landslide_score"]
        assessment.landslide_level = risk_calc["landslide_level"]
        assessment.heavy_rainfall_score = risk_calc["heavy_rainfall_score"]
        assessment.heavy_rainfall_level = risk_calc["heavy_rainfall_level"]
        assessment.lead_time_minutes = risk_calc["lead_time_minutes"]
        assessment.contributing_factors = risk_calc["contributing_factors"]
        assessment.recommended_action = risk_calc["recommended_action"]
        assessment.ai_explanation = ai_explanation
        assessment.calculated_at = datetime.utcnow()
        
    db.session.commit()
    
    # If emergency was simulated (and not reset), broadcast an active Alert for the primary location
    primary_loc = locations[0]
    if scenario != 'reset':
        created_alert = AlertService.create_alert(
            location_id=primary_loc.id,
            hazard_type="Multi-Hazard (Flash Flood + Landslide)" if scenario == 'combined_emergency' else scenario.replace('_', ' ').title(),
            severity="CRITICAL",
            title=f"CRITICAL WARNING: Rapid Environmental Escalation in {primary_loc.name}",
            message=f"Severe cloudburst and river catchment surge detected in {primary_loc.name}, {primary_loc.state}. Immediate evacuation recommended.",
            radius_km=20.0,
            lead_time_min=30,
            issued_by="PralayWatch Real-Time AI Early Warning Core"
        )
        dispatched_notifs = NotificationService.dispatch_emergency_broadcast(primary_loc, created_alert)
        
    return jsonify({
        "success": True,
        "scenario": scenario,
        "message": f"Simulation '{scenario}' applied successfully.",
        "affected_locations_count": len(locations),
        "alert_created": created_alert.to_dict() if created_alert else None,
        "notifications_dispatched": len(dispatched_notifs)
    }), 200
