/**
 * RESQNET Live Disaster Risk Intelligence Data Types
 * 
 * Strict Taxonomy:
 * 1. OBSERVED / REPORTED EVENTS (Verified external reports, GDACS, FIRMS)
 * 2. FORECAST CONDITIONS (Meteorological projections, Open-Meteo)
 * 3. RESQNET RISK ASSESSMENT (Deterministic internal calculations)
 * 4. SIMULATED EVENTS (Controlled exercise scenarios)
 */

export type EventClassification =
  | "OBSERVED_REPORTED"
  | "FORECAST_CONDITION"
  | "RESQNET_RISK_ASSESSMENT"
  | "SIMULATED_EVENT";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface ProviderStatus {
  name: string;
  sourceId: "OPEN_METEO" | "GDACS" | "NASA_FIRMS";
  status: "CONNECTED" | "UNAVAILABLE";
  lastUpdated: string;
  latencyMs?: number;
  message?: string;
  itemsCount: number;
}

export interface WeatherDataPoint {
  areaId: string;
  areaName: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  precipitationMm: number;
  precipitationProbability: number;
  rainMm: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescription: string;
  classification: "FORECAST_CONDITION";
  timestamp: string;
}

export interface GdacsAlertEvent {
  source: "GDACS";
  eventId: string;
  hazardType: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: string;
  sourceUrl: string;
  detectedAt: string;
  updatedAt: string;
  classification: "OBSERVED_REPORTED";
}

export interface FirmsFireDetection {
  source: "NASA_FIRMS";
  latitude: number;
  longitude: number;
  confidence: string | number;
  detectedAt: string;
  satellite: string;
  hazardType: "FIRE";
  brightness?: number;
  classification: "OBSERVED_REPORTED";
}

export interface RiskFactorContribution {
  name: string;
  category: "WEATHER" | "INCIDENT" | "INFRASTRUCTURE" | "VULNERABILITY" | "REGIONAL_ALERTS";
  weight: number; // 0 to 100 contribution
  description: string;
  observedValue?: string | number;
}

export interface AreaRiskAssessment {
  areaId: string;
  areaName: string;
  shortName?: string; // e.g. "Zone A"
  hazard?: string; // e.g. "Flood"
  forecastWindow?: string; // e.g. "Next 24 hours"
  latitude: number;
  longitude: number;
  polygonCoordinates?: [number, number][];
  radiusMeters?: number;
  elevationMeters?: number;
  riskScore: number; // 0–100 deterministic
  riskLevel: RiskLevel; // LOW (0-24), MODERATE (25-49), HIGH (50-74), CRITICAL (75-100)
  classification: "RESQNET_RISK_ASSESSMENT";
  contributingFactors: RiskFactorContribution[];
  explanation: string;
  label: "RESQNET Risk Assessment" | "FORECAST / RISK ASSESSMENT";
  disclaimer: "RESQNET deterministic risk assessment for emergency coordination. Not an official government meteorological warning." | "NOT AN OFFICIAL EMERGENCY WARNING";
  dataSources?: string[];
  weatherSnapshot?: WeatherDataPoint;
  timestamp: string;
}

export interface LiveDisasterIntelligencePayload {
  timestamp: string;
  providerStatuses: ProviderStatus[];
  weatherForecasts: WeatherDataPoint[];
  gdacsAlerts: GdacsAlertEvent[];
  fireDetections: FirmsFireDetection[];
  riskAssessments: AreaRiskAssessment[];
  highestRiskArea: AreaRiskAssessment;
  disclaimer: string;
}
