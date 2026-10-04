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
    setSimulationStage("ESCALATED");
    setSimulationStatus("CRITICAL ESCALATION ACTIVE");
    setIsActionApproved(false);

    const escalatedIncident: Incident = {
      ...incident,
      code: "FL-902-CATACLYSMIC",
      title: "Adyar Basin Sluice Gate 7 Breach & Zone B Inundation",
      severity: "CRITICAL",
      status: "ESCALATING",
      operationalSummary:
        "CRITICAL ESCALATION: Upstream dam emergency discharge has spiked. Water level in Zone A surged to 3.8 meters; Zone B is now critically inundated at 2.6 meters. Roads R1, R2, and R3 are blocked. Evacuate all remaining 3,400 residents via Route R4 Highland corridor.",
      metrics: {
        ...incident.metrics,
        waterLevelMeters: 3.8,
        waterLevelTrend: "RISING_RAPID",
        rainfallRateMmPerHour: 98.0,
        affectedPopulationEstimated: 3450,
        confirmedEvacuated: 1100,
        reportedStranded: 420,
        criticalInfrastructureAtRisk: 9,
      },
      blockedRoads: ["R1", "R2", "R3"],
    };
    setIncident(escalatedIncident);

    // Escalate zones: Zone B also becomes CRITICAL
    setZones((prev) =>
      prev.map((z) => {
        if (z.code === "Zone A") {
          return { ...z, waterDepthMeters: 3.8, status: "SUBMERGED" };
        }
        if (z.code === "Zone B") {
          return {
            ...z,
            riskLevel: "CRITICAL",
            waterDepthMeters: 2.6,
            status: "SUBMERGED",
          };
        }
        return z;
      })
    );

    // Escalate roads: R1, R2, R3 blocked
    setRoads((prev) =>
      prev.map((r) => {
        if (r.code === "R1" || r.code === "R2" || r.code === "R3") {
          return { ...r, status: "SUBMERGED", isBlocked: true, waterDepthCm: 280 };
        }
        return r;
      })
    );

    // Re-allocate resources during escalation:
    // Escalation recommendation: 6 Ambulances, 3 Rescue Teams, 2 Drones
    const escalatedRecommended = calculateRecommendedAllocation(escalatedIncident, {
      isEscalated: true,
    });
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

    // Timeline event
    const escalationEvent: TimelineEvent = {
      id: `evt-esc-${Date.now()}`,
      incidentId: escalatedIncident.id,
      timestamp: new Date().toISOString(),
      title: "Critical Escalation: Sluice Gate 7 Collapse",
      description:
        "Surge water level reached 3.8m in Zone A and breached Zone B. Roads R1, R2, and R3 blocked. Stranded count increased to 420.",
      category: "ESCALATION",
      severity: "CRITICAL",
      authorOrSystem: "Hydro-Gauge Sensor Sentinel",
    };

    const allocEvent = createAllocationTimelineEvent(
      escalatedAlloc,
      escalatedIncident.id,
      "Escalation Dispatch: Mobilized 6 Ambulances (READY), 3 Rescue Teams (DEPLOYING), 2 Drones (MISSION CREATED)."
    );
    setTimeline((prev) => [escalationEvent, allocEvent, ...prev]);

    // Run Escalated Incident through Response Plan
    const instantEscalatedPlan = generateResponsePlan(escalatedIncident);
    setPlan({
      ...instantEscalatedPlan,
      resourceAllocation: escalatedAlloc.assigned,
    });

    // Query Gemini Situation Analysis for Escalated scenario
    triggerAiAnalysis(escalatedIncident);

    // Critical Alert
    const newAlert: Alert = {
      id: `alt-esc-${Date.now()}`,
      incidentId: escalatedIncident.id,
      code: "ALT-SURGE-GATE-7",
      title: "Catastrophic 3.8m Flood Surge in Zone A",
      message:
        "Emergency Directive: Roads R1, R2, and R3 are impassable. Route all medical units to Elevated Arterial R4.",
      severity: "CRITICAL",
      timestamp: new Date().toISOString(),
      source: "DAM_AUTHORITY",
      zoneId: "zone-a",
      acknowledged: false,
      actionableStep: "Order emergency air-drops and deploy boat squads to Zone B",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setUnreadAlertCount((c) => c + 1);

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
    setIsActionApproved(true);
    setPlan((prev) => ({
      ...prev,
      humanApproved: true,
      approvedBy: "Commander Raghav Menon (EOC Chief)",
      approvedAt: new Date().toISOString(),
      status: "APPROVED_ACTIVE",
    }));

    // Trigger n8n Critical Response approval workflow
    triggerAutomationWorkflow("APPROVE_CRITICAL_RESPONSE");

    const approvalEvent: TimelineEvent = {
      id: `evt-appr-${Date.now()}`,
      incidentId: incident.id,
      timestamp: new Date().toISOString(),
      title: "Rescue Plan Authorized by Incident Commander",
      description:
        "Commander R. Menon authorized Zone A rapid boat extraction and UAV life-jacket drop. Automated dispatch armed.",
      category: "DECISION",
      severity: "INFO",
      authorOrSystem: "Incident Commander R. Menon",
    };
    setTimeline((prev) => [approvalEvent, ...prev]);
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
