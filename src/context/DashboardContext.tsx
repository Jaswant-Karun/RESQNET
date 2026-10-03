"use client";

import React, { createContext, useContext, useState } from "react";
import {
  MOCK_ALERTS,
  MOCK_AMBULANCES,
  MOCK_DRONES,
  MOCK_FLOOD_INCIDENT,
  MOCK_HOSPITALS,
  MOCK_RESCUE_TEAMS,
  MOCK_RESPONSE_PLAN,
  MOCK_ROADS,
  MOCK_SHELTERS,
  MOCK_TIMELINE_EVENTS,
  MOCK_ZONES,
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [simulationStage, setSimulationStage] =
    useState<SimulationStage>("FLOOD_ACTIVE");
  const [incident, setIncident] = useState<Incident>(MOCK_FLOOD_INCIDENT);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [timeline, setTimeline] =
    useState<TimelineEvent[]>(MOCK_TIMELINE_EVENTS);
  const [plan, setPlan] = useState<ResponsePlan>(MOCK_RESPONSE_PLAN);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isActionApproved, setIsActionApproved] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(MOCK_ZONES[0]);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);

  const simulateFlood = () => {
    setSimulationStage("FLOOD_ACTIVE");
    setIsActionApproved(false);

    const baseIncident: Incident = {
      ...MOCK_FLOOD_INCIDENT,
      status: "ACTIVE",
      severity: "CRITICAL",
      metrics: {
        ...MOCK_FLOOD_INCIDENT.metrics,
        waterLevelMeters: 4.85,
        waterLevelTrend: "RISING_RAPID",
        rainfallRateMmPerHour: 68.4,
        affectedPopulationEstimated: 34200,
        confirmedEvacuated: 12450,
        reportedStranded: 1820,
      },
    };
    setIncident(baseIncident);

    // Reset zones to base flood state
    setZones(MOCK_ZONES);

    // Append new simulation timeline event
    const newEvent: TimelineEvent = {
      id: `evt-sim-${Date.now()}`,
      incidentId: baseIncident.id,
      timestamp: new Date().toISOString(),
      title: "Flood Incident Simulation Initialized",
      description:
        "Severe 68mm/h cloudburst trigger initiated. Kotturpuram Sluice Gate 7 breached. Zone Alpha categorized as CRITICAL.",
      category: "DETECTION",
      severity: "CRITICAL",
      authorOrSystem: "Simulation Orchestrator",
    };

    setTimeline((prev) => [newEvent, ...prev]);

    // Update response plan
    setPlan({
      ...MOCK_RESPONSE_PLAN,
      humanApproved: false,
      status: "AWAITING_APPROVAL",
    });
  };

  const simulateEscalation = () => {
    setSimulationStage("ESCALATED");
    setIsActionApproved(false);

    const escalatedIncident: Incident = {
      ...MOCK_FLOOD_INCIDENT,
      code: "FL-902-CATACLYSMIC",
      title: "Adyar Basin Sluice Gate 7 Failure & Secondary Embankment Breach",
      severity: "CRITICAL",
      status: "ESCALATING",
      operationalSummary:
        "CRITICAL ESCALATION: Upstream dam emergency spillway discharge increased to 58,000 cusecs. Secondary embankment at Saidapet Bridge overtopped. Sector 7B has turned into rapid-current inundated zone. Airborne payload life drops and immediate rooftop extractions authorized.",
      metrics: {
        ...MOCK_FLOOD_INCIDENT.metrics,
        waterLevelMeters: 6.2,
        waterLevelTrend: "RISING_RAPID",
        rainfallRateMmPerHour: 92.5,
        affectedPopulationEstimated: 52000,
        confirmedEvacuated: 15200,
        reportedStranded: 3640,
        criticalInfrastructureAtRisk: 14,
      },
    };
    setIncident(escalatedIncident);

    // Escalate zones: Zone Bravo also becomes CRITICAL
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === "zone-orange-bravo") {
          return {
            ...z,
            riskLevel: "CRITICAL",
            status: "SUBMERGED",
            waterDepthMeters: 2.9,
          };
        }
        if (z.id === "zone-red-alpha") {
          return {
            ...z,
            waterDepthMeters: 4.6,
          };
        }
        return z;
      })
    );

    // Add escalation timeline event
    const escalationEvent: TimelineEvent = {
      id: `evt-esc-${Date.now()}`,
      incidentId: escalatedIncident.id,
      timestamp: new Date().toISOString(),
      title: "EMERGENCY ESCALATION: Secondary Embankment Collapsed",
      description:
        "Surge water level reached 6.2m (+1.35m in 20 min). Sector 7B reclassified from HIGH to CRITICAL. Stranded count increased to 3,640 civilians.",
      category: "ESCALATION",
      severity: "CRITICAL",
      authorOrSystem: "Automated Doppler & Hydro-Gauge Sentinel",
    };

    setTimeline((prev) => [escalationEvent, ...prev]);

    // Push critical alert
    const newAlert: Alert = {
      id: `alt-esc-${Date.now()}`,
      incidentId: escalatedIncident.id,
      code: "ALT-ESCALATION-GATE-FAIL",
      title: "Catastrophic 6.2m Water Level Inundation",
      message:
        "Emergency broadcast: Sector 7B Saidapet Junction is now impassable. Direct all units to Elevated Bypass Route 104.",
      severity: "CRITICAL",
      timestamp: new Date().toISOString(),
      source: "DAM_AUTHORITY",
      zoneId: "zone-orange-bravo",
      acknowledged: false,
      actionableStep: "Order emergency rooftop helicopter and UAV payload airlift",
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setUnreadAlertCount((c) => c + 1);

    // Update plan with escalation actions
    setPlan((prev) => ({
      ...prev,
      planVersion: prev.planVersion + 1,
      title: "Phase 2 Emergency Airlift & Heavy Boat Extraction",
      riskAssessmentSummary:
        "Secondary embankment collapse has doubled flow velocity. Immediate priority is preventing hypothermia and structural drowning in Zones Alpha & Bravo.",
      humanApproved: false,
      status: "AWAITING_APPROVAL",
      confidenceScorePercentage: 91.8,
    }));
  };

  const resetSimulation = () => {
    setSimulationStage("NORMAL");
    setIsActionApproved(false);
    setIncident(MOCK_FLOOD_INCIDENT);
    setZones(MOCK_ZONES);
    setTimeline(MOCK_TIMELINE_EVENTS);
    setPlan(MOCK_RESPONSE_PLAN);
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
      title: "Tactical Response Plan Formally Authorized",
      description:
        "Command Officer authorized Phase 1 Extraction and UAV Drop. Automatic n8n resource dispatch orchestration sequence armed.",
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
        simulateFlood,
        simulateEscalation,
        resetSimulation,
        incident,
        zones,
        hospitals: MOCK_HOSPITALS,
        shelters: MOCK_SHELTERS,
        roads: MOCK_ROADS,
        ambulances: MOCK_AMBULANCES,
        rescueTeams: MOCK_RESCUE_TEAMS,
        drones: MOCK_DRONES,
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
