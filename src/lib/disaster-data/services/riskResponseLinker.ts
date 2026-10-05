import { AreaRiskAssessment, RiskLevel } from "../types";
import {
  Incident,
  ResourceAllocation,
  ResourceAllocationState,
  ResponsePlan,
  TimelineEvent,
  Zone,
} from "@/types";
import { generateResponsePlan } from "@/lib/responseEngine";

export interface RecommendedRiskResponse {
  evacuationRoute: string;
  targetShelter: string;
  recommendedAllocation: ResourceAllocation;
  immediateActions: string[];
  summary: string;
}

export interface RiskResponseLinkerResult {
  riskScore: number;
  riskLevel: RiskLevel;
  areaName: string;
  shortName: string;
  affectedPopulation: number;
  availableResources: ResourceAllocation;
  recommendedResponse: RecommendedRiskResponse;
  activityEvent: {
    title: string;
    description: string;
    category: "ANALYSIS" | "DECISION" | "DETECTION";
    severity: "CRITICAL" | "WARNING" | "INFO";
    authorOrSystem: string;
  };
  commanderAlert: {
    code: string;
    title: string;
    message: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  };
  n8nPayload: {
    event: string;
    area: string;
    riskScore: number;
    riskLevel: RiskLevel;
    affectedPopulation: number;
    recommendedRoute: string;
    recommendedShelter: string;
    requiresApproval: boolean;
  };
}

/**
 * Connects Live Disaster Risk Intelligence to the existing RESQNET Response Engine.
 * 
 * Pipeline:
 * Risk Engine
 * → Create Risk Forecast
 * → Check affected population
 * → Check resources
 * → Generate recommended response
 * → Create activity event
 * → Notify commander
 * → Optionally trigger n8n workflow
 * 
 * Safety Rule:
 * Do NOT automatically perform irreversible emergency actions.
 */
export function evaluateRiskForResponse(
  assessment: AreaRiskAssessment,
  zones: Zone[],
  incident: Incident,
  resourceState: ResourceAllocationState
): RiskResponseLinkerResult {
  const riskScore = assessment.riskScore;
  const riskLevel = assessment.riskLevel;
  const areaName = assessment.areaName;
  const shortName =
    assessment.shortName ||
    (areaName.includes(" - ") ? areaName.split(" - ")[0] : areaName);

  // 1. Check affected population for the zone
  const matchingZone = zones.find(
    (z) =>
      z.code.toLowerCase().includes(shortName.toLowerCase()) ||
      z.name.toLowerCase().includes(shortName.toLowerCase())
  );
  const affectedPopulation =
    matchingZone?.populationEstimate ||
    incident.metrics?.affectedPopulationEstimated ||
    (shortName.includes("A") ? 1240 : shortName.includes("B") ? 3100 : 4200);

  // 2. Check available resources from fleet
  const availableResources = resourceState.available;

  // 3. Generate recommended response (deterministic decision aid)
  const isCritical = riskLevel === "CRITICAL" || riskScore >= 75;
  const isEscalated =
    riskScore >= 90 ||
    affectedPopulation >= 2000 ||
    incident.blockedRoads?.includes("R2");

  const evacuationRoute = isEscalated ? "R4" : "R2";
  const targetShelter = isEscalated ? "Shelter C" : "Shelter B";

  const recommendedAllocation: ResourceAllocation = isEscalated
    ? {
        ambulances: Math.min(availableResources.ambulances, 4),
        rescueTeams: Math.min(availableResources.rescueTeams, 3),
        drones: Math.min(availableResources.drones, 2),
      }
    : {
        ambulances: Math.min(availableResources.ambulances, 2),
        rescueTeams: Math.min(availableResources.rescueTeams, 2),
        drones: Math.min(availableResources.drones, 1),
      };

  const immediateActions = isCritical
    ? [
        `Pre-stage ${recommendedAllocation.ambulances} Ambulances & ${recommendedAllocation.rescueTeams} Rescue Teams at Station North`,
        `Designate Route ${evacuationRoute} → ${targetShelter} mandatory evacuation corridor`,
        `Deploy UAV Drone for real-time aerial survey of embankment crest`,
        `Alert ${targetShelter} triage staff for influx of ~${affectedPopulation.toLocaleString()} citizens`,
      ]
    : [
        `Place ${recommendedAllocation.ambulances} Ambulances on high-readiness alert`,
        `Monitor Route ${evacuationRoute} water depth telemetry continuously`,
        `Pre-alert ${targetShelter} coordination cell`,
      ];

  const summary = `Evacuate ${shortName} via Route ${evacuationRoute} → ${targetShelter}. Recommended Allocation: ${recommendedAllocation.ambulances} Ambulances, ${recommendedAllocation.rescueTeams} Rescue Teams, ${recommendedAllocation.drones} UAV.`;

  // 4. Activity event payload
  const activityEvent = {
    title: `Live Risk Engine Alert: ${shortName} (${riskLevel} - ${riskScore}/100)`,
    description: `Risk assessment registered ${riskScore}/100. Evaluated ${affectedPopulation.toLocaleString()} citizens exposed. Available: ${availableResources.ambulances} Amb, ${availableResources.rescueTeams} Teams, ${availableResources.drones} UAVs. Recommended: ${summary} Awaiting commander authorization.`,
    category: "ANALYSIS" as const,
    severity: isCritical ? ("CRITICAL" as const) : ("WARNING" as const),
    authorOrSystem: "RESQNET Risk Engine & Response Linker",
  };

  // 5. Commander alert notification
  const commanderAlert = {
    code: isCritical ? "CRIT-RISK" : "HIGH-RISK",
    title: `${isCritical ? "CRITICAL" : "HIGH"} RISK DETECTED: ${shortName}`,
    message: `Risk Score: ${riskScore}/100. Population: ${affectedPopulation.toLocaleString()}. Commander review required before dispatch.`,
    severity: isCritical ? ("CRITICAL" as const) : ("HIGH" as const),
  };

  // 6. n8n workflow payload
  const n8nPayload = {
    event: "LIVE_RISK_ASSESSMENT_HIGH_CRITICAL",
    area: shortName,
    riskScore,
    riskLevel,
    affectedPopulation,
    recommendedRoute: evacuationRoute,
    recommendedShelter: targetShelter,
    requiresApproval: true,
  };

  return {
    riskScore,
    riskLevel,
    areaName,
    shortName,
    affectedPopulation,
    availableResources,
    recommendedResponse: {
      evacuationRoute,
      targetShelter,
      recommendedAllocation,
      immediateActions,
      summary,
    },
    activityEvent,
    commanderAlert,
    n8nPayload,
  };
}

/**
 * Invokes the existing deterministic response engine to build a full ResponsePlan
 * from a live risk assessment.
 */
export function buildResponsePlanFromRisk(
  assessment: AreaRiskAssessment,
  incident: Incident
): ResponsePlan {
  // Use existing response engine
  const basePlan = generateResponsePlan(incident);

  const shortName =
    assessment.shortName ||
    (assessment.areaName.includes(" - ")
      ? assessment.areaName.split(" - ")[0]
      : assessment.areaName);

  return {
    ...basePlan,
    id: `plan-risk-${Date.now()}`,
    priorityZones: [shortName],
    approvalRequired: true, // Human approval guardrail preserved
    decisionEngine: "DETERMINISTIC",
  };
}
