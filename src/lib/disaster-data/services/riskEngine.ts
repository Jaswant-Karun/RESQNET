import {
  AreaRiskAssessment,
  RiskFactorContribution,
  RiskLevel,
  WeatherDataPoint,
  GdacsAlertEvent,
} from "../types";
import { MonitoredLocation } from "../providers/weatherProvider";

export interface RiskEngineInput {
  location: MonitoredLocation;
  weather?: WeatherDataPoint;
  nearbyAlerts?: GdacsAlertEvent[];
  activeIncident?: {
    location?: string;
    waterLevelMeters?: number;
    affectedPopulation?: number;
    blockedRoads?: string[];
  };
  simulationStage?: "NORMAL" | "FLOOD_ACTIVE" | "ESCALATED";
}

/**
 * Maps deterministic numerical score (0-100) to RiskLevel
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

/**
 * RESQNET Deterministic Disaster Risk Engine
 * 
 * Computes transparent, auditable 0-100 risk score based on:
 * 1. Forecast Rainfall (Open-Meteo)
 * 2. Precipitation Probability (Open-Meteo)
 * 3. Existing Flood Incidents / Hydro telemetry
 * 4. Blocked arterial evacuation roads
 * 5. Population exposure in sector
 * 6. Topographical elevation & drainage vulnerability
 * 7. Nearby GDACS/regional disaster alerts
 * 
 * IMPORTANT:
 * - This engine calculates the numerical score deterministically.
 * - Gemini NEVER invents or alters this numerical score.
 * - Labeled as: "RESQNET Risk Assessment"
 */
