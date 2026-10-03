import { DisasterType, EmergencyStatus, LocationCoordinates, RiskLevel } from "./location";

export interface IncidentMetrics {
  waterLevelMeters: number;
  waterLevelTrend: "RISING_RAPID" | "RISING_SLOW" | "STABLE" | "RECEDING";
  rainfallRateMmPerHour: number;
  dischargeCusecs?: number;
  riverBasinName: string;
  affectedPopulationEstimated: number;
  confirmedEvacuated: number;
  reportedStranded: number;
  criticalInfrastructureAtRisk: number;
  activeHazardsCount: number;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  disasterType: DisasterType;
  severity: RiskLevel;
  status: EmergencyStatus;
  primaryLocation: LocationCoordinates;
  detectedAt: string;
  lastUpdatedAt: string;
  metrics: IncidentMetrics;
  commandChief: string;
  operationalSummary: string;
  primaryThreats: string[];
}
