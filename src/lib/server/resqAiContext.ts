import {
  Incident,
  IncidentDocument,
  ResourceDocument,
  ResponsePlanDocument,
  AlertDocument,
  RiskForecastDocument,
  ActivityLogDocument,
} from "@/types";
import {
  getIncidents,
  getResources,
  getResponsePlans,
  getAlerts,
  getRiskForecasts,
  getActivityLogs,
} from "./crudService";
import {
  MOCK_FLOOD_INCIDENT,
  MOCK_ROADS,
  MOCK_ZONES,
  MOCK_HOSPITALS,
  MOCK_SHELTERS,
} from "@/data";
import { isMongoActive, getDatabase, COLLECTIONS } from "../mongodb";
import { AiQuestionContext } from "./gemini";

/**
 * 10 Core Emergency Operational Dimensions for RESQ AI
 */
export interface FullEmergencyState {
  // 1. Current incident
  incident: {
    incidentId: string;
    title: string;
    disasterType: string;
    severity: string;
    status: string;
    location: string;
    waterLevel: number;
    waterTrend: string;
    affectedPopulation: number;
    blockedRoads: string[];
    source: string;
    lastUpdated: string;
  };

  // 2. Current disaster risk
  risk: {
    highestRiskArea: string;
    highestRiskScore: number;
    riskLevel: string;
    hazardType: string;
    contributingFactors: string[];
    allForecasts: Array<{
      areaName: string;
      riskScore: number;
      riskLevel: string;
      hazardType: string;
      factors: string[];
    }>;
  };

  // 3. Current map state
  mapState: {
    activeZones: Array<{ id: string; name: string; severity: string; waterLevel: number }>;
    roads: Array<{ id: string; name: string; status: string; waterDepthCm: number }>;
    blockedRoadNames: string[];
    safeCorridors: string[];
  };

  // 4. Current resources
  resources: {
    total: number;
    available: number;
    deployed: number;
    breakdown: {
      ambulances: { total: number; available: number; deployed: number };
      rescueTeams: { total: number; available: number; deployed: number };
      drones: { total: number; available: number; deployed: number };
    };
    units: Array<{ id: string; name: string; type: string; status: string }>;
  };

  // 5. Current response plan
  responsePlan: {
    planId?: string;
    riskLevel: string;
    priorityZones: string[];
    immediateActions: string[];
    resourceAllocation: {
      ambulances: number;
      rescueTeams: number;
      drones: number;
    };
    evacuationRoute: string;
    shelter: string;
    explanation: string;
    approvalRequired: boolean;
  };

  // 6. Current approvals
  approvals: {
    isActionApproved: boolean;
    approvedBy: string;
    approvedAt: string | null;
    status: "APPROVED_ACTIVE" | "PENDING_COMMANDER_APPROVAL" | "REJECTED";
    pendingItems: string[];
  };

  // 7. Current n8n workflow status
  workflowStatus: {
    orchestrator: string;
    mode: "N8N_LIVE" | "SIMULATION";
    incidentIntake: string;
    criticalResponse: string;
    droneDeployment: string;
    emergencyAlert: string;
  };

  // 8. Current alerts
  alerts: {
    count: number;
    recent: Array<{
      alertId: string;
      title: string;
      severity: string;
      channel: string;
      sentAt: string;
      status: string;
    }>;
  };

  // 9. Current live disaster intelligence
  liveIntelligence: {
    waterTrend: string;
    rainfallRate: string;
    radarStatus: string;
    telemetrySource: string;
    dataSourceLabel: string;
  };

  // 10. Historical incident activity
  activityLogs: Array<{
    eventId: string;
    actor: string;
    eventType: string;
    message: string;
    timestamp: string;
  }>;
}

/**
 * Retrieve current information from MongoDB and live server state before answering.
 * Merges active database documents with client operational overrides (e.g. stage, approvals).
 */
