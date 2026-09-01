from flask import Blueprint, jsonify, request
from models import Location, RiskAssessment, EnvironmentalData, Alert
from services.risk_engine import PrototypeRiskAssessmentEngine
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
        
    # Recalculate risk on demand from latest environmental telemetry
    risk_calc = PrototypeRiskAssessmentEngine.evaluate_composite_risk(env_data, location)
    
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
        "risk_assessment": latest_assessment.to_dict()
    }), 200
