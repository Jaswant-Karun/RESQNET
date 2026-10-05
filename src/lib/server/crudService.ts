import {
  MOCK_ALERTS,
  MOCK_AMBULANCES,
  MOCK_DRONES,
  MOCK_FLOOD_INCIDENT,
  MOCK_RESCUE_TEAMS,
  MOCK_RESPONSE_PLAN,
  MOCK_TIMELINE_EVENTS,
} from "@/data";
import {
  ActivityLogDocument,
  AlertDocument,
  DroneMissionDocument,
  IncidentDocument,
  ResourceDocument,
  ResponsePlanDocument,
  RiskForecastDocument,
  UserDocument,
} from "@/types";
import {
  COLLECTIONS,
  getDatabase,
  getDatabaseMode,
  isMongoActive,
} from "../mongodb";

// --- Deterministic Mock Data Generators (Simulation Layer) ---

export function getMockIncidentDocument(): IncidentDocument {
  return {
    incidentId: MOCK_FLOOD_INCIDENT.id,
    type: MOCK_FLOOD_INCIDENT.disasterType,
    location:
      MOCK_FLOOD_INCIDENT.primaryLocation.address ||
      MOCK_FLOOD_INCIDENT.primaryLocation.name,
    coordinates: {
      latitude: MOCK_FLOOD_INCIDENT.primaryLocation.latitude,
      longitude: MOCK_FLOOD_INCIDENT.primaryLocation.longitude,
    },
    severity: MOCK_FLOOD_INCIDENT.severity,
    status: MOCK_FLOOD_INCIDENT.status,
    waterLevel: MOCK_FLOOD_INCIDENT.metrics.waterLevelMeters,
    affectedPopulation:
      MOCK_FLOOD_INCIDENT.metrics.affectedPopulationEstimated,
    blockedRoads: ["Road R1 - Causeway", "Road R3 - Canal Link"],
    createdAt: MOCK_FLOOD_INCIDENT.detectedAt,
    updatedAt: MOCK_FLOOD_INCIDENT.lastUpdatedAt,
    source: "EOC_HYDRO_TELEMETRY",
    simulationMode: true,
  };
}

export function getMockResourceDocuments(): ResourceDocument[] {
  const combined = [
    ...MOCK_AMBULANCES.map((a) => ({
      resourceId: a.id,
      type: "AMBULANCE",
      name: a.name,
      status: a.status,
      latitude: a.currentLocation.latitude,
      longitude: a.currentLocation.longitude,
      availability: a.status === "AVAILABLE",
      updatedAt: new Date().toISOString(),
    })),
    ...MOCK_RESCUE_TEAMS.map((r) => ({
      resourceId: r.id,
      type: "RESCUE_TEAM",
      name: r.name,
      status: r.status,
      latitude: r.currentLocation.latitude,
      longitude: r.currentLocation.longitude,
      availability: r.status === "AVAILABLE",
      updatedAt: new Date().toISOString(),
    })),
    ...MOCK_DRONES.map((d) => ({
      resourceId: d.id,
      type: "DRONE",
      name: d.callsign,
      status: d.flightStatus === "STANDBY_PAD" ? "AVAILABLE" : "ON_MISSION",
      latitude: d.currentLocation.latitude,
      longitude: d.currentLocation.longitude,
      availability: d.flightStatus === "STANDBY_PAD",
      updatedAt: new Date().toISOString(),
    })),
  ];
  return combined;
}

export function getMockResponsePlanDocument(): ResponsePlanDocument {
  return {
    incidentId: MOCK_RESPONSE_PLAN.incidentId,
    riskLevel: MOCK_RESPONSE_PLAN.riskLevel,
    priorityZones: MOCK_RESPONSE_PLAN.priorityZones,
    immediateActions: MOCK_RESPONSE_PLAN.immediateActions,
    resourceAllocation: {
      ambulances: MOCK_RESPONSE_PLAN.resourceAllocation.ambulances,
      rescueTeams: MOCK_RESPONSE_PLAN.resourceAllocation.rescueTeams,
      drones: MOCK_RESPONSE_PLAN.resourceAllocation.drones,
    },
    evacuationRoute: MOCK_RESPONSE_PLAN.evacuationRoute,
    shelter: MOCK_RESPONSE_PLAN.targetShelter || "Shelter B",
    explanation: MOCK_RESPONSE_PLAN.explanation,
    approvalRequired: MOCK_RESPONSE_PLAN.approvalRequired,
    createdAt: MOCK_RESPONSE_PLAN.generatedAt,
  };
}

export function getMockAlertDocuments(): AlertDocument[] {
  return MOCK_ALERTS.map((a) => ({
    alertId: a.id,
    incidentId: a.incidentId,
    type: a.source,
    severity: a.severity,
    recipient: "PUBLIC_CITIZENRY_ZONE_A",
    channel: "CELL_BROADCAST_SMS",
    status: a.acknowledged ? "ACKNOWLEDGED" : "SENT",
    sentAt: a.timestamp,
  }));
}

