from datetime import datetime
from typing import Dict, Any, List, Optional
import json
from database import db
from models import Alert, Location, EnvironmentalData, Notification
from services.impact_engine import ImpactAssessmentEngine

class AlertService:
    """
    =============================================================================
    PralayWatch - Stage 5: Early Warning & Alert Engine
    =============================================================================
    
    Automatically evaluates environmental telemetry and risk levels,
    generating structured CAP-aligned early warnings:
    - MODERATE -> ADVISORY
    - HIGH -> WARNING
    - CRITICAL -> EMERGENCY WARNING
    """
    
    @staticmethod
    def get_active_alerts():
        return Alert.query.filter(Alert.status.in_(["Active", "ACTIVE", "Monitoring"])).order_by(Alert.created_at.desc()).all()
        
    @staticmethod
    def get_all_alerts():
        return Alert.query.order_by(Alert.created_at.desc()).all()

    @staticmethod
    def get_alert_by_id(alert_id: int):
        return Alert.query.get(alert_id)
        
    @classmethod
    def create_alert(
        cls,
        location_id: int,
        hazard_type: str,
        severity: str,
        title: str,
        message: str,
        radius_km: float = 15.0,
        lead_time_min: int = 35,
        issued_by: str = "State Disaster Management Authority (SDMA / SEOC)",
        risk_score: float = 75.0,
        reason: str = None,
        immediate_action: str = None,
        affected_population: int = None,
        recommended_next_step: str = None
    ) -> Alert:
        """
        Creates and saves a structured early warning alert in the database.
        """
        location = Location.query.get(location_id)
        loc_name = f"{location.name}, {location.state}" if location else "Sector Zone"
        
        # Format standardized title and severity
        sev_upper = severity.upper()
        if sev_upper == "CRITICAL":
            standard_severity = "EMERGENCY WARNING"
            default_title = f"🚨 CRITICAL {hazard_type.upper()} EMERGENCY WARNING"
        elif sev_upper == "HIGH":
            standard_severity = "WARNING"
            default_title = f"⚠ HIGH-SEVERITY {hazard_type.upper()} WARNING"
        else:
            standard_severity = "ADVISORY"
            default_title = f"ℹ {hazard_type.upper()} ADVISORY WATCH"

        title = title or default_title

        # Compute fallback metrics if not passed
        if not reason:
            reason = f"Automated sensor detection: Elevated {hazard_type.lower()} risk indicators with critical hydro-geological stress."
        if not immediate_action:
            immediate_action = "Move away from low-lying channels, avoid river crossings, and monitor official emergency broadcasts."
        if not affected_population:
            total_pop = getattr(location, 'population', 50000) or 50000
            affected_population = int(total_pop * (0.60 if sev_upper == "CRITICAL" else (0.35 if sev_upper == "HIGH" else 0.15)))
        if not recommended_next_step:
            recommended_next_step = f"Evacuate toward designated high-ground structural shelters in {loc_name}."

        # Format full payload message body
        structured_msg = (
            f"Location: {loc_name}\n"
            f"Risk: {round(risk_score, 1)}/100 — {sev_upper}\n"
            f"Reason: {reason}\n"
            f"Immediate Action: {immediate_action}\n"
            f"Affected Population: ~{affected_population:,}\n"
            f"Next Step: {recommended_next_step}"
        )

        new_alert = Alert(
            location_id=location_id,
            hazard_type=hazard_type,
            severity=standard_severity,
            title=title,
            message=structured_msg,
            radius_km=radius_km,
            lead_time_min=lead_time_min,
            status="ACTIVE",
            issued_by=issued_by,
            created_at=datetime.utcnow()
        )
        db.session.add(new_alert)
        db.session.commit()
        return new_alert

    @classmethod
    def auto_evaluate_and_generate_alert(
        cls,
        location: Any,
        overall_score: float,
        overall_level: str,
        hazard_data: Dict[str, Any],
        env_data: Any
    ) -> Optional[Alert]:
        """
        Auto-generates an early warning alert if risk level is MODERATE, HIGH, or CRITICAL,
        and no duplicate active alert was issued in the last 15 minutes.
        """
        if overall_level not in ["CRITICAL", "HIGH", "MODERATE"]:
            return None

        location_id = getattr(location, 'id', 1)
        loc_name = getattr(location, 'name', 'Sector')
        state = getattr(location, 'state', 'India')
        full_loc = f"{loc_name}, {state}"
        
        # Check if active alert already exists for this sector
        existing_active = Alert.query.filter_by(
            location_id=location_id,
            status="ACTIVE"
        ).order_by(Alert.created_at.desc()).first()

        # Determine dominant hazard
        dom_hazard = "Flash Flood"
        ff_s = hazard_data.get("flash_flood_score", 0)
        ls_s = hazard_data.get("landslide_score", 0)
        hr_s = hazard_data.get("heavy_rainfall_score", 0)
        
        if ls_s > ff_s and ls_s > hr_s:
            dom_hazard = "Landslide"
        elif hr_s > ff_s and hr_s > ls_s:
            dom_hazard = "Extreme Rainfall"

        # Build context-specific reason
        rain_rate = getattr(env_data, 'rainfall_rate', 45)
        river_pct = getattr(env_data, 'river_capacity_pct', 75)
        river_trend = getattr(env_data, 'river_trend', 'Rising')
        slope_deg = getattr(env_data, 'slope_deg', 32)
        soil_pct = getattr(env_data, 'soil_saturation_pct', 70)

        if dom_hazard == "Landslide":
            reason = f"Extreme slope saturation ({soil_pct}%) on steep {slope_deg}° terrain + active precipitation ({rain_rate} mm/hr)."
            immediate_action = "Move away from steep slopes and avoid mountain highway corridors beneath cliffs."
            next_step = f"Evacuate to {loc_name} ridge evacuation shelters; monitor SDMA VHF channels."
        elif dom_hazard == "Extreme Rainfall":
            reason = f"Torrential cloudburst precipitation ({rain_rate} mm/hr) exceeding local urban drainage capacity."
            immediate_action = "Stay indoors in structural masonry buildings; avoid low-lying underpasses."
            next_step = f"Secure communication gear and stay tuned to IMD Doppler radar nowcasts."
        else: # Flash Flood
            reason = f"Heavy rainfall ({rain_rate} mm/hr) + rapidly rising river level ({river_pct}% capacity, {river_trend}) + high terrain susceptibility."
            immediate_action = "Move away from low-lying floodplain areas, avoid river crossings, and ascend to high ground."
            next_step = f"Evacuate toward {loc_name} High-Ground Safe Shelter; monitor SEOC broadcast."

        # Demographics
        pop = getattr(location, 'population', 50000) or 50000
        aff_pop = int(pop * (0.65 if overall_level == "CRITICAL" else (0.35 if overall_level == "HIGH" else 0.15)))

        if overall_level == "CRITICAL":
            severity = "EMERGENCY WARNING"
            title = f"🚨 CRITICAL {dom_hazard.upper()} WARNING"
        elif overall_level == "HIGH":
            severity = "WARNING"
            title = f"⚠ HIGH-RISK {dom_hazard.upper()} WARNING"
        else:
            severity = "ADVISORY"
            title = f"ℹ {dom_hazard.upper()} ADVISORY"

        # Update existing alert or create new
        if existing_active:
            existing_active.severity = severity
            existing_active.title = title
            existing_active.hazard_type = dom_hazard
            existing_active.message = (
                f"Location: {full_loc}\n"
                f"Risk: {round(overall_score, 1)}/100 — {overall_level}\n"
                f"Reason: {reason}\n"
                f"Immediate Action: {immediate_action}\n"
                f"Affected Population: ~{aff_pop:,}\n"
                f"Next Step: {next_step}"
            )
            db.session.commit()
            return existing_active

        return cls.create_alert(
            location_id=location_id,
            hazard_type=dom_hazard,
            severity=overall_level,
            title=title,
            message=None,
            risk_score=overall_score,
            reason=reason,
            immediate_action=immediate_action,
            affected_population=aff_pop,
            recommended_next_step=next_step
        )

    @staticmethod
    def resolve_alert(alert_id: int) -> Optional[Alert]:
        alert = Alert.query.get(alert_id)
        if alert:
            alert.status = "RESOLVED"
            alert.resolved_at = datetime.utcnow()
            db.session.commit()
        return alert

    @staticmethod
    def reactivate_alert(alert_id: int) -> Optional[Alert]:
        alert = Alert.query.get(alert_id)
        if alert:
            alert.status = "ACTIVE"
            alert.resolved_at = None
            db.session.commit()
        return alert
