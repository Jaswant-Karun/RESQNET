import {
  Drone,
  Incident,
  Resource,
  ResourceAllocation,
  ResourceAllocationItem,
  ResourceAllocationState,
  ResourceAllocationSummary,
  TimelineEvent,
} from "@/types";

/**
 * Initial standard operational baseline resources for RESQNET
 */
export const INITIAL_AVAILABLE_RESOURCES: ResourceAllocation = {
  ambulances: 8,
  rescueTeams: 4,
  drones: 3,
};

export const INITIAL_RECOMMENDED_RESOURCES: ResourceAllocation = {
  ambulances: 2,
  rescueTeams: 2,
  drones: 1,
};

/**
 * Reusable rule-based recommender: determines recommended resource allocation
 * based on incident severity, hydrological metrics, and simulation stage.
 */
export function calculateRecommendedAllocation(
  incident: Incident,
  options?: { isEscalated?: boolean }
): ResourceAllocation {
  const isEscalated =
    options?.isEscalated ||
    incident.status === "ESCALATING" ||
    (incident.metrics.waterLevelMeters >= 3.5 && incident.metrics.affectedPopulationEstimated > 3000);

  if (isEscalated) {
    // Escalated flood surge requires maximum tactical surge
    return {
      ambulances: 6,
      rescueTeams: 3,
      drones: 2,
    };
  }

  const severity = incident.severity || "CRITICAL";

  switch (severity) {
    case "CRITICAL":
      // Exact initial scenario requirement: 2 ambulances, 2 rescue teams, 1 drone
      return {
        ambulances: 2,
        rescueTeams: 2,
        drones: 1,
      };

    case "HIGH":
      return {
        ambulances: 1,
        rescueTeams: 1,
        drones: 1,
      };

    case "MODERATE":
    case "LOW":
    default:
      return {
        ambulances: 1,
        rescueTeams: 0,
        drones: 1,
      };
  }
}

/**
 * Intelligent Resource Allocation Function
 *
 * Core Safety Rules:
 * 1. Allocates resources based on availability and requested quantities.
 * 2. NEVER allows allocation to exceed available assets.
 * 3. If requested > available, issues a clear warning and caps allocation at max available.
 * 4. Determines tactical operational status for each resource class:
 *    - Ambulances: READY
 *    - Rescue Teams: DEPLOYING
 *    - Drones: MISSION CREATED
 * 5. Reusable across initial scenario and subsequent escalations.
 */
export function allocateResources(
  available: ResourceAllocation,
  requested: ResourceAllocation,
  _incident?: Incident
): ResourceAllocationState {
  // Ensure non-negative numbers
  const safeAvail = {
    ambulances: Math.max(0, Math.floor(available.ambulances ?? 0)),
    rescueTeams: Math.max(0, Math.floor(available.rescueTeams ?? 0)),
    drones: Math.max(0, Math.floor(available.drones ?? 0)),
  };

  const safeReq = {
    ambulances: Math.max(0, Math.floor(requested.ambulances ?? 0)),
    rescueTeams: Math.max(0, Math.floor(requested.rescueTeams ?? 0)),
    drones: Math.max(0, Math.floor(requested.drones ?? 0)),
  };

  const warnings: string[] = [];

  // --- Ambulances ---
  const ambCapped = safeReq.ambulances > safeAvail.ambulances;
  const ambAssigned = Math.min(safeReq.ambulances, safeAvail.ambulances);
  const ambRemaining = safeAvail.ambulances - ambAssigned;
  let ambWarning: string | undefined;
  if (ambCapped) {
    ambWarning = `Requested ${safeReq.ambulances} Ambulances exceeds available ${safeAvail.ambulances}. Allocated maximum available (${ambAssigned}).`;
    warnings.push(ambWarning);
  }

  // --- Rescue Teams ---
  const teamCapped = safeReq.rescueTeams > safeAvail.rescueTeams;
  const teamAssigned = Math.min(safeReq.rescueTeams, safeAvail.rescueTeams);
  const teamRemaining = safeAvail.rescueTeams - teamAssigned;
  let teamWarning: string | undefined;
  if (teamCapped) {
    teamWarning = `Requested ${safeReq.rescueTeams} Rescue Teams exceeds available ${safeAvail.rescueTeams}. Allocated maximum available (${teamAssigned}).`;
    warnings.push(teamWarning);
  }

  // --- Drones ---
  const droneCapped = safeReq.drones > safeAvail.drones;
  const droneAssigned = Math.min(safeReq.drones, safeAvail.drones);
  const droneRemaining = safeAvail.drones - droneAssigned;
  let droneWarning: string | undefined;
  if (droneCapped) {
    droneWarning = `Requested ${safeReq.drones} Drones exceeds available ${safeAvail.drones}. Allocated maximum available (${droneAssigned}).`;
    warnings.push(droneWarning);
  }

  const items: ResourceAllocationItem[] = [
    {
      resourceType: "ambulances",
      label: "Ambulances",
      available: safeAvail.ambulances,
      assigned: ambAssigned,
      remaining: ambRemaining,
      status: ambAssigned > 0 ? "READY" : safeAvail.ambulances === 0 ? "DEPLETED" : "STANDBY",
      requested: safeReq.ambulances,
      isCapped: ambCapped,
      warning: ambWarning,
    },
    {
      resourceType: "rescueTeams",
      label: "Rescue Teams",
      available: safeAvail.rescueTeams,
      assigned: teamAssigned,
      remaining: teamRemaining,
      status: teamAssigned > 0 ? "DEPLOYING" : safeAvail.rescueTeams === 0 ? "DEPLETED" : "STANDBY",
      requested: safeReq.rescueTeams,
      isCapped: teamCapped,
      warning: teamWarning,
    },
    {
      resourceType: "drones",
      label: "Drones",
      available: safeAvail.drones,
      assigned: droneAssigned,
      remaining: droneRemaining,
      status: droneAssigned > 0 ? "MISSION CREATED" : safeAvail.drones === 0 ? "DEPLETED" : "STANDBY",
      requested: safeReq.drones,
      isCapped: droneCapped,
      warning: droneWarning,
    },
  ];

  const totalAvailable = safeAvail.ambulances + safeAvail.rescueTeams + safeAvail.drones;
  const totalAssigned = ambAssigned + teamAssigned + droneAssigned;
  const totalRemaining = ambRemaining + teamRemaining + droneRemaining;
  const utilizationPercentage =
    totalAvailable > 0 ? Math.round((totalAssigned / totalAvailable) * 100) : 0;

  const summary: ResourceAllocationSummary = {
    totalAvailable,
    totalAssigned,
    totalRemaining,
    utilizationPercentage,
  };

  return {
    available: safeAvail,
    requested: safeReq,
    assigned: {
      ambulances: ambAssigned,
      rescueTeams: teamAssigned,
      drones: droneAssigned,
    },
    remaining: {
      ambulances: ambRemaining,
      rescueTeams: teamRemaining,
      drones: droneRemaining,
    },
    items,
    summary,
    hasWarning: warnings.length > 0,
    warnings,
    lastAllocatedAt: new Date().toISOString(),
  };
}

