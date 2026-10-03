"use client";

import React, { createContext, useContext, useState } from "react";
import {
  generateDeterministicFloodScenario,
  DeterministicFloodScenarioResult,
} from "@/lib/flood-simulation-engine";
import {
  MOCK_ALERTS,
  MOCK_RESPONSE_PLAN,
  MOCK_TIMELINE_EVENTS,
} from "@/data";
import {
  Alert,
  Drone,
  Hospital,
  Incident,
  Resource,
  ResponsePlan,
  RoadSegment,
  Shelter,
  TimelineEvent,
  Zone,
} from "@/types";

export type DashboardTab =
  | "overview"
  | "incidents"
  | "resources"
  | "drones"
  | "plans"
  | "activity"
  | "ai";

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
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Generate initial deterministic flood scenario
  const initialScenario = generateDeterministicFloodScenario();

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
  const [ambulances, setAmbulances] = useState<Resource[]>(initialScenario.ambulances);
  const [rescueTeams, setRescueTeams] = useState<Resource[]>(initialScenario.rescueTeams);
  const [drones, setDrones] = useState<Drone[]>(initialScenario.drones);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    initialScenario.timelineEvent,
    ...MOCK_TIMELINE_EVENTS,
  ]);
  const [plan, setPlan] = useState<ResponsePlan>(MOCK_RESPONSE_PLAN);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isActionApproved, setIsActionApproved] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(initialScenario.zones[0]);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);

  // Deterministic simulateFlood() function
  const simulateFlood = () => {
    const scenario = generateDeterministicFloodScenario();

    setSimulationStage("FLOOD_ACTIVE");
    setSimulationStatus("FLOOD INCIDENT SIMULATED");
    setIsActionApproved(false);

    setIncident(scenario.incident);
    setZones(scenario.zones);
    setHospitals(scenario.hospitals);
    setShelters(scenario.shelters);
    setRoads(scenario.roads);
    setAmbulances(scenario.ambulances);
    setRescueTeams(scenario.rescueTeams);
    setDrones(scenario.drones);
    setSelectedZone(scenario.zones[0]);

    // Prepend fresh deterministic timeline event
    setTimeline((prev) => [scenario.timelineEvent, ...prev]);

    // Update response plan specifically for Zone A (2.4m flood)
    setPlan({
      ...MOCK_RESPONSE_PLAN,
      title: "Phase 1 Rapid Evacuation & Critical Extraction Plan — Zone A",
      riskAssessmentSummary:
        "Water level in Zone A measured at 2.4 meters with 1,240 people affected. Arterial Roads R1 and R3 are blocked. Direct swiftwater rescue teams and UAV payload drops to isolated pockets.",
      humanApproved: false,
      status: "AWAITING_APPROVAL",
    });
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
    setTimeline((prev) => [escalationEvent, ...prev]);

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
  };

  const resetSimulation = () => {
    simulateFlood();
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