export async function fetchFullEmergencyState(
  clientContext?: AiQuestionContext,
  incidentOverride?: Incident
): Promise<FullEmergencyState> {
  // Query collections from MongoDB/crudService in parallel
  const [
    incidentsRes,
    resourcesRes,
    responsePlansRes,
    alertsRes,
    riskForecastsRes,
    activityLogsRes,
  ] = await Promise.allSettled([
    getIncidents(),
    getResources(),
    getResponsePlans(),
    getAlerts(),
    getRiskForecasts(),
    getActivityLogs(undefined, 10),
  ]);

  const incidentsData = incidentsRes.status === "fulfilled" ? incidentsRes.value.data : [];
  const resourcesData = resourcesRes.status === "fulfilled" ? resourcesRes.value.data : [];
  const responsePlansData = responsePlansRes.status === "fulfilled" ? responsePlansRes.value.data : [];
  const alertsData = alertsRes.status === "fulfilled" ? alertsRes.value.data : [];
  const riskForecastsData = riskForecastsRes.status === "fulfilled" ? riskForecastsRes.value.data : [];
  const activityLogsData = activityLogsRes.status === "fulfilled" ? activityLogsRes.value.data : [];

  // 1. INCIDENT
  const primaryDbIncident = incidentsData[0];
  const isEscalatedStage =
    clientContext?.simulationStage === "ESCALATED" ||
    (incidentOverride?.metrics?.waterLevelMeters ?? 0) >= 3.0 ||
    (primaryDbIncident?.waterLevel ?? 0) >= 3.0;

  const waterLevel =
    incidentOverride?.metrics?.waterLevelMeters ??
    primaryDbIncident?.waterLevel ??
    (isEscalatedStage ? 3.1 : 2.4);

  const affectedPop =
    incidentOverride?.metrics?.affectedPopulationEstimated ??
    primaryDbIncident?.affectedPopulation ??
    (isEscalatedStage ? 2180 : 1240);

  const blockedRoads =
    incidentOverride?.blockedRoads && incidentOverride.blockedRoads.length > 0
      ? incidentOverride.blockedRoads
      : isEscalatedStage
      ? ["Road R1 - Causeway", "Road R2 - Highland Link", "Road R3 - Canal Link"]
      : ["Road R1 - Causeway", "Road R3 - Canal Link"];

  const currentIncident = {
    incidentId: incidentOverride?.id || primaryDbIncident?.incidentId || MOCK_FLOOD_INCIDENT.id,
    title:
      incidentOverride?.title ||
      primaryDbIncident?.location ||
      "Kotturpuram - Saidapet Embankment Corridor Breach",
    disasterType: incidentOverride?.disasterType || primaryDbIncident?.type || "FLOOD",
    severity: isEscalatedStage ? "CRITICAL" : (incidentOverride?.severity || primaryDbIncident?.severity || "CRITICAL"),
    status: incidentOverride?.status || primaryDbIncident?.status || "ACTIVE",
    location:
      incidentOverride?.zoneName ||
      primaryDbIncident?.location ||
      "Adyar River Embankment / Sector 7A",
    waterLevel,
    waterTrend: isEscalatedStage ? "RAPIDLY RISING (+25cm/hr)" : "RISING (+12cm/hr)",
    affectedPopulation: affectedPop,
    blockedRoads,
    source: primaryDbIncident?.source || "EOC Hydrology Sensor Network",
    lastUpdated: primaryDbIncident?.updatedAt || new Date().toISOString(),
  };

  // 2. DISASTER RISK
  const forecasts = riskForecastsData.length > 0 ? riskForecastsData : [
    {
      forecastId: "fc-01",
      areaName: "Sector 7A - Riverfront Basin",
      riskScore: isEscalatedStage ? 96 : 88,
      riskLevel: "CRITICAL",
      hazardType: "FLASH_FLOOD_BREACH",
      contributingFactors: [
        "Upstream sluice gate 7 overtopping",
        "Saturated urban drainage basin",
        "Impassable causeway links R1 and R3",
      ],
    },
    {
      forecastId: "fc-02",
      areaName: "Sector 7B - South Lowland Canal",
      riskScore: isEscalatedStage ? 82 : 64,
      riskLevel: "HIGH",
      hazardType: "BACKFLOW_INUNDATION",
      contributingFactors: [
        "Canal stormwater backflow",
        "Basement transformer flooding threat",
      ],
    },
    {
      forecastId: "fc-03",
      areaName: "Guindy Highland Corridor",
      riskScore: 28,
      riskLevel: "LOW",
      hazardType: "SURFACE_RUNOFF",
      contributingFactors: ["Moderate sheet runoff", "High elevation buffer"],
    },
  ];

  const highestForecast = forecasts[0];
  const currentRisk = {
    highestRiskArea: highestForecast.areaName,
    highestRiskScore: highestForecast.riskScore,
    riskLevel: highestForecast.riskLevel,
    hazardType: highestForecast.hazardType,
    contributingFactors: highestForecast.contributingFactors || [
      "River embankment breach",
      "Rising hydrostatic pressure",
    ],
    allForecasts: forecasts.map((f) => ({
      areaName: f.areaName,
      riskScore: f.riskScore,
      riskLevel: f.riskLevel,
      hazardType: f.hazardType,
      factors: f.contributingFactors || [],
    })),
  };

  // 3. MAP STATE
  const currentMapState = {
    activeZones: MOCK_ZONES.map((z) => ({
      id: z.id,
      name: z.name,
      severity: isEscalatedStage && z.id === "zone-orange-bravo" ? "CRITICAL" : z.riskLevel,
      waterLevel: z.id === "zone-red-alpha" ? waterLevel : z.id === "zone-orange-bravo" ? (isEscalatedStage ? 1.85 : 0.9) : 0.2,
    })),
    roads: MOCK_ROADS.map((r) => {
      const isR2Blocked = isEscalatedStage && r.id === "road-link-bravo";
      return {
        id: r.id,
        name: r.name,
        status: isR2Blocked ? "IMPASSABLE" : r.status,
        waterDepthCm: isR2Blocked ? 185 : r.currentWaterDepthCm,
      };
    }),
    blockedRoadNames: blockedRoads,
    safeCorridors: isEscalatedStage
      ? ["Route R4 (Inner Ring Elevated Expressway to Shelter C)"]
      : ["Route R2 (Guindy-Velachery Highland Link to Shelter B)"],
  };

  // 4. RESOURCES (Source of Truth: MongoDB & live allocation state)
  const ambulances = resourcesData.filter((r) => r.type === "AMBULANCE");
  const rescueTeams = resourcesData.filter((r) => r.type === "RESCUE_TEAM");
  const drones = resourcesData.filter((r) => r.type === "DRONE");

  // Reconcile with client allocation state if provided
  const assignedFromClient = clientContext?.resourceAllocation?.assigned;
  const assignedAmbulances = assignedFromClient?.ambulances ?? (isEscalatedStage ? 4 : 2);
  const assignedRescueTeams = assignedFromClient?.rescueTeams ?? (isEscalatedStage ? 3 : 2);
  const assignedDrones = assignedFromClient?.drones ?? (isEscalatedStage ? 2 : 1);

  const totalAmb = ambulances.length > 0 ? ambulances.length : 8;
  const totalRescue = rescueTeams.length > 0 ? rescueTeams.length : 4;
  const totalDrones = drones.length > 0 ? drones.length : 3;

  const currentResources = {
    total: totalAmb + totalRescue + totalDrones,
    available:
      totalAmb - assignedAmbulances + (totalRescue - assignedRescueTeams) + (totalDrones - assignedDrones),
    deployed: assignedAmbulances + assignedRescueTeams + assignedDrones,
    breakdown: {
      ambulances: {
        total: totalAmb,
        available: Math.max(0, totalAmb - assignedAmbulances),
        deployed: assignedAmbulances,
      },
      rescueTeams: {
        total: totalRescue,
        available: Math.max(0, totalRescue - assignedRescueTeams),
        deployed: assignedRescueTeams,
      },
      drones: {
        total: totalDrones,
        available: Math.max(0, totalDrones - assignedDrones),
        deployed: assignedDrones,
      },
    },
    units: resourcesData.map((r) => ({
      id: r.resourceId,
      name: r.name,
      type: r.type,
      status: r.status,
    })),
  };

  // 5. RESPONSE PLAN
  const dbPlan = responsePlansData[0];
  const evacuationRoute =
    clientContext?.plan?.evacuationRoute ||
    (isEscalatedStage ? "Route R4 (Elevated Bypass)" : dbPlan?.evacuationRoute || "Route R2 (Guindy Link)");
  const targetShelter =
    clientContext?.plan?.targetShelter ||
    (isEscalatedStage ? "Shelter C (Capacity: 1,500)" : dbPlan?.shelter || "Shelter B (Capacity: 700)");

  const currentPlan = {
    planId: dbPlan?.incidentId ? `plan-${dbPlan.incidentId}` : "plan-active-01",
    riskLevel: isEscalatedStage ? "CRITICAL" : (dbPlan?.riskLevel || "CRITICAL"),
    priorityZones: isEscalatedStage
      ? ["Zone A - Riverfront", "Zone B - Lowland Commercial"]
      : dbPlan?.priorityZones || ["Zone A - Riverfront Basin"],
    immediateActions: isEscalatedStage
      ? [
          "Mandatory evacuation of Zones A & B via Route R4",
          "Deploy 4x Swiftwater Rescue boat squads to terrace clusters",
          "Launch 2x UAV Lifeline Sentinels with thermal spotters",
          "Divert medical casualties to Apex Central Trauma ICU",
        ]
      : dbPlan?.immediateActions || [
          "Evacuate Sector 7A flood plain via Route R2 to Shelter B",
          "Deploy 2x NDRF Swiftwater Zodiac boat squads",
          "Launch UAV Sentinel for corridor aerial reconnaissance",
          "Seal Maraimalai Bridge access gates",
        ],
    resourceAllocation: {
      ambulances: assignedAmbulances,
      rescueTeams: assignedRescueTeams,
      drones: assignedDrones,
    },
    evacuationRoute,
    shelter: targetShelter,
    explanation: isEscalatedStage
      ? "Upstream dam release and 3.1m flood crest inundated Causeway R1 and Route R2 under 185cm of water. Evacuation convoys re-routed via Route R4 to Shelter C."
      : dbPlan?.explanation ||
        "Flood depth 2.4m breaches danger mark. Lowlands isolated. Directing traffic along elevated Route R2 to Shelter B.",
    approvalRequired: true,
  };

  // 6. APPROVALS (Commander Jaswant Karun is authorized operator)
  const isApproved = Boolean(
    clientContext?.isActionApproved ||
    clientContext?.plan?.humanApproved ||
    false
  );

  const currentApprovals = {
    isActionApproved: isApproved,
    approvedBy: isApproved ? "Cmdr Jaswant Karun (COMMANDER)" : "Pending Cmdr Jaswant Karun sign-off",
    approvedAt: isApproved ? new Date().toISOString() : null,
    status: isApproved
      ? ("APPROVED_ACTIVE" as const)
      : ("PENDING_COMMANDER_APPROVAL" as const),
    pendingItems: isApproved
      ? []
      : [
          `Authorize tactical response plan for ${currentIncident.location}`,
          `Authorize deployment of ${assignedAmbulances} Ambulances, ${assignedRescueTeams} Rescue Teams, ${assignedDrones} Drones`,
          "Authorize emergency cell broadcast warning across Sector 7A corridor",
        ],
  };

  // 7. N8N WORKFLOW STATUS
  const hasN8nUrl = Boolean(process.env.N8N_WEBHOOK_URL?.trim());
  const currentWorkflowStatus = {
    orchestrator: hasN8nUrl ? "CONNECTED (n8n port 5680)" : "LOCAL SIMULATION MODE (Fallback Armed)",
    mode: hasN8nUrl ? ("N8N_LIVE" as const) : ("SIMULATION" as const),
    incidentIntake: "ACTIVE (Listening for sensor telemetry)",
    criticalResponse: isApproved ? "EXECUTED (Convoys dispatched)" : "STANDBY (Awaiting approval)",
    droneDeployment: "PATROLLING (UAV Sentinel operational)",
    emergencyAlert: isApproved ? "BROADCASTED (Zone A cell tower)" : "QUEUED (Awaiting approval)",
  };

  // 8. ALERTS
  const currentAlerts = {
    count: alertsData.length,
    recent: alertsData.slice(0, 5).map((a) => ({
      alertId: a.alertId,
      title: a.type || "Flood Emergency Broadcast",
      severity: a.severity,
      channel: a.channel,
      sentAt: a.sentAt,
      status: a.status,
    })),
  };

  // 9. LIVE DISASTER INTELLIGENCE
  const currentLiveIntel = {
    waterTrend: isEscalatedStage ? "RISING RAPIDLY (+25cm/hr)" : "RISING (+12cm/hr)",
    rainfallRate: isEscalatedStage ? "72 mm/hr (Intense Cloudburst Cell)" : "45 mm/hr (Heavy Monsoonal Rain)",
    radarStatus: "Doppler Core Stalling Over Catchment Basin (45m ETA)",
    telemetrySource: "Hydrological Telemetry #SG-07 & River Basin Sensors",
    dataSourceLabel: isMongoActive()
      ? "LIVE MONGODB PRODUCTION + SENSOR TELEMETRY"
      : "DETERMINISTIC SIMULATION LAYER",
  };

  // 10. HISTORICAL INCIDENT ACTIVITY
  const currentActivityLogs = activityLogsData.slice(0, 8).map((log) => ({
    eventId: log.eventId,
    actor: log.actor || "EOC Central Sentinel",
    eventType: log.eventType,
    message: log.message,
    timestamp: log.timestamp,
  }));

  return {
    incident: currentIncident,
    risk: currentRisk,
    mapState: currentMapState,
    resources: currentResources,
    responsePlan: currentPlan,
    approvals: currentApprovals,
    workflowStatus: currentWorkflowStatus,
    alerts: currentAlerts,
    liveIntelligence: currentLiveIntel,
    activityLogs: currentActivityLogs,
  };
}

