import { Incident } from "./incident";
import { ResponsePlan } from "./response-plan";
import { Drone } from "./drone";
import { Resource } from "./resource";

/**
 * Payload sent to n8n workflow orchestration layer via /api/automation/trigger
 */
export interface AutomationPayload {
  incident: Incident;
  responsePlan: ResponsePlan;
  resources: {
    ambulances: Resource[];
    rescueTeams: Resource[];
    drones: Drone[];
  };
  simulationMode: boolean;
  action?:
    | "TRIGGER_FULL_ORCHESTRATION"
    | "APPROVE_CRITICAL_RESPONSE"
    | "APPROVE_EMERGENCY_ALERT"
    | "DEPLOY_DRONE"
    | "VALIDATE_INTAKE"
    | "TRIGGER_RISK_ALERT";
  metadata?: {
    triggeredBy?: string;
    timestamp?: string;
    clientDefconLevel?: string;
  };
}

export type OrchestratorStatus = "RUNNING" | "COMPLETED" | "SIMULATION_MODE" | "IDLE" | "ERROR";
export type IncidentIntakeStatus = "COMPLETED" | "VALIDATING" | "FAILED" | "PENDING";
export type CriticalResponseStatus =
  | "WAITING FOR APPROVAL"
  | "CHECKING_SEVERITY"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "REJECTED";
export type DroneWorkflowStatus = "READY" | "SELECTING_DRONE" | "MISSION_CREATED" | "IN_FLIGHT" | "COMPLETED";
export type EmergencyAlertStatus =
  | "PENDING APPROVAL"
  | "GENERATED"
  | "PUBLISHED"
  | "SIMULATED"
  | "REJECTED";
export type RiskAlertWorkflowStatus =
  | "READY"
  | "DISPATCHED"
  | "AWAITING_REVIEW"
  | "SKIPPED"
  | "COMPLETED";

export interface RiskAlertPayload {
  riskForecast: {
    forecastId?: string;
    hazardType?: string;
    forecastWindow?: string;
    contributingFactors?: string[];
    [key: string]: unknown;
  };
  area: {
    id?: string;
    name?: string;
    shortName?: string;
    coordinates?: { latitude: number; longitude: number } | [number, number];
    affectedPopulation?: number;
    [key: string]: unknown;
  };
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | string;
  riskScore: number;
  commander: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  simulationMode?: boolean;
}

export interface WorkflowIntegrationStatus {
  riskMonitor: "CONNECTED" | "SYNCING" | "OFFLINE";
  n8n: "CONNECTED" | "SIMULATION" | "CONNECTING" | "OFFLINE";
  email: "READY" | "DISPATCHING" | "SENT" | "DISABLED";
  lastAlert: string;
}

export interface WorkflowLogItem {
  id: string;
  timestamp: string;
  workflow:
    | "Incident Intake"
    | "Critical Response"
    | "Drone Deployment"
    | "Emergency Alert"
    | "RESQNET Risk Alert"
    | "Orchestrator";
  status: "SUCCESS" | "PENDING" | "MOCK" | "INFO" | "WARNING";
  message: string;
  stepName?: string;
  simulatedTarget?: string;
}

export interface WorkflowOrchestrationState {
  orchestrator: OrchestratorStatus;
  incidentIntake: IncidentIntakeStatus;
  criticalResponse: CriticalResponseStatus;
  droneWorkflow: DroneWorkflowStatus;
  emergencyAlert: EmergencyAlertStatus;
  riskAlertWorkflow?: RiskAlertWorkflowStatus;
  integrationStatus?: WorkflowIntegrationStatus;
  isSimulationMode: boolean;
  n8nWebhookConfigured: boolean;
  lastTriggeredAt?: string;
  activeExecutionId?: string;
  logs: WorkflowLogItem[];
}