export function calculateAreaRisk(input: RiskEngineInput): AreaRiskAssessment {
  const { location, weather, nearbyAlerts, activeIncident, simulationStage } = input;
  const factors: RiskFactorContribution[] = [];

  let baseScore = 0;

  // 1. FORECAST RAINFALL (0 to 25 points)
  const rain = weather?.precipitationMm ?? 0;
  if (rain >= 40) {
    baseScore += 25;
    factors.push({
      name: "Heavy Forecast Rainfall",
      category: "WEATHER",
      weight: 25,
      description: `Projected heavy precipitation exceeding ${rain.toFixed(1)} mm/hr over sector catchment.`,
      observedValue: `${rain.toFixed(1)} mm/hr`,
    });
  } else if (rain >= 20) {
    baseScore += 16;
    factors.push({
      name: "Moderate Forecast Rainfall",
      category: "WEATHER",
      weight: 16,
      description: `Moderate precipitation forecast of ${rain.toFixed(1)} mm/hr.`,
      observedValue: `${rain.toFixed(1)} mm/hr`,
    });
  } else if (rain >= 5) {
    baseScore += 8;
    factors.push({
      name: "Light Forecast Precipitation",
      category: "WEATHER",
      weight: 8,
      description: `Light precipitation of ${rain.toFixed(1)} mm/hr.`,
      observedValue: `${rain.toFixed(1)} mm/hr`,
    });
  }

  // 2. PRECIPITATION PROBABILITY (0 to 15 points)
  const prob = weather?.precipitationProbability ?? 0;
  if (prob >= 80) {
    baseScore += 15;
    factors.push({
      name: "High Precipitation Probability",
      category: "WEATHER",
      weight: 15,
      description: `Meteorological model indicates ${prob}% certainty of immediate sustained downpour.`,
      observedValue: `${prob}%`,
    });
  } else if (prob >= 50) {
    baseScore += 8;
    factors.push({
      name: "Moderate Precipitation Probability",
      category: "WEATHER",
      weight: 8,
      description: `Forecast probability of ${prob}%.`,
      observedValue: `${prob}%`,
    });
  }

  // 3. EXISTING FLOOD INCIDENT / TELEMETRY (0 to 25 points)
  const isPrimaryInundationArea =
    location.id === "loc-kotturpuram" ||
    (location.id === "loc-saidapet" && simulationStage === "ESCALATED");

  const waterLevel = activeIncident?.waterLevelMeters ?? 2.4;

  if (isPrimaryInundationArea) {
    const incPoints = waterLevel >= 3.0 ? 25 : 20;
    baseScore += incPoints;
    factors.push({
      name: "Existing Flood Incident",
      category: "INCIDENT",
      weight: incPoints,
      description: `Active river embankment breach confirmed. Hydro sensor telemetry registers water level at ${waterLevel}m.`,
      observedValue: `${waterLevel}m depth`,
    });
  }

  // 4. BLOCKED ROADS / EVACUATION ROUTE COMPROMISED (0 to 15 points)
  const isRoadBlocked =
    isPrimaryInundationArea ||
    (activeIncident?.blockedRoads && activeIncident.blockedRoads.length > 0);

  if (isRoadBlocked) {
    const roadPoints = simulationStage === "ESCALATED" ? 15 : 10;
    baseScore += roadPoints;
    factors.push({
      name: "Blocked Evacuation Route",
      category: "INFRASTRUCTURE",
      weight: roadPoints,
      description: "Critical arterial roads (R1 Causeway & R3 Canal Link) submerged under >140cm water.",
      observedValue: "Corridors Impassable",
    });
  }

  // 5. POPULATION EXPOSURE (0 to 12 points)
  const pop = activeIncident?.affectedPopulation ?? 1240;
  if (isPrimaryInundationArea) {
    const popPoints = pop > 2000 ? 12 : 8;
    baseScore += popPoints;
    factors.push({
      name: "High Population Exposure",
      category: "VULNERABILITY",
      weight: popPoints,
      description: `Estimated ${pop.toLocaleString()} residents residing within active flood inundation contour.`,
      observedValue: `${pop.toLocaleString()} citizens`,
    });
  }

  // 6. TOPOGRAPHICAL ELEVATION BUFFER (0 to 10 points for low elevation, or deduction for high ground)
  if (location.elevationMeters <= 5.5) {
    baseScore += 10;
    factors.push({
      name: "Low-Lying Catchment Basin",
      category: "VULNERABILITY",
      weight: 10,
      description: `Ground elevation is only ${location.elevationMeters}m above sea level, vulnerable to gravity accumulation.`,
      observedValue: `${location.elevationMeters}m MSL`,
    });
  } else if (location.elevationMeters >= 12.0) {
    // Highland buffer reduces risk
    baseScore = Math.max(0, baseScore - 12);
    factors.push({
      name: "Elevated High-Ground Buffer",
      category: "INFRASTRUCTURE",
      weight: -12,
      description: `Elevation of ${location.elevationMeters}m MSL provides positive drainage gradient and reduced pooling.`,
      observedValue: `${location.elevationMeters}m MSL`,
    });
  }

  // 7. NEARBY REGIONAL DISASTER ALERTS (0 to 8 points)
  if (nearbyAlerts && nearbyAlerts.length > 0) {
    baseScore += 5;
    factors.push({
      name: "Active Regional Disaster Alerts",
      category: "REGIONAL_ALERTS",
      weight: 5,
      description: `GDACS active regional warning logged (${nearbyAlerts[0]?.hazardType || "Flood"} Alert: ${nearbyAlerts[0]?.severity || "Orange"}).`,
      observedValue: `${nearbyAlerts.length} regional alerts`,
    });
  }

  // Ensure score is clamped strictly between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)));
  const riskLevel = getRiskLevelFromScore(finalScore);

  // Generate transparent deterministic explanation
  const topFactorNames = factors
    .filter((f) => f.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((f) => f.name);

  const explanation = `${location.name} is assessed at Risk Score ${finalScore}/100 (${riskLevel}). Primary risk drivers: ${topFactorNames.slice(0, 3).join(", ") || "Normal background conditions"}.`;

  return {
    areaId: location.id,
    areaName: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    elevationMeters: location.elevationMeters,
    riskScore: finalScore,
    riskLevel,
    classification: "RESQNET_RISK_ASSESSMENT",
    contributingFactors: factors,
    explanation,
    label: "RESQNET Risk Assessment",
    disclaimer:
      "RESQNET deterministic risk assessment for emergency coordination. Not an official government meteorological warning.",
    weatherSnapshot: weather,
    timestamp: new Date().toISOString(),
  };
}