/**
 * Creates a formal timeline event whenever an allocation occurs or changes.
 */
export function createAllocationTimelineEvent(
  allocation: ResourceAllocationState,
  incidentId: string,
  contextMessage?: string,
  timestamp?: string
): TimelineEvent {
  const isCapped = allocation.hasWarning;
  const assigned = allocation.assigned;
  const remaining = allocation.remaining;

  const title = isCapped
    ? "Tactical Asset Allocation Committed (Supply Capped)"
    : "Tactical Asset Allocation Committed";

  const description =
    contextMessage ||
    `Allocated: ${assigned.ambulances} Ambulances (READY), ${assigned.rescueTeams} Rescue Teams (DEPLOYING), ${assigned.drones} Drone (MISSION CREATED). ` +
      `Remaining Reserve: ${remaining.ambulances} Ambulances, ${remaining.rescueTeams} Rescue Teams, ${remaining.drones} Drones. ` +
      (isCapped ? `Notice: ${allocation.warnings.join(" ")}` : "");

  return {
    id: `evt-alloc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    incidentId,
    timestamp: timestamp || new Date().toISOString(),
    title,
    description,
    category: "DISPATCH",
    severity: isCapped ? "WARNING" : "INFO",
    authorOrSystem: "RESQNET Intelligent Allocation Engine",
  };
}

/**
 * Updates individual asset cards in the fleets to reflect assigned / standby status.
 */
export function syncFleetStatuses(
  ambulances: Resource[],
  rescueTeams: Resource[],
  drones: Drone[],
  assigned: ResourceAllocation
): {
  updatedAmbulances: Resource[];
  updatedRescueTeams: Resource[];
  updatedDrones: Drone[];
} {
  // Update ambulances: first N assigned get READY / ON_MISSION
  const updatedAmbulances = ambulances.map((amb, idx) => {
    if (idx < assigned.ambulances) {
      return {
        ...amb,
        tacticalStatus: "READY" as const,
        status: "AVAILABLE" as const,
      };
    }
    return {
      ...amb,
      tacticalStatus: "STANDBY" as const,
    };
  });

  // Update rescue teams: first N assigned get DEPLOYING / EN_ROUTE
  const updatedRescueTeams = rescueTeams.map((team, idx) => {
    if (idx < assigned.rescueTeams) {
      return {
        ...team,
        tacticalStatus: "DEPLOYING" as const,
        status: "EN_ROUTE" as const,
      };
    }
    return {
      ...team,
      tacticalStatus: "STANDBY" as const,
      status: "AVAILABLE" as const,
    };
  });

  // Update drones: first N assigned get MISSION CREATED / AIRBORNE_PATROL
  const updatedDrones = drones.map((drone, idx) => {
    if (idx < assigned.drones) {
      return {
        ...drone,
        tacticalStatus: "MISSION CREATED" as const,
        flightStatus: "AIRBORNE_PATROL" as const,
      };
    }
    return {
      ...drone,
      tacticalStatus: "STANDBY" as const,
      flightStatus: "STANDBY_PAD" as const,
    };
  });

  return {
    updatedAmbulances,
    updatedRescueTeams,
    updatedDrones,
  };
}
