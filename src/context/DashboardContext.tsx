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

export type DashboardTab =
  | "overview"
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

  // n8n Workflow Orchestration Layer
  workflowState: WorkflowOrchestrationState;
  isTriggeringAutomation: boolean;
  triggerAutomationWorkflow: (action?: string) => Promise<void>;
  approveCriticalResponseWorkflow: () => Promise<void>;
  dispatchDroneWorkflow: (droneId?: string) => Promise<void>;
  approveEmergencyAlertWorkflow: () => Promise<void>;
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

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    initialScenario.timelineEvent,
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
    "AI service unavailable — emergency fallback activated."
  );
  const [simulateApiFailure, setSimulateApiFailure] = useState<boolean>(false);

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
  const triggerAiAnalysis = async (targetIncident: Incident, forceSimulateFailure?: boolean) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident: targetIncident,
          simulateError: forceSimulateFailure ?? simulateApiFailure,
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
            : "AI service unavailable — emergency fallback activated.")
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
      setAiStatusMessage("AI service unavailable — emergency fallback activated.");

      if (fallbackPlan.resourceAllocation) {
        applyAllocation(fallbackPlan.resourceAllocation, targetIncident);
      }
    } finally {
      setIsAiLoading(false);
    }
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

    // Timeline events
    const allocEvent = createAllocationTimelineEvent(
      initAlloc,
      scenario.incident.id,
      "Flood Response Initialized: 2 Ambulances (READY), 2 Rescue Teams (DEPLOYING), 1 Drone (MISSION CREATED)."
    );
    setTimeline([scenario.timelineEvent, allocEvent, ...MOCK_TIMELINE_EVENTS]);

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

    // REQUIRED EXACT TIMELINE ENTRIES
    const requiredTimelineEvents: TimelineEvent[] = [
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
        category: "ENVIRONMENTAL",
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
        category: "HAZARD",
        severity: "CRITICAL",
        authorOrSystem: "Traffic Transit Monitoring",
      },
      {
        id: `evt-esc-4-${baseTime}`,
        incidentId: escalatedIncident.id,
        timestamp: new Date(baseTime + 4000).toISOString(),
        title: "Previous evacuation route invalidated.",
        description:
          "Primary evacuation corridor via Route R2 to Shelter B revoked due to active flooding.",
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
        category: "AI_DECISION",
        severity: "INFO",
        authorOrSystem: "RESQNET Adaptive Response Engine",
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
  const triggerAutomationWorkflow = async (action: string = "TRIGGER_FULL_ORCHESTRATION") => {
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
      }
    } catch (err) {
      console.warn("[RESQNET Automation] Orchestrator unreachable, continuing in simulation mode.", err);
    } finally {
      setIsTriggeringAutomation(false);
    }
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
      approvedBy: "Commander Raghav Menon (EOC Chief)",
      approvedAt: now,
      status: "APPROVED_ACTIVE",
    }));

    // 2. Add detailed timeline event
    const isEscalatedPlan = plan.evacuationRoute === "R4" || simulationStage === "ESCALATED";
    const routeText = isEscalatedPlan ? "Route R4 → Shelter C" : "Route R2 → Shelter B";
    const popText = (incident.metrics?.affectedPopulationEstimated || (isEscalatedPlan ? 2180 : 1240)).toLocaleString();
    const assigned = resourceAllocationState.assigned;
    const ambCount = assigned.ambulances || (isEscalatedPlan ? 4 : 2);
    const resCount = assigned.rescueTeams || (isEscalatedPlan ? 3 : 2);
    const uavCount = assigned.drones || (isEscalatedPlan ? 2 : 1);

    const approvalEvent: TimelineEvent = {
      id: `evt-appr-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      title: isEscalatedPlan
        ? "Escalated Response Plan Authorized by Incident Commander"
        : "Critical Response Plan Authorized by Incident Commander",
      description: `Commander R. Menon granted clearance for: Evacuate Zone A & B (${popText} pop) via ${routeText}. Mobilizing ${ambCount} Ambulances, ${resCount} Rescue Teams, ${uavCount} UAV${uavCount > 1 ? "s" : ""}. Automated n8n dispatch workflow armed.`,
      category: "DECISION",
      severity: "CRITICAL",
      authorOrSystem: "Incident Commander R. Menon",
    };
    setTimeline((prev) => [approvalEvent, ...prev]);

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
      category: "DECISION",
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
  };

  const approveEmergencyAlertWorkflow = async () => {
    await triggerAutomationWorkflow("APPROVE_EMERGENCY_ALERT");
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
        workflowState,
        isTriggeringAutomation,
        triggerAutomationWorkflow,
        approveCriticalResponseWorkflow,
        dispatchDroneWorkflow,
        approveEmergencyAlertWorkflow,
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