export function getMockRiskForecastDocuments(): RiskForecastDocument[] {
  return [
    {
      forecastId: "fc-adyar-basin-01",
      areaName: "Adyar Basin Sector 4 - Kotturpuram",
      latitude: 13.0142,
      longitude: 80.2335,
      hazardType: "RIVER_OVERFLOW",
      riskScore: 92,
      riskLevel: "CRITICAL",
      contributingFactors: [
        "Embankment breach at K-4",
        "Rainfall 68.4 mm/hr",
        "Reservoir sluice gate overflow",
      ],
      source: "Hydro-AI Ensemble Model v2.4",
      forecastTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      forecastId: "fc-saidapet-02",
      areaName: "Saidapet Causeway & Anna Salai Lowland",
      latitude: 13.0234,
      longitude: 80.2221,
      hazardType: "FLASH_INUNDATION",
      riskScore: 78,
      riskLevel: "WARNING",
      contributingFactors: [
        "Storm drain backflow",
        "Tidal surge resistance",
      ],
      source: "Doppler Precipitation Radar",
      forecastTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      forecastId: "fc-guindy-03",
      areaName: "Guindy Highland Corridor",
      latitude: 13.0067,
      longitude: 80.2088,
      hazardType: "SURFACE_RUNOFF",
      riskScore: 35,
      riskLevel: "INFO",
      contributingFactors: [
        "Moderate surface pooling",
        "High elevation buffer",
      ],
      source: "Urban Elevation LiDAR Matrix",
      forecastTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getMockActivityLogDocuments(): ActivityLogDocument[] {
  return MOCK_TIMELINE_EVENTS.map((evt) => ({
    eventId: evt.id,
    eventType: evt.category,
    message: `${evt.title}: ${evt.description}`,
    actor: evt.authorOrSystem,
    incidentId: evt.incidentId,
    timestamp: evt.timestamp,
  }));
}

export function getMockUserDocuments(): UserDocument[] {
  return [
    {
      userId: "usr-eoc-chief-01",
      name: "Col. Raghav Menon",
      email: "raghav.menon@resqnet.gov.in",
      role: "COMMANDER",
      department: "State Disaster Management Authority",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      userId: "usr-eoc-op-02",
      name: "Dr. Ananya Iyer",
      email: "ananya.iyer@resqnet.gov.in",
      role: "OPERATOR",
      department: "EOC Hydrology Analytics Cell",
      createdAt: "2026-02-15T00:00:00Z",
    },
  ];
}

export function getMockDroneMissionDocuments(): DroneMissionDocument[] {
  return [
    {
      missionId: "msn-uav-scout-01",
      droneId: "uav-aero-scout-01",
      incidentId: "inc-flood-2026-08a",
      status: "IN_PROGRESS",
      missionType: "THERMAL_SURVEILLANCE",
      waypoints: [
        { latitude: 13.0067, longitude: 80.2206 },
        { latitude: 13.0118, longitude: 80.2341 },
      ],
      batteryAtStart: 94,
      launchedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
  ];
}

// --- Auto-Seeding MongoDB when empty ---

let hasAttemptedSeed = false;

export async function autoSeedMongoIfEmpty(): Promise<void> {
  if (hasAttemptedSeed || !isMongoActive()) return;
  hasAttemptedSeed = true;

  try {
    const db = await getDatabase();
    const count = await db.collection(COLLECTIONS.INCIDENTS).countDocuments();
    if (count === 0) {
      // Seed collections in parallel
      await Promise.allSettled([
        db.collection(COLLECTIONS.INCIDENTS).insertOne(getMockIncidentDocument()),
        db.collection(COLLECTIONS.RESOURCES).insertMany(getMockResourceDocuments()),
        db.collection(COLLECTIONS.RESPONSE_PLANS).insertOne(getMockResponsePlanDocument()),
        db.collection(COLLECTIONS.ALERTS).insertMany(getMockAlertDocuments()),
        db.collection(COLLECTIONS.RISK_FORECASTS).insertMany(getMockRiskForecastDocuments()),
        db.collection(COLLECTIONS.ACTIVITY_LOGS).insertMany(getMockActivityLogDocuments()),
        db.collection(COLLECTIONS.USERS).insertMany(getMockUserDocuments()),
        db.collection(COLLECTIONS.DRONE_MISSIONS).insertMany(getMockDroneMissionDocuments()),
      ]);
      console.log("[MongoDB] Auto-seeded default RESQNET collections successfully.");
    }
  } catch (err) {
    console.warn("[MongoDB] Auto-seed failed or skipped:", err instanceof Error ? err.message : err);
  }
}

// --- CRUD Operations with Simulation Fallback ---

export interface QueryResult<T> {
  success: boolean;
  data: T;
  source: "mongodb" | "local_simulation";
  fallback: boolean;
  error?: string;
}

/**
 * INCIDENTS CRUD
 */
export async function getIncidents(): Promise<QueryResult<IncidentDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const results = await db
        .collection<IncidentDocument>(COLLECTIONS.INCIDENTS)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Incidents fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: [getMockIncidentDocument()],
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createIncident(
  data: Partial<IncidentDocument>
): Promise<QueryResult<IncidentDocument>> {
  const newIncident: IncidentDocument = {
    incidentId: data.incidentId || `inc-${Date.now().toString(36)}`,
    type: data.type || "FLOOD",
    location: data.location || "Unknown Sector",
    coordinates: data.coordinates || { latitude: 13.0067, longitude: 80.2206 },
    severity: data.severity || "CRITICAL",
    status: data.status || "ACTIVE",
    waterLevel: Number(data.waterLevel ?? 3.5),
    affectedPopulation: Number(data.affectedPopulation ?? 1000),
    blockedRoads: Array.isArray(data.blockedRoads) ? data.blockedRoads : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: data.source || "OPERATOR_DISPATCH",
    simulationMode: Boolean(data.simulationMode ?? (getDatabaseMode() === "local")),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<IncidentDocument>(COLLECTIONS.INCIDENTS).updateOne(
        { incidentId: newIncident.incidentId },
        { $set: newIncident },
        { upsert: true }
      );
      return {
        success: true,
        data: newIncident,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Failed to write incident to MongoDB, using memory fallback:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: newIncident,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

/**
 * RESOURCES CRUD
 */
export async function getResources(filterType?: string): Promise<QueryResult<ResourceDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const query = filterType ? { type: filterType.toUpperCase() } : {};
      const results = await db
        .collection<ResourceDocument>(COLLECTIONS.RESOURCES)
        .find(query)
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Resources fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  let mockList = getMockResourceDocuments();
  if (filterType) {
    mockList = mockList.filter(
      (r) => r.type.toLowerCase() === filterType.toLowerCase()
    );
  }

  return {
    success: true,
    data: mockList,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createResource(
  data: Partial<ResourceDocument>
): Promise<QueryResult<ResourceDocument>> {
  const newResource: ResourceDocument = {
    resourceId: data.resourceId || `res-${Date.now().toString(36)}`,
    type: data.type || "AMBULANCE",
    name: data.name || "Emergency Unit",
    status: data.status || "AVAILABLE",
    latitude: Number(data.latitude ?? 13.0067),
    longitude: Number(data.longitude ?? 80.2206),
    availability: Boolean(data.availability ?? true),
    updatedAt: new Date().toISOString(),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<ResourceDocument>(COLLECTIONS.RESOURCES).updateOne(
        { resourceId: newResource.resourceId },
        { $set: newResource },
        { upsert: true }
      );
      return {
        success: true,
        data: newResource,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Failed to write resource to MongoDB:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: newResource,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

/**
 * RESPONSE PLANS CRUD
 */
export async function getResponsePlans(
  incidentId?: string
): Promise<QueryResult<ResponsePlanDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const query = incidentId ? { incidentId } : {};
      const results = await db
        .collection<ResponsePlanDocument>(COLLECTIONS.RESPONSE_PLANS)
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Response plans fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: [getMockResponsePlanDocument()],
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createResponsePlan(
  data: Partial<ResponsePlanDocument>
): Promise<QueryResult<ResponsePlanDocument>> {
  const newPlan: ResponsePlanDocument = {
    incidentId: data.incidentId || MOCK_FLOOD_INCIDENT.id,
    riskLevel: data.riskLevel || "CRITICAL",
    priorityZones: Array.isArray(data.priorityZones) ? data.priorityZones : ["Zone A"],
    immediateActions: Array.isArray(data.immediateActions) ? data.immediateActions : ["Evacuate Zone A"],
    resourceAllocation: data.resourceAllocation || {
      ambulances: 2,
      rescueTeams: 2,
      drones: 1,
    },
    evacuationRoute: data.evacuationRoute || "R2",
    shelter: data.shelter || "Shelter B",
    explanation: data.explanation || "Automated deterministic tactical response plan",
    approvalRequired: Boolean(data.approvalRequired ?? true),
    createdAt: data.createdAt || new Date().toISOString(),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<ResponsePlanDocument>(COLLECTIONS.RESPONSE_PLANS).insertOne(newPlan);
      return {
        success: true,
        data: newPlan,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Failed to write response plan to MongoDB:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: newPlan,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

/**
 * ALERTS
 */
export async function getAlerts(
  incidentId?: string
): Promise<QueryResult<AlertDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const query = incidentId ? { incidentId } : {};
      const results = await db
        .collection<AlertDocument>(COLLECTIONS.ALERTS)
        .find(query)
        .sort({ sentAt: -1 })
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Alerts fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: getMockAlertDocuments(),
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createAlert(
  data: Partial<AlertDocument>
): Promise<QueryResult<AlertDocument>> {
  const newAlert: AlertDocument = {
    alertId: data.alertId || `alt-${Date.now().toString(36)}`,
    incidentId: data.incidentId || MOCK_FLOOD_INCIDENT.id,
    type: data.type || "EMERGENCY_BROADCAST",
    severity: data.severity || "CRITICAL",
    recipient: data.recipient || "PUBLIC_CITIZENRY",
    channel: data.channel || "CELL_BROADCAST",
    status: data.status || "SENT",
    sentAt: data.sentAt || new Date().toISOString(),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<AlertDocument>(COLLECTIONS.ALERTS).insertOne(newAlert);
      return {
        success: true,
        data: newAlert,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn("[MongoDB] Failed to write alert to MongoDB:", err);
    }
  }

  return {
    success: true,
    data: newAlert,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

/**
 * RISK FORECASTS
 */
export async function getRiskForecasts(): Promise<QueryResult<RiskForecastDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const results = await db
        .collection<RiskForecastDocument>(COLLECTIONS.RISK_FORECASTS)
        .find({})
        .sort({ riskScore: -1 })
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Risk forecasts fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    success: true,
    data: getMockRiskForecastDocuments(),
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createRiskForecast(
  data: Partial<RiskForecastDocument>
): Promise<QueryResult<RiskForecastDocument>> {
  const newForecast: RiskForecastDocument = {
    forecastId: data.forecastId || `fc-${Date.now().toString(36)}`,
    areaName: data.areaName || "Area Sector",
    latitude: Number(data.latitude ?? 13.0067),
    longitude: Number(data.longitude ?? 80.2206),
    hazardType: data.hazardType || "FLOOD",
    riskScore: Number(data.riskScore ?? 50),
    riskLevel: data.riskLevel || "WARNING",
    contributingFactors: Array.isArray(data.contributingFactors) ? data.contributingFactors : [],
    source: data.source || "Hydro-AI Ensemble",
    forecastTime: data.forecastTime || new Date().toISOString(),
    expiresAt: data.expiresAt || new Date(Date.now() + 4 * 3600000).toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<RiskForecastDocument>(COLLECTIONS.RISK_FORECASTS).insertOne(newForecast);
      return {
        success: true,
        data: newForecast,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn("[MongoDB] Failed to write risk forecast to MongoDB:", err);
    }
  }

  return {
    success: true,
    data: newForecast,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

/**
 * ACTIVITY LOGS
 */
export async function getActivityLogs(
  incidentId?: string,
  limit = 50
): Promise<QueryResult<ActivityLogDocument[]>> {
  if (isMongoActive()) {
    try {
      await autoSeedMongoIfEmpty();
      const db = await getDatabase();
      const query = incidentId ? { incidentId } : {};
      const results = await db
        .collection<ActivityLogDocument>(COLLECTIONS.ACTIVITY_LOGS)
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      if (results.length > 0) {
        return {
          success: true,
          data: results.map((doc) => ({
            ...doc,
            _id: doc._id?.toString(),
          })),
          source: "mongodb",
          fallback: false,
        };
      }
    } catch (err: unknown) {
      console.warn(
        "[MongoDB] Activity logs fetch failed, falling back to simulation data:",
        err instanceof Error ? err.message : err
      );
    }
  }

  let list = getMockActivityLogDocuments();
  if (incidentId) {
    list = list.filter((l) => l.incidentId === incidentId);
  }
  return {
    success: true,
    data: list.slice(0, limit),
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}

export async function createActivityLog(
  data: Partial<ActivityLogDocument>
): Promise<QueryResult<ActivityLogDocument>> {
  const newLog: ActivityLogDocument = {
    eventId: data.eventId || `evt-${Date.now().toString(36)}`,
    eventType: data.eventType || "SYSTEM",
    message: data.message || "Activity recorded",
    actor: data.actor || "EOC Orchestrator",
    incidentId: data.incidentId || MOCK_FLOOD_INCIDENT.id,
    timestamp: data.timestamp || new Date().toISOString(),
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<ActivityLogDocument>(COLLECTIONS.ACTIVITY_LOGS).insertOne(newLog);
      return {
        success: true,
        data: newLog,
        source: "mongodb",
        fallback: false,
      };
    } catch (err: unknown) {
      console.warn("[MongoDB] Failed to write activity log to MongoDB:", err);
    }
  }

  return {
    success: true,
    data: newLog,
    source: "local_simulation",
    fallback: getDatabaseMode() === "mongodb",
  };
}
