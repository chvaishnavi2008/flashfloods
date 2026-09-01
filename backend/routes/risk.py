from flask import Blueprint, jsonify, request
from models import Location, RiskAssessment, EnvironmentalData, Alert
from services.risk_engine import PralayWatchRiskEngine, PrototypeRiskAssessmentEngine
from services.pipeline_engine import DisasterIntelligencePipeline
from services.ai_service import AiIntelligenceService
from database import db

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/api/risk', methods=['GET'])
def get_system_risk():
    """
    Returns high-level system status and summary metrics across all monitoring zones.
    """
    locations = Location.query.all()
    high_risk_zones = 0
    critical_zones = 0
    moderate_zones = 0
    low_zones = 0
    
    zone_summaries = []
    
    for loc in locations:
        risk = RiskAssessment.query.filter_by(location_id=loc.id).order_by(RiskAssessment.calculated_at.desc()).first()
        level = risk.overall_level if risk else "LOW"
        score = risk.overall_score if risk else 20.0
        
        if level == "CRITICAL":
            critical_zones += 1
        elif level == "HIGH":
            high_risk_zones += 1
        elif level == "MODERATE":
            moderate_zones += 1
        else:
            low_zones += 1
            
        zone_summaries.append({
            "location_id": loc.id,
            "name": loc.name,
            "state": loc.state,
            "country": loc.country,
            "lat": loc.lat,
            "lng": loc.lng,
            "overall_score": round(score, 1),
            "overall_level": level,
            "flash_flood_level": risk.flash_flood_level if risk else "LOW",
            "landslide_level": risk.landslide_level if risk else "LOW",
            "flood_level": risk.flood_level if risk else "LOW",
            "heavy_rainfall_level": risk.heavy_rainfall_level if risk else "LOW"
        })
        
    active_alerts_count = Alert.query.filter(Alert.status.in_(["Active", "Monitoring"])).count()
    
    system_status = "NORMAL CONDITIONS"
    if critical_zones > 0:
        system_status = "CRITICAL MULTI-HAZARD RISK DETECTED"
    elif high_risk_zones > 0:
        system_status = "HIGH RISK AREAS DETECTED"
    elif moderate_zones > 0:
        system_status = "ELEVATED WEATHER WATCH"
        
    return jsonify({
        "success": True,
        "system_status": system_status,
        "stats": {
            "critical_zones": critical_zones,
            "high_risk_zones": high_risk_zones,
            "moderate_zones": moderate_zones,
            "low_zones": low_zones,
            "total_monitored_zones": len(locations),
            "active_alerts": active_alerts_count,
            "is_simulated_environment": True
        },
        "zones": zone_summaries
    }), 200

@risk_bp.route('/api/risk/<int:location_id>', methods=['GET'])
def get_location_risk(location_id):
    """
    Returns comprehensive risk assessment for a specific location including
    hazard score breakdown, contributing factors, environmental measurements,
    and grounded AI risk explanation.
    """
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"success": False, "error": "Location not found"}), 404
        
    env_data = EnvironmentalData.query.filter_by(location_id=location_id).first()
    if not env_data:
        env_data = EnvironmentalData(location_id=location_id)
        db.session.add(env_data)
        db.session.commit()
        
    # Recalculate risk on demand from latest environmental telemetry via modular pipeline
    risk_calc = PralayWatchRiskEngine.evaluate_composite_risk(env_data, location)
    
    # Generate / update AI explanation
    ai_explanation = AiIntelligenceService.generate_explanation(location.name, env_data, risk_calc)
    risk_calc["ai_explanation"] = ai_explanation
    
    # Save/Update latest assessment
    latest_assessment = RiskAssessment.query.filter_by(location_id=location_id).first()
    if not latest_assessment:
        latest_assessment = RiskAssessment(location_id=location_id)
        db.session.add(latest_assessment)
        
    latest_assessment.overall_score = risk_calc["overall_score"]
    latest_assessment.overall_level = risk_calc["overall_level"]
    latest_assessment.flash_flood_score = risk_calc["flash_flood_score"]
    latest_assessment.flash_flood_level = risk_calc["flash_flood_level"]
    latest_assessment.flood_score = risk_calc["flood_score"]
    latest_assessment.flood_level = risk_calc["flood_level"]
    latest_assessment.landslide_score = risk_calc["landslide_score"]
    latest_assessment.landslide_level = risk_calc["landslide_level"]
    latest_assessment.heavy_rainfall_score = risk_calc["heavy_rainfall_score"]
    latest_assessment.heavy_rainfall_level = risk_calc["heavy_rainfall_level"]
    latest_assessment.lead_time_minutes = risk_calc["lead_time_minutes"]
    latest_assessment.contributing_factors = risk_calc["contributing_factors"]
    latest_assessment.recommended_action = risk_calc["recommended_action"]
    latest_assessment.ai_explanation = ai_explanation
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "location": location.to_dict(),
        "environmental_data": env_data.to_dict(),
        "risk_assessment": latest_assessment.to_dict(),
        "impact_assessment": risk_calc.get("impact_assessment", {}),
        "pipeline_stages": risk_calc.get("pipeline_stages", {}),
        # Structured single-hazard outputs for convenience
        "hazard_details": {
            "flash_flood": risk_calc.get("flash_flood"),
            "landslide": risk_calc.get("landslide"),
            "extreme_rainfall": risk_calc.get("extreme_rainfall")
        }
    }), 200