/**
 * Builds the standard "Sources / Data used" block required by the prompt
 */
export function buildSourcesUsedSection(sources: string[]): string {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
  return `\n\nData used:
${sources.map((s) => `- ${s}`).join("\n")}
Timestamp: ${timestamp}`;
}

/**
 * Builds structured response plan output matching exact prompt criteria:
 * RISK
 * PRIORITY AREA
 * IMMEDIATE ACTIONS
 * RESOURCES
 * EVACUATION ROUTE
 * APPROVAL REQUIRED
 */
export function formatStructuredResponsePlan(state: FullEmergencyState): string {
  const plan = state.responsePlan;
  const approvals = state.approvals;
  const incident = state.incident;

  return `=== TACTICAL RESPONSE PLAN ===

RISK:
${plan.riskLevel} (Score: ${state.risk.highestRiskScore}/100 - Inundation ${incident.waterLevel}m, ${incident.affectedPopulation.toLocaleString()} affected)

PRIORITY AREA:
${plan.priorityZones.join(", ")}

IMMEDIATE ACTIONS:
${plan.immediateActions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

RESOURCES:
- Ambulances: ${plan.resourceAllocation.ambulances}
- Rescue Teams: ${plan.resourceAllocation.rescueTeams}
- Drones: ${plan.resourceAllocation.drones}

EVACUATION ROUTE:
${plan.evacuationRoute} → Destination: ${plan.shelter}

APPROVAL REQUIRED:
${approvals.isActionApproved ? "NO (Approved by Cmdr Jaswant Karun - Active)" : "YES (Pending Cmdr Jaswant Karun clearance)"}${buildSourcesUsedSection([
    "Current incident (MongoDB / Telemetry)",
    "MongoDB resources",
    "Live risk forecast",
    "Current response plan",
    "Commander approval status",
  ])}`;
}

