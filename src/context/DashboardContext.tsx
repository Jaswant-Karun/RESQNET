"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  generateDeterministicFloodScenario,
} from "@/lib/flood-simulation-engine";
import { generateResponsePlan } from "@/lib/responseEngine";
import {
  allocateResources,
  calculateRecommendedAllocation,
  createAllocationTimelineEvent,
  syncFleetStatuses,
  INITIAL_AVAILABLE_RESOURCES,
  INITIAL_RECOMMENDED_RESOURCES,
} from "@/lib/resourceAllocationEngine";
import {
  MOCK_ALERTS,
  MOCK_TIMELINE_EVENTS,
} from "@/data";
import {
  Alert,
  Drone,
  Hospital,
  Incident,
  Resource,
  ResourceAllocation,
  ResourceAllocationState,
  ResponsePlan,
  RoadSegment,
  Shelter,
  TimelineEvent,
  Zone,
  WorkflowOrchestrationState,
  WorkflowLogItem,
} from "@/types";

import { eventService, LogEventParams } from "@/lib/eventService";
import { LiveDisasterIntelligencePayload } from "@/lib/disaster-data/types";

export type DashboardTab =
  | "overview"
  | "risk-intelligence"
  | "incidents"
  | "resources"
  | "drones"
  | "plans"
  | "activity"
  | "ai"
  | "automation";

export type SimulationStage = "NORMAL" | "FLOOD_ACTIVE" | "ESCALATED";

interface DashboardContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  simulationStage: SimulationStage;
  simulationStatus: string;
  simulateFlood: () => void;
  simulateEscalation: () => void;
  resetSimulation: () => void;
  incident: Incident;
  zones: Zone[];
  hospitals: Hospital[];
  shelters: Shelter[];
  roads: RoadSegment[];
  ambulances: Resource[];
  rescueTeams: Resource[];
  drones: Drone[];
  plan: ResponsePlan;
  alerts: Alert[];
  timeline: TimelineEvent[];
  addTimelineEvent: (params: LogEventParams | TimelineEvent) => TimelineEvent;
  approveAction: () => void;
  isActionApproved: boolean;
  rejectAction: (reason?: string) => void;
  isActionRejected: boolean;
  rejectionReason: string | null;
  notification: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
  } | null;
  dismissNotification: () => void;
  selectedZone: Zone | null;
  setSelectedZone: (zone: Zone | null) => void;
  unreadAlertCount: number;
  markAlertsRead: () => void;

  // Intelligent Resource Allocation State & Methods
  resourceAllocationState: ResourceAllocationState;
  updateResourceAllocation: (requested?: Partial<ResourceAllocation>) => void;
  resetResourceAllocation: () => void;

  // Gemini & Fallback states
  isAiLoading: boolean;
  aiStatusMessage: string;
  simulateApiFailure: boolean;
  setSimulateApiFailure: (val: boolean) => void;
  triggerAiAnalysisWithTestCase?: (testCase: "MISSING_KEY" | "QUOTA_EXCEEDED" | "INVALID_JSON" | "TIMEOUT" | "INVALID_RESPONSE") => Promise<void>;

  // n8n Workflow Orchestration Layer
  workflowState: WorkflowOrchestrationState;
  isTriggeringAutomation: boolean;
  simulateN8nFailure: boolean;
  setSimulateN8nFailure: (val: boolean) => void;
  triggerAutomationWorkflow: (action?: string, options?: { simulateUnavailable?: boolean; testCase?: "N8N_UNAVAILABLE" | "N8N_URL_MISSING" }) => Promise<void>;
  approveCriticalResponseWorkflow: () => Promise<void>;
  dispatchDroneWorkflow: (droneId?: string) => Promise<void>;
  approveEmergencyAlertWorkflow: () => Promise<void>;

  // Resilience & Failure Testing State
  simulateTileError: boolean;
  setSimulateTileError: (val: boolean) => void;
  activeResilienceTest: string | null;
  triggerResilienceTest: (testId: string) => Promise<void>;
  resetAllResilienceTests: () => void;

  // MongoDB & Data Persistence Layer
  databaseState: DatabaseState;
  refreshDatabaseData: () => Promise<void>;

  // Live Disaster Risk Intelligence Layer
  riskIntelligence: LiveDisasterIntelligencePayload | null;
  isRiskIntelligenceLoading: boolean;
  refreshRiskIntelligence: (force?: boolean) => Promise<void>;
}

export interface DatabaseState {
  mode: "local" | "mongodb";
  configured: boolean;
  connected: boolean;
  source: "mongodb" | "local_simulation";
  latencyMs?: number;
  error?: string;
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Generate initial deterministic flood scenario
  const initialScenario = generateDeterministicFloodScenario();
  const initialPlan = generateResponsePlan(initialScenario.incident);

  // Initial Intelligent Resource Allocation:
  // Available: 8 Ambulances, 4 Rescue Teams, 3 Drones
  // Recommended: 2 Ambulances, 2 Rescue Teams, 1 Drone
  const initialAllocation = allocateResources(
    INITIAL_AVAILABLE_RESOURCES,
    INITIAL_RECOMMENDED_RESOURCES,
    initialScenario.incident
  );

  const initialSyncedFleets = syncFleetStatuses(
    initialScenario.ambulances,
    initialScenario.rescueTeams,
    initialScenario.drones,
    initialAllocation.assigned
  );

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [simulationStage, setSimulationStage] =
    useState<SimulationStage>("FLOOD_ACTIVE");
  const [simulationStatus, setSimulationStatus] = useState<string>(
    "FLOOD INCIDENT SIMULATED"
  );
  const [incident, setIncident] = useState<Incident>(initialScenario.incident);
  const [zones, setZones] = useState<Zone[]>(initialScenario.zones);
  const [hospitals, setHospitals] = useState<Hospital[]>(initialScenario.hospitals);
  const [shelters, setShelters] = useState<Shelter[]>(initialScenario.shelters);
  const [roads, setRoads] = useState<RoadSegment[]>(initialScenario.roads);