@risk_bp.route('/api/risk/<int:location_id>/hazard/<string:hazard_key>', methods=['GET'])
def get_single_hazard_risk(location_id, hazard_key):
    """
    Returns structured risk payload for a specific hazard at a specific location:
    Example output format:
    {
      "location": "Chamoli",
      "hazard": "Flash Flood",
      "riskScore": 84,
      "riskLevel": "CRITICAL",
      "confidence": 0.87,
      "factors": [...],
      "recommendedActions": [...]
    }
    """
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"success": False, "error": "Location not found"}), 404
        
    env_data = EnvironmentalData.query.filter_by(location_id=location_id).first()
    if not env_data:
        env_data = EnvironmentalData(location_id=location_id)
        db.session.add(env_data)
        db.session.commit()

    # Map aliases
    mapped_key = "heavy_rainfall" if hazard_key in ["extreme_rainfall", "heavy_rainfall"] else (
        "flood" if hazard_key in ["riverine_flood", "flood"] else hazard_key
    )

    try:
        result = PralayWatchRiskEngine.evaluate_hazard(mapped_key, env_data, location)
        return jsonify(result), 200
    except ValueError as err:
        return jsonify({"success": False, "error": str(err)}), 400

@risk_bp.route('/api/risk/evaluate', methods=['POST'])
def evaluate_custom_risk():
    """
    Direct Risk Engine evaluation endpoint accepting custom JSON inputs:
    POST /api/risk/evaluate
    {
      "location": "Chamoli",
      "rainfall_intensity": 85.0,
      "accumulated_rainfall": 120.0,
      "river_water_level": 5.8,
      "river_capacity_pct": 86.0,
      "river_trend": "Rising Rapidly",
      "slope": 34.0,
      "elevation": 2200,
      "soil_susceptibility": 82.0,
      "historical_flood_risk": 70.0,
      "historical_landslide_risk": 75.0,
      "population": 20000,
      "hazard": "Flash Flood"  # Optional: to get single hazard or full breakdown
    }
    """
    payload = request.get_json() or {}
    
    # If a specific hazard was requested, evaluate that specific predictor
    target_hazard = payload.get("hazard", payload.get("hazard_type"))
    if target_hazard:
        hazard_map = {
            "flash flood": "flash_flood",
            "flash_flood": "flash_flood",
            "landslide": "landslide",
            "extreme rainfall": "heavy_rainfall",
            "extreme_rainfall": "heavy_rainfall",
            "heavy_rainfall": "heavy_rainfall",
            "heavy rainfall": "heavy_rainfall",
            "riverine flood": "flood",
            "flood": "flood",
            "cyclone": "cyclone",
            "glof": "glof"
        }
        h_key = hazard_map.get(str(target_hazard).lower(), "flash_flood")
        
        env_dict = {
            "rainfall_rate": float(payload.get("rainfall_intensity", payload.get("rainfall_rate", 5.0))),
            "rainfall_mm": float(payload.get("accumulated_rainfall", payload.get("rainfall_mm", 25.0))),
            "rainfall_forecast_trend": str(payload.get("rainfall_forecast", payload.get("rainfall_forecast_trend", "Stable"))),
            "forecast_rainfall_mm": float(payload.get("forecast_rainfall_mm", 0.0)),
            "duration_hours": float(payload.get("duration", payload.get("duration_hours", 2.0))),
            "river_level_m": float(payload.get("river_water_level", payload.get("river_level_m", 2.1))),
            "river_capacity_pct": float(payload.get("river_capacity_pct", 35.0)),
            "river_trend": str(payload.get("river_trend", "Normal")),
            "soil_saturation_pct": float(payload.get("soil_susceptibility", payload.get("soil_saturation_pct", 45.0))),
            "slope_deg": float(payload.get("slope", payload.get("slope_deg", 30.0))),
            "wind_speed_kmh": float(payload.get("wind_speed_kmh", 25.0))
        }
        
        loc_dict = {
            "name": payload.get("location", payload.get("location_name", "Custom Sector")),
            "elevation": float(payload.get("elevation", 1500.0)),
            "terrain_type": str(payload.get("terrain_type", "Mountainous / Valley")),
            "population": int(payload.get("population", 50000)),
            "is_vulnerable": bool(payload.get("is_vulnerable", True)),
            "historical_flood_risk": float(payload.get("historical_flood_risk", 60.0)),
            "historical_landslide_risk": float(payload.get("historical_landslide_risk", 65.0))
        }
        
        single_res = PralayWatchRiskEngine.evaluate_hazard(h_key, env_dict, loc_dict)
        return jsonify(single_res), 200

    # Otherwise return full composite evaluation with all hazard breakdowns
    result = PralayWatchRiskEngine.evaluate_custom_payload(payload)
    return jsonify(result), 200

@risk_bp.route('/api/pipeline/<int:location_id>', methods=['GET'])
def get_pipeline_trace(location_id):
    """
    Returns the complete 6-stage Disaster Intelligence Pipeline trace:
    DATA -> RISK ANALYSIS -> HAZARD PREDICTION -> IMPACT ASSESSMENT -> EARLY WARNING -> ACTION RECOMMENDATION
    """
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"success": False, "error": "Location not found"}), 404
        
    env_data = EnvironmentalData.query.filter_by(location_id=location_id).first()
    if not env_data:
        env_data = EnvironmentalData(location_id=location_id)
        db.session.add(env_data)
        db.session.commit()
        
    pipeline_result = DisasterIntelligencePipeline.execute_pipeline(env_data, location)
    return jsonify(pipeline_result), 200
