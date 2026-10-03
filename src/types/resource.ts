import { LocationCoordinates } from "./location";

export type ResourceCategory =
  | "AMBULANCE"
  | "RESCUE_BOAT"
  | "SWIFTWATER_TEAM"
  | "HIGH_CLEARANCE_TRUCK"
  | "PARAMEDIC_SQUAD"
  | "MOBILE_PUMP_UNIT";

export type ResourceStatus =
  | "AVAILABLE"
  | "EN_ROUTE"
  | "ON_MISSION"
  | "REFUELING"
  | "OUT_OF_SERVICE";

export interface Resource {
  id: string;
  callsign: string;
  name: string;
  type: ResourceCategory;
  status: ResourceStatus;
  tacticalStatus?: TacticalResourceStatus;
  capacityPersons: number;
  fuelOrBatteryLevel: number;
  currentLocation: LocationCoordinates;
  assignedZoneId?: string;
  etaMinutes?: number;
  personnelCount: number;
  commander: string;
  equipmentInventory: string[];
}

export type TacticalResourceStatus =
  | "READY"
  | "DEPLOYING"
  | "MISSION CREATED"
  | "STANDBY"
  | "DEPLETED";

export interface ResourceAllocationItem {
  resourceType: "ambulances" | "rescueTeams" | "drones";
  label: string;
  available: number;
  assigned: number;
  remaining: number;
  status: TacticalResourceStatus;
  requested: number;
  isCapped: boolean;
  warning?: string;
}

export interface ResourceAllocationSummary {
  totalAvailable: number;
  totalAssigned: number;
  totalRemaining: number;
  utilizationPercentage: number;
}

export interface ResourceAllocationState {
  available: {
    ambulances: number;
    rescueTeams: number;
    drones: number;
  };
  requested: {
    ambulances: number;
    rescueTeams: number;
    drones: number;
  };
  assigned: {
    ambulances: number;
    rescueTeams: number;
    drones: number;
  };
  remaining: {
    ambulances: number;
    rescueTeams: number;
    drones: number;
  };
  items: ResourceAllocationItem[];
  summary: ResourceAllocationSummary;
  hasWarning: boolean;
  warnings: string[];
  lastAllocatedAt: string;
}

