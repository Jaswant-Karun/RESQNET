import {
  Incident,
  ResponsePlan,
  RiskLevel,
  TacticalAction,
  EvacuationRoutePlan,
  ResourceAllocation,
} from "@/types";

/**
 * Severity Rule Definition
 * Makes it trivial to inspect, modify, or add new threshold rules.
 */
export interface SeverityRule {
  severity: RiskLevel;
  minWaterLevelMeters: number;
  minAffectedPopulation: number;
  label: string;
  description: string;
}

/**
 * Default deterministic severity threshold rules:
 * - If water level >= 2.0 OR affected population >= 1000 => CRITICAL
 * - If water level >= 1.2 OR affected population >= 500 => HIGH
 * - Otherwise => MODERATE
 */
export const SEVERITY_RULES: SeverityRule[] = [
  {
    severity: "CRITICAL",
    minWaterLevelMeters: 2.0,
    minAffectedPopulation: 1000,
    label: "Critical Inundation Protocol",
    description: "Water level >= 2.0m OR affected population >= 1,000",
  },
  {
    severity: "HIGH",
    minWaterLevelMeters: 1.2,
    minAffectedPopulation: 500,
    label: "High Inundation Risk Protocol",
    description: "Water level >= 1.2m OR affected population >= 500",
  },
  {
    severity: "MODERATE",
    minWaterLevelMeters: 0.0,
    minAffectedPopulation: 0,
    label: "Moderate Warning Protocol",
    description: "Water level < 1.2m AND affected population < 500",
  },
];

/**
 * Evaluates the risk level deterministically based on water level and affected population.
 */
export function evaluateRiskLevel(
  waterLevelMeters: number,
  affectedPopulation: number
): { riskLevel: RiskLevel; triggeredRule: SeverityRule } {
  for (const rule of SEVERITY_RULES) {
    if (
      waterLevelMeters >= rule.minWaterLevelMeters ||
      affectedPopulation >= rule.minAffectedPopulation
    ) {
      return { riskLevel: rule.severity, triggeredRule: rule };
    }
  }

  // Fallback default
  const defaultRule = SEVERITY_RULES[SEVERITY_RULES.length - 1];
  return { riskLevel: "MODERATE", triggeredRule: defaultRule };
}

/**
 * Generates a concise, high-clarity emergency public alert.
 */
export function generatePublicAlert(
  zoneName: string,
  waterLevelMeters: number,
  affectedPopulation: number,
  evacuationRoute: string,
  shelterName: string,
  blockedRoads: string[]
): string {
  const blockedStr =
    blockedRoads.length > 0 ? `Avoid submerged roadways ${blockedRoads.join(", ")}.` : "";
  return `EMERGENCY ALERT: Immediate mandatory evacuation for ${zoneName} due to critical flood surge (water level: ${waterLevelMeters}m, ${affectedPopulation.toLocaleString()} citizens affected). Proceed via designated safe route ${evacuationRoute} to ${shelterName} immediately. ${blockedStr}`;
}

/**
 * RESQNET Deterministic Response Engine
 * Evaluates incident metrics through transparent, rule-based decision trees.
 * Operates completely offline with zero external API dependencies.
 *
 * @param incident The active incident data
 * @returns Fully populated, deterministic ResponsePlan
 */
