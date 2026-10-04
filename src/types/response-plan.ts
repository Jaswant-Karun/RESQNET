import { RiskLevel } from "./location";

export type PlanStatus =
  | "DRAFT_ANALYSIS"
  | "AWAITING_APPROVAL"
  | "APPROVED_ACTIVE"
  | "EXECUTING"
  | "SUPERSEDED"
  | "COMPLETED"
  | "REJECTED";

export interface TacticalAction {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  targetZoneId: string;
  assignedResourceIds: string[];
  assignedDroneIds: string[];
  priority: "IMMEDIATE" | "HIGH" | "SECONDARY";
  estimatedMinutesToDeploy: number;
  requiresHumanClearance: boolean;
  status: "PENDING" | "APPROVED" | "DISPATCHED" | "COMPLETED";
}

export interface EvacuationRoutePlan {
  id: string;
  routeName: string;
  fromZoneId: string;
  destinationShelterId: string;
  safetyScore: number; // 0-100
  estimatedTransitMin: number;
  roadSegmentIds: string[];
  activeEscortUnitId?: string;
  status: "OPEN" | "RESTRICTED_CONVOY" | "BLOCKED";
}

export interface ResourceAllocation {
  ambulances: number;
  rescueTeams: number;
  drones: number;
}

export interface ResponsePlan {
  id: string;
  incidentId: string;
  planVersion: number;
  title: string;
  generatedAt: string;
  riskAssessmentSummary: string;
  recommendedSeverityLevel: RiskLevel;
  humanApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  status: PlanStatus;
  primaryObjectives: string[];
  actions: TacticalAction[];
  evacuationRoutes: EvacuationRoutePlan[];
  confidenceScorePercentage: number;
  projectedCasualtyReductionPercentage: number;

  // RESQNET Response Engine fields
  riskLevel: RiskLevel;
  priorityZones: string[];
  immediateActions: string[];
  resourceAllocation: ResourceAllocation;
  evacuationRoute: string;
  targetShelter?: string;
  publicAlert: string;
  explanation: string;
  approvalRequired: boolean;
  decisionEngine: "FALLBACK" | "GEMINI_AI";
}