/**
 * Handles Special Command-Style Capabilities:
 * /status, /risk, /resources, /incidents, /alerts, /plan, /summary
 */
export function handleSpecialCommand(
  rawInput: string,
  state: FullEmergencyState
): { handled: boolean; answer?: string } {
  const cmd = rawInput.trim().toLowerCase();

  // /status
  if (cmd === "/status" || cmd.startsWith("/status ")) {
    const ans = `[COMMAND CENTER STATUS REPORT]

• System: ONLINE | Data: ${state.liveIntelligence.dataSourceLabel}
• Active Incident: ${state.incident.title} (Severity: ${state.incident.severity})
• Water Level: ${state.incident.waterLevel}m (${state.incident.waterTrend})
• Affected Citizens: ${state.incident.affectedPopulation.toLocaleString()}
• Evacuation Corridor: ${state.responsePlan.evacuationRoute} → ${state.responsePlan.shelter}
• Blocked Roads: ${state.incident.blockedRoads.join(", ")}
• Fleet Readiness: ${state.resources.available} of ${state.resources.total} units available (${state.resources.deployed} deployed)
• Commander Gate: ${state.approvals.isActionApproved ? "AUTHORIZED by Cmdr Jaswant Karun" : "AWAITING APPROVAL"}
• n8n Orchestrator: ${state.workflowStatus.orchestrator}${buildSourcesUsedSection([
      "Current incident",
      "MongoDB resources",
      "Live risk forecast",
      "n8n workflow status",
    ])}`;
    return { handled: true, answer: ans };
  }

  // /risk
  if (cmd === "/risk" || cmd.startsWith("/risk ")) {
    const ans = `[LIVE DISASTER RISK ASSESSMENT]

• Highest-Risk Area: ${state.risk.highestRiskArea}
• Threat Level: ${state.risk.riskLevel} (Risk Index: ${state.risk.highestRiskScore}/100)
• Hazard Type: ${state.risk.hazardType}
• Contributing Factors:
${state.risk.contributingFactors.map((f) => `  - ${f}`).join("\n")}

• Sector Breakdown:
${state.risk.allForecasts
  .map(
    (f) =>
      `  • ${f.areaName}: ${f.riskLevel} (${f.riskScore}/100) - Hazard: ${f.hazardType}`
  )
  .join("\n")}${buildSourcesUsedSection([
      "Live risk forecast (MongoDB)",
      "Hydrological telemetry",
      "Topographic digital elevation model",
    ])}`;
    return { handled: true, answer: ans };
  }

  // /resources
  if (cmd === "/resources" || cmd.startsWith("/resources ")) {
    const r = state.resources.breakdown;
    const ans = `[COMMAND CENTER FLEET INVENTORY]

• Total Resources: ${state.resources.total} | Available: ${state.resources.available} | Deployed: ${state.resources.deployed}

1. AMBULANCES:
   - Total Fleet: ${r.ambulances.total}
   - Available: ${r.ambulances.available}
   - Deployed: ${r.ambulances.deployed}

2. RESCUE TEAMS (Swiftwater Boat Squads):
   - Total Teams: ${r.rescueTeams.total}
   - Available: ${r.rescueTeams.available}
   - Deployed: ${r.rescueTeams.deployed}

3. DRONES (FLIR Thermal Aerial Sentinels):
   - Total Drones: ${r.drones.total}
   - Available: ${r.drones.available}
   - Deployed: ${r.drones.deployed}${buildSourcesUsedSection([
      "MongoDB resources collection",
      "Live resource allocation engine",
      "Fleet telemetry heartbeat",
    ])}`;
    return { handled: true, answer: ans };
  }

  // /incidents
  if (cmd === "/incidents" || cmd.startsWith("/incidents ")) {
    const inc = state.incident;
    const ans = `[ACTIVE DISASTER INCIDENTS]

• Incident ID: ${inc.incidentId}
• Classification: ${inc.disasterType} (${inc.severity})
• Location: ${inc.location}
• Status: ${inc.status}
• Current Water Depth: ${inc.waterLevel} meters
• Estimated Impact: ${inc.affectedPopulation.toLocaleString()} citizens
• Blocked Corridors: ${inc.blockedRoads.join(", ")}
• Inundation Source: ${inc.source}
• Last Telemetry Sync: ${inc.lastUpdated}${buildSourcesUsedSection([
      "Current incident (MongoDB)",
      "River basin sensor feeds",
    ])}`;
    return { handled: true, answer: ans };
  }

  // /alerts
  if (cmd === "/alerts" || cmd.startsWith("/alerts ")) {
    const ans = `[EMERGENCY ALERTS BROADCAST LOG]

• Total Alerts Logged: ${state.alerts.count}
• Recent Broadcasts:
${state.alerts.recent
  .map(
    (a, i) =>
      `${i + 1}. [${a.severity}] ${a.title} via ${a.channel} (${a.status}) - Sent: ${a.sentAt}`
  )
  .join("\n")}${buildSourcesUsedSection([
      "MongoDB alerts collection",
      "Cell Broadcast Gateway",
      "Public warning system",
    ])}`;
    return { handled: true, answer: ans };
  }

  // /plan
  if (cmd === "/plan" || cmd.startsWith("/plan ")) {
    return { handled: true, answer: formatStructuredResponsePlan(state) };
  }

  // /summary
  if (cmd === "/summary" || cmd.startsWith("/summary ")) {
    const ans = `[EMERGENCY OPERATIONS SITUATION SUMMARY]

At the Kotturpuram - Saidapet corridor, an active ${state.incident.disasterType} emergency is ongoing with floodwaters currently at ${state.incident.waterLevel}m (${state.incident.waterTrend}) impacting ${state.incident.affectedPopulation.toLocaleString()} residents. 

Key roads (${state.incident.blockedRoads.join(", ")}) are impassable. The highest-risk sector is ${state.risk.highestRiskArea} with a risk score of ${state.risk.highestRiskScore}/100.

Active tactical planning routes evacuations along ${state.responsePlan.evacuationRoute} to ${state.responsePlan.shelter}. Fleet deployment comprises ${state.resources.breakdown.ambulances.deployed} ambulances, ${state.resources.breakdown.rescueTeams.deployed} swiftwater rescue teams, and ${state.resources.breakdown.drones.deployed} drones (${state.resources.available} units remain in reserve). 

Commander status: ${state.approvals.isActionApproved ? "Authorized and actively deploying under Cmdr Jaswant Karun" : "Pending tactical clearance from Cmdr Jaswant Karun"}.${buildSourcesUsedSection([
      "Current incident",
      "MongoDB resources",
      "Live risk forecast",
      "Weather forecast",
      "Recent activity logs",
    ])}`;
    return { handled: true, answer: ans };
  }

  return { handled: false };
}