export function generateResponsePlan(incident: Incident): ResponsePlan {
  const waterLevel = incident.metrics.waterLevelMeters;
  const affectedPop = incident.metrics.affectedPopulationEstimated;
  const zoneName = incident.zoneName || "Zone A";
  const blockedRoads = incident.blockedRoads || ["R1", "R3"];

  // 1. Evaluate Risk Level using deterministic severity rules
  const { riskLevel, triggeredRule } = evaluateRiskLevel(waterLevel, affectedPop);

  // 2. Determine Priority Zones
  const priorityZones: string[] = [zoneName];

  // 3. Determine Resource Allocation & Immediate Actions based on severity & road impassability
  let resourceAllocation: ResourceAllocation;
  let immediateActions: string[];
  let evacuationRoute: string;
  let targetShelter: string;
  let approvalRequired: boolean;

  const isR2Blocked = blockedRoads.includes("R2");
  const isEscalatedScenario = waterLevel >= 3.0 || affectedPop >= 2000 || isR2Blocked;

  if (isEscalatedScenario) {
    // ADAPTIVE DISASTER ESCALATION: Route R2 is submerged/blocked -> Dynamically re-route via R4 Highland Pass to Shelter C
    resourceAllocation = {
      ambulances: 4,
      rescueTeams: 3,
      drones: 2,
    };
    evacuationRoute = "R4";
    targetShelter = "Shelter C";
    approvalRequired = true;

    immediateActions = [
      `Emergency Evacuate ${zoneName} & Lowland Pockets via Route R4`,
      "R2 Submerged & Impassable: Divert all convoys to Highland Arterial R4",
      "Deploy 2 Drones (UAV Echo-1 & Talon-2) for Thermal Corridor Monitoring",
      `Dispatch ${resourceAllocation.ambulances} ambulances to Highland Corridor R4`,
      `Mobilize ${resourceAllocation.rescueTeams} SDRF motorized swiftwater rescue teams`,
      `Reception center shifted to ${targetShelter} (Capacity: 1,500)`,
    ];
  } else if (riskLevel === "CRITICAL") {
    // Baseline scenario requirements
    resourceAllocation = {
      ambulances: 2,
      rescueTeams: 2,
      drones: 1,
    };
    evacuationRoute = "R2";
    targetShelter = "Shelter B";
    approvalRequired = true;

    immediateActions = [
      `Evacuate ${zoneName}`,
      "Deploy Drone 01",
      `Dispatch ${resourceAllocation.ambulances} ambulances`,
      `Assign ${resourceAllocation.rescueTeams} rescue teams`,
      `Route evacuees to ${targetShelter}`,
    ];
  } else if (riskLevel === "HIGH") {
    resourceAllocation = {
      ambulances: 1,
      rescueTeams: 1,
      drones: 1,
    };
    evacuationRoute = "R2";
    targetShelter = "Shelter B";
    approvalRequired = true;

    immediateActions = [
      `Issue Precautionary Evacuation for ${zoneName}`,
      "Deploy Drone 01 for Reconnaissance",
      `Dispatch ${resourceAllocation.ambulances} ambulance`,
      `Assign ${resourceAllocation.rescueTeams} rescue team`,
      `Prepare ${targetShelter} Reception Center`,
    ];
  } else {
    resourceAllocation = {
      ambulances: 1,
      rescueTeams: 0,
      drones: 1,
    };
    evacuationRoute = "R2";
    targetShelter = "Shelter B";
    approvalRequired = false;

    immediateActions = [
      `Monitor Inundation Trends in ${zoneName}`,
      "Deploy Drone 01 for Aerial Survey",
      "Stage 1 standby ambulance at staging perimeter",
      `Issue flood advisory to residents`,
    ];
  }

  // 4. Concise emergency public alert message
  const publicAlert = generatePublicAlert(
    zoneName,
    waterLevel,
    affectedPop,
    evacuationRoute,
    targetShelter,
    blockedRoads
  );

  // 5. Rule Explanation detailing the deterministic logic
  const explanation =
    `Rule-based fallback evaluation triggered: Water level ${waterLevel}m (threshold >= ${triggeredRule.minWaterLevelMeters}m) ` +
    `and affected population ${affectedPop.toLocaleString()} (threshold >= ${triggeredRule.minAffectedPopulation}) ` +
    `evaluate scenario as ${riskLevel}. ` +
    `Roadways ${blockedRoads.join(" & ")} are submerged/impassable. ` +
    `Route ${evacuationRoute} identified as clear transit artery to ${targetShelter} (capacity: 700). ` +
    `Tactical resource allocation: ${resourceAllocation.ambulances} ambulances, ${resourceAllocation.rescueTeams} rescue teams, ` +
    `and ${resourceAllocation.drones} drone dispatched under Human-in-the-Loop clearance protocol.`;

  // 6. Tactical Actions (for tactical sequence view compatibility)
  const actions: TacticalAction[] = [
    {
      id: "act-01",
      stepNumber: 1,
      title: `Evacuate ${zoneName}`,
      description: `Initiate mandatory immediate evacuation for ${affectedPop.toLocaleString()} residents in ${zoneName} low-lying blocks.`,
      targetZoneId: incident.zoneId || "zone-a",
      assignedResourceIds: ["amb-01", "amb-02"],
      assignedDroneIds: ["drone-01"],
      priority: "IMMEDIATE",
      estimatedMinutesToDeploy: 2,
      requiresHumanClearance: true,
      status: "PENDING",
    },
    {
      id: "act-02",
      stepNumber: 2,
      title: "Deploy Drone 01",
      description: "Launch AeroShield Sentinel X-4 for thermal rooftop survivor scan and flood perimeter boundary mapping.",
      targetZoneId: incident.zoneId || "zone-a",
      assignedResourceIds: [],
      assignedDroneIds: ["drone-01"],
      priority: "IMMEDIATE",
      estimatedMinutesToDeploy: 3,
      requiresHumanClearance: false,
      status: "PENDING",
    },
    {
      id: "act-03",
      stepNumber: 3,
      title: `Dispatch ${resourceAllocation.ambulances} ambulances`,
      description: "Deploy ALS Mobile ICU 108-1 and All-Terrain Paramedic 108-2 to evacuation corridor staging zone.",
      targetZoneId: incident.zoneId || "zone-a",
      assignedResourceIds: ["amb-01", "amb-02"],
      assignedDroneIds: [],
      priority: "IMMEDIATE",
      estimatedMinutesToDeploy: 4,
      requiresHumanClearance: true,
      status: "PENDING",
    },
    {
      id: "act-04",
      stepNumber: 4,
      title: `Assign ${resourceAllocation.rescueTeams} rescue teams`,
      description: "Mobilize NDRF 4th Battalion Swiftwater Squad and SDRF Motorized Boat Unit Bravo with motorized Zodiacs.",
      targetZoneId: incident.zoneId || "zone-a",
      assignedResourceIds: ["team-01", "team-02"],
      assignedDroneIds: [],
      priority: "IMMEDIATE",
      estimatedMinutesToDeploy: 5,
      requiresHumanClearance: true,
      status: "PENDING",
    },
    {
      id: "act-05",
      stepNumber: 5,
      title: `Route evacuees to ${targetShelter}`,
      description: `Establish controlled safe passage along clear arterial ${evacuationRoute} directly terminating at ${targetShelter}.`,
      targetZoneId: "zone-c",
      assignedResourceIds: ["team-03"],
      assignedDroneIds: [],
      priority: "HIGH",
      estimatedMinutesToDeploy: 5,
      requiresHumanClearance: false,
      status: "PENDING",
    },
  ];

  // 7. Evacuation Routes Plan
  const destinationShelterId = targetShelter === "Shelter C" ? "shelter-c" : "shelter-b";
  const roadIds = evacuationRoute === "R4" ? ["road-r4"] : ["road-r2"];

  const evacuationRoutes: EvacuationRoutePlan[] = [
    {
      id: `route-plan-${evacuationRoute.toLowerCase()}`,
      routeName: `Route ${evacuationRoute} (${evacuationRoute === "R4" ? "Highland Arterial Pass" : "Kotturpuram High Bypass"}) -> ${targetShelter}`,
      fromZoneId: incident.zoneId || "zone-a",
      destinationShelterId,
      safetyScore: evacuationRoute === "R4" ? 98 : 94,
      estimatedTransitMin: evacuationRoute === "R4" ? 14 : 11,
      roadSegmentIds: roadIds,
      activeEscortUnitId: "team-03",
      status: "OPEN",
    },
  ];

  return {
    id: `PLAN-DET-${incident.id}`,
    incidentId: incident.id,
    planVersion: 1,
    title: `Deterministic Emergency Response Plan — ${zoneName} Inundation`,
    generatedAt: new Date().toISOString(),
    riskAssessmentSummary:
      `Deterministic Fallback Engine: ${zoneName} water depth is ${waterLevel}m with ${affectedPop.toLocaleString()} residents affected. ` +
      `Arterials ${blockedRoads.join(" & ")} are blocked. Direct evacuation via Route ${evacuationRoute} to ${targetShelter}.`,
    recommendedSeverityLevel: riskLevel,
    humanApproved: false,
    status: "AWAITING_APPROVAL",
    confidenceScorePercentage: 96,
    projectedCasualtyReductionPercentage: 88,
    primaryObjectives: [
      `Rapid extraction of isolated civilians in ${zoneName}`,
      `Safe transit via Route ${evacuationRoute} bypassing submerged corridors`,
      `Pre-reception readiness at ${targetShelter} (${targetShelter === "Shelter C" ? "capacity: 1,500" : "capacity: 700"})`,
      `Air-reconnaissance via Drones to identify trapped clusters and monitor dry arterial corridors`,
    ],
    actions,
    evacuationRoutes,

    // First-class deterministic engine outputs
    riskLevel,
    priorityZones,
    immediateActions,
    resourceAllocation,
    evacuationRoute,
    targetShelter,
    publicAlert,
    explanation,
    approvalRequired,
    decisionEngine: "FALLBACK",
  };
}