  // Resource fleets with tactical statuses synced
  const [ambulances, setAmbulances] = useState<Resource[]>(initialSyncedFleets.updatedAmbulances);
  const [rescueTeams, setRescueTeams] = useState<Resource[]>(initialSyncedFleets.updatedRescueTeams);
  const [drones, setDrones] = useState<Drone[]>(initialSyncedFleets.updatedDrones);

  // Intelligent Resource Allocation state
  const [resourceAllocationState, setResourceAllocationState] =
    useState<ResourceAllocationState>(initialAllocation);

  const initialAllocEvent = createAllocationTimelineEvent(
    initialAllocation,
    initialScenario.incident.id,
    "Initial Allocation: 2 Ambulances (READY), 2 Rescue Teams (DEPLOYING), 1 Drone (MISSION CREATED). 6 Ambulances, 2 Teams, 2 Drones in reserve.",
    initialScenario.incident.detectedAt
  );

  const initialBaseTime = Date.now() - 45000;
  const initialFloodEvents: TimelineEvent[] = [
    {
      id: `evt-fl-init-1`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime).toISOString(),
      title: "Flood simulation started",
      description: "Hydro-sensor telemetry streams initiated across Adyar catchment basin. Continuous water depth monitoring active.",
      category: "SYSTEM",
      severity: "INFO",
      authorOrSystem: "EOC Disaster Simulation Engine",
    },
    {
      id: `evt-fl-init-2`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 1000).toISOString(),
      title: "Incident created",
      description: "Disaster incident FL-902 categorized as active flood. Sensor Node-4 registered rapid crest increase.",
      category: "DETECTION",
      severity: "CRITICAL",
      authorOrSystem: "Sensor Sentinel Grid Node-4",
    },
    {
      id: `evt-fl-init-3`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 2000).toISOString(),
      title: "Risk analysis completed",
      description: "Multi-criteria risk engine evaluated 1,240 civilians at risk. River basin overflow model verified.",
      category: "ANALYSIS",
      severity: "WARNING",
      authorOrSystem: "Hydro-AI Risk Engine",
    },
    {
      id: `evt-fl-init-4`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 3000).toISOString(),
      title: "Zone A classified as CRITICAL",
      description: "Zone A water depth reached 2.4m, surpassing 2.0m danger threshold. Roads R1 and R3 impassable.",
      category: "ANALYSIS",
      severity: "CRITICAL",
      authorOrSystem: "Autonomous Zone Classifier",
    },
    {
      id: `evt-fl-init-5`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 4000).toISOString(),
      title: "Response plan generated",
      description: "Designated evacuation corridor via Route R2 to Shelter B (Capacity: 700). High ground transit verified.",
      category: "DECISION",
      severity: "INFO",
      authorOrSystem: "RESQNET Response Engine",
    },
    {
      id: `evt-fl-init-6`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 5000).toISOString(),
      title: "Human approval requested",
      description: "Mandatory human-in-the-loop clearance required: Evacuate Zone A (1,240 pop) via Route R2 → Shelter B.",
      category: "APPROVAL",
      severity: "WARNING",
      authorOrSystem: "HITL Security Guardrail",
    },
    {
      id: `evt-fl-init-7`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 6000).toISOString(),
      title: "Drone 01 mission created",
      description: "UAV Echo-1 flight plan programmed: Corridor survey along Route R2 and Zone A perimeter recon.",
      category: "RESOURCE",
      severity: "INFO",
      authorOrSystem: "Drone Fleet Command",
    },
    {
      id: `evt-fl-init-8`,
      incidentId: initialScenario.incident.id,
      timestamp: new Date(initialBaseTime + 7000).toISOString(),
      title: "2 ambulances assigned",
      description: "Ambulances AMB-01 and AMB-02 pre-positioned at Station North for rapid medical extrication.",
      category: "RESOURCE",
      severity: "INFO",
      authorOrSystem: "CAD 108 Dispatcher",
    },
  ];

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    ...initialFloodEvents,
    initialAllocEvent,
    ...MOCK_TIMELINE_EVENTS,
  ]);

  const [plan, setPlan] = useState<ResponsePlan>(initialPlan);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isActionApproved, setIsActionApproved] = useState<boolean>(false);
  const [isActionRejected, setIsActionRejected] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const dismissNotification = () => setNotification(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(initialScenario.zones[0]);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);

  // Gemini Integration States
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>(
    "AI service unavailable — fallback decision engine active."
  );
  const [simulateApiFailure, setSimulateApiFailure] = useState<boolean>(false);

  // Resilience & Failure Testing States
  const [simulateN8nFailure, setSimulateN8nFailure] = useState<boolean>(false);
  const [simulateTileError, setSimulateTileError] = useState<boolean>(false);
  const [activeResilienceTest, setActiveResilienceTest] = useState<string | null>(null);

  // n8n Workflow Orchestration Layer States
  const [workflowState, setWorkflowState] = useState<WorkflowOrchestrationState>({
    orchestrator: "SIMULATION_MODE",
    incidentIntake: "COMPLETED",
    criticalResponse: "WAITING FOR APPROVAL",
    droneWorkflow: "READY",
    emergencyAlert: "PENDING APPROVAL",
    isSimulationMode: true,
    n8nWebhookConfigured: false,
    lastTriggeredAt: undefined,
    logs: [
      {
        id: "init-w1",
        timestamp: initialScenario.incident.detectedAt,
        workflow: "Incident Intake",
        status: "SUCCESS",
        stepName: "Intake Verified",
        message: "Initial scenario loaded: Incident FL-801-ADYAR intake validated.",
      },
      {
        id: "init-w2",
        timestamp: initialScenario.incident.detectedAt,
        workflow: "Critical Response",
        status: "PENDING",
        stepName: "Human Approval Gate",
        message: "Incident is CRITICAL: Human approval safeguard armed.",
      },
      {
        id: "init-w3",
        timestamp: initialScenario.incident.detectedAt,
        workflow: "Drone Deployment",
        status: "INFO",
        stepName: "UAV Telemetry Sync",
        message: "3 UAV units online and ready on pad.",
      },
      {
        id: "init-w4",
        timestamp: initialScenario.incident.detectedAt,
        workflow: "Emergency Alert",
        status: "PENDING",
        stepName: "CAP Draft Generated",
        message: "Cell broadcast draft queued for Zone A Highland corridor.",
      },
    ],
  });
  const [isTriggeringAutomation, setIsTriggeringAutomation] = useState<boolean>(false);

  // MongoDB Atlas Persistent Data Layer State
  const [databaseState, setDatabaseState] = useState<DatabaseState>({
    mode: "local",
    configured: false,
    connected: false,
    source: "local_simulation",
    loading: true,
  });

  const refreshDatabaseData = async () => {
    try {
      const res = await fetch("/api/db-status");
      if (!res.ok) throw new Error("Status check response was not ok");
      const statusData = await res.json();

      const isMongoReady = statusData.mode === "mongodb" && statusData.connected;

      setDatabaseState({
        mode: statusData.mode || "local",
        configured: Boolean(statusData.configured),
        connected: Boolean(statusData.connected),
        source: isMongoReady ? "mongodb" : "local_simulation",
        latencyMs: statusData.latencyMs,
        error: statusData.error,
        loading: false,
      });

      // When MongoDB is active and connected, hydrate dashboard from persistent MongoDB collections
      if (isMongoReady) {
        const [incRes, planRes, altRes] = await Promise.allSettled([
          fetch("/api/incidents").then((r) => r.json()),
          fetch("/api/response-plans").then((r) => r.json()),
          fetch("/api/alerts").then((r) => r.json()),
        ]);

        if (incRes.status === "fulfilled" && incRes.value?.success && incRes.value.data?.[0]) {
          const liveInc = incRes.value.data[0];
          setIncident((prev) => ({
            ...prev,
            id: liveInc.incidentId || prev.id,
            severity: (liveInc.severity as any) || prev.severity,
            status: (liveInc.status as any) || prev.status,
            metrics: {
              ...prev.metrics,
              waterLevelMeters: liveInc.waterLevel ?? prev.metrics.waterLevelMeters,
              affectedPopulationEstimated:
                liveInc.affectedPopulation ?? prev.metrics.affectedPopulationEstimated,
            },
          }));
        }

        if (planRes.status === "fulfilled" && planRes.value?.success && planRes.value.data?.[0]) {
          const livePlan = planRes.value.data[0];
          setPlan((prev) => ({
            ...prev,
            riskLevel: (livePlan.riskLevel as any) || prev.riskLevel,
            priorityZones: livePlan.priorityZones || prev.priorityZones,
            immediateActions: livePlan.immediateActions || prev.immediateActions,
            resourceAllocation: livePlan.resourceAllocation || prev.resourceAllocation,
            evacuationRoute: livePlan.evacuationRoute || prev.evacuationRoute,
            targetShelter: livePlan.shelter || prev.targetShelter,
            explanation: livePlan.explanation || prev.explanation,
          }));
        }

        if (altRes.status === "fulfilled" && altRes.value?.success && Array.isArray(altRes.value.data)) {
          const liveAlerts = altRes.value.data;
          if (liveAlerts.length > 0) {
            setAlerts(
              liveAlerts.map((a: any) => ({
                id: a.alertId || `alt-${Math.random()}`,
                incidentId: a.incidentId,
                code: (a.alertId || "ALERT").toUpperCase(),
                title: `${a.type || "EMERGENCY"} ALERT`,
                message: `Broadcast to ${a.recipient || "Public"} via ${a.channel || "Broadcast"}`,
                severity: a.severity || "CRITICAL",
                timestamp: a.sentAt || new Date().toISOString(),
                source: "DAM_AUTHORITY",
                acknowledged: a.status === "ACKNOWLEDGED",
              }))
            );
          }
        }
      }
    } catch {
      setDatabaseState((prev) => ({
        ...prev,
        source: "local_simulation",
        connected: false,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    refreshDatabaseData();
  }, []);

  // Subscribe to Common Event Service to capture all emitted events
  useEffect(() => {
    const unsub = eventService.subscribe((newEvent) => {
      setTimeline((prev) => {
        if (prev.some((e) => e.id === newEvent.id)) return prev;
        return [newEvent, ...prev];
      });
    });
    return unsub;
  }, []);

  // Live Disaster Risk Intelligence state & synchronization
  const [riskIntelligence, setRiskIntelligence] =
    useState<LiveDisasterIntelligencePayload | null>(null);
  const [isRiskIntelligenceLoading, setIsRiskIntelligenceLoading] =
    useState<boolean>(false);

  const refreshRiskIntelligence = async (force = false) => {
    try {
      setIsRiskIntelligenceLoading(true);
      const res = await fetch(
        `/api/risk-intelligence?stage=${simulationStage}&refresh=${force}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setRiskIntelligence(json.data);
      }
    } catch (err) {
      console.warn("[DashboardContext] Failed to load live risk intelligence:", err);
    } finally {
      setIsRiskIntelligenceLoading(false);
    }
  };

  useEffect(() => {
    refreshRiskIntelligence();
  }, [simulationStage]);

  /**
   * Common Event Service dispatch method exposed to all modules and components
   */
  const addTimelineEvent = (params: LogEventParams | TimelineEvent): TimelineEvent => {
    if ("id" in params) {
      setTimeline((prev) => [params as TimelineEvent, ...prev]);
      return params as TimelineEvent;
    }
    return eventService.logEvent(params);
  };

  /**
   * Applies resource allocation, enforces availability caps, updates fleet statuses,
   * and creates a timeline dispatch audit event.
   */
  const applyAllocation = (
    targetRequested: ResourceAllocation,
    targetIncident?: Incident,
    availablePool?: ResourceAllocation
  ) => {
    const inc = targetIncident || incident;
    const avail = availablePool || resourceAllocationState.available;
    const nextAlloc = allocateResources(avail, targetRequested, inc);

    setResourceAllocationState(nextAlloc);

    // Synchronize fleet unit cards
    setAmbulances((prev) => {
      const synced = syncFleetStatuses(prev, rescueTeams, drones, nextAlloc.assigned);
      return synced.updatedAmbulances;
    });
    setRescueTeams((prev) => {
      const synced = syncFleetStatuses(ambulances, prev, drones, nextAlloc.assigned);
      return synced.updatedRescueTeams;
    });
    setDrones((prev) => {
      const synced = syncFleetStatuses(ambulances, rescueTeams, prev, nextAlloc.assigned);
      return synced.updatedDrones;
    });

    // Record in timeline
    const allocEvent = createAllocationTimelineEvent(nextAlloc, inc.id);
    setTimeline((prev) => [allocEvent, ...prev]);

    return nextAlloc;
  };

  /**
   * Updates resource allocation from external components or custom commander inputs
   */
  const updateResourceAllocation = (requested?: Partial<ResourceAllocation>) => {
    const nextRequested: ResourceAllocation = {
      ambulances: requested?.ambulances ?? resourceAllocationState.requested.ambulances,
      rescueTeams: requested?.rescueTeams ?? resourceAllocationState.requested.rescueTeams,
      drones: requested?.drones ?? resourceAllocationState.requested.drones,
    };
    applyAllocation(nextRequested);
  };

  const resetResourceAllocation = () => {
    applyAllocation(INITIAL_RECOMMENDED_RESOURCES, incident, INITIAL_AVAILABLE_RESOURCES);
  };

  /**
   * Dispatches incident to server-side /api/analyze-incident endpoint.
   * If Gemini is available & succeeds -> updates plan with Gemini AI recommendations.
   * If Gemini fails/times out/missing key/simulate failure -> updates with deterministic fallback.
   * Also syncs intelligent resource allocation from the generated response plan!
   */
  const triggerAiAnalysis = async (
    targetIncident: Incident,
    forceSimulateFailure?: boolean,
    testCase?: "MISSING_KEY" | "QUOTA_EXCEEDED" | "INVALID_JSON" | "TIMEOUT" | "INVALID_RESPONSE"
  ) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident: targetIncident,
          simulateError: forceSimulateFailure ?? simulateApiFailure,
          testCase,
        }),
      });

      if (!res.ok) {
        throw new Error("HTTP non-200");
      }

      const data = await res.json();
      if (data && data.plan) {
        setPlan(data.plan);
        setAiStatusMessage(
          data.statusMessage || (data.source === "GEMINI_AI"
            ? "AI Decision Generated by Gemini"
            : "AI service unavailable — fallback decision engine active.")
        );

        // Update resource allocation based on response plan recommendation
        if (data.plan.resourceAllocation) {
          applyAllocation(data.plan.resourceAllocation, targetIncident);
        }
      }
    } catch {
      // Offline fallback guarantee
      const fallbackPlan = generateResponsePlan(targetIncident);
      setPlan({
        ...fallbackPlan,
        decisionEngine: "FALLBACK",
      });
      setAiStatusMessage("AI service unavailable — fallback decision engine active.");

      if (fallbackPlan.resourceAllocation) {
        applyAllocation(fallbackPlan.resourceAllocation, targetIncident);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const triggerAiAnalysisWithTestCase = async (
    testCase: "MISSING_KEY" | "QUOTA_EXCEEDED" | "INVALID_JSON" | "TIMEOUT" | "INVALID_RESPONSE"
  ) => {
    await triggerAiAnalysis(incident, true, testCase);
  };

  // Deterministic simulateFlood() function
  const simulateFlood = () => {
    const scenario = generateDeterministicFloodScenario();

    setSimulationStage("FLOOD_ACTIVE");
    setSimulationStatus("FLOOD INCIDENT SIMULATED");
    setIsActionApproved(false);
    setIsActionRejected(false);
    setRejectionReason(null);
    setNotification(null);

    // Initial scenario resource allocation (8 available, 2 / 2 / 1 allocated)
    const initAlloc = allocateResources(
      INITIAL_AVAILABLE_RESOURCES,
      INITIAL_RECOMMENDED_RESOURCES,
      scenario.incident
    );
    setResourceAllocationState(initAlloc);

    const synced = syncFleetStatuses(
      scenario.ambulances,
      scenario.rescueTeams,
      scenario.drones,
      initAlloc.assigned
    );
    setAmbulances(synced.updatedAmbulances);
    setRescueTeams(synced.updatedRescueTeams);
    setDrones(synced.updatedDrones);

    setIncident(scenario.incident);
    setZones(scenario.zones);
    setHospitals(scenario.hospitals);
    setShelters(scenario.shelters);
    setRoads(scenario.roads);
    setSelectedZone(scenario.zones[0]);

    // Complete Chronological Event Log for Flood Simulation
    const baseTime = Date.now();
    const floodEvents: TimelineEvent[] = [
      {
        id: `evt-fl-1-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime).toISOString(),
        title: "Flood simulation started",
        description: "Hydro-sensor telemetry streams initiated across Adyar catchment basin. Continuous water depth monitoring active.",
        category: "SYSTEM",
        severity: "INFO",
        authorOrSystem: "EOC Disaster Simulation Engine",
      },
      {
        id: `evt-fl-2-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 1000).toISOString(),
        title: "Incident created",
        description: "Disaster incident FL-902 categorized as active flood. Sensor Node-4 registered rapid crest increase.",
        category: "DETECTION",
        severity: "CRITICAL",
        authorOrSystem: "Sensor Sentinel Grid Node-4",
      },
      {
        id: `evt-fl-3-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 2000).toISOString(),
        title: "Risk analysis completed",
        description: "Multi-criteria risk engine evaluated 1,240 civilians at risk. River basin overflow model verified.",
        category: "ANALYSIS",
        severity: "WARNING",
        authorOrSystem: "Hydro-AI Risk Engine",
      },
      {
        id: `evt-fl-4-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 3000).toISOString(),
        title: "Zone A classified as CRITICAL",
        description: "Zone A water depth reached 2.4m, surpassing 2.0m danger threshold. Roads R1 and R3 impassable.",
        category: "ANALYSIS",
        severity: "CRITICAL",
        authorOrSystem: "Autonomous Zone Classifier",
      },
      {
        id: `evt-fl-5-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 4000).toISOString(),
        title: "Response plan generated",
        description: "Designated evacuation corridor via Route R2 to Shelter B (Capacity: 700). High ground transit verified.",
        category: "DECISION",
        severity: "INFO",
        authorOrSystem: "RESQNET Response Engine",
      },
      {
        id: `evt-fl-6-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 5000).toISOString(),
        title: "Human approval requested",
        description: "Mandatory human-in-the-loop clearance required: Evacuate Zone A (1,240 pop) via Route R2 → Shelter B.",
        category: "APPROVAL",
        severity: "WARNING",
        authorOrSystem: "HITL Security Guardrail",
      },
      {
        id: `evt-fl-7-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 6000).toISOString(),
        title: "Drone 01 mission created",
        description: "UAV Echo-1 flight plan programmed: Corridor survey along Route R2 and Zone A perimeter recon.",
        category: "RESOURCE",
        severity: "INFO",
        authorOrSystem: "Drone Fleet Command",
      },
      {
        id: `evt-fl-8-${baseTime}`,
        incidentId: scenario.incident.id,
        timestamp: new Date(baseTime + 7000).toISOString(),
        title: "2 ambulances assigned",
        description: "Ambulances AMB-01 and AMB-02 pre-positioned at Station North for rapid medical extrication.",
        category: "RESOURCE",
        severity: "INFO",
        authorOrSystem: "CAD 108 Dispatcher",
      },
    ];

    setTimeline([...floodEvents, ...MOCK_TIMELINE_EVENTS]);

    // Set immediate deterministic baseline, then query Gemini server route
    const instantFallbackPlan = generateResponsePlan(scenario.incident);
    setPlan(instantFallbackPlan);

    // Call Gemini Situation Analysis (only on simulation trigger!)
    triggerAiAnalysis(scenario.incident);

    // Trigger n8n Workflow Orchestration Layer for initial scenario
    triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION");
  };

  // Deterministic simulateEscalation() function
  const simulateEscalation = () => {
    const now = new Date();
    const baseTime = now.getTime();

    setSimulationStage("ESCALATED");
    setSimulationStatus("CRITICAL ESCALATION ACTIVE");
    setIsActionApproved(false);
    setIsActionRejected(false);
    setRejectionReason(null);

    // Escalated Incident with exact prompt metrics:
    // Water level: 3.1m, Affected population: 2,180, Blocked roads: R1, R2, R3 (R2 now blocked)
    const escalatedIncident: Incident = {
      ...incident,
      code: "FL-902-CATACLYSMIC",
      title: "Adyar Basin Sluice Gate 7 Breach & Zone B Inundation",
      severity: "CRITICAL",
      status: "ESCALATING",
      operationalSummary:
        "CRITICAL ESCALATION: Upstream dam discharge breached Route R2. Water level surged from 2.4m to 3.1m with 2,180 civilians in inundation zone. Previous Route R2 invalidated. Recalculated evacuation route via Route R4 Highland Arterial to Shelter C.",
      metrics: {
        ...incident.metrics,
        waterLevelMeters: 3.1, // Exact: 3.1m
        waterLevelTrend: "RISING_RAPID",
        rainfallRateMmPerHour: 98.0,
        affectedPopulationEstimated: 2180, // Exact: 2,180
        confirmedEvacuated: 680,
        reportedStranded: 340,
        criticalInfrastructureAtRisk: 9,
      },
      blockedRoads: ["R1", "R2", "R3"], // Exact: R1, R2, R3 (R2 now blocked)
    };
    setIncident(escalatedIncident);

    // Escalate zones: Zone A is 3.1m, Zone B is 2.2m
    setZones((prev) =>
      prev.map((z) => {
        if (z.code === "Zone A") {
          return { ...z, waterDepthMeters: 3.1, populationEstimate: 2180, status: "SUBMERGED" };
        }
        if (z.code === "Zone B") {
          return {
            ...z,
            riskLevel: "CRITICAL",
            waterDepthMeters: 2.2,
            status: "SUBMERGED",
          };
        }
        return z;
      })
    );

    // Escalate roads: R1, R2, R3 blocked; R4 clear
    setRoads((prev) =>
      prev.map((r) => {
        if (r.code === "R1") {
          return { ...r, status: "SUBMERGED", isBlocked: true, waterDepthCm: 310 };
        }
        if (r.code === "R2") {
          return { ...r, status: "SUBMERGED", isBlocked: true, waterDepthCm: 185 };
        }
        if (r.code === "R3") {
          return { ...r, status: "SUBMERGED", isBlocked: true, waterDepthCm: 220 };
        }
        if (r.code === "R4") {
          return { ...r, status: "CLEAR", isBlocked: false, waterDepthCm: 0 };
        }
        return r;
      })
    );

    // Escalated Resource Allocation: Exact prompt requirement (4 ambulances, 3 rescue teams, 2 drones)
    const escalatedRecommended: ResourceAllocation = {
      ambulances: 4,
      rescueTeams: 3,
      drones: 2,
    };
    const escalatedAlloc = allocateResources(
      resourceAllocationState.available,
      escalatedRecommended,
      escalatedIncident
    );
    setResourceAllocationState(escalatedAlloc);

    setAmbulances((prev) =>
      syncFleetStatuses(prev, rescueTeams, drones, escalatedAlloc.assigned).updatedAmbulances
    );
    setRescueTeams((prev) =>
      syncFleetStatuses(ambulances, prev, drones, escalatedAlloc.assigned).updatedRescueTeams
    );
    setDrones((prev) =>
      syncFleetStatuses(ambulances, rescueTeams, prev, escalatedAlloc.assigned).updatedDrones
    );

    // REQUIRED EXACT TIMELINE ENTRIES (CHRONOLOGICAL EVENT LOG)
    const requiredTimelineEvents: TimelineEvent[] = [
      {
        id: `evt-esc-0-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime).toISOString(),
        title: "Escalation detected",
        description:
          "Upstream dam discharge breached Route R2. Catastrophic water surge detected across Adyar basin hydro-stations.",
        category: "ESCALATION",
        severity: "CRITICAL",
        authorOrSystem: "Dam Sluice Telemetry Array",
      },
      {
        id: `evt-esc-1-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 1000).toISOString(),
        title: "Flood conditions escalated.",
        description:
          "Sluice gate spillover intensified; catchment discharge elevated to high danger threshold.",
        category: "ESCALATION",
        severity: "CRITICAL",
        authorOrSystem: "Hydro-Sensor Sentinel Network",
      },
      {
        id: `evt-esc-2-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 2000).toISOString(),
        title: "Water level increased from 2.4m to 3.1m.",
        description:
          "River basin crest exceeded 3.1 meters. 2,180 residents in Zone A & B now in critical inundation zone.",
        category: "DETECTION",
        severity: "CRITICAL",
        authorOrSystem: "Telemetry Node Adyar-4",
      },
      {
        id: `evt-esc-3-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 3000).toISOString(),
        title: "Route R2 became blocked.",
        description:
          "Kotturpuram High Bypass (R2) submerged by 185cm flash flood surge. Traffic impassable.",
        category: "ESCALATION",
        severity: "CRITICAL",
        authorOrSystem: "Traffic Transit Monitoring",
      },
      {
        id: `evt-esc-4-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 4000).toISOString(),
        title: "Route R2 invalidated",
        description:
          "Primary evacuation corridor via Route R2 to Shelter B revoked due to active flooding.",
        category: "DECISION",
        severity: "WARNING",
        authorOrSystem: "RESQNET Route Safety Guard",
      },
      {
        id: `evt-esc-4b-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 4500).toISOString(),
        title: "Previous evacuation route invalidated.",
        description:
          "Previous evacuation corridor via Route R2 invalidated due to rising flood surge.",
        category: "DECISION",
        severity: "WARNING",
        authorOrSystem: "RESQNET Route Safety Guard",
      },
      {
        id: `evt-esc-5-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 5000).toISOString(),
        title: "Response plan recalculated.",
        description:
          "Adaptive response engine executed dynamic multi-criteria rerouting with updated risk parameters.",
        category: "DECISION",
        severity: "INFO",
        authorOrSystem: "RESQNET Adaptive Response Engine",
      },
      {
        id: `evt-esc-5b-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 5500).toISOString(),
        title: "New response plan generated",
        description:
          "Multi-hazard contingency plan generated: High-capacity evacuation to Shelter C via Route R4.",
        category: "DECISION",
        severity: "INFO",
        authorOrSystem: "Automated Planner Core",
      },
      {
        id: `evt-esc-6-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 6000).toISOString(),
        title: "New evacuation route R4 selected.",
        description:
          "Elevated Highland Arterial R4 selected as sole safe passage, terminating at Shelter C (Capacity: 1,500).",
        category: "DECISION",
        severity: "INFO",
        authorOrSystem: "GIS Routing Engine",
      },
      {
        id: `evt-esc-7-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 7000).toISOString(),
        title: "Additional resources requested.",
        description:
          "Resource requirement increased to 4 Ambulances (+2), 3 Rescue Teams (+1), and 2 UAVs (+1). Strike units mobilized.",
        category: "RESOURCE",
        severity: "CRITICAL",
        authorOrSystem: "Incident Commander R. Menon",
      },
      {
        id: `evt-esc-8-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 8000).toISOString(),
        title: "Human approval requested",
        description:
          "Mandatory operator authorization checkpoint: Evacuate Zone A & B (2,180 pop) via Route R4 → Shelter C.",
        category: "APPROVAL",
        severity: "WARNING",
        authorOrSystem: "HITL Security Guardrail",
      },
    ];

    setTimeline((prev) => [...requiredTimelineEvents, ...prev]);

    // Recalculate Response Plan adaptively
    const recalculatedPlan = generateResponsePlan(escalatedIncident);
    setPlan({
      ...recalculatedPlan,
      resourceAllocation: escalatedAlloc.assigned,
      evacuationRoute: "R4",
      targetShelter: "Shelter C",
      approvalRequired: true,
      status: "AWAITING_APPROVAL",
      humanApproved: false,
    });

    // Query Gemini Situation Analysis for Escalated scenario
    triggerAiAnalysis(escalatedIncident);

    // Critical Alert
    const newAlert: Alert = {
      id: `alt-esc-${Date.now()}`,
      incidentId: escalatedIncident.id,
      code: "ALT-SURGE-GATE-7",
      title: "Catastrophic 3.1m Flood Surge — Route R2 Inundated",
      message:
        "Emergency Directive: Roads R1, R2, and R3 are impassable. All evacuation convoys diverted to Route R4 Highland Arterial toward Shelter C.",
      severity: "CRITICAL",
      timestamp: new Date().toISOString(),
      source: "DAM_AUTHORITY",
      zoneId: "zone-a",
      acknowledged: false,
      actionableStep: "Evacuate via Route R4 Highland Pass to Shelter C",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setUnreadAlertCount((c) => c + 1);

    // Notification Toast for Escalation
    setNotification({
      type: "warning",
      title: "ADAPTIVE ESCALATION: ROUTE R2 BLOCKED",
      message:
        "Water level 3.1m. Route R2 blocked. Recalculated to Route R4 → Shelter C. Allocation: 4 Amb, 3 Rescue, 2 Drones.",
      timestamp: new Date().toISOString(),
    });

    // Trigger n8n Workflow Orchestration Layer for critical escalation
    triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION");
  };

  const resetSimulation = () => {
    simulateFlood();
  };

  /**
   * Dispatches payload to /api/automation/trigger (n8n or local simulation fallback)
   */
  const triggerAutomationWorkflow = async (
    action: string = "TRIGGER_FULL_ORCHESTRATION",
    options?: { simulateUnavailable?: boolean; testCase?: "N8N_UNAVAILABLE" | "N8N_URL_MISSING" }
  ) => {
    setIsTriggeringAutomation(true);
    try {
      const payload = {
        incident,
        responsePlan: plan,
        resources: {
          ambulances,
          rescueTeams,
          drones,
        },
        simulationMode: true,
        action,
        simulateUnavailable: options?.simulateUnavailable ?? simulateN8nFailure,
        testCase: options?.testCase,
      };

      const res = await fetch("/api/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.state) {
          setWorkflowState(data.state);
        }
      } else {
        // Fallback simulation mode
        setWorkflowState((prev) => ({
          ...prev,
          orchestrator: "SIMULATION_MODE",
          isSimulationMode: true,
        }));
      }
    } catch (err) {
      console.warn("[RESQNET Automation] Orchestrator unreachable, continuing in simulation mode.", err);
      setWorkflowState((prev) => ({
        ...prev,
        orchestrator: "SIMULATION_MODE",
        isSimulationMode: true,
      }));
    } finally {
      setIsTriggeringAutomation(false);
    }
  };

  /**
   * Unified Resilience & Failure Testing Engine
   * Validates all 9 failure cases and triggers exact required status messages
   */
  const triggerResilienceTest = async (testId: string) => {
    setActiveResilienceTest(testId);

    switch (testId) {
      case "GEMINI_KEY_MISSING": {
        await triggerAiAnalysis(incident, true, "MISSING_KEY");
        setNotification({
          type: "warning",
          title: "TEST 1: GEMINI API KEY MISSING",
          message: "AI service unavailable — fallback decision engine active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "GEMINI_QUOTA_EXCEEDED": {
        await triggerAiAnalysis(incident, true, "QUOTA_EXCEEDED");
        setNotification({
          type: "warning",
          title: "TEST 2: GEMINI API QUOTA EXCEEDED (429)",
          message: "AI service unavailable — fallback decision engine active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "GEMINI_INVALID_JSON": {
        await triggerAiAnalysis(incident, true, "INVALID_JSON");
        setNotification({
          type: "warning",
          title: "TEST 3: GEMINI INVALID JSON RESPONSE",
          message: "AI service unavailable — fallback decision engine active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "GEMINI_TIMEOUT": {
        await triggerAiAnalysis(incident, true, "TIMEOUT");
        setNotification({
          type: "warning",
          title: "TEST 4: GEMINI REQUEST TIMED OUT",
          message: "AI service unavailable — fallback decision engine active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "N8N_UNAVAILABLE": {
        setSimulateN8nFailure(true);
        await triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION", {
          simulateUnavailable: true,
          testCase: "N8N_UNAVAILABLE",
        });
        setNotification({
          type: "warning",
          title: "TEST 5: n8n WEBHOOK UNAVAILABLE",
          message: "n8n unavailable — automation simulation active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "N8N_URL_MISSING": {
        setSimulateN8nFailure(true);
        await triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION", {
          simulateUnavailable: true,
          testCase: "N8N_URL_MISSING",
        });
        setNotification({
          type: "warning",
          title: "TEST 6: N8N_WEBHOOK_URL MISSING",
          message: "n8n unavailable — automation simulation active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "MAP_TILES_UNAVAILABLE": {
        setSimulateTileError(true);
        setNotification({
          type: "warning",
          title: "TEST 7: MAP TILES UNAVAILABLE",
          message: "External service unavailable — local emergency simulation continues.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "INVALID_RESPONSE_DATA": {
        await triggerAiAnalysis(incident, true, "INVALID_RESPONSE");
        setNotification({
          type: "warning",
          title: "TEST 8: INVALID RESPONSE DATA",
          message: "AI service unavailable — fallback decision engine active.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "RESOURCE_OVERALLOCATION": {
        // Attempt allocating 12 Ambulances, 8 Rescue Teams, 6 Drones (all exceed availability)
        updateResourceAllocation({
          ambulances: 12,
          rescueTeams: 8,
          drones: 6,
        });
        setNotification({
          type: "warning",
          title: "TEST 9: RESOURCE OVER-ALLOCATION PREVENTED",
          message: "Resource allocation exceeds availability. Clamped to fleet limits and warning surfaced.",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      default:
        break;
    }
  };

  const resetAllResilienceTests = () => {
    setActiveResilienceTest(null);
    setSimulateApiFailure(false);
    setSimulateN8nFailure(false);
    setSimulateTileError(false);
    resetResourceAllocation();
    triggerAiAnalysis(incident, false);
    triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION");
    setNotification({
      type: "info",
      title: "RESILIENCE TESTS RESET",
      message: "All simulated failure test cases cleared. Standard operational state restored.",
      timestamp: new Date().toISOString(),
    });
  };

  const approveAction = () => {
    const now = new Date().toISOString();
    setIsActionApproved(true);
    setIsActionRejected(false);
    setRejectionReason(null);

    // 1. Update response plan status
    setPlan((prev) => ({
      ...prev,
      humanApproved: true,
      approvedBy: "Cmdr Jaswant Karun (COMMANDER)",
      approvedAt: now,
      status: "APPROVED_ACTIVE",
    }));

    // 2. Add detailed chronological timeline events matching prompt requirements
    const isEscalatedPlan = plan.evacuationRoute === "R4" || simulationStage === "ESCALATED";
    const routeText = isEscalatedPlan ? "Route R4 → Shelter C" : "Route R2 → Shelter B";
    const popText = (incident.metrics?.affectedPopulationEstimated || (isEscalatedPlan ? 2180 : 1240)).toLocaleString();
    const assigned = resourceAllocationState.assigned;
    const ambCount = assigned.ambulances || (isEscalatedPlan ? 4 : 2);
    const resCount = assigned.rescueTeams || (isEscalatedPlan ? 3 : 2);
    const uavCount = assigned.drones || (isEscalatedPlan ? 2 : 1);
    const apprBaseTime = Date.now();

    const approveEvents: TimelineEvent[] = [
      {
        id: `evt-appr-1-${apprBaseTime}`,
        incidentId: incident.id,
        timestamp: new Date(apprBaseTime).toISOString(),
        title: "Response approved by Cmdr Jaswant Karun",
        description: `Cmdr Jaswant Karun granted clearance for: Evacuate Zone A via ${routeText}. Clearance confirmed.`,
        category: "APPROVAL",
        severity: "INFO",
        authorOrSystem: "Cmdr Jaswant Karun (COMMANDER)",
      },
      {
        id: `evt-appr-2-${apprBaseTime}`,
        incidentId: incident.id,
        timestamp: new Date(apprBaseTime + 1000).toISOString(),
        title: "n8n critical response workflow triggered",
        description: "Automated execution armed. Webhook payload dispatched to n8n orchestrator on port 5680.",
        category: "AUTOMATION",
        severity: "INFO",
        authorOrSystem: "n8n Master Orchestrator",
      },
      {
        id: `evt-appr-3-${apprBaseTime}`,
        incidentId: incident.id,
        timestamp: new Date(apprBaseTime + 2000).toISOString(),
        title: "Drone 01 mission created",
        description: "UAV Echo-1 transitioned to AIRBORNE_PATROL over designated evacuation corridor.",
        category: "RESOURCE",
        severity: "INFO",
        authorOrSystem: "Drone Flight Controller",
      },
      {
        id: `evt-appr-4-${apprBaseTime}`,
        incidentId: incident.id,
        timestamp: new Date(apprBaseTime + 3000).toISOString(),
        title: `${ambCount} ambulances assigned`,
        description: `${ambCount} ambulances deployed to active evacuation corridor. En-route status confirmed.`,
        category: "RESOURCE",
        severity: "INFO",
        authorOrSystem: "CAD 108 Dispatcher",
      },
    ];
    setTimeline((prev) => [...approveEvents, ...prev]);

    // 3. Trigger n8n Critical Response approval workflow
    triggerAutomationWorkflow("APPROVE_CRITICAL_RESPONSE");

    // 4. Update resource statuses based on dynamically allocated count
    setAmbulances((prev) =>
      prev.map((amb, idx) => {
        if (idx < ambCount) {
          return {
            ...amb,
            status: "EN_ROUTE",
            tacticalStatus: "DEPLOYING",
          };
        }
        return amb;
      })
    );

    setRescueTeams((prev) =>
      prev.map((team, idx) => {
        if (idx < resCount) {
          return {
            ...team,
            status: "ON_MISSION",
            tacticalStatus: "DEPLOYING",
          };
        }
        return team;
      })
    );

    setDrones((prev) =>
      prev.map((drone, idx) => {
        if (idx < uavCount) {
          return {
            ...drone,
            flightStatus: "AIRBORNE_PATROL",
            altitudeMeters: 45 + idx * 10,
            groundSpeedKmH: 38.5,
            telemetryLinkStrength: 98,
          };
        }
        return drone;
      })
    );

    // 5. Show success notification
    setNotification({
      type: "success",
      title: isEscalatedPlan
        ? "ESCALATED ACTION AUTHORIZED & DISPATCHED"
        : "CRITICAL ACTION AUTHORIZED & DISPATCHED",
      message: `Evacuation corridor ${routeText} cleared. ${ambCount} Ambulances, ${resCount} Rescue Teams, and ${uavCount} Drones active. Automated n8n execution triggered.`,
      timestamp: now,
    });
  };

  const rejectAction = (reason: string = "Critical response rejected by operator.") => {
    const now = new Date().toISOString();
    setIsActionApproved(false);
    setIsActionRejected(true);
    setRejectionReason(reason);

    // 1. Update response plan status to REJECTED
    setPlan((prev) => ({
      ...prev,
      humanApproved: false,
      rejectedBy: "Operator / Commander Raghav Menon",
      rejectedAt: now,
      rejectionReason: reason,
      status: "REJECTED",
    }));

    // 2. Add required timeline event: "Critical response rejected by operator."
    const rejectionEvent: TimelineEvent = {
      id: `evt-rej-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      title: "Critical Response Rejected by Operator",
      description: "Critical response rejected by operator. Simulated dispatch and evacuation aborted. Safeguard active.",
      category: "APPROVAL",
      severity: "WARNING",
      authorOrSystem: "Incident Commander / Operator",
    };
    setTimeline((prev) => [rejectionEvent, ...prev]);

    // 3. Do not execute the simulated workflow (n8n is NOT triggered)

    // 4. Show warning notification
    setNotification({
      type: "warning",
      title: "CRITICAL RESPONSE REJECTED",
      message: "Critical response rejected by operator. Simulated dispatch halted.",
      timestamp: now,
    });
  };

  const approveCriticalResponseWorkflow = async () => {
    approveAction();
  };

  const dispatchDroneWorkflow = async (droneId?: string) => {
    await triggerAutomationWorkflow("DEPLOY_DRONE");
    setDrones((prev) =>
      prev.map((d, index) => {
        if (droneId ? d.id === droneId : index === 0) {
          return {
            ...d,
            flightStatus: "AIRBORNE_PATROL",
            altitudeMeters: 45,
            groundSpeedKmH: 38,
            telemetryLinkStrength: 98,
          };
        }
        return d;
      })
    );
    addTimelineEvent({
      title: "Drone 01 mission created",
      description: "UAV Echo-1 launched into AIRBORNE_PATROL over designated flood corridor.",
      category: "RESOURCE",
      severity: "INFO",
      authorOrSystem: "Drone Flight Controller",
    });
  };

  const approveEmergencyAlertWorkflow = async () => {
    await triggerAutomationWorkflow("APPROVE_EMERGENCY_ALERT");
    addTimelineEvent({
      title: "Emergency alert approved by Cmdr Jaswant Karun",
      description: "Cell broadcast emergency alert triggered across Zone A corridor following Cmdr Jaswant Karun authorization.",
      category: "AUTOMATION",
      severity: "WARNING",
      authorOrSystem: "Cmdr Jaswant Karun (COMMANDER)",
    });
  };

  // Sync with automation layer on mount
  useEffect(() => {
    triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION");
  }, []);

  const markAlertsRead = () => {
    setUnreadAlertCount(0);
  };

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        simulationStage,
        simulationStatus,
        simulateFlood,
        simulateEscalation,
        resetSimulation,
        incident,
        zones,
        hospitals,
        shelters,
        roads,
        ambulances,
        rescueTeams,
        drones,
        plan,
        alerts,
        timeline,
        addTimelineEvent,
        approveAction,
        isActionApproved,
        rejectAction,
        isActionRejected,
        rejectionReason,
        notification,
        dismissNotification,
        selectedZone,
        setSelectedZone,
        unreadAlertCount,
        markAlertsRead,
        resourceAllocationState,
        updateResourceAllocation,
        resetResourceAllocation,
        isAiLoading,
        aiStatusMessage,
        simulateApiFailure,
        setSimulateApiFailure,
        triggerAiAnalysisWithTestCase,
        workflowState,
        isTriggeringAutomation,
        simulateN8nFailure,
        setSimulateN8nFailure,
        triggerAutomationWorkflow,
        approveCriticalResponseWorkflow,
        dispatchDroneWorkflow,
        approveEmergencyAlertWorkflow,
        simulateTileError,
        setSimulateTileError,
        activeResilienceTest,
        triggerResilienceTest,
        resetAllResilienceTests,
        databaseState,
        refreshDatabaseData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
